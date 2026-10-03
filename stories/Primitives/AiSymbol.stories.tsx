import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiSymbol } from "@whatap/design-system";

/**
 * Stories for [[AiSymbol]] — WhaTap AI pinwheel symbol with gradient.
 */
const meta: Meta<typeof AiSymbol> = {
  title: "Primitives/Symbol",
  component: AiSymbol,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**WhaTap AI 브랜드 심볼.** 4-blade pinwheel + 청보라 그라데이션 (`--color-whatap-blue` → `--color-whatap-purple`). " +
          "AI 위젯 헤더, AI 토글 버튼, AI 응답 메시지 분류 등 브랜드 식별이 필요한 모든 자리에 사용. " +
          "`size` prop 으로 px 크기 조정 (viewBox 가 그대로 스케일).",
      },
    },
  },
  argTypes: {
    size: {
      description: "심볼 픽셀 크기 (정사각). 기본 16. 16/24/32/40/48 권장.",
      control: { type: "number", min: 8, max: 96, step: 4 },
    },
    className: {
      description: "wrapper SVG 의 추가 className.",
      control: "text",
    },
  },
};
export default meta;
type Story = StoryObj<typeof AiSymbol>;

/** 기본 — 16px (위젯 헤더 자리에 가장 흔한 크기). */
export const Default: Story = {
  args: { size: 16 },
};

/** 작은 인라인 — 12px (메시지 안에 inline 표시). */
export const InlineSmall: Story = {
  args: { size: 12 },
};

/** 위젯 헤더 — 24px. */
export const WidgetHeader: Story = {
  args: { size: 24 },
};

/** AI 토글 버튼 — 32px. */
export const ToggleButton: Story = {
  args: { size: 32 },
};

/** 브랜드 강조 — 64px (랜딩, intro 화면). */
export const BrandLarge: Story = {
  args: { size: 64 },
};

/** 5개 크기 한 화면 비교. */
export const SizeMatrix: Story = {
  args: {},
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {[12, 16, 24, 32, 48, 64].map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <AiSymbol size={s} />
          <span style={{ fontFamily: "Roboto, monospace", fontSize: 10, color: "var(--color-text-tertiary)" }}>{s}px</span>
        </div>
      ))}
    </div>
  ),
};
