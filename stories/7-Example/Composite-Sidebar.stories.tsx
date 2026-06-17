import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "@whatap/design-system";
import type { MenuItem, ProjectContext } from "@whatap/design-system/Sidebar";

/**
 * Example / 합성 위젯 — **Sidebar** (복수 컴포넌트 합성).
 *
 * 합성 구성: 로고 헤더 + 조직/프로젝트 스위처 + 제품 레일 + `SidebarMenuItem`(메뉴 행) ×N + 하단 레일/푸터.
 * 메뉴 행은 [[SidebarMenuItem]] Foundation 으로 분리되어 데이터(`MenuItem[]`)로 주입되는 구조.
 * (컴포넌트 자체 레퍼런스는 `Chrome/Sidebar`.)
 */
const meta: Meta<typeof Sidebar> = {
  title: "Example/합성 위젯/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
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

/** DB 컨텍스트 — SidebarMenuItem 메뉴 행 + 레일 합성. */
export const Composition: Story = {
  args: { activeProduct: "db", project: DB_PROJECT, menu: DB_MENU },
};
