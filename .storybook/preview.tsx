import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
// No-Tailwind 내재화 CSS — 토큰(:root) + 유틸리티 클래스 + 키프레임 자체완결.
// Tailwind 런타임 의존 0%. 소비자도 이 파일을 import.
import '../src/whatap-ds.css';
import { enableDsPolicyGuard } from '../src/devPolicyGuard';

/**
 * DS 정책 위반 런타임 가드 — 카탈로그를 보는 동안 위반이 빨간 outline + 배지로 드러난다.
 * CI 게이트(`npm run lint:tokens`)가 잡지 못하는 런타임 상태(카드 없는 본문 블록,
 * page·card 동일색, 3층 중첩)를 화면에서 즉시 인지시키는 것이 목적.
 *
 * ⚠️ **자동화 컨텍스트에서는 끈다.** 가드가 DOM(`data-ds-violation`)과 화면(outline·배지)을
 * 바꾸므로, 켠 채로 두면 vitest 스토리 테스트가 실패하고 시각 스냅샷에 경보가 찍힌다.
 *   - vitest 브라우저 러너: `__vitest_browser__` 감지
 *   - 시각 스냅샷(scripts/visual-snap.mjs): URL 에 `dsGuard=off`
 */
if (typeof window !== 'undefined') {
  const off = new URLSearchParams(window.location.search).get('dsGuard') === 'off';
  const underTest = Boolean((globalThis as Record<string, unknown>).__vitest_browser__);
  if (!off && !underTest) enableDsPolicyGuard();
}

/**
 * Storybook 10 preview — 모든 story 에 공통 적용되는 parameters / decorators.
 *
 * - layout: 'centered' — 대시보드 chrome 같이 큰 컴포넌트는 개별 story 에서 'fullscreen' 으로 override.
 * - backgrounds: light / surface-muted / dark 3종 — prototype 에 자주 등장하는 배경.
 * - storySort: 카탈로그 좌측 트리 ordering — 3-Layer 단일 체계. Introduction → Overview(전역 Do/Don't) → Tokens(메타) → Primitives(자체 렌더 리프, Ai/ 하위그룹) → Composite(프리미티브 조합, Ai/ 하위그룹) → Shell(진입점: DashboardLayout · Ai/Widget · Page 합성 템플릿). 각 계층 안에서 AI 전용 에셋은 `Ai/` 접두 그룹으로 묶는다.
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      // default 미지정 — 캔버스는 whatap-ds.css 의 body 배경(--color-bg)을 따르므로
      // 우측 상단 Theme 토글(라이트/다크)이 배경까지 함께 전환한다. (수동 배경은 아래 값 유지)
      values: [
        // raw-color-ok: Storybook 캔버스의 *수동* 배경 옵션 — DS 표면이 아니라 도구 chrome.
        { name: 'light', value: '#ffffff' },
        { name: 'surface-muted', value: 'var(--color-surface-50)' },
        // raw-color-ok: 위와 동일 — 테마와 독립적으로 고정이어야 비교 대조가 된다.
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    controls: {
      expanded: true, // argTypes description 을 기본 노출 — AI / 사용자 모두 prop 의미 즉시 확인 가능
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' — a11y 위반만 표시, CI fail 시키지 않음. 추후 'error' 로 강화 가능.
      test: 'todo',
    },
    options: {
      storySort: {
        // 순서 목록에 없는 자리는 **메뉴명(title) 순**. 기본값 'configure'(파일 import 순)이면 메뉴명 접두
        // (`Chart ·` · `Web ·`)가 한데 모이지 않는다 — 파일명이 `CountryFlag` 인 `Web · CountryFlag` 가
        // C 자리에 홀로 서 있었다(2026-10-14). 같은 컴포넌트 안의 스토리 순서는 그대로다(includeNames 기본 false →
        // 같은 title 은 정렬하지 않는다). ⚠️ 함수형 storySort 는 Storybook 이 정적으로 다시 해석하다 구문 오류로
        // 카탈로그 전체를 못 띄웠다 — 객체 설정만 쓴다.
        method: 'alphabetical',
        order: [
          'Introduction',
          // Gallery — 비주얼 컴포넌트 인덱스. Introduction 다음에 둔다: 「무엇인가」를 읽고 나면
          // 다음에 필요한 것이 「어떤 컴포넌트가 있나」이고, 그건 정책보다 앞이다.
          'Gallery',
          // Overview — 전역 Do/Don't.
          'Overview',
          'Tokens',
          ['Color', 'Type Scale', 'Font Weights', 'Line Heights', 'Tracking', 'Text Colors', 'Patterns', 'Korean vs Numeric', 'Typography', 'Tones (Semantic Intent)'],
          'Primitives',
          'Composite',
          'Shell',
          ['DashboardLayout', 'Page'],
        ],
      },
    },
  },
  decorators: [
    // 우측 상단 툴바에 Light/Dark 토글 추가 — <html> 에 `.dark` 클래스를 토글한다.
    // whatap-ds.css 의 `.dark` 토큰이 cascade 되어 모든 story 가 다크로 전환된다.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
};

export default preview;
