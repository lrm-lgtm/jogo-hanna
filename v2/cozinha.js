// Casa da Hanna — Cozinha 3D v2 isolada: scene based on working R5 with v2 services.
(()=>{'use strict';
const B=window.BABYLON,canvas=document.getElementById('game'),loading=document.getElementById('loading');
const el=id=>document.getElementById(id);
if(!B){el('loadDetail').textContent='Não foi possível carregar Babylon.js. Verifique a internet.';return}
const scene=new B.Scene(new B.Engine(canvas,true,{adaptToDeviceRatio:true,stencil:true}));
const engine=scene.getEngine();
const quality=window.HannaV2Quality;
const graphics=quality.select(quality.load(window.localStorage),{
 mobile:/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent),
 width:innerWidth,memory:navigator.deviceMemory||0,cores:navigator.hardwareConcurrency||4
});
const hardwareScale=()=>quality.hardwareScale(graphics,window.devicePixelRatio||1,{width:innerWidth,height:innerHeight});
engine.setHardwareScalingLevel(hardwareScale());
scene.clearColor=B.Color4.FromHexString('#dcebe5ff');
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure=1.07;
scene.imageProcessingConfiguration.contrast=1.13;
const camera=new B.ArcRotateCamera('camera',-Math.PI/2.47,1.17,5.75,new B.Vector3(-.93,1.20,-.95),scene);
camera.mode=B.Camera.PERSPECTIVE_CAMERA;
camera.fov=.72;
camera.minZ=.12;
camera.maxZ=120;
camera.lowerBetaLimit=1.10;camera.upperBetaLimit=1.28;
camera.lowerAlphaLimit=-Math.PI/2.47-.16;camera.upperAlphaLimit=-Math.PI/2.47+.16;
camera.panningSensibility=0;
camera.inputs.clear();
scene.activeCamera=camera;
const hemi=new B.HemisphericLight('softSky',new B.Vector3(-.2,1,-.25),scene);
hemi.intensity=.73;hemi.groundColor=B.Color3.FromHexString('#aa8883');
const sun=new B.DirectionalLight('warmWindowLight',new B.Vector3(-.42,-1,.35),scene);
sun.position.set(1.6,7,5);sun.intensity=1.65;
sun.diffuse=B.Color3.FromHexString('#fff3df');
const warm=new B.PointLight('warmFill',new B.Vector3(3,3,-2),scene);warm.intensity=.20;warm.diffuse=B.Color3.FromHexString('#ffd5a9');
const pipeline=new B.DefaultRenderingPipeline('premiumCartoon',true,scene,[camera]);
// Native multisampling is cleaner than full-screen FXAA, which softens stylized eyes and hair.
pipeline.samples=graphics.samples;
pipeline.fxaaEnabled=graphics.samples===1;
pipeline.sharpenEnabled=graphics.sharpen;
if(pipeline.sharpenEnabled){pipeline.sharpen.edgeAmount=.16;pipeline.sharpen.colorAmount=1.0 // 1.0 preserves original color; .42 was a severe brightness regression}
pipeline.bloomEnabled=graphics.bloom;
if(graphics.bloom){pipeline.bloomWeight=.055;pipeline.bloomThreshold=1.2}
const shadow=new B.ShadowGenerator(graphics.shadow,sun);
shadow.useBlurExponentialShadowMap=graphics.blur;shadow.blurKernel=graphics.blur?18:1;
const materials={};
function mat(name,hex,roughness=0.85){
 const m=new B.PBRMaterial(name,scene);
 m.albedoColor=B.Color3.FromHexString(hex);m.roughness=roughness;m.metallic=0;
 materials[name]=m;return m;
}
const M={
 floor:mat('warmIvory','#f5e6d1'),wall:mat('peachWall','#f6d8cb'),mint:mat('mintCabinet','#93c7b3'),
 wood:mat('honeyWood','#cf9f79'),trim:mat('whiteTrim','#fff5e8'),coral:mat('softCoral','#e8a7a0'),
 hair:mat('honeyHair','#946647'),skin:mat('skin','#f5c9a6'),cloth:mat('lavenderApron','#9b91cb'),
 eyes:mat('eyes','#352e38'),white:mat('milkWhite','#fffdfa'),leaf:mat('leaf','#7caf80'),
 berry:mat('berry','#ed8199'),blue:mat('blue','#9bd6df'),gold:mat('gold','#f2bf5d'),plate:mat('plate','#fdf5e4')
};
const floorTex=new B.DynamicTexture('handPaintedTiles',{width:512,height:512},scene,false);
const ctx=floorTex.getContext();ctx.fillStyle='#f6eadb';ctx.fillRect(0,0,512,512);
for(let x=0;x<4;x++)for(let y=0;y<4;y++){
  ctx.fillStyle=(x+y)%2?'#f2dfca':'#ffefe0';
  ctx.fillRect(x*128+3,y*128+3,122,122);
  ctx.fillStyle='#dfc9bb';ctx.fillRect(x*128,y*128,2,128);ctx.fillRect(x*128,y*128,128,2);
  for(let n=0;n<9;n++){const p=(x*41+y*19+n*13)%117,q=(y*37+x*23+n*29)%117;
   ctx.fillStyle=n%2?'#f3d6be':'#e3d2c6';ctx.fillRect(x*128+p+7,y*128+q+7,2,2);}
}
floorTex.update();floorTex.uScale=3;floorTex.vScale=3;
const floorMat=new B.StandardMaterial('floorTiles',scene);
floorMat.diffuseTexture=floorTex;floorMat.specularColor=new B.Color3(.04,.04,.04);
const box=(name,pos,dims,m)=>{
 const mesh=B.MeshBuilder.CreateBox(name,{width:dims[0],height:dims[1],depth:dims[2]},scene);
 mesh.position.set(...pos);mesh.material=m;mesh.isPickable=false;mesh.receiveShadows=true;return mesh;
};
const sphere=(name,pos,dia,m)=>{
 const o=B.MeshBuilder.CreateSphere(name,{diameter:dia,segments:16},scene);
 o.position.set(...pos);o.material=m;o.isPickable=false;return o;
};
const cylinder=(name,pos,d,h,m,tess=16)=>{
 const o=B.MeshBuilder.CreateCylinder(name,{diameter:d,height:h,tessellation:tess},scene);
 o.position.set(...pos);o.material=m;o.isPickable=false;return o;
};
const floor=box('walkableKitchenFloor',[0,-.09,0],[8,.18,6.4],floorMat);
box('backWall',[0,1.75,3.02],[8,3.5,.17],M.wall);
box('backWainscot',[0,.42,2.92],[8,.83,.07],M.trim);
box('backTrim',[0,.88,2.88],[8,.08,.13],M.wood);
box('leftWall',[-4,1.65,1.42],[.17,3.3,3.1],M.wall);
box('leftWainscot',[-3.89,.45,1.35],[.08,.88,3.1],M.trim);
box('leftBaseboard',[-3.86,.9,1.35],[.10,.08,3.1],M.wood);
box('rugBase',[-.08,.026,-1.05],[2.65,.04,1.45],M.plate);
box('rugInset',[-.08,.051,-1.05],[2.40,.045,1.20],M.blue);
const baseboard=box('backCounterPlinth',[-.12,.18,2.19],[5.1,.36,.95],M.wood);
for(let i=0;i<5;i++) {
  const x=-1.72+i*.88;
  const handle=cylinder('decorativeCabinetHandle'+i,[x,.55,1.69],.045,.19,M.gold,12);
  handle.rotation.z=Math.PI/2;
}
// Back wall framed picture / glowing kitchen window
const frame=box('windowFrame',[1.78,2.48,2.91],[1.45,.95,.15],M.wood);
const pane=box('windowGlass',[1.78,2.49,2.80],[1.24,.75,.018],M.blue);
pane.material.emissiveColor=B.Color3.FromHexString('#183039');
box('windowCrossbar',[1.78,2.49,2.77],[1.28,.05,.08],M.trim);
box('windowMullion',[1.78,2.48,2.77],[.055,.76,.08],M.trim);
for(let i=0;i<4;i++)sphere('wallFlower'+i,[-.1+i*.16,2.56,2.77],.095,i%2?M.berry:M.gold);
const roomRoot=new B.TransformNode('kitchenModelImports',scene);
const objects=new Map(),visuals=new Map();
const character=new B.TransformNode('HannaCharacter',scene);
character.position.set(-1.65,0,-2.03);
character.rotation.y=2.45; // Introduce Hanna face/3-4 to the player instead of her back.
// Character-v4 is a real Blender GLB; no fallback sphere-based avatar is allowed.
let avatarMeshCount=0,avatarPivots=null,avatarRig=null,avatarWalkedFrames=0,blinkParts=[];
async function loadPlayableAvatar(){
 const r=await B.SceneLoader.ImportMeshAsync('', './assets/', 'hanna-free-r8.glb',scene);
 const meshes=r.meshes.filter(m=>m.getTotalVertices?.()>0);
 if(meshes.length<80)throw new Error('Modelo Hanna R8 incompleto: '+meshes.length+' malhas');
 for(const root of r.meshes.filter(x=>!x.parent))root.parent=character;
 for(const root of r.transformNodes.filter(x=>!x.parent))root.parent=character;
 const find=n=>r.transformNodes.find(x=>x.name===n||x.name.endsWith('__'+n));
 const names=['HannaRig','HeadPivot','ArmLeftPivot','ArmRightPivot','LegLeftPivot','LegRightPivot'];
 const anchors=names.map(find);
 if(anchors.some(x=>!x))throw new Error('Rig da personagem está incompleto');
 avatarPivots={head:anchors[1],leftArm:anchors[2],rightArm:anchors[3],leftLeg:anchors[4],rightLeg:anchors[5]};
 avatarRig=anchors[0];
 avatarMeshCount=meshes.length;
 const eyeNames=/sclera-|iris-|black-pupil-|eye-sparkle-/;
 blinkParts=meshes.filter(m=>eyeNames.test(m.name)).map(m=>({mesh:m,scale:m.scaling.y}));
 for(const m of meshes){m.isPickable=false;shadow.addShadowCaster(m);}
 window.__hannaAvatar=Object.freeze({version:'r8-free-blender',model:'hanna-free-r8.glb',eyes:blinkParts.length});
}
function updateAvatarAnimation(t,isWalking,dt){
 if(!avatarPivots)return;
 const a=avatarPivots,phase=t*7.3;
 const intensity=isWalking?1:0;
 a.leftArm.rotation.x=Math.sin(phase)*.35*intensity;
 a.rightArm.rotation.x=-Math.sin(phase)*.35*intensity-(held?.24:0);
 a.leftLeg.rotation.x=-Math.sin(phase)*.25*intensity;
 a.rightLeg.rotation.x=Math.sin(phase)*.25*intensity;
 a.head.rotation.z=Math.sin(t*1.8)*.024;
 a.head.rotation.y=Math.sin(t*.93)*.09;
 const period=t%5.4;
 const blink=Math.abs(period-2.62)<.095?Math.max(.10,Math.abs(period-2.62)/.095):1;
 for(const part of blinkParts)part.mesh.scaling.y=part.scale*blink;
 if(performance.now()<gestureUntil)a.rightArm.rotation.x=-1.00;
 if(avatarRig)avatarRig.position.y=isWalking?.020*Math.abs(Math.sin(phase)):.005*Math.sin(t*2);
 if(isWalking)avatarWalkedFrames++;
}
// A carried item is a recognizable miniature prop — not the old placeholder sphere.
const carryRoot=new B.TransformNode('carriedBreakfastProp',scene);
carryRoot.parent=character;carryRoot.position.set(.34,1.05,-.33);
function carryBox(parent,name,pos,dims,material){
 const mesh=B.MeshBuilder.CreateBox(name,{width:dims[0],height:dims[1],depth:dims[2]},scene);
 mesh.parent=parent;mesh.position.set(...pos);mesh.material=material;mesh.isPickable=false;
 return mesh;
}
const carried=Object.create(null);
carried.milk=new B.TransformNode('carriedMilkCarton',scene);carried.milk.parent=carryRoot;
carryBox(carried.milk,'carriedMilkBody',[0,0,0],[.18,.26,.16],M.white);
carryBox(carried.milk,'carriedMilkLabel',[0,0,-.086],[.155,.10,.008],M.blue);
const milkRoof=B.MeshBuilder.CreateCylinder('carriedMilkTop',{diameterTop:0,diameterBottom:.22,height:.10,tessellation:4},scene);
milkRoof.rotation.y=Math.PI/4;milkRoof.position.y=.174;milkRoof.material=M.white;milkRoof.parent=carried.milk;milkRoof.isPickable=false;
function breadProp(name,middle,crust){
 const group=new B.TransformNode('carried'+name,scene);group.parent=carryRoot;
 const body=B.MeshBuilder.CreateCylinder(name+'Slice',{diameter:.25,height:.057,tessellation:18},scene);
 body.rotation.x=Math.PI/2;body.material=crust;body.parent=group;body.isPickable=false;
 const face=B.MeshBuilder.CreateCylinder(name+'Crumb',{diameter:.211,height:.061,tessellation:18},scene);
 face.rotation.x=Math.PI/2;face.position.z=-.003;face.material=middle;face.parent=group;face.isPickable=false;
 return group;
}
carried.bread=breadProp('Bread',M.plate,M.wood);
carried.toast=breadProp('Toast',M.gold,M.wood);
for(const group of Object.values(carried))group.setEnabled(false);
const targetHalo=B.MeshBuilder.CreateTorus('targetHalo',{diameter:.93,thickness:.055,tessellation:42},scene);
targetHalo.rotation.x=Math.PI/2;targetHalo.material=M.gold;targetHalo.position.y=.08;
targetHalo.isPickable=false;
const haloGem=sphere('targetSparkle',[0,1.9,0],.19,M.gold);haloGem.isPickable=false;
const cameraTarget=new B.Vector3(-.93,1.20,-.95);
let modelsLoaded=0,currentStep=0,moving=false,waypoints=[],dest=null,joystick={x:0,y:0},pressed=new Set(),toastTimeout=null,frameCount=0,avgFps=0,held='',ready=false,loadErrors=[];
const mission=new window.HannaV2Mission.BreakfastMission({storage:window.localStorage});
const steps=window.HannaV2Mission.STEPS.map(s=>({id:s.target,label:s.text,action:s.verb,nav:s.nav,event:s.feedback,voice:s.voice,icon:s.icon,animation:s.animation}));
currentStep=mission.step;
const audio=()=>window.HannaV2Audio;
let paused=false,lastInput=performance.now(),lastHint=performance.now(),gestureUntil=0,joyMaxSince=0;
function persist(){return mission.persist()}
document.addEventListener('hanna:v2:pause',e=>{
 paused=!!e.detail.paused;pressed.clear();joystick.x=joystick.y=0;
 const k=document.getElementById('stick');if(k)k.style.transform='translate(0px,0px)';
});
document.addEventListener('hanna:v2:hint',()=>{
 setInfo('Procure o brilho dourado ✨ Use IR ATÉ para chegar perto.',6000);
 audio()?.speak(steps[Math.min(currentStep,7)].voice);
});
function setInfo(message,ms=2500){
 el('helpBubble').textContent=message;
 if(toastTimeout)clearTimeout(toastTimeout);
 if(ms)toastTimeout=setTimeout(()=>{el('helpBubble').textContent='Toque no objeto brilhando ou use «IR ATÉ».'},ms);
}
function addHitArea(key,pos,dims,nav){
 const proxy=box('hit_'+key,pos,dims,M.trim);proxy.visibility=.001;proxy.isPickable=true;
 proxy.metadata={entity:key};objects.set(key,{key,proxy,nav:new B.Vector3(nav[0],0,nav[1])});
 return proxy;
}
addHitArea('fridge',[-2.98,1.15,1.93],[1.32,2.25,1.0],steps[0].nav);
addHitArea('milk',[-3.01,1.05,1.33],[.40,.65,.45],steps[1].nav);
addHitArea('table',[-.12,.90,-.70],[1.7,.30,1.05],steps[2].nav);
addHitArea('bread',[1.62,1.21,1.48],[.54,.45,.48],steps[3].nav);
addHitArea('toaster',[1.08,1.16,1.48],[.62,.52,.46],steps[4].nav);
addHitArea('toast',[1.11,1.33,1.43],[.42,.25,.40],steps[6].nav);
function target(){return objects.get(steps[Math.min(currentStep,7)].id)}
function distanceTo(p){return Math.hypot(character.position.x-p.x,character.position.z-p.z)}
function updateHUD(){
 const s=steps[Math.min(currentStep,7)];
 el('instruction').textContent=currentStep>=8?'Café da manhã completo!':s.label;
 el('stepLabel').textContent=(Math.min(currentStep+1,8))+' de 8';
 el('progressFill').style.width=(currentStep/8*100)+'%';
 el('statusText').textContent=currentStep>=8?'Missão completa':'Uma coisa de cada vez';
 el('stars').textContent='⭐ '+(currentStep>=8?1:0);
 el('actionBtn').textContent=s.icon+' '+s.action;
 updateAction();
}
function updateAction(){
 const e=target(),close=e&&distanceTo(e.nav)<.73&&currentStep<8;
 el('actionBtn').disabled=!close;
 el('goBtn').disabled=currentStep>=8;
 el('statusText').textContent=currentStep>=8?'Muito bem!':close?'Agora toque em '+steps[currentStep].action:'Encontre o objeto brilhando ✨';
}
function updateVisuals(){
 const fridgeOpen=currentStep>=1;
 if(visuals.get('door'))visuals.get('door').rotation.y=fridgeOpen?-1.28:0;
 if(visuals.get('fridgeShelves'))visuals.get('fridgeShelves').setEnabled(fridgeOpen);
 objects.get('milk').proxy.isPickable=currentStep===1;
 objects.get('bread').proxy.isPickable=currentStep===3;
 objects.get('toast').proxy.isPickable=currentStep===6;
 const milk=visuals.get('milk');if(milk)milk.setEnabled(currentStep===1);
 const bread=visuals.get('bread');if(bread)bread.setEnabled(currentStep<=3);
 const toast=visuals.get('toast');if(toast)toast.setEnabled(currentStep===6);
 const milkTable=visuals.get('milkTable');if(milkTable)milkTable.setEnabled(currentStep>=3);
 const toastTable=visuals.get('toastTable');if(toastTable)toastTable.setEnabled(currentStep>=8);
 held=currentStep===2?'milk':currentStep===4?'bread':currentStep===7?'toast':'';
 for(const [kind,group] of Object.entries(carried))group.setEnabled(kind===held);
 const goal=target();
 // Highlight the actual object, not the walk destination.
 targetHalo.position.x=goal.nav.x;targetHalo.position.z=goal.nav.z;
 targetHalo.position.y=.06;
 haloGem.position.x=goal.proxy.position.x;haloGem.position.z=goal.proxy.position.z;haloGem.position.y=goal.proxy.position.y+goal.proxy.getBoundingInfo().boundingBox.extendSizeWorld.y+.35;
 if(currentStep===8){targetHalo.setEnabled(false);haloGem.setEnabled(false);el('finish').hidden=false}
}
function stepAction(){
 if(paused||currentStep>=8)return;
 const e=target();
 if(distanceTo(e.nav)>.73){setInfo('Vamos caminhar até '+steps[currentStep].label.toLowerCase()+'!');navigate(e.nav);return}
 const s=steps[currentStep],previous=currentStep;
 const change=mission.advance(e.key,distanceTo(e.nav));
 if(!change.ok){setInfo('Vamos fazer uma coisa de cada vez!');return}
 currentStep=mission.step;lastInput=performance.now();
 updateVisuals();updateHUD();setInfo('✨ '+s.event,2900);
 audio()?.beep(previous===5?880:620,.15);audio()?.speak(s.event);
 gestureUntil=performance.now()+650;
 if(previous===0 && visuals.get('door')) {
  visuals.get('door').rotation.y=0;
  B.Animation.CreateAndStartAnimation('openFridge',visuals.get('door'),'rotation.y',60,20,0,-1.28,0);
 }
 if(previous===5&&visuals.get('toasterGlow'))visuals.get('toasterGlow').material=M.gold;
 if(currentStep===8){setTimeout(()=>{el('finish').hidden=false},420)}
}
el('actionBtn').addEventListener('click',stepAction);
el('goBtn').addEventListener('click',()=>{if(currentStep<8&&!paused){lastInput=performance.now();navigate(target().nav)}});
el('resetBtn').addEventListener('click',()=>{
 if(confirm('Quer começar o Café da Manhã de novo?')){mission.reset();location.reload()}
});
el('againBtn').addEventListener('click',()=>{mission.reset();location.reload()});
function occupied(x,z){
 if(x<-3.70||x>3.66||z<-2.91||z>2.68)return true;
 // Standing cabinetry and the dining table are solid. Player radius is included here.
 if(z>1.00&&x>-3.65&&x<2.95)return true;
 if(x>-1.18&&x<1.18&&z>-1.37&&z<-.19)return true;
 return false;
}
const GRID=.22,MINX=-3.65,MINZ=-2.84,MAXX=3.61,MAXZ=2.62;
const gridX=x=>Math.round((x-MINX)/GRID),gridZ=z=>Math.round((z-MINZ)/GRID);
const worldX=x=>MINX+x*GRID,worldZ=z=>MINZ+z*GRID;
function getPath(start,goal){
 const sx=gridX(start.x),sz=gridZ(start.z),gx=gridX(goal.x),gz=gridZ(goal.z);
 const key=(x,z)=>x+','+z,opened=[{x:sx,z:sz,g:0,f:0}],best=new Map([[key(sx,sz),0]]),parent=new Map();
 const maxX=gridX(MAXX),maxZ=gridZ(MAXZ);let n=0;
 while(opened.length&&n++<5000){
  opened.sort((a,b)=>a.f-b.f);const node=opened.shift(),id=key(node.x,node.z);
  if(node.g>best.get(id))continue;
  if(Math.abs(node.x-gx)<=1&&Math.abs(node.z-gz)<=1){
   const pts=[new B.Vector3(goal.x,0,goal.z)];let cursor=id;
   while(parent.has(cursor)){const [x,z]=cursor.split(',').map(Number);pts.push(new B.Vector3(worldX(x),0,worldZ(z)));cursor=parent.get(cursor)}
   pts.reverse();return pts;
  }
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=node.x+dx,z=node.z+dz;
   if(x<0||z<0||x>maxX||z>maxZ||occupied(worldX(x),worldZ(z)))continue;
   if(dx&&dz&&(occupied(worldX(node.x+dx),worldZ(node.z))||occupied(worldX(node.x),worldZ(node.z+dz))))continue;
   const k=key(x,z),g=node.g+(dx&&dz?1.415:1);
   if(g>=(best.get(k)??Infinity))continue;
   best.set(k,g);parent.set(k,id);
   opened.push({x,z,g,f:g+Math.hypot(gx-x,gz-z)});
  }
 }
 return [];
}
function navigate(destination){
 dest=destination.clone();
 waypoints=getPath(character.position,dest);
 if(!waypoints.length){setInfo('O caminho está bloqueado. Tente outra posição.');return}
 moving=true;setInfo('👣 Indo até o objeto...',1400);
}
function walk(vx,vz,dt){
 const length=Math.hypot(vx,vz);if(length<.001)return false;
 const speed=2.45*(joyMaxSince&&performance.now()-joyMaxSince>650?1.45:1),dx=vx/length*speed*dt,dz=vz/length*speed*dt;
 const now=character.position;
 let changed=false;
 if(!occupied(now.x+dx,now.z)){now.x+=dx;changed=true}
 if(!occupied(now.x,now.z+dz)){now.z+=dz;changed=true}
 if(changed)character.rotation.y=Math.atan2(vx,-vz);
 return changed;
}
const joystickOuter=el('joystick'),stick=el('stick');let captured=null;
function touchJoy(e){
 const r=joystickOuter.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
 const d=Math.hypot(x,y),max=r.width*.29,k=d>max?max/d:1;
 joystick.x=x*k/max;joystick.y=-y*k/max;
 if(Math.hypot(joystick.x,joystick.y)>.96){if(!joyMaxSince)joyMaxSince=performance.now()}else joyMaxSince=0;
 stick.style.transform='translate('+(x*k)+'px,'+(y*k)+'px)';
}
joystickOuter.addEventListener('pointerdown',e=>{e.preventDefault();captured=e.pointerId;joystickOuter.setPointerCapture(e.pointerId);touchJoy(e);lastInput=performance.now();waypoints=[];moving=false});
joystickOuter.addEventListener('pointermove',e=>{if(e.pointerId===captured){touchJoy(e);lastInput=performance.now()}});
function endJoy(e){if(e.pointerId!==captured)return;captured=null;joyMaxSince=0;joystick.x=joystick.y=0;stick.style.transform='translate(0px,0px)'}
joystickOuter.addEventListener('pointercancel',endJoy);joystickOuter.addEventListener('pointerup',endJoy);
window.addEventListener('keydown',e=>{if(/^(Arrow|Key[WASD])/.test(e.code)){pressed.add(e.code);lastInput=performance.now();waypoints=[];moving=false;e.preventDefault()}});
window.addEventListener('keyup',e=>pressed.delete(e.code));
window.addEventListener('blur',()=>{pressed.clear();joystick.x=joystick.y=0;joyMaxSince=0;stick.style.transform='translate(0px,0px)'});
scene.onPointerObservable.add(evt=>{
 if(evt.type!==B.PointerEventTypes.POINTERPICK)return;
 const pick=evt.pickInfo;if(!pick?.hit||!pick.pickedMesh)return;
 let mesh=pick.pickedMesh,id=null;
 while(mesh&&!id){id=mesh.metadata?.entity;mesh=mesh.parent}
 if(id){
  if(id===target().key){navigate(target().nav)}
  else {setInfo('Agora vamos '+steps[currentStep].label.toLowerCase()+'. Toque no objeto brilhando!')}
 }else if(pick.pickedMesh===floor||pick.pickedMesh.name==='walkableKitchenFloor'){
  const p=pick.pickedPoint;if(p&&!occupied(p.x,p.z))navigate(new B.Vector3(p.x,0,p.z));
 }
});

// Camera drag is intentionally constrained to preserve child-friendly target visibility.
let cameraDrag=null;
canvas.addEventListener('pointerdown',e=>{
 if(!e.isPrimary)return;
 cameraDrag={id:e.pointerId,x:e.clientX,angle:camera.alpha};
});
canvas.addEventListener('pointermove',e=>{
 if(!cameraDrag||e.pointerId!==cameraDrag.id)return;
 const delta=e.clientX-cameraDrag.x;
 if(Math.abs(delta)>7){
  camera.alpha=Math.max(camera.lowerAlphaLimit,Math.min(camera.upperAlphaLimit,cameraDrag.angle+delta*.002));
  lastInput=performance.now();
 }
});
const clearDrag=e=>{if(cameraDrag&&cameraDrag.id===e.pointerId)cameraDrag=null};
canvas.addEventListener('pointerup',clearDrag);
canvas.addEventListener('pointercancel',clearDrag);
function updateCamera(){
 engine.resize();
 const ratio=Math.max(.43,Math.min(2.35,engine.getRenderWidth()/Math.max(1,engine.getRenderHeight())));
 const portrait=ratio<.83;
 // Third-person perspective rather than aerial dollhouse. Zoom is adjusted for a short landscape viewport.
 camera.radius=portrait?8.0:ratio>1.95?5.22:5.78;
 camera.fov=portrait?.91:ratio>1.95?.72:.66;
 camera.beta=1.17;
}
window.addEventListener('resize',()=>{engine.setHardwareScalingLevel(hardwareScale());updateCamera()});
window.addEventListener('orientationchange',()=>setTimeout(updateCamera,240));
updateCamera();
function loop(){
 const dt=Math.min(.055,engine.getDeltaTime()/1000);frameCount++;
 if(!ready||paused){scene.render();return}
 if(frameCount%100===0&&currentStep<8&&performance.now()-lastInput>14000&&performance.now()-lastHint>14000){
  lastHint=performance.now();setInfo('Precisa de ajuda? Use IR ATÉ ou siga o brilho ✨',4300);
 }
 let ix=(pressed.has('KeyD')||pressed.has('ArrowRight')?1:0)-(pressed.has('KeyA')||pressed.has('ArrowLeft')?1:0)+joystick.x;
 let iz=(pressed.has('KeyW')||pressed.has('ArrowUp')?1:0)-(pressed.has('KeyS')||pressed.has('ArrowDown')?1:0)+joystick.y;
 const manual=Math.hypot(ix,iz)>.07;
 if(manual){
  waypoints=[];moving=false;
  // Current on-screen camera basis projected to kitchen floor (same in portrait/landscape).
  const forward=camera.target.subtract(camera.position);forward.y=0;forward.normalize();
  const right=new B.Vector3(-forward.z,0,forward.x);
  const view=camera.getViewMatrix();
  const rScreen=B.Vector3.TransformNormal(right,view);
  if(rScreen.x<0)right.scaleInPlace(-1);
  const move=forward.scale(iz).add(right.scale(ix));
  walk(move.x,move.z,dt);
 }else if(moving&&waypoints.length){
  const next=waypoints[0],dx=next.x-character.position.x,dz=next.z-character.position.z;
  if(Math.hypot(dx,dz)<.11){waypoints.shift()}
  else if(!walk(dx,dz,Math.min(dt,Math.hypot(dx,dz)/2.45))){waypoints=[];moving=false;setInfo('Não consegui chegar. Experimente o joystick.')}
 }else if(moving){moving=false;dest=null}
 updateAvatarAnimation(performance.now()/1000,manual||moving,dt);
 // Keep the character prominent but include a little mission lookahead so the target stays visible.
 const following=new B.Vector3(character.position.x*.76+.04,1.20,character.position.z+.24);
 if(currentStep<8){
  const g=target().proxy.position;
  following.x=following.x*.87+g.x*.13;
  following.z=following.z*.91+g.z*.09;
 }
 if(moving&&dest){following.x=following.x*.82+dest.x*.18;following.z=following.z*.82+dest.z*.18}
 cameraTarget.copyFrom(B.Vector3.Lerp(cameraTarget,following,.055));
 camera.target.copyFrom(cameraTarget);
 targetHalo.rotation.y+=dt*.30; // Rotate horizontally; Z rotation had tilted the goal ring through Hanna.
 targetHalo.scaling.x=targetHalo.scaling.z=1+Math.sin(performance.now()/370)*.055;
 haloGem.position.y+=Math.sin(performance.now()/480)*.00055;
 if(frameCount%9===0){avgFps=engine.getFps();updateAction()}
 scene.render();
}
engine.runRenderLoop(loop);
async function addModel(name,pack,pos,maxSize,rotation=0){
 const base='../pilot/assets/'+pack+'/',r=await B.SceneLoader.ImportMeshAsync('',base,name+'.gltf',scene);
 const roots=r.meshes.filter(x=>!x.parent);
 const meshes=r.meshes.filter(x=>x.getTotalVertices?.()>0);
 if(!meshes.length)throw new Error('Sem geometria em '+name);
 meshes.forEach(m=>{m.computeWorldMatrix(true);m.isPickable=false;m.receiveShadows=true});
 const min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
 meshes.forEach(mesh=>{
  const bounds=mesh.getBoundingInfo().boundingBox;
  min.minimizeInPlace(bounds.minimumWorld);max.maximizeInPlace(bounds.maximumWorld);
 });
 const ext=max.subtract(min),sz=maxSize||[1,1,1];
 const scale=Math.min(sz[0]/Math.max(ext.x,.001),sz[1]/Math.max(ext.y,.001),sz[2]/Math.max(ext.z,.001));
 const root=new B.TransformNode('asset_'+pack+'_'+name,scene);
 for(const mesh of roots)mesh.parent=root;
 root.scaling.setAll(scale);
 root.position.set(pos[0]-(min.x+ext.x*.5)*scale,pos[1]-min.y*scale,pos[2]-(min.z+ext.z*.5)*scale);
 root.rotation.y=rotation;root.parent=roomRoot;
 r.meshes.forEach(m=>{if(m.getTotalVertices?.()>0&&m.isEnabled())shadow.addShadowCaster(m)});
 return {root,meshes,ext,scale};
}
function milkCarton(parent,pos){
 const base=box('milkCarton',pos,[.26,.38,.21],M.white);base.parent=parent;
 const band=box('milkBlueLabel',[pos[0],pos[1],pos[2]-.113],[.21,.16,.015],M.blue);band.parent=parent;
 const roof=B.MeshBuilder.CreateCylinder('milkCartonTop',{diameterTop:0,diameterBottom:.30,height:.19,tessellation:4},scene);
 roof.position.set(pos[0],pos[1]+.275,pos[2]);roof.rotation.y=Math.PI/4;roof.material=M.white;roof.isPickable=false;roof.parent=parent;
 return base;
}

async function loadRoundedKitchenArt(){
 const result=await B.SceneLoader.ImportMeshAsync('','./assets/','kitchen-architecture-r2.glb',scene);
 // Blender glTF is right-handed. Babylon left-handed import mirrors X by default;
 // cancel ONLY that import-space reflection so fridge/sink/stove match gameplay targets.
 const correction=new B.TransformNode('BlenderR2HandednessCorrection',scene);
 correction.scaling.x=-1;
 for(const root of [...result.meshes,...result.transformNodes].filter(n=>!n.parent))root.parent=correction;
 correction.computeWorldMatrix(true);
 const meshes=result.meshes.filter(m=>m.getTotalVertices?.()>0);
 if(meshes.length<45)throw new Error('Blender R2 exportação incompleta ('+meshes.length+' meshes)');
 const min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
 for(const m of meshes){
  m.computeWorldMatrix(true);
  const bb=m.getBoundingInfo().boundingBox;
  min.minimizeInPlace(bb.minimumWorld);max.maximizeInPlace(bb.maximumWorld);
  m.isPickable=false;m.receiveShadows=true;
  if(/B2_(table|chair|fridge)/.test(m.name)) // Avoid room-filling cabinet shadow castsshadow.addShadowCaster(m);
 }
 // Detect a Blender coordinate conversion mistake instead of delivering mirrored/scaled furniture.
 const fridgeNode=result.transformNodes.find(n=>n.name?.includes('B2_fridge_enclosure'))||
   result.meshes.find(n=>n.name?.includes('B2_fridge_enclosure'));
 if(fridgeNode){
  fridgeNode.computeWorldMatrix(true);
  if(Math.abs(fridgeNode.getAbsolutePosition().x+2.95)>.5)
   throw new Error('Geladeira Blender fora da posição da geladeira jogável: '+fridgeNode.getAbsolutePosition().x.toFixed(2));
 }
 if(min.x< -5||max.x>5||min.z< -4||max.z>4||min.y< -.5||max.y>4)
  throw new Error('Coordenadas Blender GLB incorretas: '+min.toString()+'/'+max.toString());
 const r2Decor=new Set(['fridgeBody','fridgeSide','fridgeTop','fridgeToeKick',
  'counterBase','oakCounterEdge','stoneCounterTop','counterShadow',
  'cabinetFace','cabinetInset','cabinetGoldPull',
  'sinkRim','sinkInterior','sinkInnerWhite','brassFaucet','faucetHandle',
  'hobBase','hobBurner','ovenDoor','ovenGlass','ovenGoldHandle',
  'upperCabinetFrame','upperCabinetDoor','upperInset','upperCabinetKnob','cabinetUpperTrim',
  'breakfastTableTop','breakfastTableLip','breakfastTableSilkyTop','tableCenterPedestal','tableFootX','tableFootZ',
  'chairSeat','chairCushion','chairBackUpright','chairPaddedBack','chairLeg',
  'smallFlowerVase','smallFlowerStem','tinyFlowerPetal']);
 let hidden=0;
 for(const mesh of scene.meshes){
  if(r2Decor.has(mesh.name)){mesh.setEnabled(false);hidden++}
 }
 window.__hannaArt=Object.freeze({artPass:'r2-blender',gltfMeshCount:meshes.length,proceduralHidden:hidden,
  bbox:{min:[min.x,min.y,min.z].map(v=>+v.toFixed(2)),max:[max.x,max.y,max.z].map(v=>+v.toFixed(2))}});
}
async function assets(){
 el('loadDetail').textContent='Preparando a Hanna 3D jogável…';
 await loadPlayableAvatar();
 const tasks=[
 ['fridge_A','restaurant',[-2.95,0,2],[1.38,2.24,.92],0,'fridge'],
 ['kitchencounter_sink_backsplash','restaurant',[-.94,0,2.01],[1.50,1.18,.92],0],
 ['kitchencounter_straight_A_backsplash','restaurant',[.50,0,2.01],[1.35,1.18,.92],0],
 ['kitchencounter_straight_B_backsplash','restaurant',[1.89,0,2.01],[1.35,1.18,.92],0],
 ['oven','restaurant',[2.66,0,2.01],[.88,1.35,.92],0],
 ['stove_multi_countertop','restaurant',[2.12,1.04,1.69],[.64,.21,.58],0],
 ['extractorhood','restaurant',[2.15,1.83,2.62],[.93,.8,.58],0],
 ['pan_A','restaurant',[2.04,1.33,1.63],[.46,.17,.46],0],
 ['kitchentable_A_large','restaurant',[-.10,0,-.66],[2.1,.92,1.18],0],
 ['rug_rectangle_stripes_A','furniture',[-.08,.035,-.86],[2.70,.052,1.64],0],
 ['chair_A','restaurant',[-1.51,0,-.64],[.56,.83,.64],-1.40],
 ['chair_A','restaurant',[1.42,0,-.64],[.56,.83,.64],1.40],
 ['plate','restaurant',[-.04,.99,-.68],[.56,.12,.56],0],
 ['bowl','restaurant',[.30,1.00,-.68],[.31,.16,.31],0],
 ['jar_A_small','restaurant',[-.76,1.08,1.72],[.20,.32,.20],0],
 ['jar_B_small','restaurant',[-.52,1.08,1.72],[.20,.32,.20],0],
 ['cuttingboard','restaurant',[1.63,1.08,1.51],[.61,.09,.43],0],
 ['food_ingredient_bun','restaurant',[1.63,1.14,1.47],[.36,.25,.33],0,'bread'],
 ['cactus_small_A','furniture',[-3.56,.86,2.50],[.35,.59,.34],0],
 ['cabinet_small_decorated','furniture',[3.48,0,1.94],[.68,1.16,.68],0],
 ['lamp_table','furniture',[-2.25,.89,2.58],[.30,.54,.32],0],
 ['shelf_A_small','furniture',[.65,1.95,2.64],[1.05,.46,.32],0],
 ['shelf_papertowel','restaurant',[-1.82,1.10,1.81],[.30,.39,.30],0]
 ];
 let i=0;
 for(const [name,pack,pos,scale,rotation,label] of tasks){
  if(!graphics.decor&&['rug_rectangle_stripes_A','jar_B_small','cactus_small_A','lamp_table'].includes(name))continue;
  el('loadDetail').textContent='Montando a cozinha... '+(++i)+'/'+tasks.length+' · '+name;
  try{const out=await addModel(name,pack,pos,scale,rotation);
   modelsLoaded++;
   // Disconnected low-poly kit furniture is retained for license/integrity checks but hidden.
   // Art R1 replaces it with one continuous scene, while game targets and food remain active.
   const replaced=['fridge_A','kitchencounter_sink_backsplash','kitchencounter_straight_A_backsplash',
    'kitchencounter_straight_B_backsplash','oven','stove_multi_countertop',
    'extractorhood','kitchentable_A_large','rug_rectangle_stripes_A','chair_A','cabinet_small_decorated','shelf_A_small'];
   if(replaced.includes(name))out.root.setEnabled(false);
   if(name==='oven')out.meshes.forEach(mesh=>{if(mesh.getTotalVertices?.()>0)mesh.material=M.mint});
   if(label)visuals.set(label,out.root);
   if(name==='fridge_A'){
    out.meshes.filter(m=>/door/i.test(m.name)).forEach(m=>m.setEnabled(false));
   }
  }catch(e){loadErrors.push(name+': '+e.message)}
 }
 if(loadErrors.length)throw new Error('Falha em '+loadErrors.join('; '));
 scene.getMeshByName('rugBase').setEnabled(false);scene.getMeshByName('rugInset').setEnabled(false);
 // Independent pivot provides physically visible swing on the imported refrigerator.
 const pivot=new B.TransformNode('fridgeDoorHinge',scene);pivot.position.set(-3.55,1.10,1.52);
 const door=box('fridgeSwingDoor', [.53,0,-.02],[1.08,2.06,.095],M.trim);door.parent=pivot;
 const panel=box('fridgeDoorInset',[.53,.07,-.082],[.91,1.67,.025],M.blue);panel.parent=pivot;
 const handle=box('fridgeDoorHandle',[1.00,.1,-.135],[.065,.44,.075],M.gold);handle.parent=pivot;
 shadow.addShadowCaster(door);visuals.set('door',pivot);
 const fridgeShelfGroup=new B.TransformNode('fridgeInnerShelves',scene);
 box('fridgeInnerShelf1',[-2.92,1.10,1.45],[.75,.045,.34],M.trim).parent=fridgeShelfGroup;
 box('fridgeInnerShelf2',[-2.92,1.54,1.45],[.75,.045,.34],M.trim).parent=fridgeShelfGroup;
 visuals.set('fridgeShelves',fridgeShelfGroup);
 const milk=new B.TransformNode('milkInFridge',scene);milkCarton(milk,[-3.00,1.25,1.30]);visuals.set('milk',milk);
 const tableMilk=new B.TransformNode('milkOnTable',scene);milkCarton(tableMilk,[-.65,1.22,-.68]);visuals.set('milkTable',tableMilk);
 const breadModel=visuals.get('bread');
 const toaster=new B.TransformNode('roundedToaster',scene);
 const body=box('toasterBody',[1.08,1.21,1.55],[.46,.27,.33],M.coral);body.parent=toaster;
 const top=box('toasterMetalTop',[1.08,1.35,1.55],[.43,.03,.31],M.trim);top.parent=toaster;
 const slot=box('toasterSlot',[1.08,1.367,1.55],[.32,.006,.08],M.hair);slot.parent=toaster;
 visuals.set('toasterGlow',top);
 const toast=new B.TransformNode('toastReady',scene);
 cylinder('toastedBread',[1.10,1.50,1.55],.31,.12,M.gold,10).parent=toast;
 visuals.set('toast',toast);
 const served=new B.TransformNode('servedToast',scene);
 cylinder('servedBread',[-.03,1.17,-.69],.30,.09,M.gold,10).parent=served;
 visuals.set('toastTable',served);
 if(!breadModel)throw new Error('O modelo do pão está ausente');
 window.HannaKitchenArt.rebuild({B,scene,M,box,sphere,cylinder,visuals,shadow,graphics});
 await loadRoundedKitchenArt();
 window.HannaFreeCorner.polish({B,scene,shadow,M,graphics});
}
async function boot(){
 try{
  if(!B.SceneLoader)throw new Error('Babylon GLTF Loader não está disponível');
  await assets();
  ready=true;updateVisuals();updateHUD();loading.hidden=true;
  document.dispatchEvent(new CustomEvent('hanna:v2:ready'));
  // Pilot QA exposes immutable measurements, never an editing/teleport command.
  Object.defineProperty(window,'__hannaKitchenQA',{get:()=>Object.freeze({
   ready,step:currentStep,missionLength:steps.length,avatar:{x:character.position.x,z:character.position.z},
   currentTarget:target().key,distance:distanceTo(target().nav),walking:moving,pathLength:waypoints.length,
   fps:avgFps,orientation:innerHeight>innerWidth?'portrait':'landscape',modelCount:modelsLoaded,
   dpr:window.devicePixelRatio||1,renderScale:engine.getHardwareScalingLevel(),
   bufferWidth:engine.getRenderWidth(),bufferHeight:engine.getRenderHeight(),
   cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight,
   samples:graphics.samples,
   artPass:window.__hannaArt?.artPass||'missing',gltfMeshCount:window.__hannaArt?.gltfMeshCount||0,artBounds:window.__hannaArt?.bbox,cameraMode:camera.mode,cameraBeta:camera.beta,cameraRadius:camera.radius,
   avatarMeshCount,avatarWalkedFrames,blinkMeshCount:blinkParts.length,avatarKind:'hanna-r8-free-glb',hasGameplayRig:!!avatarPivots,
   loadErrors:loadErrors.slice(),saved:mission.restored||currentStep>0,quality:graphics.resolved,saveSchema:2
  })});
  setInfo('A cozinha está pronta! Siga o brilho para começar ✨',2800);
 }catch(e){console.error(e);el('loadDetail').textContent='Erro ao abrir a cozinha: '+e.message;el('loadDetail').setAttribute('data-error','1')}
}
boot();
})();