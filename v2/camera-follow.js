/* Casa da Hanna - child-first camera + architectural dollhouse cutaway.
 * Pure calculations usable from unit tests; Babylon runtime adapts them.
 */
(function(root,factory){
 const x=factory();
 if(typeof module==='object'&&module.exports)module.exports=x;
 root.HannaV2Camera=x;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // These are the solid LEFT side panels. The rear wall remains in the scene.
 // Removal is a permanent design cutaway; it never affects collision/mission logic.
 const CUTAWAY=Object.freeze([
  'leftWall','leftWainscot','leftBaseboard','leftBaseboardNew'
 ]);
 function clamp(n,lo,hi){return Math.min(hi,Math.max(lo,n))}
 function focus(x,z,goalX,goalZ,isNavigating=false,navX=goalX,navZ=goalZ){
  // Weight Hanna much more than the upcoming task so she cannot disappear under HUD.
  const lead=isNavigating?.12:.085;
  const characterX=x*.92+.08*.45,characterZ=z+.20;
  let xx=characterX*(1-lead)+goalX*lead;
  let zz=characterZ*(1-lead)+goalZ*lead;
  if(isNavigating){xx=xx*.90+navX*.10;zz=zz*.90+navZ*.10}
  return Object.freeze({x:clamp(xx,-3.05,3.00),y:1.26,z:clamp(zz,-2.65,1.00)});
 }
 function alpha(dt,rate=7.2){
  // dt is REAL seconds, independently of the 55 ms movement physics clamp.
  return clamp(1-Math.exp(-rate*clamp(dt,0,.35)),.012,.94);
 }
 function framedHead(screenX,screenY){
  return Number.isFinite(screenX)&&Number.isFinite(screenY)
     &&screenX>.055&&screenX<.94&&screenY>.10&&screenY<.92;
 }
 return Object.freeze({CUTAWAY,focus,alpha,framedHead});
});