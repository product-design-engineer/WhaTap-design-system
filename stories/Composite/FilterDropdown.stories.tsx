import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterDropdown, FilterChip, Button, Checkbox } from "@whatap/design-system";

const CATEGORY_OPTIONS = [
  { value: "disk", label: "Disk", count: 12 },
  { value: "jvm", label: "JVM", count: 43 },
  { value: "k8s", label: "Kubernetes", count: 8 },
  { value: "network", label: "Network", count: 4 },
  { value: "process", label: "Process", count: 211 },
  { value: "db", label: "Database", count: 6 },
  { value: "security", label: "Security", count: 0 },
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", count: 3 },
  { value: "warning", label: "Warning", count: 9 },
  { value: "info", label: "Info", count: 4 },
];

/**
 * Stories for [[FilterDropdown]] — Primitives 다중 선택 드롭다운.
 *
 * FilterBar 안 다중 필터 진입점. 트리거 + Checkbox 묶음 + outside-click/ESC 닫기.
 */
const meta: Meta<typeof FilterDropdown> = {
  title: "Composite/FilterDropdown",
  component: FilterDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**다중 선택 드롭다운 primitive.** 트리거(Button/FilterChip) + Checkbox 묶음 자동 렌더 + outside-click/ESC 닫기. " +
          "Modal 보다 가벼움 — backdrop·body scroll lock 없음. 4 방향 placement 지원. " +
          "options 모드(자동 Checkbox) / children 모드(자유 구성) 양쪽.",
      },
    },
  },
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    width: { control: { type: "number" } },
    disableOutsideClick: { control: "boolean" },
    disableEscClose: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterDropdown>;

/** 기본 — options 모드 + FilterChip 트리거. */
export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string[]>(["disk"]);
      return (
        <div style={{ paddingBottom: 240 /* 펼침 영역 확보 */ }}>
          <FilterDropdown
            trigger={
              <FilterChip selected={selected.length > 0} count={selected.length || undefined}>
                카테고리
              </FilterChip>
            }
            title="카테고리"
            options={CATEGORY_OPTIONS}
            value={selected}
            onChange={setSelected}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** placement 4 방향. */
export const Placements: Story = {
  render: () => {
    const Demo = () => {
      const [sel, setSel] = useState<Record<string, string[]>>({
        bs: ["critical"],
        be: ["warning"],
        ts: ["info"],
        te: [],
      });
      return (
        <div className="grid grid-cols-2 gap-24 py-32 px-12">
          <FilterDropdown
            trigger={<Button>bottom-start</Button>}
            title="bottom-start"
            options={SEVERITY_OPTIONS}
            value={sel.bs}
            onChange={(v) => setSel({ ...sel, bs: v })}
            placement="bottom-start"
          />
          <FilterDropdown
            trigger={<Button>bottom-end</Button>}
            title="bottom-end"
            options={SEVERITY_OPTIONS}
            value={sel.be}
            onChange={(v) => setSel({ ...sel, be: v })}
            placement="bottom-end"
          />
          <FilterDropdown
            trigger={<Button>top-start</Button>}
            title="top-start"
            options={SEVERITY_OPTIONS}
            value={sel.ts}
            onChange={(v) => setSel({ ...sel, ts: v })}
            placement="top-start"
          />
          <FilterDropdown
            trigger={<Button>top-end</Button>}
            title="top-end"
            options={SEVERITY_OPTIONS}
            value={sel.te}
            onChange={(v) => setSel({ ...sel, te: v })}
            placement="top-end"
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** count 표시 + 모두 해제 버튼 — 선택된 게 있으면 헤더에 노출. */
export const WithCount: Story = {
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string[]>(["disk", "jvm", "k8s"]);
      return (
        <div style={{ paddingBottom: 320 }}>
          <FilterDropdown
            trigger={
              <FilterChip selected={selected.length > 0} count={selected.length || undefined}>
                카테고리
              </FilterChip>
            }
            title="카테고리"
            options={CATEGORY_OPTIONS}
            value={selected}
            onChange={setSelected}
            width={280}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 자유 children — Apply/Cancel 지연 적용 패턴 (옵션 즉시 onChange 가 아닌 buffer + 적용 버튼). */
export const ChildrenWithFooter: Story = {
  render: () => {
    const Demo = () => {
      const [committed, setCommitted] = useState<string[]>(["critical"]);
      const [draft, setDraft] = useState<string[]>(["critical"]);
      const [open, setOpen] = useState(false);
      const handleApply = () => {
        setCommitted(draft);
        setOpen(false);
      };
      const handleCancel = () => {
        setDraft(committed);
        setOpen(false);
      };
      return (
        <div style={{ paddingBottom: 280 }}>
          <FilterDropdown
            trigger={
              <FilterChip selected={committed.length > 0} count={committed.length || undefined}>
                심각도
              </FilterChip>
            }
            title="심각도"
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (o) setDraft(committed);
            }}
            footer={
              <>
                <Button variant="basic" size="sm" onClick={handleCancel}>
                  취소
                </Button>
                <Button variant="contained" size="sm" onClick={handleApply}>
                  적용
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-1_5" style={{ padding: "10px 12px" }}>
              {SEVERITY_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt.value}
                  checked={draft.includes(opt.value)}
                  onChange={(c) =>
                    setDraft(c ? [...draft, opt.value] : draft.filter((v) => v !== opt.value))
                  }
                >
                  {opt.label} <span className="text-tertiary">· {opt.count}</span>
                </Checkbox>
              ))}
            </div>
          </FilterDropdown>
          <p className="mt-3 text-sm text-tertiary">
            적용된 선택: {committed.join(", ") || "(없음)"}
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

/** disabled 옵션 포함. */
export const WithDisabledOptions: Story = {
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <div style={{ paddingBottom: 280 }}>
          <FilterDropdown
            trigger={<Button>카테고리</Button>}
            title="카테고리"
            value={selected}
            onChange={setSelected}
            options={[
              { value: "disk", label: "Disk", count: 12 },
              { value: "jvm", label: "JVM", count: 43 },
              { value: "internal", label: "(internal) 권한 없음", disabled: true },
              { value: "k8s", label: "Kubernetes", count: 8 },
            ]}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** disabled 트리거. */
export const Disabled: Story = {
  render: () => (
    <FilterDropdown
      trigger={<Button disabled>비활성</Button>}
      title="비활성"
      options={SEVERITY_OPTIONS}
      disabled
    />
  ),
};

/** FilterBar 시뮬레이션 — 다중 FilterDropdown 가로 나열. */
export const InFilterBar: Story = {
  render: () => {
    const Demo = () => {
      const [cat, setCat] = useState<string[]>(["disk"]);
      const [sev, setSev] = useState<string[]>(["critical", "warning"]);
      return (
        <div className="flex flex-col gap-3" style={{ paddingBottom: 280 }}>
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              trigger={
                <FilterChip selected={cat.length > 0} count={cat.length || undefined}>
                  카테고리
                </FilterChip>
              }
              title="카테고리"
              options={CATEGORY_OPTIONS}
              value={cat}
              onChange={setCat}
            />
            <FilterDropdown
              trigger={
                <FilterChip selected={sev.length > 0} count={sev.length || undefined}>
                  심각도
                </FilterChip>
              }
              title="심각도"
              options={SEVERITY_OPTIONS}
              value={sev}
              onChange={setSev}
            />
          </div>
          <div className="text-sm text-tertiary">
            카테고리: {cat.join(", ") || "(없음)"} / 심각도: {sev.join(", ") || "(없음)"}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
