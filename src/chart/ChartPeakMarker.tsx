/**
 * ChartPeakMarker — 플롯의 최고점에 서는 값 말풍선 + ▼. Primitives layer.
 *
 * ## Purpose
 * 추이 차트에서 «가장 높았던 때가 얼마였나» 를 축을 따라 읽지 않고 그 자리에서 읽게 한다. ▼ 끝이 선의 최고점에
 * 정확히 닿아야 한다(patterns §5). 몇 px 어긋나면 사람은 어색함을 느끼지만 원인을 짚지 못한다. 그래서 좌표는
 * 차트가 계산하고, 이 부품은 받은 점에 ▼ 끝을 맞추는 일만 한다.
 *
 * ## When to use
 * - 선 · 면 · 누적면 차트에서 최고값 하나를 짚을 때 — [[MiniLineChart]] 가 이것을 쓴다.
 * - 새 추이 차트에서 최고점을 표시할 때. 차트 안에서 ▼ 와 말풍선을 다시 그리지 않는다.
 *
 * ## When NOT to use
 * - 지금 값(마지막 값) → [[WidgetFrame]] `summary` · 범례 값 · 선 끝 배지(§25). 최고값과 지금 값은 다른 말이다.
 *   선 끝 배지와 한 플롯에 함께 두지 않는다 — 어느 쪽이 지금인지 흐려진다.
 * - 막대마다 값 → [[MiniBarChart]] `valueLabels` · `peak`(막대 위 값 글자, ▼ 없음).
 * - 임계 · 판정 표시 — 최고점이 아니라 판정이다.
 *
 * ## Composition rules
 * - 차트의 HTML 덧그림 겹(플롯과 **같은 좌표계**) 안에 absolute 로 둔다. `left` · `top` 은 최고점의 픽셀 좌표 —
 *   선을 그린 SVG 와 같은 식으로 계산해 넘긴다(§5). 부품이 ▼ 끝을 그 점에 맞춘다(`translate(-50%, -100%)`).
 * - 말풍선에 카드 바탕을 깐다. 최고점이 플롯 왼쪽 위에 가까우면 Y축 눈금과 겹쳐 「10082%」 처럼 한 덩어리로 읽힌다.
 * - 글자는 text 토큰(`text-primary` 굵게 · 숫자 서체). 계열 색은 ▼ 에만 쓴다(§17).
 * - 값은 호출하는 쪽이 포맷해서 넘긴다. 같은 규칙이 필요하면 차트 내부 `formatPeakValue` 를 쓴다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 말풍선 | `text-xs`(10px) 굵게 · `--font-family-numeric` · `text-primary` · 바탕 `--color-card` · 반경 2px · 안쪽 여백 1px 3px |
 * | ▼ | 8 × 5px 삼각형, 채움 = `color`(계열 색 토큰). 말풍선과 사이 1px |
 * | 기준점 | ▼ 아래 끝 = (`left`, `top`) |
 * | 접근성 | 값 글자는 읽힌다. ▼ 는 장식(`aria-hidden`) |
 *
 * @example
 * ```tsx
 * <ChartPeakMarker label="22.06s" color="var(--color-chart-series-1)" left="calc(28px + 40%)" top={32} />
 * ```
 */
export type ChartPeakMarkerProps = {
  /** 말풍선 글자 — 값 + 단위(「22.06s」). 호출하는 쪽이 포맷한다. */
  label: string;
  /** ▼ 색. 그 선의 계열 색 토큰(`var(--color-chart-series-N)`). hex 금지. */
  color: string;
  /** 최고점 x — 플롯 상자 기준 CSS 길이. 선을 그린 SVG 와 같은 식으로 계산한다(§5). */
  left: string | number;
  /** 최고점 y — 플롯 상자 기준 CSS 길이. */
  top: string | number;
};

export default function ChartPeakMarker({ label, color, left, top }: ChartPeakMarkerProps) {
  return (
    <div className="absolute flex flex-col items-center pointer-events-none" style={{ left, top, transform: "translate(-50%, -100%)" }}>
      <span
        className="text-xs font-bold text-primary whitespace-nowrap bg-card rounded-2px"
        style={{ fontFamily: "var(--font-family-numeric)", padding: "1px 3px" }}
      >
        {label}
      </span>
      <svg width="8" height="5" viewBox="0 0 8 5" className="mt-1px block" aria-hidden="true">
        <path d="M0 0h8L4 5z" fill={color} />
      </svg>
    </div>
  );
}
