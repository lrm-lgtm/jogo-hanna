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