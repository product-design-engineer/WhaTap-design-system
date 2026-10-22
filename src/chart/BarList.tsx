/**
 * BarList — 값 · 이름 · 가로 막대 한 줄을 여러 줄. Composite layer.
 *
 * ## Purpose
 * 서로 다른 대상(Method · SQL · HTTPS …)의 «지금 얼마나» 를 한눈에 비교한다. 숫자만 늘어놓으면 크기를 암산해야 하고,
 * 막대만 두면 정확한 값을 못 읽는다. 그래서 왼쪽에 값과 이름, 오른쪽에 같은 값의 막대를 세운다. 막대 길이는 줄마다
 * 받은 비율(`ratio`, 0~1)이다 — 분모(전체 · 최댓값 · 한계)는 화면이 정한다.
 *
 * ## When to use
 * - 대상 종류별 현재 값 비교: 액티브 스테이터스(Method · SQL · HTTPS · DBC · SOCKET), 상태별 건수.
 *
 * ## When NOT to use
 * - 시간에 따른 변화 → [[MiniBarChart]] · [[MiniMultiLineChart]].
 * - 표 안 수치 옆 막대 → [[MetricBarCell]].
 * - 사람별 사용량(막대 색 고정 brand-blue) → [[MemberUsageBar]].
 * - 한계 대비 소비량 하나 → [[UsageGauge]].
 *
 * ## Composition rules
 * - 줄은 [[BarListItem]] 이 그린다(목록 행은 컴포넌트로, patterns §26). 그래서 Composite 계층이다.
 * - 껍데기(카드 · 제목 · 메뉴)는 그리지 않는다. 대시보드 칸에서는 [[WidgetFrame]] 이 맡는다(patterns §15).
 * - `frame={false}` 면 바깥 여백(좌우 · 아래 8px)을 뺀다. WidgetFrame 안에서는 늘 `frame={false}`.
 * - 줄은 칸 높이를 똑같이 나눠 쓴다. 막대 두께는 줄 높이의 60%.
 * - 막대 색은 `--color-chart-series-N`(또는 APM 고정색). 줄마다 다른 계열이면 색이 곧 이름표라 범례를 따로 두지 않는다.
 * - 값은 숫자 서체 굵게, 이름은 `text-sm` secondary. 값 칸 폭은 고정이라 줄마다 막대 시작선이 같다.
 *
 * @example
 * ```tsx
 * <WidgetFrame title="액티브 스테이터스">
 *   <BarList frame={false} rows={[
 *     { label: "Method", value: 210, ratio: 0.88, color: "var(--color-chart-series-1)" },
 *     { label: "SQL", value: 86, ratio: 0.67, color: "var(--color-chart-series-2)" },
 *   ]} />
 * </WidgetFrame>
 * ```
 */
import BarListItem from "./BarListItem";

export type BarListRow = {
  label: string;
  value: number;
  /** 막대 길이 비율(0~1). */
  ratio: number;
  /** 막대 색 토큰. */
  color: string;
};

export type BarListProps = {
  rows: BarListRow[];
  /**
   * 자기 바깥 여백(좌우 · 아래 8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

export default function BarList({ rows, frame = true }: BarListProps) {
  return (
    <ul
      aria-label="목록"
      className="flex flex-col h-full min-h-0 w-full"
      style={{ listStyle: "none", margin: 0, padding: frame ? "0 8px 8px" : 0 }}
    >
      {rows.map((r) => (
        <BarListItem key={r.label} label={r.label} value={r.value} ratio={r.ratio} color={r.color} />
      ))}
    </ul>
  );
}
