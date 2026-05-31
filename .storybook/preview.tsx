import type { Preview } from '@storybook/react-vite';
// Tailwind v4 + 디자인 시스템 토큰·키프레임 — 모든 story 에 자동 적용.
// (구 ../src/index.css → tokens.css 로 분리. Product-SaaS 등 소비자도 이 파일을 import.)
import '../src/tokens.css';

/**
 * Storybook 10 preview — 모든 story 에 공통 적용되는 parameters / decorators.
 *
 * - layout: 'centered' — 대시보드 chrome 같이 큰 컴포넌트는 개별 story 에서 'fullscreen' 으로 override.
 * - backgrounds: light(#fff) / surface-muted(#f5f5f5) / dark(#1a1a1a). prototype 에 자주 등장하는 배경 3종.
 * - storySort: 카탈로그 좌측 트리 ordering — Introduction → Foundation → Tokens → Chrome → WhaTap AI (Symbol/Context/Widget/Primitives/Cards).
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'surface-muted', value: '#f5f5f5' },
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
        order: [
          'Introduction',
          'Foundation',
          ['WhaTap Symbol'],
          'Tokens',
          ['Color', 'Type Scale', 'Font Weights', 'Line Heights', 'Tracking', 'Text Colors', 'Patterns', 'Korean vs Numeric', 'Typography', 'Tones (Semantic Intent)'],
          'Chrome',
          'WhaTap AI',
          ['Symbol', 'Context', 'Widget', 'Buttons', 'Input', 'Primitives', 'Cards'],
        ],
      },
    },
  },
};

export default preview;
