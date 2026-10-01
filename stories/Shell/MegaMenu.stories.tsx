import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Stories for wds-mega-menu — 마케팅 GNB 서비스 메가 메뉴 CSS 컴포넌트.
 *
 * JS 컴포넌트가 아닌 CSS 클래스 기반이므로 render 함수로 직접 마크업한다.
 * Light · Divided 가 기본 변형.
 */
const meta: Meta = {
  title: "Shell/Web · MegaMenu",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 GNB 서비스 메가 메뉴 CSS 컴포넌트.** " +
          "`.wds-mega-menu` + `.wds-mega-menu--divided` 로 4컬럼 카테고리 그리드를 조립한다. " +
          "컬럼 사이 세로 구분선(Divided)이 기본이며, Light 배경에서 사용한다." +
          "\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 축).
          "## When to use\n" +
          "- 마케팅 GNB(LandingHeader)에서 **서비스 목록을 카테고리별 4컬럼으로 펼치는 드롭다운**(`Gnb`).\n" +
          "- 항목이 많아 한 줄 드롭다운으로는 훑기 어려운 제품·솔루션 탐색 메뉴.\n" +
          "\n## When NOT to use\n" +
          "- 제품(SaaS) 내비게이션 → Sidebar · ProductRailItem.\n" +
          "- 항목이 몇 개뿐인 메뉴 → 일반 드롭다운(ActionMenuItem 등).\n" +
          "- GNB 밖(본문)에서 카테고리 그리드를 보여 주는 용도 — 섹션 레이아웃은 `.wds-web-section`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ── 아이콘 플레이스홀더 ── */
const IconPlaceholder = () => (
  <span
    className="wds-mega-menu-icon"
    style={{
      background: "var(--color-surface-50)",
      borderRadius: 4,
    }}
  />
);

/* ── 데모 데이터 — www/src/data/site.ts 의 productCategories 와 동일 구조 ── */
const categories = [
  {
    category: "Application",
    items: [
      { label: "애플리케이션", href: "#" },
      { label: "URL", href: "#" },
      { label: "RUM", href: "#" },
      { label: "브라우저", href: "#" },
    ],
  },
  {
    category: "Infrastructure",
    items: [
      { label: "서버", href: "#" },
      { label: "데이터베이스", href: "#" },
      { label: "쿠버네티스", href: "#" },
      { label: "로그", href: "#" },
    ],
  },
  {
    category: "Network",
    items: [
      { label: "네트워크", href: "#" },
    ],
  },
  {
    category: "AI & Data",
    items: [
      { label: "LLM Observability", href: "#" },
      { label: "GPU", href: "#" },
      { label: "OpenMetrics", href: "#" },
    ],
  },
];

const MegaMenuMarkup = ({ divided = true }: { divided?: boolean }) => (
  <div className={`wds-mega-menu${divided ? " wds-mega-menu--divided" : ""}`}>
    {categories.map((cat) => (
      <div className="wds-mega-menu-col" key={cat.category}>
        <div className="wds-mega-menu-category">{cat.category}</div>
        {cat.items.map((item) => (
          <a key={item.label} href={item.href} className="wds-mega-menu-link">
            <IconPlaceholder />
            {item.label}
          </a>
        ))}
      </div>
    ))}
  </div>
);

/** Light Divided — 기본 변형. 밝은 배경 + 컬럼 세로 구분선. */
export const LightDivided: Story = {
  render: () => <MegaMenuMarkup divided />,
};

/** Light Undivided — 구분선 없는 변형. */
export const LightUndivided: Story = {
  render: () => <MegaMenuMarkup divided={false} />,
};

/** GNB 컨텍스트 — 드롭다운처럼 배치한 상태. */
export const InGnbContext: Story = {
  render: () => (
    <div style={{ position: "relative", paddingTop: 80 }}>
      {/* GNB 바 모의 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          display: "flex",
          alignItems: "center",
          paddingLeft: 40,
          gap: 32,
          background: "var(--color-card)",
          borderBottom: "1px solid var(--color-border-default)",
          fontSize: 15,
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18 }}>WhaTap</span>
        <span style={{ color: "var(--color-brand-blue-web, var(--color-brand-blue))" }}>서비스</span>
        <span>고객 사례</span>
        <span>인사이트</span>
        <span>요금안내</span>
      </div>
      {/* 메가 메뉴 드롭다운 위치 */}
      <div style={{ paddingLeft: 40 }}>
        <MegaMenuMarkup divided />
      </div>
    </div>
  ),
};
