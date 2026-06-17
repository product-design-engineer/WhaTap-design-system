# HANDOFF — 작업 이어가기 (개인 랩톱)

> 다른 기기에서 이어서 작업하기 위한 문맥 스냅샷. 작성 2026-06-17.
> 최신 상태는 항상 git 기준 — 먼저 `git pull` 후 이 문서를 참고하세요.

## 0. 빠른 재개

```bash
git checkout main && git pull            # 최신 main (아래 작업들 병합 완료)
pnpm install                             # 의존성 (Tailwind 없음)
pnpm storybook                           # dev 서버 http://localhost:5181
pnpm test                                # vitest (playwright 렌더) — 현재 361 통과
pnpm build-storybook                     # 정적 빌드 검증
```

- **계정:** commit author·push 모두 **interfacedesigner** (`gh auth switch --user interfacedesigner` 후 push). 이 repo는 interfacedesigner 계정 사용.
- **dev 서버 주의:** 폴더/파일 **이동·rename 은 dev 서버를 끈 상태에서** 하거나 이동 후 재시작. 켜둔 채 rename 하면 Storybook 인덱서가 옛 경로를 캐시해 "로딩만" 멈춤(ENOENT). 해결: `lsof -ti :5181 | xargs kill -9` 후 `pnpm storybook` 재시작.

## 1. 핵심 아키텍처·정책 (반드시 숙지)

### No-Tailwind (흔적 0) — 절대 재도입 금지
- 런타임 스타일 = 자체 일반 CSS **`src/whatap-ds.css`** (export `./style.css`). 내부에 `@layer`·`--tw-*`·`@property`·escape 클래스명(`.foo-\[..\]`) **없음**. 유틸 클래스명은 escape 없는 식별자(`gap-4px`·`hover-opacity-70`).
- `src/tokens.css` = 참조용 순수 `:root` 토큰.
- **생성기 `scripts/detailwind.mjs`**: `whatap-ds.css` 생성 + tsx className 코드모드. 진실 원본 `scripts/frozen-whatap-ds.css`(1회 스냅샷, 미배포).
  - ⚠️ **`node scripts/detailwind.mjs generate` 는 원본(escaped className) tsx 에서만 실행.** 이미 codemod된 트리에서 재실행하면 유틸 누락 — 가드가 중단시킴. 증분 변경은 `src/whatap-ds.css` **직접 편집** + 새 의미 유틸은 EXTRAS(스크립트)에도 반영.
- 소비자: `import "@whatap/design-system/style.css"` 한 줄. Tailwind·`@source`·PostCSS 불필요.

### 다크 모드
- `.dark` 가 토큰만 재매핑. 표면 배경은 `bg-bg`(앱 셸=`--color-bg`)·`bg-card`(패널/카드=`--color-card`)·`bg-surface-*` 사용. **흰색 하드코딩 금지** (전경 흰색 텍스트/아이콘은 예외로 `#fff` 유지).
- `hover-bg-surface-100/200` 등 테마 적응 hover.

### 구조 인라인 금지 (글로벌 정책)
- 반복·의미 단위 구조(목록 행·카드·셀·항목)는 `map` 인라인 금지 → **독립 컴포넌트로 추출**. 카탈로그는 `Chrome/Parts/*` · `WhaTap AI/Parts/*`. (1회성 레이아웃 래퍼만 인라인 허용.)
- 추출 컴포넌트: 4섹션 docstring + `@example` + `index.ts` export + story.

### 카탈로그 분류 (Storybook 좌측 트리)
- **Primitives** — 원자 부품 (Button 포함) · **Chrome** — 페이지 틀 + 합성 위젯 (+ `Parts/`) · **WhaTap AI** — AI 위젯/진입/카드 (+ `Parts/`) · **Page** — 전체 페이지 합성 템플릿(A–D) · **Tokens** · **Foundation**(WhaTap Symbol).
- 3-Layer(Foundation/Composite/Shell)는 코드 의존 계층, 카탈로그 분류와 별개 축. 정책 전문: repo `CLAUDE.md`.

## 2. 이번 세션에 main 에 반영된 작업 (PR #1~#3 처리 완료)

1. **Tailwind 완전 제거 (흔적 0)** — whatap-ds.css 일반 CSS화, detailwind 생성기, tokens.css 순수 :root.
2. **Chrome 전체 다크 대응** — 하드코딩 흰색 → 테마 토큰(bg-bg/bg-card/surface). 헤드리스로 다크 배경 검증.
3. **구조 인라인 금지 정책 + 23개 Parts 추출** — Sidebar 메뉴행(SidebarMenuItem) 외 위젯/chrome 반복 구조 22개 추가 추출. `Chrome/Parts`·`WhaTap AI/Parts` 등록.
4. **카탈로그 재편** — Example 폐기(합성 위젯 Chrome 일원화 + 페이지 `Page` 카테고리), Button → Primitives, Sidebar 로고 헤더 검색 아이콘 제거.

검증 기준선: **361 테스트 통과 · 빌드 성공 · 배포 CSS Tailwind 흔적 0.**

## 3. 보류·후속 후보 (선택)

- **무동작(no-op) 텍스트 유틸**: `text-secondary`/`tertiary`/`disabled`·`font-numeric` 는 규칙 없는 no-op(Tailwind 시절부터). 색 위계 실제 적용하려면 `whatap-ds.css` 에 `.text-secondary{color:var(--color-text-secondary)}` 등 추가 — 단 라이트 픽셀 변경이므로 확인 후.
- **다크 폴리시 잔여**: `hover-bg-black`(WhaTapAiWidget 소형 아이콘 버튼)·위젯 카드(AiUserBubble `#f5f5f5` 등)는 chrome 범위 밖이라 이번 다크 대응에서 제외 — 필요 시 토큰화.
- **node_modules stale**: `node_modules/.pnpm` 에 옛 tailwind 디렉토리 잔존(lockfile 0, 미참조). `rm -rf node_modules && pnpm install` 로 정리 가능(필수 아님).
- **DESIGN.md 합본**: `pnpm build:design` 가 docs 7종 → `DESIGN.md` 합본 (storybook/build 직전 자동). docs 수정 시 재생성됨.

## 4. 주요 파일 지도

| 영역 | 파일 |
|---|---|
| 정책 정본 | `CLAUDE.md` (No-Tailwind·다크·구조정책·카탈로그·DataTable 등) |
| 토큰 | `src/tokens.css` (참조용 :root) |
| 런타임 CSS | `src/whatap-ds.css` (생성물) + `scripts/detailwind.mjs` + `scripts/frozen-whatap-ds.css` |
| 카탈로그 정렬 | `.storybook/preview.tsx` (storySort) |
| 카탈로그 문서 | `docs/SKILL.md` · `docs/ONBOARDING.md` · `docs/patterns.md` · `docs/tokens.md` · `stories/0-Introduction.mdx` |
| Parts(추출) | `src/*Item.tsx`·`src/*Row.tsx`·`src/TabButton.tsx` 등 + `src/widget/*Row.tsx`·`*Step.tsx`·`*Chip.tsx` |
