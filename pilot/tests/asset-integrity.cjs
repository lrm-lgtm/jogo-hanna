'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const manifest=require('../asset-manifest.json'),root=path.join(__dirname,'../assets');
let count=0;
for(const [pack,cfg] of Object.entries(manifest.upstreams)){
 const dir=path.join(root,pack);
 const atlas=pack==='restaurant'?'restaurantbits_texture.png':'furniturebits_texture.png';
 assert.ok(fs.existsSync(path.join(dir,atlas)),'missing atlas '+atlas);
 for(const model of cfg.models){
  const doc=JSON.parse(fs.readFileSync(path.join(dir,model+'.gltf'),'utf8'));
  assert.equal(doc.asset.version,'2.0');
  for(const u of [...(doc.images||[]).map(x=>x.uri),...(doc.buffers||[]).map(x=>x.uri)]){
   assert.ok(!u.includes('..'),'invalid traversal');
   assert.ok(fs.existsSync(path.join(dir,u)),'missing resource '+model+'/'+u);
   assert.ok(fs.statSync(path.join(dir,u)).size>0);
  }
  count++;
 }
}
assert.equal(count,26);
console.log('PASS: '+count+' local CC0 glTF models with dependencies');
