import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiUnavailableNotice, AI_UNAVAILABLE_PRESETS } from "@whatap/design-system/widget";

/**
 * Stories for [[AiUnavailableNotice]] — AI 를 **쓸 수 없는 이유**를 위젯 본문에 세우는 안내.
 *
 * 빈 화면이나 비활성 버튼으로 두지 않는 이유: 사용자는 «고장»과 «권한 없음»과 «준비 중»을
 * 구분하지 못하면 같은 시도를 반복한다. 사유별 문구는 `AI_UNAVAILABLE_PRESETS` 가 단일
 * 출처이고, 개별 prop 으로 덮어쓸 수 있다.
 */
const meta: Meta<typeof AiUnavailableNotice> = {
  title: "Composite/Ai/AiUnavailableNotice",
  component: AiUnavailableNotice,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiUnavailableNotice>;

/** 플랜 미포함 — 업그레이드 경로가 있으므로 액션을 함께 준다. */
export const Plan: Story = { args: { reason: "plan", onAction: () => {} } };

/** 사용량 초과. */
export const Quota: Story = { args: { reason: "quota", onAction: () => {} } };

/** 점검 중 — 사용자가 할 수 있는 일이 없으면 액션을 주지 않는다. */
export const Maintenance: Story = { args: { reason: "maintenance" } };

/** 오류 — 재시도가 유일한 조치. */
export const ErrorReason: Story = { args: { reason: "error", onAction: () => {} } };

/** 사유 전체 — 톤·아이콘·액션 유무의 차이를 한눈에. */
export const AllReasons: Story = {
  render: () => (
    <div className="flex flex-col gap-8px">
      {(Object.keys(AI_UNAVAILABLE_PRESETS) as (keyof typeof AI_UNAVAILABLE_PRESETS)[]).map((r) => (
        <AiUnavailableNotice key={r} reason={r} onAction={() => {}} />
      ))}
    </div>
  ),
};

/** 문구 override — 제품 카피가 다를 때 preset 위에 덮어쓴다. */
export const CustomCopy: Story = {
  args: {
    reason: "permission",
    title: "이 프로젝트에서는 AI 를 쓸 수 없습니다",
    description: "프로젝트 관리자에게 AI 사용 권한을 요청하세요.",
    actionLabel: "",
  },
};
