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
          "사례·리소스 카드의 타이틀 아래에서 서비스 유형을 표시한다.",
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
    <div style={{ maxWidth: 360, borderRadius: 8, overflow: "hidden", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <div style={{ aspectRatio: "16/9", background: "#f5f6f9" }} />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: "#181c20" }}>
          에이블씨엔씨, K-뷰티를 대표하는 브랜드는 와탭을 이렇게 활용합니다
        </div>
        <div className="wds-web-service-chips">
          <span className="wds-web-service-chip" data-service="APM">APM</span>
          <span className="wds-web-service-chip" data-service="Database">Database</span>
        </div>
        <time style={{ fontSize: 12, color: "#aaa" }}>2024-11-06</time>
      </div>
    </div>
  ),
};
