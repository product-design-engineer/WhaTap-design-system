import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepsTimeline } from "@whatap/design-system/widget";

const meta: Meta<typeof StepsTimeline> = {
  title: "Composite/StepsTimeline",
  component: StepsTimeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**진행 step timeline** — 각 step 의 spinner/✓ 상태 표시. 등록·실행 시퀀스 시각화에 사용.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof StepsTimeline>;

export const InProgress: Story = {
  args: {
    steps: [
      { label: "Critical 임계값 검증", running: false },
      { label: "수신 채널 확인", running: false },
      { label: "알림 룰 등록 중...", running: true },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    steps: [
      { label: "Critical 임계값 검증" },
      { label: "수신 채널 확인" },
      { label: "알림 룰 등록" },
      { label: "테스트 알림 발송" },
    ],
  },
};
