import type { Meta, StoryObj } from "@storybook/react-vite";
import PageHeaderNotificationItem from "../../src/PageHeaderNotificationItem";

/**
 * Stories for [[PageHeaderNotificationItem]] — PageHeader 알림(벨) 드롭다운의 한 항목(행).
 *
 * 빨간 도트 + 라벨로 구성된 좌측정렬 버튼. 드롭다운 폭을 재현한 컨테이너로 감싸
 * 실제 알림 목록 맥락을 보여준다.
 */
const meta: Meta<typeof PageHeaderNotificationItem> = {
  title: "Primitives/PageHeaderNotificationItem",
  component: PageHeaderNotificationItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          minWidth: 260,
          background: "var(--color-card)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 8,
          padding: "4px 0",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PageHeaderNotificationItem>;

/** 기본 — 도트 + 라벨. */
export const Default: Story = {
  args: { item: { label: "임계값 초과: disk-usage" } },
};

/** 긴 라벨 — whitespace-nowrap 으로 한 줄 유지. */
export const LongLabel: Story = {
  args: { item: { label: "에이전트 응답 없음: api-server-prod-7f9c8" } },
};
