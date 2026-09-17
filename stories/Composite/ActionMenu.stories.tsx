import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionMenu, Button, ToolbarIconButton } from "@whatap/design-system";

/**
 * Stories for [[ActionMenu]] — 트리거를 누르면 펼쳐지는 «행동» 목록.
 */
const meta: Meta<typeof ActionMenu> = {
  title: "Composite/ActionMenu",
  component: ActionMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**한 버튼에 갈래가 여럿 매달릴 때 그 갈래를 담는 패널.** 고르는 순간 닫히고 일이 시작된다 — " +
          "값이 바뀌는 것이 아니다. 값을 고르는 자리는 [[Select]](단일) · [[FilterDropdown]](다중) 이고, " +
          "행동이 하나뿐이면 [[Button]] 그대로 둔다(갈래 없는 ▾ 는 한 번 더 누르게 만든다). " +
          "줄은 [[ActionMenuItem]] 이 그리며 바깥 클릭 · `Esc` · `↑`/`↓` 가 내장이다. " +
          "패널이 `absolute` 라 감싸는 쪽에 `overflow: hidden` 이 있으면 잘린다.",
      },
    },
  },
  argTypes: {
    placement: {
      description: "펼침 위치 — 트리거가 화면 오른쪽에 붙어 있으면 bottom-end.",
      control: { type: "radio" },
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    width: { description: "패널 width(px). 기본 200.", control: { type: "number" } },
    disabled: { description: "트리거 비활성.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof ActionMenu>;

/** 생성 갈래 — 「＋ 보고서 ▾」 가 두 갈래로 나뉜다. 설명 줄이 무슨 일이 일어나는지 말한다. */
export const CreateBranch: Story = {
  args: {
    trigger: (
      <Button variant="contained" tone="primary" size="lg">
        ＋ 보고서 ▾
      </Button>
    ),
    placement: "bottom-end",
    width: 220,
    items: [
      { key: "ai", label: "AI 보고서", description: "대화로 조건을 잡는다" },
      { key: "regular", label: "정기 보고서 템플릿", description: "양식을 골라 주기로 받는다" },
    ],
  },
};

/** 행 케밥 — 목록 한 건에 붙는 `⋮`. 되돌릴 수 없는 「삭제」만 critical 이다. */
export const RowKebab: Story = {
  args: {
    trigger: <ToolbarIconButton icon="⋮" label="더 보기" />,
    placement: "bottom-end",
    width: 160,
    items: [
      { key: "rename", label: "이름 바꾸기" },
      { key: "duplicate", label: "복제" },
      { key: "delete", label: "삭제", tone: "critical" },
    ],
  },
};

/** 비활성 줄 — 지금은 할 수 없는 일. 이유를 말할 수 없으면 아예 빼는 편이 낫다. */
export const WithDisabledAction: Story = {
  args: {
    trigger: <Button variant="outline" size="lg">내보내기 ▾</Button>,
    width: 200,
    items: [
      { key: "csv", label: "CSV 로 내려받기" },
      { key: "pdf", label: "PDF 로 내려받기", disabled: true, description: "생성이 끝나야 받을 수 있다" },
    ],
  },
};
