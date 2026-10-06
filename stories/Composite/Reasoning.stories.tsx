import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reasoning } from "@whatap/design-system/widget";

const meta: Meta<typeof Reasoning> = {
  title: "Composite/Reasoning",
  component: Reasoning,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**AI 추론 단계 표시.** `steps` 배열의 각 항목에 running 진행 중 / 완료 ✓ 상태 토글. " +
          "도구 호출 / 데이터 분석 / 결과 도출 등 단계별 진행 표시에 사용.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Reasoning>;

export const AllRunning: Story = {
  args: {
    steps: [
      { label: "스레드 상태 조회 중...", running: true },
      { label: "이상 패턴 감지 중...", running: true },
    ],
  },
};

export const MixedProgress: Story = {
  args: {
    steps: [
      { label: "스레드 상태 조회", running: false },
      { label: "차트 데이터 시각화", running: false },
      { label: "원인 가설 도출 중...", running: true },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    steps: [
      { label: "Pod 메트릭 조회 완료" },
      { label: "이벤트 로그 분석 완료" },
      { label: "MIG 슬라이스 상태 확인 완료" },
      { label: "결론 도출 완료" },
    ],
  },
};
