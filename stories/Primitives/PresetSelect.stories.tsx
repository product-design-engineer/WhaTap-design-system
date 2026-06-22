import type { Meta, StoryObj } from "@storybook/react-vite";
import { PresetSelect } from "@whatap/design-system";

/**
 * Stories for [[PresetSelect]] — 프리셋 드롭다운 + 관리 아이콘 버튼.
 */
const meta: Meta<typeof PresetSelect> = {
  title: "Primitives/PresetSelect",
  component: PresetSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**우측 정렬 프리셋 드롭다운 + 저장/관리 아이콘 버튼.** DB / Server / APM 모든 페이지의 우측 옵션바에서 " +
          "동일하게 사용. 라이브 SPA 의 `PresetSelector-styles__DropdownText` 마크업 그대로.",
      },
    },
  },
  argTypes: {
    label: { description: "현재 선택된 프리셋 라벨.", control: "text" },
    width: { description: "드롭다운 버튼 너비 (px). 기본 230.", control: { type: "number", min: 120, max: 400, step: 10 } },
  },
};
export default meta;
type Story = StoryObj<typeof PresetSelect>;

/** 기본 프리셋 — 라이브 기본값. */
export const Default: Story = { args: { label: "Default" } };

/** Custom 프리셋 — 사용자 저장 프리셋. */
export const CustomPreset: Story = { args: { label: "운영 — 주간 모니터링" } };

/** 좁은 너비 — 사이드 패널 용. */
export const NarrowWidth: Story = { args: { label: "Default", width: 160 } };

/** 긴 라벨 — truncate 동작. */
export const LongLabel: Story = {
  args: { label: "Production · GPU 클러스터 · A100 80GB × 4 prod-mig-config", width: 230 },
};
