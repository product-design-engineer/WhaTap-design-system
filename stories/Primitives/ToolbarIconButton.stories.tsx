import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToolbarIconButton, ToolbarIcon } from "@whatap/design-system";

/**
 * Stories for [[ToolbarIconButton]] — 툴바의 아이콘 전용 버튼(+ [[ToolbarIcon]] 래퍼).
 *
 * 라벨이 없는 버튼이므로 `label` 이 **접근성 이름이자 툴팁**이다 — 둘을 따로 주지 않는다.
 * 크기는 화면에서 px 로 쓰지 않고 `--wds-toolbar-*` 토큰이 소유한다. 이 컴포넌트의 높이
 * 토큰이 정의되지 않아 폭이 auto 로 퍼진 적이 있는데, **스토리가 없어 DOM 감사 대상에서도
 * 빠져 있었다** — 이 스토리가 그 구멍을 메운다.
 */
const meta: Meta<typeof ToolbarIconButton> = {
  title: "Primitives/ToolbarIconButton",
  component: ToolbarIconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "설정", icon: "icon-settings.svg" },
};
export default meta;
type Story = StoryObj<typeof ToolbarIconButton>;

/** 기본 — hover 시 라벨이 툴팁으로 뜬다. */
export const Default: Story = {};

/** 눌린 상태(토글 컨트롤). `aria-pressed` 로도 노출된다. */
export const Active: Story = { args: { active: true } };

/** 비활성 — 조건이 갖춰지지 않아 실행할 수 없는 컨트롤. */
export const Disabled: Story = { args: { disabled: true } };

/** 툴바가 화면 맨 위에 붙어 있으면 툴팁을 아래로. */
export const TooltipBottom: Story = { args: { tooltipPlacement: "bottom" } };

/** 인라인 SVG 도 받는다 — asset 이름이 없는 1회성 아이콘. */
export const InlineSvg: Story = {
  args: {
    label: "새로고침",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="100%" height="100%">
        <path
          d="M13 8a5 5 0 1 1-1.46-3.54M13 3v3h-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

/** `ToolbarIcon` — 버튼 껍데기가 이미 있는 컨트롤 **안**에 놓이는 아이콘. `xs` 는 caret 등 보조 표식. */
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-8px">
      <ToolbarIcon name="icon-settings.svg" />
      <ToolbarIcon name="icon-settings.svg" size="xs" />
    </div>
  ),
};
