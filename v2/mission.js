/* Casa da Hanna v2: state machine without Babylon dependencies. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.HannaV2Mission=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='hanna_kitchen_v2_progress',SCHEMA=2;
 const STEPS=Object.freeze([
  {id:'open-fridge',text:'Abra a geladeira',voice:'Vamos abrir a geladeira!',target:'fridge',verb:'ABRIR',icon:'🚪',nav:[-2.95,.38],requires:null,effect:'fridgeOpen',animation:'open-fridge',feedback:'Geladeira aberta! O leite está lá dentro.'},
  {id:'take-milk',text:'Pegue o leite',voice:'Agora pegue o leite!',target:'milk',verb:'PEGAR',icon:'🥛',nav:[-2.95,.38],requires:'fridgeOpen',effect:'milkHeld',animation:'pick',feedback:'Leite na mão! Agora vamos até a mesa.'},
  {id:'serve-milk',text:'Coloque o leite na mesa',voice:'Leve o leite para a mesa!',target:'table',verb:'COLOCAR',icon:'🥛',nav:[-.4,-1.72],requires:'milkHeld',effect:'milkServed',animation:'place',feedback:'O leite já está na mesa!'},
  {id:'take-bread',text:'Pegue o pão',voice:'Vamos pegar o pão!',target:'bread',verb:'PEGAR',icon:'🍞',nav:[1.65,.30],requires:'milkServed',effect:'breadHeld',animation:'pick',feedback:'Pão na mão! Vamos preparar a torrada.'},
  {id:'insert-bread',text:'Coloque o pão na torradeira',voice:'Coloque o pão na torradeira!',target:'toaster',verb:'COLOCAR',icon:'🍞',nav:[1.50,.30],requires:'breadHeld',effect:'breadInserted',animation:'place',feedback:'Prontinho. Vamos ligar a torradeira!'},
  {id:'turn-on-toaster',text:'Ligue a torradeira',voice:'Agora aperte o botão!',target:'toaster',verb:'LIGAR',icon:'🔘',nav:[1.50,.30],requires:'breadInserted',effect:'toastReady',animation:'press',feedback:'Ding! A torrada ficou douradinha.'},
  {id:'take-toast',text:'Pegue a torrada',voice:'Pegue a torrada quentinha!',target:'toast',verb:'PEGAR',icon:'🍞',nav:[1.50,.30],requires:'toastReady',effect:'toastHeld',animation:'pick',feedback:'Que cheirinho gostoso!'},
  {id:'serve-toast',text:'Leve a torrada para a mesa',voice:'Leve a torrada para a mesa!',target:'table',verb:'SERVIR',icon:'🍽️',nav:[-.4,-1.72],requires:'toastHeld',effect:'breakfastComplete',animation:'celebrate',feedback:'Café da manhã prontinho!'}
 ].map(x=>Object.freeze(x)));
 function derive(step){const state=Object.create(null);for(let i=0;i<step;i++)state[STEPS[i].effect]=true;return state}
 function createMemoryStore(){const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}}
 class BreakfastMission {
  constructor(options={}){
   this.store=options.storage||createMemoryStore();this.clock=options.now||Date.now;
   this.step=0;this.restored=false;
   try{
    const raw=this.store.getItem(KEY),data=raw?JSON.parse(raw):null;
    if(data&&data.schema===SCHEMA&&Number.isInteger(data.step)&&data.step>=0&&data.step<=STEPS.length){this.step=data.step;this.restored=true}
   }catch(_e){}
  }
  get current(){return STEPS[this.step]||null}
  get completed(){return this.step===STEPS.length}
  get flags(){return derive(this.step)}
  get snapshot(){return Object.freeze({schema:SCHEMA,step:this.step,completed:this.completed,flags:Object.freeze({...this.flags})})}
  canInteract(target,distance){
   const s=this.current;
   if(!s)return {ok:false,reason:'completed'};
   if(s.target!==target)return {ok:false,reason:'wrong-target'};
   if(!Number.isFinite(distance)||distance>.73)return {ok:false,reason:'too-far'};
   if(s.requires&&!this.flags[s.requires])return {ok:false,reason:'precondition'};
   return {ok:true};
  }
  advance(target,distance){
   const check=this.canInteract(target,distance);
   if(!check.ok)return check;
   const step=this.current;this.step++;this.persist();
   return {ok:true,step,completed:this.completed,progress:this.step/STEPS.length};
  }
  persist(){try{this.store.setItem(KEY,JSON.stringify({schema:SCHEMA,step:this.step,updated:this.clock()}));return true}catch(_e){return false}}
  reset(){this.step=0;this.restored=false;try{this.store.removeItem(KEY)}catch(_e){}}
 }
 return Object.freeze({KEY,SCHEMA,STEPS,BreakfastMission,derive,createMemoryStore});
});