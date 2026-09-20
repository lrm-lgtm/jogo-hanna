const CACHE='jogo-hanna-v1.4.2-camera';
const APP=[
 './index.html','./game.css','./mobile-fix.js','./loader.js','./v13-motion.js','./v14-world.js',
 './manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./404.html',
 './payload/game-gz-1.txt','./payload/game-gz-2.txt','./payload/game-gz-3.txt','./payload/game-gz-4.txt'
];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
   await self.clients.claim();
   // força as abas antigas a recarregarem já sob o SW novo; elimina shell velho preso no Safari.
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   for(const client of clients){
     try{await client.navigate(client.url)}catch(e){}
   }
 })());
});

async function networkFirst(request){
 const cache=await caches.open(CACHE);
 try{
   const response=await fetch(request,{cache:'no-store'});
   if(response&&response.ok)cache.put(request,response.clone()).catch(()=>{});
   return response;
 }catch(err){
   return (await cache.match(request,{ignoreSearch:true})) || (await cache.match('./index.html'));
 }
}

async function cacheFirstRemote(request){
 const cache=await caches.open(CACHE);
 const cached=await cache.match(request);
 if(cached){
   fetch(request).then(r=>{if(r&&r.ok)cache.put(request,r.clone())}).catch(()=>{});
   return cached;
 }
 const r=await fetch(request);
 if(r&&r.ok)cache.put(request,r.clone()).catch(()=>{});
 return r;
}

self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 const remote=u.origin!==self.location.origin;
 if(remote){event.respondWith(cacheFirstRemote(event.request));return}

 // HTML/JS/CSS sempre tentam rede primeiro para correções aparecerem na hora.
 const dynamic=event.request.mode==='navigate'||/\.(?:html|js|css|webmanifest)$/i.test(u.pathname);
 if(dynamic){event.respondWith(networkFirst(event.request));return}

 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const hit=await cache.match(event.request,{ignoreSearch:true});
   if(hit)return hit;
   try{
     const r=await fetch(event.request);
     if(r&&r.ok)cache.put(event.request,r.clone()).catch(()=>{});
     return r;
   }catch(e){
     if(event.request.mode==='navigate')return cache.match('./index.html');
     throw e;
   }
 })());
});