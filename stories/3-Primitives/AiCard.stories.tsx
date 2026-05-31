import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AiCard,
  AiCaption,
  AiSectionHeading,
  AiBulletList,
  AiToneBadge,
} from "@whatap/design-system/widget";

/**
 * Storybook stories for [[AiCard]] — AI 위젯 메시지 표준 컨테이너.
 *
 * 카드 자체의 시각 인스펙션 + composition 패턴 (heading / caption / bullet 조합) 데모.
 * 각 story 의 `args` 가 autodocs 의 Controls 패널에 노출되어 인터랙티브 조정 가능.
 */
const meta: Meta<typeof AiCard> = {
  title: "WhaTap AI/Primitives/AiCard",
  component: AiCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**AI 위젯 메시지의 표준 컨테이너.** 흰 배경 + #eaeaea 보더 + 8px 라운드 + 12px 패딩 + " +
          "ai-anim-in 진입 애니메이션. 모든 AI 응답 메시지는 이 카드 안에 들어가며 stagger 효과는 " +
          "`delay` prop 으로 제어합니다. 자세한 사용·금지 규칙은 컴포넌트의 JSDoc 참고.",
      },
    },
    backgrounds: { default: "surface-muted" }, // 카드 외곽이 잘 보이도록 회색 배경
  },
  argTypes: {
    children: {
      description: "카드 본문 — 다른 primitive 들의 조합 권장.",
      control: false, // ReactNode 라 control 제공 어려움 — render 에서 제공
    },
    delay: {
      description: "`ai-anim-in` 진입 애니메이션 지연 (ms). stagger 효과에 사용. 기본 0.",
      control: { type: "number", min: 0, max: 2000, step: 100 },
    },
    padding: {
      description: "안쪽 패딩 (px). 0 으로 무패딩 가능. 기본 12.",
      control: { type: "number", min: 0, max: 48, step: 4 },
    },
    gap: {
      description: "자식 요소 간 세로 갭 (px). 0 으로 gap 제거. 기본 8.",
      control: { type: "number", min: 0, max: 32, step: 4 },
    },
    className: {
      description: "추가 className — 너비/높이 override 등 특수 케이스에만.",
      control: "text",
    },
  },
  decorators: [
    // 카드의 자연스러운 너비 (위젯 안에서 ~440px) 시뮬레이션
    (Story) => (
      <div style={{ width: 440, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AiCard>;

/* ─── 스토리: 가장 단순한 형태 ─────────────────────────────────── */

/**
 * 최소 사용 — children 만 전달. 진입 애니메이션 즉시 (delay 0).
 *
 * 실제 시나리오에서는 거의 단독으로 쓰이지 않고, 헤딩/본문 prim 와 조합됩니다.
 */
export const Default: Story = {
  args: {
    children: "이 자리에 메시지 본문이 들어갑니다.",
  },
};

/* ─── 스토리: 인사이트 카드 (실제 사용 패턴) ──────────────────── */

/**
 * 인사이트 카드 — Section heading + bullet list 의 가장 흔한 조합.
 *
 * 시나리오: AI 가 분석을 마치고 핵심 발견사항을 정리해 보낼 때.
 */
export const InsightCard: Story = {
  args: { delay: 0 },
  render: (args) => (
    <AiCard {...args}>
      <AiSectionHeading tone="critical">🔴 핵심 이상 징후</AiSectionHeading>
      <AiBulletList
        items={[
          "httpc 응답시간 4,294ms — 압도적 dominant",
          "method/sql/dbc/socket 은 정상 범위",
          "외부 API 의존도 ↑ 가능성 높음",
        ]}
      />
    </AiCard>
  ),
};

/* ─── 스토리: 복수 섹션 카드 ────────────────────────────────── */

/**
 * 복수 sub-section 카드 — Caption + Heading + 본문 + ToneBadge 조합.
 *
 * 한 카드 안에 여러 정보 블록을 담는 케이스.
 */
export const MultiSection: Story = {
  args: { delay: 0, gap: 12 },
  render: (args) => (
    <AiCard {...args}>
      <AiSectionHeading emoji="📊">스레드 상태 분석</AiSectionHeading>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AiCaption>REASONING</AiCaption>
        <AiBulletList
          size="md"
          items={[
            "최근 5분 액티브 스레드 5종 (method/sql/dbc/httpc/socket) 시계열 비교",
            "httpc 의 max 가 다른 series 의 합보다 큼 — 단일 dominant pattern",
          ]}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AiCaption>분류 결과</AiCaption>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <AiToneBadge tone="critical" label="httpc — 즉시 조치" />
          <AiToneBadge tone="info" label="method/sql/dbc — 정상" />
          <AiToneBadge tone="muted" label="socket — 유휴" />
        </div>
      </div>
    </AiCard>
  ),
};

/* ─── 스토리: stagger 시퀀스 (delay 효과) ──────────────────── */

/**
 * Stagger 시퀀스 — 3개 카드가 360ms 간격으로 등장.
 *
 * 실제 위젯에서 AI 가 메시지를 연속 송출할 때의 자연스러운 진입 효과.
 */
export const StaggerSequence: Story = {
  args: {}, // 부모 args 미사용 — 각 카드가 별도 delay
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[0, 360, 720].map((delay, i) => (
        <AiCard key={i} delay={delay}>
          <AiSectionHeading tone={i === 0 ? "critical" : i === 1 ? "warning" : "info"}>
            {i === 0 ? "🔴 step 1 — 이상 탐지" : i === 1 ? "🟡 step 2 — 원인 후보" : "🔵 step 3 — 조치 제안"}
          </AiSectionHeading>
          <AiBulletList items={[`카드 ${i + 1} — delay ${delay}ms 에 등장`]} />
        </AiCard>
      ))}
    </div>
  ),
};

/* ─── 스토리: padding/gap edge cases ───────────────────────── */

/**
 * 패딩·갭 0 — 카드 chrome 만 유지, 내부 공간 제거.
 *
 * 본문이 자체 패딩을 가지는 콘텐츠(예: 차트, 표) 일 때 사용.
 */
export const ZeroPadding: Story = {
  args: { padding: 0, gap: 0 },
  render: (args) => (
    <AiCard {...args}>
      <div style={{ padding: 12, borderBottom: "1px solid #eaeaea" }}>
        <AiCaption>HEADER 자체 패딩</AiCaption>
      </div>
      <div style={{ padding: 12 }}>
        <span style={{ fontSize: 12, color: "#4c4c4c" }}>BODY 자체 패딩 — 카드 padding=0/gap=0</span>
      </div>
    </AiCard>
  ),
};
