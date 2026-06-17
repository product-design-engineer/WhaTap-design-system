import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook 10 설정 — @whatap/design-system 패키지.
 *
 * stories glob (패키지 root 기준 — `../`):
 *   - stories/**\/*.mdx              — 디자인 시스템 메타 문서 (Introduction, Token 카탈로그)
 *   - stories/**\/*.stories.{ts,tsx} — 카탈로그 stories (Tokens / Primitives / Chrome / Widget Cards)
 *
 * Vite 통합:
 *   - 패키지의 vite.config.ts 가 자동 inherit 되어 react 적용 (Tailwind 제거됨 — styles.css 직접 로드).
 *   - 소비자(Product-SaaS 등) 가 file: hard link 로 import — vite alias 불필요.
 *
 * 정적 자산(staticDirs):
 *   - `static/icons` → `/icons` 매핑. 컴포넌트가 참조하는 `/icons/*.svg` 를 빌드에 번들.
 *     (배포된 Storybook 에는 dev proxy 가 없으므로 자산을 직접 포함해야 깨지지 않음)
 */
const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  staticDirs: [
    { from: '../static/icons', to: '/icons' },
    // 카탈로그 .md (DESIGN.md 합본 포함) 를 /design-system/ 로 서빙 — AI 에이전트 컨텍스트 주입용.
    // DESIGN.md 는 build:design (build-storybook 직전) 가 생성.
    { from: '../docs', to: '/design-system' },
    // AI 진입 파일 (llms.txt / mcp.txt) 을 사이트 루트로 서빙 — 엔지니어 AI 연결 진입점.
    { from: '../static/public', to: '/' },
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
    '@storybook/addon-themes',
  ],
  framework: '@storybook/react-vite',
  docs: {
    // CSF stories with `tags: ['autodocs']` 자동 문서 생성.
    // Storybook 10 default 동작.
  },
  typescript: {
    // props 표를 위한 react-docgen-typescript — argTypes 자동 풍부화.
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
