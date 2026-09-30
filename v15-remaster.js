(()=>{
'use strict';
document.body.classList.add('v15-remaster');
const q=s=>document.querySelector(s),near=q('#near'),instruction=q('#instruction'),held=q('#held'),use=q('#useBtn');
function actionFor(){
 const t=((near?.textContent||'')+' '+(instruction?.textContent||'')+' '+(held?.textContent||'')).toLowerCase();
 const i=(instruction?.textContent||'').toLowerCase();
 if(/cachorro|beb[eê]/.test(t)&&/carinho|acarici/.test(t))return ['🤍','CARINHO'];
 if(/pegue|apanhe/.test(i))return ['✋','PEGAR'];
 if(/coloque|guarde|deixe/.test(i))return ['↓','COLOCAR'];
 if(/geladeira|porta|ba[uú]/.test(t))return ['↔','ABRIR'];
 if(/torneira/.test(t)&&/feche|deslig/.test(i))return ['💧','FECHAR'];
 if(/torneira/.test(t))return ['💧','LIGAR'];
 if(/regar|flores|planta/.test(t))return ['💦','REGAR'];
 if(/lavar|banho/.test(t))return ['🫧','LAVAR'];
 if(/comer|ração|racao/.test(t))return ['🍽️','DAR'];
 return ['✋','USAR'];
}
function refresh(){if(!use)return;const [ic,tx]=actionFor();if(use.dataset.v15Label===tx)return;use.dataset.v15Label=tx;use.innerHTML='<span class="actionIcon">'+ic+'</span><span class="actionText">'+tx+'</span>'}
[near,instruction,held].forEach(el=>{if(el)new MutationObserver(refresh).observe(el,{subtree:true,childList:true,characterData:true,attributes:true})});refresh();
function wait(){
 const scene=window.BABYLON?.EngineStore?.LastCreatedScene;if(!scene){setTimeout(wait,250);return}
 ['motionBadge','qualityBadge','netBadge','help'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
}
wait();
})();