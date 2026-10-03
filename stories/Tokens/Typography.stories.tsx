import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

/**
 * Typography tokens — font family × role.
 */
const meta: Meta = {
  title: "Tokens/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.family.*` — 폰트 패밀리 stack 2종.** 한국어 본문(korean) / 숫자·메트릭(numeric) " +
          "역할 분리. 위젯 내 모든 텍스트는 이 토큰을 참조해야 하며 인라인 `fontFamily` 리터럴 금지.",
      },
    },
  },
};
export default meta;

function TypeRow({ family, label, hex, description, sample }: { family: string; label: string; hex: string; description: string; sample: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, border: "1px solid var(--color-border-default)", borderRadius: 8, background: "var(--color-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: "'Noto Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>{label}</div>
        <div style={{ fontFamily: "Roboto, monospace", fontSize: 11, color: "var(--color-text-tertiary)" }}>{hex}</div>
      </div>
      <div style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{description}</div>
      <div style={{ borderTop: "1px solid var(--color-border-default)", paddingTop: 12, marginTop: 4 }}>
        <div style={{ fontFamily: family, fontSize: 22, color: "var(--color-text-primary)" }}>{sample}</div>
        <div style={{ fontFamily: family, fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4 }}>{sample}</div>
        <div style={{ fontFamily: family, fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>{sample}</div>
      </div>
    </div>
  );
}

/** **`tokens.font.family.korean`** — 한국어 본문용 stack. */
export const KoreanBody: StoryObj = {
  render: () => (
    <div style={{ width: "100%" }}>
      <TypeRow
        family={tokens.font.family.korean.value}
        label="font.family.korean"
        hex={tokens.font.family.korean.value}
        description={tokens.font.family.korean.description}
        sample="WhaTap AI 가 응답 카드를 작성합니다 — 이상 탐지 → 원인 분석 → 조치 제안."
      />
    </div>
  ),
};

/** **`tokens.font.family.numeric`** — 숫자·메트릭용 stack. */
export const Numeric: StoryObj = {
  render: () => (
    <div style={{ width: "100%" }}>
      <TypeRow
        family={tokens.font.family.numeric.value}
        label="font.family.numeric"
        hex={tokens.font.family.numeric.value}
        description={tokens.font.family.numeric.description}
        sample="1,234,567   42.7%   $1,580,000   p99 5.4s"
      />
    </div>
  ),
};

/** 둘 한 줄 비교 — 같은 텍스트에서 stack 차이 시각화. */
export const SideBySide: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
      <TypeRow
        family={tokens.font.family.korean.value}
        label="korean (한국어 본문)"
        hex={tokens.font.family.korean.value}
        description={tokens.font.family.korean.description}
        sample="응답시간 1,234ms / 42.7%"
      />
      <TypeRow
        family={tokens.font.family.numeric.value}
        label="numeric (숫자·메트릭)"
        hex={tokens.font.family.numeric.value}
        description={tokens.font.family.numeric.description}
        sample="응답시간 1,234ms / 42.7%"
      />
    </div>
  ),
};
