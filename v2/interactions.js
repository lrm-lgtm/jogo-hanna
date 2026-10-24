/* Casa da Hanna FREE R13: deterministic interaction gestures, no paid clips.
 * Timelines are authored per mission step. Visual item transfer happens at
 * hand-contact, never by a free-floating object attached behind the torso.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.HannaV2Actions=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const smooth=x=>{const t=clamp(x,0,1);return t*t*(3-2*t)};
const CONFIG=Object.freeze({
  'open-fridge':Object.freeze({duration:1.25,contact:.46,reach:1.10}),
  'take-milk':Object.freeze({duration:1.03,contact:.50,reach:.91}),
  'serve-milk':Object.freeze({duration:1.10,contact:.52,reach:1.01}),
  'take-bread':Object.freeze({duration:1.04,contact:.48,reach:.89}),
  'insert-bread':Object.freeze({duration:1.18,contact:.57,reach:1.04}),
  'turn-on-toaster':Object.freeze({duration:.92,contact:.46,reach:.70}),
  'take-toast':Object.freeze({duration:1.12,contact:.50,reach:.87}),
  'serve-toast':Object.freeze({duration:1.18,contact:.53,reach:1.02})
});
function pose(id,elapsed){
 const config=CONFIG[id];
 if(!config)return Object.freeze({id,progress:1,reach:0,contact:true,done:true,armX:0,armZ:0,lean:0});
 const progress=clamp(elapsed/config.duration,0,1);
 // Reach until just after hand contact, then retract organically.
 const extend=smooth(progress/(config.contact+.06));
 const retract=1-smooth((progress-config.contact-.03)/(.91-config.contact));
 const reach=Math.max(0,Math.min(extend,retract));
 return Object.freeze({id,progress,reach,contact:progress>=config.contact,done:progress>=1,
  armX:-config.reach*reach,armZ:.08*reach,lean:.055*reach});
}
return Object.freeze({CONFIG,pose,smooth});
});