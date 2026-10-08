(()=>{'use strict';
function build(){const H=window.HannaSalaV17;if(!H)return false;const {B,scene,C,mat,box,sph,cyl,m}=H,{cream,rose,gold,wood,woodDark,brass,leaf,ceramic,screen}=m;
 // Esconde malhas antigas que estavam atravessando a sala remasterizada.
 // Mantém objetos marcados como alvos de missão (table/plant) selecionáveis.
 for(const name of ['tv','tvGlow','pot','frame','art','lampStem','lampShade']){
  const mesh=scene.getMeshByName(name);if(mesh)mesh.visibility=.001;
 }
 const targetPlant=scene.getMeshByName('plant');if(targetPlant)targetPlant.visibility=.001;
 scene.meshes.filter(mesh=>mesh.name==='leg'&&mesh.position.x>-1.5&&mesh.position.x<.25&&Math.abs(mesh.position.z-.1)<.7).forEach(mesh=>mesh.isVisible=false);
 for(const name of ['coffee','rack']){const old=scene.getMeshByName(name);if(old)old.checkCollisions=false}

 // O jogo-base ainda importa uma mesa de centro de outro pacote. Desativamos
 // SOMENTE a importação naquele ponto, inclusive se ela terminar depois.
 function hideLegacyCoffee(wrapper){
  if(wrapper?.name!=='assetWrapper'||!wrapper.position)return;
  if(Math.abs(wrapper.position.x+.65)<.06&&Math.abs(wrapper.position.z-.1)<.06){
   wrapper.setEnabled(false);
  }
 }
 scene.transformNodes.forEach(hideLegacyCoffee);
 scene.onNewTransformNodeAddedObservable?.add(node=>{
  if(node.name==='assetWrapper')queueMicrotask(()=>hideLegacyCoffee(node));
 });

 // Hitboxes simples coincidentes com os móveis mostrados, sem paredes invisíveis.
 function collision(name,x,y,z,w,h,d){
  const mesh=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
  mesh.position.set(x,y,z);mesh.isVisible=false;mesh.isPickable=false;mesh.checkCollisions=true;
 }
 collision('hannaCoffeeCollision',-.65,.35,.15,1.55,.70,.88);
 collision('hannaRackCollision',.15,.40,3.72,2.20,.80,.58);
 collision('hannaChairCollisionL',1,.48,.45,.67,.96,.70);
 collision('hannaChairCollisionR',3,.48,.45,.67,.96,.70);
 const top=cyl('coffeeTop',-.65,.66,.15,1.58,.13,wood,28);top.scaling.z=.62;const shelf=cyl('coffeeShelf',-.65,.34,.15,1.32,.07,woodDark,24);shelf.scaling.z=.57;[[-1.20,.35,-.12],[-.10,.35,-.12],[-1.20,.35,.42],[-.10,.35,.42]].forEach((p,i)=>{const l=cyl('coffeeLeg'+i,...p,.13,.48,woodDark,12);l.rotation.z=i%2?.035:-.035});const b1=box('book1',-.90,.755,.15,.58,.055,.34,rose);b1.rotation.y=.08;const b2=box('book2',-.83,.815,.13,.48,.05,.30,cream);b2.rotation.y=-.06;cyl('vase',-.34,.84,.15,.24,.29,ceramic,18);for(let i=-1;i<=1;i++){const st=cyl('stem'+i,-.34+i*.045,1.05,.15+i*.02,.024,.36,leaf,10);st.rotation.z=i*.08}sph('flowerA',-.42,1.23,.15,.10,.10,.10,rose);sph('flowerB',-.31,1.26,.13,.09,.09,.09,gold);
 cyl('sideTop',-2.42,.67,2.00,.72,.11,wood,20);cyl('sideLeg',-2.42,.35,2.00,.18,.55,woodDark,12);cyl('lampStem',-2.42,1.05,2.00,.06,.76,brass,12);const shade=B.MeshBuilder.CreateCylinder('v17_lampShade',{height:.40,diameterTop:.38,diameterBottom:.66,tessellation:18},scene);shade.position.set(-2.42,1.49,2);shade.material=cream;shade.isPickable=false;const glow=new B.PointLight('v17_lampGlow',new B.Vector3(-2.42,1.42,2),scene);glow.diffuse=C('#ffd8a1');glow.intensity=.16;glow.range=4.5;
 box('rackBody',.15,.46,3.72,2.18,.58,.54,wood);box('rackTop',.15,.78,3.72,2.30,.09,.60,woodDark);for(let i=0;i<3;i++){const x=-.55+i*.70;box('rackDoor'+i,x,.46,3.43,.58,.40,.035,i===1?ceramic:cream);sph('rackKnob'+i,x+.18,.46,3.40,.03,.03,.03,brass)}box('tvFrame',.15,1.62,4.09,1.88,1.08,.10,woodDark);box('tvScreen',.15,1.62,4.03,1.66,.86,.035,screen);
 [[-1.55,'#d9899e'],[-.72,'#d8aa54'],[.11,'#88b7ad']].forEach(([x,c],i)=>{box('frame'+i,x,2.18,4.70,.66,.76,.055,woodDark);box('art'+i,x,2.18,4.665,.52,.62,.018,mat('art'+i,c))});cyl('plantPot',-2.72,.36,3.74,.55,.55,ceramic,18);for(let i=0;i<7;i++){const a=i/7*Math.PI*2,l=sph('leaf'+i,-2.72+Math.cos(a)*.16,.78+(i%3)*.13,3.74+Math.sin(a)*.12,.13,.34,.10,leaf);l.rotation.z=Math.cos(a)*.45}const fill=new B.PointLight('v17_roomFill',new B.Vector3(-.8,2.55,1.1),scene);fill.diffuse=C('#fff0d2');fill.intensity=.13;fill.range=7.5;
 async function importFurniture(id,targetWidth,x,z,rotation){
  const result=await B.SceneLoader.ImportMeshAsync('',`./assets/${id}/`,`${id}_1k.gltf`,scene);
  const meshes=result.meshes.filter(mesh=>mesh.getBoundingInfo&&mesh.getTotalVertices()>0);
  if(!meshes.length)throw new Error(`${id} sem geometria`);
  let min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
  for(const mesh of meshes){mesh.computeWorldMatrix(true);const bb=mesh.getBoundingInfo().boundingBox;min=B.Vector3.Minimize(min,bb.minimumWorld);max=B.Vector3.Maximize(max,bb.maximumWorld)}
  const holder=new B.TransformNode(`hanna_${id}_${x}`,scene);
  const content=new B.TransformNode(`hanna_${id}_content_${x}`,scene);content.parent=holder;
  result.meshes.filter(mesh=>!mesh.parent||!result.meshes.includes(mesh.parent)).forEach(mesh=>mesh.parent=content);
  content.position.set(-(min.x+max.x)/2,-min.y,-(min.z+max.z)/2);
  holder.scaling.setAll(targetWidth/(max.x-min.x));holder.position.set(x,0,z);holder.rotation.y=rotation;
  meshes.forEach(mesh=>mesh.isPickable=false);
  return holder;
 }
 async function furnishDining(){
  try{
   const diningTable=await importFurniture('wooden_table_02',2.4,2,.45,0);
   diningTable.scaling.y*=.52;
   // Mantém a hitbox/área de interação da missão na altura do tampo visível.
   diningTable.computeWorldMatrix(true);
   const tops=diningTable.getChildMeshes().map(mesh=>{mesh.computeWorldMatrix(true);return mesh.getBoundingInfo().boundingBox.maximumWorld.y});
   const topHeight=Math.max(...tops.filter(Number.isFinite));
   const gameplayTable=scene.getMeshByName('table');
   if(gameplayTable&&Number.isFinite(topHeight)&&topHeight>.50&&topHeight<1.8)gameplayTable.position.y=topHeight-.08;
   for(const name of ['table','runner']){const mesh=scene.getMeshByName(name);if(mesh)mesh.visibility=.001}
   scene.meshes.filter(mesh=>mesh.name==='leg'&&mesh.position.x>.7&&mesh.position.x<3.3&&Math.abs(mesh.position.z-.45)<.8).forEach(mesh=>mesh.visibility=.001);
  }catch(error){console.warn('Mesa detalhada indisponível',error)}
  for(const [x,angle] of [[1,Math.PI/2],[3,-Math.PI/2]]){
   try{
    await importFurniture('painted_wooden_chair_01',.68,x,.45,angle);
    const chair=scene.transformNodes.find(node=>node.name==='chair'&&Math.abs(node.position.x-x)<.1);
    chair?.getChildMeshes().forEach(mesh=>mesh.isVisible=false);
   }catch(error){console.warn('Cadeira detalhada indisponível',error)}
  }
 }
 furnishDining();
 console.info('Casa da Hanna v1.7 Sala Remaster ativo');return true}
 if(!build())window.addEventListener('hanna:v17-sala-ready',build,{once:true})})();
