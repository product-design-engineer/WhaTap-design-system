import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiClassificationTable } from "@whatap/design-system/widget";

const meta: Meta<typeof AiClassificationTable> = {
  title: "Composite/ClassificationTable",
  component: AiClassificationTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**GPU/리소스 분류 표** — GPU별 활용도 분류 결과 + 톤 배지. high/mid/low/idle 4단계 배지로 한 눈에 활용도 분포 확인.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiClassificationTable>;

export const GpuClassification: Story = {
  args: {
    caption: "GPU 사용 패턴 분류",
    description: "최근 4시간 동안의 GPU별 utilization 평균/최대/최소 + 활성 Pod 수 + 분류 결과.",
    rows: [
      { gpu: 0, model: "A100", avg: "95%", max: "98%", min: "82%", pod: "inference-prod", tone: "high" },
      { gpu: 1, model: "A100", avg: "65%", max: "78%", min: "42%", pod: "training-batch", tone: "mid" },
      { gpu: 2, model: "T4",   avg: "12%", max: "28%", min: "0%",  pod: "analytics-eda",  tone: "low" },
      { gpu: 3, model: "T4",   avg: "0%",  max: "0%",  min: "0%",  pod: "(none)",         tone: "idle" },
    ],
  },
};

export const WithWarning: Story = {
  args: {
    caption: "GPU 분류 결과",
    warning: "T4 GPU 2개는 1주 이상 idle 상태입니다.",
    rows: [
      { gpu: 0, model: "A100", avg: "95%", max: "98%", min: "82%", pod: "inference-prod", tone: "high" },
      { gpu: 1, model: "T4", avg: "0%", max: "0%", min: "0%", pod: "(none)", tone: "idle" },
    ],
  },
};
