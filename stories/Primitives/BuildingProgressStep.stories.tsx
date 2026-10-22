import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingProgressStep } from "@whatap/design-system";

/**
 * Stories for [[BuildingProgressStep]] — 구성 진행 목록의 한 줄.
 */
const meta: Meta<typeof BuildingProgressStep> = {
  title: "Primitives/BuildingProgressStep",
  component: BuildingProgressStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**완료 ✓ · 진행(도는 원) · 대기(빈 원, 흐림).** [[DashboardBuildingProgress]] 가 이 줄을 쌓는다. 실제 처리 수 · 중간 " +
          "발견을 말해야 하는 AI 연산 진행은 [[AiProgressStep]] (patterns §24).",
      },
    },
  },
  decorators: [(Story) => (<ul className="flex flex-col gap-5px" style={{ listStyle: "none", margin: 0, padding: 0 }}><Story /></ul>)],
};
export default meta;
type Story = StoryObj<typeof BuildingProgressStep>;

/** 완료. */
export const Done: Story = { args: { label: "지표 수집", state: "done" } };

/** 진행 중. */
export const Active: Story = { args: { label: "위젯 배치", state: "active" } };

/** 대기. */
export const Pending: Story = { args: { label: "렌더링", state: "pending" } };

/** 목록 — 완료 둘 · 진행 하나 · 대기 하나. */
export const InList: Story = {
  render: () => (
    <>
      <BuildingProgressStep label="지표 수집" state="done" />
      <BuildingProgressStep label="위젯 배치" state="done" />
      <BuildingProgressStep label="임계값 적용" state="active" />
      <BuildingProgressStep label="렌더링" state="pending" />
    </>
  ),
};
