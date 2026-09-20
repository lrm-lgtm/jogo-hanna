(()=>{
'use strict';
const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
if(!mobile)return;

const viewport=document.querySelector('meta[name="viewport"]');
const VP='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
if(viewport)viewport.setAttribute('content',VP);

function fitViewport(){
  const vv=window.visualViewport;
  // width/height do visual viewport = área realmente disponível entre as barras do Safari.
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
window.addEventListener('orientationchange',()=>{setTimeout(fitViewport,80);setTimeout(fitViewport,280);setTimeout(fitViewport,650)},{passive:true});
window.visualViewport?.addEventListener('resize',fitViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',fitViewport,{passive:true});

const cancel=e=>{if(e.cancelable)e.preventDefault()};
['gesturestart','gesturechange','gestureend'].forEach(type=>{
  document.addEventListener(type,cancel,{passive:false,capture:true});
});
document.addEventListener('dblclick',cancel,{passive:false,capture:true});

// Bloqueia pinch no documento inteiro sem matar toques simples.
document.addEventListener('touchstart',e=>{
  if(e.touches&&e.touches.length>1)cancel(e);
},{passive:false,capture:true});
document.addEventListener('touchmove',e=>{
  if(e.touches&&e.touches.length>1)cancel(e);
},{passive:false,capture:true});

// Dentro do jogo, Safari não recebe nenhum gesto de navegação/zoom.
// Pointer events continuam chegando ao joystick e ao botão USAR.
function lockGameTouches(){
  ['game','joystick','stick','useBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    el.style.touchAction='none';
    el.style.webkitUserSelect='none';
    el.addEventListener('touchmove',cancel,{passive:false,capture:true});
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lockGameTouches,{once:true});
else lockGameTouches();

// A câmera é completamente passiva no celular. Só segue a personagem pelo código do jogo.
function hardLockCamera(){
  const scene=window.BABYLON?.EngineStore?.LastCreatedScene;
  const camera=scene?.activeCamera;
  if(!scene||!camera)return false;
  if(camera.__hannaHardLocked)return true;

  try{camera.detachControl?.()}catch(e){}
  try{camera.inputs?.clear?.()}catch(e){}
  camera.panningSensibility=0;
  camera.wheelDeltaPercentage=0;
  camera.pinchDeltaPercentage=0;
  camera.inertialRadiusOffset=0;
  camera.inertialAlphaOffset=0;
  camera.inertialBetaOffset=0;

  const locked={
    radius:Number.isFinite(camera.radius)?camera.radius:12,
    alpha:Number.isFinite(camera.alpha)?camera.alpha:-Math.PI/2,
    beta:Number.isFinite(camera.beta)?camera.beta:1.03
  };
  // fixa o enquadramento para evitar qualquer zoom/rotação causada por touch residual.
  camera.lowerRadiusLimit=locked.radius;
  camera.upperRadiusLimit=locked.radius;
  camera.lowerBetaLimit=locked.beta;
  camera.upperBetaLimit=locked.beta;
  camera.lowerAlphaLimit=locked.alpha;
  camera.upperAlphaLimit=locked.alpha;

  scene.onBeforeRenderObservable.add(()=>{
    camera.radius=locked.radius;
    camera.alpha=locked.alpha;
    camera.beta=locked.beta;
    camera.inertialRadiusOffset=0;
    camera.inertialAlphaOffset=0;
    camera.inertialBetaOffset=0;
  });
  camera.__hannaHardLocked=true;
  console.info('Casa da Hanna v1.4.1: câmera mobile travada sem pinch/zoom');
  return true;
}
let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(hardLockCamera()||tries>100)clearInterval(timer);
},100);

// Não deixa uma chamada posterior de attachControl religar gestos na câmera.
if(window.BABYLON?.ArcRotateCamera?.prototype){
  const proto=BABYLON.ArcRotateCamera.prototype;
  if(!proto.__hannaAttachBlocked){
    proto.attachControl=function(){return this};
    proto.__hannaAttachBlocked=true;
  }
}
})();