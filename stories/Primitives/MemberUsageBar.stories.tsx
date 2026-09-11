import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemberUsageBar } from "@whatap/design-system";

/** Stories for [[MemberUsageBar]] — 사람별 사용량 한 줄. */
const meta: Meta<typeof MemberUsageBar> = {
  title: "Primitives/MemberUsageBar",
  component: MemberUsageBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**이름 · 값 · 막대 한 줄.** 여러 사람을 쌓았을 때 누가 많이 썼는지가 막대 길이로 보인다. " +
          "막대 색은 **항상 brand-blue** 다 — 분모가 사용량 한계가 아니라 «플랜 전체 사용량» 이라 " +
          "많이 썼다는 것이 곧 위험은 아니다. 한계 대비 소비량은 [[UsageGauge]] 의 몫이다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MemberUsageBar>;

export const Default: Story = { args: { name: "김현수", value: "42,100", percent: 68 } };

/** 목록 — 여럿을 쌓았을 때 뜻이 선다. */
export const List: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <MemberUsageBar name="김현수" value="42,100" percent={68} />
      <MemberUsageBar name="이서연" value="28,400" percent={46} />
      <MemberUsageBar name="박지훈" value="12,900" percent={21} />
      <MemberUsageBar name="최민영" value="3,200" percent={5} />
    </div>
  ),
};

/** 이름이 길면 줄어들고 값은 줄어들지 않는다 — 값이 잘리면 줄의 쓸모가 없다. */
export const LongName: Story = {
  args: { name: "플랫폼개발팀 · 데이터플랫폼파트 · 김현수", value: "42,100", percent: 68 },
};
