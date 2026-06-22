# 시각 회귀 테스트 (Visual Regression)

렌더/유닛 테스트(`pnpm test`)가 못 잡는 **의도치 않은 시각 변화**(토큰·CSS·컴포넌트 외형)를
픽셀 비교로 검출한다. Playwright 캡처 + pixelmatch 비교.

## 사용

```bash
pnpm storybook            # dev 서버(5181) 먼저 기동 — 스냅샷 대상
pnpm test:visual          # baseline 과 비교 (회귀 시 exit 1, diff PNG 생성)
pnpm test:visual:update   # 의도된 변경 → baseline 갱신
```

- 비교 대상: `scripts/visual-snap.mjs` 의 `SHOTS` (핵심 컴포넌트·토큰 light + chrome dark 커버리지).
- baseline: `tests/visual/baseline/*.png` (커밋됨). diff: `tests/visual/diff/*.png` (gitignore).
- 허용치: mismatch 0.5% (antialiasing 흡수). 애니메이션·캐럿·transition 은 캡처 시 비활성화.

## ⚠️ 머신 민감도

baseline 은 **캡처한 머신의 폰트/렌더에 의존**한다 — 다른 OS/머신에서 `test:visual` 시
미세 diff 가 날 수 있다. 운영 원칙:

- baseline 은 **같은 환경에서 갱신**(개인 랩톱에서 갱신했으면 거기서 비교).
- 토큰/CSS/컴포넌트를 의도적으로 바꿨으면 `test:visual:update` 후 diff 를 눈으로 확인하고 커밋.
- **크로스-env(CI 포함) 안정 비교가 필요하면 Chromatic 도입** 권장 (`@chromatic-com/storybook` 이미 설치 — 프로젝트 토큰만 연결하면 됨). 이 스크립트는 로컬 1차 안전망.

## 새 스토리 추가

회귀 감시에 넣으려면 `scripts/visual-snap.mjs` 의 `SHOTS` 배열에 `{ id, theme }` 추가 후
`pnpm test:visual:update` 로 baseline 생성.
