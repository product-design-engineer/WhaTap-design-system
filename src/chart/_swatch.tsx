/**
 * chart/_swatch — 범례 견본 한 개를 그리는 내부 모듈. 카탈로그 밖.
 *
 * [[ChartSwatch]](견본만)와 [[ChartLegendItem]](견본 + 이름 + 값)이 같은 견본을 그린다. 두 Primitives 가
 * 서로 import 하면 계층이 하나 올라가므로(Primitive 조합 = Composite) 그리는 코드를 여기 하나에 두고 함께 쓴다
 * (`_axisScale.ts` 와 같은 자리). 모양 · 크기 규칙의 정본은 ChartSwatch docstring.
 */
export type ChartSwatchShape = "square" | "line" | "dot";

export function SwatchMark({ color, shape = "square" }: { color: string; shape?: ChartSwatchShape }) {
  const line = shape === "line";
  const radius = line ? "rounded-1px" : shape === "dot" ? "rounded-full" : "rounded-2px";
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${radius}`}
      style={{ width: 8, height: line ? 2 : 8, background: color }}
    />
  );
}
