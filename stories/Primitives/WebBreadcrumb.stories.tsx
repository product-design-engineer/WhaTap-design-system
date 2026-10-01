import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebBreadcrumb } from "../../src";

/**
 * Stories for WebBreadcrumb — 마케팅 브레드크럼 내비게이션.
 *
 * 공통 정책(2026-06-30): 홈을 제외한 모든 페이지에 필수 적용.
 */
const meta: Meta<typeof WebBreadcrumb> = {
  title: "Primitives/Web · Breadcrumb",
  component: WebBreadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**마케팅 브레드크럼.** 홈을 제외한 모든 페이지 상단에 필수 적용. " +
          "40px 높이, 구분자 `/`, 현재 페이지는 bold. " +
          "공통 정책(2026-06-30): 홈 제외 전 페이지 필수.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WebBreadcrumb>;

/** 기본 — string 배열. 첫 항목은 자동 홈 링크. */
export const Default: Story = {
  args: {
    items: ["와탭랩스", "고객 사례"],
  },
};

/** 3단 경로 — 상세 페이지. */
export const ThreeLevel: Story = {
  args: {
    items: [
      { label: "와탭랩스", href: "/ko" },
      { label: "고객 사례", href: "/ko/case" },
      { label: "LG유플러스 통합 관제 혁신", href: null },
    ],
  },
};

/** 제품 페이지. */
export const ProductPage: Story = {
  args: {
    items: [
      { label: "와탭랩스", href: "/ko" },
      { label: "Application Monitoring", href: null },
    ],
  },
};

/** 정책 페이지. */
export const PolicyPage: Story = {
  args: {
    items: ["와탭랩스", "이용약관"],
  },
};

/** links prop — 레거시 호출 방식. */
export const WithLinksArray: Story = {
  args: {
    items: ["와탭랩스", "리소스", "모니터링 가이드"],
    links: ["/ko", "/ko/resource", null],
  },
};
