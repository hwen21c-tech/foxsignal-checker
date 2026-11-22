# 🦊 폭스시그널 1초 체커 (독립 웹앱)

종목명·코드 하나로 **오늘 통합 거래대금 300억 통과 여부 · 등락률 · 시가/고가/저가 대비 위치**와
**소속 테마 신호등 · 최근/과거 재료**를 바로 보여 주는 폭스시그널 무료 체커입니다.
관제탑(`stock-dashboard`)과 분리된 **독립 PWA**로 배포됩니다.

## 지금 열려 있는 주소

| 배포 | 주소 |
| --- | --- |
| GitHub Pages (정적 · 바로 사용 중) | https://hwen21c-tech.github.io/foxsignal-checker/ |
| Vercel (선택 · 같은 파일을 Import) | 저장소를 Vercel에 Import 하면 자동 생성 |

## 구성

```
index.html                       체커 본체 (관제탑 public/checker.html 최신본)
manifest.json                    PWA 매니페스트 (id·start_url·scope = "./")
sw.js                            오프라인 셸 서비스워커 (화면은 네트워크 우선, 실패 시 캐시)
checker-icon-192.png
checker-icon-512.png
checker-icon-maskable-512.png    (maskable)
checker-apple-180.png            (iOS 홈 화면 아이콘)
.nojekyll                        GitHub Pages Jekyll 처리 생략
data/stock_snapshot_latest.json  실시간 API가 막힐 때 쓰는 마지막 거래일 스냅샷
data/signal_scorecard.json       "오늘의 300억↑ 대장주" 칩 (성적표)
data/theme-membership.json       종목 → 소속 테마 색인 (정적 폴백)
data/last-dynamic-themes.json    직전 거래일 주도 테마 Top8 (정적 폴백)
```

## 시세·테마 데이터는 어디서 오나

이 저장소는 **화면만** 담고 있고, 값은 관제탑의 실측 API를 그대로 불러옵니다.

- 기본: `https://stock-dashboard-live-6frm.vercel.app/api/stock-live`
  - `?codes=<종목명|6자리코드>&fresh=1` → 실측 통합 시세
  - `?mode=theme&code=<코드>&pct=<등락률>` → 네이버 테마 랭킹·상세·종목뉴스 실측
- 위 API가 막히면(통신 차단·점검) `data/` 안의 **마지막 거래일 스냅샷**으로 대신하고, 화면에 기준일을 표시합니다.
  없는 숫자·없는 재료를 만들지 않습니다.

## 갱신 방법

관제탑 저장소(`stock-dashboard`)의 `sd_live/public/checker.html` 을 고친 뒤 이 저장소로 복사합니다.

```bash
# 관제탑 저장소 기준
cp sd_live/public/checker.html      ../foxsignal-checker/index.html
cp sd_live/public/checker-icon-192.png sd_live/public/checker-icon-512.png \
   sd_live/public/checker-icon-maskable-512.png sd_live/public/checker-apple-180.png \
   ../foxsignal-checker/
cp deploy_repo/data/stock_snapshot_latest.json deploy_repo/data/signal_scorecard.json \
   deploy_repo/data/theme-membership.json deploy_repo/data/last-dynamic-themes.json \
   ../foxsignal-checker/data/

cd ../foxsignal-checker && git add -A && git commit -m "chore: 체커 최신본·스냅샷 동기화"
git push origin main && git push origin main:gh-pages
```

> **꼭 두 브랜치 모두 푸시하세요.** GitHub Pages 는 이 저장소의 **`gh-pages` 브랜치**를 바라보고 있어서,
> `main` 만 올리면 사이트는 옛 화면 그대로입니다. (`main` 은 소스 원본, `gh-pages` 는 배포본 — 내용은 같게 유지)

푸시 후에는 `index.html` 안의 세 곳만 이 저장소 기준으로 유지하면 됩니다.

1. `<link rel="manifest" href="manifest.json">`
2. `apiQuery()` — 관제탑과 같은 도메인일 때만 상대경로, 그 밖의 도메인은 `LIVE_BASE`(관제탑 실측 API)로 호출
3. 서비스워커 등록 `navigator.serviceWorker.register('./sw.js')`

`sw.js` 의 `VER` 값을 올리면 기기에 남은 옛 캐시가 정리됩니다.

## Vercel Import (선택)

Vercel 대시보드 → **Add New… → Project → Import Git Repository** → `hwen21c-tech/foxsignal-checker` 선택.

- Framework Preset: **Other**
- Build Command: 비움 (정적 파일 그대로 배포)
- Output Directory: 비움 (저장소 루트)
- Root Directory: `./`
- 환경변수: 없음 (API 주소는 `index.html` 의 `LIVE_BASE` 상수)

Import 후 `https://<프로젝트명>.vercel.app/` 에서 바로 열립니다. 커스텀 도메인을 붙이지 않아도
`manifest.json` 의 `id`·`start_url`·`scope` 가 `"./"` 라서 Pages판과 Vercel판이 각자 따로 설치됩니다.

## 홈 화면 설치

- **Android(Chrome)**: 주소창 메뉴 → "앱 설치" / "홈 화면에 추가"
- **iPhone(Safari)**: 공유 → "홈 화면에 추가"

## 기준과 책임

거래대금 300억은 폭스시그널 **만쥬 ②차트·거래대금** 기준선입니다. 대금은 통합(KRX+NXT·시간외) 실측이고,
위치(%)는 그날 시가·고가·저가 대비 현재가입니다. 이 도구는 정보 정리이며 투자 권유가 아닙니다 —
판단과 책임은 본인 몫입니다.
