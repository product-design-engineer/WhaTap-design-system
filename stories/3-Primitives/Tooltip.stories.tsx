import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "@whatap/design-system";

/**
 * Stories for [[Tooltip]] — Primitives 툴팁.
 *
 * 짧은 보조 정보 표시. 아이콘 only 버튼·폼 helper·DataTable 행 hover 등에 사용.
 */
const meta: Meta<typeof Tooltip> = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**짧은 보조 정보 표시.** hover/focus 양쪽 트리거, 키보드(Escape) 지원, 4 방향 배치. " +
          "1-2 문장의 microcopy 전달용 — 더 긴 본문은 다른 컴포넌트 사용.",
      },
    },
  },
  argTypes: {
    content: { description: "툴팁 본문 (ReactNode).", control: "text" },
    placement: {
      description: "배치 방향.",
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
    hoverDelayMs: {
      description: "hover 시 표시 지연 ms (focus 는 즉시).",
      control: { type: "number", min: 0, max: 1000, step: 50 },
    },
    open: {
      description: "강제 표시 (디버그). undefined 면 자동.",
      control: { type: "boolean" },
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/** 기본 — top placement, hover/focus 트리거. */
export const Default: Story = {
  args: {
    content: "평일 09–19시 알림만 ON",
    children: (
      <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5 text-base">
        도움말 ?
      </button>
    ),
  },
};

/** placement 4종. */
export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-12">
      <Tooltip content="위에 표시" placement="top">
        <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5">top</button>
      </Tooltip>
      <Tooltip content="아래에 표시" placement="bottom">
        <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5">bottom</button>
      </Tooltip>
      <Tooltip content="왼쪽에 표시" placement="left">
        <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5">left</button>
      </Tooltip>
      <Tooltip content="오른쪽에 표시" placement="right">
        <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5">right</button>
      </Tooltip>
    </div>
  ),
};

/** 강제 표시 — `open=true`. 디버그/디자인 확인용. */
export const Pinned: Story = {
  args: {
    open: true,
    content: "이 툴팁은 강제 표시됨 (open=true)",
    children: (
      <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5 text-base">
        트리거
      </button>
    ),
  },
};

/** 아이콘 only 버튼 + ARIA 라벨 역할. */
export const IconOnly: Story = {
  render: () => (
    <Tooltip content="설정 — 알림 채널 편집">
      <button
        aria-label="설정"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-strong)]"
      >
        ⚙
      </button>
    </Tooltip>
  ),
};

/** disabled tooltip — hover/focus 해도 안 뜸. */
export const Disabled: Story = {
  args: {
    disabled: true,
    content: "안 보일 메시지",
    children: (
      <button className="rounded-md border border-[color:var(--color-border-strong)] px-3 py-1.5 opacity-60">
        disabled tooltip
      </button>
    ),
  },
};
