(()=>{
'use strict';
const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
document.body.classList.add('v15-remaster');

const q=s=>document.querySelector(s);
const nearEl=q('#near'),instructionEl=q('#instruction'),heldEl=q('#held'),useBtn=q('#useBtn');

function actionFor(text,instruction,held){
  const t=(text+' '+instruction+' '+held).toLowerCase();
  if(/cachorro|beb[eê]/.test(t)&&/carinho|acarici|faça carinho/.test(t))return ['🤍','CARINHO'];
  if(/pegue|apanhe/.test(instruction.toLowerCase()))return ['✋','PEGAR'];
  if(/coloque|guarde|deixe/.test(instruction.toLowerCase()))return ['↓','COLOCAR'];
  if(/geladeira|porta|ba[uú]/.test(t))return ['↔','ABRIR'];
  if(/torneira/.test(t)&&/feche|deslig/.test(instruction.toLowerCase()))return ['💧','FECHAR'];
  if(/torneira/.test(t))return ['💧','LIGAR'];
  if(/regar|flores|planta/.test(t))return ['💦','REGAR'];
  if(/lavar|banho/.test(t))return ['🫧','LAVAR'];
  if(/comer|ração|racao/.test(t))return ['🍽️','DAR'];
  if(/mesa|berço|berco|cesto/.test(t)&&held.trim())return ['↓','COLOCAR'];
  return ['✋','USAR'];
}
function refreshAction(){
  if(!useBtn)return;
  const [icon,label]=actionFor(nearEl?.textContent||'',instructionEl?.textContent||'',heldEl?.textContent||'');
  if(useBtn.dataset.v15Label===label)return;
  useBtn.dataset.v15Label=label;
  useBtn.innerHTML='<span class="v15ActionIcon">'+icon+'</span><span class="v15ActionText">'+label+'</span>';
}
[new MutationObserver(refreshAction),new MutationObserver(refreshAction),new MutationObserver(refreshAction)].forEach((o,i)=>{
  const el=[nearEl,instructionEl,heldEl][i];if(el)o.observe(el,{subtree:true,childList:true,characterData:true,attributes:true});
});
refreshAction();

function wait(){
  const B=window.BABYLON,scene=B?.EngineStore?.LastCreatedScene;
  const player=scene?.getTransformNodeByName?.('player');
  if(!B||!scene||!player){setTimeout(wait,220);return}
  if(window.__HANNA_V15__)return;
  window.__HANNA_V15__=true;
  boot(B,scene,player);
}

function boot(B,scene,player){
  // Remove qualquer vestígio visual de debug criado por versões anteriores.
  ['motionBadge','qualityBadge','netBadge','help'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});

  // Direção de arte: menos plástico/brilho, contraste mais consistente.
  try{
    scene.clearColor=B.Color4.FromHexString('#cfe7ecff');
    const ipc=scene.imageProcessingConfiguration;
    ipc.contrast=1.10;ipc.exposure=1.02;ipc.vignetteEnabled=true;ipc.vignetteWeight=.72;ipc.vignetteStretch=.12;
    scene.environmentIntensity=.52;
  }catch(e){}

  // Harmoniza materiais importados/procedurais sem destruir texturas.
  for(const m of scene.materials){
    try{
      if('roughness' in m && typeof m.roughness==='number')m.roughness=Math.max(.52,m.roughness||.52);
      if('metallic' in m && typeof m.metallic==='number')m.metallic=Math.min(.14,m.metallic||0);
      if(m.specularColor)m.specularColor=new B.Color3(.055,.05,.045);
    }catch(e){}
  }

  // Corrige objetos que estavam visualmente gigantes no pack.
  for(const mesh of scene.meshes){
    const n=(mesh.name||'').toLowerCase();
    try{
      if((/environment[_ -]?pan|(^|[_ -])pan($|[_ -])/.test(n))&&!mesh.metadata?.v15Scaled){
        mesh.scaling.scaleInPlace(.58);mesh.metadata={...(mesh.metadata||{}),v15Scaled:true};
      }
      if(/kitchenknives/.test(n)&&!mesh.metadata?.v15Scaled){
        mesh.scaling.scaleInPlace(.72);mesh.metadata={...(mesh.metadata||{}),v15Scaled:true};
      }
    }catch(e){}
  }

  // Luz quente de janela + preenchimento frio suave.
  try{
    const warm=new B.PointLight('v15WindowGlow',new B.Vector3(-5.7,3.1,-2.2),scene);
    warm.diffuse=B.Color3.FromHexString('#ffd6a0');warm.intensity=.22;warm.range=11;
    const fill=new B.PointLight('v15SoftFill',new B.Vector3(4.2,2.3,1.4),scene);
    fill.diffuse=B.Color3.FromHexString('#d7f3ff');fill.intensity=.12;fill.range=9;
  }catch(e){}

  // Blob shadows baratos dão "peso" à personagem e pet sem SSAO pesado.
  function blob(name,parent,diam=.72,alpha=.17){
    try{
      const d=B.MeshBuilder.CreateDisc(name,{radius:diam/2,tessellation:28},scene);
      d.rotation.x=Math.PI/2;d.position.y=.025;d.isPickable=false;
      const mat=new B.StandardMaterial(name+'Mat',scene);
      mat.diffuseColor=B.Color3.Black();mat.emissiveColor=B.Color3.Black();mat.alpha=alpha;mat.disableLighting=true;
      d.material=mat;
      scene.onBeforeRenderObservable.add(()=>{
        const p=parent?.position;if(!p)return;d.position.x=p.x;d.position.z=p.z;
      });
      return d;
    }catch(e){return null}
  }
  blob('v15PlayerContact',player,.70,.15);
  const dog=scene.getTransformNodeByName?.('dog');if(dog)blob('v15DogContact',dog,.48,.12);

  // Câmera: aproxima bastante, mantém giro do usuário e segue suavemente.
  const camera=scene.activeCamera;
  if(camera&&'radius' in camera){
    const portrait=()=>innerHeight>innerWidth;
    let desiredRadius=portrait()?8.35:8.9;
    let target=new B.Vector3(player.position.x,player.position.y+1.18,player.position.z);

    // Libera limites antigos de distância; zoom continua bloqueado pelo mobile-fix.
    camera.lowerRadiusLimit=desiredRadius;camera.upperRadiusLimit=desiredRadius;
    camera.radius=desiredRadius;
    camera.lowerBetaLimit=.78;camera.upperBetaLimit=1.17;
    if(Number.isFinite(camera.beta))camera.beta=Math.max(.84,Math.min(1.08,camera.beta));

    const retune=()=>{
      desiredRadius=portrait()?8.35:8.9;
      camera.lowerRadiusLimit=desiredRadius;camera.upperRadiusLimit=desiredRadius;
    };
    addEventListener('resize',retune,{passive:true});

    scene.onBeforeRenderObservable.add(()=>{
      // target mais alto coloca a personagem no terço inferior da tela.
      const wanted=new B.Vector3(player.position.x,player.position.y+1.18,player.position.z);
      target=B.Vector3.Lerp(target,wanted,.115);
      try{
        camera.setTarget(target);
        camera.radius=desiredRadius;
        camera.inertialRadiusOffset=0;
      }catch(e){}
    });
  }

  // Oclusão simples: paredes entre câmera e personagem ficam translúcidas.
  const original=new Map(),faded=new Set();
  let lastFade=0;
  scene.onBeforeRenderObservable.add(()=>{
    const now=performance.now();if(now-lastFade<150)return;lastFade=now;
    const cam=scene.activeCamera;if(!cam)return;
    const from=cam.globalPosition||cam.position;
    const to=new B.Vector3(player.position.x,player.position.y+1.0,player.position.z);
    const dir=to.subtract(from);const len=dir.length();if(len<.2)return;
    const ray=new B.Ray(from,dir.normalize(),len-.5);
    let picks=[];
    try{picks=scene.multiPickWithRay(ray,m=>/wall|parede/i.test(m.name||''))||[]}catch(e){}
    const hit=new Set(picks.filter(p=>p.hit&&p.pickedMesh).map(p=>p.pickedMesh));
    for(const m of faded){
      if(!hit.has(m)){
        const o=original.get(m);if(o){m.material=o.mat;o.mat.alpha=o.alpha}
        faded.delete(m);original.delete(m);
      }
    }
    for(const m of hit){
      if(faded.has(m)||!m.material)continue;
      const old=m.material;
      const clone=old.clone?.(old.name+'_v15fade');
      if(!clone)continue;
      original.set(m,{mat:old,alpha:old.alpha??1});
      m.material=clone;clone.alpha=.18;
      faded.add(m);
    }
  });

  // Pequeno "respirar" na câmera ao interagir dá sensação de ação, sem zoom do gesto.
  let pulse=0;
  useBtn?.addEventListener('pointerdown',()=>{pulse=1});
  scene.onBeforeRenderObservable.add(()=>{
    if(!pulse)return;
    pulse*=.82;
    if(pulse<.02){pulse=0;return}
    const cam=scene.activeCamera;
    if(cam&&'fov' in cam)cam.fov=.80-.018*pulse;
  });

  // Versão só no console; gameplay fica limpo.
  console.info('Casa da Hanna v1.5 Visual Remaster ativo');
}
wait();
})();