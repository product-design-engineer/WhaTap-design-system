import type { Meta, StoryObj } from "@storybook/react-vite";
import EventListItem from "../../src/widget/EventListItem";

const meta: Meta<typeof EventListItem> = {
  title: "Primitives/EventListItem",
  component: EventListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**이벤트 행 (part)** — [[AiEventList]] 의 단일 `<li>`. 시간(고정폭) + severity 칩 + 소스 + 한 줄 메시지.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="flex flex-col" style={{ width: 440 }}>
        <Story />
      </ul>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof EventListItem>;

export const Critical: Story = {
  args: {
    time: "14:32",
    tone: "high",
    label: "Critical",
    source: "server-prod-01",
    message: "디스크 사용량 92% 도달",
    isLast: true,
  },
};

export const Warning: Story = {
  args: {
    time: "13:55",
    tone: "mid",
    label: "Warning",
    source: "oracle_dnx/RAC-1",
    message: "Long active session ≥ 5분 — 길어지면 truncate 처리됩니다",
    isLast: true,
  },
};
