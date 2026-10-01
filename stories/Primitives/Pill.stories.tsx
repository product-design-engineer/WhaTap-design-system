import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Stories for wds-pill — 마케팅 수평 탭 pill.
 *
 * CSS 클래스 기반. `aria-selected="true"` 로 활성 상태 전환.
 * 추천 서비스 탭 네비게이션에서 사용.
 */
const meta: Meta = {
  title: "Primitives/Web · Pill",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**수평 탭 pill.** `.wds-pill` CSS 클래스. " +
          "`aria-selected=\"true\"` 로 활성 상태, 톤 색상은 별도 CSS 클래스로 적용. " +
          "추천 서비스 섹션 탭 네비게이션에서 사용.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** 기본 — 비선택/선택 상태. */
export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" className="wds-pill" aria-selected="false">
        비활성
      </button>
      <button type="button" className="wds-pill" aria-selected="true">
        활성
      </button>
    </div>
  ),
};

/** Hover 상태 — 마우스를 올려 효과 확인.
 *  hover: 배경 surface-50 · inset border 1px · border-strong.
 *  active: inset border 1.5px · surface-100 배경.
 *  선택됨 hover: inset 0 0 0 1px white 20% 내부 하이라이트. */
export const HoverStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, padding: 20, background: "#fff", borderRadius: 8 }}>
      <button type="button" className="wds-pill" aria-selected="false">
        기본 — hover 해보세요
      </button>
      <button type="button" className="wds-pill" aria-selected="true">
        선택됨 — hover 해보세요
      </button>
    </div>
  ),
};

/** 추천 서비스 탭 — 실제 사용 예. 아이콘 + 라벨 조합. */
export const RecommendedServiceTabs: Story = {
  render: () => (
    <div style={{
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      padding: 20,
      background: "#fff",
      borderRadius: 8,
    }}>
      <button type="button" className="wds-pill" aria-selected="true">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        WhaTap AI
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        GPU
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        쿠버네티스
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        애플리케이션
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        데이터베이스
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        서버
      </button>
      <button type="button" className="wds-pill" aria-selected="false">
        <span style={{ width: 20, height: 20, display: "inline-block", background: "currentColor", borderRadius: 4, opacity: 0.3 }} />
        URL
      </button>
    </div>
  ),
};
