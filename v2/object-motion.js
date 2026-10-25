/* Casa da Hanna R14: finite, non-looping movements of fridge and toast.
 * This module controls object state deterministically and is tested in Node.
 * Timelines never restart when mission HUD/visuals are refreshed.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.HannaObjectMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{const x=clamp(t,0,1);return x*x*(3-2*x)};
const SETUP=Object.freeze({
 door:Object.freeze({from:0,to:1.44,duration:1.02}),
 doorClose:Object.freeze({from:1.44,to:0,duration:.82}),
 toast:Object.freeze({from:1.195,to:1.39,duration:.40}),
 serve:Object.freeze({from:.18,to:0,duration:.48})
});
function create(stage,completed=false){
 const s=SETUP[stage];if(!s)throw Error('Unknown stage '+stage);
 return {name:stage,elapsed:completed?s.duration:0,playing:false,plays:0,value:completed?s.to:s.from};
}
function start(state){
 if(state.plays||state.playing)return false;
 state.playing=true;state.elapsed=0;state.plays++;
 state.value=SETUP[state.name].from;
 return true;
}
function tick(state,dt){
 if(!state.playing)return state.value;
 const setup=SETUP[state.name];
 state.elapsed=Math.min(setup.duration,state.elapsed+clamp(Number(dt)||0,0,.15));
 state.value=setup.from+(setup.to-setup.from)*smooth(state.elapsed/setup.duration);
 if(state.elapsed>=setup.duration){state.value=setup.to;state.playing=false}
 return state.value;
}
function settle(state,completed){
 const s=SETUP[state.name];
 state.elapsed=completed?s.duration:0;state.playing=false;state.value=completed?s.to:s.from;
}
return Object.freeze({SETUP,create,start,tick,settle,smooth});
});