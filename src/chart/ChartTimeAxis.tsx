import { AXIS_GUTTER } from "./_axisScale";

/**
 * ChartTimeAxis — 플롯 아래 X축 시간 글자. 양 끝은 안쪽으로 붙이고 사이는 가운데. Primitives layer.
 *
 * ## Purpose
 * 시계열 차트의 X축 글자를 한 곳이 놓는다. 같은 규칙(비율 위치 · 첫 글자 왼쪽 정렬 · 끝 글자 오른쪽 정렬 · 사이 가운데 ·
 * 바닥에서 2px)이 선 · 막대 · 예측 · Apdex 차트에 5벌로 복제돼 있었다(patterns §26). 양 끝을 가운데 정렬하면 첫 글자가
 * Y축 눈금 칸을 침범하고 끝 글자가 칸 밖으로 잘린다.
 *
 * ## When to use
 * - 시간이 X축인 직교 좌표 차트의 플롯 아래 — [[ChartGrid]] · [[ChartValueAxis]] 와 같은 플롯 상자 안에.
 * - 눈금이 같은 간격이면 `labels` 만, 도메인 좌표에 놓아야 하면(예측 차트의 «지금») `positions` 를 함께 준다.
 *
 * ## When NOT to use
 * - 범주축(서버 TOP-N) → [[MiniBarChart]] `categories` — 막대마다 그 막대 바로 아래 가운데, 칸 폭에서 말줄임. 규칙이 다르다.
 * - [[ScatterHeatmap]] 의 눈금 꼭지 + 양쪽 16px 안 균등 배치 — 아직 다른 규칙이다(§26 기록).
 * - 시간 범위 자체(「최근 5분」) — 옵션바가 한 번 말한다(§15). 축 글자는 눈금만.
 *
 * ## Composition rules
 * - `position: relative` 이고 높이가 정해진 플롯 상자 안에 둔다. 가로는 `--wds-widget-axis-gutter` 부터 `right` 까지를
 *   0 ~ 1 로 본다 — [[ChartGrid]] · [[ChartValueAxis]] 와 같은 `right` 를 준다.
 * - 글자는 플롯 아래 여백(`padBottom` 14) 안 바닥에서 2px. `text-chart`(9px) · 숫자 서체 · `text-tertiary`(§15).
 * - 위치 0 이하는 왼쪽 정렬, 1 이상은 오른쪽 정렬, 사이는 가운데 — 글자가 플롯 가로 범위를 벗어나지 않는다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 글자 | `text-chart` 9px · `--font-family-numeric` · `text-tertiary` · 줄바꿈 없음 |
 * | 세로 | 플롯 상자 바닥에서 2px(`bottom: 2`) |
 * | 가로 | `--wds-widget-axis-gutter` + (상자 폭 − 축 칸 − `right`) × 위치 |
 * | 정렬 | 위치 ≤ 0 왼쪽 · ≥ 1 오른쪽 · 사이 가운데 |
 * | 위치 기본 | `labels` 를 같은 간격(첫 0, 끝 1). 글자가 하나면 0 |
 *
 * @example
 * ```tsx
 * <ChartTimeAxis labels={["13:27", "13:30", "13:33", "13:36"]} />
 * <ChartTimeAxis labels={["-6h", "지금", "+24h"]} positions={[0, 0.2, 1]} />
 * ```
 */
export type ChartTimeAxisProps = {
  /** 눈금 글자(「13:27」). */
  labels: string[];
  /** 글자마다 플롯 가로 위치(0 ~ 1). 없으면 같은 간격. 길이는 `labels` 와 같게. */
  positions?: number[];
  /** 플롯 오른쪽 끝(px 또는 CSS 길이). [[ChartGrid]] · [[ChartValueAxis]] 와 같게. 기본 8. */
  right?: number | string;
  /** 플롯 왼쪽 끝(CSS 길이). 기본 Y축 칸 `--wds-widget-axis-gutter` — Y축이 없는 차트(이름 칸 · 레인)는 그 폭을 준다. */
  left?: number | string;
};

export default function ChartTimeAxis({ labels, positions, right = 8, left = AXIS_GUTTER }: ChartTimeAxisProps) {
  const rightLen = typeof right === "number" ? `${right}px` : right;
  const leftLen = typeof left === "number" ? `${left}px` : left;
  return (
    <>
      {labels.map((label, i) => {
        const ratio = positions ? positions[i] : labels.length > 1 ? i / (labels.length - 1) : 0;
        return (
          <span
            key={i}
            className="absolute text-chart text-tertiary leading-none whitespace-nowrap pointer-events-none"
            style={{
              fontFamily: "var(--font-family-numeric)",
              left: `calc(${leftLen} + (100% - ${leftLen} - ${rightLen}) * ${ratio})`,
              bottom: 2,
              transform: ratio <= 0 ? "translateX(0)" : ratio >= 1 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {label}
          </span>
        );
      })}
    </>
  );
}
