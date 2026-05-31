import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterBar, TextField, Button } from "@whatap/design-system";

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
  { value: "db", label: "Database", count: 6 },
  { value: "security", label: "Security", count: 0 },
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", count: 3 },
  { value: "warning", label: "Warning", count: 9 },
  { value: "info", label: "Info", count: 4 },
];

const PROJECT_OPTIONS = [
  { value: "prod-eks", label: "Production EKS Cluster" },
  { value: "staging-eks", label: "Staging EKS" },
  { value: "dev-eks", label: "Dev EKS" },
  { value: "legacy-vm", label: "Legacy VMs" },
];

/**
 * Stories for [[FilterBar]] — Chrome 페이지 헤더 검색·필터 영역.
 *
 * Primitives 9 종 (TextField/FilterChip/FilterDropdown 등) 을 조립한 디자인 시스템의 *마지막* 컴포넌트.
 */
const meta: Meta<typeof FilterBar> = {
  title: "Chrome/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**페이지 헤더 검색·필터 묶음 (Chrome).** TextField(search) + FilterDropdown(다중 선택) + 자유 actions 슬롯. " +
          "showSelectedChips 로 선택된 항목을 별도 row 의 closable 칩으로, showResetAll 로 일괄 초기화. " +
          "통합 이벤트 목록·카탈로그·룰 목록 페이지 헤더용.",
      },
    },
  },
  argTypes: {
    showSelectedChips: { control: "boolean" },
    showResetAll: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

/** 기본 — 검색 + 카테고리 + 심각도 dropdown. */
export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("");
      const [cat, setCat] = useState<string[]>([]);
      const [sev, setSev] = useState<string[]>([]);
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
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
              },
              {
                key: "severity",
                label: "심각도",
                options: SEVERITY_OPTIONS,
                value: sev,
                onChange: setSev,
              },
            ]}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** WithSelectedChips — 별도 row 에 closable 칩으로 노출. */
export const WithSelectedChips: Story = {
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
                placeholder="검색…"
                leadingIcon={<SearchIcon />}
                clearable
              />
            }
            dropdowns={[
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
              },
              {
                key: "severity",
                label: "심각도",
                options: SEVERITY_OPTIONS,
                value: sev,
                onChange: setSev,
              },
            ]}
            showSelectedChips
            showResetAll
            onResetAll={() => setQ("")}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Actions — 우측에 시간 셀렉트·새로고침 등 자유 ReactNode. */
export const WithActions: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("");
      const [cat, setCat] = useState<string[]>([]);
      const [proj, setProj] = useState<string[]>(["prod-eks"]);
      return (
        <div style={{ paddingBottom: 320 }}>
          <FilterBar
            search={
              <TextField
                size="sm"
                value={q}
                onChange={setQ}
                placeholder="검색…"
                leadingIcon={<SearchIcon />}
                clearable
              />
            }
            dropdowns={[
              {
                key: "project",
                label: "프로젝트",
                options: PROJECT_OPTIONS,
                value: proj,
                onChange: setProj,
              },
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
              },
            ]}
            actions={
              <>
                <Button variant="outline" size="sm">
                  최근 1시간
                </Button>
                <Button variant="outline" size="sm">
                  새로고침
                </Button>
                <Button variant="contained" size="sm">
                  이벤트 일괄 처리
                </Button>
              </>
            }
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** NoSearch — 검색 없이 dropdown 만. */
export const NoSearch: Story = {
  render: () => {
    const Demo = () => {
      const [cat, setCat] = useState<string[]>([]);
      const [sev, setSev] = useState<string[]>([]);
      return (
        <div style={{ paddingBottom: 320 }}>
          <FilterBar
            dropdowns={[
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
              },
              {
                key: "severity",
                label: "심각도",
                options: SEVERITY_OPTIONS,
                value: sev,
                onChange: setSev,
              },
            ]}
            showResetAll
            showSelectedChips
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Realistic — 통합 이벤트 목록 헤더 시뮬레이션 (라이브 와탭 콘솔 패턴). */
export const RealisticEventList: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("");
      const [proj, setProj] = useState<string[]>(["prod-eks"]);
      const [cat, setCat] = useState<string[]>([]);
      const [sev, setSev] = useState<string[]>(["critical", "warning"]);
      return (
        <div style={{ paddingBottom: 360 }}>
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
              {
                key: "project",
                label: "프로젝트",
                options: PROJECT_OPTIONS,
                value: proj,
                onChange: setProj,
                width: 280,
              },
              {
                key: "severity",
                label: "심각도",
                options: SEVERITY_OPTIONS,
                value: sev,
                onChange: setSev,
              },
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
                width: 260,
              },
            ]}
            actions={
              <>
                <Button variant="outline" size="sm">
                  최근 1시간 ▾
                </Button>
                <Button variant="outline" size="sm">
                  새로고침
                </Button>
              </>
            }
            showSelectedChips
            showResetAll
            onResetAll={() => setQ("")}
          />
          <p className="mt-4 text-sm text-tertiary">
            현재 필터: q=
            <code>{q || "(없음)"}</code>, project={proj.length}, severity={sev.length},
            category={cat.length}
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

/** Catalog page — 카탈로그 ON/OFF 페이지 헤더. */
export const RealisticCatalog: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("");
      const [cat, setCat] = useState<string[]>([]);
      const [state, setState] = useState<string[]>([]);
      return (
        <div style={{ paddingBottom: 320 }}>
          <FilterBar
            search={
              <TextField
                size="sm"
                value={q}
                onChange={setQ}
                placeholder="알림 코드, 한글 설명, 카테고리"
                leadingIcon={<SearchIcon />}
                clearable
              />
            }
            dropdowns={[
              {
                key: "category",
                label: "카테고리",
                options: CATEGORY_OPTIONS,
                value: cat,
                onChange: setCat,
              },
              {
                key: "state",
                label: "활성 상태",
                options: [
                  { value: "on", label: "ON", count: 56 },
                  { value: "off", label: "OFF", count: 68 },
                ],
                value: state,
                onChange: setState,
              },
            ]}
            actions={
              <>
                <Button variant="outline" size="sm">
                  JSON 다운로드
                </Button>
                <Button variant="outline" size="sm">
                  변경 이력
                </Button>
              </>
            }
            showSelectedChips
            showResetAll
          />
        </div>
      );
    };
    return <Demo />;
  },
};
