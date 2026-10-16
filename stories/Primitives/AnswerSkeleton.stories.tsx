import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnswerSkeleton } from "@whatap/design-system/widget";

/**
 * Stories for [[AnswerSkeleton]] — 답변이 오기 전 자리를 잡아 두는 로딩 카드.
 *
 * 스피너 대신 **최종 답변과 같은 모양의 뼈대**를 깔아, 답변이 도착할 때 레이아웃이 튀지
 * 않게 한다. 그래서 `bullets` 를 실제 답변의 항목 수에 가깝게 준다.
 */
const meta: Meta<typeof AnswerSkeleton> = {
  title: "Primitives/AnswerSkeleton",
  component: AnswerSkeleton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AnswerSkeleton>;

/** 기본 — caption + 제목 + 불릿 3줄. */
export const Default: Story = {};

/** 항목이 많은 답변을 기다릴 때. */
export const ManyBullets: Story = { args: { bullets: 6 } };

/** 반짝임 없음 — [[AiProgress]] 아래에 깔 때. 움직이는 곳은 진행 카드 머리 그림 하나다. */
export const Still: Story = { args: { still: true } };

/** caption 없는 짧은 답변용. */
export const WithoutCaption: Story = { args: { caption: false } };

/** 여러 장을 stagger 로 깔 때 — 카드마다 `delay` 를 120ms 씩 늘린다. */
export const Staggered: Story = {
  render: () => (
    <div className="flex flex-col gap-8px">
      <AnswerSkeleton bullets={2} delay={0} />
      <AnswerSkeleton bullets={3} delay={120} caption={false} />
    </div>
  ),
};
