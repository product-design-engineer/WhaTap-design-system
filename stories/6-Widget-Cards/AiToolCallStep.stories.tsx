import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiToolCallStep } from "@whatap/design-system/widget";

const meta: Meta<typeof AiToolCallStep> = {
  title: "WhaTap AI/Cards/AiToolCallStep",
  component: AiToolCallStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**MCP 도구 호출 진행 카드** — 도구명 + 진행 step count + 본문(JSON/결과) + 펼침/접힘 토글.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiToolCallStep>;

export const Running: Story = {
  args: {
    toolName: "whatap_thread_state",
    stepsCompleted: 2,
    running: true,
    body: "프로젝트 ID: 3396\n시간 범위: 최근 5분\n메트릭: active_thread_states",
  },
};

export const Completed: Story = {
  args: {
    toolName: "whatap_visualize_chart",
    stepsCompleted: 3,
    running: false,
    body: "5개 시리즈 차트 생성 완료\n- method, sql, dbc, httpc, socket\n- httpc dominant 감지",
  },
};

export const Collapsed: Story = {
  args: {
    toolName: "whatap_query_kube_event",
    stepsCompleted: 1,
    running: false,
    defaultOpen: false,
    body: "(접힌 상태 — 클릭으로 펼치기)",
  },
};
