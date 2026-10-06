/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * @whatap/design-system 패키지 전용 Vite 설정.
 *
 * 이 vite.config.ts는 **Storybook과 Vitest(addon-vitest) 만**을 위함입니다.
 * 디자인 시스템 패키지 자체는 빌드 산출물이 없는 source-only 패키지
 * (exports map이 `src/*.ts` 직접 가리킴) 라서 별도 빌드 단계가 없습니다.
 * 소비자(예: prototypes/Product-SaaS) 가 패키지를 import하면 Vite가 source를
 * 직접 컴파일하므로 HMR 즉시 동작.
 */
export default defineConfig({
  plugins: [react()],
  // exports map 이 dist 우선(외부 소비자용)으로 바뀐 뒤에도, DS 자신의 Storybook/Vitest 는
  // `source` 조건으로 src 의 .tsx 를 직접 해석한다 → react-docgen autodocs 유지 +
  // dist 빌드 없이 동작(Vercel build-storybook 가 dist 를 만들지 않으므로 필수). 외부 소비/모노레포용 아님.
  // 'development|production' 은 Vite 가 모드별로 치환하는 특수 토큰(기본값 보존).
  resolve: {
    conditions: ["source", "module", "browser", "development|production"],
  },
  test: {
    projects: [
      // 순수 로직(브라우저 불필요) — topology 레이아웃 엔진 등. node 환경이라 빠르다.
      // storybook 프로젝트와 분리해 둔 이유: 브라우저 프로바이더를 띄우지 않기 위함.
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          // 파일마다 환경을 새로 만들지 않는다(isolate: false). CI 의 `Test` 단계가 간헐적으로
          // `Failed to fetch dynamically imported module` → `Cannot connect to the iframe` 로 멈췄다
          // (2026-10-01~02 실제 CI 14회 중 3회). 업스트림 미해결 이슈(vitest#9509 · storybook#33347)이고
          // 2코어 러너에서 테스트 서버가 순간적으로 요청을 받지 못하는 리소스 압박으로 본다.
          // 같은 러너 조건 측정(exp/vitest-flake): 기본 2/30 실패 · isolate:false 0/45 실패,
          // job 시간 6.7분 → 3.3분. 45회 모두 175 파일 통과 — 파일 간 상태 누수로 인한 실패 없음.
          // 되돌림 조건: 파일 간 상태 누수가 의심되는 실패가 나오면 이 줄을 지우고 재측정한다.
          isolate: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
