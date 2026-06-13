import { defineConfig } from "tsup";

/**
 * 라이브러리 dist 빌드 — 비-Vite 번들러(webpack 등) 소비용.
 * Vite/워크스페이스 소비자는 exports 의 `source` 조건으로 src 를 직접 씀(HMR 유지).
 */
export default defineConfig({
  entry: { index: "src/index.ts", widget: "src/widget/index.ts" },
  format: ["esm"],
  dts: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  outDir: "dist",
  splitting: true,
  treeshake: true,
  clean: true,
});
