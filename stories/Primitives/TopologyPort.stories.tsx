import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyPort } from "@whatap/design-system";

/**
 * Stories for [[TopologyPort]] — 엣지가 노드에 물리는 지점의 원형 도트.
 *
 * `<circle>` 을 렌더하므로 반드시 `<svg>` 안에서 쓴다 — 데코레이터가 그 맥락을 제공한다.
 */
const meta: Meta<typeof TopologyPort> = {
  title: "Primitives/TopologyPort",
  component: TopologyPort,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { x: 24, y: 24 },
  decorators: [
    (Story) => (
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--color-topology-canvas-from), var(--color-topology-canvas-to))",
          borderRadius: "var(--radius-xl)",
          display: "inline-block",
        }}
      >
        <svg width={48} height={48} role="img" aria-label="포트 예시">
          <Story />
        </svg>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TopologyPort>;

/** 기본 — 일반 연결. */
export const Default: Story = {};

/** 정상 연결. */
export const Ok: Story = { args: { tone: "ok" } };

/** 경보 연결 — 엣지 강조색과 같은 계열. */
export const Alert: Story = { args: { tone: "alert" } };

/** 반경 확대 — 줌인된 캔버스나 범례에서. */
export const Large: Story = { args: { radius: 9 } };
