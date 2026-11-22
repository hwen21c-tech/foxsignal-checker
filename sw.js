/* 폭스시그널 1초 체커 — 오프라인 셸 서비스워커
   · 화면(index.html)은 항상 네트워크 최신본을 먼저 시도하고, 막히면 캐시로 대신한다.
   · 정적 자산(아이콘·manifest)은 캐시 우선.
   · data/*.json 은 네트워크 우선 + 캐시 폴백(마지막 거래일 스냅샷).
   · 다른 도메인의 실측 API(stock-dashboard-live-6frm.vercel.app)는 가로채지 않고 그대로 통과시킨다
     — 시세는 언제나 실측 그대로여야 하므로 캐시하지 않는다. */
var VER = 'foxsignal-checker-v4';
var CORE = [
  './',
  './index.html',
  './manifest.json',
  './checker-icon-192.png',
  './checker-icon-512.png',
  './checker-icon-maskable-512.png',
  './checker-apple-180.png',
  './data/stock_snapshot_latest.json',
  './data/signal_scorecard.json',
  './data/theme-membership.json',
  './data/last-dynamic-themes.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VER).then(function(c){
      return Promise.all(CORE.map(function(u){
        return c.add(new Request(u, { cache: 'reload' })).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k.indexOf('foxsignal-checker-') === 0 && k !== VER;
      }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch(err){ return; }
  if (url.origin !== self.location.origin) return;

  /* 화면 이동 — 네트워크 최신본 우선, 실패 시 캐시 */
  if (req.mode === 'navigate' || url.pathname.slice(-1) === '/' || /\/index\.html$/.test(url.pathname)){
    e.respondWith(
      fetch(req).then(function(r){
        var copy = r.clone();
        caches.open(VER).then(function(c){ c.put('./index.html', copy).catch(function(){}); });
        return r;
      }).catch(function(){
        return caches.match(req).then(function(hit){
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* 거래일 스냅샷·테마 색인 — 네트워크 우선 + 캐시 폴백 */
  if (/\/data\/.+\.json$/.test(url.pathname)){
    e.respondWith(
      fetch(req).then(function(r){
        if (r && r.ok){
          var copy = r.clone();
          caches.open(VER).then(function(c){ c.put(req, copy).catch(function(){}); });
        }
        return r;
      }).catch(function(){ return caches.match(req); })
    );
    return;
  }

  /* 정적 자산 — 캐시 우선 */
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(r){
        if (r && r.ok && r.type === 'basic'){
          var copy = r.clone();
          caches.open(VER).then(function(c){ c.put(req, copy).catch(function(){}); });
        }
        return r;
      });
    })
  );
});
