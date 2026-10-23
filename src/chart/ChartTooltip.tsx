/**
 * ChartTooltip — 차트 마크를 가리켰을 때 그 마크의 값을 보이는 상자. 제목 · 값 줄(견본 · 이름 · 값) · 보조 줄. Primitives layer.
 *
 * ## Purpose
 * 차트가 가리킨 점 · 막대 · 칸의 정확한 값을 같은 모양으로 말하게 한다. 종전엔 차트마다 브라우저 기본 `title`(늦게 뜨고 · 다크를 따르지
 * 않고 · 값을 굵게 할 수 없다)을 쓰거나, [[HexGrid]] 처럼 자기 상자를 따로 그렸다 — 범례가 칸마다 갈렸던 것처럼 툴팁도 갈라진다(patterns §26).
 * 상자와 줄 모양은 이것이 정하고, 위치(마크 좌표)는 마크를 그린 차트가 정한다.
 *
 * ## When to use
 * - 차트 마크 hover · 포커스 — [[ScatterChart]] 점 · [[BoxPlotChart]] 칸 · [[StatusTimeline]] 마커 · [[EqualizerChart]] 막대 · [[StackedAreaChart]] 시점 · [[HexGrid]] 칸.
 * - 값 여러 개(구간 · 계열 · 백분위)를 한 마크에 대해 나란히 보일 때 — `rows`.
 *
 * ## When NOT to use
 * - 아이콘 · 글자 설명 말풍선 → [[Tooltip]] · [[InfoTip]]. 이것은 차트 마크 전용이다.
 * - 늘 보여야 하는 값 → 마크 옆 글자(최고점 [[ChartPeakMarker]] · 범례 값). 툴팁은 가리켜야 보인다.
 *
 * ## Composition rules
 * - **위치는 차트가 준다** — `left` · `top` 은 마크 자리(차트 플롯 상자 기준 CSS 길이), `flipX` · `flipY` 로 반대쪽에 편다.
 *   마크가 플롯 오른쪽 · 아래 절반이면 펴서 플롯 밖으로 덜 나가게 한다. 마크와 같은 좌표계를 쓴다(§5).
 * - 상자: `bg-card` · 1px `--color-border-default` · 반경 6 · `--shadow-md` · 안쪽 8 × 12. 다크는 토큰이 따라온다.
 * - 제목(`title`) `text-sm` medium primary · 값 줄은 견본(마크 모양, [[ChartSwatch]] 와 같은 그림) · 이름 secondary · 값 semibold primary 숫자 서체 오른쪽 정렬 ·
 *   보조 줄(`footer`) `text-sm` tertiary — 범례 항목([[ChartLegendItem]])과 같은 위계.
 * - `pointer-events: none` — 툴팁 안에 버튼을 두지 않는다. 행동은 마크 클릭으로.
 * - 값 줄이 아닌 자유 내용은 `children`(HexGrid `renderTooltip`).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 상자 | `--color-card` · 1px `--color-border-default` · 반경 6 · `--shadow-md` · 안쪽 8 / 12 · `z-index` 10 |
 * | 거리 | 마크에서 `offset`(기본 8px) — `flipX` 면 왼쪽, `flipY` 면 위 |
 * | 제목 | `text-sm` · medium · primary · 아래 4 |
 * | 값 줄 | 줄 간격 2 · 견본 8px · 사이 4 · 이름 secondary · 값 semibold primary `--font-family-numeric` · 이름과 값 사이 최소 12 |
 * | 보조 줄 | `text-sm` · tertiary · 위 4 |
 * | 접근성 | `role="tooltip"` — 차트 요약 `aria-label` 은 차트가 따로 갖는다 |
 *
 * @example
 * ```tsx
 * <ChartTooltip left="40%" top="20%" title="order" rows={[{ label: "호출", value: "420회" }, { label: "수행 시간", value: "640ms", color: "var(--color-chart-series-2)", shape: "dot" }]} />
 * ```
 */
import type { ReactNode } from "react";
import { SwatchMark, type ChartSwatchShape } from "./_swatch";

export type ChartTooltipRow = {
  /** 이름. */
  label: string;
  /** 값(표기 그대로). */
  value: ReactNode;
  /** 견본 색 — 마크와 같은 토큰. 없으면 견본 없이. */
  color?: string;
  /** 견본 모양 — 마크를 따른다. 기본 square. */
  shape?: ChartSwatchShape;
};

export type ChartTooltipProps = {
  /** 마크 x — 플롯 상자 기준 CSS 길이(`"40%"` · `120`). */
  left: string | number;
  /** 마크 y — 플롯 상자 기준 CSS 길이. */
  top: string | number;
  /** 마크 왼쪽에 편다(마크가 플롯 오른쪽 절반일 때). */
  flipX?: boolean;
  /** 마크 위에 편다(마크가 플롯 아래 절반일 때). */
  flipY?: boolean;
  /** 마크에서 떨어지는 거리(px). 기본 8. */
  offset?: number;
  /** 제목 — 대상 · 시점 이름. */
  title?: ReactNode;
  /** 값 줄. */
  rows?: ReadonlyArray<ChartTooltipRow>;
  /** 보조 줄 — 합계 · 비교 기준. */
  footer?: ReactNode;
  /** 자유 내용 — 주면 `rows` 대신 그린다. */
  children?: ReactNode;
};

export default function ChartTooltip({ left, top, flipX = false, flipY = false, offset = 8, title, rows, footer, children }: ChartTooltipProps) {
  const len = (v: string | number) => (typeof v === "number" ? `${v}px` : v);
  return (
    <div
      role="tooltip"
      className="absolute pointer-events-none bg-card border border-color-var-color-border-default rounded-6px shadow-md text-sm text-primary whitespace-nowrap"
      style={{
        zIndex: 10,
        padding: "8px 12px",
        left: `calc(${len(left)} ${flipX ? "-" : "+"} ${offset}px)`,
        top: `calc(${len(top)} ${flipY ? "-" : "+"} ${offset}px)`,
        transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
        fontFamily: "var(--font-family-korean)",
      }}
    >
      {title != null && <div style={{ fontWeight: "var(--font-weight-medium)", marginBottom: rows?.length || children ? 4 : 0 }}>{title}</div>}
      {children ??
        rows?.map((r, i) => (
          <div key={i} className="flex items-center gap-4px" style={{ marginTop: i ? 2 : 0 }}>
            {r.color && <SwatchMark color={r.color} shape={r.shape ?? "square"} />}
            <span className="text-secondary">{r.label}</span>
            <span
              className="text-primary ml-auto"
              style={{ paddingLeft: 12, fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-semibold)" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      {footer != null && <div className="text-tertiary" style={{ marginTop: 4 }}>{footer}</div>}
    </div>
  );
}
