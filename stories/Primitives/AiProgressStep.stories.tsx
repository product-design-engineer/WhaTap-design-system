import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiProgressStep } from "@whatap/design-system/widget";

const meta: Meta<typeof AiProgressStep> = {
  title: "Primitives/AiProgressStep",
  component: AiProgressStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**진행 카드의 단계 한 줄.** 상태 넷: 대기 · 진행 · 완료 · 중단. 진행 단계에는 실제 처리 수, 완료 단계에는 무엇을 했는지 한 줄, " +
          "단계 아래에는 중간 발견 칩. [[AiProgress]] 가 `steps.map` 으로 그린다.",
      },
    },
  },
  argTypes: {
    status: { control: "inline-radio", options: ["pending", "active", "done", "halted"] },
  },
  decorators: [
    (Story) => (
      <ul className="bg-card border border-color-var-color-border-default rounded-8px" style={{ width: 456, margin: 0, padding: "6px 12px", listStyle: "none" }}>
        <Story />
      </ul>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AiProgressStep>;

/** 대기 — 첫 단계가 시작된 뒤 남은 단계. 흐리게 둔다. */
export const Pending: Story = { args: { status: "pending", label: "분석 정보 작성" } };

/** 진행 — 분모가 있을 때만 처리 수를 보인다. */
export const Active: Story = {
  args: { status: "active", label: "데이터 수집", count: { value: 8, total: 12, unit: "에이전트" } },
};

/** 진행 + 중간 발견 — 답보다 먼저 꺼낸다. */
export const ActiveWithFindings: Story = {
  args: {
    status: "active",
    label: "데이터 분석",
    count: { value: 1102, total: 1284, unit: "트랜잭션" },
    findings: ["15:02 응답시간 평소의 4.8배", "DB 커넥션 대기 비중 71%"],
  },
};

/** 완료 — 무엇을 했는지 한 줄. */
export const Done: Story = {
  args: { status: "done", label: "데이터 수집", detail: "에이전트 12개 · 응답시간 · TPS · 에러율" },
};

/** 중단 — 진행 중이던 단계만 바뀐다. */
export const Halted: Story = { args: { status: "halted", label: "데이터 분석", findings: ["15:02 응답시간 평소의 4.8배"] } };
