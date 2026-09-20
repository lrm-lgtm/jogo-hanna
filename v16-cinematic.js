(()=>{
'use strict';
document.body.classList.add('v16-cinematic');
const q=s=>document.querySelector(s);
const instruction=q('#instruction');
const near=q('#near');
const use=q('#useBtn');

function updateWaiting(){
  const text=(instruction?.textContent||'').toLowerCase();
  const waiting=/espere|aguarde|deixe .* comer|dormir por alguns/.test(text);
  document.body.classList.toggle('v16-waiting',waiting);
  if(waiting&&use){
    use.innerHTML='<span class="v15ActionIcon">⏳</span><span class="v15ActionText">AGUARDE</span>';
    use.dataset.v15Label='AGUARDE';
  }
}
if(instruction){
  new MutationObserver(()=>setTimeout(updateWaiting,0)).observe(instruction,{subtree:true,childList:true,characterData:true});
}
updateWaiting();

function wait(){
  const B=window.BABYLON;
  const scene=B?.EngineStore?.LastCreatedScene;
  const player=scene?.getTransformNodeByName?.('player');
  if(!B||!scene||!player){setTimeout(wait,220);return}
  if(window.__HANNA_V16__)return;
  window.__HANNA_V16__=true;
  boot(B,scene,player);
}

function boot(B,scene,player){
  // Visual menos "estourado".
  try{
    const ipc=scene.imageProcessingConfiguration;
    ipc.exposure=.86;
    ipc.contrast=1.17;
    ipc.vignetteEnabled=true;
    ipc.vignetteWeight=.62;
    ipc.vignetteStretch=.08;
    scene.environmentIntensity=.38;
    scene.clearColor=B.Color4.FromHexString('#bed9e2ff');
  }catch(e){}

  // Tons base mais quentes / menos branco puro.
  for(const m of scene.materials){
    const n=(m.name||'').toLowerCase();
    try{
      if(n==='floor' && m.diffuseColor)m.diffuseColor=B.Color3.FromHexString('#e8dfcf');
      if(n==='wall' && m.diffuseColor)m.diffuseColor=B.Color3.FromHexString('#eee6da');
      if(m.specularColor)m.specularColor=new B.Color3(.035,.035,.035);
      if('roughness' in m && typeof m.roughness==='number')m.roughness=Math.max(.60,m.roughness||.60);
      if('metallic' in m && typeof m.metallic==='number')m.metallic=Math.min(.08,m.metallic||0);
    }catch(e){}
  }

  const camera=scene.activeCamera;
  if(camera&&'radius' in camera){
    let desiredRadius=innerHeight>innerWidth?6.75:7.25;
    const target=new B.Vector3(player.position.x,player.position.y+1.12,player.position.z);
    camera.radius=desiredRadius;
    camera.lowerRadiusLimit=desiredRadius;
    camera.upperRadiusLimit=desiredRadius;
    camera.fov=.72;
    camera.lowerBetaLimit=.90;
    camera.upperBetaLimit=1.20;
    if(Number.isFinite(camera.beta))camera.beta=Math.max(1.02,Math.min(1.14,camera.beta));

    addEventListener('resize',()=>{
      desiredRadius=innerHeight>innerWidth?6.75:7.25;
      camera.lowerRadiusLimit=desiredRadius;
      camera.upperRadiusLimit=desiredRadius;
    },{passive:true});

    scene.onBeforeRenderObservable.add(()=>{
      const wantedX=player.position.x;
      const wantedY=player.position.y+1.12;
      const wantedZ=player.position.z;
      target.x+=(wantedX-target.x)*.10;
      target.y+=(wantedY-target.y)*.10;
      target.z+=(wantedZ-target.z)*.10;
      try{
        camera.setTarget(target);
        camera.radius=desiredRadius;
        camera.fov+=(.72-camera.fov)*.16;
        camera.inertialRadiusOffset=0;
      }catch(e){}
    });
  }

  // Guia amarelo muito menor.
  ['arrow','extraArrow'].forEach(name=>{
    const m=scene.getMeshByName?.(name);
    if(m){m.scaling.scaleInPlace(.48)}
  });
  ['targetRing','v14Ring'].forEach(name=>{
    const m=scene.getMeshByName?.(name);
    if(m){m.scaling.scaleInPlace(.72)}
  });

  // O pacote anterior vinha com alguns props gigantes.
  // Estes pontos são as posições onde os GLTFs foram inseridos no cenário.
  const corrections=[
    {p:[4.15,1.16,3.55],s:.34}, // frigideira
    {p:[4.72,1.00,3.56],s:.60}, // facas
    {p:[2.00,1.10,.45],s:.55},  // prato
    {p:[2.35,1.11,.45],s:.55}   // tigela
  ];
  const corrected=new WeakSet();
  function fixImportedScale(){
    const nodes=[...(scene.transformNodes||[]),...(scene.meshes||[])];
    for(const c of corrections){
      for(const node of nodes){
        if(!node||corrected.has(node)||!node.position||!node.scaling)continue;
        const dx=node.position.x-c.p[0],dy=node.position.y-c.p[1],dz=node.position.z-c.p[2];
        if(Math.hypot(dx,dy,dz)<.08){
          // Só mexe em roots/import wrappers para não escalar cada filho duas vezes.
          if(node.parent)continue;
          node.scaling.scaleInPlace(c.s);
          corrected.add(node);
        }
      }
    }
  }
  fixImportedScale();
  let fixTicks=0;
  const fixTimer=setInterval(()=>{
    fixImportedScale();
    if(++fixTicks>35)clearInterval(fixTimer);
  },350);

  // Harmoniza o sofá importado para um terracota menos gritante.
  function tintNear(pos,r,color){
    for(const mesh of scene.meshes||[]){
      try{
        const p=mesh.getAbsolutePosition?.()||mesh.position;
        if(!p||Math.hypot(p.x-pos[0],p.y-pos[1],p.z-pos[2])>r||!mesh.material)continue;
        const mat=mesh.material;
        if('albedoColor' in mat)mat.albedoColor=B.Color3.FromHexString(color);
        else if(mat.diffuseColor)mat.diffuseColor=B.Color3.FromHexString(color);
      }catch(e){}
    }
  }
  setTimeout(()=>tintNear([-.8,.6,2.15],1.5,'#b96b5d'),2200);

  // Sombra de contato mais discreta que a bolha cinza anterior.
  const old=scene.getMeshByName?.('v15PlayerContact');
  if(old?.material){old.scaling.scaleInPlace(.72);old.material.alpha=.08}
  const oldDog=scene.getMeshByName?.('v15DogContact');
  if(oldDog?.material){oldDog.scaling.scaleInPlace(.75);oldDog.material.alpha=.07}

  // Borda de interação só aparece quando útil; durante "espere" desaparece.
  scene.onBeforeRenderObservable.add(()=>{
    updateWaiting();
    if(document.body.classList.contains('v16-waiting')){
      const a=scene.getMeshByName?.('arrow');if(a)a.isVisible=false;
      const r=scene.getMeshByName?.('targetRing');if(r)r.isVisible=false;
      const ea=scene.getMeshByName?.('extraArrow');if(ea)ea.isVisible=false;
      const er=scene.getMeshByName?.('v14Ring');if(er)er.isVisible=false;
    }
  });

  console.info('Casa da Hanna v1.6 Cinematic Pass ativo');
}
wait();
})();