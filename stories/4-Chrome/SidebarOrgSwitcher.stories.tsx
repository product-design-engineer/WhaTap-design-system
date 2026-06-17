import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarOrgSwitcher } from "@whatap/design-system";

/**
 * Stories for [[SidebarOrgSwitcher]] — Sidebar 상단 40px 조직 스위처 행.
 *
 * 심볼 아이콘 + 라벨 + 옵션 뱃지 + chevron.
 * 240px 컨테이너로 감싸 실제 사이드바 맥락을 재현.
 */
const meta: Meta<typeof SidebarOrgSwitcher> = {
  title: "Chrome/SidebarOrgSwitcher",
  component: SidebarOrgSwitcher,
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
type Story = StoryObj<typeof SidebarOrgSwitcher>;

/** 기본 — 아이콘 + 라벨. */
export const Default: Story = {
  args: {
    org: { label: "[조직] 와탭랩스 대관", icon: "whatap-symbol.svg" },
  },
};

/** 뱃지 — 엔터프라이즈 컨텍스트 칩. */
export const WithBadge: Story = {
  args: {
    org: { label: "[조직] 와탭랩스", icon: "whatap-symbol.svg", badge: "엔터프라이즈" },
  },
};

/** 아이콘 없음 — 라벨 좌측 12px 스페이서. */
export const NoIcon: Story = {
  args: {
    org: { label: "[조직] 테스트 조직" },
  },
};
