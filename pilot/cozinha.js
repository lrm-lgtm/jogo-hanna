// Casa da Hanna 3.0 — independent, playable kitchen pilot. Babylon.js + locally vendored KayKit CC0.
(()=>{'use strict';
const B=window.BABYLON,canvas=document.getElementById('game'),loading=document.getElementById('loading');
const el=id=>document.getElementById(id);
if(!B){el('loadDetail').textContent='Não foi possível carregar Babylon.js. Verifique a internet.';return}
const scene=new B.Scene(new B.Engine(canvas,true,{adaptToDeviceRatio:true,stencil:true}));
const engine=scene.getEngine();
scene.clearColor=B.Color4.FromHexString('#d8e9e7ff');
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure=1.22;
scene.imageProcessingConfiguration.contrast=1.13;
const camera=new B.ArcRotateCamera('camera',-Math.PI/2.90,.84,11,new B.Vector3(-.15,.8,0),scene);
camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;
camera.lowerBetaLimit=camera.upperBetaLimit=.84;
camera.lowerAlphaLimit=camera.upperAlphaLimit=-Math.PI/2.90;
camera.panningSensibility=0;
camera.inputs.clear();
scene.activeCamera=camera;
const hemi=new B.HemisphericLight('softSky',new B.Vector3(-.2,1,-.25),scene);
hemi.intensity=.89;hemi.groundColor=B.Color3.FromHexString('#aa8883');
const sun=new B.DirectionalLight('warmWindowLight',new B.Vector3(-.42,-1,.35),scene);
sun.position.set(-3.2,8,-5.8);sun.intensity=1.45;
sun.diffuse=B.Color3.FromHexString('#fff3df');
const warm=new B.PointLight('warmFill',new B.Vector3(3,3,-2),scene);warm.intensity=.20;warm.diffuse=B.Color3.FromHexString('#ffd5a9');
const pipeline=new B.DefaultRenderingPipeline('premiumCartoon',true,scene,[camera]);
pipeline.fxaaEnabled=true;pipeline.samples=1;pipeline.bloomEnabled=false;
const shadow=new B.ShadowGenerator(1024,sun);
shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=18;
const materials={};
function mat(name,hex,roughness=0.85){
 const m=new B.PBRMaterial(name,scene);
 m.albedoColor=B.Color3.FromHexString(hex);m.roughness=roughness;m.metallic=0;
 materials[name]=m;return m;
}
const M={
 floor:mat('warmIvory','#f5e6d1'),wall:mat('peachWall','#f6d8cb'),mint:mat('mintCabinet','#93c7b3'),
 wood:mat('honeyWood','#b97d55'),trim:mat('whiteTrim','#fff5e8'),coral:mat('softCoral','#ed9b87'),
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
function child(mesh){mesh.parent=character;shadow.addShadowCaster(mesh);return mesh}
child(sphere('head',[0,1.39,0],.56,M.skin));
child(sphere('hairCap',[0,1.61,.04],.59,M.hair));
child(sphere('bun',[0,1.67,.23],.30,M.hair));
for(const side of [-1,1]){
 child(sphere('eye'+side,[side*.115,1.40,-.262],.065,M.eyes));
 child(sphere('blush'+side,[side*.195,1.30,-.235],.085,M.coral));
 child(cylinder('leg'+side,[side*.13,.34,0],.17,.62,M.cloth));
 child(sphere('shoe'+side,[side*.13,.10,-.09],.24,M.hair));
 child(cylinder('arm'+side,[side*.31,.88,0],.14,.50,M.skin));
}
child(cylinder('shirt',[0,.90,0],.52,.75,M.berry));
child(box('apron',[0,.81,-.276],[.32,.42,.05],M.trim));
const heart=sphere('apronHeart',[0,.96,-.32],.08,M.coral);child(heart);
child(cylinder('neck',[0,1.17,0],.18,.13,M.skin));
const heldCharm=sphere('heldItem',[.32,1.07,-.37],.16,M.white);heldCharm.parent=character;
heldCharm.setEnabled(false);
const targetHalo=B.MeshBuilder.CreateTorus('targetHalo',{diameter:1.25,thickness:.065,tessellation:42},scene);
targetHalo.rotation.x=Math.PI/2;targetHalo.material=M.gold;targetHalo.position.y=.08;
targetHalo.isPickable=false;
const haloGem=sphere('targetSparkle',[0,1.9,0],.19,M.gold);haloGem.isPickable=false;
const cameraTarget=new B.Vector3(0,.65,0);
let modelsLoaded=0,currentStep=0,moving=false,waypoints=[],dest=null,joystick={x:0,y:0},pressed=new Set(),toastTimeout=null,frameCount=0,avgFps=0,held='',ready=false,loadErrors=[];
const SAVE='hanna_kitchen_pilot_v1';
const steps=[
 {id:'fridge',label:'Abra a geladeira',action:'ABRIR',nav:[-2.95,.38],event:'Geladeira aberta! O leite está lá dentro.'},
 {id:'milk',label:'Pegue o leite',action:'PEGAR',nav:[-2.95,.38],event:'Leite na mão! Agora vamos até a mesa.'},
 {id:'table',label:'Coloque o leite na mesa',action:'COLOCAR',nav:[-.4,-1.72],event:'O leite já está na mesa!'},
 {id:'bread',label:'Pegue o pão',action:'PEGAR',nav:[1.65,.30],event:'Pão na mão! Vamos preparar a torrada.'},
 {id:'toaster',label:'Coloque o pão na torradeira',action:'COLOCAR',nav:[1.50,.30],event:'Prontinho. Vamos ligar a torradeira!'},
 {id:'toaster',label:'Ligue a torradeira',action:'LIGAR',nav:[1.50,.30],event:'Ding! A torrada ficou douradinha.'},
 {id:'toast',label:'Pegue a torrada',action:'PEGAR',nav:[1.50,.30],event:'Que cheirinho gostoso!'},
 {id:'table',label:'Leve a torrada para a mesa',action:'SERVIR',nav:[-.4,-1.72],event:'Café da manhã prontinho!'}
];
try{const save=JSON.parse(localStorage.getItem(SAVE)||'null');if(save&&save.schema===1&&Number.isInteger(save.step)&&save.step>=0&&save.step<=8){currentStep=save.step}}catch(e){}
function persist(){localStorage.setItem(SAVE,JSON.stringify({schema:1,step:currentStep,updated:Date.now()}))}
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
 el('actionBtn').textContent=s.action;
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
 objects.get('milk').proxy.isPickable=currentStep===1;
 objects.get('bread').proxy.isPickable=currentStep===3;
 objects.get('toast').proxy.isPickable=currentStep===6;
 const milk=visuals.get('milk');if(milk)milk.setEnabled(currentStep===1);
 const bread=visuals.get('bread');if(bread)bread.setEnabled(currentStep<=3);
 const toast=visuals.get('toast');if(toast)toast.setEnabled(currentStep===6);
 const milkTable=visuals.get('milkTable');if(milkTable)milkTable.setEnabled(currentStep>=3);
 const toastTable=visuals.get('toastTable');if(toastTable)toastTable.setEnabled(currentStep>=8);
 held=currentStep===2?'milk':currentStep===4?'bread':currentStep===7?'toast':'';
 heldCharm.setEnabled(!!held);
 heldCharm.material=held==='milk'?M.white:held==='bread'?M.gold:M.coral;
 const goal=target();
 targetHalo.position.x=goal.nav.x;targetHalo.position.z=goal.nav.z;
 haloGem.position.x=goal.proxy.position.x;haloGem.position.z=goal.proxy.position.z;haloGem.position.y=goal.proxy.position.y+goal.proxy.scaling.y+.58;
 if(currentStep===8){targetHalo.setEnabled(false);haloGem.setEnabled(false);el('finish').hidden=false}
}
function stepAction(){
 if(currentStep>=8)return;
 const e=target();
 if(distanceTo(e.nav)>.73){setInfo('Vamos caminhar até '+steps[currentStep].label.toLowerCase()+'!');navigate(e.nav);return}
 const s=steps[currentStep],previous=currentStep;
 currentStep++;
 persist();updateVisuals();updateHUD();setInfo('✨ '+s.event,2900);
 if(previous===0 && visuals.get('door')) {
  visuals.get('door').rotation.y=0;
  B.Animation.CreateAndStartAnimation('openFridge',visuals.get('door'),'rotation.y',60,20,0,-1.28,0);
 }
 if(previous===5&&visuals.get('toasterGlow'))visuals.get('toasterGlow').material=M.gold;
 if(currentStep===8){setTimeout(()=>{el('finish').hidden=false},420)}
}
el('actionBtn').addEventListener('click',stepAction);
el('goBtn').addEventListener('click',()=>{if(currentStep<8)navigate(target().nav)});
el('resetBtn').addEventListener('click',()=>{
 if(confirm('Quer começar o Café da Manhã de novo?')){localStorage.removeItem(SAVE);location.reload()}
});
el('againBtn').addEventListener('click',()=>{localStorage.removeItem(SAVE);location.reload()});
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
 const speed=2.45,dx=vx/length*speed*dt,dz=vz/length*speed*dt;
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
 stick.style.transform='translate('+(x*k)+'px,'+(y*k)+'px)';
}
joystickOuter.addEventListener('pointerdown',e=>{e.preventDefault();captured=e.pointerId;joystickOuter.setPointerCapture(e.pointerId);touchJoy(e);waypoints=[];moving=false});
joystickOuter.addEventListener('pointermove',e=>{if(e.pointerId===captured)touchJoy(e)});
function endJoy(e){if(e.pointerId!==captured)return;captured=null;joystick.x=joystick.y=0;stick.style.transform='translate(0px,0px)'}
joystickOuter.addEventListener('pointercancel',endJoy);joystickOuter.addEventListener('pointerup',endJoy);
window.addEventListener('keydown',e=>{if(/^(Arrow|Key[WASD])/.test(e.code)){pressed.add(e.code);waypoints=[];moving=false;e.preventDefault()}});
window.addEventListener('keyup',e=>pressed.delete(e.code));
window.addEventListener('blur',()=>{pressed.clear();joystick.x=joystick.y=0});
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
function updateCamera(){
 const ratio=Math.max(.43,Math.min(2.35,engine.getRenderWidth()/Math.max(1,engine.getRenderHeight())));
 const portrait=ratio<.83;
 const halfHeight=portrait?4.5:ratio>1.35?3.45:4.0;
 camera.orthoTop=halfHeight;camera.orthoBottom=-halfHeight;
 camera.orthoLeft=-halfHeight*ratio;camera.orthoRight=halfHeight*ratio;
 engine.resize();
}
window.addEventListener('resize',updateCamera);
window.addEventListener('orientationchange',()=>setTimeout(updateCamera,240));
updateCamera();
function loop(){
 const dt=Math.min(.055,engine.getDeltaTime()/1000);frameCount++;
 if(!ready){scene.render();return}
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
 const following=new B.Vector3(character.position.x*.68,1.02,character.position.z*.60);
 if(moving&&dest){following.x=following.x*.80+dest.x*.20;following.z=following.z*.8+dest.z*.2}
 cameraTarget.copyFrom(B.Vector3.Lerp(cameraTarget,following,.075));
 camera.target.copyFrom(cameraTarget);
 targetHalo.rotation.z+=dt*.30;
 targetHalo.scaling.x=targetHalo.scaling.z=1+Math.sin(performance.now()/370)*.055;
 haloGem.position.y+=Math.sin(performance.now()/480)*.00055;
 if(frameCount%9===0){avgFps=engine.getFps();updateAction()}
 scene.render();
}
engine.runRenderLoop(loop);
async function addModel(name,pack,pos,maxSize,rotation=0){
 const base='./assets/'+pack+'/',r=await B.SceneLoader.ImportMeshAsync('',base,name+'.gltf',scene);
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
async function assets(){
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
 ['lamp_table','furniture',[-2.25,.89,2.58],[.30,.54,.32],0]
 ];
 let i=0;
 for(const [name,pack,pos,scale,rotation,label] of tasks){
  el('loadDetail').textContent='Montando a cozinha... '+(++i)+'/'+tasks.length+' · '+name;
  try{const out=await addModel(name,pack,pos,scale,rotation);
   modelsLoaded++;
   if(label)visuals.set(label,out.root);
   if(name==='fridge_A'){
    out.meshes.filter(m=>/door/i.test(m.name)).forEach(m=>m.setEnabled(false));
   }
  }catch(e){loadErrors.push(name+': '+e.message)}
 }
 if(loadErrors.length)throw new Error('Falha em '+loadErrors.join('; '));
 // Independent pivot provides physically visible swing on the imported refrigerator.
 const pivot=new B.TransformNode('fridgeDoorHinge',scene);pivot.position.set(-3.55,1.10,1.52);
 const door=box('fridgeSwingDoor', [.53,0,-.02],[1.08,2.06,.095],M.trim);door.parent=pivot;
 const panel=box('fridgeDoorInset',[.53,.07,-.082],[.91,1.67,.025],M.blue);panel.parent=pivot;
 const handle=box('fridgeDoorHandle',[1.00,.1,-.135],[.065,.44,.075],M.gold);handle.parent=pivot;
 shadow.addShadowCaster(door);visuals.set('door',pivot);
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
}
async function boot(){
 try{
  if(!B.SceneLoader)throw new Error('Babylon GLTF Loader não está disponível');
  await assets();
  ready=true;updateVisuals();updateHUD();loading.hidden=true;
  // Pilot QA exposes immutable measurements, never an editing/teleport command.
  Object.defineProperty(window,'__hannaKitchenQA',{get:()=>Object.freeze({
   ready,step:currentStep,missionLength:steps.length,avatar:{x:character.position.x,z:character.position.z},
   currentTarget:target().key,distance:distanceTo(target().nav),walking:moving,pathLength:waypoints.length,
   fps:avgFps,orientation:innerHeight>innerWidth?'portrait':'landscape',modelCount:modelsLoaded,
   loadErrors:loadErrors.slice(),saved:!!localStorage.getItem(SAVE)
  })});
  setInfo('Toque na geladeira brilhando ou use «IR ATÉ».',2800);
 }catch(e){console.error(e);el('loadDetail').textContent='Erro ao abrir a cozinha: '+e.message;el('loadDetail').setAttribute('data-error','1')}
}
boot();
})();