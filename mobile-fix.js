(()=>{
'use strict';
const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
if(!mobile)return;
const viewport=document.querySelector('meta[name="viewport"]');
const VP='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
if(viewport)viewport.setAttribute('content',VP);
function fitViewport(){
 const vv=window.visualViewport;
 const w=Math.round(vv?.width||innerWidth||document.documentElement.clientWidth);
 const h=Math.round(vv?.height||innerHeight||document.documentElement.clientHeight);
 document.documentElement.style.setProperty('--app-w',w+'px');
 document.documentElement.style.setProperty('--app-h',h+'px');
 document.body?.style.setProperty('--app-w',w+'px');
 document.body?.style.setProperty('--app-h',h+'px');
 try{scrollTo(0,0)}catch(e){}
 try{BABYLON?.EngineStore?.LastCreatedScene?.getEngine?.().resize()}catch(e){}
}
fitViewport();
addEventListener('resize',fitViewport,{passive:true});
addEventListener('orientationchange',()=>{setTimeout(fitViewport,80);setTimeout(fitViewport,280);setTimeout(fitViewport,650)},{passive:true});
visualViewport?.addEventListener('resize',fitViewport,{passive:true});
visualViewport?.addEventListener('scroll',fitViewport,{passive:true});
const cancel=e=>{if(e.cancelable)e.preventDefault()};
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,cancel,{passive:false,capture:true}));
document.addEventListener('dblclick',cancel,{passive:false,capture:true});
document.addEventListener('touchstart',e=>{if(e.touches?.length>1)cancel(e)},{passive:false,capture:true});
document.addEventListener('touchmove',e=>{if(e.touches?.length>1)cancel(e)},{passive:false,capture:true});
function lockTouches(){
 ['game','joystick','stick','useBtn'].forEach(id=>{const el=document.getElementById(id);if(el){el.style.touchAction='none';el.style.webkitUserSelect='none'}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lockTouches,{once:true});else lockTouches();
if(window.BABYLON?.ArcRotateCamera?.prototype){
 const p=BABYLON.ArcRotateCamera.prototype;
 if(!p.__hannaAttachBlocked){p.attachControl=function(){return this};p.__hannaAttachBlocked=true}
}
function installMobileOrbit(){
 const scene=window.BABYLON?.EngineStore?.LastCreatedScene,camera=scene?.activeCamera,canvas=document.getElementById('game');
 if(!scene||!camera||!canvas)return false;
 if(camera.__hannaOrbitInstalled)return true;
 try{camera.detachControl?.()}catch(e){} try{camera.inputs?.clear?.()}catch(e){}
 const fixedRadius=Number.isFinite(camera.radius)?camera.radius:7.35;
 camera.lowerRadiusLimit=camera.upperRadiusLimit=fixedRadius;
 camera.wheelDeltaPercentage=0;camera.pinchDeltaPercentage=0;camera.panningSensibility=0;
 camera.inertialRadiusOffset=camera.inertialAlphaOffset=camera.inertialBetaOffset=0;
 const BETA_MIN=.88,BETA_MAX=1.20;
 camera.lowerBetaLimit=BETA_MIN;camera.upperBetaLimit=BETA_MAX;camera.lowerAlphaLimit=null;camera.upperAlphaLimit=null;
 let rotateId=null,lastX=0,lastY=0;const touches=new Set();
 canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;touches.add(e.pointerId);
  if(touches.size===1){rotateId=e.pointerId;lastX=e.clientX;lastY=e.clientY;try{canvas.setPointerCapture(e.pointerId)}catch(err){}}
  else rotateId=null;cancel(e);
 },{passive:false,capture:true});
 canvas.addEventListener('pointermove',e=>{
  if(e.pointerType!=='touch'||e.pointerId!==rotateId||touches.size!==1)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
  if(Math.abs(dx)+Math.abs(dy)<.5)return;
  camera.alpha-=dx*.0085;camera.beta=Math.max(BETA_MIN,Math.min(BETA_MAX,camera.beta+dy*.0065));
  camera.radius=fixedRadius;camera.inertialRadiusOffset=camera.inertialAlphaOffset=camera.inertialBetaOffset=0;cancel(e);
 },{passive:false,capture:true});
 const end=e=>{if(e.pointerType!=='touch')return;touches.delete(e.pointerId);if(e.pointerId===rotateId)rotateId=null;if(touches.size===1)rotateId=null};
 canvas.addEventListener('pointerup',end,{passive:true,capture:true});canvas.addEventListener('pointercancel',end,{passive:true,capture:true});
 scene.onBeforeRenderObservable.add(()=>{
  camera.radius=fixedRadius;camera.inertialRadiusOffset=camera.inertialAlphaOffset=camera.inertialBetaOffset=0;
  camera.beta=Math.max(BETA_MIN,Math.min(BETA_MAX,camera.beta));
 });
 camera.__hannaOrbitInstalled=true;return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(installMobileOrbit()||tries>120)clearInterval(timer)},100);
})();