import type { Meta, StoryObj } from "@storybook/react-vite";
import { UsageGauge } from "@whatap/design-system";

/** Stories for [[UsageGauge]] — 한계 대비 소비량 막대. */
const meta: Meta<typeof UsageGauge> = {
  title: "Primitives/UsageGauge",
  component: UsageGauge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**6px 막대 하나.** 트랙이 전체(`--color-surface-100`), 채운 만큼이 쓴 양이다. " +
          "**톤은 호출부가 정한다** — 「남은 여유 20% 이하면 warning」 같은 기준은 제품 규칙이지 " +
          "디자인 시스템의 것이 아니다. 분모가 없으면(한계 없는 plan) 아예 그리지 않는다 — " +
          "채움 비율이 뜻을 갖지 못한다.",
      },
    },
  },
  argTypes: {
    percent: { description: "채움 비율 0~100. 범위를 벗어나면 잘라 쓴다.", control: { type: "range", min: 0, max: 100, step: 1 } },
    tone: { description: "성격. 기준은 호출부가 정한다.", control: { type: "radio" }, options: ["neutral", "warning", "critical"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof UsageGauge>;

export const Neutral: Story = { args: { label: "청구 사용량", percent: 42, tone: "neutral" } };

/** 남은 여유가 얼마 없을 때 — 기준은 과금 화면의 `limitTone` 이 정한다. */
export const Warning: Story = { args: { label: "청구 사용량", percent: 86, tone: "warning" } };

/** 다 썼을 때. */
export const Critical: Story = { args: { label: "청구 사용량", percent: 100, tone: "critical" } };

/** 숫자와 함께 선다 — 막대만으로는 얼마나 남았는지 못 읽는다. */
export const WithValue: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="flex items-center justify-between">
        <span className="text-base text-secondary">누적 크레딧</span>
        <span className="text-base text-primary" style={{ fontFamily: "var(--font-family-numeric)" }}>
          215,000 / 250,000
        </span>
      </div>
      <UsageGauge label="누적 크레딧" percent={86} tone="warning" />
    </div>
  ),
};
