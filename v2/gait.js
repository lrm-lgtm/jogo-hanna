/* Casa da Hanna — FREE R12 model-facing calibration & articulated walking.
 * Head/pupil axis is measured from the actual loaded GLB, not assumed from Blender.
 * No Babylon dependency: deterministic math shared with Node and live mobile tests.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.HannaV2Gait=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function normalize(x,z){const l=Math.hypot(x,z);return l>.000001?{x:x/l,z:z/l}:{x:0,z:0}}
function rotateFace(face,heading){
 const c=Math.cos(heading),s=Math.sin(heading);
 return normalize(face.x*c+face.z*s,-face.x*s+face.z*c);
}
// Babylon Y-axis heading: X'=X*cos+Z*sin, Z'=-X*sin+Z*cos.
// Explicitly supports source model facing either +Z/-Z or any oblique direction.
function headingForDirection(front,dx,dz){
 const u=normalize(front.x,front.z),v=normalize(dx,dz);
 if(!Math.hypot(u.x,u.z)||!Math.hypot(v.x,v.z))return 0;
 return Math.atan2(u.z*v.x-u.x*v.z,u.x*v.x+u.z*v.z);
}
function facingDot(face,heading,dx,dz){
 const a=rotateFace(face,heading),b=normalize(dx,dz);
 return a.x*b.x+a.z*b.z;
}
function damping(current,target,dt,rate){
 return current+(target-current)*(1-Math.exp(-rate*clamp(dt||0,0,.14)));
}
function sample(state,travel,dt,t){
 // Advance ONLY when the player actually moves on the walkable floor.
 const distance=clamp(Number(travel)||0,0,.25);
 const time=clamp(Number(dt)||0,0,.10);
 const speed=time>0?distance/time:0;
 const strength=damping(state.blend||0,clamp(speed/1.65,0,1),time,9);
 const phase=(state.phase||0)+distance*7.30;
 const stride=Math.sin(phase),reverse=-stride;
 const leftHip=-stride*.55*strength,rightHip=stride*.55*strength;
 const leftKnee=Math.max(0,stride)*.72*strength,rightKnee=Math.max(0,reverse)*.72*strength;
 const leftAnkle=(-leftHip*.45-leftKnee*.48)*strength;
 const rightAnkle=(-rightHip*.45-rightKnee*.48)*strength;
 const arms={
  left: -leftHip*.73,
  right: -rightHip*.73
 };
 const bob=(Math.abs(Math.sin(phase))*.037*strength)+(1-strength)*.006*Math.sin((t||0)*2);
 return Object.freeze({
  phase,blend:strength,speed,distance,totalDistance:(state.totalDistance||0)+distance,
  leftHip,rightHip,leftKnee,rightKnee,leftAnkle,rightAnkle,arms,bob
 });
}
return Object.freeze({normalize,rotateFace,headingForDirection,facingDot,damping,sample});
});