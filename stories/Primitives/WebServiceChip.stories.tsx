import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Stories for wds-web-service-chip — 마케팅 서비스 유형 칩.
 *
 * CSS 클래스 기반. 사례·리소스 카드에서 서비스 유형(APM, Server 등)을 표시한다.
 */
const meta: Meta = {
  title: "Primitives/Web · ServiceChip",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 서비스 유형 칩.** `.wds-web-service-chip` — 22px 높이, brand-blue soft 톤. " +
          "사례·리소스 카드의 타이틀 아래에서 서비스 유형을 표시한다." +
          "\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 기준).
          "## When to use\n" +
          "- 마케팅 사례·리소스 카드에서 **어떤 서비스에 관한 글인지** 표시하는 읽기 전용 라벨(`case-list`).\n" +
          "- 카드 하나에 서비스 유형이 여러 개면 `.wds-web-service-chips` 로 묶는다.\n" +
          "\n## When NOT to use\n" +
          "- 누르면 목록이 바뀌는 탭·필터 → `.wds-pill` 또는 FilterChip — 이 칩은 클릭 동작이 없다.\n" +
          "- 제품(SaaS) 화면의 상태·분류 라벨 → Chip.\n" +
          "- data-service 에 없는 임의 서비스명 — 제품 컬러 매핑이 없으므로 먼저 CSS 에 등록한다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** 단일 칩. */
export const Default: Story = {
  render: () => <span className="wds-web-service-chip" data-service="APM">APM</span>,
};

/** 여러 서비스 유형 — 제품별 컬러. */
export const Multiple: Story = {
  render: () => (
    <div className="wds-web-service-chips">
      <span className="wds-web-service-chip" data-service="APM">APM</span>
      <span className="wds-web-service-chip" data-service="Kubernetes">Kubernetes</span>
      <span className="wds-web-service-chip" data-service="Database">Database</span>
    </div>
  ),
};

/** 전체 서비스 목록 — 제품 컬러 매핑. */
export const AllServices: Story = {
  render: () => (
    <div className="wds-web-service-chips">
      {["APM", "Server", "Kubernetes", "Database", "Browser", "Log", "URL", "Network", "GPU"].map((s) => (
        <span key={s} className="wds-web-service-chip" data-service={s}>{s}</span>
      ))}
    </div>
  ),
};

/** 카드 컨텍스트 — 타이틀 아래 배치. */
export const InCardContext: Story = {
  render: () => (
    <div style={{ maxWidth: 360, borderRadius: 8, overflow: "hidden", background: "var(--color-card)", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ aspectRatio: "16/9", background: "var(--color-surface-100)" }} />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: "var(--color-text-primary)" }}>
          에이블씨엔씨, K-뷰티를 대표하는 브랜드는 와탭을 이렇게 활용합니다
        </div>
        <div className="wds-web-service-chips">
          <span className="wds-web-service-chip" data-service="APM">APM</span>
          <span className="wds-web-service-chip" data-service="Database">Database</span>
        </div>
        <time style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>2024-11-06</time>
      </div>
    </div>
  ),
};
