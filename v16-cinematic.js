(()=>{
'use strict';
// v1.9 — câmera adaptativa, paredes transparentes e indicadores legíveis.
document.body.classList.add('v16-cinematic');
const instruction=document.getElementById('instruction');
const use=document.getElementById('useBtn');

function waiting(){
 const text=(instruction?.textContent||'').toLowerCase();
 const active=/espere|aguarde|deixe .* comer|dormir por alguns/.test(text);
 document.body.classList.toggle('v16-waiting',active);
 if(active&&use&&use.dataset.v15Label!=='AGUARDE'){
  use.innerHTML='<span class="actionIcon">⏳</span><span class="actionText">AGUARDE</span>';
  use.dataset.v15Label='AGUARDE';
 }
}
if(instruction)new MutationObserver(waiting).observe(instruction,{subtree:true,childList:true,characterData:true});
waiting();

function bindAssetRegistry(registry){
 registry?.onReady?.(record=>{
  const file=(record?.file||'').toLowerCase();
  if(file)record.wrapper.metadata={...(record.wrapper.metadata||{}),assetFile:file,adjustedOnReady:true};
 });
}
if(window.HannaAssets)bindAssetRegistry(window.HannaAssets);
else window.addEventListener('hanna:assets-registry',e=>bindAssetRegistry(e.detail),{once:true});

const load=src=>new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.appendChild(script);
});
load('./v17-sala-a.js?v=1.9.0').then(()=>load('./v17-sala-b.js?v=1.9.0')).catch(e=>console.error('Sala da Hanna',e));

function install(){
 const B=window.BABYLON,scene=B?.EngineStore?.LastCreatedScene;
 const player=scene?.getTransformNodeByName?.('player');
 if(!scene||!player){setTimeout(install,180);return}
 if(scene.__hannaCameraInstalled)return;
 const camera=scene.activeCamera;
 if(!camera||!('radius' in camera))return;
 scene.__hannaCameraInstalled=true;

 // A v1.8 fixava a câmera em 4.7, muito perto para um cenário dividido em cômodos.
 // Mantemos enquadramento de terceira pessoa, mas recuperamos a leitura da casa.
 const radiusForViewport=()=>{
  const aspect=innerWidth/Math.max(innerHeight,1);
  if(aspect<1)return 7.4;
  if(aspect<1.5)return 6.85;
  return 6.35;
 };
 let radius=radiusForViewport();
 const target=new B.Vector3(player.position.x,player.position.y+1.18,player.position.z);
 function resize(){
  radius=radiusForViewport();
  camera.lowerRadiusLimit=radius;
  camera.upperRadiusLimit=radius;
  camera.radius=radius;
 }
 resize();addEventListener('resize',resize,{passive:true});
 // A câmera pode se mover sem travar nas paredes. A personagem mantém as colisões.
 camera.checkCollisions=false;
 camera.lowerBetaLimit=.88;camera.upperBetaLimit=1.15;
 camera.beta=Math.max(.92,Math.min(1.09,camera.beta));
 camera.fov=.76;

 // Restaurado da v1.5: transparência apenas na parede que bloqueia a Hanna.
 // Não alteramos o material compartilhado nem a colisão das paredes.
 const wallNames=/^(?:backWall|leftWall|rightWall|divider|dividerTop)$/;
 const occluded=new Map();
 let lastOcclusion=0;
 function updateOcclusion(){
  const from=camera.globalPosition||camera.position;
  const to=player.position.add(new B.Vector3(0,1.05,0));
  const direction=to.subtract(from),distance=direction.length();
  const hit=new Set();
  if(distance>.5){
   const ray=new B.Ray(from,direction.scale(1/distance),distance-.30);
   const picks=scene.multiPickWithRay(ray,m=>m.isEnabled()&&wallNames.test(m.name))||[];
   for(const pick of picks)if(pick.hit&&pick.pickedMesh)hit.add(pick.pickedMesh);
  }
  for(const [mesh,entry] of occluded){
   if(hit.has(mesh))continue;
   mesh.material=entry.original;
   entry.faded.dispose();
   occluded.delete(mesh);
  }
  for(const mesh of hit){
   if(occluded.has(mesh)||!mesh.material?.clone)continue;
   const original=mesh.material;
   const faded=original.clone(original.name+'_hannaOccluded');
   faded.alpha=.13;
   faded.backFaceCulling=false;
   mesh.material=faded;
   occluded.set(mesh,{original,faded});
  }
 }

 let guidesAdjusted=false;
 scene.onBeforeRenderObservable.add(()=>{
  target.x+=(player.position.x-target.x)*.12;
  target.y+=(player.position.y+1.18-target.y)*.12;
  target.z+=(player.position.z-target.z)*.12;
  camera.setTarget(target);
  camera.radius=radius;
  camera.fov+=(.76-camera.fov)*.14;
  camera.inertialRadiusOffset=0;

  if(!guidesAdjusted){
   const arrow=scene.getMeshByName('arrow'),ring=scene.getMeshByName('targetRing');
   if(arrow&&ring){
    arrow.scaling.scaleInPlace(.55);
    ring.scaling.scaleInPlace(.74);
    guidesAdjusted=true;
   }
  }
  const now=performance.now();
  if(now-lastOcclusion>=140){lastOcclusion=now;updateOcclusion()}
 });
 scene.onDisposeObservable.add(()=>{
  for(const [mesh,entry] of occluded){mesh.material=entry.original;entry.faded.dispose()}
  occluded.clear();
 });
 console.info('Casa da Hanna v1.9: câmera adaptativa e oclusão de paredes ativas');
}
install();
})();