import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebDateLabel } from "../../src";

/**
 * Stories for WebDateLabel — 마케팅 날짜 라벨.
 *
 * 공통 정책(2026-06-30): YYYY-MM-DD 날짜 표시에는 캘린더 아이콘을 필수로 붙인다.
 */
const meta: Meta<typeof WebDateLabel> = {
  title: "Primitives/Web · DateLabel",
  component: WebDateLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 날짜 라벨.** 캘린더 아이콘 + YYYY-MM-DD 포맷. " +
          "사례·리소스·뉴스 카드 및 상세 페이지의 날짜 표시에 사용한다. " +
          "공통 정책(2026-06-30): 모든 날짜에 캘린더 아이콘 필수.",
      },
    },
  },
  argTypes: {
    date: { control: "text", description: "ISO 날짜 (YYYY-MM-DD)" },
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof WebDateLabel>;

/** 기본 — 카드 목록 크기 (sm). */
export const Default: Story = {
  args: { date: "2025-05-23", size: "sm" },
};

/** 상세 페이지 크기 (md). */
export const Medium: Story = {
  args: { date: "2025-05-23", size: "md" },
};

/** 카드 내 사용 예시. */
export const InCard: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
      <div style={{ fontWeight: 600, fontSize: 16 }}>LG유플러스 통합 관제 혁신</div>
      <div className="wds-web-service-chips">
        <span className="wds-web-service-chip" data-service="APM">APM</span>
        <span className="wds-web-service-chip" data-service="Kubernetes">Kubernetes</span>
      </div>
      <WebDateLabel date="2025-05-23" />
    </div>
  ),
};

/** null 날짜 — 렌더하지 않음. */
export const NullDate: Story = {
  args: { date: null },
};
