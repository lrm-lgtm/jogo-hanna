/* UI infantil: pausa/configurações e progressão sem interferir na v1.9. */
(function(){
'use strict';
const get=id=>document.getElementById(id);
const menu=get('settings'),pause=get('pauseBtn'),resume=get('resumeBtn'),quality=get('qualitySelect'),sound=get('soundToggle');
quality.value=window.HannaV2Quality.load(localStorage);
sound.checked=localStorage.getItem('hanna_kitchen_v2_audio')!=='off';
function setPause(value){
 menu.hidden=!value;pause.setAttribute('aria-pressed',String(value));
 document.dispatchEvent(new CustomEvent('hanna:v2:pause',{detail:{paused:value}}));
 if(value&&'speechSynthesis'in window)window.speechSynthesis.cancel();
}
pause.addEventListener('click',()=>setPause(menu.hidden));
resume.addEventListener('click',()=>setPause(false));
quality.addEventListener('change',()=>{window.HannaV2Quality.save(localStorage,quality.value);location.reload()});
sound.addEventListener('change',()=>{localStorage.setItem('hanna_kitchen_v2_audio',sound.checked?'on':'off');window.HannaV2Audio?.setEnabled(sound.checked)});
window.addEventListener('keydown',e=>{if(e.code==='Escape'){setPause(menu.hidden);e.preventDefault()}});
get('guideBtn').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('hanna:v2:hint')));
document.addEventListener('hanna:v2:ready',()=>{window.HannaV2Audio?.setEnabled(sound.checked)});
if('serviceWorker'in navigator&&location.protocol==='https:'){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('Preview sem SW:',e)));
}
})();