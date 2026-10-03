import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyCollapseToggle } from "@whatap/design-system";

/**
 * Stories for [[TopologyCollapseToggle]] — 노드 좌측의 잎(leaf) 모양 컬러 뱃지 겸 접기 토글.
 *
 * 높이를 부모 카드가 정하므로, 여기서는 48px 카드를 흉내 낸 컨테이너로 감싼다.
 */
const meta: Meta<typeof TopologyCollapseToggle> = {
  title: "Primitives/TopologyCollapseToggle",
  component: TopologyCollapseToggle,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          height: 48,
          width: 160,
          display: "flex",
          alignItems: "stretch",
          background: "var(--color-topology-node-surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        <Story />
        <span className="flex items-center px-12px text-md font-bold text-primary">노드</span>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TopologyCollapseToggle>;

/** 펼침 상태 — `−`. */
export const Expanded: Story = { args: { collapsed: false } };

/** 접힘 상태 — `+`. */
export const Collapsed: Story = { args: { collapsed: true } };

/** tone=ok — 정상. */
export const ToneOk: Story = { args: { collapsed: true, tone: "ok" } };

/** tone=alert — 경보. */
export const ToneAlert: Story = { args: { collapsed: true, tone: "alert" } };

/** 비대화형 — 리프 노드의 장식 뱃지. 버튼 시맨틱·탭 순서를 만들지 않는다. */
export const Decorative: Story = { args: { collapsed: true, interactive: false } };
