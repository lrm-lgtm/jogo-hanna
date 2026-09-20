const CACHE='jogo-hanna-v1.4.0-expanded';
const APP=['./','./index.html','./game.css','./mobile-fix.js','./loader.js','./v13-motion.js','./v14-world.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./404.html','./payload/game-gz-1.txt','./payload/game-gz-2.txt','./payload/game-gz-3.txt','./payload/game-gz-4.txt'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 const remote=u.hostname.includes('babylonjs.com')||u.hostname.includes('raw.githubusercontent.com')||u.hostname.includes('githubusercontent.com')||u.hostname.includes('assets.babylonjs.com');
 if(remote){
  e.respondWith(caches.open(CACHE).then(async c=>{
   const cached=await c.match(e.request);
   const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>cached);
   return cached||net;
  }));return;
 }
 e.respondWith(caches.open(CACHE).then(async c=>{
  const cached=await c.match(e.request);if(cached)return cached;
  try{const r=await fetch(e.request);if(r&&r.ok)c.put(e.request,r.clone());return r}
  catch(err){if(e.request.mode==='navigate')return c.match('./index.html');throw err}
 }));
});