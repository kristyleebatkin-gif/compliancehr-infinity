import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import { normalisePage, validateCitations, validateReviewTransition, digest } from '../../base44/shared/aiSafety.ts';
Deno.test('AI source reads accept supported SDK shapes and reject failed or malformed pages',()=>{
 assertEquals(normalisePage([{id:'a'}]),[{id:'a'}]);assertEquals(normalisePage({items:[]}),[]);
 for(const x of [null,{}, {items:null}])assertThrows(()=>normalisePage(x));
});
Deno.test('AI material claims require citations to supplied records',()=>{
 const source=[{id:'a'}];
 const output={executive_summary:'Review',key_findings:[{finding:'Gap',source_ids:['a']}],recommendations:[{action:'Review',source_ids:['a']}]};
 assertEquals(validateCitations(output,source).confidence_score,null);
 assertThrows(()=>validateCitations({...output,key_findings:[{source_ids:['foreign-record']}]},source));
 assertThrows(()=>validateCitations({...output,recommendations:[{source_ids:[]}]},source));
 assertThrows(()=>validateCitations({...output,recommendations:[{}]},source));
});
Deno.test('model confidence cannot replace validation and citations are deduplicated',()=>{
 const o=validateCitations({executive_summary:'Draft',confidence_score:100,key_findings:[{source_ids:['a','a'],confidence:100}],recommendations:[]},[{id:'a'}]);
 assertEquals(o.confidence_score,null);assertEquals(o.key_findings[0].confidence,undefined);assertEquals(o.key_findings[0].source_ids,['a']);
});
Deno.test('human reviews enforce valid sequence, reasons and implementation evidence',()=>{
 validateReviewTransition('Awaiting review','Accepted','Reviewed evidence','');
 validateReviewTransition('Accepted','Implemented','Verified in source module','Audit action 123');
 assertThrows(()=>validateReviewTransition('Awaiting review','Implemented','Reviewed','Proof'));
 assertThrows(()=>validateReviewTransition('Rejected','Accepted','Reviewed',''));
 assertThrows(()=>validateReviewTransition('Accepted','Implemented','Reviewed',''));
 assertThrows(()=>validateReviewTransition('Awaiting review','Accepted','',''));
});
Deno.test('source snapshots are reproducible and changed source metadata changes hash',async()=>{
 const a=await digest([{id:'a',title:'Original'}]);assertEquals(a,await digest([{id:'a',title:'Original'}]));
 assertEquals(a.length,64);assertEquals(a===await digest([{id:'a',title:'Changed'}]),false);
});
