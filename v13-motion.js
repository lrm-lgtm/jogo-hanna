(()=>{
'use strict';
const waitForScene=()=>{
  const scene=window.BABYLON?.EngineStore?.LastCreatedScene;
  const player=scene?.getTransformNodeByName?.('player');
  if(!scene||!player){setTimeout(waitForScene,250);return}
  boot(scene,player);
};
function boot(scene,player){
  if(window.__HANNA_V13__)return;
  window.__HANNA_V13__=true;
  const B=window.BABYLON;
  const heldEl=document.getElementById('held');
  const useBtn=document.getElementById('useBtn');
  const nearEl=document.getElementById('near');

  const anchor=new B.TransformNode('v13HandAnchor',scene);
  anchor.parent=player;
  anchor.position.set(.48,1.03,.30);
  anchor.rotation.set(.05,0,.12);

  let carried=null,lastHeld='';
  const mats={};
  const mat=(name,color)=>{
    if(mats[name])return mats[name];
    const m=new B.StandardMaterial('v13_'+name,scene);
    m.diffuseColor=B.Color3.FromHexString(color);
    m.specularColor=new B.Color3(.08,.08,.08);
    mats[name]=m;return m;
  };
  function clearCarried(){
    if(carried){try{carried.dispose(false,true)}catch(e){} carried=null}
  }
  function mkBox(name,w,h,d,color){
    const m=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    m.material=mat(name+'Mat',color);m.parent=anchor;m.isPickable=false;return m;
  }
  function mkSphere(name,d,color){
    const m=B.MeshBuilder.CreateSphere(name,{diameter:d,segments:12},scene);
    m.material=mat(name+'Mat',color);m.parent=anchor;m.isPickable=false;return m;
  }
  function mkCylinder(name,d,h,color){
    const m=B.MeshBuilder.CreateCylinder(name,{diameter:d,height:h,tessellation:14},scene);
    m.material=mat(name+'Mat',color);m.parent=anchor;m.isPickable=false;return m;
  }
  function buildCarried(label){
    clearCarried();
    const root=new B.TransformNode('v13Carried',scene);root.parent=anchor;root.scaling.setAll(.78);
    let m=null;
    if(/Leite/i.test(label)){
      m=mkBox('carryMilk',.25,.5,.22,'#fbfaf6');m.parent=root;
      const cap=mkCylinder('carryMilkCap',.12,.10,'#80c8dc');cap.parent=root;cap.position.y=.30;
    }else if(/Pão|Torrada/i.test(label)){
      m=mkBox('carryBread',.34,.25,.15,/Torrada/i.test(label)?'#8a532f':'#c98a51');m.parent=root;
    }else if(/Ração/i.test(label)){
      m=mkBox('carryFood',.34,.48,.20,'#e99855');m.parent=root;m.rotation.z=.08;
    }else if(/Mamadeira/i.test(label)){
      m=mkCylinder('carryBottle',.18,.43,'#fbfaf6');m.parent=root;
      const tip=mkCylinder('carryBottleTip',.08,.12,'#f2acc3');tip.parent=root;tip.position.y=.28;
    }else if(/Ursinho/i.test(label)){
      const body=mkSphere('carryTeddyBody',.35,'#c78955');body.parent=root;
      const head=mkSphere('carryTeddyHead',.28,'#8e5937');head.parent=root;head.position.y=.28;
    }else if(/Bola/i.test(label)){
      m=mkSphere('carryBall',.34,'#e46f68');m.parent=root;
    }else if(/Bloco/i.test(label)){
      m=mkBox('carryBlock',.32,.32,.32,'#80c8dc');m.parent=root;
    }else if(/Regador/i.test(label)){
      m=mkCylinder('carryCan',.30,.36,'#80c8dc');m.parent=root;m.rotation.z=Math.PI/2;
    }else if(/Prato/i.test(label)){
      m=mkCylinder('carryDish',.42,.06,'#fbfaf6');m.parent=root;m.rotation.x=Math.PI/2;
    }else if(/Almofada/i.test(label)){
      m=mkBox('carryCushion',.48,.18,.42,/rosa/i.test(label)?'#f2acc3':'#f4cb5d');m.parent=root;m.rotation.z=.12;
    }else if(/Pano/i.test(label)){
      m=mkBox('carryCloth',.42,.04,.32,'#bfe5cf');m.parent=root;m.rotation.z=.18;
    }else{
      m=mkSphere('carryGeneric',.25,'#f7cb69');m.parent=root;
    }
    carried=root;
  }
  function readHeld(){
    const visible=heldEl&&getComputedStyle(heldEl).display!=='none';
    const text=visible?(heldEl.textContent||''):'';
    if(text===lastHeld)return;
    lastHeld=text;
    if(!text){clearCarried();return}
    buildCarried(text);
  }
  new MutationObserver(readHeld).observe(heldEl,{subtree:true,childList:true,attributes:true,characterData:true});
  readHeld();

  const armR=scene.getMeshByName('armR'),armL=scene.getMeshByName('armL');
  let actionUntil=0,actionKind='use',baseRY=0,baseLY=0;
  if(armR)baseRY=armR.rotation.x;
  if(armL)baseLY=armL.rotation.x;

  function contextualAction(){
    actionUntil=performance.now()+520;
    const near=(nearEl?.textContent||'').toLowerCase();
    actionKind=/cachorro|bebê/.test(near)?'pet':lastHeld?'carry':'use';
    const groups=scene.animationGroups||[];
    const words=actionKind==='pet'?['pet','wave','interact']:actionKind==='carry'?['pick','grab','interact']:['interact','use','wave'];
    const g=groups.find(a=>words.some(w=>a.name.toLowerCase().includes(w)));
    if(g){try{groups.forEach(a=>a.stop());g.start(false,1.08,g.from,g.to,false)}catch(e){}}
  }
  useBtn?.addEventListener('pointerdown',contextualAction,{capture:false});
  document.addEventListener('keydown',e=>{if(e.code==='KeyE'||e.code==='Space')contextualAction()});

  let t=0;
  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.min(.04,(scene.getEngine().getDeltaTime()||16)/1000);t+=dt;
    if(carried){
      carried.position.y=Math.sin(t*6)*.022;
      carried.rotation.y=Math.sin(t*2.3)*.08;
    }
    const active=performance.now()<actionUntil;
    if(active){
      const k=Math.sin((1-(actionUntil-performance.now())/520)*Math.PI);
      anchor.rotation.x=.05-.45*k;
      anchor.position.z=.30+.16*k;
      if(armR&&armR.isVisible!==false)armR.rotation.x=baseRY-1.0*k;
      if(armL&&armL.isVisible!==false&&actionKind==='pet')armL.rotation.x=baseLY-.55*k;
    }else{
      anchor.rotation.x+=( .05-anchor.rotation.x)*.18;
      anchor.position.z+=(.30-anchor.position.z)*.18;
      if(armR&&armR.isVisible!==false)armR.rotation.x+=(baseRY-armR.rotation.x)*.18;
      if(armL&&armL.isVisible!==false)armL.rotation.x+=(baseLY-armL.rotation.x)*.18;
    }
  });

  // Pequeno marcador de versão em jogo.
  const badge=document.createElement('div');
  badge.id='motionBadge';badge.textContent='✨ v1.3 movimento';
  Object.assign(badge.style,{position:'fixed',left:'50%',bottom:'6px',transform:'translateX(-50%)',zIndex:'17',fontSize:'9px',fontWeight:'900',padding:'3px 7px',borderRadius:'999px',background:'#ffffffaa',pointerEvents:'none'});
  document.body.appendChild(badge);
  console.info('Casa da Hanna v1.3: movimento contextual e objetos na mão ativos');
}
waitForScene();
})();