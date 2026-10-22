/* V2 has isolated scope. Cache the shell, glTF assets and Babylon CDN after online access. */
const CACHE='hanna-kitchen-v2-20261022-1';
const SHELL=['./','./index.html','./cozinha.js','./cozinha.css','./mission.js','./quality.js','./audio.js','./ui.js','./manifest.webmanifest','../pilot/cozinha.css'];
const CDN=['https://cdn.babylonjs.com/babylon.js','https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(SHELL);
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