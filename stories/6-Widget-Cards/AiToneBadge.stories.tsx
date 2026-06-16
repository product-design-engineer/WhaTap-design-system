import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCard, AiToneBadge } from "@whatap/design-system/widget";

/**
 * Stories for [[AiToneBadge]] — 분류 결과 컬러 칩.
 */
const meta: Meta<typeof AiToneBadge> = {
  title: "WhaTap AI/Primitives/AiToneBadge",
  component: AiToneBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**분류 결과의 작은 컬러 칩.** 도트(`tokens.color.indicator`) + 라벨(`tokens.label`) + 배경(`tokens.color.surface`) " +
          "이 한 톤으로 통일된 알약 모양 배지. GPU/리소스 분류 시나리오에서 row 단위 분류 시각화에 가장 많이 사용.",
      },
    },
  },
  argTypes: {
    tone: {
      description: "배지 톤 — 도트 색·배경색·기본 라벨이 모두 이 톤으로 결정됨.",
      control: { type: "select" },
      options: ["critical", "warning", "info", "muted", "neutral", "high", "mid", "low", "idle"],
    },
    label: {
      description: "기본 라벨(`tokens.label[intent]`) 대신 사용할 텍스트. 짧을수록 좋음.",
      control: "text",
    },
  },
  decorators: [(Story) => (<div style={{ width: 440, maxWidth: "100%" }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof AiToneBadge>;

/** Critical 기본 라벨 — "고활용". */
export const Critical: Story = { args: { tone: "critical" } };

/** Warning 기본 라벨 — "활용". */
export const Warning: Story = { args: { tone: "warning" } };

/** Info 기본 라벨 — "저활용". */
export const Info: Story = { args: { tone: "info" } };

/** Muted 기본 라벨 — "완전 유휴". */
export const Muted: Story = { args: { tone: "muted" } };

/** Custom 라벨 — 시나리오 별 의미 맞춤 표기. */
export const CustomLabel: Story = {
  args: { tone: "info", label: "저활용 (10% 미만)" },
};

/** 모든 톤 비교 — 한 줄에 나란히 노출. */
export const AllTones: Story = {
  args: {},
  render: () => (
    <AiCard>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <AiToneBadge tone="critical" />
        <AiToneBadge tone="warning" />
        <AiToneBadge tone="info" />
        <AiToneBadge tone="muted" />
      </div>
    </AiCard>
  ),
};

/** 실제 사용 — GPU 분석 시나리오. */
export const InGpuAnalysis: Story = {
  args: {},
  render: () => (
    <AiCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>GPU-01 (A100)</span>
          <AiToneBadge tone="critical" label="고활용 (95%)" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>GPU-02 (A100)</span>
          <AiToneBadge tone="warning" label="활용 (60%)" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>GPU-03 (T4)</span>
          <AiToneBadge tone="info" label="저활용 (12%)" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>GPU-04 (T4)</span>
          <AiToneBadge tone="muted" label="유휴 (0%)" />
        </div>
      </div>
    </AiCard>
  ),
};
