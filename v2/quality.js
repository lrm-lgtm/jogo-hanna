/* Deterministic adaptive graphics profiles. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HannaV2Quality=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='hanna_kitchen_v2_quality';
const PROFILES=Object.freeze({
 baixo:Object.freeze({pixels:1.0,shadow:512,blur:false,bloom:false,decor:false}),
 medio:Object.freeze({pixels:1.35,shadow:768,blur:true,bloom:false,decor:true}),
 alto:Object.freeze({pixels:2.0,shadow:1024,blur:true,bloom:true,decor:true})
});
function select(requested='auto',info={}){
 const allowed=['auto','baixo','medio','alto'];
 const choice=allowed.includes(requested)?requested:'auto';
 const memory=Number(info.memory||0),cores=Number(info.cores||4);
 const small=!!info.mobile||Number(info.width||1280)<900;
 const resolved=choice==='auto'?(small?(memory>0&&memory<=3?'baixo':'medio'):(cores>=8?'alto':'medio')):choice;
 return Object.freeze({requested:choice,resolved,...PROFILES[resolved]});
}
function load(storage){try{const item=storage.getItem(KEY);return ['auto','baixo','medio','alto'].includes(item)?item:'auto'}catch(_e){return 'auto'}}
function save(storage,choice){if(!['auto','baixo','medio','alto'].includes(choice))return false;try{storage.setItem(KEY,choice);return true}catch(_e){return false}}
return Object.freeze({KEY,PROFILES,select,load,save});
});