(()=>{
'use strict';
const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
if(!mobile)return;

const viewport=document.querySelector('meta[name="viewport"]');
const VP='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
if(viewport)viewport.setAttribute('content',VP);

function fitViewport(){
  const vv=window.visualViewport;
  const w=Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth);
  const h=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight);
  document.documentElement.style.setProperty('--app-w',w+'px');
  document.documentElement.style.setProperty('--app-h',h+'px');
  document.body?.style.setProperty('--app-w',w+'px');
  document.body?.style.setProperty('--app-h',h+'px');
  try{window.scrollTo(0,0)}catch(e){}
  try{BABYLON?.EngineStore?.LastCreatedScene?.getEngine?.().resize()}catch(e){}
}
fitViewport();
window.addEventListener('resize',fitViewport,{passive:true});
window.addEventListener('orientationchange',()=>{
  setTimeout(fitViewport,80);setTimeout(fitViewport,280);setTimeout(fitViewport,650);
},{passive:true});
window.visualViewport?.addEventListener('resize',fitViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',fitViewport,{passive:true});

const cancel=e=>{if(e.cancelable)e.preventDefault()};
['gesturestart','gesturechange','gestureend'].forEach(type=>{
  document.addEventListener(type,cancel,{passive:false,capture:true});
});
document.addEventListener('dblclick',cancel,{passive:false,capture:true});
document.addEventListener('touchstart',e=>{
  if(e.touches&&e.touches.length>1)cancel(e);
},{passive:false,capture:true});
document.addEventListener('touchmove',e=>{
  if(e.touches&&e.touches.length>1)cancel(e);
},{passive:false,capture:true});

function lockGameTouches(){
  ['game','joystick','stick','useBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    el.style.touchAction='none';
    el.style.webkitUserSelect='none';
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lockGameTouches,{once:true});
else lockGameTouches();

// Impede o Babylon de religar pinch/zoom automaticamente.
// A rotação no celular será feita por um controle nosso, de 1 dedo.
if(window.BABYLON?.ArcRotateCamera?.prototype){
  const proto=BABYLON.ArcRotateCamera.prototype;
  if(!proto.__hannaAttachBlocked){
    proto.attachControl=function(){return this};
    proto.__hannaAttachBlocked=true;
  }
}

function installMobileOrbit(){
  const scene=window.BABYLON?.EngineStore?.LastCreatedScene;
  const camera=scene?.activeCamera;
  const canvas=document.getElementById('game');
  if(!scene||!camera||!canvas)return false;
  if(camera.__hannaOrbitInstalled)return true;

  try{camera.detachControl?.()}catch(e){}
  try{camera.inputs?.clear?.()}catch(e){}

  const fixedRadius=Number.isFinite(camera.radius)?camera.radius:13;
  camera.lowerRadiusLimit=fixedRadius;
  camera.upperRadiusLimit=fixedRadius;
  camera.wheelDeltaPercentage=0;
  camera.pinchDeltaPercentage=0;
  camera.panningSensibility=0;
  camera.inertialRadiusOffset=0;
  camera.inertialAlphaOffset=0;
  camera.inertialBetaOffset=0;

  // Ângulo vertical limitado para não entrar no teto/chão.
  const BETA_MIN=.76;
  const BETA_MAX=1.20;
  camera.lowerBetaLimit=BETA_MIN;
  camera.upperBetaLimit=BETA_MAX;
  camera.lowerAlphaLimit=null;
  camera.upperAlphaLimit=null;

  let rotateId=null,lastX=0,lastY=0;
  const touches=new Set();

  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch')return;
    touches.add(e.pointerId);
    if(touches.size===1){
      rotateId=e.pointerId;
      lastX=e.clientX;lastY=e.clientY;
      try{canvas.setPointerCapture(e.pointerId)}catch(err){}
    }else{
      // Segundo dedo: cancela rotação e, por projeto, também não dá zoom.
      rotateId=null;
    }
    cancel(e);
  },{passive:false,capture:true});

  canvas.addEventListener('pointermove',e=>{
    if(e.pointerType!=='touch'||e.pointerId!==rotateId||touches.size!==1)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    lastX=e.clientX;lastY=e.clientY;
    if(Math.abs(dx)+Math.abs(dy)<.5)return;
    camera.alpha-=dx*.0085;
    camera.beta=Math.max(BETA_MIN,Math.min(BETA_MAX,camera.beta+dy*.0065));
    camera.radius=fixedRadius;
    camera.inertialRadiusOffset=0;
    camera.inertialAlphaOffset=0;
    camera.inertialBetaOffset=0;
    cancel(e);
  },{passive:false,capture:true});

  const end=e=>{
    if(e.pointerType!=='touch')return;
    touches.delete(e.pointerId);
    if(e.pointerId===rotateId)rotateId=null;
    if(touches.size===1){
      // Se restar um dedo de um gesto de dois, ele precisa levantar e tocar de novo.
      rotateId=null;
    }
  };
  canvas.addEventListener('pointerup',end,{passive:true,capture:true});
  canvas.addEventListener('pointercancel',end,{passive:true,capture:true});

  scene.onBeforeRenderObservable.add(()=>{
    camera.radius=fixedRadius;
    camera.inertialRadiusOffset=0;
    camera.inertialAlphaOffset=0;
    camera.inertialBetaOffset=0;
    if(camera.beta<BETA_MIN)camera.beta=BETA_MIN;
    if(camera.beta>BETA_MAX)camera.beta=BETA_MAX;
  });

  camera.__hannaOrbitInstalled=true;
  console.info('Casa da Hanna v1.4.2: arraste com 1 dedo para girar; pinch não altera zoom.');
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(installMobileOrbit()||tries>120)clearInterval(timer);
},100);
})();