import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Korean vs Numeric",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`korean` vs `numeric` font family 선택 가이드.**\n\n" +
          "현재 prototype 의 10+ 컴포넌트가 Roboto(numeric) 를 쓰지만 **선택 기준이 미문서화**. " +
          "AI agent 가 어디서 어떤 폰트 써야 할지 결정 가능하도록 비교 + 사용 규칙 정리.",
      },
    },
  },
};
export default meta;

const GUIDANCE: { context: string; family: "korean" | "numeric"; reason: string }[] = [
  { context: "한국어 본문, 라벨, 헤딩", family: "korean", reason: "한국어 + Latin 혼용 시 baseline 일치" },
  { context: "Mixed 한국어 + 영문 텍스트", family: "korean", reason: "Noto Sans 가 Latin glyph 도 처리" },
  { context: "SVG 차트 axis · peak 라벨", family: "numeric", reason: "숫자 가독성 + 등폭 비례 우수" },
  { context: "DataTable numeric 컬럼", family: "numeric", reason: "자릿수 정렬 정확" },
  { context: "시계 · 타이머 digit (LIVE)", family: "numeric", reason: "모노스페이스 느낌, digit 흔들림 없음" },
  { context: "큰 metric 숫자 (₩, %, count)", family: "numeric", reason: "AiMigPlan total · KPI 카드" },
  { context: "ISO date · hex 색상 코드", family: "numeric", reason: "한국어 텍스트와 시각 구분" },
];

export const SelectionGuide: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860, fontFamily: tokens.font.family.korean.value }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", gap: 16, padding: "8px 16px", borderBottom: "1px solid var(--color-border-default)", fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        <span>Context</span>
        <span style={{ textAlign: "center" }}>Family</span>
        <span>Reason</span>
      </div>
      {GUIDANCE.map((g, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", gap: 16, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--color-surface-50)" }}>
          <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{g.context}</span>
          <code style={{ textAlign: "center", fontFamily: "Roboto, monospace", fontSize: 12, color: g.family === "numeric" ? "var(--color-brand-blue)" : "var(--color-text-primary)", fontWeight: 700 }}>{g.family}</code>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{g.reason}</span>
        </div>
      ))}
    </div>
  ),
};

const SAMPLES = [
  { label: "응답시간", value: "1,234ms" },
  { label: "사용률", value: "42.7%" },
  { label: "비용", value: "₩1,580,000" },
  { label: "Active TX", value: "427" },
  { label: "p99 latency", value: "5.4s" },
];

export const NumericComparison: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 16, fontFamily: tokens.font.family.korean.value }}>
        같은 숫자 텍스트를 두 폰트로 나란히 표시. <strong>numeric(Roboto)</strong> 이 자릿수 정렬 · 등폭 비례에서 시각적으로 더 안정적임이 확인됩니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 16, padding: "8px 16px", borderBottom: "1px solid var(--color-border-default)", fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", fontFamily: tokens.font.family.korean.value }}>
        <span>Metric</span>
        <span>korean (Noto Sans)</span>
        <span style={{ color: "var(--color-brand-blue)" }}>numeric (Roboto)</span>
      </div>
      {SAMPLES.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 16, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--color-surface-50)" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: tokens.font.family.korean.value }}>{s.label}</span>
          <span style={{ fontFamily: tokens.font.family.korean.value, fontSize: 18, color: "var(--color-text-primary)", fontWeight: 700 }}>{s.value}</span>
          <span style={{ fontFamily: tokens.font.family.numeric.value, fontSize: 18, color: "var(--color-text-primary)", fontWeight: 700 }}>{s.value}</span>
        </div>
      ))}
    </div>
  ),
};
