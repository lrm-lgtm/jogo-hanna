(()=>{
'use strict';
let extrasActive=false,scene=null,B=null,player=null,collider=null;
let extraHeld='',extraMission=0,extraStep=0,crowns=0,done=[];
const SAVE='hanna_v14_extra';
const $=q=>document.querySelector(q);

const missions=[
 {title:'ESCOVAR OS DENTES',icon:'🪥',reward:15,steps:[
  ['Pegue a escova de dentes.','toothbrush'],
  ['Vá até a pia do banheiro.','bathSink'],
  ['Escove os dentes.','brush'],
  ['Enxágue a boca.','rinse']]},
 {title:'LAVAR AS MÃOS',icon:'🧼',reward:15,steps:[
  ['Pegue o sabonete.','soap'],
  ['Ligue a torneira do banheiro.','bathTapOn'],
  ['Lave bem as mãos.','washHands'],
  ['Feche a torneira.','bathTapOff']]},
 {title:'ROUPA NO CESTO',icon:'👕',reward:20,steps:[
  ['Pegue a camiseta no chão.','shirt'],
  ['Coloque a camiseta no cesto.','shirtBasket'],
  ['Pegue a meia.','sock'],
  ['Coloque a meia no cesto.','sockBasket']]},
 {title:'CUIDAR DAS FLORES',icon:'🌻',reward:20,steps:[
  ['Pegue o regador do quintal.','yardCan'],
  ['Encha o regador na torneira.','yardFill'],
  ['Regue as flores.','flowers'],
  ['Guarde o regador.','yardCanBack']]},
 {title:'GUARDAR O QUINTAL',icon:'🧺',reward:20,steps:[
  ['Pegue a bola do quintal.','yardBall'],
  ['Guarde a bola no cesto.','yardBallBasket'],
  ['Pegue o bloquinho.','yardBlock'],
  ['Guarde o bloquinho no cesto.','yardBlockBasket']]},
 {title:'BANHO DO CACHORRO',icon:'🐶',reward:30,steps:[
  ['Pegue o shampoo do cachorro.','shampoo'],
  ['Chame o cachorro para a banheira.','dogTub'],
  ['Dê banho nele.','dogWash'],
  ['Seque com a toalha.','dogDry']]}
];

function load(){
 try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');if(s){extraMission=Math.max(0,Math.min(Number(s.m)||0,missions.length-1));extraStep=Math.max(0,Number(s.s)||0);crowns=Math.max(0,Number(s.c)||0);done=Array.isArray(s.d)?s.d:[]}}catch(e){}
 if(extraStep>=missions[extraMission].steps.length)extraStep=0;
}
function save(){localStorage.setItem(SAVE,JSON.stringify({m:extraMission,s:extraStep,c:crowns,d:done}))}
load();

function wait(){
 scene=window.BABYLON?.EngineStore?.LastCreatedScene;
 player=scene?.getTransformNodeByName?.('player');
 collider=scene?.getMeshByName?.('playerCollider');
 if(!scene||!player){setTimeout(wait,250);return}
 B=window.BABYLON;buildWorld();buildUI();bind();applyUnlocks();
 console.info('Casa da Hanna v1.4: expansão ativa');
}

function mat(name,color){
 const m=new B.StandardMaterial('v14_'+name,scene);m.diffuseColor=B.Color3.FromHexString(color);m.specularColor=new B.Color3(.04,.04,.04);return m;
}
const mats={};
function M(name,color){return mats[name]||(mats[name]=mat(name,color))}
function box(n,x,y,z,w,h,d,m,p=false){
 const o=B.MeshBuilder.CreateBox('v14_'+n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o;
}
function cyl(n,x,y,z,d,h,m,p=false){
 const o=B.MeshBuilder.CreateCylinder('v14_'+n,{diameter:d,height:h,tessellation:14},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o;
}
function sph(n,x,y,z,d,m,p=false){
 const o=B.MeshBuilder.CreateSphere('v14_'+n,{diameter:d,segments:12},scene);o.position.set(x,y,z);o.material=m;o.isPickable=p;return o;
}
function tag(o,type,label){o.metadata={...(o.metadata||{}),v14Type:type,v14Label:label};o.isPickable=true;return o}

let objects={},water=null,flowers=[],gardenStar=null,rainbow=null;
function buildWorld(){
 const tile=M('bathTile','#cfeaf2'),white=M('white','#fbfaf6'),steel=M('steel','#9dacb2'),blue=M('blue','#80c8dc'),mint=M('mint','#bfe5cf'),pink=M('pink','#f2acc3'),wood=M('wood','#c78955'),dark=M('dark','#504743'),green=M('green','#78bf78'),grass=M('grass','#9ed293'),yellow=M('yellow','#f4cb5d'),red=M('red','#e46f68'),purple=M('purple','#aa91d8');

 // Banheiro compacto no canto esquerdo frontal.
 const bathFloor=box('bathFloor',-5.15,.012,-.35,3.05,.025,2.25,tile);bathFloor.isPickable=false;
 const half1=box('bathWallA',-3.65,.75,-.35,.10,1.5,2.25,white);half1.checkCollisions=true;
 const half2=box('bathWallB',-5.15,.75,.78,3.05,1.5,.10,white);half2.checkCollisions=true;
 const sinkBase=box('bathSinkBase',-5.85,.48,-.15,.85,.85,.55,white);
 objects.bathSink=tag(box('bathSink',-5.85,.94,-.15,.92,.12,.62,steel,true),'bathSink','Pia do banheiro');
 objects.bathTap=tag(cyl('bathTap',-5.85,1.22,.08,.11,.45,steel,true),'bathTap','Torneira do banheiro');objects.bathTap.rotation.z=Math.PI/2;
 water=box('bathWater',-5.85,1.03,.02,.055,.40,.055,blue);water.isVisible=false;
 const mirror=box('mirror',-6.78,1.62,-.18,.05,1.05,.92,blue);mirror.material.alpha=.45;
 const toilet=box('toiletBase',-4.35,.34,-.72,.70,.68,.78,white);cyl('toiletSeat',-4.35,.70,-.72,.68,.12,white);
 const hamper=tag(cyl('hamper',-3.95,.45,.18,.72,.88,wood,true),'hamper','Cesto de roupa');objects.hamper=hamper;
 objects.toothbrush=tag(box('toothbrush',-5.48,1.08,-.02,.08,.08,.46,pink,true),'toothbrush','Escova de dentes');
 objects.soap=tag(box('soap',-6.12,1.07,-.05,.20,.12,.16,mint,true),'soap','Sabonete');
 objects.shirt=tag(box('shirt',-4.65,.08,-1.22,.62,.06,.48,blue,true),'shirt','Camiseta');
 objects.sock=tag(box('sock',-5.25,.07,-1.18,.34,.05,.18,purple,true),'sock','Meia');

 // Quintal dentro da área jogável, reaproveitando o canto do cachorro.
 const lawn=box('yardGrass',4.20,.016,-2.58,4.65,.03,2.48,grass);lawn.isPickable=false;
 for(let x=2.15;x<=6.25;x+=.55){const f=box('fence',x,.54,-3.76,.10,1.06,.10,wood);f.isPickable=false}
 const flowerBed=box('flowerBed',5.45,.15,-2.48,1.65,.30,.86,wood);objects.flowers=tag(flowerBed,'flowers','Flores');
 for(let i=0;i<7;i++){const stem=cyl('stem'+i,4.88+(i%4)*.35,.48,-2.48+Math.floor(i/4)*.30,.06,.52,green);const bloom=sph('bloom'+i,stem.position.x,.78,stem.position.z,.24,[pink,yellow,red][i%3]);flowers.push(bloom)}
 objects.yardCan=tag(cyl('yardCan',3.10,.28,-3.15,.42,.50,blue,true),'yardCan','Regador do quintal');
 const sp=box('yardCanSpout',3.42,.38,-3.15,.48,.12,.13,blue);sp.rotation.z=.15;
 objects.yardTap=tag(cyl('yardTap',6.10,.65,-3.30,.12,.58,steel,true),'yardTap','Torneira do quintal');
 objects.yardBasket=tag(cyl('yardBasket',3.75,.30,-3.15,.72,.58,wood,true),'yardBasket','Cesto do quintal');
 objects.yardBall=tag(sph('yardBall',2.55,.23,-2.30,.40,red,true),'yardBall','Bola do quintal');
 objects.yardBlock=tag(box('yardBlock',3.15,.20,-2.08,.38,.38,.38,yellow,true),'yardBlock','Bloquinho');
 const tub=tag(box('dogTub',4.55,.30,-1.92,1.35,.58,.92,white,true),'dogTub','Banheira do cachorro');objects.dogTub=tub;
 objects.shampoo=tag(cyl('shampoo',5.32,.38,-1.88,.24,.58,mint,true),'shampoo','Shampoo');
 objects.towel=tag(box('towel',3.78,.16,-1.78,.72,.07,.42,pink,true),'towel','Toalha');

 gardenStar=box('gardenStar',5.45,1.35,-2.48,.42,.42,.06,yellow);gardenStar.rotation.z=.78;gardenStar.isVisible=false;
 const dog=scene.getTransformNodeByName('dog');
 if(dog){rainbow=box('rainbowBandana',.16,.63,0,.28,.12,.34,purple);rainbow.parent=dog;rainbow.isVisible=false}

 const hl=new B.HighlightLayer('v14Highlight',scene);hl.blurHorizontalSize=1.7;hl.blurVerticalSize=1.7;
 const arrow=box('extraArrow',0,0,0,.16,.55,.16,yellow);arrow.rotation.z=Math.PI/4;arrow.isPickable=false;arrow.isVisible=false;
 const ring=B.MeshBuilder.CreateTorus('v14Ring',{diameter:.90,thickness:.05,tessellation:22},scene);ring.rotation.x=Math.PI/2;ring.material=yellow;ring.isPickable=false;ring.isVisible=false;
 window.__HANNA_V14_VIS={hl,arrow,ring,last:null};
}

function buildUI(){
 const startPanel=document.querySelector('#start .panel');
 const extrasBtn=document.getElementById('extrasBtn');
 if(extrasBtn)extrasBtn.dataset.ready='1';

 const badge=document.createElement('div');badge.id='extraModeBadge';document.body.appendChild(badge);
 const exit=document.createElement('button');exit.id='extraExit';exit.textContent='← Voltar';document.body.appendChild(exit);
 exit.onclick=()=>location.reload();

 const modal=document.createElement('div');modal.id='extraCelebrate';
 modal.innerHTML='<div class="extraPanel"><div style="font-size:55px" id="extraCelebrEmoji">🌟</div><h2 id="extraCelebrTitle">Muito bem!</h2><p id="extraCelebrText"></p><div style="font-size:32px">👑 <span id="extraCrowns">0</span></div><br><button id="extraNext">Próxima missão</button></div>';
 document.body.appendChild(modal);
 document.getElementById('extraNext').onclick=nextMission;
}

function speak(text){
 if(!text)return;
 try{
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=.93;u.pitch=1.04;
  const voices=speechSynthesis.getVoices?.()||[];u.voice=voices.find(v=>/^pt-BR$/i.test(v.lang))||voices.find(v=>/^pt/i.test(v.lang))||null;
  speechSynthesis.speak(u);
 }catch(e){}
}
function toast(text){
 const el=document.getElementById('toastMsg');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1350);
}
function current(){return missions[extraMission]}
function stepDef(){return current().steps[extraStep]}
function setHeld(label){
 extraHeld=label||'';
 const held=document.getElementById('held');if(!held)return;
 held.style.display=extraHeld?'block':'none';held.textContent=extraHeld?'Na mão: '+extraHeld:'';
}
function updateHUD(say=false){
 if(!extrasActive)return;
 const m=current(),s=stepDef();
 $('#missionTitle').textContent='EXTRA: '+m.title;
 $('#missionIcon').textContent=m.icon;
 $('#instruction').textContent=s?s[0]:'Muito bem!';
 $('#stepText').textContent=(extraStep+1)+'/'+m.steps.length;
 $('#progressFill').style.width=((extraStep)/m.steps.length*100)+'%';
 $('#extraModeBadge').style.display='block';
 $('#extraModeBadge').textContent='🌿 EXPANSÃO • 👑 '+crowns;
 $('#extraExit').style.display='block';
 if(say&&s)speak(s[0]);
 updateTarget();
}
function targetFor(code){
 const map={
  toothbrush:objects.toothbrush,bathSink:objects.bathSink,brush:objects.bathSink,rinse:objects.bathSink,
  soap:objects.soap,bathTapOn:objects.bathTap,washHands:objects.bathSink,bathTapOff:objects.bathTap,
  shirt:objects.shirt,shirtBasket:objects.hamper,sock:objects.sock,sockBasket:objects.hamper,
  yardCan:objects.yardCan,yardFill:objects.yardTap,flowers:objects.flowers,yardCanBack:objects.yardBasket,
  yardBall:objects.yardBall,yardBallBasket:objects.yardBasket,yardBlock:objects.yardBlock,yardBlockBasket:objects.yardBasket,
  shampoo:objects.shampoo,dogTub:scene?.getMeshByName('dogHead')||objects.dogTub,dogWash:objects.dogTub,dogDry:scene?.getMeshByName('dogHead')||objects.towel
 };
 return map[code]||null;
}
function updateTarget(){
 const vis=window.__HANNA_V14_VIS;if(!vis)return;
 if(vis.last){try{vis.hl.removeMesh(vis.last)}catch(e){} vis.last=null}
 const t=targetFor(stepDef()?.[1]);
 if(t&&t.isVisible!==false){
  try{vis.hl.addMesh(t,B.Color3.FromHexString('#9ee6a8'));vis.last=t}catch(e){}
 }
}
function advance(code){
 const s=stepDef();if(!s||s[1]!==code)return false;
 extraStep++;
 if(extraStep>=current().steps.length){finishMission();return true}
 save();updateHUD(false);toast('✨ Muito bem!');setTimeout(()=>speak(stepDef()[0]),180);return true;
}
function finishMission(){
 const name=current().title;if(!done.includes(name)){done.push(name);crowns++}
 save();applyUnlocks();
 $('#extraCelebrEmoji').textContent=current().icon+'✨';
 $('#extraCelebrTitle').textContent='Missão concluída!';
 $('#extraCelebrText').textContent=current().title+' — você ganhou '+current().reward+' moedas extras e uma coroa.';
 $('#extraCrowns').textContent=crowns;
 $('#extraCelebrate').style.display='flex';
 speak('Muito bem! '+current().title+' concluída. Você ganhou uma coroa!');
}
function nextMission(){
 $('#extraCelebrate').style.display='none';
 if(extraMission<missions.length-1){extraMission++;extraStep=0;setHeld('');resetMissionObjects();save();updateHUD(true)}
 else{extraMission=0;extraStep=0;save();resetMissionObjects();updateHUD(true);toast('🏆 Todas as extras completas!')}
}
function applyUnlocks(){
 if(gardenStar)gardenStar.isVisible=crowns>=3;
 if(rainbow)rainbow.isVisible=crowns>=6;
}
function resetMissionObjects(){
 const show=(o,v=true)=>{if(o)o.isVisible=v};
 if(extraMission===0){show(objects.toothbrush,true);objects.toothbrush.position.set(-5.48,1.08,-.02)}
 if(extraMission===1){show(objects.soap,true);water.isVisible=false}
 if(extraMission===2){show(objects.shirt,true);show(objects.sock,true)}
 if(extraMission===3){show(objects.yardCan,true);objects.yardCan.position.set(3.10,.28,-3.15)}
 if(extraMission===4){show(objects.yardBall,true);show(objects.yardBlock,true)}
 if(extraMission===5){show(objects.shampoo,true);show(objects.towel,true)}
}
function extraNear(max=1.75){
 let best=null,bd=999;
 for(const o of Object.values(objects)){
  if(!o||o.isVisible===false||!o.metadata?.v14Type)continue;
  const p=o.getAbsolutePosition(),d=Math.hypot(p.x-player.position.x,p.z-player.position.z);
  if(d<bd&&d<=max){best=o;bd=d}
 }
 const dogHead=scene.getMeshByName('dogHead');
 if(dogHead){const p=dogHead.getAbsolutePosition(),d=Math.hypot(p.x-player.position.x,p.z-player.position.z);if(d<bd&&d<=max){best=dogHead;bd=d}}
 return best;
}
function pop(mesh){
 if(!mesh)return;const s=mesh.scaling.clone();mesh.scaling.scaleInPlace(1.16);setTimeout(()=>{try{mesh.scaling.copyFrom(s)}catch(e){}},180)
}
function extraInteract(){
 const s=stepDef();if(!s)return;
 const code=s[1],n=extraNear();
 if(!n){toast('Chegue mais perto 😊');return}
 const type=n.metadata?.v14Type|| (n.name==='dogHead'?'dog':'');
 if(code==='toothbrush'&&type==='toothbrush'){setHeld('🪥 Escova');n.isVisible=false;advance(code);return}
 if(code==='bathSink'&&type==='bathSink'){advance(code);return}
 if(code==='brush'&&type==='bathSink'&&/Escova/.test(extraHeld)){pop(n);toast('🪥 Escovando...');advance(code);return}
 if(code==='rinse'&&type==='bathSink'){setHeld('');toast('✨ Sorriso brilhando!');advance(code);return}

 if(code==='soap'&&type==='soap'){setHeld('🧼 Sabonete');n.isVisible=false;advance(code);return}
 if(code==='bathTapOn'&&type==='bathTap'){water.isVisible=true;advance(code);return}
 if(code==='washHands'&&type==='bathSink'&&/Sabonete/.test(extraHeld)){toast('🫧 Esfrega, esfrega!');pop(n);advance(code);return}
 if(code==='bathTapOff'&&type==='bathTap'){water.isVisible=false;setHeld('');advance(code);return}

 if(code==='shirt'&&type==='shirt'){setHeld('👕 Camiseta');n.isVisible=false;advance(code);return}
 if(code==='shirtBasket'&&type==='hamper'&&/Camiseta/.test(extraHeld)){setHeld('');advance(code);return}
 if(code==='sock'&&type==='sock'){setHeld('🧦 Meia');n.isVisible=false;advance(code);return}
 if(code==='sockBasket'&&type==='hamper'&&/Meia/.test(extraHeld)){setHeld('');advance(code);return}

 if(code==='yardCan'&&type==='yardCan'){setHeld('💧 Regador');n.isVisible=false;advance(code);return}
 if(code==='yardFill'&&type==='yardTap'&&/Regador/.test(extraHeld)){toast('💦 Regador cheio!');advance(code);return}
 if(code==='flowers'&&type==='flowers'&&/Regador/.test(extraHeld)){flowers.forEach(f=>{f.scaling.scaleInPlace(1.10)});toast('🌻 Flores felizes!');advance(code);return}
 if(code==='yardCanBack'&&type==='yardBasket'&&/Regador/.test(extraHeld)){setHeld('');objects.yardCan.isVisible=true;objects.yardCan.position.set(3.10,.28,-3.15);advance(code);return}

 if(code==='yardBall'&&type==='yardBall'){setHeld('🎾 Bola');n.isVisible=false;advance(code);return}
 if(code==='yardBallBasket'&&type==='yardBasket'&&/Bola/.test(extraHeld)){setHeld('');advance(code);return}
 if(code==='yardBlock'&&type==='yardBlock'){setHeld('🟨 Bloco');n.isVisible=false;advance(code);return}
 if(code==='yardBlockBasket'&&type==='yardBasket'&&/Bloco/.test(extraHeld)){setHeld('');advance(code);return}

 if(code==='shampoo'&&type==='shampoo'){setHeld('🧴 Shampoo');n.isVisible=false;advance(code);return}
 if(code==='dogTub'&&type==='dog'){
   const dog=scene.getTransformNodeByName('dog');if(dog){dog.position.set(4.55,0,-1.92)}
   toast('🐶 Au!');advance(code);return
 }
 if(code==='dogWash'&&type==='dogTub'&&/Shampoo/.test(extraHeld)){toast('🫧 Banho gostoso!');pop(n);setHeld('');advance(code);return}
 if(code==='dogDry'&&(type==='dog'||type==='towel')){
   setHeld('');toast('🐶 Limpinho e cheiroso!');advance(code);return
 }
 toast('Esse não é o objeto agora 😉');
}

function bind(){
 const extrasBtn=document.getElementById('extrasBtn');
 extrasBtn?.addEventListener('click',()=>{
   extrasActive=true;
   document.getElementById('playBtn')?.click();
   setTimeout(()=>{try{speechSynthesis.cancel()}catch(e){};resetMissionObjects();updateHUD(true)},320);
 });
 const use=document.getElementById('useBtn');
 use?.addEventListener('pointerdown',e=>{if(!extrasActive)return;e.preventDefault();e.stopImmediatePropagation();extraInteract()},{capture:true});
 window.addEventListener('keydown',e=>{if(!extrasActive)return;if(e.code==='KeyE'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();extraInteract()}},true);

 const vis=window.__HANNA_V14_VIS;
 scene.onBeforeRenderObservable.add(()=>{
   if(!extrasActive)return;
   const coreArrow=scene.getMeshByName('arrow'),coreRing=scene.getMeshByName('targetRing');
   if(coreArrow)coreArrow.isVisible=false;if(coreRing)coreRing.isVisible=false;
   const n=extraNear();
   const near=document.getElementById('near');
   if(near){if(n){near.textContent=(n.metadata?.v14Label||n.metadata?.label||'Interagir')+' • USAR';near.style.opacity='1'}else near.style.opacity='0'}
   const t=targetFor(stepDef()?.[1]);
   if(t&&t.isVisible!==false&&vis){
     const p=t.getAbsolutePosition();vis.arrow.position.set(p.x,p.y+1.15+Math.sin(performance.now()/240)*.07,p.z);vis.arrow.rotation.y=performance.now()/520;vis.arrow.isVisible=true;
     vis.ring.position.set(p.x,.05,p.z);vis.ring.isVisible=true;
   }else if(vis){vis.arrow.isVisible=false;vis.ring.isVisible=false}
 });
}
wait();
})();