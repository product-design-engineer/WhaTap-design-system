import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage } from "@whatap/design-system";

/**
 * Stories for [[Stage]] — 16:9 페이지 wrapper.
 */
const meta: Meta<typeof Stage> = {
  title: "Primitives/Stage",
  component: Stage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**16:9 stage wrapper.** 모든 prototype 페이지의 최외곽 컨테이너. 다크 페이지 위에 1280×720 흰 stage 를 중앙 정렬. " +
          "마케팅 데모용 (전시·발표 시 화면 비율 고정). 일반 모니터링 페이지는 DashboardLayout 사용.",
      },
    },
  },
  argTypes: {
    badge: { description: "우측 상단 둥근 라벨 (옵션) — 데모/시연 식별용.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Stage>;

/** 기본 — 다크 배경 + 흰 16:9 stage. */
export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif", color: "#222" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>페이지 콘텐츠</h1>
        <p style={{ fontSize: 14, color: "#4c4c4c" }}>이 자리에 페이지가 들어갑니다. 16:9 비율로 고정.</p>
      </div>
    ),
  },
};

/** 배지 표시 — 데모/시연 식별용. */
export const WithBadge: Story = {
  args: {
    badge: "AWS SUMMIT · LIVE DEMO",
    children: (
      <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif", color: "#222" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>WhaTap AI 데모 시작</h1>
      </div>
    ),
  },
};
