// Casa da Hanna — Cozinha 3D v2 isolada: scene based on working R5 with v2 services.
(()=>{'use strict';
const B=window.BABYLON,canvas=document.getElementById('game'),loading=document.getElementById('loading');
const el=id=>document.getElementById(id);
if(!B){el('loadDetail').textContent='Não foi possível carregar Babylon.js. Verifique a internet.';return}
const scene=new B.Scene(new B.Engine(canvas,true,{adaptToDeviceRatio:true,stencil:true}));
const engine=scene.getEngine();
const quality=window.HannaV2Quality,Controls=window.HannaV2Controls,Cam=window.HannaV2Camera,
 Gait=window.HannaV2Gait,Actions=window.HannaV2Actions,Motion=window.HannaObjectMotion,Anchors=window.HannaV2Anchors;
if(!Controls||!Cam||!Gait||!Actions||!Motion||!Anchors)throw new Error('Controles, câmera ou alvos de interação não foram carregados');
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
if(pipeline.sharpenEnabled){pipeline.sharpen.edgeAmount=.16;pipeline.sharpen.colorAmount=1.0;} // Preserve original luminance while adding subtle edge detail}
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
const objectMotion={door:Motion.create('door'),doorClose:Motion.create('doorClose'),toast:Motion.create('toast'),serve:Motion.create('serve')};
const TOAST_SLOT={x:1.08,y:1.367,z:1.55};
const character=new B.TransformNode('HannaCharacter',scene);
character.position.set(-1.65,0,-2.03);
character.rotation.y=0; // Neutral yaw for calibrating actual imported GLB frontal direction.
let avatarMeshCount=0,avatarPivots=null,avatarRig=null,avatarWalkedFrames=0,blinkParts=[];
const avatarRest=new Map();let avatarRigBaseY=0,avatarFront={x:0,z:1},faceCalibration=0;
let gaitState={phase:0,blend:0,totalDistance:0},lastGait=null,lastFrameMeters=0,lastTravel={x:0,z:0};
let topKneeFlex=0,topHipSwing=0,topActualKneeDegrees=0,topActualHipDegrees=0;
let handMesh=null,actionState=null,lastActionId='',interactionsCompleted=0;
let closestInteractionError=Infinity,lastContactError=null,lastStandDistance=null,lastHandTarget=null;
async function loadPlayableAvatar(){
 const r=await B.SceneLoader.ImportMeshAsync('', './assets/', 'hanna-free-r8.glb',scene);
 const meshes=r.meshes.filter(m=>m.getTotalVertices?.()>0);
 if(meshes.length<80)throw new Error('Modelo Hanna R8 incompleto: '+meshes.length+' malhas');
 for(const root of r.meshes.filter(x=>!x.parent))root.parent=character;
 for(const root of r.transformNodes.filter(x=>!x.parent))root.parent=character;
 const find=n=>r.transformNodes.find(x=>x.name===n||x.name.endsWith('__'+n));
 const names=['HannaRig','HeadPivot','ArmLeftPivot','ArmRightPivot','LegLeftPivot','LegRightPivot',
  'KneeLeftPivot','KneeRightPivot','AnkleLeftPivot','AnkleRightPivot',
  'ElbowLeftPivot','ElbowRightPivot','WristLeftPivot','WristRightPivot','HandRightGrip'];
 const anchors=names.map(find);
 if(anchors.some(x=>!x))throw new Error('Rig R12 incompleto: '+names.filter((_,i)=>!anchors[i]).join(', '));
 avatarPivots={head:anchors[1],leftArm:anchors[2],rightArm:anchors[3],leftLeg:anchors[4],rightLeg:anchors[5],
  leftKnee:anchors[6],rightKnee:anchors[7],leftAnkle:anchors[8],rightAnkle:anchors[9],
  leftElbow:anchors[10],rightElbow:anchors[11],leftWrist:anchors[12],rightWrist:anchors[13],grip:anchors[14]};
 avatarRig=anchors[0];avatarRigBaseY=avatarRig.position.y;
 avatarRest.set(avatarRig,avatarRig.rotationQuaternion?.clone()||B.Quaternion.FromEulerAngles(avatarRig.rotation.x,avatarRig.rotation.y,avatarRig.rotation.z));
 // glTF imports rotationQuaternion; writing node.rotation.x has no visible effect.
 for(const node of Object.values(avatarPivots)){
  const rest=node.rotationQuaternion?.clone()||B.Quaternion.FromEulerAngles(node.rotation.x,node.rotation.y,node.rotation.z);
  avatarRest.set(node,rest);
  if(node!==avatarPivots.grip)node.rotationQuaternion=rest.clone();
 }
 avatarMeshCount=meshes.length;
 // Calibrate forward from actual head/pupil geometry, independent of Blender axis conversion.
 const face=meshes.find(m=>m.name.includes('face-sculpt'));
 const pupils=meshes.filter(m=>m.name.includes('black-pupil-'));
 if(!face||pupils.length!==2)throw new Error('Faltam rosto/pupilas GLB para calibração da frente');
 const center=m=>{m.computeWorldMatrix(true);return m.getBoundingInfo().boundingSphere.centerWorld.clone()};
 const facePos=center(face),eyePos=center(pupils[0]).add(center(pupils[1])).scale(.5);
 const diff=eyePos.subtract(facePos);
 faceCalibration=Math.hypot(diff.x,diff.z);
 if(faceCalibration<.09)throw new Error('Face GLB sem frente definida ('+faceCalibration.toFixed(3)+')');
 avatarFront=Gait.normalize(diff.x,diff.z);
 // The prop's grip is part of the Blender wrist hierarchy, not a world-space approximation.
 handMesh=meshes.find(m=>m.name==='hand-1'||m.name.endsWith('__hand-1'));
 if(!handMesh)throw new Error('A malha real da mão direita está ausente');
 carryRoot.parent=avatarPivots.grip;
 carryRoot.position.set(0,0,0);
 carryRoot.rotationQuaternion=null;carryRoot.rotation.set(0,0,0);
 const toCamera=camera.position.subtract(character.position);
 character.rotation.y=Gait.headingForDirection(avatarFront,toCamera.x,toCamera.z);
 const eyeNames=/sclera-|iris-|black-pupil-|eye-sparkle-/;
 blinkParts=meshes.filter(m=>eyeNames.test(m.name)).map(m=>({mesh:m,scale:m.scaling.y}));
 for(const m of meshes){m.isPickable=false;shadow.addShadowCaster(m);}
 window.__hannaAvatar=Object.freeze({version:'r8-free-blender',model:'hanna-free-r8.glb',eyes:blinkParts.length});
}
function jointPose(node,x=0,y=0,z=0){
 const base=avatarRest.get(node);
 if(!base)return;
 const motion=B.Quaternion.RotationYawPitchRoll(y,x,z);
 const result=base.multiply(motion);
 if(node.rotationQuaternion)node.rotationQuaternion.copyFrom(result);
 else node.rotationQuaternion=result;
}
// Calibrate each gesture against the TRUE exported glTF grip node, not assumed axes.
 // Bounded coordinate descent runs ONCE when Hanna reaches her stand spot; no per-frame IK search.
function solveHandIK(contact){
 const a=avatarPivots,target=new B.Vector3(...contact),lo=[-2.7,-.95,-.85,-2.05,-.85],
 hi=[.65,.95,.85,1.45,.85];
 const pose=x=>{
  jointPose(a.rightArm,x[0],x[1],x[2]);
  jointPose(a.rightElbow,x[3]);
  jointPose(a.rightWrist,x[4]);
  character.computeWorldMatrix(true);
  avatarRig.computeWorldMatrix(true);
  a.rightArm.computeWorldMatrix(true);
  a.rightElbow.computeWorldMatrix(true);
  a.rightWrist.computeWorldMatrix(true);
  a.grip.computeWorldMatrix(true);
  const p=a.grip.getAbsolutePosition();
  return B.Vector3.DistanceSquared(p,target)+.0003*(x[2]*x[2]+x[4]*x[4]);
 };
 let best=null,bestScore=Infinity;
 for(const seed of [[-1.40,0,0,-.12,-.05],[-1.75,0,0,.55,0]]){
  const x=seed.slice();let score=pose(x);
  for(const delta of [.62,.29,.13,.056,.025]){
   for(const axis of [0,1,2,3,4]){
    let bv=x[axis],bs=score;
    for(const sign of [-1,1]){
     const trial=Math.max(lo[axis],Math.min(hi[axis],bv+sign*delta));
     x[axis]=trial;
     const v=pose(x);
     if(v<bs){bs=v;bv=trial}
    }
    x[axis]=bv;score=pose(x);
   }
   if(score<.0064)break;
  }
  if(score<bestScore){bestScore=score;best=x.slice()}
  if(bestScore<.0064)break;
 }
 return {angles:best,estimatedError:+Math.sqrt(Math.max(0,bestScore)).toFixed(3)};
}
function jointActualDegrees(node){
 const rest=avatarRest.get(node),q=node?.rotationQuaternion;
 if(!rest||!q)return 0;
 const dot=rest.x*q.x+rest.y*q.y+rest.z*q.z+rest.w*q.w;
 const size=Math.hypot(rest.x,rest.y,rest.z,rest.w)*Math.hypot(q.x,q.y,q.z,q.w);
 return (2*Math.acos(Math.min(1,Math.abs(dot)/Math.max(size,1e-8))))*180/Math.PI;
}
function updateAvatarAnimation(t,travel,dt){
 if(!avatarPivots)return;
 gaitState=Gait.sample(gaitState,travel,dt,t);
 const a=avatarPivots,p=gaitState;
 jointPose(a.leftLeg,p.leftHip);
 jointPose(a.rightLeg,p.rightHip);
 jointPose(a.leftKnee,p.leftKnee);
 jointPose(a.rightKnee,p.rightKnee);
 jointPose(a.leftAnkle,p.leftAnkle);
 jointPose(a.rightAnkle,p.rightAnkle);
 const gesture=actionState&&!actionState.approaching?Actions.pose(actionState.id,actionState.elapsed):null;
 const reach=gesture?.reach||0;
 jointPose(a.leftArm,p.arms.left);
 const naturalArm=p.arms.right-(held?.76:0);
 const aim=actionState?.ik?.angles;
 const lerp=(start,end,f)=>start+(end-start)*f;
 const rightArm=aim?lerp(naturalArm,aim[0],reach):naturalArm;
 const shoulderYaw=aim?aim[1]*reach:0,shoulderRoll=aim?aim[2]*reach:0;
 const elbow=aim?lerp(.11,aim[3],reach):.11;
 const wrist=aim?lerp(-.11,aim[4],reach):-.11;
 if(actionState&&reach>.005)lastHandTarget=actionState.contact.hand;
 jointPose(a.rightArm,rightArm,shoulderYaw,shoulderRoll);
 jointPose(a.rightElbow,elbow);
 jointPose(a.rightWrist,wrist);
 jointPose(a.leftElbow,.08);
 jointPose(a.leftWrist,-.08);
 jointPose(a.head,gesture?.lean||0,Math.sin(t*.93)*.05,Math.sin(t*1.8)*.014);
 if(actionState&&reach>.25){
  a.grip.computeWorldMatrix(true);
  const hp=a.grip.getAbsolutePosition(),c=actionState.contact.hand;
  const err=Math.hypot(hp.x-c[0],hp.y-c[1],hp.z-c[2]);
  closestInteractionError=Math.min(closestInteractionError,err);
 }
 const period=t%5.4;
 const blink=Math.abs(period-2.62)<.095?Math.max(.10,Math.abs(period-2.62)/.095):1;
 for(const part of blinkParts)part.mesh.scaling.y=part.scale*blink;
 if(avatarRig){avatarRig.position.y=avatarRigBaseY+p.bob;jointPose(avatarRig,0,0,p.pelvisSway)}
 if(travel>.00005)avatarWalkedFrames++;
 topKneeFlex=Math.max(topKneeFlex,p.leftKnee,p.rightKnee);
 topHipSwing=Math.max(topHipSwing,Math.abs(p.leftHip),Math.abs(p.rightHip));
 topActualKneeDegrees=Math.max(topActualKneeDegrees,jointActualDegrees(a.leftKnee),jointActualDegrees(a.rightKnee));
 topActualHipDegrees=Math.max(topActualHipDegrees,jointActualDegrees(a.leftLeg),jointActualDegrees(a.rightLeg));
 lastGait=p;
}
// A carried item is a recognizable miniature prop — not the old placeholder sphere.
const carryRoot=new B.TransformNode('carriedBreakfastProp',scene);
carryRoot.parent=character;carryRoot.position.set(.34,1.05,-.33); // Temporary: reassigned to real palm when GLB finishes loading.
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
const cameraTarget=new B.Vector3(-1.5,1.26,-1.7);
let cutawayHidden=[],modelsLoaded=0,currentStep=0,moving=false,waypoints=[],dest=null,joystick={x:0,y:0},smoothInput={x:0,y:0},manualMeters=0,pressed=new Set(),toastTimeout=null,frameCount=0,avgFps=0,held='',ready=false,loadErrors=[];
const mission=new window.HannaV2Mission.BreakfastMission({storage:window.localStorage});
const steps=window.HannaV2Mission.STEPS.map(s=>({id:s.target,label:s.text,action:s.verb,nav:s.nav,event:s.feedback,voice:s.voice,icon:s.icon,animation:s.animation}));
currentStep=mission.step;
const audio=()=>window.HannaV2Audio;
let paused=false,lastInput=performance.now(),lastHint=performance.now(),gestureUntil=0,joyMaxSince=0;
function persist(){return mission.persist()}
document.addEventListener('hanna:v2:pause',e=>{
 paused=!!e.detail.paused;
 if(paused){pressed.clear();smoothInput.x=smoothInput.y=0;releaseJoystick()}
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
 el('actionBtn').disabled=!close||!!actionState;
 el('goBtn').disabled=currentStep>=8||!!actionState;
 el('statusText').textContent=currentStep>=8?'Muito bem!':close?'Agora toque em '+steps[currentStep].action:'Encontre o objeto brilhando ✨';
}
function updateVisuals(){
 const fridgeOpen=currentStep===1||(currentStep===2&&actionState?.previous===1);
 if(visuals.get('door')&&!objectMotion.door.playing&&!objectMotion.doorClose.playing)
  visuals.get('door').rotation.y=fridgeOpen?Motion.SETUP.door.to:Motion.SETUP.door.from;
 if(visuals.get('fridgeShelves'))visuals.get('fridgeShelves').setEnabled(fridgeOpen);
 objects.get('milk').proxy.isPickable=currentStep===1;
 objects.get('bread').proxy.isPickable=currentStep===3;
 objects.get('toast').proxy.isPickable=currentStep===6;
 const milk=visuals.get('milk');if(milk)milk.setEnabled(currentStep===1);
 const bread=visuals.get('bread');if(bread)bread.setEnabled(currentStep<=3);
 const toast=visuals.get('toast');
 if(toast){toast.setEnabled(currentStep===6);if(!objectMotion.toast.playing)toast.position.y=Motion.SETUP.toast.to;}
 const milkTable=visuals.get('milkTable');if(milkTable)milkTable.setEnabled(currentStep>=3);
 const toastTable=visuals.get('toastTable');
 if(toastTable){toastTable.setEnabled(currentStep>=8);if(!objectMotion.serve.playing)toastTable.position.y=Motion.SETUP.serve.to;}
 held=currentStep===2?'milk':currentStep===4?'bread':currentStep===7?'toast':'';
 for(const [kind,group] of Object.entries(carried))group.setEnabled(kind===held);
 const goal=target();
 // Highlight the actual object, not the walk destination.
 targetHalo.position.x=goal.nav.x;targetHalo.position.z=goal.nav.z;
 targetHalo.position.y=.06;
 haloGem.position.x=goal.proxy.position.x;haloGem.position.z=goal.proxy.position.z;haloGem.position.y=goal.proxy.position.y+goal.proxy.getBoundingInfo().boundingBox.extendSizeWorld.y+.35;
 if(currentStep===8){targetHalo.setEnabled(false);haloGem.setEnabled(false);el('finish').hidden=false}
}
function commitAction(state){
 if(state.committed)return;
 const previous=state.previous,goal=objects.get(steps[previous].id);
 const change=mission.advance(goal.key,distanceTo(goal.nav));
 if(!change.ok){setInfo('A Hanna precisa chegar mais perto para interagir.');return}
 state.committed=true;interactionsCompleted++;lastActionId=state.id;
 const s=steps[previous];
 currentStep=mission.step;lastInput=performance.now();
 updateVisuals();updateHUD();setInfo('✨ '+s.event,2900);
 audio()?.beep(previous===5?880:620,.15);audio()?.speak(s.event);
 if(previous===0&&visuals.get('door')){
  Motion.start(objectMotion.door);
  visuals.get('door').rotation.y=objectMotion.door.value;
 }
 if(previous===5){
  const glow=visuals.get('toasterGlow');if(glow)glow.material=M.gold;
  const toast=visuals.get('toast');
  if(toast){Motion.start(objectMotion.toast);toast.position.y=objectMotion.toast.value}
 }
 if(previous===7){
  const served=visuals.get('toastTable');
  if(served){Motion.start(objectMotion.serve);served.position.y=objectMotion.serve.value}
 }
 if(currentStep===8)setTimeout(()=>{el('finish').hidden=false},420);
}
function updateObjectAnimations(dt){
 const door=visuals.get('door'),toast=visuals.get('toast'),served=visuals.get('toastTable');
 if(door&&objectMotion.door.playing)door.rotation.y=Motion.tick(objectMotion.door,dt);
 if(door&&objectMotion.doorClose.playing)door.rotation.y=Motion.tick(objectMotion.doorClose,dt);
 if(objectMotion.doorClose.playing&&visuals.get('fridgeShelves'))visuals.get('fridgeShelves').setEnabled(true);
 if(!objectMotion.doorClose.playing&&objectMotion.doorClose.plays&&visuals.get('fridgeShelves'))visuals.get('fridgeShelves').setEnabled(false);
 if(toast&&objectMotion.toast.playing)toast.position.y=Motion.tick(objectMotion.toast,dt);
 if(served&&objectMotion.serve.playing)served.position.y=Motion.tick(objectMotion.serve,dt);
}
function stepAction(){
 if(paused||currentStep>=8||actionState)return;
 const goal=target();
 if(distanceTo(goal.nav)>.73){setInfo('Vamos caminhar até '+steps[currentStep].label.toLowerCase()+'!');navigate(goal.nav);return}
 const can=mission.canInteract(goal.key,distanceTo(goal.nav));
 if(!can.ok){setInfo('Vamos fazer uma coisa de cada vez!');return}
 const id=window.HannaV2Mission.STEPS[currentStep].id;
 const contact=Anchors.targetFor(id);
 actionState={id,contact,previous:currentStep,elapsed:0,committed:false,approaching:true}; 
 closestInteractionError=Infinity;lastContactError=null;
 lastStandDistance=null;lastHandTarget=null;
 moving=false;waypoints=[];dest=null;pressed.clear();releaseJoystick();
 updateAction();
}
function updateActionSequence(dt){
 if(!actionState)return;
 const state=actionState;
 if(state.approaching){
  const stand=state.contact.stand;
  const dist=Anchors.distance2(character.position.x,character.position.z,...stand);
  lastStandDistance=dist;
  if(dist>.055){
   const moved=walk(stand[0]-character.position.x,stand[1]-character.position.z,Math.min(dt,dist/1.6),.65);
   if(!moved&&dist>.35){setInfo('Chegue mais perto do objeto para interagir.');actionState=null;updateAction()}
   return;
  }
  const aim=Anchors.direction(stand,state.contact.hand),yaw=Gait.headingForDirection(avatarFront,aim.x,aim.z);
  character.rotation.y=Controls.smoothAngle(character.rotation.y,yaw,Math.min(dt,.055),12);
  const aligned=Gait.facingDot(avatarFront,character.rotation.y,aim.x,aim.z);
  if(aligned<.985)return;
  state.ik=solveHandIK(state.contact.hand);
  state.approaching=false;state.elapsed=0;
 }
 state.elapsed+=Math.min(.14,dt);
 const pose=Actions.pose(state.id,state.elapsed);
 if(pose.contact&&!state.committed){
  avatarPivots.grip?.computeWorldMatrix(true);
  const hand=avatarPivots.grip?.getAbsolutePosition(),c=state.contact.hand;
  lastContactError=hand?+Math.hypot(hand.x-c[0],hand.y-c[1],hand.z-c[2]).toFixed(3):null;
  commitAction(state);
 }
 if(pose.done){
  // Let the hand return to natural carry pose; never drop an item behind the character.
  if(!state.committed)commitAction(state);
  if(state.previous===1&&state.committed)Motion.start(objectMotion.doorClose);
  actionState=null;updateAction();
 }
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
function walk(vx,vz,dt,throttle=1){
 const length=Math.hypot(vx,vz);
 if(length<.001||throttle<.015)return false;
 // Analog magnitude is intentionally preserved: gentle deflection = slow walk.
 const speed=2.45*(joyMaxSince&&performance.now()-joyMaxSince>1100?1.16:1)*Math.min(1,Math.max(0,throttle));
 const dx=vx/length*speed*dt,dz=vz/length*speed*dt;
 const now=character.position,oldX=now.x,oldZ=now.z;
 if(!occupied(now.x+dx,now.z))now.x+=dx;
 if(!occupied(now.x,now.z+dz))now.z+=dz;
 const actualX=now.x-oldX,actualZ=now.z-oldZ,travel=Math.hypot(actualX,actualZ);
 if(travel>.00001){
  const targetYaw=Gait.headingForDirection(avatarFront,actualX,actualZ);
  character.rotation.y=Controls.smoothAngle(character.rotation.y,targetYaw,dt,16);
  lastFrameMeters+=travel;
  lastTravel={x:actualX/travel,z:actualZ/travel};
  return true;
 }
 return false;
}
const joystickOuter=el('joystick'),stick=el('stick');
let captured=null;
function touchJoy(e){
 const r=joystickOuter.getBoundingClientRect();
 const x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
 const pad=Controls.pad(x,y,Math.max(12,r.width*.29));
 joystick.x=pad.x;joystick.y=pad.y;
 if(pad.magnitude>.96){if(!joyMaxSince)joyMaxSince=performance.now()}else joyMaxSince=0;
 stick.style.transform='translate('+pad.knobX.toFixed(2)+'px,'+pad.knobY.toFixed(2)+'px)';
}
function releaseJoystick(){
 const id=captured;captured=null;joyMaxSince=0;
 joystick.x=joystick.y=0;smoothInput.x=smoothInput.y=0;
 stick.style.transform='translate(0px,0px)';
 if(id!==null&&joystickOuter.hasPointerCapture?.(id)){
  try{joystickOuter.releasePointerCapture(id)}catch(_e){/* already released */}
 }
}
joystickOuter.addEventListener('pointerdown',e=>{
 if(captured!==null||paused||!ready)return;
 e.preventDefault();
 captured=e.pointerId;
 try{joystickOuter.setPointerCapture(e.pointerId)}catch(_e){/* use window fallback */}
 touchJoy(e);lastInput=performance.now();
 waypoints=[];moving=false;
});
joystickOuter.addEventListener('pointermove',e=>{
 if(e.pointerId!==captured)return;
 e.preventDefault();touchJoy(e);lastInput=performance.now();
});
function endJoy(e){if(e.pointerId===captured)releaseJoystick()}
joystickOuter.addEventListener('pointerup',endJoy);
joystickOuter.addEventListener('pointercancel',endJoy);
joystickOuter.addEventListener('lostpointercapture',endJoy);
window.addEventListener('pointerup',endJoy);
window.addEventListener('pointercancel',endJoy);
window.addEventListener('keydown',e=>{
 if(paused)return;
 if(/^(Arrow|Key[WASD])/.test(e.code)){
  pressed.add(e.code);lastInput=performance.now();waypoints=[];moving=false;e.preventDefault()
 }
});
window.addEventListener('keyup',e=>pressed.delete(e.code));
window.addEventListener('blur',()=>{
 pressed.clear();releaseJoystick()
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){pressed.clear();releaseJoystick()}
});
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
 const actualDt=Math.max(.001,engine.getDeltaTime()/1000),dt=Math.min(.055,actualDt);frameCount++;lastFrameMeters=0;
 if(!ready||paused){scene.render();return}
 if(frameCount%100===0&&currentStep<8&&performance.now()-lastInput>14000&&performance.now()-lastHint>14000){
  lastHint=performance.now();setInfo('Precisa de ajuda? Use IR ATÉ ou siga o brilho ✨',4300);
 }
 const keyX=(pressed.has('KeyD')||pressed.has('ArrowRight')?1:0)-(pressed.has('KeyA')||pressed.has('ArrowLeft')?1:0);
 const keyY=(pressed.has('KeyW')||pressed.has('ArrowUp')?1:0)-(pressed.has('KeyS')||pressed.has('ArrowDown')?1:0);
 const wantedX=actionState?0:(keyX||joystick.x),wantedY=actionState?0:(keyY||joystick.y);
 smoothInput.x=Controls.smoothAxis(smoothInput.x,wantedX,dt,15);
 smoothInput.y=Controls.smoothAxis(smoothInput.y,wantedY,dt,15);
 if(!wantedX&&Math.abs(smoothInput.x)<.02)smoothInput.x=0;
 if(!wantedY&&Math.abs(smoothInput.y)<.02)smoothInput.y=0;
 const manual=!actionState&&Math.hypot(smoothInput.x,smoothInput.y)>.055;
 if(actionState){moving=false;waypoints=[];smoothInput.x=smoothInput.y=0}
 else if(manual){
  waypoints=[];moving=false;
  const forward=camera.target.subtract(camera.position);forward.y=0;forward.normalize();
  const right=new B.Vector3(-forward.z,0,forward.x);
  const rightScreen=B.Vector3.TransformNormal(right,camera.getViewMatrix());
  const move=Controls.screenToWorld(smoothInput.x,smoothInput.y,forward.x,forward.z,rightScreen.x<0?-1:1);
  const ox=character.position.x,oz=character.position.z;
  walk(move.x,move.z,dt,move.magnitude);
  manualMeters+=Math.hypot(character.position.x-ox,character.position.z-oz);
 }else if(moving&&waypoints.length){
  const next=waypoints[0],dx=next.x-character.position.x,dz=next.z-character.position.z;
  if(Math.hypot(dx,dz)<.11){waypoints.shift()}
  else if(!walk(dx,dz,Math.min(dt,Math.hypot(dx,dz)/2.45))){waypoints=[];moving=false;setInfo('Não consegui chegar. Experimente o joystick.')}
 }else if(moving){moving=false;dest=null}
 updateActionSequence(actualDt);
 updateObjectAnimations(actualDt);
 updateAvatarAnimation(performance.now()/1000,lastFrameMeters,dt);
 // Child-first framing: real frame-time follow + slight goal lead, never let a wall take the foreground.
 const navTarget=currentStep<8?target().proxy.position:character.position;
 const wanted=Cam.focus(character.position.x,character.position.z,navTarget.x,navTarget.z,
                         moving, dest?.x??navTarget.x,dest?.z??navTarget.z);
 cameraTarget.x+=(wanted.x-cameraTarget.x)*Cam.alpha(actualDt);
 cameraTarget.y+=(wanted.y-cameraTarget.y)*Cam.alpha(actualDt);
 cameraTarget.z+=(wanted.z-cameraTarget.z)*Cam.alpha(actualDt);
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
  if(/B2_(table|chair|fridge)/.test(m.name))shadow.addShadowCaster(m); // Exclude cabinets
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
 ['plate','restaurant',[-.04,.99,-1.01],[.56,.12,.56],0],
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
 // R16: a hollow refrigerator. The imported GLB cuboid front is hidden below, not
 // allowed to obscure the interior when the animated door rotates OUT toward -Z.
 const fridgeShellMat=mat('fridgeR16Pink','#eda7ad',.40),
       fridgeLiner=mat('fridgeR16Cream','#fff1e6',.75),
       fridgeBackMat=mat('fridgeR16Interior','#e9d8cf',.84);
 const shellRoot=new B.TransformNode('fridgeR16HollowBody',scene);
 function fridgePanel(name,pos,dims,material){
  const p=box(name,pos,dims,material);p.parent=shellRoot;p.receiveShadows=true;return p;
 }
 fridgePanel('fridgeR16Back',[-2.95,1.17,2.47],[1.13,2.14,.07],fridgeBackMat);
 fridgePanel('fridgeR16LeftSide',[-3.51,1.15,2.05],[.08,2.22,.89],fridgeShellMat);
 fridgePanel('fridgeR16RightSide',[-2.39,1.15,2.05],[.08,2.22,.89],fridgeShellMat);
 fridgePanel('fridgeR16Ceiling',[-2.95,2.25,2.05],[1.19,.06,.91],fridgeLiner);
 fridgePanel('fridgeR16Floor',[-2.95,.19,2.05],[1.19,.06,.91],fridgeLiner);
 fridgePanel('fridgeR16FrontLintel',[-2.95,2.21,1.59],[1.14,.08,.09],fridgeShellMat);
 const pivot=new B.TransformNode('fridgeDoorHinge',scene);
 pivot.position.set(-3.55,1.10,1.50); // +Y yaw swings door outwards towards player (-Z)
 const door=box('fridgeSwingDoor',[.54,.03,-.04],[1.10,2.08,.09],M.trim);door.parent=pivot;
 const panel=box('fridgeDoorInset',[.54,.10,-.105],[.94,1.69,.029],M.blue);panel.parent=pivot;
 const handle=box('fridgeDoorHandle',[1.00,.08,-.165],[.065,.43,.08],M.gold);handle.parent=pivot;
 shadow.addShadowCaster(door);visuals.set('door',pivot);
 const fridgeShelfGroup=new B.TransformNode('fridgeInnerShelves',scene);
 const s1=box('fridgeInnerShelf1',[-2.95,1.10,2.00],[.98,.047,.66],fridgeLiner);s1.parent=fridgeShelfGroup;
 const s2=box('fridgeInnerShelf2',[-2.95,1.55,2.00],[.98,.047,.66],fridgeLiner);s2.parent=fridgeShelfGroup;
 sphere('fridgeR16Fruit',[-3.26,.53,2.20],.17,M.berry).parent=fridgeShelfGroup;
 sphere('fridgeR16Jar',[-2.68,1.31,2.19],.17,M.blue).parent=fridgeShelfGroup;
 visuals.set('fridgeShelves',fridgeShelfGroup);
 const milk=new B.TransformNode('milkInFridge',scene);
 milkCarton(milk,[-3.00,1.24,1.735]);visuals.set('milk',milk);
 const tableMilk=new B.TransformNode('milkOnTable',scene);milkCarton(tableMilk,[-.65,1.22,-1.10]);visuals.set('milkTable',tableMilk);
 const breadModel=visuals.get('bread');
 const toaster=new B.TransformNode('roundedToaster',scene);
 const body=box('toasterBody',[1.08,1.21,1.55],[.46,.27,.33],M.coral);body.parent=toaster;
 const top=box('toasterMetalTop',[1.08,1.35,1.55],[.43,.03,.31],M.trim);top.parent=toaster;
 const slot=box('toasterSlot',[1.08,1.367,1.55],[.32,.006,.08],M.hair);slot.parent=toaster;
 visuals.set('toasterGlow',top);
 const toast=new B.TransformNode('toastReady',scene);
 toast.position.set(TOAST_SLOT.x,Motion.SETUP.toast.from,TOAST_SLOT.z);
 // Vertical bread slice starts inside the toaster's real slot (1.367m).
 const crust=B.MeshBuilder.CreateBox('toastCrust',{width:.255,height:.30,depth:.055},scene);
 crust.parent=toast;crust.material=M.wood;crust.isPickable=false;
 const crumb=B.MeshBuilder.CreateBox('toastGoldenCenter',{width:.219,height:.258,depth:.062},scene);
 crumb.parent=toast;crumb.material=M.gold;crumb.isPickable=false;
 visuals.set('toast',toast);
 const served=new B.TransformNode('servedToast',scene);
 cylinder('servedBread',[-.03,1.10,-1.01],.30,.09,M.gold,10).parent=served;
 visuals.set('toastTable',served);
 if(!breadModel)throw new Error('O modelo do pão está ausente');
 window.HannaKitchenArt.rebuild({B,scene,M,box,sphere,cylinder,visuals,shadow,graphics});
 await loadRoundedKitchenArt();
 // R16 regression: a solid original GLB enclosure concealed the swinging door.
 const solidBlocker=scene.getMeshByName('B2_fridge_enclosure');
 if(!solidBlocker)throw new Error('Original fridge GLB shell unavailable for opening cutout');
 solidBlocker.setEnabled(false);
 window.HannaFreeCorner.polish({B,scene,shadow,M,graphics});
 // Deliberate dollhouse cutaway: side wall concealed visually but physics/mission rules unchanged.
 cutawayHidden=[];
 for(const id of Cam.CUTAWAY){
  const mesh=scene.getMeshByName(id);
  if(mesh){mesh.setEnabled(false);cutawayHidden.push(id)}
 }
 if(!cutawayHidden.includes('leftWall'))throw new Error('Parede lateral não foi removida do enquadramento');
}
function projectedHanna(){
 const viewport=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());
 const projected=B.Vector3.Project(character.position.add(new B.Vector3(0,1.40,0)),
                                    B.Matrix.Identity(),scene.getTransformMatrix(),viewport);
 return {x:+(projected.x/engine.getRenderWidth()).toFixed(3),
         y:+(projected.y/engine.getRenderHeight()).toFixed(3),
         visible:Cam.framedHead(projected.x/engine.getRenderWidth(),projected.y/engine.getRenderHeight())};
}
async function boot(){
 try{
  if(!B.SceneLoader)throw new Error('Babylon GLTF Loader não está disponível');
  await assets();
  // Restored saves must load settled; opening animations never replay on reload.
 Motion.settle(objectMotion.door,currentStep>=1);
 Motion.settle(objectMotion.doorClose,currentStep>=2);
 Motion.settle(objectMotion.toast,currentStep>=6);
 Motion.settle(objectMotion.serve,currentStep>=8);
 ready=true;updateVisuals();updateHUD();loading.hidden=true;
  document.dispatchEvent(new CustomEvent('hanna:v2:ready'));
  // Pilot QA exposes immutable measurements, never an editing/teleport command.
  Object.defineProperty(window,'__hannaKitchenQA',{get:()=>Object.freeze({
   ready,step:currentStep,missionLength:steps.length,avatar:{x:character.position.x,z:character.position.z,yaw:character.rotation.y},
   joystick:{x:joystick.x,y:joystick.y,active:captured!==null,magnitude:Math.hypot(joystick.x,joystick.y)},
   manualMeters:+manualMeters.toFixed(3),
   currentTarget:target().key,distance:distanceTo(target().nav),walking:moving,pathLength:waypoints.length,
   fps:avgFps,orientation:innerHeight>innerWidth?'portrait':'landscape',modelCount:modelsLoaded,
   dpr:window.devicePixelRatio||1,renderScale:engine.getHardwareScalingLevel(),
   bufferWidth:engine.getRenderWidth(),bufferHeight:engine.getRenderHeight(),
   cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight,
   samples:graphics.samples,
   artPass:window.__hannaArt?.artPass||'missing',gltfMeshCount:window.__hannaArt?.gltfMeshCount||0,artBounds:window.__hannaArt?.bbox,cameraMode:camera.mode,cameraBeta:camera.beta,cameraRadius:camera.radius,
   cameraFrame:projectedHanna(),cutawayHidden:cutawayHidden.slice(),cameraTarget:{x:+cameraTarget.x.toFixed(2),z:+cameraTarget.z.toFixed(2)},
   avatarMeshCount,avatarWalkedFrames,blinkMeshCount:blinkParts.length,avatarKind:'hanna-r15-free-glb',hasGameplayRig:!!avatarPivots,
   held,action:actionState?{id:actionState.id,progress:+Actions.pose(actionState.id,actionState.elapsed).progress.toFixed(2),
     contact:actionState.committed}:null,interactionsCompleted,lastActionId,
   propHandDistance:avatarPivots?.grip?+(B.Vector3.Distance(avatarPivots.grip.getAbsolutePosition(),carryRoot.getAbsolutePosition())).toFixed(3):null,
   heldFrontOffset:(()=>{
    const f=Gait.rotateFace(avatarFront,character.rotation.y),w=carryRoot.getAbsolutePosition();
    return +((w.x-character.position.x)*f.x+(w.z-character.position.z)*f.z).toFixed(3);
   })(),
   carryParent:carryRoot.parent?.name||'',
   interaction:{id:actionState?.id||lastActionId,approaching:!!actionState?.approaching,
    stageDistance:lastStandDistance,contactError:lastContactError,
    calibratedReach:actionState?.ik?.estimatedError??null,
    closestError:Number.isFinite(closestInteractionError)?+closestInteractionError.toFixed(3):null,
    target:lastHandTarget},
   objectMotion:Object.fromEntries(Object.entries(objectMotion).map(([k,v])=>
    [k,{plays:v.plays,playing:v.playing,value:+v.value.toFixed(3)}])),
   toasterSlotY:TOAST_SLOT.y,
   toastTopY:visuals.get('toast')?+(visuals.get('toast').position.y+.15).toFixed(3):null,
   toastBottomY:visuals.get('toast')?+(visuals.get('toast').position.y-.15).toFixed(3):null,
   doorRenderedAngle:visuals.get('door')?+visuals.get('door').rotation.y.toFixed(3):null,
   fridgeSolidEnabled:!!scene.getMeshByName('B2_fridge_enclosure')?.isEnabled(),
   fridgeInteriorPresent:!!scene.getMeshByName('fridgeR16Back')?.isEnabled(),
   fridgeShelvesVisible:!!visuals.get('fridgeShelves')?.isEnabled(),
   toastReadyVisible:!!visuals.get('toast')?.isEnabled(),
   frontAxis:{x:+avatarFront.x.toFixed(3),z:+avatarFront.z.toFixed(3),confidence:+faceCalibration.toFixed(3)},
   worldFace:(()=>{const v=Gait.rotateFace(avatarFront,character.rotation.y);return {x:+v.x.toFixed(3),z:+v.z.toFixed(3)}})(),
   faceDot:Math.hypot(lastTravel.x,lastTravel.z)>0?+Gait.facingDot(avatarFront,character.rotation.y,lastTravel.x,lastTravel.z).toFixed(3):null,
   gait:{distance:+gaitState.totalDistance.toFixed(3),blend:+gaitState.blend.toFixed(3),phase:+gaitState.phase.toFixed(3),
         hipSwing:+(lastGait?.leftHip||0).toFixed(3),leftKnee:+(lastGait?.leftKnee||0).toFixed(3),rightKnee:+(lastGait?.rightKnee||0).toFixed(3),
         peakKnee:+topKneeFlex.toFixed(3),peakHip:+topHipSwing.toFixed(3),
         realKneeDeg:+topActualKneeDegrees.toFixed(1),realHipDeg:+topActualHipDegrees.toFixed(1)},
   loadErrors:loadErrors.slice(),saved:mission.restored||currentStep>0,quality:graphics.resolved,saveSchema:2
  })});
  setInfo('A cozinha está pronta! Siga o brilho para começar ✨',2800);
 }catch(e){console.error(e);el('loadDetail').textContent='Erro ao abrir a cozinha: '+e.message;el('loadDetail').setAttribute('data-error','1')}
}
boot();
})();