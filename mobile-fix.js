(()=>{
  'use strict';
  const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
  if(!mobile||!window.BABYLON)return;

  // Babylon ArcRotateCamera interpreta gestos de toque como zoom/pinch.
  // No celular, o toque deve pertencer somente ao joystick e ao botão USAR.
  const proto=BABYLON.ArcRotateCamera&&BABYLON.ArcRotateCamera.prototype;
  if(proto&&!proto.__hannaTouchFixed){
    const originalAttach=proto.attachControl;
    proto.attachControl=function(...args){
      try{
        this.detachControl?.();
        this.inputs?.clear?.();
        const radius=this.radius,beta=this.beta,alpha=this.alpha;
        this.lowerRadiusLimit=radius;this.upperRadiusLimit=radius;
        this.lowerBetaLimit=beta;this.upperBetaLimit=beta;
        this.lowerAlphaLimit=alpha;this.upperAlphaLimit=alpha;
        this.panningSensibility=0;
        this.inertialRadiusOffset=0;
        this.inertialAlphaOffset=0;
        this.inertialBetaOffset=0;
      }catch(e){console.warn('mobile camera lock fallback',e)}
      return this;
    };
    proto.__hannaTouchFixed=true;
    proto.__hannaOriginalAttach=originalAttach;
  }

  const stopGesture=e=>e.preventDefault();
  ['gesturestart','gesturechange','gestureend'].forEach(type=>{
    document.addEventListener(type,stopGesture,{passive:false,capture:true});
  });
  document.addEventListener('touchmove',e=>{
    if(e.touches&&e.touches.length>1)e.preventDefault();
  },{passive:false,capture:true});
  document.addEventListener('dblclick',e=>{
    if(e.target?.closest?.('#game,#joystick,#useBtn'))e.preventDefault();
  },{passive:false,capture:true});

  const lockTargets=()=>{
    ['game','joystick','stick','useBtn'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.style.touchAction='none';
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lockTargets,{once:true});
  else lockTargets();

  console.info('Casa da Hanna: iPhone touch/camera fix ativo');
})();