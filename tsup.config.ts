import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

/**
 * 라이브러리 dist 빌드 — 비-Vite 번들러(webpack 등) 소비용.
 * Vite/워크스페이스 소비자는 exports 의 `source` 조건으로 src 를 직접 씀(HMR 유지).
 *
 * 런타임 CSS 는 tsup 이 만들지 않는다(엔트리가 TS 뿐). 그래서 빌드 끝에 직접 복사한다.
 * package.json 의 `"./style.css": "./dist/style.css"` 가 이 파일을 가리키므로, 복사가
 * 빠지면 소비 규약인 `import "@whatap/design-system/style.css"` 가 어느 앱에서도
 * 해석되지 않는다 — 실제로 0.1.0 tarball 이 CSS 없이 나갔다.
 */
export default defineConfig({
  async onSuccess() {
    mkdirSync("dist", { recursive: true });
    copyFileSync("src/whatap-ds.css", "dist/style.css");
    console.log("· dist/style.css 복사 완료");
  },
  entry: { index: "src/index.ts", widget: "src/widget/index.ts" },
  format: ["esm"],
  dts: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  outDir: "dist",
  splitting: true,
  treeshake: true,
  clean: true,
});
