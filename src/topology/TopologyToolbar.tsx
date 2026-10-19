import TextField from "../TextField";
import Select from "../Select";
import Switch from "../Switch";
import Button from "../Button";

/** 흐름 방향 — 들어오는 트래픽만 볼지, 나가는 트래픽만 볼지. */
export type TopologyDirection = "in" | "out";

/**
 * TopologyToolbar — Composite. 캔버스 위에 얹는 조회 조건 바.
 *
 * ## Purpose
 * 레퍼런스 툴바를 그대로 구성한다 — 빠른 검색 · 편집 토글 · 지표 선택 · 방향(In/Out) · 초기화.
 * 캔버스가 무엇을 어떻게 보여줄지를 정하는 컨트롤을 한 줄에 모은다.
 *
 * ## When to use
 * - [[TopologyCanvas]] 를 쓰는 화면의 조회 조건 영역.
 * - 캔버스가 무엇을 보여줄지(지표 · 호출 방향 In/Out · 검색어)를 바꾸고, 조건을 처음으로 되돌려야(`onReset`) 할 때.
 *
 * ## When NOT to use
 * - 목록/표의 필터 → [[FilterBar]] (칩 기반 다중 필터).
 * - 페이지 전역 기간·프로젝트 선택 → [[OptionbarPage]].
 *
 * ## Composition rules
 * - **Primitives 만 조합한다** — TextField·Select·Switch·Button. Composite 끼리 import 금지.
 * - 모든 값이 controlled — 툴바는 상태를 갖지 않는다. 조회 조건의 주인은 페이지다.
 * - **편집은 즉시 반영 설정이라 [[Switch]]** (Checkbox 아님) — DS 컴포넌트 선택 가이드.
 * - 색은 각 프리미티브가 소유한다. 툴바는 배치만 한다.
 *
 * @example
 * ```tsx
 * <TopologyToolbar
 *   query={q} onQueryChange={setQ}
 *   editing={editing} onEditingChange={setEditing}
 *   metric={metric} onMetricChange={setMetric}
 *   direction={dir} onDirectionChange={setDir}
 *   onReset={reset}
 * />
 * ```
 */
export default function TopologyToolbar({
  query,
  onQueryChange,
  editing,
  onEditingChange,
  metric,
  onMetricChange,
  metricOptions,
  direction,
  onDirectionChange,
  onReset,
}: {
  query: string;
  onQueryChange: (next: string) => void;
  /** 편집 모드 — 즉시 반영되는 설정이라 Switch. */
  editing: boolean;
  onEditingChange: (next: boolean) => void;
  metric: string;
  onMetricChange: (next: string) => void;
  metricOptions: { value: string; label: string }[];
  direction: TopologyDirection;
  onDirectionChange: (next: TopologyDirection) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-8px">
      <TextField
        value={query}
        onChange={onQueryChange}
        placeholder="빠른 검색"
        clearable
        aria-label="빠른 검색"
      />
      <div className="flex items-center gap-8px h-32px px-12px bg-card rounded-lg">
        <Switch
          size="sm"
          checked={editing}
          onChange={onEditingChange}
          aria-label="편집 모드"
        />
        <span className="text-md text-secondary leading-none">편집</span>
      </div>
      <Select
        options={metricOptions}
        value={metric}
        onChange={onMetricChange}
        aria-label="지표"
      />
      <div className="flex items-center gap-4px h-32px px-4px bg-card rounded-lg">
        {(["in", "out"] as const).map((d) => (
          <Button
            key={d}
            size="sm"
            variant={direction === d ? "contained" : "basic"}
            onClick={() => onDirectionChange(d)}
          >
            {d === "in" ? "In" : "Out"}
          </Button>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={onReset}>
        초기화
      </Button>
    </div>
  );
}
