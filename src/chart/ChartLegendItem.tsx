/**
 * ChartLegendItem — 범례 항목 하나: 마크 모양 견본 + 계열 이름 + (선택) 값. Primitives layer.
 *
 * ## Purpose
 * 범례 줄은 카드마다 같은 모양이어야 «이 색 = 이 계열» 이 칸을 건너도 같은 방식으로 읽힌다. 종전엔 견본 + 이름을
 * 차트마다 따로 짰다 — [[WidgetFrame]] · [[MiniDonutChart]] · [[MiniMultiLineChart]] · [[HexGrid]] · [[ActiveTransactionArc]]
 * 다섯 곳에서 간격(3 · 4 · 6px) · 글자 크기(9 · 11px) · 글자 색(primary · secondary · tertiary)이 갈려 있었다(patterns §26).
 *
 * ## When to use
 * - [[WidgetFrame]] `legend` 의 각 항목(가로 줄).
 * - 차트가 자기 안에 그리는 범례 — 도넛 옆 세로 목록(`fill` 로 값을 오른쪽 끝에), 상태 맵 · 속도 구분 범례.
 *
 * ## When NOT to use
 * - 이름 없이 색만 짝지을 때 → [[ChartSwatch]].
 * - 순차 · 강도 색 범례 바 → [[HeatmapLegend]].
 * - 상태 낱말 표지 → [[Chip]]. 범례 항목은 차트 마크의 짝이다.
 *
 * ## Composition rules
 * - 견본은 [[ChartSwatch]] 와 같은 그림(내부 `_swatch`) — 모양은 마크를 따른다(선 = `line`, 점 · 버블 = `dot`, 그 밖 = `square`).
 * - 견본 · 이름 · 값 사이 4px. 이름 `text-sm` · secondary, 값 `text-sm` · 굵게(semibold) · primary · 숫자 서체 — 값이 이름보다 먼저 읽힌다(patterns §25).
 * - 가로 줄에서는 줄바꿈 없이(`nowrap`) 서고, 줄 간격(12px)은 범례 줄이 정한다.
 * - `fill` 이면 폭을 채우고 이름이 말줄임되며 값은 오른쪽 끝에 붙는다 — 세로 목록에서 값의 자릿수가 세로로 맞는다.
 * - 색은 마크와 같은 토큰. hex 금지.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 견본 | [[ChartSwatch]] 와 같음(8×8 사각 · 8×2 선 · 8px 원) |
 * | 간격 | 견본 ↔ 이름 ↔ 값 4px |
 * | 이름 | `text-sm` · `text-secondary` · regular |
 * | 값 | `text-sm` · `text-primary` · semibold · 숫자 서체 |
 * | `fill` | 폭 100% · 이름 말줄임 · 값 오른쪽 끝(margin-left auto) |
 *
 * @example
 * ```tsx
 * <ChartLegendItem color="var(--color-chart-series-1)" shape="line" label="p95" />
 * <ChartLegendItem color="var(--color-chart-series-2)" label="Linux" value="42%" fill />
 * ```
 */
import type { ReactNode } from "react";
import { SwatchMark, type ChartSwatchShape } from "./_swatch";

export type ChartLegendItemProps = {
  /** 마크와 같은 색 토큰. hex 금지. */
  color: string;
  /** 마크 모양. 선 계열 `line`, 점 · 버블 `dot`, 그 밖 `square`. 기본 `square`. */
  shape?: ChartSwatchShape;
  /** 계열 이름. */
  label: string;
  /** 이름 옆 값(선택). */
  value?: ReactNode;
  /** 폭을 채우고 값을 오른쪽 끝에 — 세로 목록용. 기본 false(가로 줄). */
  fill?: boolean;
};

export default function ChartLegendItem({ color, shape = "square", label, value, fill = false }: ChartLegendItemProps) {
  return (
    <span className={`flex items-center gap-4px text-sm ${fill ? "w-full min-w-0" : "whitespace-nowrap"}`}>
      <SwatchMark color={color} shape={shape} />
      <span className={`text-secondary ${fill ? "truncate min-w-0" : ""}`} title={fill ? label : undefined}>
        {label}
      </span>
      {value != null && (
        <span
          className={`text-primary ${fill ? "ml-auto shrink-0" : ""}`}
          style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-semibold)" }}
        >
          {value}
        </span>
      )}
    </span>
  );
}
