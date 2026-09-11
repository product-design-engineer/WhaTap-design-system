import type { Meta, StoryObj } from "@storybook/react-vite";
import { KpiField } from "@whatap/design-system";

/** Stories for [[KpiField]] — 카드 머리의 속성 한 칸. */
const meta: Meta<typeof KpiField> = {
  title: "Primitives/KpiField",
  component: KpiField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**라벨 위 · 값 아래.** 값이 굵고 라벨은 그대로다 — 이 행에서 읽히는 것은 값이고, " +
          "라벨은 그 값이 무엇인지 가리키는 말이다. 라벨을 값 왼쪽에 두지 않는 이유는 값의 길이가 " +
          "제각각이라 세로선이 맞지 않기 때문이다. 한 칸만 세울 일은 거의 없고 보통 2~4칸을 그리드로 늘어놓는다.",
      },
    },
  },
  argTypes: {
    label: { description: "값이 무엇인지 가리키는 말. 짧게.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof KpiField>;

export const Default: Story = { args: { label: "플랜 종류", children: "종량제" } };

/** 그리드 — 실제로 쓰이는 모양. 폭은 담는 그리드가 정한다. */
export const Grid: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 720 }}>
      <KpiField label="플랜 종류">종량제</KpiField>
      <KpiField label="사용량 한계">500,000원 (250,000 크레딧)</KpiField>
      <KpiField label="담긴 계정">12명</KpiField>
      <KpiField label="다음 청구일">2026-09-01</KpiField>
    </div>
  ),
};

/** 값에 다른 크기를 줄 때 — children 안에서 감싼다. */
export const BigValue: Story = {
  render: () => (
    <KpiField label="누적 크레딧">
      <span className="text-lg font-semibold text-primary">128,400</span>
    </KpiField>
  ),
};
