import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AiCard,
  AiCaption,
  AiSectionHeading,
  AiBulletList,
  AiToneBadge,
} from "@whatap/design-system/widget";
import { Button, TextLink } from "@whatap/design-system";

/**
 * Storybook stories for [[AiCard]] — AI 위젯 메시지 표준 컨테이너.
 *
 * 카드 자체의 시각 인스펙션 + composition 패턴 (heading / caption / bullet 조합) 데모.
 * 각 story 의 `args` 가 autodocs 의 Controls 패널에 노출되어 인터랙티브 조정 가능.
 */
const meta: Meta<typeof AiCard> = {
  title: "Primitives/Card",
  component: AiCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**AI 위젯 안의 카드 한 장.** `--color-card` 배경 + `--color-border-default` 보더 + 8px 라운드 + 12px 패딩 + " +
          "ai-anim-in 진입 애니메이션. stagger 효과는 `delay` prop 으로 제어합니다.\n\n" +
          "### 카드의 역할\n\n" +
          "`tone` 유무가 역할을 가른다.\n\n" +
          "| 역할 | `tone` | 표면 | 담는 것 |\n" +
          "|---|---|---|---|\n" +
          "| **메시지** | 없음 | `--color-card` | AI 응답 한 단위 — 헤딩 + 본문 · 표 · 차트 |\n" +
          "| **안내** | `info` · `warning` · `critical` | `--color-tone-surface-*` | AI 를 쓰기 전에 알아야 할 사정 — ⓘ 제목 한 줄 → 설명 → 행동 버튼 하나 |\n\n" +
          "안내 문장에서 **이동할 곳이 읽히는 낱말**(플랜 이름 · 「플랜 관리자」)은 `TextLink` 로 걸어, 읽은 자리에서 바로 이동하게 한다. " +
          "버튼과 같은 곳으로 보내는 낱말에는 걸지 않는다. 자세한 사용·금지 규칙은 컴포넌트의 JSDoc 참고.",
      },
    },
    backgrounds: { default: "surface-muted" }, // 카드 외곽이 잘 보이도록 회색 배경
  },
  argTypes: {
    children: {
      description: "카드 본문 — 다른 primitive 들의 조합 권장.",
      control: false, // ReactNode 라 control 제공 어려움 — render 에서 제공
    },
    tone: {
      description: "안내 카드 톤 — 주면 표면을 톤 색으로 칠한다(안내 역할). 없으면 메시지 카드.",
      control: "select",
      options: [undefined, "info", "warning", "critical"],
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
      <div style={{ padding: 12, borderBottom: "1px solid var(--color-border-default)" }}>
        <AiCaption>HEADER 자체 패딩</AiCaption>
      </div>
      <div style={{ padding: 12 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>BODY 자체 패딩 — 카드 padding=0/gap=0</span>
      </div>
    </AiCard>
  ),
};

/* ─── 스토리: 안내 카드 (tone) ─────────────────────────────── */

/**
 * 안내 카드 — `tone="warning"`. AI 를 쓰기 전에 사람이 알아야 할 사정과 다음 행동.
 *
 * 문장 안에서 이동할 곳이 읽히는 낱말(플랜 이름 · 「플랜 관리자」)은 [[TextLink]] — 읽은 자리에서 바로 이동한다.
 * 「범위에 추가」 버튼과 같은 곳으로 보내는 낱말에는 링크를 걸지 않는다.
 */
export const Guidance: Story = {
  name: "안내 카드",
  args: { tone: "warning", padding: 16, gap: 8 },
  render: (args) => (
    <AiCard {...args}>
      <AiSectionHeading tone={args.tone} icon="info">
        「<TextLink href="#plan">mysql-v2-test 외 1</TextLink>」 플랜에 「Test」 프로젝트가 없습니다.
      </AiSectionHeading>
      <p className="text-base text-secondary">
        이 프로젝트가 플랜에 포함되면 WhaTap AI를 사용할 수 있습니다. 내가 만든 플랜이 없으면{" "}
        <TextLink href="#plan-admin">플랜 관리자</TextLink>에게 범위 추가를 요청해 주세요.
      </p>
      <div>
        <Button variant="contained">범위에 추가</Button>
      </div>
    </AiCard>
  ),
};

/**
 * 안내 카드 톤 3종 — 막혀 있지만 사람이 풀 수 있으면 `warning`, 풀 수 없으면 `critical`, 알리기만 하면 `info`.
 */
export const GuidanceTones: Story = {
  name: "안내 카드 — 톤",
  args: {},
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AiCard tone="info" padding={16}>
        <AiSectionHeading tone="info" icon="info">이 프로젝트는 데이터 수집을 준비 중입니다.</AiSectionHeading>
        <p className="text-base text-secondary">
          수집이 끝나면 분석을 시작할 수 있습니다. 진행 상황은 <TextLink href="#agents">에이전트 설치</TextLink>에서 확인하세요.
        </p>
      </AiCard>
      <AiCard tone="warning" padding={16}>
        <AiSectionHeading tone="warning" icon="info">이번 달 AI 사용량의 90%를 사용했습니다.</AiSectionHeading>
        <p className="text-base text-secondary">
          한도를 넘으면 다음 달까지 분석이 멈춥니다. <TextLink href="#usage">사용량</TextLink>을 확인하세요.
        </p>
      </AiCard>
      <AiCard tone="critical" padding={16}>
        <AiSectionHeading tone="critical" icon="info">이 프로젝트에 접근할 권한이 없습니다.</AiSectionHeading>
        <p className="text-base text-secondary">
          <TextLink href="#members">프로젝트 관리자</TextLink>에게 권한을 요청해 주세요.
        </p>
      </AiCard>
    </div>
  ),
};
