import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebCtaButton } from "@whatap/design-system";

/**
 * Stories for wds-web-section — 마케팅 페이지 섹션 레이아웃 + 톤 + 타이포그래피.
 *
 * CSS 클래스 기반 컴포넌트. 68페이지가 공유하는 공통 뼈대.
 * 섹션 래퍼 · 컨테이너 · 패딩 · 헤더 · 타이포그래피 · 톤(배경) · CTA 배너.
 */
const meta: Meta = {
  title: "Shell/Web · Section",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**마케팅 페이지 섹션 레이아웃 CSS 컴포넌트.** " +
          "`.wds-web-section` + 톤(`--tone-lavender` / `--tone-dark` 등) + " +
          "`.wds-web-section-container` + `.wds-web-section-wrap` 으로 68페이지 공통 뼈대를 조립한다. " +
          "타이포그래피는 `.wds-web-heading-2` · `.wds-web-p1` · `.wds-web-p2`." +
          "\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 축).
          "## When to use\n" +
          "- 마케팅 페이지 본문을 **섹션 단위로 쌓을 때의 공통 뼈대** — 래퍼 · 컨테이너 · 패딩 · 헤더 · 톤 배경.\n" +
          "- 섹션마다 배경 톤(lavender · dark 등)을 번갈아 리듬을 만들 때.\n" +
          "- 섹션 제목·본문 타이포를 `.wds-web-heading-*` · `.wds-web-p*` 로 맞출 때.\n" +
          "\n## When NOT to use\n" +
          "- 제품(SaaS) 페이지 본문 → `.wds-page-content` + `bg-card` 블록(Base surface 2단 규칙).\n" +
          "- 섹션 안에서 패딩·최대폭을 인라인 숫자로 다시 지정 — 컨테이너가 소유한다.\n" +
          "- 전환 유도 배너 → `.wds-web-cta-banner`(Shell/Web · CtaBanner).",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ── 데모 콘텐츠 ── */
const DemoContent = ({ children }: { children?: React.ReactNode }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  }}>
    {children || Array.from({ length: 3 }, (_, i) => (
      <div key={i} style={{
        height: 180,
        borderRadius: 12,
        background: "var(--color-card)",
        border: "1px solid var(--color-border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-tertiary)",
        fontSize: 14,
      }}>
        카드 {i + 1}
      </div>
    ))}
  </div>
);

const DemoContentDark = () => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  }}>
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} style={{
        height: 180,
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.3)",
        fontSize: 14,
      }}>
        카드 {i + 1}
      </div>
    ))}
  </div>
);

/** 기본 — 섹션 + 컨테이너 + 헤더 + 콘텐츠. */
export const Default: Story = {
  render: () => (
    <section className="wds-web-section">
      <div className="wds-web-section-container">
        <div className="wds-web-section-wrap">
          <div className="wds-web-section-header --center">
            <div className="wds-web-section-heading-wrap">
              <h2 className="wds-web-heading-2">섹션 타이틀</h2>
            </div>
            <p className="wds-web-p1">섹션 서브 카피가 들어갑니다. 제품의 핵심 가치를 전달합니다.</p>
          </div>
          <DemoContent />
        </div>
      </div>
    </section>
  ),
};

/** 헤더 좌정렬 — 기본은 센터, 좌정렬도 가능. */
export const HeaderLeft: Story = {
  render: () => (
    <section className="wds-web-section wds-web-section--tone-lavender">
      <div className="wds-web-section-container">
        <div className="wds-web-section-wrap">
          <div className="wds-web-section-header">
            <div className="wds-web-section-heading-wrap">
              <h2 className="wds-web-heading-2">좌정렬 섹션 헤더</h2>
            </div>
            <p className="wds-web-p1">--center 클래스가 없으면 좌정렬이 기본입니다.</p>
          </div>
          <DemoContent />
        </div>
      </div>
    </section>
  ),
};

/** 톤 변형 — 공용 5종. */
export const ToneVariants: Story = {
  name: "Tone — 공용 5종",
  render: () => (
    <div>
      {([
        ["(없음 — 투명)", ""],
        ["lavender (#f9fafe)", "wds-web-section--tone-lavender"],
        ["gray (surface-50)", "wds-web-section--tone-gray"],
        ["mist (#f5f6f9)", "wds-web-section--tone-mist"],
        ["sky (surface-blue)", "wds-web-section--tone-sky"],
      ] as const).map(([label, cls]) => (
        <section key={label} className={`wds-web-section ${cls}`}>
          <div className="wds-web-section-container">
            <div className="wds-web-section-wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
              <div className="wds-web-section-header --center">
                <h2 className="wds-web-heading-2" style={{ fontSize: 24 }}>{label}</h2>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  ),
};

/** 톤 변형 — 제품별 9종. */
export const ToneProduct: Story = {
  name: "Tone — 제품별 9종",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
      {([
        ["cyan", "wds-web-section--tone-cyan"],
        ["lime", "wds-web-section--tone-lime"],
        ["violet", "wds-web-section--tone-violet"],
        ["indigo", "wds-web-section--tone-indigo"],
        ["blue", "wds-web-section--tone-blue"],
        ["fuchsia", "wds-web-section--tone-fuchsia"],
        ["amber", "wds-web-section--tone-amber"],
        ["teal", "wds-web-section--tone-teal"],
        ["green", "wds-web-section--tone-green"],
      ] as const).map(([label, cls]) => (
        <div key={label} className={`wds-web-section ${cls}`} style={{ padding: "40px 24px", textAlign: "center" }}>
          <span className="wds-web-heading-2" style={{ fontSize: 16 }}>{label}</span>
        </div>
      ))}
    </div>
  ),
};

/** 다크 톤 — 텍스트 자동 반전. */
export const DarkTheme: Story = {
  render: () => (
    <section className="wds-web-section wds-web-section--tone-dark">
      <div className="wds-web-section-container">
        <div className="wds-web-section-wrap">
          <div className="wds-web-section-header --center">
            <div className="wds-web-section-heading-wrap">
              <h2 className="wds-web-heading-2">다크 톤 섹션</h2>
            </div>
            <p className="wds-web-p1">어두운 배경에서 텍스트가 자동으로 밝은 색으로 전환됩니다.</p>
          </div>
          <DemoContentDark />
        </div>
      </div>
    </section>
  ),
};

/** 패딩 모디파이어 비교. */
export const PaddingModifiers: Story = {
  render: () => (
    <div>
      <section className="wds-web-section wds-web-section--tone-lavender">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap">
            <p className="wds-web-p2">기본 패딩 (120px / 80px / 45px)</p>
          </div>
        </div>
      </section>
      <section className="wds-web-section wds-web-section--tone-gray">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap --small-padding">
            <p className="wds-web-p2">--small-padding (60px / 40px / 32px)</p>
          </div>
        </div>
      </section>
      <section className="wds-web-section wds-web-section--tone-mist">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap --no-top">
            <p className="wds-web-p2">--no-top (상단 패딩 제거)</p>
          </div>
        </div>
      </section>
      <section className="wds-web-section wds-web-section--tone-sky">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap --no-bottom">
            <p className="wds-web-p2">--no-bottom (하단 패딩 제거)</p>
          </div>
        </div>
      </section>
    </div>
  ),
};

/** 타이포그래피 전체 계층 — display ~ caption. */
export const Typography: Story = {
  render: () => {
    const rows: [string, string, string, string][] = [
      ["wds-web-display",   "Display",  "56px → 58 → 48", "히어로 헤드라인"],
      ["wds-web-heading-1", "Heading 1", "58px → 48 → 40", "페이지 최상위 타이틀"],
      ["wds-web-heading-2", "Heading 2", "48px → 40 → 32", "섹션 타이틀"],
      ["wds-web-heading-3", "Heading 3", "40px → 32 → 28", "서브섹션·카드 타이틀"],
      ["wds-web-heading-4", "Heading 4", "32px → 28 → 24", "카드 헤더·기능 블록"],
      ["wds-web-heading-5", "Heading 5", "28px → 24 → 22", "소형 카드·뱃지"],
      ["wds-web-heading-6", "Heading 6", "24px → 22 → 20", "캡션 헤딩·레이블"],
      ["wds-web-lead",      "Lead",      "22px → 20 → 16", "헤딩 아래 서브카피"],
      ["wds-web-p1",        "P1 (리드)", "24px → 18 → 16", "섹션 헤더 설명"],
      ["wds-web-p2",        "P2 (본문)", "20px → 16 → 14", "일반 설명 텍스트"],
      ["wds-web-body-sm",   "Body SM",   "16px → 14 → 14", "보조 설명·푸터"],
      ["wds-web-caption",   "Caption",   "14px → 14 → 12", "메타·날짜·태그"],
      ["wds-web-nav",       "Nav",       "18px",            "GNB·탭·필터 라벨"],
    ];
    return (
      <section className="wds-web-section">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <div className="wds-web-section-header --center" style={{ marginBottom: 40 }}>
              <h2 className="wds-web-heading-3">마케팅 타이포그래피 체계</h2>
              <p className="wds-web-body-sm" style={{ color: "var(--color-text-tertiary)" }}>
                Desktop → Tablet → Mobile 순으로 한 단계씩 축소
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {rows.map(([cls, label, sizes, desc]) => (
                <div key={cls} style={{ borderBottom: "1px solid var(--color-border-default)", paddingBottom: 20 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 4 }}>
                    <code style={{ fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0, width: 180 }}>.{cls}</code>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{sizes}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: "auto" }}>{desc}</span>
                  </div>
                  <div className={cls}>{label} — 와탭 모니터링</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  },
};

/** CTA 배너 — 전환 유도 풀폭 배너. */
export const CtaBanner: Story = {
  render: () => (
    <div className="wds-web-cta-banner">
      <div className="wds-web-section-container">
        <div className="wds-web-cta-banner-inner">
          <h3 className="wds-web-cta-banner-heading">지금 바로 시작하세요</h3>
          <p className="wds-web-cta-banner-sub">WhaTap 모니터링으로 서비스 안정성을 높여보세요.</p>
          <div className="wds-web-cta-banner-actions">
            <WebCtaButton href="#" variant="white" size="lg">무료 체험</WebCtaButton>
            <WebCtaButton href="#" variant="outline" size="lg">도입 문의</WebCtaButton>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** 전체 페이지 조합 — 여러 섹션 + CTA 배너가 이어지는 실제 레이아웃. */
export const FullPageComposition: Story = {
  render: () => (
    <div>
      {/* 섹션 1 — 투명 */}
      <section className="wds-web-section">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap">
            <div className="wds-web-section-header --center">
              <div className="wds-web-section-heading-wrap">
                <h2 className="wds-web-heading-2">첫 번째 섹션</h2>
              </div>
              <p className="wds-web-p1">기본 투명 배경의 섹션입니다.</p>
            </div>
            <DemoContent />
          </div>
        </div>
      </section>

      {/* 섹션 2 — lavender */}
      <section className="wds-web-section wds-web-section--tone-lavender">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap">
            <div className="wds-web-section-header --center">
              <div className="wds-web-section-heading-wrap">
                <h2 className="wds-web-heading-2">두 번째 섹션</h2>
              </div>
              <p className="wds-web-p1">라벤더 톤 배경으로 시각적 구분을 줍니다.</p>
            </div>
            <DemoContent />
          </div>
        </div>
      </section>

      {/* 섹션 3 — dark */}
      <section className="wds-web-section wds-web-section--tone-dark">
        <div className="wds-web-section-container">
          <div className="wds-web-section-wrap">
            <div className="wds-web-section-header --center">
              <div className="wds-web-section-heading-wrap">
                <h2 className="wds-web-heading-2">세 번째 섹션</h2>
              </div>
              <p className="wds-web-p1">다크 배경에서 텍스트가 자동으로 반전됩니다.</p>
            </div>
            <DemoContentDark />
          </div>
        </div>
      </section>

      {/* CTA 배너 */}
      <div className="wds-web-cta-banner">
        <div className="wds-web-section-container">
          <div className="wds-web-cta-banner-inner">
            <h3 className="wds-web-cta-banner-heading">지금 바로 시작하세요</h3>
            <p className="wds-web-cta-banner-sub">WhaTap 모니터링으로 서비스 안정성을 높여보세요.</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
