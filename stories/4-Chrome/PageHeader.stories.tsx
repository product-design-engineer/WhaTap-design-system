import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "@whatap/design-system";

/**
 * Stories for [[PageHeader]] — 48px 페이지 헤더 (invariant).
 */
const meta: Meta<typeof PageHeader> = {
  title: "Chrome/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**48px 페이지 헤더 (invariant policy).** 좌: 타이틀 + WhaTap AI 토글 + Docs / 우: 고객지원 + 알림 + 아바타. " +
          "**WhaTap AI 위젯 토글과 무관하게 항상 동일한 레이아웃·동일한 가시 요소·동일한 크기**로 렌더링됩니다 " +
          "(feedback-page-header-invariant). 헤더에서 prop 으로 항목을 숨길 수 없음 — 의도된 제약.",
      },
    },
  },
  argTypes: {
    title: { description: "페이지 타이틀 — 'K8s-GPU / GPU 트렌드' 같은 경로.", control: "text" },
    aiActive: { description: "WhaTap AI 버튼의 active 상태.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

/** 기본 — GPU 트렌드 페이지 헤더. */
export const Default: Story = {
  args: { title: "K8s-GPU / GPU 트렌드", aiActive: false },
};

/** AI 위젯 활성 상태 — 버튼 강조. */
export const AiActive: Story = {
  args: { title: "K8s-GPU / GPU 트렌드", aiActive: true },
};

/** 긴 타이틀 — truncate / 폭 검사. */
export const LongTitle: Story = {
  args: { title: "K8s-GPU · prod-cluster-01 · namespace=gpu-inference / 응답 시간 분석", aiActive: false },
};

/** 인터랙티브 — AI 토글 가능. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState(false);
      return <PageHeader title="DB / oracle_dnx" aiActive={active} onAiToggle={() => setActive((v) => !v)} />;
    };
    return <Demo />;
  },
};
