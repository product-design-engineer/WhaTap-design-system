import { useState, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeader,
  FilterBar, DataTable, TextField, Chip, Button,
  WhaTapAiWidget,
} from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system/DataTable";

/**
 * **프리셋 C — 목록 페이지.**
 *
 * 검색·필터가 핵심인 목록 페이지 패턴.
 * Sidebar + PageHeader + FilterBar + DataTable + AI 위젯.
 *
 * `docs/GUIDE.md` "프리셋 C" 코드 템플릿과 1:1 대응.
 */

/* ─── Icons ──────────────────────────────────────────── */

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
    <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
    <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

/* ─── Mock data ──────────────────────────────────────── */

type Row = {
  no: number;
  title: string;
  category: string;
  severity: "위험" | "경고" | "정보";
  project: string;
  time: string;
};

const ROWS: Row[] = [
  { no: 1, title: "CPU 사용률 95% 초과",      category: "Server",   severity: "위험", project: "prod-eks",    time: "14:23:15" },
  { no: 2, title: "디스크 사용률 임계치 도달",    category: "Disk",     severity: "경고", project: "prod-eks",    time: "14:20:42" },
  { no: 3, title: "JVM GC 시간 증가",          category: "JVM",      severity: "경고", project: "staging-eks", time: "14:18:31" },
  { no: 4, title: "네트워크 패킷 드롭 감지",     category: "Network",  severity: "정보", project: "prod-eks",    time: "14:15:08" },
  { no: 5, title: "Pod OOMKilled 발생",        category: "K8s",      severity: "위험", project: "prod-eks",    time: "14:12:55" },
  { no: 6, title: "DB 커넥션 풀 소진 임박",      category: "Database", severity: "경고", project: "legacy-vm",   time: "14:10:22" },
  { no: 7, title: "프로세스 좀비 상태 감지",      category: "Process",  severity: "정보", project: "dev-eks",     time: "14:08:10" },
  { no: 8, title: "SSL 인증서 만료 30일 이내",   category: "Security", severity: "경고", project: "prod-eks",    time: "14:05:47" },
];

const SEVERITY_TONE: Record<string, "critical" | "warning" | undefined> = {
  "위험": "critical",
  "경고": "warning",
};

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "no",       header: "No",     width: 52,  numeric: true, render: (r) => r.no },
  { key: "title",    header: "이벤트명",  flex: 3 },
  { key: "category", header: "카테고리",  width: 120 },
  { key: "severity", header: "심각도",   width: 96,
    render: (r) => <Chip size="md" tone={SEVERITY_TONE[r.severity]}>{r.severity}</Chip>,
  },
  { key: "project",  header: "프로젝트",  flex: 1.5 },
  { key: "time",     header: "시각",     width: 120,
    render: (r) => <span className="font-numeric tabular-nums">{r.time}</span>,
  },
];

const CATEGORY_OPTIONS = [
  { value: "server",   label: "Server",   count: 1 },
  { value: "disk",     label: "Disk",     count: 1 },
  { value: "jvm",      label: "JVM",      count: 1 },
  { value: "network",  label: "Network",  count: 1 },
  { value: "k8s",      label: "K8s",      count: 1 },
  { value: "database", label: "Database", count: 1 },
  { value: "process",  label: "Process",  count: 1 },
  { value: "security", label: "Security", count: 1 },
];

const SEVERITY_OPTIONS = [
  { value: "위험", label: "위험", count: 2 },
  { value: "경고", label: "경고", count: 4 },
  { value: "정보", label: "정보", count: 2 },
];

/* ─── Meta ───────────────────────────────────────────── */

const meta: Meta = {
  title: "Page/C — 목록 페이지",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**프리셋 C — 목록 페이지.** Sidebar + PageHeader + FilterBar + DataTable + WhaTapAiWidget.\n\n" +
          "이벤트 목록, 알림 규칙, 인스턴스 카탈로그 등 검색·필터가 핵심인 페이지.\n\n" +
          "**포함 컴포넌트:** DashboardLayout · PageHeader · FilterBar(TextField + FilterDropdown) · DataTable · Chip · WhaTapAiWidget\n\n" +
          "**핵심 기능:** 텍스트 검색 + 드롭다운 다중 필터 + 선택 칩 표시 + 전체 초기화.",
      },
    },
  },
  decorators: [(Story) => (<div style={{ height: 720 }}><Story /></div>)],
};
export default meta;

/* ─── Story ──────────────────────────────────────────── */

/** Example — 검색 + 필터 + DataTable + AI 위젯 토글. */
export const Example: StoryObj = {
  render: () => {
    const Demo = () => {
      const [aiActive, setAiActive] = useState(false);
      const [search, setSearch] = useState("");
      const [cat, setCat] = useState<string[]>([]);
      const [sev, setSev] = useState<string[]>([]);

      const filtered = useMemo(() => {
        return ROWS.filter((r) => {
          if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
          if (cat.length > 0 && !cat.includes(r.category.toLowerCase())) return false;
          if (sev.length > 0 && !sev.includes(r.severity)) return false;
          return true;
        });
      }, [search, cat, sev]);

      const handleReset = () => {
        setSearch("");
        setCat([]);
        setSev([]);
      };

      return (
        <DashboardLayout
          widgetOpen={aiActive}
          activeProduct="apm"
          header={
            <PageHeader
              title="이벤트 목록"
              aiActive={aiActive}
              onAiToggle={() => setAiActive((v) => !v)}
            />
          }
          main={
            <div>
              <FilterBar
                size="lg"
                search={
                  <TextField
                    size="sm"
                    value={search}
                    onChange={setSearch}
                    placeholder="이벤트 제목, 카테고리, 프로젝트"
                    leadingIcon={<SearchIcon />}
                    clearable
                  />
                }
                dropdowns={[
                  { key: "category", label: "카테고리", options: CATEGORY_OPTIONS, value: cat, onChange: setCat },
                  { key: "severity", label: "심각도",   options: SEVERITY_OPTIONS, value: sev, onChange: setSev },
                ]}
                showSelectedChips
                showResetAll
                onResetAll={handleReset}
              />
              <div style={{ padding: 16 }}>
                <DataTable<Row>
                  columns={COLUMNS}
                  rows={filtered}
                  density="default"
                />
              </div>
            </div>
          }
        >
          <WhaTapAiWidget
            open={aiActive}
            onClose={() => setAiActive(false)}
            pageHighlight="이벤트 목록"
          />
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};
