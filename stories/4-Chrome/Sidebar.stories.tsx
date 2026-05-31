import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "@whatap/design-system";
import type { MenuItem, ProjectContext } from "@whatap/design-system/Sidebar";

/**
 * Stories for [[Sidebar]] — WhaTap SaaS 좌측 240px 사이드바.
 */
const meta: Meta<typeof Sidebar> = {
  title: "Chrome/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**좌측 240px 사이드바.** 로고 헤더 + 조직 스위처 + 프로젝트 스위처 + 본문(제품 레일 + 메뉴) + 푸터. " +
          "위젯이 열리면 (`collapsed=true`) 40px 제품 레일만 남기고 minimize (feedback-widget-sidebar-collapse). " +
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
    collapsed: { description: "위젯 열림 시 true — 메뉴 숨김, 제품 레일만 노출.", control: "boolean" },
  },
  decorators: [(Story) => (<div style={{ height: 720, display: "flex" }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const DB_PROJECT: ProjectContext = {
  productIcon: "product-db.svg",
  groupLabel: "[그룹] 운영 ",
  projectLabel: "[프로젝트] oracle_dnx",
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

/** Collapsed — 위젯 열림 상태 (40px 제품 레일만). */
export const Collapsed: Story = { args: { activeProduct: "db", project: DB_PROJECT, menu: DB_MENU, collapsed: true } };
