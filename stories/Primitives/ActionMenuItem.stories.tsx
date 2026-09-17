import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionMenuItem } from "@whatap/design-system";

/**
 * Stories for [[ActionMenuItem]] — [[ActionMenu]] 패널 안에 서는 «행동» 한 줄.
 */
const meta: Meta<typeof ActionMenuItem> = {
  title: "Primitives/ActionMenuItem",
  component: ActionMenuItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**누르면 일이 시작되는 한 줄.** 값을 고르는 것이 아니라서 체크 표시가 없다 — " +
          "체크는 「지금 이게 켜져 있다」는 뜻이라 화면이 넘어가는 줄에 붙으면 거짓말이 된다. " +
          "값을 고르는 줄은 [[FilterDropdownOptionItem]], 화면을 이동하는 줄은 [[SidebarMenuItem]], " +
          "목록의 한 건은 [[ListRow]] 다. 보통 직접 부르지 않고 [[ActionMenu]] 가 부른다. " +
          "`tone=\"critical\"` 은 되돌릴 수 없는 일에만 쓰고, 그 일은 이 줄에서 끝내지 않는다 — " +
          "확인 한 단계를 [[Modal]] 로 받는다.",
      },
    },
  },
  argTypes: {
    tone: {
      description: "성격 — critical 은 되돌릴 수 없는 일에만.",
      control: { type: "radio" },
      options: ["default", "critical"],
    },
    label: { description: "줄에 적히는 말. 되도록 동사로.", control: "text" },
    description: { description: "보조 한 줄 — 무슨 일이 일어나는지.", control: "text" },
    disabled: { description: "비활성.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof ActionMenuItem>;

/** 기본 — 라벨 한 줄. */
export const Default: Story = {
  args: { label: "이름 바꾸기" },
};

/** 설명이 붙는 줄 — 라벨이 명사일 수밖에 없을 때 무슨 일이 일어나는지 적는다. */
export const WithDescription: Story = {
  args: { label: "AI 보고서", description: "대화로 조건을 잡는다" },
};

/** critical — 되돌릴 수 없는 일. 확인 한 단계는 [[Modal]] 이 받는다. */
export const Critical: Story = {
  args: { label: "삭제", tone: "critical" },
};

/** 비활성 — 왜 못 하는지까지 적는다. 이유를 말할 수 없으면 아예 빼는 편이 낫다. */
export const Disabled: Story = {
  args: { label: "PDF 로 내려받기", description: "생성이 끝나야 받을 수 있다", disabled: true },
};
