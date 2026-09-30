(()=>{
'use strict';
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
load('./v17-sala-a.js?v=1.7.4').then(()=>load('./v17-sala-b.js?v=1.7.4')).catch(e=>console.error('v1.7 sala',e));

function install(){
 const B=window.BABYLON,scene=B?.EngineStore?.LastCreatedScene;
 const player=scene?.getTransformNodeByName?.('player');
 const hand=scene?.getTransformNodeByName?.('v13HandAnchor');
 if(!scene||!player||!hand){setTimeout(install,180);return}
 if(scene.__hannaCameraInstalled)return;
 scene.__hannaCameraInstalled=true;
 const camera=scene.activeCamera;
 if(!camera||!('radius' in camera))return;
 let radius=4.7;
 const target=new B.Vector3(player.position.x,player.position.y+1.30,player.position.z);
 function resize(){
  radius=4.7;
  camera.lowerRadiusLimit=radius;camera.upperRadiusLimit=radius;
 }
 resize();addEventListener('resize',resize,{passive:true});
 camera.lowerBetaLimit=.83;camera.upperBetaLimit=1.12;
 camera.beta=Math.max(.90,Math.min(1.04,camera.beta));
 camera.fov=.76;
 scene.onBeforeRenderObservable.add(()=>{
  target.x+=(player.position.x-target.x)*.13;
  target.y+=(player.position.y+1.30-target.y)*.13;
  target.z+=(player.position.z-target.z)*.13;
  camera.setTarget(target);
  camera.radius=radius;
  camera.fov+=(.76-camera.fov)*.16;
  camera.inertialRadiusOffset=0;
 });
 console.info('Casa da Hanna: câmera e props sem passes duplicados');
}
install();
})();
