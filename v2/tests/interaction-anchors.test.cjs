'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const Contacts=require('../interaction-anchors.js'),{STEPS}=require('../mission.js');
test('eight authored contacts match each mission step, reachable from floor',()=>{
 a.deepEqual(Object.keys(Contacts.byStep),STEPS.map(s=>s.id));
 for(const step of STEPS){const c=Contacts.targetFor(step.id);
  a.ok(c.stand[1]<1&&c.stand[1]>-2.91,step.id);
  a.ok(Contacts.distance2(...c.stand,...step.nav)<.65,step.id);
  a.ok(Contacts.reachable(c.stand,c.hand),step.id);
  const dir=Contacts.direction(c.stand,c.hand);a.ok(Math.abs(Math.hypot(dir.x,dir.z)-1)<1e-8);
  a.ok(Contacts.distance2(c.stand[0],c.stand[1],c.hand[0],c.hand[2])>.20);
 }
});
test('staging proximity means within 7.5 cm of authored spot',()=>{
 const stage=Contacts.byStep['open-fridge'].stand;
 a.equal(Contacts.nearby(...stage,stage),true);
 a.equal(Contacts.nearby(stage[0]+.2,stage[1],stage),false);
});
