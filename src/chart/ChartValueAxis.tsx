import type { CSSProperties } from "react";
import { AXIS_GUTTER, axisTicks, formatAxisValue, plotY } from "./_axisScale";

/**
 * ChartValueAxis — 플롯의 축선(X 바닥 · Y 세로)과 Y축 눈금 글자. Primitives layer.
 *
 * ## Purpose
 * 값축 차트가 «얼마인가» 를 읽게 하는 눈금 셋(최대 · 절반 · 0)과 단위, 플롯의 경계선을 한 곳이 그린다.
 * 차트마다 눈금 계산 · 글자 · 축선을 따로 두던 시절 4벌이 있었다(patterns §26). 한 벌을 고치면 나머지와
 * 어긋나고, 한 줄에 놓인 위젯들의 Y축 선과 글자가 칸마다 달라진다(§15).
 *
 * ## When to use
 * - 값축(Y)이 있는 직교 좌표 차트의 플롯 — [[ChartGrid]] 와 짝으로 쓴다. 같은 `max` · 여백을 준다.
 * - 새 차트를 만들 때 눈금 · 축선을 직접 그리지 않고 이것을 놓는다.
 *
 * ## When NOT to use
 * - 값축이 없는 차트(도넛 · 아크 · 헥사 · 히트맵) — 읽을 눈금이 없다.
 * - 오른쪽 두 번째 Y축 — 이중 축은 금지다(§19). 스케일이 다르면 차트를 둘로 나눈다.
 * - X축 시간 · 범주 글자 — 차트마다 놓는 규칙(양 끝 정렬 · 칸 가운데)이 달라 차트가 그린다.
 *
 * ## Composition rules
 * - **마크 다음(위)** 에 그린다. 바닥선이 막대 · 면에 묻히지 않게.
 * - `position: relative` 이고 높이가 정해진 플롯 상자 안에 둔다. [[ChartGrid]] 와 같은 `max` · `padTop` ·
 *   `padBottom` · `right` 를 줘야 눈금 글자와 점선이 같은 높이에 선다.
 * - 축 제목은 그리지 않는다. 단위는 눈금 접미사(`unit`)가 맡는다(§26 결정).
 * - 글자는 `text-chart`(9px) · 숫자 서체 · `text-tertiary`, 눈금 칸 안 오른쪽 정렬(§15). 계열 색을 쓰지 않는다(§17).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 축선 | 1px `--color-border-divider` — X 는 플롯 바닥 안쪽 마지막 1px, Y 는 눈금 칸 오른쪽 끝 |
 * | 눈금 글자 | `text-chart` 9px · `--font-family-numeric` · `text-tertiary` · 오른쪽 정렬 · 오른쪽 안쪽 여백 4px · 세로 가운데 = 눈금 |
 * | 눈금 칸 | `--wds-widget-axis-gutter`(28px) |
 * | 숫자 | 1000 이상 `1.2K`, 그 아래 정수 반올림 + `unit` |
 * | 접근성 | 축선은 장식(`aria-hidden`). 눈금 글자는 읽힌다 |
 *
 * @example
 * ```tsx
 * <div className="relative" style={{ height: 120 }}>
 *   <ChartGrid max={100} />
 *   {marks}
 *   <ChartValueAxis max={100} unit="%" />
 * </div>
 * ```
 */
export type ChartValueAxisProps = {
  /** 값축 최대(이미 보기 좋은 값으로 올린 것). 0 이면 바닥 눈금 「0」 하나만. */
  max: number;
  /** 눈금 글자 뒤 단위(「%」 「ms」). 축 제목 대신 단위를 말한다. */
  unit?: string;
  /** 플롯 위 여백(px). [[ChartGrid]] 와 같게. 기본 4. */
  padTop?: number;
  /** 플롯 아래 여백(px). [[ChartGrid]] 와 같게. 기본 14. */
  padBottom?: number;
  /** 플롯 오른쪽 끝(px 또는 CSS 길이). X 바닥선이 여기서 끝난다. 기본 8. */
  right?: number | string;
};

export default function ChartValueAxis({ max, unit = "", padTop = 4, padBottom = 14, right = 8 }: ChartValueAxisProps) {
  return (
    <>
      <div aria-hidden className="absolute bg-color-var-color-border-divider" style={{ left: AXIS_GUTTER, right, bottom: padBottom, height: 1 }} />
      <div aria-hidden className="absolute bg-color-var-color-border-divider" style={{ left: AXIS_GUTTER, top: padTop, bottom: padBottom, width: 1 }} />
      {axisTicks(max).map((ratio) => (
        <span
          key={ratio}
          className="absolute text-chart text-tertiary leading-none pointer-events-none"
          style={
            {
              fontFamily: "var(--font-family-numeric)",
              top: plotY(padTop, padBottom, 1 - ratio),
              transform: "translateY(-50%)",
              left: 0,
              textAlign: "right",
              paddingRight: 4,
              width: AXIS_GUTTER,
            } as CSSProperties
          }
        >
          {formatAxisValue(max * ratio) + unit}
        </span>
      ))}
    </>
  );
}
