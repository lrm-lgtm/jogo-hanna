/* Casa da Hanna v2 — direction-of-art pass R1.
 * Procedural architectural blocking (designed to export to glTF from Blender).
 * Replaces visually inconsistent kit pieces while preserving invisible targets,
 * walkability and every gameplay interaction.
 */
(function(root){
'use strict';
function rebuild({B,scene,M,box,sphere,cylinder,visuals,shadow,graphics}){
 const c=hex=>B.Color3.FromHexString(hex);
 function pbr(id,color,rough=.78,metal=0){
   const m=new B.PBRMaterial('art_'+id,scene);
   m.albedoColor=c(color);m.roughness=rough;m.metallic=metal;
   return m;
 }
 const P={
  wall:pbr('buttercream','#ebd2bf',.95),
  panel:pbr('blushPanel','#d8ad9f',.95),
  ivory:pbr('warmIvory','#fff5e9',.84),
  porcelain:pbr('porcelain','#f5e9d9',.27),
  sage:pbr('sageCabinets','#78968b',.79),
  sageLight:pbr('sageCabinetsLight','#b8cfb3',.72),
  sageDark:pbr('sageShadow','#58786c',.8),
  oak:pbr('oakHoney','#ab7459',.71),
  oakLight:pbr('oatOak','#d8b38a',.73),
  oakDark:pbr('darkWood','#7b5541',.79),
  tile:pbr('backsplash','#f8eee4',.45),
  tileLine:pbr('grout','#e4d4c9',.95),
  glass:pbr('windowGlass','#85c0c1',.13,.05),
  exterior:pbr('landscapeSky','#89cadc',.88),
  leaves:pbr('eucalyptus','#598c64',.96),
  leaves2:pbr('olive','#82a67b',.95),
  coral:pbr('coral','#dc957e',.73),
  rose:pbr('rose','#d79191',.74),
  gold:pbr('brushedBrass','#d1a26e',.27,.55),
  charcoal:pbr('hobs','#494c4a',.31,.14),
  black:pbr('shadows','#777770',1),
  white:pbr('ceramicWhite','#fdfbf5',.26),
  blue:pbr('blue','#95bdd1',.73),
  textile:pbr('seatCushion','#ddad9c',.98)
 };
 function tile(id,x,y,z,w,h,d,material){const m=box(id,[x,y,z],[w,h,d],material);m.receiveShadows=true;return m}
 function tube(id,path,r,material){const m=B.MeshBuilder.CreateTube(id,{path:path.map(p=>new B.Vector3(...p)),radius:r,tessellation:10,cap:B.Mesh.CAP_ALL},scene);m.material=material;m.isPickable=false;return m}
 function ellipsoid(id,x,y,z,sx,sy,sz,material){const m=sphere(id,[x,y,z],1,material);m.scaling.set(sx,sy,sz);return m}
 function sideDoor(x,y,z,w,h,mat,accent){
  tile('cabinetFace',x,y,z,w,h,.045,mat);
  tile('cabinetInset',x,y,z-.029,w-.065,h-.07,.014,accent);
  const handle=cylinder('cabinetGoldPull',[x+.24*w,y+.2*h,z-.06],.025,.115,P.gold,14);
  handle.rotation.z=Math.PI/2;
 }
 // Remove original discontinuous decorative pieces but keep interaction hitboxes.
 const hide=['windowFrame','windowGlass','windowCrossbar','windowMullion',
  'backCounterPlinth','rugBase','rugInset'];
 hide.forEach(name=>scene.getMeshByName(name)?.setEnabled(false));
 // Make the room a complete, welcoming set rather than a gray void.
 scene.clearColor=B.Color4.FromHexString('#f0ddcbff');
 scene.imageProcessingConfiguration.exposure=.89;
 scene.imageProcessingConfiguration.contrast=1.33;
 scene.ambientColor=c('#695a52');
 const floor=scene.getMeshByName('walkableKitchenFloor');
 if(floor){
  floor.material=P.oakLight;
  floor.scaling.set(1.85,1,2.55);
  floor.position.z=-2.7; // Hide the former dollhouse platform edge beyond the camera.
 }
 tile('extendedBackWall',0,1.75,3.19,14,3.50,.19,P.wall);
 const back=scene.getMeshByName('backWall');if(back)back.material=P.wall;
 const left=scene.getMeshByName('leftWall');if(left)left.material=P.wall;
 scene.getMeshByName('backWainscot')?.setEnabled(false);
 scene.getMeshByName('leftWainscot')?.setEnabled(false);
 // Narrow floorboard seams retain physical scale with low visual noise.
 for(let i=0;i<48;i++){
   const z=-10.42+i*.30;
   const board=tile('oakFloorBoard'+i,0,.016,z,13.85,.018,.284,i%5===0?P.oakLight:i%3===0?P.oatOak:P.oakLight);
   board.receiveShadows=true;
   if(i<47)tile('plankSeam'+i,0,.026,z+.142,13.85,.004,.004,P.oak);
 }
 // Thin woven oval carpet anchors the breakfast table without obscuring movement.
 const carpet=B.MeshBuilder.CreateDisc('pastelDiningCarpet',{radius:1,tessellation:52,sideOrientation:B.Mesh.DOUBLESIDE},scene);
 carpet.rotation.x=Math.PI/2;carpet.position.set(-.07,.033,-.72);carpet.scaling.set(1.66,.99,1);carpet.material=P.sageLight;carpet.isPickable=false;
 const carpetInset=B.MeshBuilder.CreateDisc('pastelDiningCarpetInset',{radius:1,tessellation:52,sideOrientation:B.Mesh.DOUBLESIDE},scene);
 carpetInset.rotation.x=Math.PI/2;carpetInset.position.set(-.07,.034,-.72);carpetInset.scaling.set(1.52,.88,1);carpetInset.material=P.textile;carpetInset.isPickable=false;
 tile('leftBaseboardNew',-3.885,.14,1.36,.08,.27,3.22,P.ivory);
 tile('backBaseboardNew',0,.14,2.88,7.9,.28,.07,P.ivory);
 tile('accentWallLower',0,.51,2.855,7.75,.94,.028,P.panel);
 tile('accentChairRail',0,1.00,2.824,7.78,.055,.065,P.ivory);
 // Central backsplash: tile pattern is an actual shallow surface, not a floating texture.
 tile('backsplashSurface',.37,1.52,2.87,5.55,1.03,.03,P.tile);
 for(let i=0;i<21;i++){
   const x=-2.36+i*.265;
   tile('tileGroutV'+i,x,1.52,2.844,.007,1.02,.007,P.tileLine);
 }
 for(let i=0;i<6;i++){
   const y=1.04+i*.188;
   tile('tileGroutH'+i,.37,y,2.842,5.54,.007,.007,P.tileLine);
 }
 // Fridge — clean, properly joined door and rounded ornament details.
 tile('fridgeBody',-2.96,1.15,2.04,1.25,2.3,.92,P.ivory);
 tile('fridgeSide',-2.31,1.15,2.06,.045,2.25,.9,P.sageLight);
 tile('fridgeTop',-2.95,2.315,2.04,1.27,.05,.98,P.sage);
 const door=scene.getMeshByName('fridgeSwingDoor');
 const inset=scene.getMeshByName('fridgeDoorInset');
 if(door)door.material=P.ivory;
 if(inset)inset.material=P.sageLight;
 const handle=scene.getMeshByName('fridgeDoorHandle');if(handle)handle.material=P.gold;
 tile('fridgeToeKick',-2.95,.09,1.93,1.25,.16,.92,P.sageDark);
 // L-shaped shelf niche behind fridge completes the composition.
 tile('fridgeSideCabinet',-3.68,.89,2.53,.38,1.76,.53,P.sage);
 tile('fridgeSideCabinetFront',-3.67,.92,2.23,.34,1.68,.027,P.sageLight);
 // One coherent cabinetry run, level counter and consistent gold hardware.
 const cabinetStart=-2.27,cabinetEnd=3.51;
 tile('counterBase',.62,.50,2.13,cabinetEnd-cabinetStart,.96,.78,P.sage);
 tile('oakCounterEdge',.62,1.017,2.08,5.86,.105,.99,P.oak);
 tile('stoneCounterTop',.62,1.085,2.08,5.88,.045,1.03,P.porcelain);
 tile('counterShadow',.62,.083,1.85,5.81,.16,.67,P.sageDark);
 for(let i=0;i<6;i++){
   const x=-1.86+i*.94;
   sideDoor(x,.55,1.72,.84,.77,i%2?P.sageLight:P.sage,P.sageLight);
 }
 tile('cabinetEndSide',3.51,.55,2.10,.065,.88,.72,P.sageDark);
 // Basin and backsplash window, in the same work zone.
 tile('sinkRim',-.98,1.114,1.98,.97,.021,.58,P.gold);
 tile('sinkInterior',-.98,1.136,1.98,.85,.027,.46,P.charcoal);
 tile('sinkInnerWhite',-.98,1.146,1.98,.67,.022,.33,P.white);
 tube('brassFaucet',[[-1.38,1.15,2.31],[-1.38,1.46,2.31],[-1.28,1.57,2.29],[-1.04,1.57,2.28],[-1.01,1.42,2.27]],.026,P.gold);
 tile('faucetHandle',-1.52,1.17,2.29,.11,.055,.065,P.gold);
 // Large natural-light window with muntins + visible exterior greenery.
 const wx=-.87;
 tile('windowFrameOut',wx,2.39,2.827,1.66,1.09,.085,P.oakLight);
 tile('windowSky',wx,2.39,2.773,1.45,.91,.023,P.exterior);
 ellipsoid('windowHills',wx-.34,2.17,2.743,.67,.31,.03,P.leaves2);
 ellipsoid('windowHills2',wx+.51,2.12,2.735,.73,.36,.025,P.leaves);
 tile('windowBottomTrim',wx,1.845,2.694,1.83,.095,.21,P.ivory);
 tile('windowMullionCentral',wx,2.39,2.705,.058,.97,.065,P.ivory);
 tile('windowMullionH',wx,2.38,2.7,1.49,.046,.07,P.ivory);
 tile('windowTopTrim',wx,2.97,2.71,1.76,.07,.13,P.ivory);
 // Coordinated upper cupboards only where no window.
 for(const x of [1.11,2.14,3.17]){
   tile('upperCabinetFrame',x,2.53,2.72,.93,.83,.38,P.sage);
   tile('upperCabinetDoor',x,2.53,2.475,.86,.73,.065,P.sageLight);
   tile('upperInset',x,2.53,2.434,.74,.61,.012,P.ivory);
   const knob=sphere('upperCabinetKnob',[x+.3,2.33,2.393],.064,P.gold);
 }
 tile('cabinetUpperTrim',2.14,2.98,2.55,3.02,.08,.47,P.oakLight);
 // Stove, burners, small oven face — one uninterrupted surface.
 tile('hobBase',2.39,1.126,1.94,1.05,.035,.66,P.charcoal);
 for(const [x,z] of [[2.13,1.76],[2.67,1.76],[2.13,2.13],[2.67,2.13]]){
   const ring=B.MeshBuilder.CreateTorus('hobBurner',{diameter:.24,thickness:.015,tessellation:28},scene);
   ring.rotation.x=Math.PI/2;ring.position.set(x,1.155,z);ring.material=P.gold;ring.isPickable=false;
 }
 tile('ovenDoor',2.37,.46,1.671,.99,.54,.045,P.charcoal);
 tile('ovenGlass',2.37,.46,1.635,.83,.40,.007,P.blue);
 tile('ovenGoldHandle',2.37,.76,1.611,.66,.031,.055,P.gold);
 // An open rail makes the worktop homey, but no disconnected extractor kit.
 tile('wallRail',.14,2.18,2.74,.91,.045,.066,P.gold);
 for(let i=0;i<3;i++) {
   cylinder('woodSpoon'+i,[-.14+i*.29,1.93,2.70],.023,.32,i===1?P.oak:P.gold,12);
 }
 // Oval wood table with thick beveled-looking double edge.
 const tableTop=cylinder('breakfastTableTop',[-.09,.93,-.70],2.0,.12,P.oakLight,48);
 tableTop.scaling.z=.61;
 const rim=cylinder('breakfastTableLip',[-.09,.868,-.70],2.05,.027,P.oak,48);rim.scaling.z=.62;
 const tableTopInsert=cylinder('breakfastTableSilkyTop',[-.09,1.001,-.70],1.91,.022,P.porcelain,48);
 tableTopInsert.scaling.z=.59;
 cylinder('tableCenterPedestal',[-.09,.45,-.70],.34,.82,P.oak,20);
 tile('tableFootX',-.09,.08,-.70,1.25,.12,.22,P.oakLight);
 tile('tableFootZ',-.09,.08,-.70,.22,.12,.78,P.oakLight);
 // Two upholstered dining chairs harmonized with the same sage/oak palette.
 function chair(x,side){
   const dir=side<0?-1:1;
   tile('chairSeat',x,.49,-.69,.54,.135,.55,P.oakLight);
   ellipsoid('chairCushion',x,.59,-.69,.47,.13,.47,P.textile);
   tile('chairBackUpright',x+dir*.22,.98,-.69,.095,.75,.61,P.oak);
   ellipsoid('chairPaddedBack',x+dir*.235,1.07,-.69,.15,.66,.51,P.sageLight);
   for(const dz of [-.22,.22]){
    const leg=tile('chairLeg',x-dir*.16,.25,-.69+dz,.07,.45,.072,P.oak);
    leg.rotation.z=.055*dir;
   }
 }
 chair(-1.54,-1);chair(1.39,1);
 // Breakfast styling: vase, fruit, mat. Items stay away from invisible hitboxes.
 ellipsoid('placemat',-.16,1.015,-.71,.82,.016,.48,P.textile);
 ellipsoid('smallFlowerVase',.48,1.17,-.48,.18,.28,.18,P.rose);
 tube('smallFlowerStem',[[.48,1.39,-.48],[.48,1.54,-.48],[.51,1.65,-.48]],.018,P.leaves);
 for(let i=0;i<5;i++){
  const a=i*2*Math.PI/5;
  sphere('tinyFlowerPetal',[.51+Math.cos(a)*.075,1.67,-.48+Math.sin(a)*.07],.088,i%2?P.rose:P.ivory);
 }
 // Repeated arches and hanging lamp create continuity and diffuse warm fill.
 if(graphics.decor){
  tile('pictureFrame',-2.11,2.43,2.72,.51,.60,.09,P.oak);
  tile('pictureCanvas',-2.11,2.43,2.666,.39,.48,.018,P.ivory);
  ellipsoid('pictureRainbow1',-2.13,2.35,2.651,.24,.20,.018,P.rose);
  ellipsoid('pictureRainbow2',-2.13,2.35,2.636,.14,.13,.02,P.gold);
  const lampY=2.63;
  tube('pendantCord',[[.08,3.6,-.74],[.08,2.95,-.74]],.017,P.oakDark);
  const shade=cylinder('pendantShade',[.08,lampY,-.74],.60,.26,P.rose,32);
  shade.scaling.y=.87;
  const filament=sphere('pendantWarmBulb',[.08,lampY-.145,-.74],.12,P.ivory);
  filament.material.emissiveColor=c('#8d6a47');
  const light=new B.PointLight('pendantFill',new B.Vector3(.08,2.46,-.73),scene);
  light.intensity=.38;light.diffuse=c('#ffe2b7');light.range=4.2;
  // Ceramic open-shelf accessories share one complementary palette.
  tile('openShelf',-2.07,1.82,2.56,.51,.072,.25,P.oakLight);
  ellipsoid('miniPlantPot',-2.07,2.01,2.49,.20,.29,.21,P.ivory);
  for(let n=0;n<5;n++){
   const a=n*2*Math.PI/5;
   ellipsoid('plantLeaves',-2.07+Math.cos(a)*.12,2.23,2.49+Math.sin(a)*.10,.17,.36,.13,n%2?P.leaves:P.leaves2);
  }
 }
 // Contact shadows: avoid the impression of floating furniture.
 const groundMat=new B.StandardMaterial('artContactShadow',scene);
 groundMat.diffuseColor=c('#7c6a5d');groundMat.alpha=.10;groundMat.disableLighting=true;
 function contact(name,x,z,sx,sz){
  const disc=B.MeshBuilder.CreateDisc(name,{radius:.50,tessellation:32,sideOrientation:B.Mesh.DOUBLESIDE},scene);
  disc.rotation.x=Math.PI/2;disc.position.set(x,.036,z);disc.scaling.set(sx,sz,1);
  disc.material=groundMat;disc.isPickable=false;
 }
 contact('chairContactL',-1.54,-.69,.91,1.0);
 contact('chairContactR',1.39,-.69,.91,1.0);
 // Soft spotlight windowside and diffuse sky; no harsh PBR overexposure.
 const sky=scene.getLightByName('softSky'),sun=scene.getLightByName('warmWindowLight'),fill=scene.getLightByName('warmFill');
 if(sky){sky.intensity=.68;sky.groundColor=c('#ab9784')}
 if(sun){sun.intensity=1.38;sun.diffuse=c('#fff2de');sun.direction=new B.Vector3(-.46,-1,.32)}
 if(fill){fill.intensity=.28;fill.diffuse=c('#ffe1ca')}
 if(shadow){shadow.bias=.001;shadow.normalBias=.014}
 return Object.freeze({artPass:'r1',subsystems:['architecture','cabinets','floor','window','table','lighting']});
}
root.HannaKitchenArt=Object.freeze({rebuild});
})(typeof window!=='undefined'?window:globalThis);
