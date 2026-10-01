import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebSearchField } from "../../src";

/**
 * Stories for WebSearchField — 마케팅 검색 입력 필드.
 *
 * 제품·리소스·사례 목록 등에서 실시간 필터링 검색에 사용한다.
 * 돋보기 아이콘 + 텍스트 입력 + 클리어 버튼 통합.
 */
const meta: Meta<typeof WebSearchField> = {
  title: "Primitives/Web · SearchField",
  component: WebSearchField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 검색 입력 필드.** 돋보기 아이콘 + 텍스트 입력 + 클리어 버튼. " +
          "제품 플랫폼 목록, 리소스 목록 등에서 실시간 필터링에 사용한다.",
      },
    },
  },
  argTypes: {
    value: { control: "text", description: "입력값" },
    placeholder: { control: "text", description: "플레이스홀더" },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof WebSearchField>;

/** 기본 — md 사이즈. */
export const Default: Story = {
  render: () => {
    const [v, setV] = useState("");
    return (
      <div style={{ maxWidth: 400 }}>
        <WebSearchField value={v} onChange={setV} placeholder="검색" />
      </div>
    );
  },
};

/** size 3종. */
export const Sizes: Story = {
  render: () => {
    const [v1, setV1] = useState("");
    const [v2, setV2] = useState("");
    const [v3, setV3] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
        <div>
          <div style={{ marginBottom: 4, fontSize: 13, color: "var(--color-text-tertiary)" }}>sm (40px)</div>
          <WebSearchField value={v1} onChange={setV1} size="sm" placeholder="모바일 필터" />
        </div>
        <div>
          <div style={{ marginBottom: 4, fontSize: 13, color: "var(--color-text-tertiary)" }}>md (48px, 기본)</div>
          <WebSearchField value={v2} onChange={setV2} size="md" placeholder="리소스 검색" />
        </div>
        <div>
          <div style={{ marginBottom: 4, fontSize: 13, color: "var(--color-text-tertiary)" }}>lg (52px)</div>
          <WebSearchField value={v3} onChange={setV3} size="lg" placeholder="리소스 찾기" />
        </div>
      </div>
    );
  },
};

/** 값 입력 상태 — 클리어 버튼 표시. */
export const WithValue: Story = {
  render: () => {
    const [v, setV] = useState("Java");
    return (
      <div style={{ maxWidth: 400 }}>
        <WebSearchField value={v} onChange={setV} placeholder="플랫폼 검색" />
      </div>
    );
  },
};

/** 리소스 목록 사용 예시. */
export const InResourceList: Story = {
  render: () => {
    const [v, setV] = useState("");
    const items = ["쿠버네티스 모니터링 가이드", "APM 시작하기", "로그 분석 베스트 프랙티스", "데이터베이스 모니터링"];
    const filtered = v ? items.filter((i) => i.toLowerCase().includes(v.toLowerCase())) : items;
    return (
      <div style={{ maxWidth: 480 }}>
        <WebSearchField value={v} onChange={setV} size="lg" placeholder="리소스 찾기" />
        <ul style={{ marginTop: 16, padding: "0 0 0 20px", fontSize: 15, color: "var(--color-text-primary)" }}>
          {filtered.length > 0
            ? filtered.map((i) => <li key={i} style={{ marginBottom: 8 }}>{i}</li>)
            : <li style={{ color: "var(--color-text-tertiary)" }}>결과 없음</li>}
        </ul>
      </div>
    );
  },
};
