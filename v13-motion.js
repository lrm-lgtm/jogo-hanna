(()=>{
'use strict';
const wait=()=>{
 const scene=window.BABYLON?.EngineStore?.LastCreatedScene,player=scene?.getTransformNodeByName?.('player');
 if(!scene||!player){setTimeout(wait,250);return} boot(scene,player);
};
function boot(scene,player){
 if(window.__HANNA_V13__)return;window.__HANNA_V13__=true;
 const B=window.BABYLON,heldEl=document.getElementById('held'),useBtn=document.getElementById('useBtn'),nearEl=document.getElementById('near');
 const anchor=new B.TransformNode('v13HandAnchor',scene);anchor.parent=player;anchor.position.set(.30,1.02,.14);
 let carried=null,lastHeld='';const mats={};
 const mat=(n,c)=>mats[n]||(mats[n]=(()=>{const m=new B.StandardMaterial('v13_'+n,scene);m.diffuseColor=B.Color3.FromHexString(c);m.specularColor=new B.Color3(.05,.05,.05);return m})());
 const box=(n,w,h,d,c)=>{const m=B.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);m.material=mat(n+'M',c);m.isPickable=false;return m};
 const sph=(n,d,c)=>{const m=B.MeshBuilder.CreateSphere(n,{diameter:d,segments:10},scene);m.material=mat(n+'M',c);m.isPickable=false;return m};
 const cyl=(n,d,h,c)=>{const m=B.MeshBuilder.CreateCylinder(n,{diameter:d,height:h,tessellation:12},scene);m.material=mat(n+'M',c);m.isPickable=false;return m};
 function clear(){if(carried){try{carried.dispose(false,true)}catch(e){}carried=null}}
 function build(label){
  clear();const root=new B.TransformNode('v13Carried',scene);root.parent=anchor;root.scaling.setAll(.78);let m;
  if(/Leite/i.test(label)){m=box('carryMilk',.25,.5,.22,'#fbfaf6');m.parent=root;const c=cyl('carryMilkCap',.12,.10,'#80c8dc');c.parent=root;c.position.y=.30}
  else if(/Pão|Torrada/i.test(label)){m=box('carryBread',.34,.25,.15,/Torrada/i.test(label)?'#8a532f':'#c98a51');m.parent=root}
  else if(/Ração/i.test(label)){m=box('carryFood',.34,.48,.20,'#e99855');m.parent=root;m.rotation.z=.08}
  else if(/Mamadeira/i.test(label)){m=cyl('carryBottle',.18,.43,'#fbfaf6');m.parent=root;const c=cyl('carryBottleTip',.08,.12,'#f2acc3');c.parent=root;c.position.y=.28}
  else if(/Ursinho/i.test(label)){
   root.position.set(0,-.17,-.06);root.rotation.z=-.18;
   const bearMat=mat('carryTeddyFur','#a96f45'),muzzleMat=mat('carryTeddyMuzzle','#e7c29b');
   const b=B.MeshBuilder.CreateCapsule('carryTeddyBody',{height:.34,radius:.16,tessellation:12,subdivisions:2},scene);b.material=bearMat;b.parent=root;b.position.y=.08;
   const h=sph('carryTeddyHead',.27,'#a96f45');h.parent=root;h.position.y=.34;
   const e1=sph('carryTeddyEarL',.10,'#805034');e1.parent=root;e1.position.set(-.10,.45,0);
   const e2=sph('carryTeddyEarR',.10,'#805034');e2.parent=root;e2.position.set(.10,.45,0);
   const mu=sph('carryTeddyMuzzle',.105,'#e7c29b');mu.parent=root;mu.position.set(0,.31,-.13);
   const a1=sph('carryTeddyArmL',.11,'#a96f45');a1.parent=root;a1.position.set(-.18,.10,0);a1.rotation.z=-.35;
   const a2=sph('carryTeddyArmR',.11,'#a96f45');a2.parent=root;a2.position.set(.18,.10,0);a2.rotation.z=.35;
   for(const x of [-.095,.095]){
    const foot=sph('carryTeddyFoot',.12,'#805034');foot.parent=root;foot.position.set(x,-.13,-.035);foot.scaling.z=1.25;
    const eye=sph('carryTeddyEye',.029,'#2e241d');eye.parent=root;eye.position.set(x,.36,-.13);
   }
   const nose=sph('carryTeddyNose',.035,'#2e241d');nose.parent=root;nose.position.set(0,.31,-.19);
  }
  else if(/Bola/i.test(label)){m=sph('carryBall',.34,'#e46f68');m.parent=root}
  else if(/Bloco/i.test(label)){m=box('carryBlock',.32,.32,.32,'#80c8dc');m.parent=root}
  else if(/Regador/i.test(label)){m=cyl('carryCan',.30,.36,'#80c8dc');m.parent=root}
  else if(/Prato/i.test(label)){m=cyl('carryDish',.42,.06,'#fbfaf6');m.parent=root}
  else if(/Almofada/i.test(label)){m=box('carryCushion',.48,.18,.42,/rosa/i.test(label)?'#d9899e':'#d8aa54');m.parent=root;m.rotation.z=.12}
  else if(/Pano/i.test(label)){m=box('carryCloth',.42,.04,.32,'#bfe5cf');m.parent=root;m.rotation.z=.18}
  else {m=sph('carryGeneric',.25,'#f7cb69');m.parent=root}
  carried=root;
 }
 function read(){
  const text=heldEl&&getComputedStyle(heldEl).display!=='none'?(heldEl.textContent||''):'';
  if(text===lastHeld)return;
  lastHeld=text;text?build(text):clear();
 }
 new MutationObserver(read).observe(heldEl,{subtree:true,childList:true,attributes:true,characterData:true});read();
 const armR=scene.getMeshByName('armR'),armL=scene.getMeshByName('armL');let until=0,kind='use',baseR=armR?.rotation.x||0,baseL=armL?.rotation.x||0;
 function action(){until=performance.now()+520;const n=(nearEl?.textContent||'').toLowerCase();kind=/cachorro|bebê/.test(n)?'pet':lastHeld?'carry':'use'}
 useBtn?.addEventListener('pointerdown',action);document.addEventListener('keydown',e=>{if(e.code==='KeyE'||e.code==='Space')action()});
 // O glTF pode carregar depois deste script e nomear o osso como Hand.R,
 // mixamorigRightHand ou CC_Base_R_Hand. Procuramos sem custo a cada frame.
 let wrist=null,lastWristLookup=0;
 function findRightHand(){
  return scene.transformNodes.find(node=>{
   const name=(node.name||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
   return /^(?:wristr|handr|righthand|rightwrist|mixamorigrighthand|mixamorigrightwrist|ccbaserhand|bip001rhand)$/.test(name);
  })||null;
 }
 scene.onBeforeRenderObservable.add(()=>{
  const now=performance.now();
  if((!wrist||!wrist.isEnabled())&&now-lastWristLookup>450){
   wrist=findRightHand();lastWristLookup=now;
  }
  if(wrist&&wrist.isEnabled()){
   const hand=B.Vector3.TransformCoordinates(wrist.getAbsolutePosition(),player.getWorldMatrix().clone().invert());
   anchor.position.set(hand.x,hand.y-.06,hand.z+.04);
  }else anchor.position.set(.29,1.06,.04);
  const active=performance.now()<until;
  if(active){const k=Math.sin((1-(until-performance.now())/520)*Math.PI);anchor.rotation.x=-.25*k;if(armR&&armR.isVisible!==false)armR.rotation.x=baseR-.9*k;if(armL&&armL.isVisible!==false&&kind==='pet')armL.rotation.x=baseL-.5*k}
  else{anchor.rotation.x*=.72;if(armR&&armR.isVisible!==false)armR.rotation.x+=(baseR-armR.rotation.x)*.18;if(armL&&armL.isVisible!==false)armL.rotation.x+=(baseL-armL.rotation.x)*.18}
 });
}
wait();
})();
