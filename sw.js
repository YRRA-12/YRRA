const CACHE='wb-app-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil((async function(){
    const cache=await caches.open(CACHE);
    await Promise.all(SHELL.map(function(u){return cache.add(u).catch(function(){});}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',function(e){
  e.waitUntil((async function(){
    const ks=await caches.keys();
    await Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  e.respondWith((async function(){
    try{
      var res=await fetch(req);
      var cp=res.clone();
      caches.open(CACHE).then(function(c){c.put(req,cp);});
      return res;
    }catch(err){
      var hit=await caches.match(req);
      if(hit) return hit;
      return await caches.match('./index.html');
    }
  })());
});
