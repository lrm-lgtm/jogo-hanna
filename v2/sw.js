/* V2 has isolated scope. Cache the shell, glTF assets and Babylon CDN after online access. */
const CACHE='hanna-kitchen-v2-gait-r12-20261024';
const SHELL=['./index.html','./assets/kitchen-architecture-r2.glb','./assets/hanna-free-r8.glb','./premium-corner.js','./vendor/babylon.js','./vendor/babylonjs.loaders.min.js','./cozinha.js','./controls.js','./camera-follow.js','./gait.js','./art-direction.js','./cozinha.css','./mission.js','./quality.js','./audio.js','./ui.js','./manifest.webmanifest','../pilot/cozinha.css'];
const ASSETS=["../pilot/assets/furniture/cabinet_small_decorated.bin","../pilot/assets/furniture/cabinet_small_decorated.gltf","../pilot/assets/furniture/cactus_small_A.bin","../pilot/assets/furniture/cactus_small_A.gltf","../pilot/assets/furniture/furniturebits_texture.png","../pilot/assets/furniture/lamp_table.bin","../pilot/assets/furniture/lamp_table.gltf","../pilot/assets/furniture/rug_rectangle_stripes_A.bin","../pilot/assets/furniture/rug_rectangle_stripes_A.gltf","../pilot/assets/furniture/shelf_A_small.bin","../pilot/assets/furniture/shelf_A_small.gltf","../pilot/assets/hanna/hanna-v5.glb","../pilot/assets/restaurant/bowl.bin","../pilot/assets/restaurant/bowl.gltf","../pilot/assets/restaurant/chair_A.bin","../pilot/assets/restaurant/chair_A.gltf","../pilot/assets/restaurant/cuttingboard.bin","../pilot/assets/restaurant/cuttingboard.gltf","../pilot/assets/restaurant/extractorhood.bin","../pilot/assets/restaurant/extractorhood.gltf","../pilot/assets/restaurant/food_ingredient_bun.bin","../pilot/assets/restaurant/food_ingredient_bun.gltf","../pilot/assets/restaurant/food_ingredient_bun_top.bin","../pilot/assets/restaurant/food_ingredient_bun_top.gltf","../pilot/assets/restaurant/fridge_A.bin","../pilot/assets/restaurant/fridge_A.gltf","../pilot/assets/restaurant/jar_A_small.bin","../pilot/assets/restaurant/jar_A_small.gltf","../pilot/assets/restaurant/jar_B_small.bin","../pilot/assets/restaurant/jar_B_small.gltf","../pilot/assets/restaurant/kitchencabinet.bin","../pilot/assets/restaurant/kitchencabinet.gltf","../pilot/assets/restaurant/kitchencounter_sink_backsplash.bin","../pilot/assets/restaurant/kitchencounter_sink_backsplash.gltf","../pilot/assets/restaurant/kitchencounter_straight_A_backsplash.bin","../pilot/assets/restaurant/kitchencounter_straight_A_backsplash.gltf","../pilot/assets/restaurant/kitchencounter_straight_B_backsplash.bin","../pilot/assets/restaurant/kitchencounter_straight_B_backsplash.gltf","../pilot/assets/restaurant/kitchentable_A_large.bin","../pilot/assets/restaurant/kitchentable_A_large.gltf","../pilot/assets/restaurant/oven.bin","../pilot/assets/restaurant/oven.gltf","../pilot/assets/restaurant/pan_A.bin","../pilot/assets/restaurant/pan_A.gltf","../pilot/assets/restaurant/plate.bin","../pilot/assets/restaurant/plate.gltf","../pilot/assets/restaurant/plate_small.bin","../pilot/assets/restaurant/plate_small.gltf","../pilot/assets/restaurant/restaurantbits_texture.png","../pilot/assets/restaurant/shelf_papertowel.bin","../pilot/assets/restaurant/shelf_papertowel.gltf","../pilot/assets/restaurant/stove_multi_countertop.bin","../pilot/assets/restaurant/stove_multi_countertop.gltf","../pilot/assets/restaurant/table_round_A_small.bin","../pilot/assets/restaurant/table_round_A_small.gltf"];
const CDN=[];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll([...SHELL,...ASSETS]);
  await Promise.allSettled(CDN.map(async url=>{
   const response=await fetch(url,{mode:'no-cors',cache:'reload'});
   await cache.put(url,response);
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith('hanna-kitchen-v2-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin&&!CDN.includes(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response.ok||response.type==='opaque')await cache.put(request,response.clone());
   return response;
  }catch(_e){return Response.error()}
 })());
});