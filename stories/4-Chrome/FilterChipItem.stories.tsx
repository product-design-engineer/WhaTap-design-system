import type { Meta, StoryObj } from "@storybook/react-vite";
import FilterChipItem from "../../src/FilterChipItem";

/**
 * Stories for [[FilterChipItem]] — FilterBar 의 "선택됨" row 한 항목(closable 칩).
 *
 * 선택된 필터 한 건을 `"<dropdownLabel>: <optionLabel>"` 형태 closable FilterChip(sm)
 * 으로 렌더. × 클릭 시 `onRemove` 호출.
 */
const meta: Meta<typeof FilterChipItem> = {
  title: "Chrome/Parts/FilterChipItem",
  component: FilterChipItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FilterChipItem>;

/** 기본 — 카테고리 필터 한 건. */
export const Default: Story = {
  args: {
    item: { dKey: "category", dLabel: "카테고리", value: "disk", label: "Disk" },
    onRemove: () => {},
  },
};

/** 긴 라벨 — 심각도 필터 한 건. */
export const Severity: Story = {
  args: {
    item: { dKey: "severity", dLabel: "심각도", value: "critical", label: "Critical" },
    onRemove: () => {},
  },
};
