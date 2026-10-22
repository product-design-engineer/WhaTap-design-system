import type { Meta, StoryObj } from "@storybook/react-vite";
import { TargetMeshCluster } from "@whatap/design-system/widget";

/**
 * Stories for [[TargetMeshCluster]] — 대상 종류 하나의 점 덩어리 + 이름 + 수치.
 */
const meta: Meta<typeof TargetMeshCluster> = {
  title: "Primitives/TargetMeshCluster",
  component: TargetMeshCluster,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**점 하나 = 대상 하나.** 덩어리 면적이 개수이고, 이상 점은 가운데부터 · 수집 없음은 바깥 테두리부터 빈 점. " +
          "[[TargetMesh]] 가 종류마다 이것을 1/N 등폭으로 세운다. `scale` 은 전 종류 공통값을 넘긴다.",
      },
    },
  },
  decorators: [(Story) => (<div className="flex" style={{ width: 120 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof TargetMeshCluster>;

/** 정상 대부분 + 이상 5(위험 2 · 경고 3). */
export const WithAlerts: Story = {
  args: { item: { short: "APM", label: "APM 애플리케이션", total: 24, warning: 3, critical: 2 }, scale: 1, revealed: true, interactive: true },
};

/** 수집 없음 — 바깥 테두리부터 빈 점, «수집 없음 12». */
export const WithMissing: Story = {
  args: { item: { short: "서버", label: "서버", total: 46, warning: 5, critical: 1, missing: 12 }, scale: 1, revealed: true, interactive: true },
};

/** 판정 전 — 꺼진 군집(투명 · 6px 아래), 누를 수 없음. */
export const NotRevealed: Story = {
  args: { item: { short: "DB", label: "데이터베이스", total: 18, warning: 1, critical: 0 }, scale: 1, revealed: false, interactive: false },
};
