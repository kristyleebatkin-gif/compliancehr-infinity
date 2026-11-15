import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, canAccessNav, resolveUserTenantId, MANAGEMENT_ROLES } from '../../shared/roleMatrix.ts';
import { normalisePage, validateReviewTransition } from '../../shared/aiSafety.ts';
const ENTITIES=['AiAgent','AiPrompt','AiRecommendation','AiInteraction','AiModel','AiGovernanceRecord','AiReviewDecision'];
const EDIT_FIELDS={
 AiAgent:['name','domain','purpose','owner','notes'],
 AiPrompt:['name','module','agent_name','purpose','prompt_text','version','test_notes'],
 AiModel:['name','provider','version','region','approved_uses','retention_terms','evaluation_ref','owner'],
 AiGovernanceRecord:['code','title','record_type','description','risk','owner','frequency','measure','source_ref','review_due'],
};
const clean=(data,fields)=>Object.fromEntries(fields.filter(k=>typeof data?.[k]==='string').map(k=>[k,data[k].trim().slice(0,k==='prompt_text'?12000:3000)]));
export default perBusiness(async function(req:Request){
 try {
  const base44=createScopedClientFromRequest(req),user=await base44.auth.me();
  const tenantId=resolveUserTenantId(user);
  if(!hasApprovedAccess(user)||!canAccessNav(user.role,'ai-os')||!tenantId||tenantId!==base44.businessId) return Response.json({error:'Approved AI access to your assigned business is required.'},{status:403});
  const b=await req.json(), dao=base44.asServiceRole.entities;
  const audit=async(decision,reason,extra={})=>dao.AiReviewDecision.create({tenant_id:tenantId,decision,reason,human_user_id:user.id,human_name:user.full_name||user.email,decided_at:new Date().toISOString(),...extra});
  if(b.action==='list'){
   const results=await Promise.all(ENTITIES.map(async name=>{
    const rows=normalisePage(await dao[name].filter({tenant_id:tenantId},'-created_date',301,0));
    if(rows.some(x=>x.tenant_id!==tenantId)) throw new Error('SCOPE_MISMATCH');
    return [name,{items:rows.slice(0,300),limited:rows.length>300}];
   }));
   return Response.json({registers:Object.fromEntries(results),scope:tenantId,read_at:new Date().toISOString()});
  }
  if(b.action==='review'){
   if(!MANAGEMENT_ROLES.includes(user.role)&&!['Compliance Manager','Compliance Administrator','Quality & Improvement Manager'].includes(user.role)) return Response.json({error:'Review authority required.'},{status:403});
   const record=await dao.AiRecommendation.get(b.id);
   if(!record||record.tenant_id!==tenantId) return Response.json({error:'Record not found.'},{status:404});
   if(record.status!==b.expected_status) return Response.json({error:'Recommendation changed. Refresh before reviewing.'},{status:409});
   validateReviewTransition(record.status,b.status,b.reason,b.implementation_evidence);
   const decision=await audit(b.status,b.reason.trim(),{recommendation_id:record.id,previous_status:record.status,implementation_evidence:b.implementation_evidence||''});
   // A saved review accepts an advisory recommendation only. Domain approval stays in its own module.
   await dao.AiRecommendation.update(record.id,{status:b.status,human_verified_by:user.full_name||user.email,human_verified_date:new Date().toISOString().slice(0,10),override_reason:b.reason});
   return Response.json({saved:true,decision_id:decision.id});
  }
  if(b.action==='flag'){
   const record=await dao.AiInteraction.get(b.id);
   if(!record||record.tenant_id!==tenantId) return Response.json({error:'Run not found.'},{status:404});
   if(typeof b.reason!=='string'||b.reason.trim().length<5) return Response.json({error:'Describe the issue.'},{status:400});
   const decision=await audit('Flagged',b.reason.trim(),{interaction_id:record.id});
   return Response.json({saved:true,decision_id:decision.id});
  }
  if(b.action==='save'){
   if(!MANAGEMENT_ROLES.includes(user.role)) return Response.json({error:'Management authority required to maintain AI configuration.'},{status:403});
   if(!EDIT_FIELDS[b.entity]) return Response.json({error:'Resource is not editable.'},{status:400});
   const payload=clean(b.data,EDIT_FIELDS[b.entity]);
   if(!(payload.name||payload.title)) return Response.json({error:'A title or name is required.'},{status:400});
   let prior=null;
   if(b.id){prior=await dao[b.entity].get(b.id);if(!prior||prior.tenant_id!==tenantId)return Response.json({error:'Record not found.'},{status:404});}
   const data={...payload,status:'Draft'};
   if(b.entity==='AiAgent') Object.assign(data,{kind:'Copilot',data_scope:'Enterprise',human_review_required:true,guardrails:'Advisory only. No domain approvals, treatment changes, external sends or unscoped tools.'});
   if(b.entity==='AiPrompt'&&!data.version)data.version='1.0';
   // No activation, model connection, prompt publication, role grant or schedule is implied by saving metadata.
   await audit('Configuration draft',`Saved ${b.entity} draft: ${payload.name||payload.title}`);
   const record=prior?await dao[b.entity].update(prior.id,data):await dao[b.entity].create({...data,tenant_id:tenantId});
   return Response.json({saved:true,id:record.id,status:'Draft'});
  }
  return Response.json({error:'Unsupported operation.'},{status:400});
 } catch(e){return Response.json({error:'Operation could not be completed. Refresh to verify saved records before retrying.'},{status:503});}
});
