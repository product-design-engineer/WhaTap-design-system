import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarOrgSwitcher } from "@whatap/design-system";

/**
 * Stories for [[SidebarOrgSwitcher]] — Sidebar 상단 40px 조직 스위처 행.
 *
 * 조직 아이콘 + 조직명 라벨 + "조직" 타입 칩(badge) + chevron.
 * "[조직]" 같은 타입 접두사는 라벨이 아니라 badge 칩으로 분리 — 슬롯은 조직명만.
 * 240px 컨테이너로 감싸 실제 사이드바 맥락을 재현.
 */
const meta: Meta<typeof SidebarOrgSwitcher> = {
  title: "Primitives/SidebarOrgSwitcher",
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

/** 기본 — 조직 아이콘 + 조직명 + "조직" 칩. */
export const Default: Story = {
  args: {
    org: { label: "조직명", icon: "menu-workload.svg" },
  },
};

/** 등급 칩 — badge 로 조직 등급/컨텍스트(예: 엔터프라이즈)를 표현. */
export const WithBadge: Story = {
  args: {
    org: { label: "조직명", icon: "menu-workload.svg", badge: "엔터프라이즈" },
  },
};

/** 아이콘 없음 — 라벨 좌측 12px 스페이서. "조직" 칩은 유지. */
export const NoIcon: Story = {
  args: {
    org: { label: "테스트 조직" },
  },
};
