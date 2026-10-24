'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const J=require('../controls.js');
test('joystick supports a center dead zone and proportional 360-degree movement',()=>{
 const idle=J.pad(0,0,38);
 a.equal(idle.magnitude,0);
 a.equal(J.pad(3,1,38).magnitude,0);
 const small=J.pad(13,0,38),medium=J.pad(23,0,38),large=J.pad(90,0,38);
 a.ok(small.x>0&&small.x<medium.x&&medium.x<large.x);
 a.equal(large.x,1);a.equal(large.knobX,38);
 a.equal(J.pad(0,-38,38).y,1);
 a.equal(J.pad(0,38,38).y,-1);
 const diagonal=J.pad(38,-38,38);
 a.ok(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1)<1e-6);
 a.ok(diagonal.knobX<38 && diagonal.knobY<0);
 a.equal(J.pad(NaN,NaN,0).magnitude,0);
});
test('horizontal/vertical joystick directions follow camera projection and do not invert',()=>{
 const fz=1,fx=0;
 // With camera forward +Z and camera-right projected +X, invert the raw xz perp basis.
 let v=J.screenToWorld(1,0,fx,fz,-1);a.ok(v.x>.99&&Math.abs(v.z)<.01);
 v=J.screenToWorld(-1,0,fx,fz,-1);a.ok(v.x<-.99);
 v=J.screenToWorld(0,1,fx,fz,-1);a.ok(v.z>.99);
 v=J.screenToWorld(0,-1,fx,fz,-1);a.ok(v.z<-.99);
 v=J.screenToWorld(.6,.8,.32,.94,-1);a.ok(v.magnitude>.95&&v.magnitude<=1);
});
test('acceleration, deceleration and turning are continuous',()=>{
 a.equal(J.smoothAxis(0,1,0),0);
 const a1=J.smoothAxis(0,1,.016),a2=J.smoothAxis(a1,1,.016);
 a.ok(a1>0&&a1<a2&&a2<1);
 const stop=J.smoothAxis(a2,0,.016);
 a.ok(stop>0&&stop<a2);
 const p=J.smoothAngle(Math.PI-.05,-Math.PI+.05,.016);
 a.ok(p>Math.PI-.05&&p<Math.PI+.05);
});