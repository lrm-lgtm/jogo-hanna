/* Camera-relative movement with view-space calibration; shared by keyboard and joystick. */
(function(root){
'use strict';
const EPS=1e-7;
function direction(forward,sx,sy,project){
  let fx=Number(forward?.x)||0,fz=Number(forward?.z)||0;
  let length=Math.hypot(fx,fz);
  if(length<EPS)return {x:0,z:0};
  fx/=length;fz/=length;
  let rx=fz,rz=-fx; // horizontal perpendicular, nominal screen-right
  if(typeof project==='function'){
    // Calibrate against the ACTIVE camera view matrix, not assumptions about
    // handedness/orbit angle. Positive x = screen-right, positive up = screen-up.
    const lateral=project({x:rx,z:rz});
    if(Number.isFinite(lateral?.x)&&Math.abs(lateral.x)>EPS&&lateral.x<0){rx=-rx;rz=-rz}
    const vertical=project({x:fx,z:fz});
    if(Number.isFinite(vertical?.up)&&Math.abs(vertical.up)>EPS&&vertical.up<0){fx=-fx;fz=-fz}
  }
  const dx=rx*sx+fx*sy,dz=rz*sx+fz*sy;
  length=Math.hypot(dx,dz);
  return length<EPS?{x:0,z:0}:{x:dx/length,z:dz/length};
}
const api=Object.freeze({direction});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.HannaMovement=api;
})(typeof window!=='undefined'?window:globalThis);
