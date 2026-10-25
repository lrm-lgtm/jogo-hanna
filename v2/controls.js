/* Casa da Hanna v2: deterministic analog joystick math for screen-relative
 * movement. No BABYLON dependency: exercises keyboard/touch input in Node tests.
 * A gentle response curve and dead-zone are essential on small screens.
 */
(function(root,factory){
 const controls=factory();
 if(typeof module==='object'&&module.exports)module.exports=controls;
 root.HannaV2Controls=controls;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DEADZONE=.12;
 function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
 function pad(x,y,radius){
  const r=Math.max(1,Number(radius)||1);
  const px=Number.isFinite(x)?x:0,py=Number.isFinite(y)?y:0;
  const extent=Math.hypot(px,py);
  const norm=clamp(extent/r,0,1);
  const magnitude=norm<=DEADZONE?0:Math.pow((norm-DEADZONE)/(1-DEADZONE),1.25);
  const ratio=extent>1e-6?1/extent:0;
  return Object.freeze({x:px*ratio*magnitude,y:-py*ratio*magnitude,
   knobX:px*Math.min(1,r/Math.max(extent,1e-6)),
   knobY:py*Math.min(1,r/Math.max(extent,1e-6)),magnitude});
 }
 // cameraForward is camera->target projected on ground, not avatar facing.
 // rightSign comes from projecting the world horizontal basis into view space.
 function screenToWorld(x,y,fx,fz,rightSign=1){
  const v=Math.hypot(fx,fz);
  if(v<1e-6)return Object.freeze({x:0,z:0,magnitude:0});
  const fX=fx/v,fZ=fz/v;
  const rX=-fZ*(rightSign<0?-1:1),rZ=fX*(rightSign<0?-1:1);
  const dx=fX*y+rX*x,dz=fZ*y+rZ*x;
  return Object.freeze({x:dx,z:dz,magnitude:clamp(Math.hypot(dx,dz),0,1)});
 }
 function smoothAxis(current,target,seconds,rate=12){
  const a=1-Math.exp(-clamp(Number(seconds)||0,0,.08)*rate);
  return current+(target-current)*a;
 }
 function smoothAngle(current,target,seconds,rate=14){
  const change=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+change*(1-Math.exp(-clamp(Number(seconds)||0,0,.08)*rate));
 }
 return Object.freeze({DEADZONE,pad,screenToWorld,smoothAxis,smoothAngle});
});