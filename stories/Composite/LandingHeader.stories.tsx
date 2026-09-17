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

/** 로고 자리 표시 — 카탈로그에서는 실제 에셋 대신 텍스트로 둔다. */
const Wordmark = () => <span style={{ fontSize: 18, fontWeight: 700 }}>WhaTap</span>;
const Symbol = () => <span style={{ fontSize: 18, fontWeight: 700 }}>W</span>;

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
          logo={<Wordmark />}
          logoCompact={<Symbol />}
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
