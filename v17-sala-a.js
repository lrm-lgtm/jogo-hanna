(()=>{'use strict';
function wait(){const B=window.BABYLON,scene=B?.EngineStore?.LastCreatedScene;if(!B||!scene){setTimeout(wait,180);return}if(window.__HANNA_V17_SALA__)return;window.__HANNA_V17_SALA__=true;build(B,scene)}
function build(B,scene){const C=h=>B.Color3.FromHexString(h),mats={};
 const mat=(n,c)=>mats[n]||(mats[n]=(()=>{const m=new B.StandardMaterial('v17_'+n,scene);m.diffuseColor=C(c);m.specularColor=new B.Color3(.025,.025,.025);m.roughness=.82;return m})());
 const box=(n,x,y,z,w,h,d,m)=>{const o=B.MeshBuilder.CreateBox('v17_'+n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;o.isPickable=false;o.metadata={v17Room:true};return o};
 const sph=(n,x,y,z,sx,sy,sz,m)=>{const o=B.MeshBuilder.CreateSphere('v17_'+n,{diameter:1,segments:16},scene);o.position.set(x,y,z);o.scaling.set(sx,sy,sz);o.material=m;o.isPickable=false;o.metadata={v17Room:true};return o};
 const cyl=(n,x,y,z,d,h,m,t=20)=>{const o=B.MeshBuilder.CreateCylinder('v17_'+n,{diameter:d,height:h,tessellation:t},scene);o.position.set(x,y,z);o.material=m;o.isPickable=false;o.metadata={v17Room:true};return o};
 const fabric=mat('fabric','#b86d62'),fabricDark=mat('fabricDark','#8f544d'),cream=mat('cream','#f1ddbd'),rose=mat('rose','#d9899e'),gold=mat('gold','#d8aa54'),wood=mat('wood','#b77749'),woodDark=mat('woodDark','#805039'),brass=mat('brass','#c89d55'),leaf=mat('leaf','#73a96f'),ceramic=mat('ceramic','#efe2c9'),screen=mat('screen','#273437');
 ['sofaBase','sofaBack','coffee','rack','livingRug'].forEach(n=>{const m=scene.getMeshByName(n);if(m)m.visibility=.001});['cush1','cush2'].forEach(n=>{const m=scene.getMeshByName(n);if(m)m.isVisible=false});
 const rugMat=mat('rug','#d6c4aa');rugMat.specularColor=B.Color3.Black();const rug=B.MeshBuilder.CreateGround('v17_livingRug',{width:4.5,height:3.15},scene);rug.position.set(-.72,.052,.58);rug.material=rugMat;rug.isPickable=false;
 for(let i=0;i<15;i++){const x=-2.72+i*.285;box('fringeA'+i,x,.034,-.99,.025,.018,.16,cream);box('fringeB'+i,x,.034,2.15,.025,.018,.16,cream)}
 // A malha visual foi trocada, então sua colisão também deve acompanhar o sofá.
 const oldSofa=scene.getMeshByName('sofaBase');if(oldSofa)oldSofa.checkCollisions=false;
 const sofaCollider=B.MeshBuilder.CreateBox('hannaSofaCollision',{width:2.56,height:1.10,depth:1.02},scene);
 sofaCollider.position.set(-.8,.55,2.13);sofaCollider.isVisible=false;sofaCollider.isPickable=false;sofaCollider.checkCollisions=true;
 box('sofaPlinth',-.8,.48,2.13,2.68,.30,.92,fabricDark);for(let i=0;i<3;i++){const x=-1.57+i*.77;sph('seat'+i,x,.72,2.02,.39,.17,.43,fabric);sph('back'+i,x,1.16,2.43,.40,.43,.16,fabric)}sph('armL',-2.08,.80,2.10,.20,.39,.48,fabricDark);sph('armR',.48,.80,2.10,.20,.39,.48,fabricDark);
 [[-1.88,.19,1.86],[-1.88,.19,2.40],[.28,.19,1.86],[.28,.19,2.40]].forEach((p,i)=>{const l=cyl('sofaFoot'+i,...p,.13,.30,woodDark,12);l.rotation.z=i%2?.05:-.05});const c1=sph('cushionCream',-1.55,1.06,1.89,.31,.27,.12,cream);c1.rotation.z=.10;const c2=sph('cushionGold',-.03,1.06,1.90,.29,.26,.12,gold);c2.rotation.z=-.11;
 async function loadSofa(){
  try{
   const result=await B.SceneLoader.ImportMeshAsync('','./assets/sofa/','Sofa_01_1k.gltf',scene);
   const meshes=result.meshes.filter(m=>m.getBoundingInfo&&m.getTotalVertices()>0);
   if(!meshes.length)throw new Error('Sofá sem geometria');
   // Calcula o tamanho antes de reparentar: o centro precisa ser compensado
   // no espaço LOCAL. Na v1.8 o offset era aplicado no holder já rotacionado.
   let min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
   for(const mesh of meshes){mesh.computeWorldMatrix(true);const bb=mesh.getBoundingInfo().boundingBox;min=B.Vector3.Minimize(min,bb.minimumWorld);max=B.Vector3.Maximize(max,bb.maximumWorld)}
   const holder=new B.TransformNode('hannaSofa',scene);
   const content=new B.TransformNode('hannaSofaContent',scene);content.parent=holder;
   result.meshes.filter(m=>!m.parent||!result.meshes.includes(m.parent)).forEach(m=>m.parent=content);
   content.position.set(-(min.x+max.x)/2,-min.y,-(min.z+max.z)/2);
   const scale=2.55/Math.max(.001,max.x-min.x);
   holder.scaling.setAll(scale);
   holder.position.set(-.8,0,2.15);
   holder.rotation.y=Math.PI;
   meshes.forEach(mesh=>mesh.isPickable=false);
   for(const mesh of scene.meshes){if(/^v17_(?:sofaPlinth|sofaFoot|seat|back|arm|cushion)/.test(mesh.name))mesh.isVisible=false}
   console.info('Casa da Hanna: sofá detalhado carregado');
  }catch(error){console.warn('Sofá local indisponível; usando versão leve',error)}
 }
 loadSofa();
 window.HannaSalaV17={B,scene,C,mat,box,sph,cyl,m:{fabric,fabricDark,cream,rose,gold,wood,woodDark,brass,leaf,ceramic,screen}};window.dispatchEvent(new Event('hanna:v17-sala-ready'))}
wait()})();
