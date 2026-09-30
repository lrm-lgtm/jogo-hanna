(()=>{
'use strict';
document.body.classList.add('v16-cinematic');
const instruction=document.getElementById('instruction'),use=document.getElementById('useBtn');
function waiting(){
 const t=(instruction?.textContent||'').toLowerCase(),w=/espere|aguarde|deixe .* comer|dormir por alguns/.test(t);
 document.body.classList.toggle('v16-waiting',w);
 if(w&&use){use.innerHTML='<span class="actionIcon">⏳</span><span class="actionText">AGUARDE</span>';use.dataset.v15Label='AGUARDE'}
}
if(instruction)new MutationObserver(()=>queueMicrotask(waiting)).observe(instruction,{subtree:true,childList:true,characterData:true});
waiting();
// Ajustes de modelos importados agora são acionados pelo carregamento real do core.
// Nenhum polling/setInterval de posição é usado aqui.
function bindAssetRegistry(registry){
 registry?.onReady?.(record=>{
  const f=(record?.file||'').toLowerCase();
  if(f)record.wrapper.metadata={...(record.wrapper.metadata||{}),assetFile:f,adjustedOnReady:true};
 });
}
if(window.HannaAssets)bindAssetRegistry(window.HannaAssets);
else window.addEventListener('hanna:assets-registry',e=>bindAssetRegistry(e.detail),{once:true});
})();;(()=>{const load=(src)=>new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=fail;document.body.appendChild(s)});load('./v17-sala-a.js?v=1.7.0-sala').then(()=>load('./v17-sala-b.js?v=1.7.0-sala')).catch(e=>console.error('v1.7 sala',e));})();
// Enquadramento de terceira pessoa: Hanna é o foco, não a planta da casa.
(()=>{'use strict';function wait(){const B=window.BABYLON,scene=B?.EngineStore?.LastCreatedScene,player=scene?.getTransformNodeByName?.('player');if(!B||!scene||!player){setTimeout(wait,180);return}if(scene.__hannaV17ThirdPerson)return;scene.__hannaV17ThirdPerson=true;const camera=scene.activeCamera;if(!camera||!('radius'in camera))return;let radius=innerHeight>innerWidth?5.15:5.65;const target=new B.Vector3(player.position.x,player.position.y+1.28,player.position.z);camera.lowerRadiusLimit=radius;camera.upperRadiusLimit=radius;camera.radius=radius;camera.lowerBetaLimit=.78;camera.upperBetaLimit=1.08;camera.fov=.78;if(Number.isFinite(camera.beta))camera.beta=Math.max(.86,Math.min(1,camera.beta));const resize=()=>{radius=innerHeight>innerWidth?5.15:5.65;camera.lowerRadiusLimit=radius;camera.upperRadiusLimit=radius};addEventListener('resize',resize,{passive:true});scene.onBeforeRenderObservable.add(()=>{target.x+=(player.position.x-target.x)*.10;target.y+=(player.position.y+1.28-target.y)*.10;target.z+=(player.position.z-target.z)*.10;camera.setTarget(target);camera.radius=radius;camera.fov+=(.78-camera.fov)*.16;camera.inertialRadiusOffset=0});console.info('Casa da Hanna v1.7: enquadramento de terceira pessoa ativo')}wait()})();
