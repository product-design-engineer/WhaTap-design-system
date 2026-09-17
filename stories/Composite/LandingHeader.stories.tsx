import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingHeader, ThemeToggle } from "@whatap/design-system";

/**
 * Stories for [[LandingHeader]] — 마케팅 사이트의 sticky 상단 바.
 *
 * ## When to use
 * 로그인 전 공개 페이지(랜딩·블로그·리소스)가 공유하는 헤더. 제품 화면 헤더는 [[PageHeader]].
 */
const meta: Meta<typeof LandingHeader> = {
  title: "Composite/LandingHeader",
  component: LandingHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "**로그인 전 공개 페이지가 공유하는 60px sticky 헤더.**",
          "",
          "### 왜 DS 에 있나",
          "",
          "같은 헤더가 저장소마다 따로 구현돼 갈라진 적이 있다. 한쪽에서 «모바일에서 CTA 두 개가",
          "눌리지 않는다»를 고쳤는데 다른 쪽에는 반영되지 않아, 나중에 손으로 옮겨야 했다.",
          "헤더는 페이지마다 인라인으로 두면 반드시 갈라지는 종류의 UI 다.",
          "",
          "### 무엇을 prop 으로 여는가",
          "",
          "로고·제품 라벨·메뉴 목록·로그인/가입 CTA·테마 토글을 **전부 밖에서 받는다.** 마케팅",
          "문구와 목적지는 제품마다 다르므로 컴포넌트 안에 상수로 두지 않는다. 테마 토글은 슬롯인데,",
          "테마 상태가 루트의 `data-theme` 와 로고 반전까지 걸리는 **페이지 소유 상태**이기 때문이다.",
          "",
          "### 반응형 — DS 에서 뷰포트 미디어쿼리를 쓰는 유일한 컴포넌트",
          "",
          "제품 화면은 사이드바·AI 위젯이 열리고 닫혀 행 폭이 변하므로 컨테이너 쿼리를 쓴다.",
          "반면 랜딩 헤더는 셸 없이 뷰포트 전폭을 쓰므로 **뷰포트가 곧 가용 폭**이다.",
          "",
          "| 경계 | 아래에서 일어나는 일 | 왜 |",
          "|---|---|---|",
          "| **640px** | nav 가 햄버거 시트로 접히고, 로고가 심볼만 남는다 | 메뉴 3개 + CTA 2개가 한 줄에 못 들어간다 |",
          "| **1024px** | 제품 라벨(`productLabel`)이 숨는다 | 이 라벨이 CTA 자리를 뺏어 실제로 버튼이 눌리지 않았다 |",
          "",
          "CTA 두 개(Sign in · Get started free)는 **모든 폭에서 보인다.** 가입 동선이 헤더의 존재",
          "이유라, 좁다고 접으면 안 된다 — 대신 글자·여백을 줄인다.",
          "",
          "### 배경",
          "",
          "`--color-header-translucent` + `backdrop-filter: blur(10px)`. 스크롤할 때 본문이 비쳐야",
          "해서 불투명한 `--color-card` 를 쓰지 않는다. 다크 모드 값은 토큰이 함께 뒤집는다.",
          "",
          "### ⚠️ 조상의 `overflow-x: hidden` 이 sticky 를 죽인다",
          "",
          "`overflow-x: hidden` 은 **스크롤 컨테이너를 만든다.** 그러면 헤더가 뷰포트가 아니라 그",
          "컨테이너를 기준으로 붙어서, 페이지를 스크롤하면 그대로 밀려 올라간다. 실측하면",
          "`getBoundingClientRect().top` 이 스크롤한 만큼 음수가 된다.",
          "",
          "가로 넘침을 잘라야 하면 **`overflow-x: clip`** 을 쓴다 — 잘라내되 스크롤 컨테이너를",
          "만들지 않는다. 소비앱에서 실제로 이 차이 때문에 헤더가 붙지 않았다.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    logo: { control: false, description: "로고 — 640px 이상에서 노출. 보통 워드마크." },
    logoCompact: { control: false, description: "640px 미만에서 대신 노출할 축약 로고(심볼)." },
    productLabel: { control: "text", description: "로고 옆 제품 이름. 1024px 이상에서만 노출." },
    homeHref: { control: "text", description: "로고 클릭 목적지. 기본 `/`." },
    currentPath: { control: "text", description: "현재 경로 — 일치하는 메뉴에 aria-current." },
    nav: { control: false, description: "상단 메뉴. 비우면 nav 와 햄버거가 모두 사라진다." },
    themeToggle: { control: false, description: "테마 토글 슬롯. 상태는 페이지가 소유." },
    signIn: { control: false, description: "로그인 링크." },
    cta: { control: false, description: "가입 CTA." },
  },
};

export default meta;
type Story = StoryObj<typeof LandingHeader>;

/**
 * 로고 에셋 — `SidebarLogoHeader` 와 같은 표준 경로를 쓴다(`static/icons` → `/icons`).
 * 다크에서는 원본이 어두워 보이지 않으므로 반전 필터를 건다. 이 반전은 페이지가 테마를
 * 소유하기 때문에 소비앱 쪽 관심사이고, 여기서는 카탈로그가 보여주기 위해 흉내만 낸다.
 */
const icon = (name: string) => `/icons/${name}`;

const Wordmark = ({ dark = false }: { dark?: boolean }) => (
  <img
    src={icon("whatap-logo.svg")}
    alt="WhaTap"
    style={{ height: 20, display: "block", filter: dark ? "brightness(0) invert(1)" : "none" }}
  />
);

const Symbol = ({ dark = false }: { dark?: boolean }) => (
  <img
    src={icon("whatap-symbol.svg")}
    alt="WhaTap"
    style={{ height: 24, display: "block", filter: dark ? "brightness(0) invert(1)" : "none" }}
  />
);

const NAV = [
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "https://docs.whatap.io/", newTab: true },
  { label: "Resources", href: "/resource" },
];

/** 기본 — 메뉴 3개 + 테마 토글 + CTA 두 개. */
export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [theme, setTheme] = useState<"light" | "dark">("light");
      return (
        <LandingHeader
          logo={<Wordmark dark={theme === "dark"} />}
          logoCompact={<Symbol dark={theme === "dark"} />}
          productLabel="URL Monitoring"
          nav={NAV}
          currentPath="/resource"
          themeToggle={<ThemeToggle value={theme} onChange={setTheme} applyTo={null} />}
          signIn={{ label: "Sign in", href: "/login" }}
          cta={{ label: "Get started free", href: "/signup" }}
        />
      );
    };
    return <Demo />;
  },
};

/**
 * **Sticky + blur** — 이 컴포넌트의 핵심 동작. 캔버스를 스크롤해 확인한다.
 *
 * 헤더는 `position: sticky; top: 0` 로 상단에 붙어 있고, 배경이 반투명
 * (`--color-header-translucent`)이라 **본문이 헤더 밑으로 지나가는 것이 비쳐 보인다.**
 * 거기에 `backdrop-filter: blur(10px)` 이 걸려, 비치는 본문이 흐려져 헤더 위의 글자가
 * 읽히는 대비를 유지한다.
 *
 * 불투명한 `--color-card` 를 쓰면 이 효과가 사라진다 — 헤더가 본문을 잘라먹는 띠처럼 보이고,
 * 페이지가 어디까지 스크롤됐는지 단서가 없어진다. 마케팅 페이지에서 헤더가 «떠 있다»는
 * 인상은 이 반투명 + blur 조합에서 나온다.
 *
 * `z-index: 50` 은 본문의 떠 있는 요소(카드 그림자·패럴랙스 배경)보다 위에 두기 위한 값이다.
 */
export const StickyAndBlur: Story = {
  render: () => {
    const Demo = () => {
      const [theme, setTheme] = useState<"light" | "dark">("light");
      return (
        <div style={{ height: 520, overflowY: "auto", background: "var(--color-bg)" }}>
          <LandingHeader
            logo={<Wordmark dark={theme === "dark"} />}
            logoCompact={<Symbol dark={theme === "dark"} />}
            productLabel="URL Monitoring"
            nav={NAV}
            themeToggle={<ThemeToggle value={theme} onChange={setTheme} applyTo={null} />}
            signIn={{ label: "Sign in", href: "/login" }}
            cta={{ label: "Get started free", href: "/signup" }}
          />
          {/* 헤더 밑으로 지나갈 본문 — 색이 있는 블록이라야 비치는 것이 보인다. */}
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  borderRadius: 16,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(90deg, var(--color-brand-blue), var(--color-whatap-purple))"
                      : "var(--color-card)",
                  border: "1px solid var(--color-border-default)",
                }}
              />
            ))}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * 메뉴 없음 — nav 를 비우면 햄버거까지 함께 사라진다.
 * 상세 페이지처럼 되돌아갈 곳이 본문에 있는 화면에서 쓴다.
 */
export const WithoutNav: Story = {
  render: () => (
    <LandingHeader
      logo={<Wordmark />}
      logoCompact={<Symbol />}
      productLabel="URL Monitoring"
      signIn={{ label: "Sign in", href: "/login" }}
      cta={{ label: "Get started free", href: "/signup" }}
    />
  ),
};

/**
 * CTA 만 — 가입 전환 하나에 집중하는 캠페인 페이지.
 * 로그인 링크까지 빼면 방문자가 되돌아갈 곳이 없어지므로, 보통은 함께 둔다.
 */
export const CtaOnly: Story = {
  render: () => (
    <LandingHeader logo={<Wordmark />} cta={{ label: "Get started free", href: "/signup" }} />
  ),
};

/**
 * 좁은 폭 — 640px 미만. 캔버스를 줄여 확인한다.
 * nav 가 햄버거로 접히고 로고가 심볼만 남으며, 제품 라벨은 숨는다. CTA 두 개는 유지된다.
 */
export const Narrow: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <LandingHeader
      logo={<Wordmark />}
      logoCompact={<Symbol />}
      productLabel="URL Monitoring"
      nav={NAV}
      signIn={{ label: "Sign in", href: "/login" }}
      cta={{ label: "Get started free", href: "/signup" }}
    />
  ),
};
