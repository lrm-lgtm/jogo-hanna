/* P0 regression: simulate the complete goodnight mission and camera-relative input. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const core=fs.readFileSync(path.join(root,'src/core-game.js'),'utf8');
const movement=require('../src/movement.js');

function interactionSource(){
  const start=core.indexOf('function interact(){');
  const end=core.indexOf("\n$('#useBtn').addEventListener",start);
  assert.ok(start>=0&&end>start,'core interact() not located');
  return core.slice(start,end);
}
function missionHarness(){
  const successes=[],animations=[],events=[];
  const ctx={
    missionIndex:9,step:0,curtainsClosed:false,blanketTucked:false,goodnightDone:false,
    item:null,curtainL:{position:{x:-6.05}},curtainR:{position:{x:-4.35}},
    curtainTarget:{},sleepBlanket:{position:{y:.73}},nightLamp:{material:'cream'},
    nightLight:{intensity:0},babyHead:{},babyBrain:{event:name=>events.push(name)},
    M:{yellow:'yellow',cream:'cream'},
    nearestInteractive:()=>ctx.item,
    performPlayerAction:()=>{},
    tween:(mesh,property,from,to,frames,done)=>{
      const [name,key]=property.split('.');
      mesh[name][key]=to;animations.push({property,to});
      if(done)done();
    },
    advance:(code)=>{successes.push(code);ctx.step++;},
    popScale:()=>{},updateNpcHud:()=>{},showToast:()=>{},speak:()=>{}
  };
  vm.createContext(ctx);
  vm.runInContext(interactionSource(),ctx,{filename:'core-interact.js'});
  const use=type=>{ctx.item={metadata:{type}};vm.runInContext('interact()',ctx)};
  return {ctx,use,successes,animations,events};
}

test('Hora de Dormir: all five interactions advance with visible object state',()=>{
  const h=missionHarness();
  h.use('curtain');
  assert.equal(h.ctx.curtainsClosed,true);
  assert.equal(h.ctx.curtainL.position.x,-5.55);
  assert.equal(h.ctx.curtainR.position.x,-4.85);
  assert.equal(h.ctx.step,1);
  h.use('lamp');
  assert.equal(h.ctx.nightLight.intensity,.78);
  assert.equal(h.ctx.nightLamp.material,'yellow');
  h.use('blanket');
  assert.equal(h.ctx.blanketTucked,true);
  assert.equal(h.ctx.sleepBlanket.position.y,.82);
  h.use('baby');
  assert.ok(h.events.includes('pet'));
  h.use('baby');
  assert.equal(h.ctx.goodnightDone,true);
  assert.ok(h.events.includes('sleep'));
  assert.deepEqual(h.successes,[
    'curtainsClosed','sleepLampOn','blanketTucked','goodnightPet','goodnightDone'
  ]);
  assert.equal(h.ctx.step,5);
});
test('Hora de Dormir: wrong object cannot advance step',()=>{
  const h=missionHarness();
  h.use('lamp');
  assert.equal(h.ctx.step,0);
  h.use('curtain');
  h.use('curtain');
  assert.equal(h.ctx.step,1);
});

const dot=(a,b)=>a.x*b.x+a.z*b.z;
test('directions match screen up/right at four camera headings',()=>{
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const forward={x:Math.cos(angle),z:Math.sin(angle)};
    const right={x:forward.z,z:-forward.x};
    const project=v=>({x:dot(v,right),up:dot(v,forward)});
    const directions=[
      [0,1,{right:0,up:1}],
      [0,-1,{right:0,up:-1}],
      [1,0,{right:1,up:0}],
      [-1,0,{right:-1,up:0}],
      [1,1,{right:1,up:1}],
    ];
    for(const [sx,sy,wanted] of directions){
      const world=movement.direction(forward,sx,sy,project);
      const p=project(world);
      if(wanted.right)assert.ok(Math.sign(p.x)===wanted.right,'horizontal reversed at '+angle);
      else assert.ok(Math.abs(p.x)<1e-6);
      if(wanted.up)assert.ok(Math.sign(p.up)===wanted.up,'vertical reversed at '+angle);
      else assert.ok(Math.abs(p.up)<1e-6);
      assert.ok(Math.abs(Math.hypot(world.x,world.z)-1)<1e-9);
    }
  }
});
test('camera calibration corrects inverted view axis',()=>{
  const f={x:0,z:1},r={x:1,z:0};
  const mirrored=v=>({x:-dot(v,r),up:dot(v,f)});
  const right=movement.direction(f,1,0,mirrored);
  assert.ok(mirrored(right).x>0);
  const upsideDown=v=>({x:dot(v,r),up:-dot(v,f)});
  const up=movement.direction(f,0,1,upsideDown);
  assert.ok(upsideDown(up).up>0);
});
test('WASD/arrows/joystick keep equivalent input conventions',()=>{
  assert.match(core,/keys\.KeyW\|\|keys\.ArrowUp\)sy\+=1/);
  assert.match(core,/keys\.KeyS\|\|keys\.ArrowDown\)sy-=1/);
  assert.match(core,/keys\.KeyA\|\|keys\.ArrowLeft\)sx-=1/);
  assert.match(core,/keys\.KeyD\|\|keys\.ArrowRight\)sx\+=1/);
  assert.match(core,/sx\+=jx;sy\+=-jy/);
  assert.match(core,/HannaMovement\.direction/);
  const f={x:0,z:1};
  assert.deepEqual(movement.direction(f,1,0),movement.direction(f,1,0));
});
