/**
 * UsageChart — 시간대별 GPU 사용률 막대 차트 카드. Composite layer.
 *
 * ## Purpose
 * 24개 시간 슬롯(0–23시)의 사용률(%)을 막대로 표시하는 미니 차트. `highlightThreshold`
 * 이상인 막대는 짙은 색으로 강조하고, `null` 슬롯은 데이터 없음(칸 전체 옅은 면)으로 표현. 진입 시
 * 각 막대가 하단에서 순차 성장(35ms 스태거)하는 애니메이션. 흰 카드 chrome 자체 보유.
 *
 * ## When to use
 * - 하루(24시간) 사용률의 시간대별 패턴/피크를 한눈에 보여줄 때.
 * - 임계값을 넘는 구간을 색으로 강조해 부하 집중 시간대를 알릴 때.
 *
 * ## When NOT to use
 * - 행 단위 통계/분류 표 → [[ClassificationTable]].
 * - 비용 비교/분해 → [[CostTable]] · [[CostBreakdown]].
 * - 24슬롯이 아닌 임의 시계열/다계열 차트 → 전용 차트 컴포넌트 검토.
 *
 * ## Metrics
 * - ✅ 하루 24시간 시간대별 사용률(%) — 상한 100 이 정해진 비율 · 임계 강조(GPU · CPU · 라이선스 사용률)
 * - ❌ 상한이 없는 값(TPS · 건수) — 임계 강조와 높이의 뜻이 사라진다 → [[MiniBarChart]]
 * - ❌ 24칸이 아닌 구간(분 · 일) → [[MiniBarChart]] · [[Heatmap]]
 *
 * ## Composition rules
 * - 요소를 조합한다 — 캡션 [[AiCaption]] · 막대 [[ChartBar]](칸마다 하나). 차트 안에서 막대를 다시 그리지 않는다(patterns §26).
 *   그래서 Composite 계층이다.
 * - 자체 카드 chrome(흰 배경/보더/라운드/패딩)을 보유 — [[AiCard]] 로 감싸지 않음.
 * - `values` 는 0~100 또는 `null`(데이터 없음) 배열. 통상 길이 24.
 * - 막대 색은 크기 스케일 토큰 — 임계 미만 `--color-chart-seq-2`, 이상 `--color-chart-seq-4`(§17 크기).
 *   데이터 없음은 [[ChartBar]] 가 `--color-surface-100` 칸 전체로 비운다 — 0 과 «모름» 을 가른다.
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms)이며 막대 스태거의 기준점.
 *
 * @example
 * ```tsx
 * <UsageChart
 *   caption="Hourly GPU Utilization"
 *   values={[12, 18, 9, null, 44, 61, 73, 88, 95, 82, ...]}
 *   highlightThreshold={50}
 * />
 * ```
 */
import ChartBar from "../chart/ChartBar";
import { AiCaption } from "./_primitives";

export default function UsageChart({
  caption = "Hourly GPU Utilization",
  values,
  highlightThreshold = 50,
  delay = 0,
}: {
  caption?: string;
  /** 24개 hourly 사용률 (0~100). null이면 데이터 없음 */
  values: (number | null)[];
  /** 이 값 이상이면 짙은 색 강조 */
  highlightThreshold?: number;
  delay?: number;
}) {
  const HEIGHT = 96;
  return (
    <div
      className="ai-anim-in flex flex-col gap-8px w-full bg-card border border-color-var-color-border-default rounded-8px p-12px"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <AiCaption>{caption}</AiCaption>
        <span
          className="text-xs text-disabled tracking-default"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          0–23시
        </span>
      </div>
      <div className="flex items-end gap-2px w-full" style={{ height: HEIGHT }}>
        {values.map((v, i) => (
          <ChartBar
            key={i}
            ratio={v === null ? null : v / 100}
            color={(v ?? 0) >= highlightThreshold ? "var(--color-chart-seq-4)" : "var(--color-chart-seq-2)"}
            title={v === null ? `${i}시 · 데이터 없음` : `${i}시 · ${v.toFixed(1)}%`}
            delay={delay + 100 + i * 35}
          />
        ))}
      </div>
    </div>
  );
}
