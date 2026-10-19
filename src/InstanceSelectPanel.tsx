/**
 * InstanceSelectPanel — 인스턴스를 골라내는 드롭다운 패널. Composite layer.
 *
 * ## Purpose
 * [[OptionbarInstanceSelector]] 가 여는 목록의 내용물. 범위 탭(전체·클러스터) + 검색 +
 * 전체 개수 + 비활성 포함 여부 + 목록([[InstanceListItem]]) 을 한 패널에 묶는다.
 * 인스턴스가 늘어나면 "찾기" 가 "고르기" 보다 먼저 필요해지는데, 그 순서를 위에서 아래로 세운다.
 *
 * ## When to use
 * - 인스턴스 선택 트리거를 눌렀을 때 뜨는 패널.
 * - 인스턴스가 많아 이름 검색 · 클러스터 범위 · 비활성 포함 여부로 좁혀야 고를 수 있을 때.
 *
 * ## When NOT to use
 * - 다중 선택 필터 → [[FilterDropdown]].
 * - 트리거 자체 → [[OptionbarInstanceSelector]].
 *
 * ## Composition rules
 * - 검색·탭·토글은 패널이 상태를 들지 않고 전부 controlled — 필터 결과를 부모가 알아야
 *   "전체 N" 과 목록이 어긋나지 않는다.
 * - `items` 는 이미 필터링된 목록이 아니라 원본을 준다. 검색어·비활성 포함 판정은 패널이 한다.
 * - 비활성 인스턴스는 기본으로 숨긴다 — 살아있는 대상이 목록의 기본값이다.
 * - 패널은 자기 위치를 정하지 않는다(absolute 배치는 호출측). 폭과 그림자만 소유한다.
 *
 * @example
 * ```tsx
 * <InstanceSelectPanel
 *   items={instances}
 *   selected="dmx-rac19-1"
 *   onSelect={setInstance}
 *   scope={scope} onScopeChange={setScope}
 *   query={q} onQueryChange={setQ}
 *   showIdle={showIdle} onShowIdleChange={setShowIdle}
 * />
 * ```
 */
import InstanceListItem, { type InstanceListItemStatus } from "./InstanceListItem";
import Switch from "./Switch";
import Tabs from "./Tabs";
import TextField from "./TextField";
import { IcSearch } from "./icons/SearchIcon";

export type InstanceSelectScope = "all" | "cluster";

export type InstanceSelectItem = {
  name: string;
  status?: InstanceListItemStatus;
  cluster?: boolean;
};

export type InstanceSelectPanelProps = {
  /** 원본 목록 — 검색·비활성 필터는 패널이 건다. */
  items: InstanceSelectItem[];
  /** 선택된 인스턴스 이름. */
  selected?: string;
  onSelect?: (name: string) => void;
  scope?: InstanceSelectScope;
  onScopeChange?: (next: InstanceSelectScope) => void;
  query?: string;
  onQueryChange?: (next: string) => void;
  /** 비활성 인스턴스 표시 여부. */
  showIdle?: boolean;
  onShowIdleChange?: (next: boolean) => void;
  /** 패널 폭(px). 기본 340. */
  width?: number;
};

export default function InstanceSelectPanel({
  items,
  selected,
  onSelect,
  scope = "all",
  onScopeChange,
  query = "",
  onQueryChange,
  showIdle = false,
  onShowIdleChange,
  width = 340,
}: InstanceSelectPanelProps) {
  const q = query.trim().toLowerCase();
  const visible = items.filter((it) => {
    if (scope === "cluster" && !it.cluster) return false;
    if (!showIdle && it.status === "idle") return false;
    if (q && !it.name.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div
      className="flex flex-col bg-card rounded-2px"
      style={{
        width,
        border: "1px solid var(--color-border-default)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ padding: "4px 12px 0" }}>
        <Tabs
          variant="large"
          size="sm"
          items={[
            { value: "all", label: "All" },
            { value: "cluster", label: "Cluster" },
          ]}
          value={scope}
          onChange={(v) => onScopeChange?.(v as InstanceSelectScope)}
        />
      </div>

      <div style={{ padding: "8px 12px" }}>
        <TextField
          size="md"
          fullWidth
          placeholder="Search"
          leadingIcon={<IcSearch />}
          value={query}
          onChange={(v) => onQueryChange?.(v)}
        />
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          padding: "6px 12px",
          borderTop: "1px solid var(--color-border-soft)",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <span className="text-base text-secondary">
          전체 <span className="font-bold text-primary tabular-nums">{visible.length}</span>
        </span>
        <span className="flex items-center" style={{ gap: 8 }}>
          <span className="text-base text-secondary">비활성화된 인스턴스 표시</span>
          <Switch
            size="sm"
            checked={showIdle}
            onChange={(v) => onShowIdleChange?.(v)}
            aria-label="비활성화된 인스턴스 표시"
          />
        </span>
      </div>

      <div style={{ maxHeight: 260, overflowY: "auto", padding: "4px 0" }}>
        {visible.length === 0 ? (
          <div className="text-base text-tertiary" style={{ padding: "16px 12px" }}>
            조건에 맞는 인스턴스가 없습니다.
          </div>
        ) : (
          visible.map((it) => (
            <InstanceListItem
              key={it.name}
              name={it.name}
              status={it.status}
              cluster={it.cluster}
              selected={selected === it.name}
              onClick={() => onSelect?.(it.name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
