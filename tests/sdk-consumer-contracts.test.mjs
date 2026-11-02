import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { createEntitiesModule } from '../node_modules/@base44/sdk/dist/modules/entities.js';
import { createAgentsModule } from '../node_modules/@base44/sdk/dist/modules/agents.js';
const parse=async path=>{const source=await readFile(new URL(path,import.meta.url),'utf8');return ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JSX)};
function find(sf,predicate){let match;function visit(node){if(!match&&predicate(node))match=node;if(!match)ts.forEachChild(node,visit);}visit(sf);assert(match,'Source expression must exist');return match;}
test('audit-action loader consumes the SDK User.list array',async()=>{
 const sf=await parse('../src/components/audit/AuditActions.jsx');
 const declaration=find(sf,n=>ts.isVariableDeclaration(n)&&n.name.getText(sf)==='load');
 const callback=declaration.initializer.arguments[0].getText(sf);
 const users=[{id:'fixture-user',full_name:'Fixture'}],actions=[{id:'fixture-action'}];let observedUsers,observedActions;
 const entities=createEntitiesModule({appId:'fixture',getSocket:()=>{throw Error('No socket')},axios:{get:async url=>url.endsWith('/User')?users:{items:actions}}});
 const load=new Function('base44','setLoading','setActions','setUsers',`return (${callback})`)({entities},()=>{},v=>observedActions=v,v=>observedUsers=v);
 await load();assert.deepEqual(observedUsers,users);assert.deepEqual(observedActions,actions);
});
test('assistant conversation request uses the SDK query envelope',async()=>{
 const sf=await parse('../src/components/assistant/AssistantChat.jsx');
 const call=find(sf,n=>ts.isCallExpression(n)&&n.expression.getText(sf)==='base44.agents.listConversations');
 const arg=new Function('agent',`return (${call.arguments[0].getText(sf)})`)({name:'fixture-agent'});
 let request;const agents=createAgentsModule({appId:'fixture',axios:{get:async(url,config)=>{request=config.params;return []}},getSocket:()=>{throw Error('No socket')}});
 await agents.listConversations(arg);assert.deepEqual(request.q,{agent_name:'fixture-agent'});
});
