import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "@whatap/design-system";

/**
 * Stories for [[Breadcrumb]] — 현재 위치를 알리는 한 줄 띠.
 */
const meta: Meta<typeof Breadcrumb> = {
  title: "Primitives/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** 세 단계 — 마지막이 현재 페이지라 링크가 아니다. */
export const Default: Story = {
  args: {
    items: [
      { label: "홈", href: "/ko" },
      { label: "제품", href: "/ko/products" },
      { label: "애플리케이션 모니터링(APM)" },
    ],
  },
};

/** 두 단계. */
export const TwoLevels: Story = {
  args: { items: [{ label: "홈", href: "/ko" }, { label: "고객 사례" }] },
};

/** 링크가 없는 항목만 — 글자만 그린다. */
export const NoLinks: Story = {
  args: { items: [{ label: "홈" }, { label: "이용약관" }] },
};

/** 비면 아무것도 그리지 않는다. */
export const Empty: Story = { args: { items: [] } };
