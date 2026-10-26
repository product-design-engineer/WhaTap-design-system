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
 * ## Metrics
 * - ✅ 대상 종류별 지금 값 비교 — 액티브 스테이터스(Method · SQL · HTTPC · DBC · SOCKET) · CPU TOP-N 서버 · 에러 유형별 건수
 * - ✅ 대상이 6개 이상이거나 이름이 길어 세로 막대에서 잘릴 때
 * - ❌ 시간에 따른 변화 → [[MiniLineChart]] · [[MiniBarChart]]
 * - ❌ 합 100% 구성의 몫만 말할 때 → [[MiniDonutChart]](BarList 는 크기 비교다)
 *
 * ## Color
 * - 역할: 계열(엔티티) — 줄마다 `--color-chart-series-N`(엔티티 슬롯 §21) 또는 한 색. 색이 이름표면 범례를 따로 두지 않는다
 * - 상한: 계열 슬롯 8(§22) — 줄이 더 많으면 한 색으로 칠하고 이름 글자가 말한다
 * - 금지: 상태색(Severity)을 계열로 쓰지 않는다(§23)
 *
 * ## States
 * - 빈: `rows=[]` 면 빈 목록 — 빈 상태 글은 그리지 않는다 — [[WidgetFrame]] `state`(no-data) 를 쓴다
 * - 빠짐: `null` 을 받지 않는다(타입이 숫자) — 수집 공백은 호출부가 거르거나 `state` 로
 * - 0: 막대가 사라지고 값 글자만 남는다
 * - 넘침: `ratio` 는 0~1 로 자른다 · 값 글자는 받은 그대로
 *
 * ## Limits
 * - 개수: 강제 없음 — 줄이 많으면 얇아진다. 색 이름표는 8줄까지(§22)
 * - 크기: 값 칸 88 · 막대 높이 = 줄의 60%(최소 4)
 * - 라벨: 이름은 88 칸에서 말줄임 · 전체는 툴팁 · 같은 이름 두 줄 금지(키가 겹친다)
 *
 * ## Composition rules
 * - 줄을 가리키면 그 줄만 남기고 나머지를 흐리며(0.32), [[ChartTooltip]] 이 전체 이름 · 값을 보인다(patterns §26 «강조»).
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
import { useState } from "react";
import BarListItem from "./BarListItem";
import ChartTooltip from "./ChartTooltip";

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
  /* 가리킨 줄 — 나머지를 흐리고 [[ChartTooltip]] 으로 전체 이름 · 값(이름은 줄에서 잘릴 수 있다) */
  const [hover, setHover] = useState<number | null>(null);
  const h = hover != null ? rows[hover] : null;
  return (
    <ul
      aria-label="목록"
      className="relative flex flex-col h-full min-h-0 w-full"
      style={{ listStyle: "none", margin: 0, padding: frame ? "0 8px 8px" : 0 }}
    >
      {rows.map((r, i) => (
        <BarListItem
          key={r.label}
          label={r.label}
          value={r.value}
          ratio={r.ratio}
          color={r.color}
          onHover={(on) => setHover(on ? i : null)}
          dimmed={hover != null && hover !== i}
        />
      ))}
      {h && hover != null && (
        <ChartTooltip
          left={`calc(96px + (100% - 96px) * ${Math.max(0, Math.min(1, h.ratio))})`}
          top={`${((hover + 0.5) / rows.length) * 100}%`}
          flipX={h.ratio > 0.6}
          flipY={(hover + 0.5) / rows.length > 0.5}
          rows={[{ label: h.label, value: h.value.toLocaleString("en-US"), color: h.color }]}
        />
      )}
    </ul>
  );
}
