import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterBar, TextField } from "@whatap/design-system";

/**
 * Example / 합성 위젯 — **FilterBar** (복수 컴포넌트 합성).
 *
 * 합성 구성: `TextField`(search) + `FilterDropdown`(다중 선택) ×N + `FilterChip`/`Chip`(선택 칩).
 * 단일 컴포넌트가 아니라 여러 Foundation/Primitive 를 조립한 Composite 위젯의 실제 사용 예시.
 * (컴포넌트 자체 레퍼런스는 `Chrome/FilterBar`.)
 */
const meta: Meta<typeof FilterBar> = {
  title: "Example/합성 위젯/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "light" } },
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
    <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
    <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);
const CATEGORY_OPTIONS = [
  { value: "disk", label: "Disk", count: 12 },
  { value: "jvm", label: "JVM", count: 43 },
  { value: "k8s", label: "Kubernetes", count: 8 },
  { value: "network", label: "Network", count: 4 },
  { value: "process", label: "Process", count: 211 },
];
const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", count: 3 },
  { value: "warning", label: "Warning", count: 9 },
  { value: "info", label: "Info", count: 4 },
];

/** 검색 + 카테고리/심각도 드롭다운 + 선택 칩 — FilterBar 가 합성하는 전체 구성. */
export const Composition: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("disk full");
      const [cat, setCat] = useState<string[]>(["disk", "jvm"]);
      const [sev, setSev] = useState<string[]>(["critical"]);
      return (
        <div style={{ paddingBottom: 320 }}>
          <FilterBar
            search={
              <TextField
                size="sm"
                value={q}
                onChange={setQ}
                placeholder="제목, 메시지, 프로젝트, 에이전트"
                leadingIcon={<SearchIcon />}
                clearable
              />
            }
            dropdowns={[
              { key: "category", label: "카테고리", options: CATEGORY_OPTIONS, value: cat, onChange: setCat },
              { key: "severity", label: "심각도", options: SEVERITY_OPTIONS, value: sev, onChange: setSev },
            ]}
            showSelectedChips
            showResetAll
            onResetAll={() => { setQ(""); setCat([]); setSev([]); }}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
