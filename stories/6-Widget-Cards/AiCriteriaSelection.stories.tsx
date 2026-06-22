import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCriteriaSelection } from "@whatap/design-system/widget";

const meta: Meta<typeof AiCriteriaSelection> = {
  title: "Composite/Ai/AiCriteriaSelection",
  component: AiCriteriaSelection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**분류 기준 선택 카드** — reasoning 본문 + 기준 그룹(low/mid/high) 시각화 + 선택 가능 옵션 버튼.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiCriteriaSelection>;

export const Default: Story = {
  args: {
    body: "GPU 활용도 분류 기준을 어떻게 잡을지 결정해주세요.",
    groups: [
      { tone: "high", title: "고활용", detail: "≥ 80% — 즉시 추가 자원 필요" },
      { tone: "mid",  title: "활용",   detail: "50–80% — 모니터링 필요" },
      { tone: "low",  title: "저활용", detail: "< 50% — 최적화 후보" },
    ],
    notes: ["기준은 시나리오 종료까지 유지됩니다."],
    options: [
      { key: "default", label: "기본 기준 (50/80%) 으로 진행" },
      { key: "conservative", label: "보수적 기준 (30/70%) 으로 진행" },
      { key: "strict", label: "엄격한 기준 (60/90%) 으로 진행" },
      { key: "manual", label: "기준을 직접 입력하겠습니다" },
    ],
  },
};
