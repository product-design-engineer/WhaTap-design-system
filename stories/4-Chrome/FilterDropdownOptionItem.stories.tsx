import type { Meta, StoryObj } from "@storybook/react-vite";
import FilterDropdownOptionItem from "../../src/FilterDropdownOptionItem";

/**
 * Stories for [[FilterDropdownOptionItem]] — FilterDropdown options 모드의 한 옵션 행.
 *
 * Checkbox + 라벨 + 우측 count 로 구성. `option` 데이터 + `checked` 상태로 제어.
 * 240px 폭 컨테이너로 감싸 실제 드롭다운 패널 본문 맥락을 재현.
 */
const meta: Meta<typeof FilterDropdownOptionItem> = {
  title: "Chrome/Parts/FilterDropdownOptionItem",
  component: FilterDropdownOptionItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 240,
          padding: "8px 12px",
          background: "var(--color-card)",
          border: "1px solid var(--color-border-default)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof FilterDropdownOptionItem>;

/** 미선택 — 빈 체크박스 + 라벨 + count. */
export const Unchecked: Story = {
  args: {
    option: { value: "jvm", label: "JVM", count: 43 },
    checked: false,
    onToggle: () => {},
  },
};

/** 선택됨 — 체크된 체크박스 + 라벨 + count. */
export const Checked: Story = {
  args: {
    option: { value: "disk", label: "Disk", count: 12 },
    checked: true,
    onToggle: () => {},
  },
};
