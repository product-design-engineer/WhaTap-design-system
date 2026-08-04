import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "@whatap/design-system";
import type { MenuItem, ProjectContext } from "@whatap/design-system/Sidebar";

/**
 * Stories for [[Sidebar]] — WhaTap SaaS 좌측 240px 사이드바.
 */
const meta: Meta<typeof Sidebar> = {
  title: "Composite/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**좌측 240px 사이드바.** 로고 헤더 + 조직 스위처 + 프로젝트 스위처 + 본문(제품 레일 + 메뉴) + 푸터. " +
          "위젯이 열리면 (`collapsed=true`) 80px Min — 40px 제품 레일 + 40px 아이콘 전용 메뉴 열 — 로 minimize (feedback-widget-sidebar-collapse). " +
          "상단 프로젝트 스위처는 **프로젝트 컨텍스트가 있을 때만 노출**하며, 컨텍스트가 없는 화면(엔터프라이즈 설정 전, 계정/관리 영역)에서는 `hideProjectSwitcher` 로 숨긴다(빈 라벨/기본값 노출 금지). " +
          "아이콘은 라이브 배포 `/icons/*` 경로 — dev 서버는 vite proxy 로 라이브 포워딩.",
      },
    },
  },
  argTypes: {
    activeProduct: {
      description: "활성 제품 — 좌측 레일 강조 색.",
      control: { type: "select" },
      options: ["application", "server", "k8s", "db", "log", "url", "cloud", "rum", "nms", "gpu", "metrics"],
    },
    collapsed: { description: "(controlled) true면 Min(80px) — 제품 레일 + 아이콘 전용 메뉴 열. 부모가 소유(AI 위젯 동기화 등).", control: "boolean" },
    defaultCollapsed: { description: "(uncontrolled) 초기 접힘 상태. 로고 헤더 chevron 으로 스스로 min/max 토글.", control: "boolean" },
    hideProjectSwitcher: { description: "상단 프로젝트/조직 스위처 숨김.", control: "boolean" },
  },
  decorators: [(Story) => (<div style={{ height: 720, display: "flex" }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const DB_PROJECT: ProjectContext = {
  productIcon: "product-db.svg",
  groupLabel: "그룹명",
  projectLabel: "프로젝트명",
};

const DB_MENU: MenuItem[] = [
  { icon: "menu-dashboard.svg", label: "대시보드", expanded: true, children: [{ label: "DB 인스턴스 현황", active: true }, { label: "RAC 클러스터" }] },
  { icon: "menu-storage.svg", label: "스토리지 분석", children: [] },
  { icon: "menu-alert.svg", label: "경고 알림", children: [] },
  { icon: "menu-report.svg", label: "보고서" },
];

/** 기본 — K8s-GPU default 컨텍스트. */
export const Default: Story = { args: { activeProduct: "gpu" } };

/** DB 컨텍스트 — 프로젝트/메뉴 prop 으로 주입. */
export const DbContext: Story = {
  args: { activeProduct: "db", project: DB_PROJECT, menu: DB_MENU },
};

/** Collapsed — 위젯 열림 상태 (80px Min: 제품 레일 + 아이콘 전용 메뉴 열, 라벨은 title 툴팁). controlled 라 정적. */
export const Collapsed: Story = { args: { activeProduct: "db", project: DB_PROJECT, menu: DB_MENU, collapsed: true } };

/**
 * Interactive (uncontrolled) — 로고 헤더의 **chevron 을 클릭**해 min(80px)↔max(240px) 를 직접 토글.
 * `collapsed` 를 주지 않으면 내부 상태로 동작하며, 펼침 상태에선 로고 우측 ◂(접기),
 * collapsed 에선 80px 헤더 중앙 ▸(펴기) 버튼이 노출된다.
 */
export const Interactive: Story = {
  args: { activeProduct: "gpu", defaultCollapsed: false },
  parameters: {
    docs: { description: { story: "로고 헤더의 chevron 토글로 접기/펴기. width 는 transition-all duration-400 으로 애니메이션." } },
  },
};

/**
 * HiddenProjectSwitcher — 프로젝트 컨텍스트가 없는 화면.
 * 상단 프로젝트 스위처(productIcon + group/project 라벨 + chevron)를 숨김
 * (엔터프라이즈 설정 전, 계정/관리 영역 등 — 빈 라벨/기본값 노출 방지).
 */
export const HiddenProjectSwitcher: Story = {
  args: { activeProduct: "db", menu: DB_MENU, hideProjectSwitcher: true },
};
