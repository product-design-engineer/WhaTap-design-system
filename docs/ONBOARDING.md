# WhaTap Design System — 신규 엔지니어 온보딩 체크리스트

이 디자인 시스템(`@whatap/design-system`)을 코드에 연결하기까지의 **접근 → 설치 → 설정** 순서입니다.
"AI로 지식만 받기"는 설치 없이 누구나 가능하고, "실제 컴포넌트를 import해 빌드/HMR"은 아래 사전 조건이 필요합니다.

---

## 0. 설치 없이 — AI로만 쓰는 경우 ✅

디자인 지식(토큰·컴포넌트·규칙)으로 JSX/스타일 안내만 받을 거면 설치/접근 권한이 필요 없습니다.

- MCP 엔드포인트: `https://whatapdesign-language.vercel.app/api/mcp` (Claude Code·Cursor 등에 연결)
- AI 안내 파일: `/llms.txt` · 통합 가이드 `/llms-full.txt`
- Storybook(컴포넌트 props·예시): https://whatap-design-system-storybook.vercel.app

실제 컴포넌트를 import해 빌드해야 하면 1~5를 진행하세요.

---

## 1. 접근 (Access) — private repo

- repo: `interfacedesigner/WhaTap-design-system` (**private**)
- 절차: 엔지니어의 GitHub 계정을 **repo collaborator로 초대**
  1. 담당자에게 `(이름, GitHub 핸들/이메일)` 전달
  2. repo → Settings → Collaborators → Add people
  3. 엔지니어가 초대 수락
- ✅ 체크: `git clone` 이 되면 접근 OK. (안 되면 초대/수락 여부 확인)

> `npm install @whatap/design-system` 은 **안 됩니다** — 공개 npm 미등록(아래 2·3 참고).

---

## 2. 사전 조건 (Prerequisites)

DS는 빌드 산출물(dist) 없이 **`.ts` 소스를 직접 export** 합니다. 소비 앱이 다음과 호환이어야 합니다.

- **Vite + TypeScript + React 19**
- Node 18+, pnpm
- **Tailwind 불필요** — DS는 외부 프레임워크 의존이 없는 자체 일반 CSS(`whatap-ds.css`)를 ship.
- 다른 번들러(webpack 등)는 `.ts` 트랜스파일 **추가 설정 필요**.

---

## 3. 설치 (Install) — 세 경로

**A) tarball (권장 — repo 접근 불필요, 빌드된 패키지)**
```bash
# 최신 버전 (main 배포마다 자동 갱신)
npm i https://whatap-design-system-storybook.vercel.app/releases/whatap-design-system-latest.tgz

# 특정 버전 고정
npm i https://whatap-design-system-storybook.vercel.app/releases/whatap-design-system-0.1.10.tgz

# 버전 목록 확인
curl https://whatap-design-system-storybook.vercel.app/releases/index.json
```
빌드된 `dist/`(JS + 타입 + CSS)가 포함되어 있어 **Vite·Next.js·webpack 모두 추가 설정 없이 동작**. repo clone·collaborator 초대 불필요. `npm`·`pnpm`·`yarn` 모두 가능.

**B) `link:` 심링크 (DS 동시 개발용)**
```bash
git clone https://github.com/interfacedesigner/WhaTap-design-system.git   # collaborator 권한 필요
# 소비 앱에서
pnpm add "link:../WhaTap-design-system"
```
`pnpm install` → 심링크 생성, **빌드 단계 없음**(DS 수정 자동 반영/HMR). 소비 vite 에 `resolve.dedupe: ['react','react-dom']` 필요(React 중복 방지). DS 소스를 함께 수정해야 할 때 적합.

**C) 같은 pnpm 워크스페이스일 때만**
```json
// 소비자 package.json (DS 가 동일 워크스페이스 멤버인 경우만)
"dependencies": { "@whatap/design-system": "workspace:*" }
```
현재 DS 는 별도 repo라 기본은 A). 동일 모노레포로 편입했을 때만 C).

**어떤 경로를 골라야 하나?**

| 상황 | 경로 |
|---|---|
| DS 컴포넌트를 **소비만** 한다 (대부분의 경우) | **A) tarball** |
| DS 소스를 **함께 수정**하며 개발한다 | B) link: |
| 같은 모노레포 안에 있다 | C) workspace: |

---

## 4. 스타일 import (필수)

소비자 진입점(예: `main.tsx`)에서 **한 줄**:
```ts
import "@whatap/design-system/style.css";   // = whatap-ds.css. 토큰+유틸+전역+.dark 전부 포함
```
- **Tailwind·`@source` 불필요.** 자체 일반 CSS라 컴포넌트가 쓰는 모든 유틸·토큰이 이미 들어 있음.
- 토큰 변수만 필요하면 `@whatap/design-system/tokens.css`.
- (DS 작업자만) `whatap-ds.css` 는 `scripts/detailwind.mjs` 생성물 — className/토큰 변경 시 `node scripts/detailwind.mjs generate` 재실행.

---

## 5. 사용

```ts
import { DashboardLayout, Button } from "@whatap/design-system";
import { AiCard, AiSectionHeading } from "@whatap/design-system/widget";
```
예시 코드: `/llms-full.txt`, Storybook. 다크 모드는 `<html>`에 `.dark` 클래스(토큰이 자동 전환).

---

## 막히면 (Troubleshooting)

| 증상 | 확인 |
|---|---|
| `git clone` 실패 | collaborator 초대/수락 여부 (1). tarball 경로(A)는 접근 권한 불필요 |
| 색·보더가 안 나옴 | `import "@whatap/design-system/style.css"` 누락 여부 (4) |
| import가 안 잡힘 | tarball: `npm i <URL>` 재실행 / link: `pnpm install` 재실행 (3) |
| tarball 설치 시 타입 오류 | `dist/index.d.ts` 포함 확인. `node_modules/@whatap/design-system/dist/` 존재 여부 |
| 다른 번들러에서 깨짐 | tarball(A)은 빌드된 JS라 번들러 무관. link:(B)는 Vite·TS·React19 필요 (2) |
| tarball이 최신이 아닌 것 같다 | `/releases/index.json` 의 latest 버전 확인. main 배포마다 자동 갱신 |

---

## tarball 릴리스 구조

main 브랜치에 머지되면 deploy 워크플로가 자동으로 라이브러리를 빌드하고 tarball을 생성해 Storybook과 함께 배포합니다. 수동 `pnpm release` + git commit은 더 이상 필요하지 않습니다.

- 최신: `https://whatap-design-system-storybook.vercel.app/releases/whatap-design-system-latest.tgz`
- 버전 고정: `.../releases/whatap-design-system-<version>.tgz`
- 버전 목록: `.../releases/index.json`
