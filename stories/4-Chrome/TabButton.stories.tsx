import type { Meta, StoryObj } from "@storybook/react-vite";
import TabButton from "../../src/TabButton";

/**
 * Stories for [[TabButton]] — [[Tabs]] 한 칸(탭 트리거 버튼 1개).
 *
 * segmented · large 두 variant 와 selected / default / disabled 상태를 시연.
 * tablist 컨테이너 외형을 재현하기 위해 variant 별 배경/보더로 감싼다.
 */
const meta: Meta<typeof TabButton> = {
  title: "Chrome/Parts/TabButton",
  component: TabButton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    spec: { h: 32, padX: 14, gap: 6, text: "text-base" },
    id: "demo-tab",
    fullWidth: false,
    onClick: () => {},
    onKeyDown: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TabButton>;

/* ─── segmented ─── */

/** segmented — 활성(흰 배경 + 그림자). */
export const SegmentedSelected: Story = {
  args: {
    variant: "segmented",
    selected: true,
    item: { value: "1h", label: "1H" },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex rounded-md bg-color-var-color-surface-100 p-2px">
        <Story />
      </div>
    ),
  ],
};

/** segmented — 비활성(미선택, hover 가능). */
export const SegmentedDefault: Story = {
  args: {
    variant: "segmented",
    selected: false,
    item: { value: "6h", label: "6H" },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex rounded-md bg-color-var-color-surface-100 p-2px">
        <Story />
      </div>
    ),
  ],
};

/** segmented — disabled(클릭/포커스 불가). */
export const SegmentedDisabled: Story = {
  args: {
    variant: "segmented",
    selected: false,
    item: { value: "24h", label: "24H", disabled: true },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex rounded-md bg-color-var-color-surface-100 p-2px">
        <Story />
      </div>
    ),
  ],
};

/* ─── large ─── */

/** large — 활성(brand-blue 라벨 + 하단 underline). */
export const LargeSelected: Story = {
  args: {
    variant: "large",
    selected: true,
    item: { value: "rule", label: "룰" },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex items-end border-b border-color-var-color-border-default">
        <Story />
      </div>
    ),
  ],
};

/** large — 비활성(미선택, hover 가능). */
export const LargeDefault: Story = {
  args: {
    variant: "large",
    selected: false,
    item: { value: "scope", label: "Scope" },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex items-end border-b border-color-var-color-border-default">
        <Story />
      </div>
    ),
  ],
};

/** large — disabled(클릭/포커스 불가). */
export const LargeDisabled: Story = {
  args: {
    variant: "large",
    selected: false,
    item: { value: "action", label: "액션", disabled: true },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex items-end border-b border-color-var-color-border-default">
        <Story />
      </div>
    ),
  ],
};
