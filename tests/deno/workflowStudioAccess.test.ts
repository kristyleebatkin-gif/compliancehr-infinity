import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import { studioTenant, studioRows } from '../../base44/shared/workflowStudioAccess.ts';
const user={id:'u',role:'Provider Administrator',tenant_id:'a',account_status:'Active',access_approved:true};
Deno.test('studio scope denies revoked, unassigned, foreign and non-module accounts before reads',()=>{
 assertEquals(studioTenant(user,'a'),'a');
 for(const patch of [{id:''},{tenant_id:'b'},{role:'Participant'},{access_approved:false},{account_status:'Suspended'}]) assertThrows(()=>studioTenant({...user,...patch},'a'));
});
Deno.test('studio projections exclude medical notes, private evidence and mutable timeline',()=>{
 const page=[{id:'i',tenant_id:'a',state:'Running',steps_json:'private medical note',context_label:'private case',last_action_note:'private',file_url:'secret'}];
 assertEquals(studioRows(page,'a',10).rows,[{id:'i',tenant_id:'a',state:'Running'}]);
});
Deno.test('studio distinguishes unsupported, malformed, foreign and unavailable pages from empty',()=>{
 for(const page of [null,{}, {items:{}}, [{id:'i',tenant_id:'b'}], [{id:'',tenant_id:'a'}]]) assertThrows(()=>studioRows(page,'a',10));
 assertEquals(studioRows([],'a',10),{rows:[],truncated:false});
 assertEquals(studioRows({items:[],next_cursor:'more'},'a',10).truncated,true);
 assertEquals(studioRows([{id:'1',tenant_id:'a'},{id:'2',tenant_id:'a'}],'a',1).truncated,true);
});
