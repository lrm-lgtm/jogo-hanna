(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HannaV2Anchors=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// World-space targets and collision-safe standing points for the breakfast mission.
const byStep=Object.freeze({
'open-fridge':{stand:[-2.94,.93],hand:[-2.55,1.20,1.385],kind:'hinge',item:null},
'take-milk':{stand:[-2.95,.92],hand:[-3.00,1.28,1.30],kind:'pick',item:'milk'},
'serve-milk':{stand:[-.58,-1.57],hand:[-.65,1.23,-1.17],kind:'place',item:'milk'},
'take-bread':{stand:[1.63,.94],hand:[1.63,1.21,1.45],kind:'pick',item:'bread'},
'insert-bread':{stand:[1.35,.94],hand:[1.28,1.37,1.44],kind:'place',item:'bread'},
'turn-on-toaster':{stand:[1.35,.94],hand:[1.30,1.22,1.43],kind:'press',item:null},
'take-toast':{stand:[1.35,.94],hand:[1.20,1.39,1.46],kind:'pick',item:'toast'},
'serve-toast':{stand:[-.35,-1.57],hand:[-.12,1.15,-1.18],kind:'place',item:'toast'}
});
function distance2(x,z,px,pz){return Math.hypot(x-px,z-pz)}
function targetFor(id){if(!byStep[id])throw new Error('Unknown contact target: '+id);return byStep[id]}
function direction(stand,hand){const x=hand[0]-stand[0],z=hand[2]-stand[1],length=Math.hypot(x,z);return {x:x/length,z:z/length}}
function nearby(x,z,stage){return distance2(x,z,stage[0],stage[1])<.075}
function reachable(stage,hand,maxReach=.70){return Math.hypot(distance2(stage[0],stage[1],hand[0],hand[2]),1.27-hand[1])<=maxReach+.045}
return Object.freeze({byStep,targetFor,direction,distance2,nearby,reachable});
});