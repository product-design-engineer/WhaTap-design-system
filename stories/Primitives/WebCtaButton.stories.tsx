import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebCtaButton } from "@whatap/design-system";

/**
 * Stories for [[WebCtaButton]] — 마케팅 CTA 버튼.
 *
 * whatap.io 마케팅 페이지(히어로·섹션·배너)에서 사용하는 행동 유도 버튼.
 * variant(filled/outline/white) × size(sm/md/lg) × rounded(pill/rect).
 */
const meta: Meta<typeof WebCtaButton> = {
  title: "Primitives/Web · WebCtaButton",
  component: WebCtaButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 CTA 버튼.** filled(1차) · outline(2차) · white(다크 배경) 3 variant, " +
          "sm(36px) · md(50px) · lg(60px) 3 size, pill · rect 2 rounded. " +
          "오른쪽 화살표 기본 노출, `arrow={false}` 로 끌 수 있다.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "select" }, options: ["filled", "outline", "white"] },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    rounded: { control: { type: "select" }, options: ["pill", "rect"] },
    width: { control: { type: "select" }, options: ["hug", "full"] },
    arrow: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof WebCtaButton>;

/** 기본 — filled + lg. */
export const Default: Story = {
  args: { href: "#", children: "무료로 시작하기" },
};

/** variant 3종. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <WebCtaButton href="#" variant="filled" size="lg">무료로 시작하기</WebCtaButton>
      <WebCtaButton href="#" variant="outline" size="lg">문서 보기</WebCtaButton>
      <div style={{ background: "#1a1a2e", padding: "16px 24px", borderRadius: 8 }}>
        <WebCtaButton href="#" variant="white" size="lg">WhaTap AI 체험</WebCtaButton>
      </div>
    </div>
  ),
};

/** size 3종 — sm(36) · md(50) · lg(60). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <WebCtaButton href="#" size="sm">sm 36px</WebCtaButton>
      <WebCtaButton href="#" size="md">md 50px</WebCtaButton>
      <WebCtaButton href="#" size="lg">lg 60px</WebCtaButton>
    </div>
  ),
};

/** rounded — pill(기본) vs rect(4px). */
export const Rounded: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <WebCtaButton href="#" rounded="pill">pill (기본)</WebCtaButton>
      <WebCtaButton href="#" rounded="rect">rect (4px)</WebCtaButton>
    </div>
  ),
};

/** arrow 끔. */
export const NoArrow: Story = {
  args: { href: "#", children: "화살표 없음", arrow: false },
};

/** 다크 배경 — 히어로 dark/ai 테마에서 사용하는 조합. */
export const OnDarkBackground: Story = {
  render: () => (
    <div style={{ background: "linear-gradient(135deg, #0a0a1a, #0d0f1e)", padding: 40, borderRadius: 12, display: "flex", gap: 16 }}>
      <WebCtaButton href="#" variant="white" size="lg">도입 문의</WebCtaButton>
      <WebCtaButton href="#" variant="outline" size="lg">
        <span style={{ color: "#fff" }}>자세히</span>
      </WebCtaButton>
    </div>
  ),
};

/** full width. */
export const FullWidth: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <WebCtaButton href="#" width="full" size="md">전체 너비 버튼</WebCtaButton>
    </div>
  ),
};
