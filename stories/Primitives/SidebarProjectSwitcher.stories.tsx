import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarProjectSwitcher } from "@whatap/design-system";

/**
 * Stories for [[SidebarProjectSwitcher]] — Sidebar 상단 40px 프로젝트 스위처 행.
 *
 * 제품 아이콘 + 그룹 라인("그룹" 칩 + 그룹명) + 프로젝트 라인("프로젝트" 칩 + 프로젝트명) + chevron.
 * "[그룹]"·"[프로젝트]" 타입 접두사는 라벨이 아니라 `groupBadge`/`projectBadge` 칩으로 분리.
 * 240px 컨테이너로 감싸 실제 사이드바 맥락을 재현.
 */
const meta: Meta<typeof SidebarProjectSwitcher> = {
  title: "Primitives/SidebarProjectSwitcher",
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
      productIcon: "product-gpu.svg",      groupLabel: "그룹명",      projectLabel: "프로젝트명",
    },
  },
};

/** DB 프로젝트. */
export const DbProject: Story = {
  args: {
    project: {
      productIcon: "product-db.svg",      groupLabel: "그룹명",      projectLabel: "프로젝트명",
    },
  },
};

/** 아이콘 없음 — 12px 스페이서. */
export const NoIcon: Story = {
  args: {
    project: {      groupLabel: "그룹명",      projectLabel: "프로젝트명",
    },
  },
};

/** 긴 라벨 — 텍스트 ellipsis 검증. */
export const LongLabels: Story = {
  args: {
    project: {
      productIcon: "product-app.svg",      groupLabel: "매우 긴 그룹명 · 아시아태평양 리전 · 추가 텍스트",      projectLabel: "my-very-long-application-name-prod-01",
    },
  },
};
