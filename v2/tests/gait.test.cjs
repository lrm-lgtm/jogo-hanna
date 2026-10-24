'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A=require('../gait.js');
test('face points in the actual travel direction irrespective of imported model forward axis',()=>{
 for(const face of [{x:0,z:1},{x:0,z:-1},{x:.9,z:.43},{x:-.7,z:-.7}]){
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[.6,.8],[-.6,-.8]]){
   const heading=A.headingForDirection(face,dx,dz);
   const dot=A.facingDot(face,heading,dx,dz);
   assert.ok(dot>.999999,{face,dx,dz,heading,dot});
  }
 }
 assert.ok(Math.abs(A.headingForDirection({x:0,z:1},1,0)-Math.PI/2)<.001);
 assert.ok(Math.abs(A.headingForDirection({x:0,z:-1},1,0)+Math.PI/2)<.001);
});
test('leg gait is distance-driven rather than clock-driven, alternates and flexes knees',()=>{
 let state={phase:0,blend:0,totalDistance:0};
 for(let i=0;i<50;i++)state=A.sample(state,.035,1/60,i/60);
 assert.ok(state.totalDistance>1.7);
 assert.ok(state.blend>.65);
 const steps=[];
 for(let i=0;i<100;i++){state=A.sample(state,.035,1/60,1+i/60);steps.push(state)}
 assert.ok(steps.some(s=>s.leftHip>.3&&s.rightHip<-.3));
 assert.ok(steps.some(s=>s.leftHip<-.3&&s.rightHip>.3));
 assert.ok(steps.some(s=>s.leftKnee>.36));
 assert.ok(steps.some(s=>s.rightKnee>.36));
 assert.ok(steps.some(s=>Math.abs(s.leftAnkle)>.08));
 const frozen=A.sample(state,0,1/60,5);
 assert.equal(frozen.phase,state.phase);
 assert.equal(frozen.totalDistance,state.totalDistance);
 let rest=frozen;for(let i=0;i<45;i++)rest=A.sample(rest,0,1/60,6+i/60);
 assert.ok(rest.blend<.01);
 assert.ok(Math.abs(rest.leftHip)<.01);
 assert.ok(Math.abs(rest.rightKnee)<.01);
});
