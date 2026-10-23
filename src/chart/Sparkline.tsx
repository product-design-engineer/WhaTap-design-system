/**
 * Sparkline — 축 없는 작은 선 하나. 표 셀 · 타일 안에서 «최근에 어떻게 움직였나» 의 모양만 말한다. Primitives layer.
 *
 * ## Purpose
 * 숫자 옆에 추이의 모양을 붙인다. 축 · 눈금 · 격자가 없으므로 값을 읽게 하는 것이 아니라 «오르는 중인가 · 튀었나 · 평평한가» 를
 * 한눈에 보이게 한다. 라이브 GPU 프로세스 표의 스파크라인은 셀 위 1~2px 선이라 추이가 안 보였고 0% 가 그냥 직선과 구별되지
 * 않았다(patterns §21). 그래서 높이를 정하고(기본 20) 바닥선을 깔아 «바닥에 붙은 평평함» 과 «중간에서 평평함» 을 가른다.
 *
 * ## When to use
 * - 표 행 · 타일 안에서 값 옆에 붙는 최근 추이 — [[SparklineCell]] · 추세 타일이 조합한다.
 * - 같은 열의 여러 행을 같은 높이 기준으로 견줄 때는 `max`(공유 최대)를 준다.
 *
 * ## When NOT to use
 * - 값 · 시점을 읽어야 할 때 → [[MiniLineChart]](축 · 최고점 ▼ 가 있다).
 * - 지금 값 하나의 크기 비교 → [[MetricBarCell]] · [[RangeGauge]].
 *
 * ## Composition rules
 * - 선 1.5px · 계열 색 토큰(`color`). 마지막 점에 지름 4px 점을 찍어 «지금» 을 표시한다.
 * - 바닥선 1px `--color-border-soft` 를 늘 깐다 — 0 에 붙은 선이 바닥과 겹쳐 «0» 으로 읽힌다.
 * - 세로 범위는 0 ~ `max`(없으면 이 선의 최대). 음수는 0 으로 자른다 — 부호 있는 지표는 이 마크로 그리지 않는다.
 * - 값이 하나뿐이거나 없으면 바닥선만 그린다. 장식이므로 `aria-hidden` — 값은 옆 글자가 말한다.
 * - 폭은 부모를 채운다(`width` 로 고정 가능). 높이는 `height`(기본 20, 최소 16).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 크기 | 폭 = 부모(또는 `width`) · 높이 `height` 20(최소 16) · 위아래 안쪽 2px |
 * | 선 | 1.5px · `color` · 끝 · 이음 둥글게 · `vector-effect: non-scaling-stroke` |
 * | 마지막 점 | 지름 4px · `color` |
 * | 바닥선 | 1px `--color-border-soft` |
 * | 세로 범위 | 0 ~ `max` ?? 값 최대 |
 * | 접근성 | 장식(`aria-hidden`) |
 *
 * @example
 * ```tsx
 * <Sparkline values={[12, 18, 15, 30, 42]} color="var(--color-chart-series-1)" />
 * ```
 */
export type SparklineProps = {
  /** 시간순 값(왼쪽이 과거). */
  values: ReadonlyArray<number>;
  /** 선 · 끝점 색 — 계열 색 토큰. hex 금지. */
  color?: string;
  /** 세로 최대. 같은 열 여러 행을 같은 기준으로 견줄 때 공유한다. 없으면 이 선의 최대. */
  max?: number;
  /** 높이(px). 기본 20, 최소 16. */
  height?: number;
  /** 폭(px). 없으면 부모를 채운다. */
  width?: number;
};

const PAD = 2;

export default function Sparkline({ values, color = "var(--color-chart-series-1)", max, height = 20, width }: SparklineProps) {
  const h = Math.max(16, height);
  const top = max ?? Math.max(0, ...values);
  const n = values.length;
  const y = (v: number) => (top > 0 ? PAD + (h - 2 * PAD) * (1 - Math.min(1, Math.max(0, v) / top)) : h - PAD);
  /* viewBox 가로는 0~100 으로 두고 늘린다 — 세로는 px 그대로라 선 굵기 · 점이 찌그러지지 않게 점은 HTML 로 얹는다. */
  const points = values.map((v, i) => `${n > 1 ? (i / (n - 1)) * 100 : 0},${y(v)}`).join(" ");
  const last = n > 1 ? values[n - 1] : null;
  return (
    <span aria-hidden className="relative inline-block align-middle" style={{ width: width ?? "100%", height: h }}>
      <svg className="absolute inset-0 block" width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
        <line x1="0" x2="100" y1={h - 0.5} y2={h - 0.5} stroke="var(--color-border-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {n > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {last != null && (
        <span
          className="absolute rounded-full"
          style={{ right: 0, top: y(last), width: 4, height: 4, transform: "translate(50%, -50%)", background: color }}
        />
      )}
    </span>
  );
}
