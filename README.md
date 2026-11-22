# 🦊 폭스시그널 1초 체커 (독립 웹앱)

종목명·코드 하나로 **오늘 통합 거래대금 · 등락률 · 시가/고가/저가 대비 위치 · 52주 위치**와
**DART 공시·KRX 경보 신호등 · 현재 상태 판정 · 왜 오르고/빠졌는지 1초 해석 · 소속 테마 신호등 · 최근/과거 재료**,
그리고 **🗺️ 오늘의 테마맵(히트맵 → 테마 구성종목 주요순) · 📰 `[특징주]` 기사 이력 & 260일 과거 파동 비교**까지
바로 보여 주는 폭스시그널 무료 체커입니다. 테마명(`반도체`)으로도 검색됩니다.
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
data/signal_scorecard.json       "오늘의 거래대금 상위 종목" 칩 (성적표)
data/theme-membership.json       종목 → 소속 테마 색인 (정적 폴백)
data/last-dynamic-themes.json    직전 거래일 주도 테마 Top8 (정적 폴백)
```

## 시세·테마 데이터는 어디서 오나

이 저장소는 **화면만** 담고 있고, 값은 관제탑의 실측 API를 그대로 불러옵니다.

- 기본: `https://stock-dashboard-live-6frm.vercel.app`
  - `/api/stock-live?codes=<종목명|6자리코드>&fresh=1` → 실측 통합 시세 + 지수·해외선물·환율·SOX
  - `/api/stock-live?mode=theme&code=<코드>&pct=<등락률>` → 네이버 테마 랭킹·상세·종목뉴스 실측
  - `/api/stock-live?mode=alerts&code=<코드>` → 그 종목의 KRX 투자주의·경고·위험·거래정지 지정 여부
  - `/api/dart-live?code=<코드>&name=<종목명>&days=30` → DART 고유번호로 그 회사만 최근 30일 공시(위험/주목/일반)
  - `/api/stock-live?mode=theme_map` → 대표 테마 24개의 평균 등락률·합산 거래대금·구성종목(테마 상세 실측)
  - `/api/stock-live?mode=theme_members&no=<테마번호>` → 그 테마 구성종목 전부(거래대금 내림차순)
  - `/api/stock-live?mode=theme_search&q=<테마명>` → 테마 이름으로 테마번호 찾기
  - `/api/stock-live?mode=history_catalyst&code=<코드>&name=<종목명>&price=<현재가>` → `[특징주]` 기사 이력 + 260일 과거 파동
  - `/api/content-ai` (POST `{action:'stock_insight', facts:{…}}`) → 실측 사실만으로 3~4줄 원인·흐름·과거 비교 해석
- 위 API가 막히면(통신 차단·점검) `data/` 안의 **마지막 거래일 스냅샷**으로 대신하고, 화면에 기준일을 표시합니다.
  없는 숫자·없는 재료를 만들지 않습니다.

### 신호등·판정·해석의 규칙

- 🛡️ **공시·경보 신호등**: `🔴 투자주의·희석성 공시 주의`(유증·CB·감자·횡령·소송 등 위험 키워드, 또는 KRX 경보·거래정지) /
  `🟡 최근 공시 확인 필요`(수주·최대주주·실적 등 주목 공시) / `🟢 공시·경보 이상 없음`(정기보고서·IR 안내뿐이거나 공시 없음).
  DART 는 종목코드를 공식 고유번호로 확인한 뒤 **그 회사만** 조회하며, 확인하지 못하면 `⚪ 미확인`으로 적습니다.
- 📍 **현재 상태 판정**: 실측 값만 조합한 조건 칩입니다 — ⚠️ 공시·경보 주의 → 🔥 단기 과열(52주 85%↑ & +5%↑) → 🧊 약세(시가 -3%↓) →
  🌊 수급 유입(거래대금 300억↑ & 시가 위 상승) → 👀 눌림(대금 300억↑ & 시가 부근 또는 -2~-5% 조정) → ⚪ 중립. 투자 권유가 아닙니다.
- 🧠 **1초 해석**: 소속 테마·최근 뉴스·미장(나스닥·S&P 선물·SOX·환율)·공시·경보·52주를 사실로 묶어 Gemini 에 2~3줄을 요청합니다.
  실측에 없는 숫자를 담은 문장은 버리고, AI 가 늦거나 실패하면 같은 사실로 만든 규칙 요약을 먼저/대신 보여 줍니다.

### 🗺️ 테마맵 · 📰 `[특징주]` 이력의 규칙

- **테마맵**: 네이버 증권 테마 상세(`/api/stocks/theme/{no}`)의 `groupInfo.changeRate`(테마 전체 구성 평균)와
  구성종목별 거래대금(`accumulatedTradingValue`, 백만원)을 합산해 타일을 만듭니다. 타일 **색 = 평균 등락률**(상승 빨강·하락 파랑),
  **크기 = 합산 거래대금**, 정렬도 거래대금 순입니다. 대표 24개 테마를 쓰며, 나머지 테마는 **테마명 검색**으로 엽니다.
- **테마 팝업**: 그 테마 구성종목 전부를 **거래대금순/등락률순**으로 펼치고, 종목을 누르면 그 종목의 1초 체크로 이동합니다.
  종목 카드 안의 `#테마` 칩도 같은 팝업을 엽니다.
- **`[특징주]` 이력**: 구글뉴스 RSS에서 `"특징주" 종목명`을 최근·과거(1년) 두 번 검색해 **제목이 `특징주`로 시작하고
  첫 구절(주어)에 그 종목이 있는 기사만** 남깁니다(다른 종목 기사를 붙이지 않음). 기사 날짜는 KST 기준이며,
  그날 일봉(휴장이면 가장 가까운 거래일)과 짝지어 **그날 등락률·거래대금·그날 종가 대비 지금 위치·그 뒤 5·10거래일**을 계산합니다.
- **과거 파동**: 최근 260거래일에서 20일 저점→고점 상승 12%(없으면 8%) 이상 구간을 찾아, **그 안에서 하루 거래대금이 가장 컸던 순**으로
  최대 2개를 보여 줍니다(시작일~고점일·거래일수·상승률·최대 일대금·고점 대비 현재).
- 종가·등락률은 네이버 일별 시세(공식 등락률), 거래대금은 다음 금융 일별 `accTradePrice`(정규장) 실측입니다.
  한쪽이 막히면 남은 쪽만 쓰고 **근사치면 근사치라고 화면에 적습니다**. 없는 기사·없는 파동은 만들지 않습니다.

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
3. 서비스워커 등록부 — 이 저장소(manifest.json)에서만 `./sw.js` 를 등록하고, 관제탑·동적 앱 사본(manifest-checker.json)에서는 등록하지 않습니다

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

거래대금은 통합(KRX+NXT·시간외) 실측 기준이며, 위치(%)는 당일 시가·고가·저가 대비 현재 위치입니다.
거래대금은 '기준선 통과/미달' 판정 없이 규모(대금 집중·활발·보통·한산)만 보여 주고, 52주 위치는
네이버 일봉(최대 260거래일) 실측 최고·최저로만 계산합니다(일봉을 못 받으면 그 줄은 숨김).
이 도구는 정보 정리용이며 투자 판단과 책임은 본인에게 있습니다.
