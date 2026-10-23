/**
 * BlockGrid — 대상 하나 = 이름 있는 칸 하나를 격자로 깐 상태 맵. 이름으로 대상을 찾는다. Composite layer.
 *
 * ## Purpose
 * «어느 서버가 · 어떤 상태인가» 를 이름과 함께 한눈에. 라이브에는 같은 «상태별 칸 묶음» 이 두 모양으로 있었다 — 허니컴(이름 없이
 * 가운데로 모은 배치)과 서버 인벤토리 맵(이름 있는 3D 블록 4열 격자). 형태 · 배치 · 이름 정책이 전부 달랐다(patterns §21).
 * 여기서는 **용도로 나눈다(2026-10-23 결정)** — 많은 대상의 분포는 [[HexGrid]], 이름으로 찾는 맵은 이것. 상태 어휘 · 색 · 범례는 둘이 같다.
 *
 * ## When to use
 * - 대상 4~60개의 상태를 이름으로 찾을 때 — 서버 인벤토리 맵 · 노드 · 파드 · DB 인스턴스 상태.
 * - 칸을 눌러 그 대상의 상세로 들어갈 때 → `onSelect`.
 *
 * ## When NOT to use
 * - 이름 없이 분포만(수십~수백 대) → [[HexGrid]].
 * - 대상마다 정량 비교 → [[BarList]] · [[EqualizerChart]].
 * - 상태 개수 요약 한 줄(KPI) → 숫자 칸 · [[StatCard]]. 범례가 그 역할을 겸하지 않는다.
 *
 * ## Metrics
 * - ✅ 대상마다의 이산 상태 + 이름 — 서버 · 노드 · 파드 · DB 인스턴스의 active · idle · warning · critical, 에이전트 연결 상태
 * - ❌ 연속 값(CPU 사용률 %) 그 자체 — 상태로 판정한 뒤 칠하고 값은 툴팁 · 상세에 → 값 비교는 [[BarList]]
 * - ❌ 대상 수백 대 — 이름 칸이 화면을 넘는다 → [[HexGrid]] · [[Heatmap]](§22)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 칸 [[BlockCell]] · 단독 범례 [[ChartLegendItem]]. 차트는 격자 배치만 정한다. 그래서 Composite 계층이다.
 * - 격자 `columns`(기본 4) · 칸 사이 4px. 칸 순서 = `items` 순서 — 정렬(상태 심각도순 · 이름순)은 호출부가 정한다.
 * - 상태 색 · 범례는 [[HexGrid]] 와 같은 어휘(내부 `_statusTone`). 범례는 개수를 붙이고(`Critical 3`) **0 개인 상태도 남긴다** —
 *   범례 자리가 데이터마다 흔들리지 않게.
 * - 범례는 `blockGridLegend(items)` 를 [[WidgetFrame]] `legend` 로(`frame={false}`). 단독(`frame`)이면 격자 위 오른쪽에 스스로.
 * - 입체(3D) 블록은 그리지 않는다 — 장식이 이름 자리를 먹어 이름이 잘렸다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 격자 | `columns` 열(기본 4) · 간격 4px · 칸 높이 32 |
 * | 칸 | [[BlockCell]] — 상태 칠 · 이름 `text-sm` 말줄임 · 전체 이름 `title` |
 * | 범례 | 단독이면 격자 위 오른쪽 · 사각 견본 + `이름 개수` · 간격 12 · 0 개도 표시 |
 * | 접근성 | 격자 `role="list"` · 칸마다 「이름 · 상태」 이름 · `onSelect` 면 버튼 |
 *
 * @example
 * ```tsx
 * <WidgetFrame title="서버 인벤토리" legend={blockGridLegend(servers)}>
 *   <BlockGrid items={servers} columns={4} onSelect={(s) => openServer(s.id)} frame={false} />
 * </WidgetFrame>
 * ```
 */
import BlockCell from "./BlockCell";
import ChartLegendItem from "./ChartLegendItem";
import { statusToneLegend, type StatusTone } from "./_statusTone";

export type BlockGridItem = {
  /** 대상 식별자(키 · onSelect 인자). */
  id: string;
  /** 칸 안 이름. */
  label: string;
  /** 상태. */
  tone: StatusTone;
};

export type BlockGridProps = {
  /** 칸들 — 이 순서대로 왼쪽 위부터. 정렬은 호출부가 정한다. */
  items: ReadonlyArray<BlockGridItem>;
  /** 열 수. 기본 4. */
  columns?: number;
  /** 상태 이름 바꾸기(범례 · 접근성). 예: `{ active: "정상", idle: "비활성" }`. */
  toneLabels?: Partial<Record<StatusTone, string>>;
  /** 칸을 고를 때. 주면 칸이 버튼이 된다. */
  onSelect?: (item: BlockGridItem) => void;
  /**
   * 범례 줄을 스스로 둘지. 기본 `true`.
   * `false` 면 격자만 — [[WidgetFrame]] 안에 넣고 범례는 `blockGridLegend(items)` 를 `legend` 로(patterns §15).
   */
  frame?: boolean;
};

/** [[WidgetFrame]] `legend` 용 — 상태별 개수(0 도 남김) · 사각 견본. [[HexGrid]] `hexGridLegend` 와 같은 줄. */
export function blockGridLegend(items: ReadonlyArray<Pick<BlockGridItem, "tone">>, labels?: Partial<Record<StatusTone, string>>) {
  return statusToneLegend(items, labels);
}

export default function BlockGrid({ items, columns = 4, toneLabels, onSelect, frame = true }: BlockGridProps) {
  return (
    <div className="flex flex-col w-full min-w-0 gap-8px">
      {frame && (
        <div className="flex justify-end flex-wrap gap-12px">
          {blockGridLegend(items, toneLabels).map((l) => (
            <ChartLegendItem key={l.label} color={l.color} label={l.label} />
          ))}
        </div>
      )}
      <div role="list" className="grid w-full" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 4 }}>
        {items.map((it) => (
          <div role="listitem" key={it.id} className="min-w-0">
            <BlockCell label={it.label} tone={it.tone} toneLabel={toneLabels?.[it.tone]} onSelect={onSelect ? () => onSelect(it) : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}
