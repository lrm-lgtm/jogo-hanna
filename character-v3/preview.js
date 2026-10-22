(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('render'),note=$('note'),B=window.BABYLON;
if(!B){note.textContent='Não consegui carregar Babylon.js. Verifique a conexão.';return}
const engine=new B.Engine(canvas,true,{adaptToDeviceRatio:true});
engine.setHardwareScalingLevel(Math.max(1,(window.devicePixelRatio||1)/1.75));
const scene=new B.Scene(engine);
scene.clearColor=B.Color4.FromHexString('#efe5deff');
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure=1.16;
const cam=new B.ArcRotateCamera('characterOrbit',Math.PI/2,1.33,4.15,new B.Vector3(0,1.03,0),scene);
cam.attachControl(canvas,true);
cam.lowerRadiusLimit=2.75;cam.upperRadiusLimit=6.9;
cam.lowerBetaLimit=.55;cam.upperBetaLimit=2.00;
cam.panningSensibility=0;cam.wheelPrecision=38;
const sky=new B.HemisphericLight('sky',new B.Vector3(0,1,0),scene);
sky.intensity=1.16;sky.groundColor=B.Color3.FromHexString('#c8a49d');
const fill=new B.DirectionalLight('softKey',new B.Vector3(-.6,-1,-.4),scene);
fill.intensity=1.65;fill.diffuse=B.Color3.FromHexString('#ffeadf');fill.position.set(2.4,6,4);
const rim=new B.DirectionalLight('warmRim',new B.Vector3(.4,-.3,.7),scene);
rim.intensity=.56;rim.diffuse=B.Color3.FromHexString('#ffd4bd');
const ground=B.MeshBuilder.CreateCylinder('studioPodium',{diameter:2.4,height:.14,tessellation:72},scene);
ground.position.y=-.11;
const mat=new B.PBRMaterial('porcelainPodium',scene);mat.albedoColor=B.Color3.FromHexString('#e7b7ba');mat.roughness=.83;ground.material=mat;
const ring=B.MeshBuilder.CreateTorus('goldPodiumRim',{diameter:2.43,thickness:.027,tessellation:72},scene);
ring.position.y=-.035;ring.material=mat;ring.isPickable=false;
const shadows=new B.ShadowGenerator(1024,fill);shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=20;
ground.receiveShadows=true;
let loaded=false,walking=false,turning=false,head=null,leftArm=null,rightArm=null,leftLeg=null,rightLeg=null,modelRoot=null;
const q={status:'loading',meshCount:0,files:['hanna-v3.glb'],errors:[]};
Object.defineProperty(window,'__hannaArtQA',{get:()=>Object.freeze({...q,walking,turning})});
function find(name){return scene.transformNodes.find(x=>x.name===name||x.name.endsWith('__'+name))||null}
function pose(t){
 if(!loaded)return;
 const speed=walking?7.8:2.6;
 if(head){head.rotation.z=Math.sin(t*2)*.014;head.rotation.x=Math.sin(t*2.2)*.018}
 if(leftArm)leftArm.rotation.x=walking?Math.sin(t*speed)*.35:.055+Math.sin(t*1.8)*.025;
 if(rightArm)rightArm.rotation.x=walking?-Math.sin(t*speed)*.35:.055-Math.sin(t*1.8)*.025;
 if(leftLeg)leftLeg.rotation.x=walking?-Math.sin(t*speed)*.27:0;
 if(rightLeg)rightLeg.rotation.x=walking?Math.sin(t*speed)*.27:0;
 if(modelRoot){
  modelRoot.position.y=walking?.018*Math.sin(t*speed*2):.007*Math.sin(t*2);
  if(turning)modelRoot.rotation.y+=engine.getDeltaTime()*.00035;
 }
}
$('front').onclick=()=>{cam.alpha=Math.PI/2;cam.beta=1.33;cam.radius=4.15;if(modelRoot)modelRoot.rotation.y=0;turning=false;$('turn').classList.remove('active')};
$('turn').onclick=()=>{turning=!turning;$('turn').classList.toggle('active',turning)};
$('walk').onclick=()=>{walking=!walking;$('walk').classList.toggle('active',walking);$('walk').textContent=walking?'⏸ Parar':'🚶 Caminhar'};
window.addEventListener('resize',()=>engine.resize());
engine.runRenderLoop(()=>{pose(performance.now()/1000);scene.render()});
(async()=>{
 try{
 const result=await B.SceneLoader.ImportMeshAsync('','./build/','hanna-v3.glb',scene);
 q.meshCount=result.meshes.filter(m=>m.getTotalVertices?.()>0).length;
 if(q.meshCount<45)throw Error('Modelo incompleto: somente '+q.meshCount+' malhas');
 modelRoot=find('HannaRig');
 head=find('HeadPivot');leftArm=find('ArmLeftPivot');rightArm=find('ArmRightPivot');leftLeg=find('LegLeftPivot');rightLeg=find('LegRightPivot');
 if(!modelRoot||!head||!leftArm||!rightArm||!leftLeg||!rightLeg)throw Error('Pivôs de animação faltando: '+['HannaRig','HeadPivot','ArmLeftPivot','ArmRightPivot','LegLeftPivot','LegRightPivot'].filter(name=>!find(name)).join(', '));
 for(const mesh of result.meshes){if(mesh.getTotalVertices?.()>0)shadows.addShadowCaster(mesh)}
 loaded=true;q.status='ready';
 note.textContent='✨ Modelo GLB verdadeiro carregado · Gire com o dedo ou mouse';
 }catch(e){console.error(e);q.status='error';q.errors=[String(e.message)];note.textContent='⚠️ Erro no modelo 3D: '+e.message}
})();
})();