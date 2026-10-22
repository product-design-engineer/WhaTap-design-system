import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterSelect } from "@whatap/design-system";

/** Stories for [[FilterSelect]] — 필터 줄의 드롭다운 트리거. */
const meta: Meta<typeof FilterSelect> = {
  title: "Primitives/FilterSelect",
  component: FilterSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**여는 자리만 맡는 버튼.** 고른 값이 없으면 기준 이름을, 고르고 나면 「첫 값 외 N」 요약을 " +
          "자기 얼굴로 쓴다. 고른 값이 있으면 **테두리와 글자색만** 바뀐다 — 배경을 칠하면 기준이 " +
          "네다섯 서는 필터 줄이 얼룩진다. 열리는 목록은 [[FilterDropdown]], 고른 낱낱은 아래 줄의 " +
          "[[Chip]] 이 진다.",
      },
    },
  },
  argTypes: {
    label: { description: "기준 이름. 고른 값이 없을 때 얼굴.", control: "text" },
    summary: { description: "고른 값 요약 — 「첫 값 외 N」.", control: "text" },
    active: { description: "고른 값이 하나라도 있는가.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof FilterSelect>;

/** 비어 있음 — 기준 이름이 선다. */
export const Idle: Story = { args: { label: "상태", active: false } };

/** 하나 고름. */
export const One: Story = { args: { label: "상태", summary: "사용 중", active: true } };

/** 여럿 고름 — 「첫 값 외 N」. */
export const Many: Story = { args: { label: "상태", summary: "사용 중 외 2", active: true } };

/** 필터 줄 — 기준이 나란히 선다. minWidth 132 라 들쭉날쭉하지 않다. */
export const Row: Story = {
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(false);
      return (
        <div className="flex items-center gap-8px">
          <FilterSelect label="상태" summary={on ? "사용 중 외 2" : undefined} active={on} onClick={() => setOn((v) => !v)} />
          <FilterSelect label="플랜 종류" active={false} />
          <FilterSelect label="담당자" active={false} />
        </div>
      );
    };
    return <Demo />;
  },
};
