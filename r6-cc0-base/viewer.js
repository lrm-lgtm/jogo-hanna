(()=>{'use strict';
const B=window.BABYLON,el=document.getElementById('render'),status=document.getElementById('status');
if(!B){status.textContent='Babylon indisponível';return}
const engine=new B.Engine(el,true,{adaptToDeviceRatio:true});
engine.setHardwareScalingLevel(Math.max(1,(window.devicePixelRatio||1)/1.5));
const scene=new B.Scene(engine);scene.clearColor=B.Color4.FromHexString('#edddd6ff');
const cam=new B.ArcRotateCamera('camera',Math.PI/2,1.28,3.9,new B.Vector3(0,1,0),scene);
cam.attachControl(el,true);cam.lowerRadiusLimit=2.0;cam.upperRadiusLimit=7;cam.panningSensibility=0;
const hemi=new B.HemisphericLight('ambient',new B.Vector3(0,1,0),scene);hemi.intensity=1.25;
const key=new B.DirectionalLight('key',new B.Vector3(-.5,-1,.6),scene);key.intensity=1.10;
const platform=B.MeshBuilder.CreateCylinder('base',{diameter:2.5,height:.13,tessellation:48},scene);platform.position.y=-.08;
const mat=new B.StandardMaterial('cream',scene);mat.diffuseColor=B.Color3.FromHexString('#ecbbc1');platform.material=mat;
const kind=new URLSearchParams(location.search).get('candidate');
const candidate=kind==='r13'?'hanna-r13.glb':kind==='r12'?'hanna-r12.glb':kind==='r11'?'hanna-r11.glb':kind==='r10'?'hanna-r10.glb':kind==='r9'?'hanna-r9.glb':kind==='r8'?'hanna-r8.glb':kind==='r7'?'hanna-r7.glb':'HairSample_Female.glb';
const asset=new B.TransformNode('candidateCC0',scene);asset.rotation.y=Math.PI; // VRM sample uses opposite forward basis in Babylon's orbit view.
let ready=false,spinning=false,meshes=0,bones=0,error='',animationGroups=0;
window.__hannaR6QA=()=>({ready,spinning,meshes,bones,error,candidate,animationGroups});
document.getElementById('rotate').onclick=()=>spinning=!spinning;
document.getElementById('front').onclick=()=>{spinning=false;asset.rotation.y=Math.PI;cam.alpha=Math.PI/2};
engine.runRenderLoop(()=>{if(spinning)asset.rotation.y+=engine.getDeltaTime()/1000*.4;scene.render()});
window.addEventListener('resize',()=>engine.resize());
(async()=>{
 try{
 const r=await B.SceneLoader.ImportMeshAsync('','./assets/',candidate,scene);
 meshes=r.meshes.filter(m=>m.getTotalVertices?.()>0).length;
 bones=r.skeletons.reduce((n,s)=>n+s.bones.length,0);
 if(meshes<5)throw Error('Modelo sem malhas suficientes: '+meshes);
 animationGroups=r.animationGroups?.length||0;
 if((kind==='r9'||kind==='r10'||kind==='r11'||kind==='r12'||kind==='r13')&&animationGroups<1)throw Error('Animação de braços abaixados R9 não exportada');
 if(kind==='r9'||kind==='r10'||kind==='r11'||kind==='r12'||kind==='r13')for(const group of r.animationGroups)group.start(true);
 const roots=[...r.meshes,...r.transformNodes].filter(n=>!n.parent&&n!==asset);
 const lower=new B.Vector3(Infinity,Infinity,Infinity),upper=new B.Vector3(-Infinity,-Infinity,-Infinity);
 for(const mesh of r.meshes.filter(m=>m.getTotalVertices?.()>0)){
  mesh.computeWorldMatrix(true);
  const box=mesh.getBoundingInfo().boundingBox;
  lower.minimizeInPlace(box.minimumWorld);upper.maximizeInPlace(box.maximumWorld);
 }
 const size=upper.subtract(lower),height=Math.max(size.y,.1);
 const scale=1.85/height;asset.scaling.setAll(scale);
 for(const root of roots)root.parent=asset;
 const center=lower.add(upper).scale(.5);
 asset.position.set(-center.x*scale,-lower.y*scale,-center.z*scale);
 ready=true;status.textContent='GLB rigado real carregado · '+meshes+' malhas · '+bones+' ossos';
 }catch(e){error=e.message||String(e);status.textContent='Falha: '+error;console.error(e)}
})();
})();