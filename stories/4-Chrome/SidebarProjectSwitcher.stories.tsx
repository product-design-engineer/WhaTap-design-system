import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarProjectSwitcher } from "@whatap/design-system";

/**
 * Stories for [[SidebarProjectSwitcher]] — Sidebar 상단 44px 프로젝트 스위처 행.
 *
 * 제품 아이콘 + 그룹 라벨 + 프로젝트 라벨 + chevron.
 * 240px 컨테이너로 감싸 실제 사이드바 맥락을 재현.
 */
const meta: Meta<typeof SidebarProjectSwitcher> = {
  title: "Chrome/SidebarProjectSwitcher",
  component: SidebarProjectSwitcher,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{ width: 240, background: "var(--color-card)", border: "1px solid var(--color-border-default)" }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SidebarProjectSwitcher>;

/** 기본 — GPU 프로젝트. */
export const Default: Story = {
  args: {
    project: {
      productIcon: "product-gpu.svg",
      groupLabel: "[그룹] 운영",
      projectLabel: "[프로젝트] K8s-GPU",
    },
  },
};

/** DB 프로젝트. */
export const DbProject: Story = {
  args: {
    project: {
      productIcon: "product-db.svg",
      groupLabel: "[그룹] 프로덕션",
      projectLabel: "[프로젝트] Oracle RAC",
    },
  },
};

/** 아이콘 없음 — 12px 스페이서. */
export const NoIcon: Story = {
  args: {
    project: {
      groupLabel: "[그룹] 관리",
      projectLabel: "[프로젝트] 설정 전",
    },
  },
};

/** 긴 라벨 — 텍스트 ellipsis 검증. */
export const LongLabels: Story = {
  args: {
    project: {
      productIcon: "product-app.svg",
      groupLabel: "[그룹] 프로덕션 · 아시아태평양 리전",
      projectLabel: "[프로젝트] my-very-long-application-name-prod-01",
    },
  },
};
