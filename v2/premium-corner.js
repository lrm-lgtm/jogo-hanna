/* Casa da Hanna — R8 free art finish.
 * No external paid assets; local procedural decoration over verified Blender furniture.
 * All non-gameplay objects are non-pickable; no hitbox or navigation changes.
 */
(function(root){'use strict';
function polish({B,scene,shadow,M,graphics}){
 const c=s=>B.Color3.FromHexString(s);
 const mat=(n,color,r=.7,metal=0,alpha=1)=>{
  const m=new B.PBRMaterial('r8_'+n,scene);
  m.albedoColor=c(color);m.roughness=r;m.metallic=metal;m.alpha=alpha;
  return m;
 };
 const pink=mat('strawberryFridge','#eda7ad',.35),
       pinkTrim=mat('fridgeTrim','#dc899b',.46),
       warmWhite=mat('cotton','#fff2e3',.82),
       brass=mat('brass','#c99b61',.3,.47),
       petal=mat('pinkPetal','#f49ca8',.77),
       coral=mat('coral','#d97577',.75),
       gold=mat('sunGold','#dfb867',.56),
       sage=mat('sage','#85a48d',.85),
       green=mat('leaf','#609470',.87),
       brown=mat('softBrown','#b77b57',.7),
       linen=mat('curtain','#fff7e9',.95,0,.95);
 const meshBox=(id,x,y,z,w,h,d,m,parent)=>{
  const o=B.MeshBuilder.CreateBox('r8_'+id,{width:w,height:h,depth:d},scene);
  o.position.set(x,y,z);o.material=m;o.isPickable=false;
  if(parent)o.parent=parent;else o.receiveShadows=true;
  return o;
 };
 const ell=(id,x,y,z,a,b,d,m,parent)=>{
  const o=B.MeshBuilder.CreateSphere('r8_'+id,{diameter:1,segments:18},scene);
  o.position.set(x,y,z);o.scaling.set(a,b,d);o.material=m;o.isPickable=false;
  if(parent)o.parent=parent;return o;
 };
 const line=(id,pts,r,m,parent)=>{
  const o=B.MeshBuilder.CreateTube('r8_'+id,{path:pts.map(p=>new B.Vector3(...p)),radius:r,tessellation:9},scene);
  o.material=m;o.isPickable=false;
  if(parent)o.parent=parent;return o;
 };
 const fridgeMeshes=scene.meshes.filter(m=>m.name.includes('B2_fridge_'));
 for(const o of fridgeMeshes){
  if(/_enclosure$/.test(o.name))o.material=pink;
  else if(/_side$|_top$/.test(o.name))o.material=pinkTrim;
 }
 for(const id of ['fridgeSwingDoor']){const mesh=scene.getMeshByName(id);if(mesh)mesh.material=pink;}
 const doorInset=scene.getMeshByName('fridgeDoorInset');if(doorInset)doorInset.material=pinkTrim;
 const hinge=scene.getTransformNodeByName('fridgeDoorHinge');
 if(hinge){
  // Large flat magnets are baked into the actual swinging door (not stuck in world space).
  meshBox('fridgePicture',.42,.46,-.158,.28,.31,.014,warmWhite,hinge);
  ell('fridgeRainbow',.38,.50,-.171,.087,.045,.012,petal,hinge);
  ell('fridgeRainCloud',.44,.42,-.172,.087,.025,.013,gold,hinge);
  ell('fridgeHeartA',.75,-.24,-.16,.064,.061,.018,coral,hinge);
  ell('fridgeHeartB',.80,-.23,-.16,.058,.06,.018,coral,hinge);
  const point=meshBox('fridgeHeartPoint',.776,-.279,-.16,.072,.072,.015,coral,hinge);
  point.rotation.z=Math.PI/4;
  ell('fridgeFlowerCenter',.27,-.41,-.166,.039,.039,.012,gold,hinge);
  for(let i=0;i<5;i++){
   const t=i*Math.PI*2/5;
   ell('fridgeFlowerPetal'+i,.27+Math.cos(t)*.067,-.41+Math.sin(t)*.067,-.161,.050,.042,.011,warmWhite,hinge);
  }
 }
 // Soft cloth around the architectural window, with hems and a scalloped valance.
 // Window center x=-0.87, back wall z=2.827, height 1.845..2.97.
 for(const side of [-1,1]){
  const x=-.87+side*.73;
  const curtain=meshBox('curtainPanel'+side,x,2.40,2.68,.25,1.07,.05,linen);
  curtain.rotation.z=side*.046;
  for(let i=0;i<4;i++){
   meshBox('curtainFold'+side+'_'+i,x-.083+i*.056,2.4,2.63,.013,1.01,.028,warmWhite);
  }
  ell('curtainTie'+side,x,2.23,2.585,.132,.030,.042,petal);
 }
 meshBox('curtainRod',-.87,2.99,2.51,2.04,.035,.055,brass);
 for(let i=0;i<7;i++)ell('curtainScallop'+i,-1.60+i*.24,2.885,2.56,.16,.08,.04,linen);
 // Sill herbs, tiny ceramic flowerpots with stems and leaf clusters.
 for(let i=0;i<3;i++){
  const x=-1.45+i*.54,z=2.54;
  meshBox('windowPot'+i,x,1.94,z,.20,.19,.19,i%2?petal:warmWhite);
  line('windowStem'+i,[[x,2.04,z],[x,2.24,z]],.016,green);
  for(let j=0;j<4;j++){
   const a=j*1.65;
   ell('sillLeaf'+i+'_'+j,x+Math.cos(a)*.065,2.18+Math.sin(a)*.046,z+Math.sin(a)*.065,
       .07,.048,.048,j%2?green:sage);
  }
 }
 // Breakfast nook vignette: mugs, little cloth, ceramic vase and groceries.
 const breakfastBowl=ell('fruitBowl',.86,1.09,1.94,.18,.055,.18,warmWhite);
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5;
  ell('fruit'+i,.86+.11*Math.cos(a),1.15,1.94+.11*Math.sin(a),.075,.073,.077,i%3?petal:gold);
 }
 for(const [id,x,z] of [['mug',.70,-.51],['pot',1.0,-.92]]){
  ell('tableCup'+id,x,1.10,z,.091,.11,.09,warmWhite);
  const handle=B.MeshBuilder.CreateTorus('r8_mugHandle'+id,{diameter:.12,thickness:.018,tessellation:16},scene);
  handle.position.set(x+.09,1.15,z);handle.rotation.y=Math.PI/2;handle.material=brass;handle.isPickable=false;
 }
 // Sunlight must arrive from the visible exterior window, not from below the scene.
 const sunlight=scene.getLightByName('warmWindowLight');
 if(sunlight){
  sunlight.direction=new B.Vector3(-.45,-1,-.60).normalize();
  sunlight.diffuse=c('#ffe4b8');sunlight.intensity=1.45;
 }
 const fill=scene.getLightByName('warmFill');
 if(fill){fill.intensity=.35;fill.diffuse=c('#ffe1d1')}
 const sky=scene.getLightByName('softSky');if(sky){sky.intensity=.84;sky.groundColor=c('#b8938d')}
 if(scene.imageProcessingConfiguration){
  scene.imageProcessingConfiguration.exposure=1.06;
  scene.imageProcessingConfiguration.contrast=1.24;
 }
 return Object.freeze({version:'r8',fridgeParts:fridgeMeshes.length,decor:'fridge-magnets+curtains+herbs+breakfast'});
}
root.HannaFreeCorner=Object.freeze({polish});
})(typeof window!=='undefined'?window:globalThis);
