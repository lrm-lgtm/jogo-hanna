/* Som sintético e voz PT-BR local (SpeechSynthesis). */
(function(){
'use strict';
let enabled=true,ctx=null;
function beep(frequency=660,duration=.13){
 if(!enabled)return;
 try{
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  ctx=ctx||new A();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const osc=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(frequency,at);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.075,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.02);
 }catch(_e){}
}
function speak(text){
 if(!enabled||!('speechSynthesis'in window))return false;
 try{
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='pt-BR';u.rate=.89;u.pitch=1.14;u.volume=.8;
  const v=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('pt-br'));
  if(v)u.voice=v;
  window.speechSynthesis.speak(u);return true;
 }catch(_e){return false}
}
window.HannaV2Audio=Object.freeze({beep,speak,enabled:()=>enabled,setEnabled:v=>{enabled=!!v;if(!enabled&&window.speechSynthesis)window.speechSynthesis.cancel()}});
})();