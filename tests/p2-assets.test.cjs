const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'),'utf8'));
test('known source assets are actually present with provenance',()=>{
 assert.ok(Array.isArray(data.assets)&&data.assets.length>=4);
 const ids=new Set();
 for(const a of data.assets){
   assert.ok(!ids.has(a.id),'duplicate catalog id '+a.id);ids.add(a.id);
   assert.match(a.file,/^assets\/.+\.gltf$/);
   assert.ok(fs.existsSync(path.join(root,a.file)),'missing imported model: '+a.file);
   assert.equal(a.license,'CC0');
   assert.match(a.sourceUrl,/^https:\/\//);
   assert.ok(a.source);
 }
});
test('candidate downloads are not falsely marked as integrated',()=>{
 for(const a of data.candidateSources){
   assert.equal(a.status,'not-downloaded');
   assert.ok(a.licenseReview,'a license review must be documented');
 }
});
test('visual changes are still gated by functionality and before/after evidence',()=>{
 const agents=fs.readFileSync(path.join(root,'AGENTS.md'),'utf8');
 const art=fs.readFileSync(path.join(root,'.agents/skills/hanna-3d-art/SKILL.md'),'utf8');
 assert.match(agents,/P0/);
 assert.match(agents,/P1/);
 assert.match(art,/Não iniciar troca visual/);
 assert.match(art,/capturas de tela idênticas/);
});
