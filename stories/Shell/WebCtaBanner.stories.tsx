import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebCtaButton } from "@whatap/design-system";

/**
 * Stories for wds-web-cta-banner — 마케팅 전환 유도 풀폭 배너.
 *
 * CSS 클래스 기반 컴포넌트. 그라데이션 배경 + 글로우 효과.
 * 제품 페이지 하단·홈 하단 등에서 CTA 전환을 유도한다.
 */
const meta: Meta = {
  title: "Shell/Web · CtaBanner",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**마케팅 CTA 배너 CSS 컴포넌트.** `.wds-web-cta-banner` 그라데이션 배경 + 글로우. " +
          "heading · sub · actions(WebCtaButton) 3단 구성. 반응형 3단계(데스크톱 · 태블릿 · 모바일)." +
          "\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 기준).
          "## When to use\n" +
          "- 마케팅 페이지 **하단에서 전환(무료 체험·도입 문의)을 유도하는 풀폭 배너** — 제품·요금·사례 목록 페이지 끝.\n" +
          "- heading · sub · 버튼 1~2개로 행동을 한 번 더 제시할 때.\n" +
          "\n## When NOT to use\n" +
          "- 본문 중간의 단일 버튼 → WebCtaButton 만 단독으로.\n" +
          "- 제품(SaaS) 화면의 안내·유도 → 제품 쪽 컴포넌트(Notice 등) — 마케팅 그라데이션을 끌어오지 않는다.\n" +
          "- 한 페이지에 여러 번 반복 — 전환 지점이 흐려진다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** 기본 — heading + sub + CTA 2버튼. */
export const Default: Story = {
  render: () => (
    <div className="wds-web-cta-banner">
      <div className="wds-web-section-container">
        <div className="wds-web-cta-banner-inner">
          <h3 className="wds-web-cta-banner-heading">지금 바로 시작하세요</h3>
          <p className="wds-web-cta-banner-sub">
            설치 없이 3분 만에 모니터링을 체험할 수 있습니다.
          </p>
          <div className="wds-web-cta-banner-actions">
            <WebCtaButton href="#" variant="white" size="lg">무료 체험</WebCtaButton>
            <WebCtaButton href="#" variant="outline" size="lg">도입 문의</WebCtaButton>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** CTA 1개 — 단일 행동 유도. */
export const SingleCta: Story = {
  render: () => (
    <div className="wds-web-cta-banner">
      <div className="wds-web-section-container">
        <div className="wds-web-cta-banner-inner">
          <h3 className="wds-web-cta-banner-heading">
            와탭 모니터링을 무료로 체험해보세요!
          </h3>
          <div className="wds-web-cta-banner-actions">
            <WebCtaButton href="#" variant="white" size="lg">데모 체험</WebCtaButton>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** Sub 없이 — heading + CTA만. */
export const WithoutSub: Story = {
  render: () => (
    <div className="wds-web-cta-banner">
      <div className="wds-web-section-container">
        <div className="wds-web-cta-banner-inner">
          <h3 className="wds-web-cta-banner-heading">
            서비스 안정성, 지금 확인하세요
          </h3>
          <div className="wds-web-cta-banner-actions">
            <WebCtaButton href="#" variant="white" size="lg">무료로 시작</WebCtaButton>
            <WebCtaButton href="#" variant="outline" size="lg">문의</WebCtaButton>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** 제품 페이지용 — 제품별 CTA 배너 패턴. */
export const ProductPage: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 일반 제품 — 단일 CTA */}
      <div className="wds-web-cta-banner">
        <div className="wds-web-section-container">
          <div className="wds-web-cta-banner-inner">
            <h3 className="wds-web-cta-banner-heading">
              와탭 모니터링을 무료로 체험해보세요!
            </h3>
            <div className="wds-web-cta-banner-actions">
              <WebCtaButton href="#" variant="white" size="lg">데모 체험</WebCtaButton>
            </div>
          </div>
        </div>
      </div>

      {/* GPU/LLM 등 — heading + sub + 2 CTA */}
      <div className="wds-web-cta-banner">
        <div className="wds-web-section-container">
          <div className="wds-web-cta-banner-inner">
            <h3 className="wds-web-cta-banner-heading">
              지금 GPU 리소스 사용 현황을 확인해보세요
            </h3>
            <p className="wds-web-cta-banner-sub">
              와탭은 클라우드, 쿠버네티스 환경 모두에서 GPU 리소스를 최적으로 운영할 수 있도록 지원합니다.
            </p>
            <div className="wds-web-cta-banner-actions">
              <WebCtaButton href="#" variant="white" size="lg">도입 문의</WebCtaButton>
              <WebCtaButton href="#" variant="outline" size="lg">무료 체험</WebCtaButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
