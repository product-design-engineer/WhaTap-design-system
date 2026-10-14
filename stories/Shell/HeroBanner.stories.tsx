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
          "텍스트 + CTA 좌측, 비주얼 에셋 우측 2컬럼 구조. 720px 고정 높이. " +
          "테마 클래스는 글자색만 정한다 — 배경은 소비 페이지가 칠한다(아래 스토리의 배경은 맥락 표시용 토큰)." +
          "\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 기준).
          "## When to use\n" +
          "- 마케팅 페이지 최상단에서 **제품·캠페인 하나를 크게 소개**하는 첫 화면 — 헤드라인 · 서브텍스트 · CTA · 비주얼.\n" +
          "- 배경 톤에 맞춰 글자색을 바꿔야 할 때 — `--dark` · `--light` · `--ai` 테마.\n" +
          "\n## When NOT to use\n" +
          "- 페이지 중간·하단의 전환 유도 → `.wds-web-cta-banner`(Shell/Web · CtaBanner).\n" +
          "- 일반 섹션 → `.wds-web-section`(Shell/Web · Section).\n" +
          "- 제품(SaaS) 화면 → PageHeader — 마케팅 히어로를 제품 UI 에 들이지 않는다.",
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
    background: "var(--color-web-fill-on-dark)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-web-text-on-dark-faint)",
    fontSize: 14,
  }}>
    비주얼 에셋 영역
  </div>
);

const placeholderLight = (
  <div style={{
    width: "100%",
    height: "100%",
    background: "var(--color-surface-100)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-tertiary)",
    fontSize: 14,
  }}>
    비주얼 에셋 영역
  </div>
);

/** Dark 테마 — GPU, 어두운 배경 슬라이드. */
export const Dark: Story = {
  render: () => (
    <div style={{ height: 720, background: "linear-gradient(135deg, var(--color-web-surface-cta), var(--color-web-surface-cta-mid), var(--color-web-surface-cta-end))" }}>
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
    <div className="wds-web-section--tone-sky" style={{ height: 720 }}>
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
    <div style={{ height: 720, background: "linear-gradient(135deg, var(--color-web-surface-cta), var(--color-web-surface-cta-mid), var(--color-web-surface-cta-end))" }}>
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
      <div style={{ height: 400, background: "linear-gradient(135deg, var(--color-web-surface-cta), var(--color-web-surface-cta-mid), var(--color-web-surface-cta-end))" }}>
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
      <div className="wds-web-section--tone-sky" style={{ height: 400 }}>
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
      <div style={{ height: 400, background: "linear-gradient(135deg, var(--color-web-surface-cta), var(--color-web-surface-cta-mid), var(--color-web-surface-cta-end))" }}>
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
