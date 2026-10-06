import type { Meta, StoryObj } from "@storybook/react-vite";
import { TriggerButton } from "@whatap/design-system";

/**
 * Stories for [[TriggerButton]] — 인라인 WhaTap AI 진입점 (아이콘 전용, 애니메이션 심볼).
 */
const meta: Meta<typeof TriggerButton> = {
  title: "Primitives/TriggerButton",
  component: TriggerButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**인라인 WhaTap AI 진입점.** 차트 카드·행·셀 제목 옆에 놓여, 클릭하면 그 요소의 컨텍스트로 " +
          "AI 위젯을 여는 미세 진입점. 그라데이션 핀휠 심볼이 숨쉬기+저속 회전으로 시선을 끈다. " +
          "`reveal=\"hover\"` 는 부모 `.group` hover 시에만 fade-in — 밀집 UI 를 방해하지 않는다. " +
          "애니메이션은 위젯 헤더와 동일한 DS 키프레임(`aiSymbolBreathing`+`aiSymbolRotateSlow`) 재사용.",
      },
    },
  },
  argTypes: {
    reveal: {
      description: "노출 방식. always=상시(숨쉬기 유도) · hover=부모 .group hover 시에만.",
      control: { type: "inline-radio" },
      options: ["always", "hover"],
    },
    size: {
      description: "심볼 px 크기. 기본 13 (제목 옆 인라인 기준).",
      control: { type: "number", min: 8, max: 48, step: 1 },
    },
    label: { description: "접근성 라벨(aria-label). 기본 \"WhaTap AI\".", control: "text" },
    animate: { description: "숨쉬기+회전 애니메이션. false 면 정적.", control: "boolean" },
    tooltip: { description: "지정 시 Tooltip 으로 감싸 설명 노출.", control: "text" },
    onClick: { action: "clicked" },
  },
};
export default meta;
type Story = StoryObj<typeof TriggerButton>;

/** 기본 — always 노출, 13px (제목 옆 인라인). */
export const Default: Story = {
  args: { reveal: "always", size: 13, tooltip: "이 차트를 WhaTap AI로 분석" },
};

/** Hover 노출 — 부모 `.group` 에 마우스를 올려야 나타난다 (카드 컨텍스트 재현). */
export const HoverReveal: Story = {
  args: { reveal: "hover", size: 13, tooltip: "이 차트를 WhaTap AI로 분석" },
  render: (args) => (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        border: "1px solid var(--color-border-default)",
        borderRadius: 6,
        cursor: "default",
      }}
    >
      <span style={{ fontFamily: "var(--font-family-korean)", fontSize: 13, fontWeight: 700 }}>
        CPU 사용률
      </span>
      <TriggerButton {...args} />
      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-tertiary)" }}>
        ← 카드 위에 마우스를 올려보세요
      </span>
    </div>
  ),
};

/** 정적 — 애니메이션 off (prefers-reduced-motion 대응). */
export const NoAnimation: Story = {
  args: { reveal: "always", size: 13, animate: false },
};

/** 크기 비교 — 13(기본)/16/24. */
export const SizeMatrix: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      {[13, 16, 24].map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <TriggerButton size={s} />
          <span style={{ fontFamily: "Roboto, monospace", fontSize: 10, color: "var(--color-text-tertiary)" }}>{s}px</span>
        </div>
      ))}
    </div>
  ),
};
