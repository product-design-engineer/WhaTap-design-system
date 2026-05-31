import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook 10 설정 — @whatap/design-system 패키지.
 *
 * stories glob (패키지 root 기준 — `../`):
 *   - stories/**\/*.mdx              — 디자인 시스템 메타 문서 (Introduction, Token 카탈로그)
 *   - stories/**\/*.stories.{ts,tsx} — 카탈로그 stories (Tokens / Primitives / Chrome / Widget Cards)
 *
 * Vite 통합:
 *   - 패키지의 vite.config.ts 가 자동 inherit 되어 react + @tailwindcss/vite 적용.
 *   - 소비자(Product-SaaS 등) 가 file: hard link 로 import — vite alias 불필요.
 */
const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
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
