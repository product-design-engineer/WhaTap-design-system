import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompoundEyeCell } from "@whatap/design-system";

/**
 * Stories for [[CompoundEyeCell]] — 서버 한 대 = 원 하나. 부채꼴 셋(반지름 = 사용률) + 반 링 둘(수신 · 송신).
 */
const meta: Meta<typeof CompoundEyeCell> = {
  title: "Primitives/Chart/CompoundEyeCell",
  component: CompoundEyeCell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**컴파운드아이 칸.** 부채꼴 자리 = 지표(CPU 위 · 메모리 오른쪽 아래 · 디스크 왼쪽 아래), 반지름 = 사용률(안쪽 원 50% · 100%). " +
          "바깥 반 링은 [[ChartArc]] 두 개 — 오른쪽 수신 · 왼쪽 송신, 12시에서 아래로 찬다. 상태는 바탕만.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CompoundEyeCell>;

/** 정상. */
export const Normal: Story = {
  args: { name: "web-01", cpu: 42, memory: 68, disk: 31, rxRatio: 0.4, txRatio: 0.15 },
};

/** 위험 — 바탕만 바뀌고 부채꼴 색은 그대로. 디스크가 부푼 칸. */
export const Critical: Story = {
  args: { name: "python-demo-attack", cpu: 35, memory: 52, disk: 97, rxRatio: 0.9, txRatio: 1, status: "critical" },
};

/** 경고 · 수집 없음(메모리) 섞임. */
export const WarningPartial: Story = {
  args: { name: "batch-03", cpu: 88, memory: null, disk: 44, rxRatio: 0.05, txRatio: null, status: "warning" },
};

/** 범례 hover — CPU 만 남긴다. */
export const Focused: Story = {
  args: { name: "web-01", cpu: 42, memory: 68, disk: 31, rxRatio: 0.4, txRatio: 0.15, focus: "cpu" },
};
