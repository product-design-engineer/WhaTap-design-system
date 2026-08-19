// eslint.config.mjs — **좁은 표면에 강한 규칙 하나만.**
//
// 이 저장소의 스타일 규칙은 이미 전용 게이트들이 지킨다(raw-color · token-sync ·
// layer-deps · no-tailwind). ESLint 를 여기 들인 이유는 **그 게이트들이 원리적으로 볼 수
// 없는 것 하나** 때문이다: `import` 그래프의 **순환**.
//
//   `layer-deps` 는 계층 *방향*만 본다. 같은 계층 안의 A→B→A 는 방향 위반이 아니라서
//   통과한다. 실제로 `FilterDropdown ↔ FilterDropdownOptionItem` 순환이 그렇게 살아 있었다.
//
// ⚠️ **false green 주의.** resolver 에 `.ts`·`.tsx` 를 명시하지 않으면 그래프를 만들지 못하고
//    **조용히 통과한다.** 도입 시 알려진 순환 1건을 오라클로 써서 실제로 잡히는지 확인했다.
//    규칙을 손보면 그 확인을 다시 해야 한다.
//
// 의도적으로 **린트하지 않는 것**: 포맷팅 · 네이밍 · react hooks · a11y.
// 넓은 규칙 세트를 한 번에 켜면 상시 red 가 되고, 팀은 red 자체를 무시하기 시작한다.
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import { createNodeResolver } from "eslint-plugin-import-x/node-resolver";

export default tseslint.config(
  {
    // 소스만. stories/ 는 카탈로그라 순환이 구조 문제를 뜻하지 않는다.
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // react-hooks 는 **플러그인만 등록하고 규칙은 켜지 않는다.** 소스에 이미
    // `eslint-disable-next-line react-hooks/exhaustive-deps` 주석이 3곳 있는데,
    // 플러그인이 없으면 "정의되지 않은 규칙"으로 그 줄들이 전부 error 가 된다.
    // 규칙 자체를 켜는 것은 별개 결정이라 여기서 하지 않는다(넓은 규칙 = 상시 red).
    plugins: { "import-x": importX, "react-hooks": reactHooks },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    settings: {
      // 확장자를 명시하지 않으면 `./Foo` → `./Foo.tsx` 를 못 찾아 그래프가 비고,
      // 규칙은 아무것도 못 본 채 통과한다.
      "import-x/resolver-next": [
        createNodeResolver({ extensions: [".ts", ".tsx", ".js", ".jsx", ".json"] }),
      ],
      // 그래프를 만들려면 **의존 파일까지 파싱**해야 한다. 어떤 파서로 .ts/.tsx 를 읽을지
      // 알려주지 않으면 import 를 하나도 못 읽고 그래프가 1-hop 에서 끊긴다 →
      // 순환이 있어도 조용히 통과한다(실측으로 확인).
      "import-x/extensions": [".ts", ".tsx", ".js", ".jsx"],
      "import-x/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    },
    rules: {
      // 타입 전용 순환은 런타임 그래프를 만들지 않으므로 제외한다 —
      // 같은 이유로 `layer-deps` 도 값/타입을 나눠 센다. 섞으면 실제 문제가 잡음에 묻힌다.
      "import-x/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true, allowUnsafeDynamicCyclicDependency: false }],
      "import-x/no-self-import": "error",
    },
  },
);
