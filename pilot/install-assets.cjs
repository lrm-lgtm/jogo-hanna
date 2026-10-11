// Deterministic, pinned CC0 asset import. Executes in CI once; no runtime remote dependencies.
'use strict';
const fs=require('node:fs'), path=require('node:path'), https=require('node:https');
const manifest=require('./asset-manifest.json'),base=path.join(__dirname,'assets');
async function download(url,file){
  if(fs.existsSync(file)&&fs.statSync(file).size>0)return false;
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const bytes=await new Promise((resolve,reject)=>{
    const grab=(url,redirects=0)=>https.get(url,{headers:{'User-Agent':'CasaHanna-Pilot-Asset-Importer'}},r=>{
      if(r.statusCode>=300&&r.statusCode<400&&r.headers.location&&redirects<3){r.resume();return grab(r.headers.location,redirects+1)}
      if(r.statusCode!==200){r.resume();return reject(new Error('Upstream HTTP '+r.statusCode+' at '+url))}
      const buf=[];r.on('data',d=>buf.push(d));r.on('end',()=>resolve(Buffer.concat(buf)));r.on('error',reject);
    }).on('error',reject);grab(url);
  });
  if(!bytes.length)throw new Error('empty '+url);
  fs.writeFileSync(file,bytes);return true;
}
(async()=>{
let n=0;
for(const [pack,cfg] of Object.entries(manifest.upstreams)){
  const prefix='https://raw.githubusercontent.com/'+cfg.repository+'/'+cfg.commit+'/'+cfg.sourceRoot+'/';
  const dir=path.join(base,pack);
  const atlas=pack==='restaurant'?'restaurantbits_texture.png':'furniturebits_texture.png';
  for(const file of [...cfg.models.flatMap(m=>[m+'.gltf',m+'.bin']),atlas]){
    if(await download(prefix+file,path.join(dir,file)))n++;
  }
  const gltf=JSON.parse(fs.readFileSync(path.join(dir,cfg.models[0]+'.gltf'),'utf8'));
  if(!gltf.asset?.version?.startsWith('2'))throw new Error('glTF 2 expected');
  for(const model of cfg.models){
    const doc=JSON.parse(fs.readFileSync(path.join(dir,model+'.gltf'),'utf8'));
    for(const uri of [...(doc.images||[]).map(x=>x.uri),...(doc.buffers||[]).map(x=>x.uri)]){
      if(uri&&(!fs.existsSync(path.join(dir,uri))||uri.includes('..')))throw new Error('missing or unsafe asset '+model+': '+uri);
    }
  }
}
fs.writeFileSync(path.join(base,'SOURCES.md'),
 '# KayKit CC0 assets\n\nOriginal creator: Kay Lousberg (https://kaylousberg.itch.io/).\n'+
 'Original repositories: '+manifest.sources.join(' , ')+'\n\n'+
 'License: Creative Commons Zero (CC0 1.0) — https://creativecommons.org/publicdomain/zero/1.0/\n'+
 'Models are copied from pinned source commits recorded in ../asset-manifest.json.\n'+
 'No paid assets or model-generation services used.\n');
console.log('Asset import complete: '+n+' files downloaded; '+Object.values(manifest.upstreams).reduce((x,p)=>x+p.models.length,0)+' validated glTF models.');
})().catch(e=>{console.error(e);process.exitCode=1});
