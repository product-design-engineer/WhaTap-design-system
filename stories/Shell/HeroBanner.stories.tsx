import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebCtaButton } from "@whatap/design-system";

/**
 * Stories for wds-hero-banner — 마케팅 히어로 배너 CSS 컴포넌트.
 *
 * JS 컴포넌트가 아닌 CSS 클래스 기반이므로 render 함수로 직접 마크업한다.
 * 3 테마: dark · light · ai.
 */
const meta: Meta = {
  title: "Shell/Web · HeroBanner",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**히어로 배너 CSS 컴포넌트.** `.wds-hero-banner` + 테마(`--dark` / `--light` / `--ai`). " +
          "텍스트 + CTA 좌측, 비주얼 에셋 우측 2컬럼 구조. 720px 고정 높이.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const placeholder = (
  <div style={{
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
  }}>
    비주얼 에셋 영역
  </div>
);

const placeholderLight = (
  <div style={{
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.04)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.3)",
    fontSize: 14,
  }}>
    비주얼 에셋 영역
  </div>
);

/** Dark 테마 — GPU, 어두운 배경 슬라이드. */
export const Dark: Story = {
  render: () => (
    <div style={{ height: 720, background: "linear-gradient(135deg, #0a1020, #0e1428, #0a3a8f)" }}>
      <div className="wds-hero-banner wds-hero-banner--dark">
        <div className="wds-hero-banner-content">
          <h2 className="wds-hero-banner-heading">리소스 현황을 한눈에<br />GPU 모니터링</h2>
          <p className="wds-hero-banner-sub">운영 부담이 큰 AI 시대의 핵심 인프라, GPU<br />와탭으로 GPU 자원을 효율적으로 운영해보세요.</p>
          <div className="wds-hero-banner-cta">
            <WebCtaButton href="#" variant="filled" size="lg">도입 문의</WebCtaButton>
            <WebCtaButton href="#" variant="outline" size="lg">자세히</WebCtaButton>
          </div>
        </div>
        <div className="wds-hero-banner-visual">{placeholder}</div>
      </div>
    </div>
  ),
};

/** Light 테마 — LLM, 밝은 배경 슬라이드. */
export const Light: Story = {
  render: () => (
    <div style={{ height: 720, background: "#e5f0fb" }}>
      <div className="wds-hero-banner wds-hero-banner--light">
        <div className="wds-hero-banner-content">
          <h2 className="wds-hero-banner-heading">AI 운영의 필수 가시성<br />LLM Observability</h2>
          <p className="wds-hero-banner-sub">LLM 애플리케이션 성능을 한눈에 파악하는<br />와탭 LLM Observability, 지금 무료로 사용해보세요.</p>
          <div className="wds-hero-banner-cta">
            <WebCtaButton href="#" variant="filled" size="lg">도입 문의</WebCtaButton>
            <WebCtaButton href="#" variant="outline" size="lg">무료로 시작</WebCtaButton>
          </div>
        </div>
        <div className="wds-hero-banner-visual">{placeholderLight}</div>
      </div>
    </div>
  ),
};

/** AI 테마 — 대화형 AI 슬라이드 전용. */
export const Ai: Story = {
  render: () => (
    <div style={{ height: 720, background: "linear-gradient(135deg, #0a0a1a, #0d0f1e, #130d24)" }}>
      <div className="wds-hero-banner wds-hero-banner--ai">
        <div className="wds-hero-banner-content">
          <h2 className="wds-hero-banner-heading">대화형 AI로<br />더 빠른 운영 인사이트를</h2>
          <p className="wds-hero-banner-sub">모니터링 데이터를 빠르게 읽고,<br />바로 활용할 수 있는 인사이트로 연결합니다.</p>
          <div className="wds-hero-banner-cta">
            <WebCtaButton href="#" variant="filled" size="lg">WhaTap AI 체험</WebCtaButton>
          </div>
        </div>
        <div className="wds-hero-banner-visual">{placeholder}</div>
      </div>
    </div>
  ),
};

/** 3 테마 비교. */
export const AllThemes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Dark */}
      <div style={{ height: 400, background: "linear-gradient(135deg, #0a1020, #0e1428, #0a3a8f)" }}>
        <div className="wds-hero-banner wds-hero-banner--dark">
          <div className="wds-hero-banner-content">
            <h2 className="wds-hero-banner-heading">Dark 테마</h2>
            <p className="wds-hero-banner-sub">어두운 배경 슬라이드</p>
            <div className="wds-hero-banner-cta">
              <WebCtaButton href="#" variant="filled" size="md">filled</WebCtaButton>
              <WebCtaButton href="#" variant="outline" size="md">outline</WebCtaButton>
            </div>
          </div>
          <div className="wds-hero-banner-visual">{placeholder}</div>
        </div>
      </div>
      {/* Light */}
      <div style={{ height: 400, background: "#e5f0fb" }}>
        <div className="wds-hero-banner wds-hero-banner--light">
          <div className="wds-hero-banner-content">
            <h2 className="wds-hero-banner-heading">Light 테마</h2>
            <p className="wds-hero-banner-sub">밝은 배경 슬라이드</p>
            <div className="wds-hero-banner-cta">
              <WebCtaButton href="#" variant="filled" size="md">filled</WebCtaButton>
              <WebCtaButton href="#" variant="outline" size="md">outline</WebCtaButton>
            </div>
          </div>
          <div className="wds-hero-banner-visual">{placeholderLight}</div>
        </div>
      </div>
      {/* AI */}
      <div style={{ height: 400, background: "linear-gradient(135deg, #0a0a1a, #0d0f1e, #130d24)" }}>
        <div className="wds-hero-banner wds-hero-banner--ai">
          <div className="wds-hero-banner-content">
            <h2 className="wds-hero-banner-heading">AI 테마</h2>
            <p className="wds-hero-banner-sub">AI 슬라이드 전용</p>
            <div className="wds-hero-banner-cta">
              <WebCtaButton href="#" variant="filled" size="md">CTA</WebCtaButton>
            </div>
          </div>
          <div className="wds-hero-banner-visual">{placeholder}</div>
        </div>
      </div>
    </div>
  ),
};
