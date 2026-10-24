/* Graphics are measured in physical device pixels, not CSS pixels.
 * Modes allow visible image-quality improvement without pretending that geometry is premium.
 * Keep low/medium options for real-world phones; maximum sharpness can impact FPS.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HannaV2Quality=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='hanna_kitchen_v2_quality';
const PROFILES=Object.freeze({
 baixo:Object.freeze({pixels:1.15,shadow:512,blur:false,bloom:false,decor:false,samples:1,sharpen:false}),
 medio:Object.freeze({pixels:1.85,shadow:768,blur:true,bloom:false,decor:true,samples:1,sharpen:true}),
 alto:Object.freeze({pixels:2.4,shadow:1024,blur:true,bloom:false,decor:true,samples:2,sharpen:true}),
 nitido:Object.freeze({pixels:3,shadow:1536,blur:true,bloom:false,decor:true,samples:4,sharpen:true})
});
const choices=['auto',...Object.keys(PROFILES)];
function select(requested='auto',info={}){
 const choice=choices.includes(requested)?requested:'auto';
 const memory=Number(info.memory||0),cores=Number(info.cores||4);
 const small=!!info.mobile||Number(info.width||1280)<900;
 // Phones with modest hardware stay medium/low. High-end phones may opt in to native pixels.
 const resolved=choice==='auto'?(small?(memory>0&&memory<=3?'baixo':(cores>=8&&memory>=6?'alto':'medio')):(cores>=8?'alto':'medio')):choice;
 return Object.freeze({requested:choice,resolved,...PROFILES[resolved]});
}
// Babylon hardwareScalingLevel = 1 / desired drawing-buffer pixels per CSS pixel.
// devicePixelRatio is NOT multiplied here: Babylon setHardwareScalingLevel already
// uses CSS viewport coordinates to size the drawing buffer. Multiplying by DPR was
// the original bug: a simulated DPR=3 phone rendered only 525px for 852px of CSS.
// The user may choose how close to native physical DPI to render via graphics mode.
function hardwareScale(profile,dpr=1,viewport={width:1280,height:720}){
 const side=Math.max(1,Number(viewport.width)||1,Number(viewport.height)||1);
 const ratio=Number.isFinite(+dpr)&&+dpr>0?+dpr:1;
 const nativeCeiling=Math.max(1,ratio);
 const target=Math.max(1,Math.min(profile.pixels||1,3200/side,nativeCeiling));
 return 1/target;
}
function load(storage){try{const item=storage.getItem(KEY);return choices.includes(item)?item:'auto'}catch(_e){return 'auto'}}
function save(storage,choice){if(!choices.includes(choice))return false;try{storage.setItem(KEY,choice);return true}catch(_e){return false}}
return Object.freeze({KEY,PROFILES,select,hardwareScale,load,save});
});