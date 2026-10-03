import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCard, AiSectionHeading } from "@whatap/design-system/widget";

/**
 * Stories for [[AiSectionHeading]] — 카드 메인 헤딩 (도트/이모지 + 굵은 한국어).
 */
const meta: Meta<typeof AiSectionHeading> = {
  title: "Primitives/SectionHeading",
  component: AiSectionHeading,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**카드 메인 헤딩.** 13px 굵은 `--color-text-primary` 텍스트. 좌측에 톤 도트(`tone` prop) 또는 이모지(`emoji` prop) 로 시각 강조. " +
          "모든 위젯 카드는 보통 이 헤딩으로 시작합니다. `tone` 과 `emoji` 동시 지정 시 emoji 우선.",
      },
    },
  },
  argTypes: {
    tone: {
      description: "좌측 도트 톤. SemanticIntent (critical/warning/info/muted/neutral) 또는 Legacy (high/mid/low/idle).",
      control: { type: "select" },
      options: ["critical", "warning", "info", "muted", "neutral", "high", "mid", "low", "idle"],
    },
    emoji: {
      description: "도트 대신 표시할 이모지 (예: 📊, 📌, 🔴, ⚠️). tone 보다 우선.",
      control: "text",
    },
    children: {
      description: "헤딩 텍스트 — 짧을수록 좋음 (10자 이내 권장).",
      control: "text",
    },
  },
  decorators: [(Story) => (<div style={{ width: 440, maxWidth: "100%" }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof AiSectionHeading>;

/** 기본 — 톤 critical (도트 빨강). */
export const Critical: Story = {
  args: { tone: "critical", children: "핵심 이상 징후" },
};

/** Warning 톤 — 주의 신호. */
export const Warning: Story = {
  args: { tone: "warning", children: "주의 — 부분 과부하" },
};

/** Info 톤 — 안내/정상. */
export const Info: Story = {
  args: { tone: "info", children: "정상 동작 중" },
};

/** Muted 톤 — 비활성/idle. */
export const Muted: Story = {
  args: { tone: "muted", children: "유휴 자원" },
};

/** 이모지 사용 — 데이터 시각화 헤딩. */
export const WithEmojiChart: Story = {
  args: { emoji: "📊", children: "데이터 시각화" },
};

/** 이모지 사용 — 비용 분석 헤딩. */
export const WithEmojiCost: Story = {
  args: { emoji: "💰", children: "비용 분석" },
};

/** 도트 없음 — tone 도 emoji 도 없으면 텍스트만. */
export const TextOnly: Story = {
  args: { children: "단순 헤딩 (도트 없음)" },
};

/** 5톤 모두 한 화면 — 시각 비교용. */
export const AllTones: Story = {
  args: {},
  render: () => (
    <AiCard gap={12}>
      <AiSectionHeading tone="critical">🔴 critical — 시급한 문제</AiSectionHeading>
      <AiSectionHeading tone="warning">🟡 warning — 주의 필요</AiSectionHeading>
      <AiSectionHeading tone="info">🔵 info — 안내/정상</AiSectionHeading>
      <AiSectionHeading tone="muted">⚫ muted — 비활성</AiSectionHeading>
      <AiSectionHeading tone="neutral">⚪ neutral — 기본</AiSectionHeading>
    </AiCard>
  ),
};
