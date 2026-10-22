import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { useTokens, tokenLabel, type TokenEntry } from "../_useTokens";

/**
 * 마케팅(www) 전용 토큰 카탈로그 — `--*-web-*`.
 *
 * 값도 이름 목록도 적지 않는다 — `_useTokens` 가 `:root` 를 런타임에 열거한다.
 * 토큰을 추가하면 자동으로 나타나고, 값을 바꾸면 자동으로 따라간다.
 * (이전 판은 이름을 손으로 나열해서, 존재하지 않는 토큰 7종이 빈 견본으로 그려지고 있었다.)
 * 토큰의 의미(@role)는 whatap-ds.css 선언 위 주석이 정본이다 — 여기서 복제하지 않는다.
 */
const meta: Meta = {
  title: "Tokens/Web · Marketing",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 전용 토큰.** `--color-web-*`(표면 · 다크 위 텍스트/보더/채움 · 랜딩 · 강조) · " +
          "`--text-web-*` · `--leading-web-*`(타이포) · `--radius-web-*` · `--shadow-web-*`. " +
          "3-Prefix 정책상 `wds-web-*` 클래스 안에서만 쓴다 — 제품(SaaS) 화면은 `--color-*` · `--text-*`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/* 모듈 상수 — useTokens deps 의 identity 안정용. */
const NONE: string[] = [];
const CHECKER =
  "repeating-conic-gradient(var(--color-surface-200) 0% 25%, var(--color-card) 0% 50%) 50% / 12px 12px";

const nameStyle: CSSProperties = { fontFamily: "var(--font-family-numeric)" };

function Empty({ prefix }: { prefix: string }) {
  return <div className="text-md text-tertiary">`{prefix}*` 토큰이 없습니다.</div>;
}

function Grid({ children, min = 280 }: { children: ReactNode; min?: number }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>
      {children}
    </div>
  );
}

function Label({ entry }: { entry: TokenEntry }) {
  return (
    <div className="flex flex-col gap-0_5 min-w-0">
      <div className="text-base font-bold">{tokenLabel(entry.name)}</div>
      <div className="text-chart leading-none" style={{ ...nameStyle, opacity: 0.7 }}>{entry.value}</div>
    </div>
  );
}

/** 색 — 견본(체커보드 위 → 알파가 드러난다) + 이름 + 계산값. */
function ColorGroup({ prefix, exclude = NONE }: { prefix: string; exclude?: string[] }) {
  const entries = useTokens(prefix, exclude);
  if (!entries.length) return <Empty prefix={prefix} />;
  return (
    <Grid>
      {entries.map((e) => (
        <div key={e.name} className="flex items-center gap-3">
          <div className="rounded-md shrink-0" style={{ width: 56, height: 40, background: CHECKER }}>
            <div
              className="rounded-md w-full h-full"
              style={{ background: `var(${e.name})`, border: "1px dashed var(--color-border-strong)" }}
            />
          </div>
          <Label entry={e} />
        </div>
      ))}
    </Grid>
  );
}

/** 다크 표면 위에서만 의미가 있는 토큰은 실제 쓰임과 같은 조건(tone-dark 섹션)에서 보여 준다. */
function OnDark({ children }: { children: ReactNode }) {
  return (
    <div className="wds-web-section--tone-dark" style={{ padding: 24, borderRadius: 12 }}>
      {children}
    </div>
  );
}

/** 표면 — 다크 섹션 · CTA 배너 그라데이션. */
export const Surfaces: Story = {
  render: () => <ColorGroup prefix="--color-web-surface-" />,
};

/** 다크 표면 위 텍스트 · 보더 · 채움. */
export const OnDarkSurface: Story = {
  render: () => (
    <OnDark>
      <div className="flex flex-col gap-3">
        <ColorGroup prefix="--color-web-text-on-dark" />
        <ColorGroup prefix="--color-web-border-on-dark" />
        <ColorGroup prefix="--color-web-fill-on-dark" />
      </div>
    </OnDark>
  ),
};

/** 브랜드 파랑(마케팅) — 정본 brand-blue 와 같은 값이다(9/17 결정). */
export const Brand: Story = {
  render: () => <ColorGroup prefix="--color-brand-blue-web" />,
};

/** 해외 URL 랜딩 표면 · 강조색. */
export const LandingAndAccent: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ColorGroup prefix="--color-web-landing-" />
      <ColorGroup prefix="--color-web-accent-" />
    </div>
  ),
};

/** 마케팅 회색 램프. */
export const Grays: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ColorGroup prefix="--color-web-gray-" />
      <ColorGroup prefix="--color-web-slate-" />
    </div>
  ),
};

/** 타이포 — 의미 기반(display · h1~h6 · body …)과 크기 기반(xs~9xl) 두 스케일. */
function TypeScaleView() {
  const sizes = useTokens("--text-web-", NONE);
  if (!sizes.length) return <Empty prefix="--text-web-" />;
  return (
    <div className="flex flex-col gap-2">
      {sizes.map((e) => (
        <div key={e.name} className="flex items-baseline gap-4">
          <code className="text-chart text-tertiary shrink-0" style={{ ...nameStyle, width: 220 }}>
            {e.name} · {e.value}
          </code>
          <span style={{ fontSize: `var(${e.name})`, lineHeight: "var(--leading-web-heading)" }}>와탭 모니터링</span>
        </div>
      ))}
    </div>
  );
}
export const TypeScale: Story = { render: () => <TypeScaleView /> };

/** 행간. */
function LineHeightsView() {
  const items = useTokens("--leading-web-", NONE);
  if (!items.length) return <Empty prefix="--leading-web-" />;
  return (
    <Grid min={240}>
      {items.map((e) => (
        <div key={e.name} className="flex flex-col gap-1">
          <Label entry={e} />
          <p className="text-base text-primary" style={{ lineHeight: `var(${e.name})`, maxWidth: 220 }}>
            운영 부담이 큰 AI 시대의 핵심 인프라를 와탭으로 효율적으로 운영해 보세요.
          </p>
        </div>
      ))}
    </Grid>
  );
}
export const LineHeights: Story = { render: () => <LineHeightsView /> };

/** 모서리. */
function RadiusView() {
  const items = useTokens("--radius-web-", NONE);
  if (!items.length) return <Empty prefix="--radius-web-" />;
  return (
    <div className="flex flex-wrap gap-6">
      {items.map((e) => (
        <div key={e.name} className="flex flex-col items-center gap-2">
          <div style={{ width: 72, height: 72, background: "var(--color-brand-blue-web)", borderRadius: `var(${e.name})` }} />
          <Label entry={e} />
        </div>
      ))}
    </div>
  );
}
export const Radius: Story = { render: () => <RadiusView /> };

/** 그림자. */
function ShadowsView() {
  const items = useTokens("--shadow-web-", NONE);
  if (!items.length) return <Empty prefix="--shadow-web-" />;
  return (
    <div className="flex flex-wrap gap-6" style={{ padding: 16 }}>
      {items.map((e) => (
        <div
          key={e.name}
          className="flex flex-col justify-center bg-card rounded-lg"
          style={{ width: 200, height: 96, padding: 12, boxShadow: `var(${e.name})` }}
        >
          <Label entry={e} />
        </div>
      ))}
    </div>
  );
}
export const Shadows: Story = { render: () => <ShadowsView /> };
