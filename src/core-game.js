
(()=>{
'use strict';
const $=q=>document.querySelector(q),canvas=$('#game'),loading=$('#loading');
if(!window.BABYLON){loading.querySelector('.box div:nth-child(3)').textContent='Não consegui carregar o motor 3D. Verifique a internet.';return;}
const ui={start:$('#start'),missionTitle:$('#missionTitle'),missionIcon:$('#missionIcon'),instruction:$('#instruction'),fill:$('#progressFill'),stepText:$('#stepText'),held:$('#held'),near:$('#near'),coins:$('#coinValue'),toast:$('#toastMsg'),celebrate:$('#celebrate'),celebrateTitle:$('#celebrateTitle'),celebrateText:$('#celebrateText'),celebrateEmoji:$('#celebrateEmoji'),reward:$('#rewardValue'),continueBtn:$('#continueBtn'),assetBadge:$('#assetBadge'),audioBtn:$('#audioBtn'),speechBubble:$('#speechBubble'),speechText:$('#speechText'),speechAvatar:$('#speechAvatar'),stars:$('#starValue'),time:$('#timeValue'),dogState:$('#dogState'),babyState:$('#babyState'),unlockToast:$('#unlockToast')};
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Mac/.test(navigator.platform)&&navigator.maxTouchPoints>1);
const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
const lowMemory=Number(navigator.deviceMemory||8)<=4;
let qualityMode=localStorage.getItem('hanna_quality')||'auto';
const engine=new BABYLON.Engine(canvas,true,{adaptToDeviceRatio:true,stencil:true,preserveDrawingBuffer:false});
function applyHardwareScale(){
 const autoScale=isMobile?(lowMemory?1.55:1.28):1;
 engine.setHardwareScalingLevel(qualityMode==='hd'?1:qualityMode==='eco'?1.65:autoScale);
}
applyHardwareScale();
const scene=new BABYLON.Scene(engine);
scene.clearColor=BABYLON.Color4.FromHexString('#b9e4f3ff');
scene.imageProcessingConfiguration.contrast=1.18;
scene.imageProcessingConfiguration.exposure=1.08;
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.vignetteEnabled=true;
scene.imageProcessingConfiguration.vignetteWeight=1.15;
scene.imageProcessingConfiguration.vignetteStretch=.18;
scene.imageProcessingConfiguration.vignetteCameraFov=.5;
try{
  scene.environmentTexture=BABYLON.CubeTexture.CreateFromPrefilteredData(
    'https://assets.babylonjs.com/environments/environmentSpecular.env',scene
  );
  scene.environmentIntensity=.62;
}catch(e){console.warn('IBL fallback',e)}
const hemi=new BABYLON.HemisphericLight('hemi',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.9;hemi.groundColor=BABYLON.Color3.FromHexString('#9a8a78');
const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.35,-1,.3),scene);sun.position.set(3,9,-6);sun.intensity=.62;
const warmFill=new BABYLON.PointLight('warmFill',new BABYLON.Vector3(-1.2,2.3,1.0),scene);
warmFill.diffuse=BABYLON.Color3.FromHexString('#ffd9ad');warmFill.intensity=.22;warmFill.range=8;
const coolFill=new BABYLON.PointLight('coolFill',new BABYLON.Vector3(4.8,2.2,-1.8),scene);
coolFill.diffuse=BABYLON.Color3.FromHexString('#b9eaff');coolFill.intensity=.18;coolFill.range=7;
const camera=new BABYLON.ArcRotateCamera('camera',-Math.PI/2,1.03,13,new BABYLON.Vector3(0,.9,0),scene);camera.lowerBetaLimit=.80;camera.upperBetaLimit=1.12;camera.lowerRadiusLimit=9;camera.upperRadiusLimit=15;camera.panningSensibility=0;camera.wheelDeltaPercentage=.012;camera.attachControl(canvas,true);
scene.collisionsEnabled=true;
camera.checkCollisions=true;
camera.collisionRadius=new BABYLON.Vector3(.34,.34,.34);

const pipeline=new BABYLON.DefaultRenderingPipeline('pipe',true,scene,[camera]);
pipeline.fxaaEnabled=true;pipeline.samples=1;pipeline.imageProcessingEnabled=true;scene.ambientColor=new BABYLON.Color3(.12,.12,.12);
function applyQuality(){
 const eco=qualityMode==='eco'||(qualityMode==='auto'&&isMobile&&lowMemory);
 pipeline.bloomEnabled=!eco;pipeline.bloomThreshold=.95;pipeline.bloomWeight=eco?0:.12;pipeline.bloomKernel=isMobile?20:32;
 applyHardwareScale();
 const qb=document.getElementById('qualityBadge'),btn=document.getElementById('qualityBtn');
 const label=qualityMode==='hd'?'HD':qualityMode==='eco'?'ECONÔMICO':'AUTO';
 if(qb)qb.textContent=label;if(btn)btn.textContent='⚙️ Qualidade: '+label;
}
const mkMat=(n,c)=>{const m=new BABYLON.StandardMaterial(n,scene);m.diffuseColor=BABYLON.Color3.FromHexString(c);m.specularColor=new BABYLON.Color3(.04,.04,.04);return m};
const M={floor:mkMat('floor','#ead9b5'),wall:mkMat('wall','#fff6e7'),mint:mkMat('mint','#bfe5cf'),mint2:mkMat('mint2','#88c8a5'),pink:mkMat('pink','#f2acc3'),pink2:mkMat('pink2','#d982a1'),blue:mkMat('blue','#80c8dc'),blue2:mkMat('blue2','#4e9fba'),wood:mkMat('wood','#c78955'),wood2:mkMat('wood2','#8e5937'),white:mkMat('white','#fbfaf6'),cream:mkMat('cream','#fff0cf'),yellow:mkMat('yellow','#f4cb5d'),orange:mkMat('orange','#e99855'),red:mkMat('red','#e46f68'),steel:mkMat('steel','#98a8ad'),dark:mkMat('dark','#504743'),skin:mkMat('skin','#efc3a0'),hair:mkMat('hair','#6b4936'),dog:mkMat('dog','#d5a069'),dogDark:mkMat('dogDark','#8b654b'),green:mkMat('green','#78bf78'),grass:mkMat('grass','#9ed293'),toast:mkMat('toast','#8a532f'),purple:mkMat('purple','#aa91d8'),glass:mkMat('glass','#c7edf7')};M.glass.alpha=.58;M.glass.emissiveColor=BABYLON.Color3.FromHexString('#eafcff');
const box=(n,x,y,z,w,h,d,m,p=false)=>{const o=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o};
const sph=(n,x,y,z,d,m,p=false)=>{const o=BABYLON.MeshBuilder.CreateSphere(n,{diameter:d,segments:9},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o};
const cyl=(n,x,y,z,d,h,m,p=false)=>{const o=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:d,height:h,tessellation:12},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o};
const tag=(m,type,label,data={})=>{m.metadata={type,label,...data};m.isPickable=true;return m};
function addLegs(x,z,w,d,h,mat){
 return [[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>box('leg',x+sx*(w/2-.11),h/2,z+sz*(d/2-.11),.12,h,.12,mat));
}

function setAssetBadge(text,mode='loading'){
  if(!ui.assetBadge)return;
  ui.assetBadge.className=mode;
  ui.assetBadge.textContent=text;
}
async function fetchRepoTree(repo){
  const branches=['main','master'];
  let lastErr=null;
  for(const branch of branches){
    try{
      const r=await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,{headers:{Accept:'application/vnd.github+json'}});
      if(!r.ok)throw new Error(`GitHub ${r.status}`);
      const j=await r.json();
      if(j?.tree?.length)return {branch,tree:j.tree};
    }catch(e){lastErr=e}
  }
  throw lastErr||new Error('Não consegui ler o repositório');
}
function splitRaw(repo,branch,path){
  const i=path.lastIndexOf('/');
  const dir=i>=0?path.slice(0,i+1):'';
  const file=i>=0?path.slice(i+1):path;
  return {root:`https://raw.githubusercontent.com/${repo}/${branch}/${dir}`,file};
}
function boundsOf(meshes){
  let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity),ok=false;
  for(const m of meshes){
    if(!m || !m.getBoundingInfo)continue;
    try{
      m.computeWorldMatrix(true);
      const b=m.getBoundingInfo().boundingBox;
      min=BABYLON.Vector3.Minimize(min,b.minimumWorld);
      max=BABYLON.Vector3.Maximize(max,b.maximumWorld);
      ok=true;
    }catch(e){}
  }
  return ok?{min,max,size:max.subtract(min),center:min.add(max).scale(.5)}:null;
}
function packImported(result,targetHeight=1,rotY=0){
  const holder=new BABYLON.TransformNode('assetHolder',scene);
  const roots=result.meshes.filter(m=>!m.parent || !result.meshes.includes(m.parent));
  roots.forEach(m=>m.parent=holder);
  const b=boundsOf(result.meshes);
  if(b){
    const h=Math.max(.001,b.size.y);
    const s=targetHeight/h;
    holder.scaling.setAll(s);
    holder.position.set(-b.center.x*s,-b.min.y*s,-b.center.z*s);
  }
  const wrapper=new BABYLON.TransformNode('assetWrapper',scene);
  holder.parent=wrapper;
  wrapper.rotation.y=rotY;
  result.meshes.forEach(m=>{
    if(m && m.receiveShadows!==undefined)m.receiveShadows=true;
    try{shadow.addShadowCaster(m)}catch(e){}
  });
  return wrapper;
}
async function importRepoModel(repo,branch,path,targetHeight,position,rotY=0,parent=null){
  const {root,file}=splitRaw(repo,branch,path);
  const result=await BABYLON.SceneLoader.ImportMeshAsync('',root,file,scene);
  const wrapper=packImported(result,targetHeight,rotY);
  if(parent){
    wrapper.parent=parent;
    wrapper.position.copyFrom(position||BABYLON.Vector3.Zero());
  }else{
    wrapper.position.copyFrom(position||BABYLON.Vector3.Zero());
  }
  return {wrapper,result,path};
}
let playerAsset={loaded:false,groups:[],current:''};
let dogAsset={loaded:false,groups:[],current:''};
function playAssetAnim(state,wanted){
  if(!state.loaded||!state.groups?.length)return;
  const key=wanted==='walk'?/(walk|run|jog|locomotion)/i:/(idle|stand|breath)/i;
  const g=state.groups.find(x=>key.test(x.name)) || state.groups[0];
  if(!g || state.current===g.name)return;
  state.groups.forEach(x=>{try{x.stop()}catch(e){}});
  try{g.start(true,wanted==='walk'?1.18:1.0,g.from,g.to,false);state.current=g.name}catch(e){}
}
async function loadRealAssets(){
  let loaded=0, failed=0;
  setAssetBadge('🎨 Visual HD: carregando personagem, pet e móveis...','loading');

  const RAW='https://raw.githubusercontent.com/agentkaerf/FreeModels/refs/heads/main/';
  const WOMEN=RAW+'Ultimate%20Modular%20Women%20-%20April%202022/Individual%20Characters/glTF/';
  const ANIMALS=RAW+'Ultimate%20Animated%20Animals%20-%20July%202021/glTF/';
  const ENV=RAW+'Sushi%20Restaurant%20Kit%20-%20May%202023/Environment/glTF/';
  const DEC=RAW+'Sushi%20Restaurant%20Kit%20-%20May%202023/Decoration/glTF/';

  async function importDirect(root,file,targetHeight,pos,rotY=0,parent=null){
    const result=await BABYLON.SceneLoader.ImportMeshAsync('',root,file,scene);
    const wrapper=packImported(result,targetHeight,rotY);
    if(parent){wrapper.parent=parent;wrapper.position.copyFrom(pos||BABYLON.Vector3.Zero())}
    else wrapper.position.copyFrom(pos||BABYLON.Vector3.Zero());
    result.meshes.forEach(m=>{
      if(m.material){
        try{
          if('roughness' in m.material)m.material.roughness=Math.max(.38,m.material.roughness||.5);
          if('metallic' in m.material)m.material.metallic=Math.min(.12,m.material.metallic||0);
        }catch(e){}
      }
    });
    return {wrapper,result};
  }
  const ghost=(items,alpha=.015)=>{
    for(const item of items.flat()){
      if(!item)continue;
      if(item.getChildMeshes){
        try{item.getChildMeshes().forEach(m=>{m.visibility=alpha;m.isPickable=false})}catch(e){}
      }
      if(item.visibility!==undefined){item.visibility=alpha}
    }
  };

  // PERSONAGEM ANIMADA REAL — Quaternius Casual, CC0.
  try{
    const fallback=player.getChildMeshes().slice();
    const a=await importDirect('./assets/character/','Casual.gltf',1.88,new BABYLON.Vector3(0,0,0),0,player);
    fallback.forEach(m=>m.isVisible=false);
    playerAsset={loaded:true,groups:a.result.animationGroups||[],current:''};
    playAssetAnim(playerAsset,'idle');
    loaded++;
  }catch(e){failed++;console.warn('Casual.gltf fallback',e)}

  // CACHORRO ANIMADO REAL — Quaternius Husky, CC0.
  try{
    const fallbackDog=dog.getChildMeshes().slice();
    const a=await importDirect(ANIMALS,'Husky.gltf',.78,new BABYLON.Vector3(0,0,0),Math.PI/2,dog);
    fallbackDog.forEach(m=>m.visibility=.002);
    dogHead.visibility=.002;dogHead.isPickable=true;
    dogAsset={loaded:true,groups:a.result.animationGroups||[],current:''};
    playAssetAnim(dogAsset,'idle');
    loaded++;
  }catch(e){failed++;console.warn('Husky.gltf fallback',e)}

  // MOBILIÁRIO coerente do mesmo pack Quaternius Sushi Restaurant Kit.
  const jobs=[
    ['Environment_Table.gltf',.58,new BABYLON.Vector3(-.65,0,.1),0,()=>ghost([coffee,coffeeLegs])],
    ['Environment_Counter_Sink.gltf',1.02,new BABYLON.Vector3(2.68,0,3.55),Math.PI,()=>ghost([sink])],
    ['Environment_Oven.gltf',1.05,new BABYLON.Vector3(4.15,0,3.55),Math.PI,()=>ghost([stoveBase,stoveBurners])],
    ['Environment_Counter_Doors.gltf',1.0,new BABYLON.Vector3(5.05,0,3.55),Math.PI,()=>{}],
    ['Environment_Counter_Drawers.gltf',1.0,new BABYLON.Vector3(5.95,0,3.55),Math.PI,()=>{}],
    ['Environment_KitchenKnives.gltf',.55,new BABYLON.Vector3(4.72,1.0,3.56),Math.PI,()=>{}],
    ['Environment_Pan.gltf',.28,new BABYLON.Vector3(4.15,1.16,3.55),0,()=>{}],
    ['Environment_Plate.gltf',.14,new BABYLON.Vector3(2.0,1.10,.45),0,()=>{}],
    ['Environment_Bowl.gltf',.20,new BABYLON.Vector3(2.35,1.11,.45),0,()=>{}],
  ];

  for(const [file,h,pos,rot,after] of jobs){
    try{
      await importDirect(ENV,file,h,pos,rot);
      after?.();
      loaded++;
    }catch(e){failed++;console.warn('asset env falhou',file,e)}
  }

  // Decoração 3D que quebra a sensação de "caixas".
  const decor=[
    ['Decoration_Plant1.gltf',1.12,new BABYLON.Vector3(-2.7,0,3.75),0,()=>ghost([plant])],
    ['Decoration_Light.gltf',.70,new BABYLON.Vector3(-2.05,1.35,.55),0,()=>{}],
    ['Decoration_Painting.gltf',1.0,new BABYLON.Vector3(-1.4,1.55,4.67),Math.PI,()=>{}],
    ['Decoration_Bamboo.gltf',1.30,new BABYLON.Vector3(-3.05,0,-2.8),0,()=>{}],
  ];
  for(const [file,h,pos,rot,after] of decor){
    try{
      await importDirect(DEC,file,h,pos,rot);
      after?.();
      loaded++;
    }catch(e){failed++;console.warn('asset decor falhou',file,e)}
  }

  // Procedural counter shell fica quase invisível depois que os módulos 3D chegam.
  if(loaded>=8)ghost([counterBase,counterTop,cabA,cabB,cabC],.035);

  if(loaded>=12)setAssetBadge(`✨ VISUAL HD: ${loaded} modelos 3D carregados`,'ok');
  else if(loaded>=3)setAssetBadge(`🟡 ${loaded} modelos HD + fallback automático`,'warn');
  else setAssetBadge('🟡 conexão bloqueou os modelos; usando fallback','warn');
}

function discShadow(x,z,sx,sz,a=.18){const p=BABYLON.MeshBuilder.CreateDisc('shadow',{radius:.6,tessellation:28},scene);p.rotation.x=Math.PI/2;p.position.set(x,.021,z);p.scaling.x=sx;p.scaling.y=sz;const m=new BABYLON.StandardMaterial('shadowMat',scene);m.diffuseColor=new BABYLON.Color3(0,0,0);m.emissiveColor=new BABYLON.Color3(0,0,0);m.alpha=a;p.material=m;p.isPickable=false;return p;}
// CASA - cozinha à direita, sala no centro, quarto do bebê à esquerda
const floor=box('floor',0,-.09,.2,14,.18,9.5,M.floor,true);floor.metadata={type:'floor'};floor.receiveShadows=true;
box('backWall',0,1.55,4.85,14,3.1,.12,M.wall);box('leftWall',-6.95,1.55,.3,.12,3.1,9.1,M.wall);box('rightWall',6.95,1.55,.3,.12,3.1,9.1,M.wall);
const ceiling=box('ceiling',0,3.12,.2,14,.08,9.5,M.white);ceiling.isVisible=false;ceiling.isPickable=false;box('base1',0,.14,4.8,14,.08,.08,M.wood2);box('base2',-6.9,.14,.3,.08,.08,9.1,M.wood2);box('base3',6.9,.14,.3,.08,.08,9.1,M.wood2);box('trimTop',0,2.98,4.78,14,.08,.08,M.white);const skyPlane=box('skyPlane',0,2.35,4.68,13.6,1.35,.02,M.blue);skyPlane.material.alpha=.15;
// divisória do quarto
box('divider',-3.55,1.55,2.7,.12,3.1,4.2,M.wall);box('dividerTop',-3.55,2.7,.4,.12,.8,2.0,M.wall);
// piso por áreas
box('kitchenTile',3.7,.015,1.1,5.9,.03,6.7,M.cream,true).metadata={type:'floor'};
for(let i=-2;i<=2;i++){box('tileV'+i,3.7+i*1.12,.035,1.1,.03,.01,6.55,M.white);}for(let j=-3;j<=3;j++){box('tileH'+j,3.7,.035,1.1+j*.95,5.7,.01,.03,M.white);}
const livingRug=box('livingRug',-.6,.025,-.5,4.2,.04,2.8,M.mint,true);livingRug.metadata={type:'floor'};
const nurseryRug=box('nurseryRug',-5.2,.026,.1,2.8,.04,3.4,M.pink,true);nurseryRug.metadata={type:'floor'};
// janelas
function windowSet(x){box('wf',x,2.0,4.78,2.1,1.32,.05,M.white);box('wg',x,2.0,4.745,1.88,1.12,.02,M.glass);box('wv',x,2.0,4.72,.05,1.1,.03,M.white);box('wh',x,2.0,4.72,1.88,.05,.03,M.white);box('curtainL',x-.98,2.05,4.73,.18,1.38,.04,M.pink);box('curtainR',x+.98,2.05,4.73,.18,1.38,.04,M.pink);box('curtainTop',x,2.7,4.73,2.16,.10,.04,M.wood2);const c1=sph('cloudA',x-.35,2.25,4.70,.18,M.white);c1.scaling.x=1.8; c1.scaling.y=.9; const c2=sph('cloudB',x+.28,2.42,4.70,.15,M.white); c2.scaling.x=1.7; c2.scaling.y=.85;}windowSet(-5.15);windowSet(.1);windowSet(5.0);
// quadro infantil
box('frame',-1.4,2.0,4.76,1.5,1.05,.05,M.wood2);box('art',-1.4,2.0,4.72,1.29,.84,.02,M.blue);sph('artSun',-1.7,2.2,4.68,.3,M.yellow);box('artGround',-1.4,1.76,4.68,1.28,.25,.02,M.green);
box('banner',-1.4,2.78,4.72,2.2,.08,.02,M.yellow);[-2.25,-1.85,-1.45,-1.05,-.65].forEach((x,i)=>{const f=box('flag'+i,x,2.55,4.70,.24,.18,.02,[M.pink,M.mint,M.blue,M.yellow,M.purple][i%5]);f.rotation.z=(i%2?-.18:.18)});
// COZINHA
const counterBase=box('counter',4.15,.48,3.55,4.65,.96,.88,M.blue);const counterTop=tag(box('counterTop',4.15,1.0,3.55,4.78,.12,1.0,M.white,true),'counterTop','Bancada');
const cabA=box('cabA',3.05,2.05,4.32,1.5,.72,.58,M.wood);const cabB=box('cabB',4.7,2.05,4.32,1.55,.72,.58,M.wood);const cabC=box('cabC',6.0,2.05,4.32,.85,.72,.58,M.wood);
const sink=tag(box('sink',2.65,1.09,3.55,.85,.15,.62,M.steel,true),'sink','Pia');
const tap=tag(cyl('tap',2.57,1.34,3.55,.08,.48,M.steel,true),'faucet','Torneira');tap.rotation.z=.45;box('tapN',2.72,1.5,3.55,.22,.05,.05,M.steel);
const waterStream=box('waterStream',2.77,1.18,3.55,.035,.42,.035,M.blue);waterStream.isVisible=false;waterStream.isPickable=false;
const wateringCan=new BABYLON.TransformNode('wateringCan',scene);wateringCan.position.set(1.75,1.18,3.55);
const canBody=tag(cyl('canBody',0,0,0,.34,.42,M.blue,true),'wateringCan','Regador');canBody.parent=wateringCan;
const canSpout=box('canSpout',.30,.05,0,.38,.10,.12,M.blue);canSpout.parent=wateringCan;canSpout.rotation.z=-.16;
const canHandle=BABYLON.MeshBuilder.CreateTorus('canHandle',{diameter:.42,thickness:.06,tessellation:16},scene);canHandle.parent=wateringCan;canHandle.position.set(-.04,.24,0);canHandle.rotation.x=Math.PI/2;canHandle.material=M.blue;
const stoveBase=box('stove',4.15,1.1,3.55,.95,.18,.62,M.dark);const stoveBurners=[];[-.23,.23].forEach(dx=>[-.15,.15].forEach(dz=>stoveBurners.push(cyl('burn',4.15+dx,1.21,3.55+dz,.25,.025,M.steel))));
// geladeira estilizada
const fridgeBody=box('fridge',6.05,1.25,1.55,1.45,2.5,1.35,M.white);
box('fridgeInset',6.05,1.25,.795,1.30,2.33,.035,M.dark);
box('fridgeTopShelf',6.05,1.92,.735,1.18,.055,.13,M.white);
box('fridgeMiddleShelf',6.05,1.30,.735,1.18,.055,.13,M.white);
box('fridgeDrawer',6.05,.49,.73,1.16,.46,.11,M.blue);
box('fridgeCarton',5.72,2.12,.75,.25,.38,.08,M.cream);
box('fridgeJar',6.18,2.10,.75,.22,.32,.08,M.pink);
box('fridgeVegetables',6.38,1.52,.75,.38,.23,.08,M.green);
box('fridgeEdgeLeft',5.37,1.25,.77,.045,2.42,.10,M.steel);
box('fridgeEdgeRight',6.73,1.25,.77,.045,2.42,.10,M.steel);
box('fridgeEdgeTop',6.05,2.46,.77,1.40,.045,.10,M.steel);
const fridgeHinge=new BABYLON.TransformNode('fridgeHinge',scene);
fridgeHinge.position.set(5.35,1.25,.68);
const fridgeDoor=tag(box('fridgeDoor',.70,0,0,1.40,2.38,.10,M.white,true),'fridge','Geladeira');
fridgeDoor.parent=fridgeHinge;
const fridgeHandle=box('fridgeHandle',1.24,-.05,-.085,.065,.64,.085,M.steel);
fridgeHandle.parent=fridgeHinge;
const fridgeSeal=box('fridgeSeal',.70,0,.058,1.28,2.26,.018,M.dark);fridgeSeal.parent=fridgeHinge;
const fridgeDoorLiner=box('fridgeDoorLiner',.70,0,.073,1.19,2.16,.018,M.white);fridgeDoorLiner.parent=fridgeHinge;
for(const y of [-.55,.23,.83]){const shelf=box('fridgeDoorShelf',.70,y,.12,1.04,.10,.14,M.blue);shelf.parent=fridgeHinge}
// mesa
const table=tag(box('table',2.0,1.0,.45,2.4,.16,1.4,M.wood,true),'table','Mesa');
const tableLegs=addLegs(2.0,.45,2.2,1.2,.94,M.wood2);
const tableRunner=box('runner',2.0,1.105,.45,1.65,.035,1.16,M.yellow);
// cadeiras
function chair(x,z,r=0){const root=new BABYLON.TransformNode('chair',scene);root.position.set(x,0,z);root.rotation.y=r;const s=box('seat',0,.58,0,.65,.12,.65,M.white);s.parent=root;const b=box('back',0,1.05,.28,.65,.78,.10,M.white);b.parent=root;[[-.23,-.23],[.23,-.23],[-.23,.23],[.23,.23]].forEach(([dx,dz])=>{const l=box('cl',dx,.29,dz,.09,.58,.09,M.wood2);l.parent=root});return root}const chairA=chair(1.0,.45,Math.PI/2);const chairB=chair(3.0,.45,-Math.PI/2);
// comida café
const milk=tag(box('milk',5.83,1.57,.73,.34,.55,.10,M.blue,true),'item','Leite',{item:'milk'});milk.isVisible=false;
const bread=tag(box('bread',3.3,1.21,3.35,.58,.24,.4,M.wood2,true),'item','Pão',{item:'bread'});
const toaster=tag(box('toaster',5.05,1.2,3.35,.78,.38,.52,M.red,true),'toaster','Torradeira');box('slot',5.05,1.39,3.35,.30,.04,.34,M.dark);
box('fruitBowl',3.9,1.15,3.88,.5,.12,.5,M.white);sph('apple1',3.8,1.28,3.85,.16,M.red);sph('apple2',4.0,1.28,3.78,.14,M.yellow);box('jar1',6.05,1.23,3.86,.26,.36,.26,M.glass);box('jar2',5.72,1.18,3.88,.22,.26,.22,M.cream);
const toast=tag(box('toast',5.05,1.51,3.35,.46,.25,.12,M.toast,true),'item','Torrada',{item:'toast'});toast.isVisible=false;
// SALA
const sofaBase=box('sofaBase',-.8,.48,2.1,2.7,.72,1.0,M.purple);const sofaBack=box('sofaBack',-.8,1.05,2.52,2.7,1.05,.18,M.purple);const cush1=box('cush1',-1.45,.89,2.05,.55,.32,.25,M.cream);const cush2=box('cush2',-.15,.89,2.05,.55,.32,.25,M.yellow);
const coffee=box('coffee',-.65,.58,.1,1.65,.16,.9,M.wood);const coffeeLegs=addLegs(-.65,.1,1.45,.7,.55,M.wood2);
// TV e rack
box('rack',.15,.42,3.7,2.3,.65,.6,M.wood);box('tv',.15,1.3,4.02,1.8,1.05,.12,M.dark);box('tvGlow',.15,1.3,3.94,1.62,.86,.02,M.blue);
// planta
box('pot',-2.7,.35,3.75,.55,.7,.55,M.wood2);const plant=tag(sph('plant',-2.7,1.1,3.75,1.0,M.green,true),'plant','Planta');plant.scaling.y=1.25;
box('shelf',-2.85,1.55,4.18,1.6,.14,.28,M.wood);[-3.4,-3.0,-2.6,-2.2].forEach((x,i)=>box('book'+i,x,1.79,4.16,.12,.34,.18,[M.pink,M.blue,M.yellow,M.mint][i%4]));sph('clock',.15,2.26,4.70,.34,M.white);box('clockHand1',.15,2.31,4.66,.03,.22,.02,M.dark);box('clockHand2',.22,2.26,4.66,.18,.03,.02,M.dark);box('lampStem',-2.05,1.25,.55,.07,1.6,.07,M.steel);box('lampShade',-2.05,2.03,.55,.62,.42,.62,M.cream);
// QUARTO DO BEBÊ
box('wardrobe',-6.15,1.35,3.75,1.25,2.7,.65,M.mint2);box('drawer1',-6.15,.95,3.4,1.05,.45,.05,M.white);box('drawer2',-6.15,1.46,3.4,1.05,.45,.05,M.white);
// berço
box('cribBase',-5.2,.42,1.55,2.2,.18,1.15,M.white);box('cribHead',-6.27,.9,1.55,.12,1.05,1.2,M.white);box('cribFoot',-4.13,.9,1.55,.12,1.05,1.2,M.white);[-5.9,-5.55,-5.2,-4.85,-4.5].forEach(x=>{box('rail',x,.91,1.0,.06,1.0,.06,M.white);box('rail2',x,.91,2.1,.06,1.0,.06,M.white)});const cribMattress=tag(box('mattress',-5.2,.58,1.55,1.95,.22,.9,M.pink,true),'crib','Berço');
// brinquedos
const toyBall=tag(sph('ball',-4.55,.25,-1.5,.45,M.yellow,true),'toy','Bola',{toy:'ball'});
box('toybox',-6.1,.42,-1.25,1.25,.8,.8,M.wood);
const toyHinge=new BABYLON.TransformNode('toyHinge',scene);toyHinge.position.set(-6.1,.88,-1.62);
const toyLid=tag(box('toyLid',0,0,.40,1.32,.12,.86,M.pink,true),'toybox','Baú de brinquedos');toyLid.parent=toyHinge;
const teddy=new BABYLON.TransformNode('teddy',scene);teddy.position.set(-5.55,.0,-.88);
const teddyBody=tag(sph('teddyBody',0,.34,0,.38,M.wood,true),'teddy','Ursinho');teddyBody.parent=teddy;
const teddyHead=sph('teddyHead',0,.68,0,.32,M.wood);teddyHead.parent=teddy;
const teddyEarL=sph('teddyEarL',-.16,.82,0,.13,M.wood2);teddyEarL.parent=teddy;
const teddyEarR=sph('teddyEarR',.16,.82,0,.13,M.wood2);teddyEarR.parent=teddy;
const teddyMuzzle=sph('teddyMuzzle',0,.63,-.145,.14,M.cream);teddyMuzzle.parent=teddy;
for(const x of [-.095,.095]){
 const arm=sph('teddyArm',x*2,.35,0,.17,M.wood);arm.parent=teddy;arm.scaling.y=1.4;
 const foot=sph('teddyFoot',x*1.25,.13,-.05,.17,M.wood2);foot.parent=teddy;foot.scaling.z=1.3;
 const eye=sph('teddyEye',x,.71,-.153,.035,M.dark);eye.parent=teddy;
}
const teddyNose=sph('teddyNose',0,.65,-.225,.045,M.dark);teddyNose.parent=teddy;
const toyBlock1=tag(box('block0',-5.95,.22,-.45,.34,.34,.34,M.blue,true),'toy','Bloco azul',{toy:'block1'});
const toyBlock2=tag(box('block1',-5.55,.22,-.45,.34,.34,.34,M.yellow,true),'toy','Bloco amarelo',{toy:'block2'});
const toyBlock3=tag(box('block2',-5.15,.22,-.45,.34,.34,.34,M.mint,true),'toy','Bloco verde',{toy:'block3'}); box('starPic',-5.2,2.1,.0,1.45,.95,.05,M.white); ['#f4cb5d','#f2acc3','#80c8dc'].forEach((c,i)=>{const st=sph('star'+i,-5.55+i*.35,2.1,-.04,.16,mkMat('st'+i,c)); st.scaling.z=.35;}); box('mobileBar',-5.2,1.95,1.55,.95,.05,.05,M.white); [-5.52,-5.2,-4.88].forEach((x,i)=>{box('mobStr'+i,x,1.76,1.55,.03,.34,.03,M.white); const s=sph('mobBall'+i,x,1.55,1.55,.12,[M.pink,M.yellow,M.blue][i]);});
// bebê animado no berço
const baby=new BABYLON.TransformNode('baby',scene);baby.position.set(-5.2,.67,1.55);
const babyBody=BABYLON.MeshBuilder.CreateCapsule('babyBody',{height:.7,radius:.19,tessellation:8},scene);babyBody.parent=baby;babyBody.position.y=.35;babyBody.material=M.mint;
const babyHead=tag(sph('babyHead',0,.78,0,.38,M.skin,true),'baby','Bebê');babyHead.parent=baby;const babyHair=sph('babyHair',0,.89,.01,.4,M.hair);babyHair.parent=baby;babyHair.scaling.y=.45;
const babyArmL=box('babyArmL',-.27,.42,0,.12,.46,.12,M.skin);babyArmL.parent=baby;babyArmL.rotation.z=-.35;const babyArmR=box('babyArmR',.27,.42,0,.12,.46,.12,M.skin);babyArmR.parent=baby;babyArmR.rotation.z=.35;
const babyMood=sph('babyMood',0,1.22,0,.15,M.yellow);babyMood.parent=baby;
// CACHORRO + caminha + pote
box('dogBed',2.4,.13,-2.75,1.5,.22,1.05,M.mint2);const dog=new BABYLON.TransformNode('dog',scene);dog.position.set(2.4,0,-2.6);
const dogBody=box('dogBody',0,.42,0,.78,.5,.38,M.dog);dogBody.parent=dog;const dogHead=tag(sph('dogHead',.46,.54,0,.42,M.dog,true),'dog','Cachorro');dogHead.parent=dog;const muzzle=sph('muzzle',.63,.48,0,.18,M.cream);muzzle.parent=dog;const nose=sph('nose',.72,.52,0,.08,M.dark);nose.parent=dog;const ear1=sph('ear1',.39,.76,.14,.17,M.dogDark);ear1.parent=dog;const ear2=sph('ear2',.39,.76,-.14,.17,M.dogDark);ear2.parent=dog;
const tail=box('tail',-.52,.52,0,.34,.08,.08,M.dogDark);tail.parent=dog;tail.rotation.z=.75;const dogLegs=[];[[-.22,.18,.14],[-.22,.18,-.14],[.2,.18,.14],[.2,.18,-.14]].forEach(([x,y,z],i)=>{const l=box('dogLeg'+i,x,y,z,.09,.28,.09,M.dog);l.parent=dog;dogLegs.push(l)});
const dogBowl=tag(cyl('dogBowl',3.9,.16,-2.7,.78,.20,M.blue,true),'bowl','Pote do cachorro');dogBowl.scaling.y=.55;
const foodBag=tag(box('foodBag',1.15,.58,3.72,.52,1.0,.42,M.orange,true),'foodBag','Ração',{item:'food'});box('foodLabel',1.15,.6,3.49,.35,.42,.03,M.cream);
// itens da missão do bebê
const babyBottle=tag(cyl('babyBottle',2.15,1.24,3.72,.18,.46,M.white,true),'babyBottle','Mamadeira');
const bottleCap=cyl('bottleCap',2.15,1.50,3.72,.14,.10,M.pink);bottleCap.parent=babyBottle; bottleCap.position.set(0,.28,0);
const nightLampBase=cyl('nightLampBase',-4.35,.42,3.55,.42,.32,M.wood2);
const nightLamp=tag(box('nightLamp',-4.35,.88,3.55,.68,.52,.68,M.cream,true),'lamp','Abajur');
const nightLight=new BABYLON.PointLight('nightLight',new BABYLON.Vector3(-4.35,1.25,3.55),scene);nightLight.diffuse=BABYLON.Color3.FromHexString('#ffdca0');nightLight.intensity=0;nightLight.range=4.5;


// ===== v1.1: objetos das novas missões =====
const dishRack=tag(box('dishRack',3.18,1.16,3.62,.65,.18,.52,M.white,true),'dishRack','Escorredor');
const dirtyPlate=tag(cyl('dirtyPlate',2.20,1.19,.45,.58,.07,M.cream,true),'dish','Prato sujo');
dirtyPlate.rotation.x=Math.PI/2;dirtyPlate.isVisible=false;
const cleanPlate=box('cleanPlate',3.18,1.34,3.62,.46,.06,.42,M.white);cleanPlate.isVisible=false;

const looseCush1=tag(box('looseCush1',-.15,.30,-1.25,.62,.22,.52,M.pink,true),'cushion','Almofada rosa',{which:'pink'});
const looseCush2=tag(box('looseCush2',-.90,.30,-1.45,.62,.22,.52,M.yellow,true),'cushion','Almofada amarela',{which:'yellow'});
const sofaMissionTarget=tag(box('sofaMissionTarget',-.80,.80,2.02,2.3,.62,.68,M.white,true),'sofaMission','Sofá');
sofaMissionTarget.visibility=.001;sofaMissionTarget.isVisible=false;

const cleaningCloth=tag(box('cleaningCloth',5.55,1.24,3.72,.46,.05,.38,M.mint,true),'cloth','Pano de limpeza');
cleaningCloth.isVisible=false;
const spill=tag(cyl('spill',.55,.035,-.75,1.0,.025,M.blue,true),'spill','Sujeira no chão');
spill.scaling.z=.55;spill.isVisible=false;

const curtainL=box('curtainL',-6.05,1.65,4.64,1.10,2.5,.07,M.pink);
const curtainR=box('curtainR',-4.35,1.65,4.64,1.10,2.5,.07,M.pink);
const curtainTarget=tag(box('curtainTarget',-5.20,1.55,4.57,2.8,2.6,.08,M.white,true),'curtain','Cortinas');
curtainTarget.visibility=.001;curtainTarget.isVisible=false;
const sleepBlanket=tag(box('sleepBlanket',-5.20,.73,1.55,1.72,.08,.72,M.mint,true),'blanket','Cobertor');
sleepBlanket.isVisible=false;
const dogBandana=box('dogBandana',.18,.60,0,.22,.13,.32,M.red);dogBandana.parent=dog;dogBandana.isVisible=false;
const rewardStar=box('rewardStar',-.60,2.38,4.67,.55,.55,.04,M.yellow);rewardStar.rotation.z=.78;rewardStar.isVisible=false;

// PERSONAGEM CARTOON
const player=new BABYLON.TransformNode('player',scene);player.position.set(0,0,-3.2);
const torso=BABYLON.MeshBuilder.CreateCapsule('torso',{height:1.0,radius:.30,tessellation:10},scene);torso.parent=player;torso.position.y=.92;torso.material=M.pink;
const skirt=BABYLON.MeshBuilder.CreateCylinder('skirt',{diameterTop:.58,diameterBottom:.82,height:.48,tessellation:10},scene);skirt.parent=player;skirt.position.y=.58;skirt.material=M.pink2;
const pHead=sph('pHead',0,1.72,0,.52,M.skin);pHead.parent=player;const pHair=sph('pHair',0,1.84,.025,.55,M.hair);pHair.parent=player;pHair.scaling.y=.62;
const pony=sph('pony',-.28,1.84,.05,.26,M.hair);pony.parent=player;
const armL=box('armL',-.38,1.04,0,.13,.68,.13,M.skin);armL.parent=player;const armR=box('armR',.38,1.04,0,.13,.68,.13,M.skin);armR.parent=player;
const legL=box('legL',-.18,.27,0,.16,.64,.18,M.skin);legL.parent=player;const legR=box('legR',.18,.27,0,.16,.64,.18,M.skin);legR.parent=player;box('shoeL',-.18,.04,.08,.25,.14,.38,M.white).parent=player;box('shoeR',.18,.04,.08,.25,.14,.38,M.white).parent=player;

// --- CharacterController v1.1: cápsula lógica usando colisão nativa Babylon ---
const playerCollider=BABYLON.MeshBuilder.CreateBox('playerCollider',{size:.08},scene);
playerCollider.isVisible=false;playerCollider.isPickable=false;playerCollider.position.copyFrom(player.position);
playerCollider.ellipsoid=new BABYLON.Vector3(.34,.86,.34);
playerCollider.ellipsoidOffset=new BABYLON.Vector3(0,.86,0);
function markCollision(mesh){if(mesh){mesh.checkCollisions=true;mesh.isPickable=mesh.isPickable||false}return mesh}
[
 'backWall','leftWall','rightWall','divider','counter','table','sofaBase','coffee','rack','wardrobe',
 'cribBase','cribHead','cribFoot','toybox','dogBed','stove'
].forEach(name=>scene.getMeshesByTags?0:0);
scene.meshes.forEach(m=>{
 if(['backWall','leftWall','rightWall','divider','counter','table','sofaBase','coffee','rack','wardrobe','cribBase','cribHead','cribFoot','toybox','dogBed','stove'].includes(m.name)) markCollision(m);
});

// sombras
const shadow=new BABYLON.ShadowGenerator((isMobile&&lowMemory)?512:1024,sun);shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=isMobile?8:16;[torso,skirt,pHead,armL,armR,legL,legR,dogBody,dogHead,babyBody,babyHead].forEach(m=>shadow.addShadowCaster(m));applyQuality();
const pShadow=discShadow(0,-3.2,1.1,1.5,.18);const dShadow=discShadow(2.4,-2.6,.95,1.25,.16);const bShadow=discShadow(-5.2,1.55,1.1,1.2,.12);
// indicadores
const marker=BABYLON.MeshBuilder.CreateTorus('marker',{diameter:.7,thickness:.075,tessellation:24},scene);marker.rotation.x=Math.PI/2;marker.position.y=.03;marker.material=M.mint2;marker.isVisible=false;
const targetRing=BABYLON.MeshBuilder.CreateTorus('targetRing',{diameter:1.0,thickness:.06,tessellation:28},scene);targetRing.rotation.x=Math.PI/2;targetRing.material=M.yellow;targetRing.isPickable=false;
const arrow=BABYLON.MeshBuilder.CreateCylinder('arrow',{diameterTop:0,diameterBottom:.36,height:.55,tessellation:3},scene);arrow.material=M.yellow;arrow.rotation.z=Math.PI/2;arrow.isPickable=false;
const hl=new BABYLON.HighlightLayer('highlight',scene,{blurHorizontalSize:1.2,blurVerticalSize:1.2});
// missões
const missions=[
 {title:'CAFÉ DA MANHÃ',icon:'🥣',reward:15,done:'Café da manhã prontinho!',steps:[
  {text:'Abra a geladeira.',need:'fridgeOpen',target:()=>fridgeDoor},
  {text:'Pegue o leite.',need:'milkHeld',target:()=>milk},
  {text:'Coloque o leite na mesa.',need:'milkTable',target:()=>table},
  {text:'Pegue o pão.',need:'breadHeld',target:()=>bread},
  {text:'Coloque o pão na torradeira.',need:'breadToaster',target:()=>toaster},
  {text:'Ligue a torradeira.',need:'toasterOn',target:()=>toaster},
  {text:'Pegue a torrada.',need:'toastHeld',target:()=>toast},
  {text:'Leve a torrada para a mesa.',need:'toastTable',target:()=>table}
 ]},
 {title:'HORA DO CACHORRO',icon:'🐶',reward:20,done:'Cachorrinho feliz e alimentado!',steps:[
  {text:'Pegue o saco de ração.',need:'foodHeld',target:()=>foodBag},
  {text:'Leve a ração até o pote.',need:'foodNearBowl',target:()=>dogBowl},
  {text:'Encha o pote de ração.',need:'bowlFilled',target:()=>dogBowl},
  {text:'Espere o cachorro comer.',need:'dogAte',target:()=>dogHead},
  {text:'Faça carinho no cachorro.',need:'dogPetted',target:()=>dogHead}
 ]},
 {title:'HORA DO BEBÊ',icon:'👶',reward:25,done:'Bebê alimentado, com ursinho e prontinho para descansar!',steps:[
  {text:'Pegue a mamadeira na cozinha.',need:'bottleHeld',target:()=>babyBottle},
  {text:'Leve a mamadeira para o bebê.',need:'babyFed',target:()=>babyHead},
  {text:'Pegue o ursinho no quarto.',need:'teddyHeld',target:()=>teddyBody},
  {text:'Coloque o ursinho no berço.',need:'teddyInCrib',target:()=>cribMattress},
  {text:'Ligue o abajur.',need:'lampOn',target:()=>nightLamp},
  {text:'Faça carinho no bebê.',need:'babyPetted',target:()=>babyHead}
 ]},
 {title:'GUARDAR BRINQUEDOS',icon:'🧸',reward:25,done:'Quarto arrumadinho! Os brinquedos estão no baú.',steps:[
  {text:'Pegue a bola.',need:'toyBallHeld',target:()=>toyBall},
  {text:'Guarde a bola no baú.',need:'toyBallStored',target:()=>toyLid},
  {text:'Pegue o bloco azul.',need:'toyBlockHeld',target:()=>toyBlock1},
  {text:'Guarde o bloco no baú.',need:'toyBlockStored',target:()=>toyLid},
  {text:'Feche o baú.',need:'toyboxClosed',target:()=>toyLid}
 ]},
 {title:'REGAR A PLANTA',icon:'🪴',reward:30,done:'A plantinha ficou feliz e bem molhada!',steps:[
  {text:'Pegue o regador.',need:'canHeld',target:()=>canBody},
  {text:'Ligue a torneira.',need:'faucetOn',target:()=>tap},
  {text:'Encha o regador.',need:'canFilled',target:()=>tap},
  {text:'Feche a torneira.',need:'faucetOff',target:()=>tap},
  {text:'Regue a planta.',need:'plantWatered',target:()=>plant}
 ]},
 {title:'LAVAR A LOUÇA',icon:'🍽️',reward:35,done:'Prato limpinho e guardado!',steps:[
  {text:'Pegue o prato sujo na mesa.',need:'dishHeld',target:()=>dirtyPlate},
  {text:'Leve o prato até a pia.',need:'dishSink',target:()=>sink},
  {text:'Ligue a torneira.',need:'dishWaterOn',target:()=>tap},
  {text:'Lave o prato.',need:'dishWashed',target:()=>sink},
  {text:'Coloque o prato no escorredor.',need:'dishRack',target:()=>dishRack}
 ]},
 {title:'ARRUMAR O SOFÁ',icon:'🛋️',reward:30,done:'Sala arrumadinha e confortável!',steps:[
  {text:'Pegue a almofada rosa.',need:'cushionPinkHeld',target:()=>looseCush1},
  {text:'Coloque a almofada rosa no sofá.',need:'cushionPinkPlaced',target:()=>sofaMissionTarget},
  {text:'Pegue a almofada amarela.',need:'cushionYellowHeld',target:()=>looseCush2},
  {text:'Coloque a almofada amarela no sofá.',need:'cushionYellowPlaced',target:()=>sofaMissionTarget}
 ]},
 {title:'BRINCAR COM O CACHORRO',icon:'🎾',reward:35,done:'Brincadeira feita. Cachorrinho super feliz!',steps:[
  {text:'Pegue a bola do cachorro.',need:'dogBallHeld',target:()=>toyBall},
  {text:'Jogue a bola para o cachorro.',need:'dogBallThrown',target:()=>dogHead},
  {text:'Espere ele buscar a bola.',need:'dogFetched',target:()=>dogHead},
  {text:'Faça carinho no cachorro.',need:'dogPlayPetted',target:()=>dogHead}
 ]},
 {title:'LIMPAR A SALA',icon:'🧽',reward:35,done:'Tudo limpinho de novo!',steps:[
  {text:'Pegue o pano de limpeza.',need:'clothHeld',target:()=>cleaningCloth},
  {text:'Vá até a sujeira.',need:'spillReached',target:()=>spill},
  {text:'Limpe a sujeira.',need:'spillCleaned',target:()=>spill},
  {text:'Guarde o pano na bancada.',need:'clothReturned',target:()=>counterTop}
 ]},
 {title:'HORA DE DORMIR',icon:'🌙',reward:45,done:'Casa tranquila e bebê dormindo!',steps:[
  {text:'Feche as cortinas do quarto.',need:'curtainsClosed',target:()=>curtainTarget},
  {text:'Ligue o abajur.',need:'sleepLampOn',target:()=>nightLamp},
  {text:'Puxe o cobertor para o bebê.',need:'blanketTucked',target:()=>sleepBlanket},
  {text:'Faça um carinho de boa noite.',need:'goodnightPet',target:()=>babyHead},
  {text:'Diga boa noite.',need:'goodnightDone',target:()=>babyHead}
 ]}
];

const SAVE_KEY='jogo_hanna_v11_save',SAVE_SCHEMA=2;
function loadSaveData(){
 let s=null;try{s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}
 if(!s){
   s={schema:SAVE_SCHEMA,missionIndex:Number(localStorage.getItem('hanna_mission')||0),step:Number(localStorage.getItem('hanna_step')||0),
      coins:Number(localStorage.getItem('hanna_coins')||0),stars:0,completed:[],achievements:[],gameHour:8};
 }
 s.schema=SAVE_SCHEMA;s.completed=Array.isArray(s.completed)?s.completed:[];s.achievements=Array.isArray(s.achievements)?s.achievements:[];
 return s;
}
let saveData=loadSaveData();
let missionIndex=Math.max(0,Math.min(Number(saveData.missionIndex)||0,missions.length-1));
let step=Math.max(0,Number(saveData.step)||0);
if(step>=missions[missionIndex].steps.length)step=0;
let coins=Math.max(0,Number(saveData.coins)||0),stars=Math.max(0,Number(saveData.stars)||0);
let completedMissions=new Set(saveData.completed||[]),achievements=new Set(saveData.achievements||[]);
let gameHour=Number.isFinite(Number(saveData.gameHour))?Number(saveData.gameHour):8;

let held=null,fridgeOpen=false,breadInToaster=false,toasterReady=false,foodAtBowl=false,bowlFilled=false,dogAte=false,babyFed=false,teddyInCrib=false,lampOn=false,babyPetted=false,toyboxOpen=false,faucetOn=false,toyBallStored=false,toyBlockStored=false,canFilled=false,plantWatered=false,dishInSink=false,dishWashed=false,cushionPinkPlaced=false,cushionYellowPlaced=false,dogBallThrown=false,dogFetched=false,spillCleaned=false,curtainsClosed=false,blanketTucked=false,goodnightDone=false,moveTarget=null,near=null,playing=false,walkPhase=0,idlePhase=0,fx=[];

const LOCAL_BR_VOICES={};
let localVoiceAudio=null;
function playLocalBR(text,onend){
 const src=LOCAL_BR_VOICES[text];if(!src)return false;
 try{
   if(localVoiceAudio){localVoiceAudio.pause();localVoiceAudio=null}
   localVoiceAudio=new Audio(src);localVoiceAudio.volume=.88;
   localVoiceAudio.onended=()=>{localVoiceAudio=null;onend?.()};
   localVoiceAudio.onerror=()=>{localVoiceAudio=null;onend?.()};
   localVoiceAudio.play().catch(()=>onend?.());
   return true;
 }catch(e){return false}
}

let audioEnabled=localStorage.getItem('hanna_audio')!=='0';
let brVoice=null,voiceReady=false,audioCtx=null,speechHideTimer=null;
function refreshVoice(){
 if(!('speechSynthesis'in window))return;
 const voices=speechSynthesis.getVoices()||[];
 const br=voices.filter(v=>/^pt-BR$/i.test(v.lang));
 brVoice=
   br.find(v=>/(Francisca|Antonio|Luciana|Google.*Portugu|Microsoft.*Portugu|Brazil)/i.test(v.name)) ||
   br[0] ||
   voices.find(v=>/^pt/i.test(v.lang)) || null;
 voiceReady=!!voices.length;
}
refreshVoice();
if('speechSynthesis'in window){
 speechSynthesis.onvoiceschanged=refreshVoice;
 setTimeout(refreshVoice,400);
}
function setAudioUI(){
 if(!ui.audioBtn)return;
 ui.audioBtn.textContent=audioEnabled?'🔊':'🔇';
 ui.audioBtn.classList.toggle('off',!audioEnabled);
}
function showSpeech(t,avatar='👧🏻',ms=2600){
 if(!ui.speechBubble)return;
 ui.speechAvatar.textContent=avatar;ui.speechText.textContent=t;
 ui.speechBubble.classList.add('show');
 clearTimeout(speechHideTimer);
 speechHideTimer=setTimeout(()=>ui.speechBubble.classList.remove('show'),ms);
}
function speak(t,{avatar='👧🏻',rate=.93,pitch=1.04,interrupt=true}={}){
 if(!t)return;
 showSpeech(t,avatar,Math.max(1800,Math.min(5200,t.length*55)));
 if(!audioEnabled)return;
 refreshVoice();
 const preferLocal=(!navigator.onLine)||!brVoice||!('speechSynthesis'in window);
 if(preferLocal&&playLocalBR(t))return;
 if(!('speechSynthesis'in window)){playLocalBR(t);return}
 if(interrupt)speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(t);
 u.lang='pt-BR';u.rate=rate;u.pitch=pitch;u.volume=1;
 if(brVoice)u.voice=brVoice;
 speechSynthesis.speak(u);
}
function speakSequence(parts){
 if(!parts?.length)return;
 const clean=parts.filter(x=>x&&x.text);
 if(!clean.length)return;
 if(!audioEnabled){const last=clean[clean.length-1];showSpeech(last.text,last.avatar||'👧🏻');return;}
 if(!('speechSynthesis'in window)||!navigator.onLine){let i=0;const n=()=>{if(i>=clean.length)return;const p=clean[i++];showSpeech(p.text,p.avatar||'👧🏻');if(!playLocalBR(p.text,()=>setTimeout(n,p.pause??180)))setTimeout(n,900)};n();return;}
 speechSynthesis.cancel();refreshVoice();
 let i=0;
 const next=()=>{
   if(i>=clean.length)return;
   const p=clean[i++];
   showSpeech(p.text,p.avatar||'👧🏻',Math.max(1600,Math.min(4500,p.text.length*52)));
   const u=new SpeechSynthesisUtterance(p.text);u.lang='pt-BR';u.rate=p.rate||.94;u.pitch=p.pitch||1.04;
   if(brVoice)u.voice=brVoice;u.onend=()=>setTimeout(next,p.pause??180);speechSynthesis.speak(u);
 };
 next();
}
function ensureAudio(){
 if(!audioEnabled)return null;
 if(!audioCtx){
   const C=window.AudioContext||window.webkitAudioContext;
   if(C)audioCtx=new C();
 }
 if(audioCtx?.state==='suspended')audioCtx.resume();
 return audioCtx;
}
function tone(freq=440,dur=.12,type='sine',vol=.06,delay=0){
 const c=ensureAudio();if(!c)return;
 const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;
 const t=c.currentTime+delay;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);
 g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03);
}
function sfx(name){
 if(!audioEnabled)return;
 switch(name){
  case 'click':tone(620,.055,'sine',.035);break;
  case 'pickup':tone(520,.07,'sine',.045);tone(760,.09,'sine',.04,.065);break;
  case 'success':tone(660,.08,'sine',.045);tone(880,.11,'sine',.05,.08);break;
  case 'door':tone(120,.13,'triangle',.04);tone(165,.10,'triangle',.025,.08);break;
  case 'ding':tone(880,.12,'sine',.055);tone(1320,.18,'sine',.045,.1);break;
  case 'water':tone(240,.06,'triangle',.025);tone(330,.08,'sine',.018,.04);break;
  case 'bark':tone(185,.09,'square',.035);tone(145,.10,'square',.03,.095);break;
  case 'baby':tone(620,.08,'sine',.035);tone(760,.09,'sine',.035,.09);tone(900,.10,'sine',.03,.18);break;
  case 'fanfare':tone(523,.10,'sine',.045);tone(659,.12,'sine',.05,.11);tone(784,.18,'sine',.055,.23);tone(1046,.24,'sine',.045,.38);break;
 }
}
const feedbackBR={
 fridgeOpen:'Boa! A geladeira abriu.',
 milkHeld:'Isso! Agora leva o leite pra mesa.',
 milkTable:'Perfeito. O leite já está na mesa.',
 breadHeld:'Muito bem! Pegou o pão.',
 breadToaster:'Boa! O pão está na torradeira.',
 toasterOn:'Pronto, agora é só esperar a torrada.',
 toastHeld:'Oba! A torrada ficou pronta.',
 toastTable:'Café da manhã prontinho!',
 foodHeld:'Boa! Vamos levar a ração pro cachorrinho.',
 foodNearBowl:'Chegamos no pote. Agora coloca a ração.',
 bowlFilled:'Pote cheio! Agora deixa ele comer.',
 dogAte:'Nhac nhac! Ele gostou.',
 dogPetted:'Aí sim! Um carinho pra fechar.',
 bottleHeld:'Pegou a mamadeira. Agora vamos até o bebê.',
 babyFed:'Muito bem! O bebê tomou a mamadeira.',
 teddyHeld:'Achou o ursinho!',
 teddyInCrib:'Pronto, o ursinho ficou no berço.',
 lampOn:'Luzinha acesa. Agora ficou aconchegante.',
 babyPetted:'Que carinho gostoso!',
 toyBallHeld:'Pegou a bola. Bora guardar.',
 toyBallStored:'Boa! Bola guardada.',
 toyBlockHeld:'Agora o bloco azul.',
 toyBlockStored:'Muito bem! Mais um brinquedo guardado.',
 toyboxClosed:'Quarto arrumado. Mandou bem!',
 canHeld:'Pegou o regador.',
 faucetOn:'Água ligada.',
 canFilled:'Regador cheio.',
 faucetOff:'Boa! Torneira fechada.',
 plantWatered:'Prontinho! A plantinha vai ficar feliz.',
 dishHeld:'Boa! Prato na mão.',
 dishSink:'Chegou na pia.',
 dishWaterOn:'Água ligada. Bora lavar.',
 dishWashed:'Prato limpinho!',
 dishRack:'Pronto, louça resolvida.',
 cushionPinkHeld:'Pegou a primeira almofada.',
 cushionPinkPlaced:'Boa, ficou bonita no sofá.',
 cushionYellowHeld:'Agora a amarela.',
 cushionYellowPlaced:'Sala arrumada!',
 dogBallHeld:'Bola na mão.',
 dogBallThrown:'Vai buscar!',
 dogFetched:'Ele trouxe a bola!',
 dogPlayPetted:'Brincadeira completa.',
 clothHeld:'Pano na mão.',
 spillReached:'Achou a sujeira.',
 spillCleaned:'Tudo limpinho.',
 clothReturned:'Pano guardado.',
 curtainsClosed:'Cortinas fechadas.',
 sleepLampOn:'Luzinha acesa.',
 blanketTucked:'Cobertor no lugar.',
 goodnightPet:'Carinho de boa noite.',
 goodnightDone:'Boa noite!'
};
function spokenStep(){
 const s=currentStep();if(!s)return '';
 const natural={
  fridgeOpen:'Abre a geladeira pra gente.',
  milkHeld:'Agora pega o leite.',
  milkTable:'Leva o leite até a mesa.',
  breadHeld:'Agora pega o pão na bancada.',
  breadToaster:'Coloca o pão na torradeira.',
  toasterOn:'Liga a torradeira.',
  toastHeld:'Pega a torrada que ficou pronta.',
  toastTable:'Leva a torrada pra mesa.',
  foodHeld:'Pega o saco de ração.',
  foodNearBowl:'Leva a ração até o pote do cachorro.',
  bowlFilled:'Coloca a ração no pote.',
  dogAte:'Espera o cachorrinho comer.',
  dogPetted:'Agora faz um carinho nele.',
  bottleHeld:'Pega a mamadeira na cozinha.',
  babyFed:'Leva a mamadeira pro bebê.',
  teddyHeld:'Pega o ursinho no quarto.',
  teddyInCrib:'Coloca o ursinho no berço.',
  lampOn:'Liga o abajur.',
  babyPetted:'Agora faz um carinho no bebê.',
  toyBallHeld:'Pega a bola.',
  toyBallStored:'Guarda a bola no baú.',
  toyBlockHeld:'Pega o bloco azul.',
  toyBlockStored:'Guarda o bloco no baú.',
  toyboxClosed:'Fecha o baú.',
  canHeld:'Pega o regador.',
  faucetOn:'Liga a torneira.',
  canFilled:'Enche o regador.',
  faucetOff:'Agora fecha a torneira.',
  plantWatered:'Leva o regador até a planta e molha ela.',
  dishHeld:'Pega o prato sujo na mesa.',
  dishSink:'Leva o prato até a pia.',
  dishWaterOn:'Liga a torneira para lavar o prato.',
  dishWashed:'Agora lava o prato.',
  dishRack:'Coloca o prato limpo no escorredor.',
  cushionPinkHeld:'Pega a almofada rosa.',
  cushionPinkPlaced:'Coloca a almofada no sofá.',
  cushionYellowHeld:'Agora pega a almofada amarela.',
  cushionYellowPlaced:'Coloca a outra almofada no sofá.',
  dogBallHeld:'Pega a bola do cachorro.',
  dogBallThrown:'Chega perto do cachorro e joga a bola.',
  dogFetched:'Espera ele buscar e trazer a bola.',
  dogPlayPetted:'Faz um carinho no cachorro.',
  clothHeld:'Pega o pano de limpeza.',
  spillReached:'Vai até a sujeira no chão.',
  spillCleaned:'Limpa a sujeira com o pano.',
  clothReturned:'Guarda o pano na bancada.',
  curtainsClosed:'Fecha as cortinas do quarto.',
  sleepLampOn:'Liga o abajur do bebê.',
  blanketTucked:'Puxa o cobertor para o bebê.',
  goodnightPet:'Faz um carinho de boa noite.',
  goodnightDone:'Boa noite, bebê. Dorme bem!'
 };
 return natural[s.need]||s.text;
}


// ===== NPC State System: simples, determinístico e leve para mobile =====
class NeedsNPC{
 constructor(kind,values){this.kind=kind;this.hunger=values.hunger;this.energy=values.energy;this.fun=values.fun;this.state='feliz';this.acc=0}
 event(name){
  if(name==='feed')this.hunger=Math.min(100,this.hunger+65);
  if(name==='pet')this.fun=Math.min(100,this.fun+35);
  if(name==='play')this.fun=Math.min(100,this.fun+70);
  if(name==='sleep')this.energy=Math.min(100,this.energy+80);
  this.derive();
 }
 update(dt){
  this.acc+=dt;if(this.acc<1)return;const t=this.acc;this.acc=0;
  this.hunger=Math.max(0,this.hunger-t*.33);
  this.energy=Math.max(0,this.energy-t*.18);
  this.fun=Math.max(0,this.fun-t*.22);
  this.derive();
 }
 derive(){
  const old=this.state;
  if(this.energy<26)this.state='sonolento';
  else if(this.hunger<30)this.state='faminto';
  else if(this.fun<28)this.state='quer brincar';
  else this.state='feliz';
  return old!==this.state;
 }
 emoji(){return this.state==='faminto'?'🍽️':this.state==='sonolento'?'😴':this.state==='quer brincar'?'🎾':'😊'}
}
const babyBrain=new NeedsNPC('baby',{hunger:66,energy:72,fun:75});
const dogBrain=new NeedsNPC('dog',{hunger:62,energy:82,fun:68});
function updateNpcHud(){
 ui.dogState.textContent=`🐶 ${dogBrain.emoji()}`;
 ui.babyState.textContent=`👶 ${babyBrain.emoji()}`;
}

function currentMission(){return missions[missionIndex]}function currentStep(){return currentMission().steps[step]}function targetObject(){return currentStep()?.target?.()||null}
function save(){
 saveData={schema:SAVE_SCHEMA,missionIndex,step,coins,stars,completed:[...completedMissions],achievements:[...achievements],gameHour};
 localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));
 localStorage.setItem('hanna_mission',String(missionIndex));
 localStorage.setItem('hanna_step',String(step));
 localStorage.setItem('hanna_coins',String(coins));
}

function unlockAchievement(id,label,emoji='🏆'){
 if(achievements.has(id))return;
 achievements.add(id);save();
 ui.unlockToast.textContent=`${emoji} Desbloqueado: ${label}`;
 ui.unlockToast.classList.add('show');clearTimeout(unlockAchievement.t);
 unlockAchievement.t=setTimeout(()=>ui.unlockToast.classList.remove('show'),2400);
}
function applyUnlocks(){
 dogBandana.isVisible=completedMissions.size>=2;
 rewardStar.isVisible=completedMissions.size>=4;
}
function progressionAfterMission(){
 const id=currentMission().title;
 if(!completedMissions.has(id)){completedMissions.add(id);stars++;}
 const n=completedMissions.size;
 if(n===1)unlockAchievement('primeira_missao','Primeira missão','⭐');
 if(n===2)unlockAchievement('amiga_pet','Bandana do cachorro','🐶');
 if(n===4)unlockAchievement('casa_estrela','Estrela da casa','🏡');
 if(n===7)unlockAchievement('super_ajudante','Super ajudante','🏆');
 if(n===10)unlockAchievement('casa_viva','Casa Viva completa','🌙');
 applyUnlocks();
}

function showToast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>ui.toast.classList.remove('show'),1200)}
function heldLabel(v){
 const map={milk:'🥛 Leite',bread:'🍞 Pão',toast:'🍞 Torrada',food:'🦴 Ração',bottle:'🍼 Mamadeira',teddy:'🧸 Ursinho',
 toyBall:'⚽ Bola',toyBlock:'🟦 Bloco',can:'💧 Regador',dish:'🍽️ Prato',cushionPink:'🛋️ Almofada rosa',
 cushionYellow:'🛋️ Almofada amarela',dogBall:'🎾 Bola',cloth:'🧽 Pano'};
 return map[v]||v;
}
function hud(say=false){
 const m=currentMission(),s=currentStep();ui.missionTitle.textContent='MISSÃO: '+m.title;ui.missionIcon.textContent=m.icon;
 ui.instruction.textContent=s?s.text:'Muito bem!';ui.stepText.textContent=`${Math.min(step+1,m.steps.length)}/${m.steps.length}`;
 ui.fill.style.width=`${Math.min(step,m.steps.length)/m.steps.length*100}%`;ui.coins.textContent=coins;ui.stars.textContent=stars;
 ui.held.style.display=held?'block':'none';ui.held.textContent=held?`Na mão: ${heldLabel(held)}`:'';
 updateHighlight();if(say&&s)speak(spokenStep());
}
function burstAt(pos,color='#ffd766'){for(let i=0;i<12;i++){const b=BABYLON.MeshBuilder.CreatePolyhedron('fx',{type:1,size:.10},scene);b.position.copyFrom(pos);b.position.y+=.4;b.material=mkMat('fxm'+performance.now()+i,color);fx.push({m:b,v:new BABYLON.Vector3((Math.random()-.5)*.055,.045+Math.random()*.05,(Math.random()-.5)*.055),life:38+Math.random()*15,spin:(Math.random()-.5)*.2})}}
function confetti(){const c=$('#confetti');c.innerHTML='';const colors=['#f8c95f','#f4a8c2','#75c9df','#83c98c','#a98dda','#ff8c6f'];for(let i=0;i<70;i++){const e=document.createElement('i');e.className='conf';e.style.left=(Math.random()*100)+'vw';e.style.top=(-10-Math.random()*30)+'vh';e.style.background=colors[i%colors.length];e.style.animationDelay=(Math.random()*.35)+'s';e.style.animationDuration=(1.05+Math.random()*.75)+'s';c.appendChild(e)}setTimeout(()=>c.innerHTML='',2100)}
function completeMission(){
 const m=currentMission();coins+=m.reward;progressionAfterMission();gameHour=(gameHour+.75)%24;save();
 ui.reward.textContent=m.reward;ui.celebrateEmoji.textContent='🎉'+m.icon;
 ui.celebrateTitle.textContent='Muito bem!';ui.celebrateText.textContent=m.done+'  ⭐ +1';
 ui.continueBtn.textContent=missionIndex<missions.length-1?'Próxima missão':'Jogar de novo';
 ui.celebrate.style.display='flex';confetti();sfx('fanfare');
 speak(`Mandou muito bem! ${m.done} Você ganhou ${m.reward} moedas e uma estrela.`,{pitch:1.03});
}
function advance(code,atMesh=null){
 const s=currentStep();if(!s||s.need!==code)return;
 const p=(atMesh||targetObject())?.getAbsolutePosition?.()||player.position;burstAt(p.clone(),'#ffd66c');sfx('success');
 step++;
 if(step>=currentMission().steps.length){ui.fill.style.width='100%';save();setTimeout(completeMission,500);return}
 save();hud(false);
 speakSequence([{text:feedbackBR[code]||'Muito bem!',avatar:'👧🏻',pause:220},{text:spokenStep(),avatar:'👧🏻'}]);
}
function resetAll(){if(confirm('Recomeçar as missões? Moedas, estrelas e conquistas também serão zeradas.')){[SAVE_KEY,'hanna_mission','hanna_step','hanna_coins'].forEach(k=>localStorage.removeItem(k));location.reload()}}
$('#voiceBtn').onclick=()=>{sfx('click');speak(spokenStep()||'Muito bem!')};
ui.audioBtn.onclick=()=>{
 audioEnabled=!audioEnabled;localStorage.setItem('hanna_audio',audioEnabled?'1':'0');
 if(!audioEnabled&&'speechSynthesis'in window)speechSynthesis.cancel();
 setAudioUI();if(audioEnabled){ensureAudio();sfx('click');speak('Áudio ligado.',{rate:.96})}
 else showSpeech('Áudio desligado.','🔇',1500);
};
$('#resetBtn').onclick=resetAll;
setAudioUI();
$('#playBtn').onclick=async()=>{
 ui.start.style.display='none';playing=true;ensureAudio();sfx('click');
 try{if(screen.orientation?.lock&&isStandalone())await screen.orientation.lock('landscape')}catch(e){}
 setTimeout(()=>speakSequence([
  {text:'Oi! Bora brincar na Casa da Hanna?',avatar:'👧🏻',pause:250},
  {text:spokenStep(),avatar:'👧🏻'}
 ]),220);
};
ui.continueBtn.onclick=()=>{
 sfx('click');ui.celebrate.style.display='none';
 if(missionIndex<missions.length-1){
   missionIndex++;step=0;held=null;save();prepareMission();hud(false);
   speakSequence([{text:`Agora vamos para: ${currentMission().title.toLowerCase()}.`,avatar:'👧🏻',pause:220},{text:spokenStep(),avatar:'👧🏻'}]);
 }else{missionIndex=0;step=0;save();location.reload()}
};

let playerActionUntil=0;
function performPlayerAction(kind='use'){
 playerActionUntil=performance.now()+520;
 // If imported asset has a matching clip, use it once.
 if(playerAsset?.loaded){
   const words=kind==='pickup'?['pick','grab','interact']:kind==='pet'?['pet','interact','wave']:['interact','wave'];
   const g=(playerAsset.groups||[]).find(a=>words.some(w=>a.name.toLowerCase().includes(w)));
   if(g){try{(playerAsset.groups||[]).forEach(a=>a.stop());g.start(false,1.08,g.from,g.to,false);playerAsset.current=g.name;return}catch(e){}}
 }
 // Universal fallback: a small physical gesture, visible even with generic models.
 const base=player.scaling.clone();
 const a=new BABYLON.Animation('act','scaling',60,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
 a.setKeys([{frame:0,value:base},{frame:8,value:new BABYLON.Vector3(base.x*1.04,base.y*.94,base.z*1.04)},{frame:16,value:base}]);
 player.animations=[a];scene.beginAnimation(player,0,16,false);
}

function tween(mesh,property,from,to,frames=18,done){
 const a=new BABYLON.Animation('t',property,60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
 a.setEasingFunction(new BABYLON.CubicEase());
 a.getEasingFunction().setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
 a.setKeys([{frame:0,value:from},{frame:frames,value:to}]);
 mesh.animations=[a];scene.beginAnimation(mesh,0,frames,false,1,done)
}
function bounceY(mesh,amount=.16,frames=16){
 const y=mesh.position.y;
 const a=new BABYLON.Animation('bounce','position.y',60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
 const e=new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT); a.setEasingFunction(e);
 a.setKeys([{frame:0,value:y},{frame:frames/2,value:y+amount},{frame:frames,value:y}]);
 mesh.animations=[a];scene.beginAnimation(mesh,0,frames,false);
}
function popScale(mesh,frames=14){
 const base=mesh.scaling.clone();
 const a=new BABYLON.Animation('pop','scaling',60,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
 a.setKeys([{frame:0,value:base},{frame:frames/2,value:base.scale(1.16)},{frame:frames,value:base}]);
 mesh.animations=[a];scene.beginAnimation(mesh,0,frames,false);
}
function placeTable(item){const m=item==='milk'?milk:toast;m.position.set(item==='milk'?1.62:2.35,1.24,.45);m.isVisible=true;m.isPickable=false;held=null;hud()}
function prepareDogMission(){foodBag.isVisible=true;foodBag.isPickable=true;dogBowl.material=M.blue;foodAtBowl=false;bowlFilled=false;dogAte=false;dog.position.set(2.4,0,-2.6);camera.radius=13}
function prepareBabyMission(){
  babyBottle.isVisible=true;babyBottle.isPickable=true;teddy.setEnabled(true);teddyBody.isPickable=true;
  babyFed=false;teddyInCrib=false;lampOn=false;babyPetted=false;nightLight.intensity=0;nightLamp.material=M.cream;
  babyMood.material=M.yellow;camera.radius=13;
}
function prepareToyMission(){
  toyBall.isVisible=true;toyBall.isPickable=true;toyBlock1.isVisible=true;toyBlock1.isPickable=true;toyBlock2.isVisible=true;toyBlock3.isVisible=true;
  toyBallStored=false;toyBlockStored=false;toyboxOpen=true;toyHinge.rotation.x=-1.15;
}
function preparePlantMission(){
  wateringCan.setEnabled(true);canBody.isPickable=true;canFilled=false;plantWatered=false;faucetOn=false;waterStream.isVisible=false;
}
function hideV11MissionItems(){
 dirtyPlate.isVisible=false;cleanPlate.isVisible=false;looseCush1.isVisible=false;looseCush2.isVisible=false;sofaMissionTarget.isVisible=false;
 cleaningCloth.isVisible=false;spill.isVisible=false;curtainTarget.isVisible=false;sleepBlanket.isVisible=false;
}
function prepareDishMission(){
 hideV11MissionItems();dirtyPlate.isVisible=true;dirtyPlate.isPickable=true;dishRack.isPickable=true;dishInSink=false;dishWashed=false;
 faucetOn=false;waterStream.isVisible=false;cleanPlate.isVisible=false;
}
function prepareSofaMission(){
 hideV11MissionItems();looseCush1.isVisible=true;looseCush1.isPickable=true;looseCush2.isVisible=true;looseCush2.isPickable=true;
 sofaMissionTarget.isVisible=true;sofaMissionTarget.visibility=.001;sofaMissionTarget.isPickable=true;cushionPinkPlaced=false;cushionYellowPlaced=false;
}
function prepareDogPlayMission(){
 hideV11MissionItems();toyBall.isVisible=true;toyBall.isPickable=true;toyBall.position.set(.45,.25,-1.55);dogBallThrown=false;dogFetched=false;
 dogBrain.fun=18;dogBrain.derive();updateNpcHud();dog.position.set(2.4,0,-2.6);
}
function prepareCleanMission(){
 hideV11MissionItems();cleaningCloth.isVisible=true;cleaningCloth.isPickable=true;spill.isVisible=true;spill.isPickable=true;spillCleaned=false;
}
function prepareGoodnightMission(){
 hideV11MissionItems();curtainTarget.isVisible=true;curtainTarget.visibility=.001;curtainTarget.isPickable=true;
 sleepBlanket.isVisible=true;sleepBlanket.isPickable=true;curtainsClosed=false;blanketTucked=false;goodnightDone=false;
 curtainL.position.x=-6.05;curtainR.position.x=-4.35;lampOn=false;nightLight.intensity=0;nightLamp.material=M.cream;
 babyBrain.energy=18;babyBrain.derive();updateNpcHud();gameHour=Math.max(gameHour,19.5);
}

function prepareMission(){hideV11MissionItems();if(missionIndex===1)prepareDogMission();else if(missionIndex===2)prepareBabyMission();else if(missionIndex===3)prepareToyMission();else if(missionIndex===4)preparePlantMission();else if(missionIndex===5)prepareDishMission();else if(missionIndex===6)prepareSofaMission();else if(missionIndex===7)prepareDogPlayMission();else if(missionIndex===8)prepareCleanMission();else if(missionIndex===9)prepareGoodnightMission()}
function restore(){
 // esconde itens exclusivos e então restaura somente a missão atual
 babyBottle.isVisible=false;teddy.setEnabled(false);wateringCan.setEnabled(false);hideV11MissionItems();
 if(missionIndex===0){
   if(step>=1){fridgeOpen=true;fridgeHinge.rotation.y=Math.PI*.58;milk.isVisible=true}
   if(step===2){milk.isVisible=false;held='milk'}
   if(step>=3)placeTable('milk');
   if(step===4){bread.isVisible=false;held='bread'}
   if(step>=5){bread.isVisible=false;breadInToaster=true;held=null}
   if(step>=6){toasterReady=true;toast.isVisible=true}
   if(step===7){toast.isVisible=false;held='toast'}
 }else if(missionIndex===1){
   prepareDogMission();milk.isVisible=false;bread.isVisible=false;toast.isVisible=false;
   if(step===1){foodBag.isVisible=false;held='food'}
   if(step>=2){foodBag.isVisible=false;held=null;foodAtBowl=true;foodBag.position.set(3.35,.55,-2.7);foodBag.isVisible=true;foodBag.isPickable=false}
   if(step>=3){bowlFilled=true;dogBowl.material=M.orange}
   if(step>=4){dogAte=true;dogBowl.material=M.blue}
 }else if(missionIndex===2){
   prepareBabyMission();milk.isVisible=false;bread.isVisible=false;toast.isVisible=false;foodBag.isVisible=false;
   if(step===1){babyBottle.isVisible=false;held='bottle'}
   if(step>=2){babyBottle.isVisible=false;held=null;babyFed=true;babyMood.material=M.mint}
   if(step===3){teddy.setEnabled(false);held='teddy'}
   if(step>=4){held=null;teddyInCrib=true;teddy.setEnabled(true);teddy.position.set(-5.2,.48,1.55);teddy.rotation.y=.3}
   if(step>=5){lampOn=true;nightLight.intensity=.75;nightLamp.material=M.yellow}
   if(step>=6){babyPetted=true;babyMood.material=M.pink}
 }else if(missionIndex===3){
   prepareToyMission();milk.isVisible=false;bread.isVisible=false;toast.isVisible=false;foodBag.isVisible=false;
   if(step===1){toyBall.isVisible=false;held='toyBall'}
   if(step>=2){toyBall.isVisible=false;toyBallStored=true;held=null}
   if(step===3){toyBlock1.isVisible=false;held='toyBlock'}
   if(step>=4){toyBlock1.isVisible=false;toyBlockStored=true;held=null}
   if(step>=5){toyboxOpen=false;toyHinge.rotation.x=0}
 }else if(missionIndex===4){
   preparePlantMission();milk.isVisible=false;bread.isVisible=false;toast.isVisible=false;foodBag.isVisible=false;
   if(step===1){wateringCan.setEnabled(false);held='can'}
   if(step>=2){faucetOn=true;waterStream.isVisible=true}
   if(step>=3){canFilled=true}
   if(step>=4){faucetOn=false;waterStream.isVisible=false}
   if(step>=5){plantWatered=true}
 }else if(missionIndex===5){
   prepareDishMission();if(step===1){dirtyPlate.isVisible=false;held='dish'}if(step>=2){dirtyPlate.isVisible=false;held=null;dishInSink=true}
   if(step>=3){faucetOn=true;waterStream.isVisible=true}if(step>=4){dishWashed=true}if(step>=5){cleanPlate.isVisible=true}
 }else if(missionIndex===6){
   prepareSofaMission();if(step===1){looseCush1.isVisible=false;held='cushionPink'}if(step>=2){cushionPinkPlaced=true;held=null;looseCush1.isVisible=false}
   if(step===3){looseCush2.isVisible=false;held='cushionYellow'}if(step>=4){cushionYellowPlaced=true;held=null;looseCush2.isVisible=false}
 }else if(missionIndex===7){
   prepareDogPlayMission();if(step===1){toyBall.isVisible=false;held='dogBall'}if(step>=2){held=null;dogBallThrown=true;toyBall.isVisible=false}
   if(step>=3){dogFetched=true;toyBall.isVisible=true;toyBall.position.set(2.0,.25,-2.25)}
 }else if(missionIndex===8){
   prepareCleanMission();if(step===1){cleaningCloth.isVisible=false;held='cloth'}if(step>=2){held='cloth'}if(step>=3){spill.isVisible=false;spillCleaned=true}if(step>=4){held=null;cleaningCloth.isVisible=true}
 }else if(missionIndex===9){
   prepareGoodnightMission();if(step>=1){curtainsClosed=true;curtainL.position.x=-5.55;curtainR.position.x=-4.85}
   if(step>=2){lampOn=true;nightLight.intensity=.72;nightLamp.material=M.yellow}
   if(step>=3){blanketTucked=true;sleepBlanket.position.y=.82}
   if(step>=4){babyBrain.event('pet')}if(step>=5){goodnightDone=true;babyBrain.event('sleep')}
 }
 applyUnlocks();updateNpcHud();
}
function dist(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function interactions(){return[fridgeDoor,milk,table,bread,toaster,toast,foodBag,dogBowl,dogHead,babyBottle,teddyBody,cribMattress,nightLamp,babyHead,toyLid,tap,toyBall,toyBlock1,toyBlock2,toyBlock3,canBody,plant,dirtyPlate,dishRack,sink,looseCush1,looseCush2,sofaMissionTarget,cleaningCloth,spill,curtainTarget,sleepBlanket,counterTop].filter(o=>o&&o.isVisible&&o.isPickable)}
function nearestInteractive(){const t=targetObject();if(t&&t.isVisible&&t.isPickable&&dist(player.position,t.getAbsolutePosition())<=1.95)return t;let best=null,bd=99;for(const m of interactions()){const d=dist(player.position,m.getAbsolutePosition());if(d<bd){bd=d;best=m}}return bd<=1.8?best:null}

function dogFetchSequence(){
 dogFetched=false;playAssetAnim(dogAsset,'walk');dogBrain.event('play');updateNpcHud();
 const start=dog.position.clone(),far=new BABYLON.Vector3(.85,0,-1.45),home=new BABYLON.Vector3(2.25,0,-2.45),t0=performance.now();
 const obs=scene.onBeforeRenderObservable.add(()=>{
   const elapsed=performance.now()-t0;
   if(elapsed<900)dog.position=BABYLON.Vector3.Lerp(start,far,elapsed/900);
   else if(elapsed<1750)dog.position=BABYLON.Vector3.Lerp(far,home,(elapsed-900)/850);
   else{
     scene.onBeforeRenderObservable.remove(obs);dog.position.copyFrom(home);dogFetched=true;toyBall.isVisible=true;toyBall.position.set(2.0,.25,-2.25);
     playAssetAnim(dogAsset,'idle');sfx('bark');showToast('🐶 Trouxe a bola!');advance('dogFetched',dogHead);
   }
 });
}

function dogEatSequence(){dogAte=true;dogBrain.event('feed');playAssetAnim(dogAsset,'walk');const start=dog.position.clone(),end=new BABYLON.Vector3(3.3,0,-2.55),begin=performance.now();const obs=scene.onBeforeRenderObservable.add(()=>{const t=Math.min(1,(performance.now()-begin)/950);dog.position=BABYLON.Vector3.Lerp(start,end,t);if(t>=1){scene.onBeforeRenderObservable.remove(obs);showToast('🐶 Nhac nhac!');sfx('bark');speak('Au au! Que gostoso!',{avatar:'🐶',pitch:.88,rate:1.02});playAssetAnim(dogAsset,'idle');setTimeout(()=>{dogBowl.material=M.blue;advance('dogAte',dogHead)},900)}})}
function interact(){const m=nearestInteractive();if(!m)return;const type=m.metadata?.type;performPlayerAction(['item','foodBag','babyBottle','teddy','toy','wateringCan','dish','cushion','cloth'].includes(type)?'pickup':(['dog','baby'].includes(type)?'pet':'use'));
 if(type==='fridge'){if(missionIndex!==0)return;
   if(!fridgeOpen){
     fridgeOpen=true;sfx('door');
     tween(fridgeHinge,'rotation.y',fridgeHinge.rotation.y,Math.PI*.58,28,()=>{
       milk.isVisible=true; popScale(milk); advance('fridgeOpen',fridgeDoor);
     });
   }else{
     sfx('door');tween(fridgeHinge,'rotation.y',fridgeHinge.rotation.y,0,26,()=>fridgeOpen=false);
   }
 }
 else if(type==='item'){if(held||missionIndex!==0)return;const item=m.metadata.item;if(item==='milk'&&step!==1)return;if(item==='bread'&&step!==3)return;if(item==='toast'&&step!==6)return;sfx('pickup');bounceY(player,.08,12);held=item;m.isVisible=false;hud();advance(item==='milk'?'milkHeld':item==='bread'?'breadHeld':'toastHeld',player)}
 else if(type==='table'){if(missionIndex!==0)return;if(held==='milk'&&step===2){placeTable('milk');advance('milkTable',table)}else if(held==='toast'&&step===7){placeTable('toast');advance('toastTable',table)}}
 else if(type==='toaster'){if(missionIndex!==0)return;if(held==='bread'&&step===4){held=null;breadInToaster=true;bread.isVisible=false;hud();advance('breadToaster',toaster)}else if(breadInToaster&&step===5&&!toasterReady){toaster.material=M.yellow;bounceY(toaster,.12,18);showToast('🔥 Torrando...');advance('toasterOn',toaster);setTimeout(()=>{toasterReady=true;toast.isVisible=true;popScale(toast);toaster.material=M.red;sfx('ding');speak('A torrada ficou pronta!')},1100)}}
 else if(type==='foodBag'){if(missionIndex!==1||step!==0||held)return;sfx('pickup');held='food';foodBag.isVisible=false;hud();advance('foodHeld',player)}
 else if(type==='bowl'){if(missionIndex!==1)return;if(step===1&&held==='food'){held=null;foodAtBowl=true;foodBag.position.set(3.35,.55,-2.7);foodBag.isVisible=true;foodBag.isPickable=false;hud();advance('foodNearBowl',dogBowl)}else if(step===2&&foodAtBowl&&!bowlFilled){bowlFilled=true;dogBowl.material=M.orange;dogBrain.hunger=18;dogBrain.derive();updateNpcHud();showToast('🦴 Pote cheio!');advance('bowlFilled',dogBowl)}}
 else if(type==='dog'){
   if(missionIndex===1){
     if(step===3&&bowlFilled&&!dogAte)dogEatSequence();
     else if(step===4&&dogAte){dogBrain.event('pet');updateNpcHud();showToast('💗 Au au!');burstAt(dogHead.getAbsolutePosition(),'#f5a6bd');advance('dogPetted',dogHead)}
   }else if(missionIndex===7){
     if(step===1&&held==='dogBall'){held=null;dogBallThrown=true;toyBall.isVisible=true;toyBall.position.set(.85,.25,-1.45);hud();showToast('🎾 Vai buscar!');advance('dogBallThrown',dogHead);setTimeout(dogFetchSequence,650)}
     else if(step===3&&dogFetched){dogBrain.event('pet');updateNpcHud();showToast('💗 Bom cachorro!');advance('dogPlayPetted',dogHead)}
   }else if(missionIndex===9&&step>=3){
     // no-op: mission targets baby only
   }
 }
 else if(type==='babyBottle'){if(missionIndex!==2||step!==0||held)return;sfx('pickup');held='bottle';babyBottle.isVisible=false;hud();bounceY(player,.08,12);advance('bottleHeld',player)}
 else if(type==='baby'){if(missionIndex!==2)return;
   if(step===1&&held==='bottle'){held=null;babyFed=true;babyBrain.event('feed');updateNpcHud();babyMood.material=M.mint;hud();showToast('🍼 Glup glup!');sfx('baby');speak('Oba!',{avatar:'👶',pitch:1.28,rate:1.08});bounceY(baby,.08,20);advance('babyFed',babyHead)}
   else if(step===5&&lampOn){babyPetted=true;babyBrain.event('pet');updateNpcHud();babyMood.material=M.pink;showToast('💗 Bebê feliz!');burstAt(babyHead.getAbsolutePosition(),'#f5a6bd');advance('babyPetted',babyHead)}
   }else if(missionIndex===9){
     if(step===3&&blanketTucked){babyBrain.event('pet');updateNpcHud();showToast('💗 Shhh...');advance('goodnightPet',babyHead)}
     else if(step===4){goodnightDone=true;babyBrain.event('sleep');updateNpcHud();speak('Boa noite, bebê. Dorme bem!',{avatar:'👶',pitch:1.12});advance('goodnightDone',babyHead)}
 }
 else if(type==='teddy'){if(missionIndex!==2||step!==2||held)return;sfx('pickup');held='teddy';teddy.setEnabled(false);hud();advance('teddyHeld',player)}
 else if(type==='crib'){if(missionIndex===2&&step===3&&held==='teddy'){held=null;teddyInCrib=true;teddy.setEnabled(true);teddy.position.set(-5.2,.48,1.55);teddy.rotation.y=.3;hud();bounceY(teddy,.10,18);advance('teddyInCrib',cribMattress)}}
 else if(type==='lamp'){
   if(missionIndex===2&&step===4&&!lampOn){lampOn=true;nightLight.intensity=.75;nightLamp.material=M.yellow;popScale(nightLamp,16);showToast('🌙 Luz acesa');sfx('click');advance('lampOn',nightLamp)}
   else if(missionIndex===9&&step===1&&!lampOn){lampOn=true;nightLight.intensity=.78;nightLamp.material=M.yellow;popScale(nightLamp,16);advance('sleepLampOn',nightLamp)}
   else{lampOn=!lampOn;nightLight.intensity=lampOn?0.75:0;nightLamp.material=lampOn?M.yellow:M.cream}
 }
 else if(type==='toy'){
   if(held)return;
   if(missionIndex===3){
     if(step===0&&m===toyBall){sfx('pickup');held='toyBall';toyBall.isVisible=false;hud();advance('toyBallHeld',player)}
     else if(step===2&&m===toyBlock1){sfx('pickup');held='toyBlock';toyBlock1.isVisible=false;hud();advance('toyBlockHeld',player)}
   }else if(missionIndex===7&&step===0&&m===toyBall){
     sfx('pickup');held='dogBall';toyBall.isVisible=false;hud();advance('dogBallHeld',player);
   }
 }
 else if(type==='toybox'){
   if(missionIndex===3){
     if(step===1&&held==='toyBall'){held=null;toyBallStored=true;hud();showToast('⚽ Bola guardada!');advance('toyBallStored',toyLid)}
     else if(step===3&&held==='toyBlock'){held=null;toyBlockStored=true;hud();showToast('🟦 Bloco guardado!');advance('toyBlockStored',toyLid)}
     else if(step===4&&toyboxOpen){toyboxOpen=false;tween(toyHinge,'rotation.x',toyHinge.rotation.x,0,24,()=>advance('toyboxClosed',toyLid));}
     else{toyboxOpen=!toyboxOpen;tween(toyHinge,'rotation.x',toyHinge.rotation.x,toyboxOpen?-1.15:0,24)}
   }else{toyboxOpen=!toyboxOpen;tween(toyHinge,'rotation.x',toyHinge.rotation.x,toyboxOpen?-1.15:0,24);showToast(toyboxOpen?'🧸 Baú aberto':'🧸 Baú fechado')}
 }
 else if(type==='wateringCan'){
   if(missionIndex===4&&step===0&&!held){sfx('pickup');held='can';wateringCan.setEnabled(false);hud();advance('canHeld',player)}
 }
 else if(type==='faucet'){
   if(missionIndex===4){
     if(step===1&&!faucetOn){faucetOn=true;waterStream.isVisible=true;sfx('water');showToast('💧 Água ligada');advance('faucetOn',tap)}
     else if(step===2&&faucetOn&&held==='can'&&!canFilled){canFilled=true;showToast('💧 Regador cheio!');popScale(tap,12);advance('canFilled',tap)}
     else if(step===3&&faucetOn){faucetOn=false;waterStream.isVisible=false;sfx('water');showToast('🚰 Torneira fechada');advance('faucetOff',tap)}
   }else if(missionIndex===5){
     if(step===2&&!faucetOn){faucetOn=true;waterStream.isVisible=true;sfx('water');advance('dishWaterOn',tap)}
   }else{faucetOn=!faucetOn;waterStream.isVisible=faucetOn;showToast(faucetOn?'💧 Torneira ligada':'🚰 Torneira fechada')}
 }
 else if(type==='plant'){
   if(missionIndex===4&&step===4&&held==='can'&&canFilled){held=null;plantWatered=true;wateringCan.setEnabled(true);wateringCan.position.set(-2.2,.36,3.6);hud();burstAt(plant.getAbsolutePosition(),'#86c9ff');plant.scaling.scaleInPlace(1.07);showToast('🌱 Plantinha regada!');advance('plantWatered',plant)}
 }
 else if(type==='dish'){
   if(missionIndex===5&&step===0&&!held){held='dish';dirtyPlate.isVisible=false;hud();sfx('pickup');advance('dishHeld',player)}
 }
 else if(type==='sink'){
   if(missionIndex===5&&step===1&&held==='dish'){held=null;dishInSink=true;dirtyPlate.isVisible=true;dirtyPlate.position.set(2.65,1.21,3.55);hud();advance('dishSink',sink)}
   else if(missionIndex===5&&step===3&&dishInSink&&faucetOn&&!dishWashed){dishWashed=true;dirtyPlate.material=M.white;burstAt(sink.getAbsolutePosition(),'#9de5ff');showToast('✨ Prato limpo!');advance('dishWashed',sink)}
 }
 else if(type==='dishRack'){
   if(missionIndex===5&&step===4&&dishWashed){dirtyPlate.isVisible=false;cleanPlate.isVisible=true;advance('dishRack',dishRack)}
 }
 else if(type==='cushion'){
   if(missionIndex===6&&!held){
     if(step===0&&m===looseCush1){held='cushionPink';looseCush1.isVisible=false;hud();advance('cushionPinkHeld',player)}
     else if(step===2&&m===looseCush2){held='cushionYellow';looseCush2.isVisible=false;hud();advance('cushionYellowHeld',player)}
   }
 }
 else if(type==='sofaMission'){
   if(missionIndex===6&&step===1&&held==='cushionPink'){held=null;cushionPinkPlaced=true;looseCush1.isVisible=true;looseCush1.position.set(-1.35,.89,2.05);hud();advance('cushionPinkPlaced',sofaMissionTarget)}
   else if(missionIndex===6&&step===3&&held==='cushionYellow'){held=null;cushionYellowPlaced=true;looseCush2.isVisible=true;looseCush2.position.set(-.25,.89,2.05);hud();advance('cushionYellowPlaced',sofaMissionTarget)}
 }
 else if(type==='cloth'){
   if(missionIndex===8&&step===0&&!held){held='cloth';cleaningCloth.isVisible=false;hud();advance('clothHeld',player)}
 }
 else if(type==='spill'){
   if(missionIndex===8&&held==='cloth'){
     if(step===1){advance('spillReached',spill)}
     else if(step===2){spillCleaned=true;spill.isVisible=false;burstAt(spill.getAbsolutePosition(),'#ffffff');showToast('✨ Limpinho!');advance('spillCleaned',player)}
   }
 }
 else if(type==='counterTop'){
   if(missionIndex===8&&step===3&&held==='cloth'){held=null;cleaningCloth.isVisible=true;cleaningCloth.position.set(5.55,1.24,3.72);hud();advance('clothReturned',counterTop)}
 }
 else if(type==='curtain'){
   if(missionIndex===9&&step===0&&!curtainsClosed){curtainsClosed=true;tween(curtainL,'position.x',curtainL.position.x,-5.55,28);tween(curtainR,'position.x',curtainR.position.x,-4.85,28,()=>advance('curtainsClosed',curtainTarget))}
 }
 else if(type==='blanket'){
   if(missionIndex===9&&step===2&&!blanketTucked){blanketTucked=true;tween(sleepBlanket,'position.y',sleepBlanket.position.y,.82,22,()=>advance('blanketTucked',sleepBlanket))}
 }
}
$('#useBtn').addEventListener('pointerdown',e=>{e.preventDefault();interact()});
const keys={};window.addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyE'||e.code==='Space')interact()},{passive:false});window.addEventListener('keyup',e=>keys[e.code]=false);
let downX=0,downY=0,downButton=0;canvas.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;downButton=e.button});canvas.addEventListener('pointerup',e=>{if(downButton!==0||Math.hypot(e.clientX-downX,e.clientY-downY)>8)return;const p=scene.pick(e.clientX,e.clientY,m=>m?.metadata?.type==='floor');if(p?.hit&&p.pickedPoint){moveTarget=p.pickedPoint.clone();moveTarget.x=Math.max(-6.5,Math.min(6.5,moveTarget.x));moveTarget.z=Math.max(-4.0,Math.min(4.45,moveTarget.z));marker.position.set(moveTarget.x,.03,moveTarget.z);marker.isVisible=true}});
// joystick
const joy=$('#joystick'),stick=$('#stick');let joyId=null,jx=0,jy=0;function setJoy(x,y){const R=35,d=Math.hypot(x,y),k=d>R?R/d:1;jx=x*k/R;jy=y*k/R;stick.style.transform=`translate(${x*k}px,${y*k}px)`}joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);const r=joy.getBoundingClientRect();setJoy(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)});joy.addEventListener('pointermove',e=>{if(e.pointerId!==joyId)return;const r=joy.getBoundingClientRect();setJoy(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)});function endJoy(e){if(e.pointerId!==joyId)return;joyId=null;jx=jy=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',endJoy);joy.addEventListener('pointercancel',endJoy);
function movePlayer(sx,sy,dt){
 const len=Math.hypot(sx,sy);if(len<.001)return false;sx/=len;sy/=len;
 const forward=camera.target.subtract(camera.position);forward.y=0;forward.normalize();
 const right=BABYLON.Vector3.Cross(BABYLON.Axis.Y,forward).normalize();
 const world=forward.scale(sy).add(right.scale(sx));
 const speed=3.25*dt,delta=new BABYLON.Vector3(world.x*speed,0,world.z*speed);
 playerCollider.moveWithCollisions(delta);
 playerCollider.position.x=Math.max(-6.45,Math.min(6.45,playerCollider.position.x));
 playerCollider.position.z=Math.max(-3.95,Math.min(4.35,playerCollider.position.z));
 player.position.x=playerCollider.position.x;player.position.z=playerCollider.position.z;
 player.rotation.y=Math.atan2(world.x,world.z);moveTarget=null;marker.isVisible=false;return true;
}
function animatePlayer(moving,dt){
 if(playerAsset.loaded){
   if(performance.now()<playerActionUntil)return;
   playAssetAnim(playerAsset,moving?'walk':'idle');
   return;
 }
 if(moving){walkPhase+=dt*10;const s=Math.sin(walkPhase)*.52;legL.rotation.x=s;legR.rotation.x=-s;armL.rotation.x=-s*.8;armR.rotation.x=s*.8;torso.position.y=.92+Math.abs(Math.sin(walkPhase))*0.025}
 else{idlePhase+=dt*2.3;legL.rotation.x*=.82;legR.rotation.x*=.82;armL.rotation.x*=.82;armR.rotation.x*=.82;torso.position.y=.92+Math.sin(idlePhase)*.012}
}

// ===== DayNightSystem =====
const DAY_COLOR=BABYLON.Color4.FromHexString('#b9e4f3ff'),NIGHT_COLOR=BABYLON.Color4.FromHexString('#182743ff');
function updateDayNight(dt){
 if(playing)gameHour=(gameHour+dt/50)%24; // ~20 min por ciclo completo
 const daylight=Math.max(0,Math.sin(((gameHour-6)/12)*Math.PI));
 const dusk=Math.max(0,1-Math.min(1,Math.abs(gameHour-18)/3));
 sun.intensity=.10+.58*daylight;hemi.intensity=.28+.62*daylight;
 warmFill.intensity=.16+.18*(1-daylight);coolFill.intensity=.08+.14*daylight;
 scene.clearColor=BABYLON.Color4.Lerp(NIGHT_COLOR,DAY_COLOR,.18+.82*daylight);
 const h=Math.floor(gameHour),m=Math.floor((gameHour-h)*60);
 ui.time.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
 ui.time.parentElement.firstChild.nodeValue=(gameHour>=6&&gameHour<18)?'☀️ ':'🌙 ';
}

let wag=0,babyPhase=0,lastHighlight=null;
function updateHighlight(){if(lastHighlight){try{hl.removeMesh(lastHighlight)}catch(e){}lastHighlight=null}const t=targetObject();if(t&&t.isVisible){try{hl.addMesh(t,BABYLON.Color3.FromHexString('#ffd65d'));lastHighlight=t}catch(e){}}}
scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(.04,engine.getDeltaTime()/1000);updateDayNight(dt);babyBrain.update(dt);dogBrain.update(dt);updateNpcHud();let sx=0,sy=0;if(keys.KeyW||keys.ArrowUp)sy+=1;if(keys.KeyS||keys.ArrowDown)sy-=1;if(keys.KeyA||keys.ArrowLeft)sx-=1;if(keys.KeyD||keys.ArrowRight)sx+=1;if(Math.abs(jx)+Math.abs(jy)>.08){sx+=jx;sy+=-jy}let moving=false;if(sx||sy)moving=movePlayer(sx,sy,dt);else if(moveTarget){const vx=moveTarget.x-player.position.x,vz=moveTarget.z-player.position.z,d=Math.hypot(vx,vz);if(d<.09){moveTarget=null;marker.isVisible=false}else{const sp=3.0*dt,dd=Math.min(sp,d);
 playerCollider.moveWithCollisions(new BABYLON.Vector3(vx/d*dd,0,vz/d*dd));
 player.position.x=playerCollider.position.x;player.position.z=playerCollider.position.z;
 player.rotation.y=Math.atan2(vx,vz);moving=true}}animatePlayer(moving,dt);camera.target.set(player.position.x,.9,player.position.z+.22);pShadow.position.x=player.position.x;pShadow.position.z=player.position.z;dShadow.position.x=dog.position.x;dShadow.position.z=dog.position.z;bShadow.position.x=baby.position.x;bShadow.position.z=baby.position.z;
 near=nearestInteractive();if(near){ui.near.textContent=`${near.metadata.label} • USAR`;ui.near.style.opacity='1'}else ui.near.style.opacity='0';
 const t=targetObject();if(t&&t.isVisible){const p=t.getAbsolutePosition();arrow.position.set(p.x,p.y+1.35+Math.sin(performance.now()/230)*.08,p.z);arrow.rotation.y=performance.now()/500;targetRing.position.set(p.x,.05,p.z);targetRing.scaling.setAll(1+Math.sin(performance.now()/250)*.08);arrow.isVisible=targetRing.isVisible=true}else arrow.isVisible=targetRing.isVisible=false;
 wag+=dt*8;if(!dogAsset.loaded){tail.rotation.y=Math.sin(wag)*.75;dogHead.rotation.y=Math.sin(wag*.45)*.08;dogLegs.forEach((l,i)=>l.rotation.x=Math.sin(wag*1.5+(i%2?Math.PI:0))*.18)}babyPhase+=dt*(babyFed?2.0:3.0);
 babyArmL.rotation.z=-.35+Math.sin(babyPhase)*(babyFed?.06:.12);
 babyArmR.rotation.z=.35-Math.sin(babyPhase)*(babyFed?.06:.12);
 babyMood.position.y=1.22+Math.sin(babyPhase*1.2)*.04;
 if(lampOn)nightLight.intensity=.68+Math.sin(babyPhase*.7)*.07;
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.m.position.addInPlace(f.v);f.v.y-=.0022;f.m.rotation.y+=f.spin;f.life--;f.m.scaling.scaleInPlace(.985);if(f.life<=0){f.m.dispose();fx.splice(i,1)}}
});
playerCollider.position.x=player.position.x;playerCollider.position.z=player.position.z;restore();applyUnlocks();updateNpcHud();hud(false);save();engine.runRenderLoop(()=>scene.render());window.addEventListener('resize',()=>engine.resize());
const assetBoot=loadRealAssets().catch(e=>console.warn(e));
Promise.race([assetBoot,new Promise(r=>setTimeout(r,8500))]).finally(()=>{loading.style.display='none'});



let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});
function isStandalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function showInstallHelp(){
 const box=document.getElementById('installHelp'),txt=document.getElementById('installText');if(!box||!txt)return;
 if(isStandalone())txt.innerHTML='<p>✅ Já está instalado como aplicativo.</p>';
 else if(isIOS)txt.innerHTML='<p>No iPhone, abra pelo <b>Safari</b>.</p><p>Toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p><p>Depois abra pelo ícone da casinha.</p>';
 else if(deferredInstallPrompt)txt.innerHTML='<p>Seu navegador liberou a instalação. Toque novamente em <b>Instalar</b> para confirmar.</p>';
 else txt.innerHTML='<p>Abra em HTTPS e use o menu do navegador → <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</p>';
 box.style.display='flex';
}
document.getElementById('installBtn')?.addEventListener('click',async()=>{
 if(deferredInstallPrompt){deferredInstallPrompt.prompt();try{await deferredInstallPrompt.userChoice}catch(e){}deferredInstallPrompt=null}
 else showInstallHelp();
});
document.getElementById('closeInstallBtn')?.addEventListener('click',()=>document.getElementById('installHelp').style.display='none');
document.getElementById('portraitAnywayBtn')?.addEventListener('click',()=>document.body.classList.add('allowPortrait'));
document.getElementById('fullscreenBtn')?.addEventListener('click',async()=>{
 try{
  if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
  else if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();
 }catch(e){showToast('No iPhone, use “Adicionar à Tela de Início” para tela cheia.')}
});
document.getElementById('qualityBtn')?.addEventListener('click',()=>{
 qualityMode=qualityMode==='auto'?'hd':qualityMode==='hd'?'eco':'auto';
 localStorage.setItem('hanna_quality',qualityMode);applyQuality();
 showToast('Qualidade: '+(qualityMode==='hd'?'HD':qualityMode==='eco'?'Econômica':'Automática'));
});
function updateNet(){
 const b=document.getElementById('netBadge');if(!b)return;
 const on=navigator.onLine;b.textContent=on?'🟢 online':'🔴 offline';b.classList.toggle('offline',!on);
}
addEventListener('online',updateNet);addEventListener('offline',updateNet);updateNet();
document.addEventListener('contextmenu',e=>{if(isMobile)e.preventDefault()});
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
addEventListener('resize',()=>engine.resize());

if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
 if(reg.waiting)showToast('🆕 Nova versão pronta. Reabra o jogo para atualizar.');
 reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showToast('🆕 Atualização baixada!')})});
}).catch(()=>{}));
}

})();
