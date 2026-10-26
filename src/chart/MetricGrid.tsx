/**
 * MetricGrid — 같은 대상의 관련 집계 값 여럿을 세로 구분선으로 나눈 숫자 칸 줄. 한 줄 4칸까지, 넘으면 줄바꿈. Composite layer.
 *
 * ## Purpose
 * «가용 6 · 희망 6 · 불가용 0» 처럼 한 대상의 숫자 몇 개를 한눈에. 라이브 K8S pod 수는 값 3개짜리 그리드가 위젯 폭에 안 들어가 열 제목이
 * 두 줄로 꺾이고 셋째 열이 잘렸다(가로 스크롤). GPU KPI 카드는 주값 · 퍼센트 · 보조 · 하위 분해 네 겹이 한 카드에 있어 읽는 순서가 없었다
 * (patterns §21). 여기서는 **한 줄 4칸까지 · 넘으면 줄바꿈 · 칸 이름 한 줄 말줄임**, 칸은 **값 · 단위 · 보조 한 줄까지 세 겹**으로 정한다.
 *
 * ## When to use
 * - 같은 대상의 관련 집계 값 2~8개 — pod 수(가용 · 희망 · 불가용) · 전력(최근 1시간 · 오늘 누적 · 어제 동시각) · GPU 수(전체 · 할당 · 유휴).
 * - 차트 위 요약 줄 · 숫자만으로 충분한 칸.
 *
 * ## When NOT to use
 * - 지금 값 + 비교 변화 + 추이 → [[TrendTile]].
 * - 범위 안 위치(Request 대비) → [[RangeGauge]] 를 이 줄 아래에(화면이 조합한다).
 * - 숫자 하나가 칸의 주인 → [[KpiCard]] · [[StatCard]].
 * - 하위 분해(구성) → [[SegmentBar]] · [[BarList]]. 칸 안에 넣지 않는다(네 겹 금지).
 *
 * ## Metrics
 * - ✅ 한 대상의 관련 집계 값 몇 개 — pod 수(가용 · 희망 · 불가용) · 전력 kWh(최근 1시간 · 오늘 누적 · 어제 동시각) · GPU 수(전체 · 할당 · 유휴) · 이벤트 건수(위험 · 경고 · 정보)
 * - ❌ 단위가 서로 다른 값을 한 줄에 비교하듯 나란히(TPS 옆 응답시간 옆 CPU %) — 크기를 견주게 만든다. 칸마다 단위를 쓰거나 [[TrendTile]] 줄로
 * - ❌ 시간 흐름 → 선 · 막대 차트
 *
 * ## Color
 * - 역할: 색 없음 — 값 글자 `--color-text-primary` 하나
 * - 고정: 칸 구분선 `--color-border-soft`
 * - 금지: 칸 하나만 색으로 강조하지 않는다 — 상태는 보조 줄 낱말로(§17 · §23)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 칸마다 [[MetricStat]](이름 · 값 · 단위 · 보조). 줄 배치 · 구분선만 그린다. 그래서 Composite 계층이다.
 * - **한 줄 최대 4칸(`maxColumns`), 넘으면 다음 줄 — 가로 스크롤 금지(2026-10-23 결정).** 칸 폭은 균등, 칸 이름은 한 줄 말줄임(전체는 `title`).
 * - **칸은 세 겹까지(2026-10-23 결정)** — 이름 · 값 + 단위 · 보조 한 줄(`caption`). 하위 분해를 칸 안에 넣지 않는다.
 * - 값 글자 색은 primary 하나 — 칸 하나만 색으로 강조하지 않는다(색은 계열 · 상태의 것, §17 · §23). 상태를 말하려면 보조 줄에 낱말로.
 * - 칸 사이 1px `--color-border-soft` 세로 구분선(줄 첫 칸 제외).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 줄 | `min(개수, maxColumns)` 열 균등 · 줄 간격 12 |
 * | 칸 | [[MetricStat]] 폭 auto · 왼쪽 안쪽 12(첫 칸 0) · 구분선 1px `--color-border-soft` |
 * | 값 | `compact` 면 `text-lg`, 아니면 `text-2xl` · medium · primary · 숫자 서체 |
 * | 이름 | `text-sm` tertiary · 한 줄 말줄임 |
 * | 보조 | `text-sm` secondary · 한 줄 말줄임 |
 * | 접근성 | `role="list"` · 칸마다 「이름 값 단위」 |
 *
 * @example
 * ```tsx
 * <MetricGrid items={[{ label: "Available Pods", value: 6 }, { label: "Desired Pods", value: 6 }, { label: "Unavailable Pods", value: 0 }]} />
 * ```
 */
import type { ReactNode } from "react";
import MetricStat from "../MetricStat";

export type MetricGridItem = {
  /** 칸 이름 — 한 줄 말줄임. */
  label: string;
  /** 값. */
  value: ReactNode;
  /** 값 뒤 단위. */
  unit?: string;
  /** 보조 한 줄(기간 · 기준 · 상태 낱말). */
  caption?: string;
};

export type MetricGridProps = {
  /** 칸들. */
  items: ReadonlyArray<MetricGridItem>;
  /** 한 줄 최대 칸 수. 기본 4. 넘으면 다음 줄. */
  maxColumns?: number;
  /** 작은 숫자(`text-lg`) — 좁은 칸. */
  compact?: boolean;
};

export default function MetricGrid({ items, maxColumns = 4, compact = false }: MetricGridProps) {
  const cols = Math.max(1, Math.min(items.length, maxColumns));
  return (
    <div role="list" className="grid w-full min-w-0" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, rowGap: 12 }}>
      {items.map((it, i) => {
        const first = i % cols === 0;
        return (
          <div
            key={`${it.label}-${i}`}
            role="listitem"
            aria-label={`${it.label} ${typeof it.value === "string" || typeof it.value === "number" ? it.value : ""}${it.unit ?? ""}`}
            className="min-w-0"
            title={it.label}
            style={{ paddingLeft: first ? 0 : 12, borderLeft: first ? undefined : "1px solid var(--color-border-soft)" }}
          >
            <MetricStat label={it.label} value={it.value} unit={it.unit} caption={it.caption} compact={compact} width="auto" truncateLabel />
          </div>
        );
      })}
    </div>
  );
}
