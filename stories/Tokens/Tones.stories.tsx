import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens, type SemanticIntent } from "@whatap/design-system/widget";

/**
 * SemanticIntent — 색상이 전달하는 의미.
 *
 * 디자인 시스템이 사용자(또는 AI agent)에게 약속하는 의미 매핑. 새 컴포넌트가 어떤 톤을 써야할지
 * 결정할 때의 단일 출처.
 */
const meta: Meta = {
  title: "Tokens/Tones (Semantic Intent)",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`SemanticIntent` = `critical | warning | info | muted | neutral`**\n\n" +
          "AI 위젯 안의 모든 컬러 신호는 5개 의미 중 하나에 정확히 매핑되어야 합니다. " +
          "신규 톤을 추가하려면 먼저 의미 정의를 토큰에 등록한 뒤 컴포넌트가 그 토큰을 참조하도록 하세요.\n\n" +
          "옛 `Tone` (high/mid/low/idle/neutral) 은 backward compat 으로 동작하지만 신규 코드는 의미 명시되는 새 이름 권장.",
      },
    },
  },
};
export default meta;

const INTENT_META: Record<SemanticIntent, { meaning: string; legacyAlias: string }> = {
  critical: { meaning: "시급한 문제 · 실패 · 이상치 — 즉시 조치 필요", legacyAlias: "high" },
  warning:  { meaning: "주의 · 경계 · 주변값 — 모니터링 필요", legacyAlias: "mid" },
  info:     { meaning: "안내 · 정상 · 정보 전달 — 참고 정보", legacyAlias: "low" },
  muted:    { meaning: "비활성 · idle · 중립 컨테이너", legacyAlias: "idle" },
  neutral:  { meaning: "강조 없는 기본 (placeholder 격)", legacyAlias: "neutral" },
};

const INTENTS: SemanticIntent[] = ["critical", "warning", "info", "muted", "neutral"];

/** 5개 SemanticIntent 의 의미·legacy alias·예시 컬러 매트릭스. */
export const SemanticIntentMatrix: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {INTENTS.map((intent) => {
        const surface = tokens.color.surface[intent];
        const indicator = tokens.color.indicator[intent];
        const toneText = tokens.color.toneText[intent];
        const label = tokens.label[intent];
        const m = INTENT_META[intent];
        return (
          <div key={intent} style={{ display: "grid", gridTemplateColumns: "100px 200px 1fr 240px", gap: 16, alignItems: "center", padding: 16, border: "1px solid var(--color-border-default)", borderRadius: 8, background: surface.cssVar }}>
            {/* 1. 이름 */}
            <div>
              <div style={{ fontFamily: "Roboto, monospace", fontWeight: 700, fontSize: 14, color: indicator.cssVar }}>{intent}</div>
              <div style={{ fontFamily: "Roboto, monospace", fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>
                legacy: <code>{m.legacyAlias}</code>
              </div>
            </div>
            {/* 2. 의미 */}
            <div style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.4 }}>
              {m.meaning}
            </div>
            {/* 3. 토큰 값 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "Roboto, monospace", fontSize: 10, color: "var(--color-text-secondary)" }}>
              <div>surface: <code>{surface.value}</code></div>
              <div>indicator: <code>{indicator.value}</code></div>
              <div>label: "{label.value || "(none)"}"</div>
            </div>
            {/* 4. 배지 미리보기 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 12, background: "var(--color-card)" }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: indicator.cssVar }} />
              <span style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 12, color: toneText.cssVar, fontWeight: 500 }}>
                {label.value || `(${intent})`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

/** Legacy Tone alias 표 — 옛 이름과 새 이름의 매핑. */
export const LegacyToneMapping: StoryObj = {
  render: () => (
    <div style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Noto Sans', sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--color-surface-50)", textAlign: "left" }}>
            <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)" }}>Legacy Tone</th>
            <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)" }}>New SemanticIntent</th>
            <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)" }}>의미</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["high", "critical", "시급/위험"],
            ["mid", "warning", "주의"],
            ["low", "info", "안내/정상"],
            ["idle", "muted", "비활성"],
            ["neutral", "neutral", "기본 (그대로)"],
          ].map(([legacy, intent, meaning]) => (
            <tr key={legacy}>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)", fontFamily: "Roboto, monospace" }}><code>{legacy}</code></td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)", fontFamily: "Roboto, monospace" }}><code>{intent}</code></td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-default)", color: "var(--color-text-secondary)" }}>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, padding: 12, background: "var(--color-tone-surface-warning)", border: "1px solid var(--color-indicator-warning)", borderRadius: 6, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        ⚠️ <strong>Legacy</strong> 이름은 <code>@deprecated</code> 로 동작하지만 신규 코드는 새 SemanticIntent 이름 사용 권장.
        Tone 타입은 union 이므로 옛 이름과 새 이름 모두 같은 컴포넌트에 전달 가능 — 점진 마이그레이션 가능.
      </div>
    </div>
  ),
};
