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
// R13 gait: stance/swing curves and 2-bone inverse kinematics for a grounded foot.
// Calibrated to free Blender rig: hip -> knee .300m; knee -> ankle .253m.
// This replaces the high-stepping single sine-wave/clock-driven puppet motion.
const smoothstep=t=>{const v=clamp(t,0,1);return v*v*(3-2*v)};
function leg(phase,speed){
 const u=((phase/(2*Math.PI))%1+1)%1;
 const stance=.63,walking=clamp(speed/1.7,0,1);
 let forward=0,lift=0,roll=0,planted=false;
 if(u<stance){
  const v=u/stance;
  // During stance, feet advance relative to the body in the opposite direction.
  forward=.092*(1-2*v);
  roll=smoothstep((v-.72)/.28)*.14;
  planted=true;
 }else{
  const v=(u-stance)/(1-stance);
  forward=-.092+.184*smoothstep(v);
  lift=Math.sin(v*Math.PI)*.055;
  roll=-(Math.sin(Math.PI*v)*.12);
 }
 // Target ankle: leg fully extends on planted steps, flexes only to clear floor.
 const thigh=.300,shin=.253,down=.546-lift;
 const reach=clamp(Math.hypot(forward,down),.001,thigh+shin-.0008);
 const adjustedForward=forward*reach/Math.max(.001,Math.hypot(forward,down));
 const adjustedDown=down*reach/Math.max(.001,Math.hypot(forward,down));
 const knee=Math.acos(clamp((reach*reach-thigh*thigh-shin*shin)/(2*thigh*shin),-1,1));
 const alpha=Math.acos(clamp((thigh*thigh+reach*reach-shin*shin)/(2*thigh*reach),-1,1));
 const hip=Math.atan2(adjustedForward,adjustedDown)+alpha;
 // Ankle compensates calf angle; a little roll at push-off and landing.
 const ankle=clamp(-hip+knee*.64+roll,-.45,.5);
 return Object.freeze({hip,knee,ankle,forward:adjustedForward,lift,planted});
}
function sample(state,travel,dt,t){
 const distance=clamp(Number(travel)||0,0,.20);
 const time=clamp(Number(dt)||0,0,.10);
 const speed=time>0?distance/time:0;
 // Stable ground-speed estimate; smooth speed spikes from SwiftShader low FPS.
 const target=clamp(speed/2.15,0,1);
 const blend=damping(state.blend||0,target,time,target>0?8:12);
 // One FULL left/right cycle per approximately 1.02 meters (two steps).
 const phase=(state.phase||0)+distance*(2*Math.PI/1.02);
 const L=leg(phase,speed),R=leg(phase+Math.PI,speed);
 // At rest, settle each articulated leg into its original bind pose.
 const leftHip=L.hip*blend,rightHip=R.hip*blend;
 const leftKnee=L.knee*blend,rightKnee=R.knee*blend;
 const leftAnkle=L.ankle*blend,rightAnkle=R.ankle*blend;
 const shoulder=Math.sin(phase);
 const arms={left:-shoulder*.26*blend,right:shoulder*.26*blend};
 const bob=Math.pow(Math.sin(phase),2)*.014*blend;
 const pelvisSway=Math.sin(phase)*.014*blend;
 const chestSway=-pelvisSway*.6;
 const headCounter=-pelvisSway*.8;
 return Object.freeze({
  phase,blend,speed,distance,totalDistance:(state.totalDistance||0)+distance,
  leftHip,rightHip,leftKnee,rightKnee,leftAnkle,rightAnkle,arms,bob,pelvisSway,chestSway,headCounter,
  foot:{left:{forward:L.forward,lift:L.lift,planted:L.planted},
        right:{forward:R.forward,lift:R.lift,planted:R.planted}},
  strideLength:1.02
 });
}
return Object.freeze({normalize,rotateFace,headingForDirection,facingDot,damping,leg,sample});
});