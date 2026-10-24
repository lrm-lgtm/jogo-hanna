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
// Babylon hardwareScalingLevel = physical DPR / desired physical pixels per CSS pixel.
// A high DPR 3.0 Android with medium 1.85 now draws at 1.85x CSS, versus 1.35x before.
// Viewport cap and supersampling floor prevent expensive 4K+ framebuffers on low-end GPUs.
function hardwareScale(profile,dpr=1,viewport={width:1280,height:720}){
 const ratio=Number.isFinite(+dpr)&&+dpr>0?+dpr:1;
 const side=Math.max(1,Number(viewport.width)||1,Number(viewport.height)||1);
 const target=Math.min(profile.pixels||1,3200/side);
 return Math.max(.78,Math.min(4,ratio/Math.max(1,target)));
}
function load(storage){try{const item=storage.getItem(KEY);return choices.includes(item)?item:'auto'}catch(_e){return 'auto'}}
function save(storage,choice){if(!choices.includes(choice))return false;try{storage.setItem(KEY,choice);return true}catch(_e){return false}}
return Object.freeze({KEY,PROFILES,select,hardwareScale,load,save});
});