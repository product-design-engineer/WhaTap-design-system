import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { enableDsPolicyGuard, type DsPolicyRule } from "../../src/devPolicyGuard";

/**
 * Policy Guard — DS 정책 위반을 **화면에서** 드러내는 개발 전용 런타임 가드.
 *
 * `npm run lint:tokens` 는 커밋 시점에만 돈다. 화면을 보며 작업하는 동안에는 위반 신호가
 * 없어서 "회색 바닥에 카드 없이 놓인 테이블" 같은 **런타임 상태**가 눈에 띄지 않는다.
 * 이 가드는 살아있는 DOM 을 스캔해 위반 요소에 빨간 점선 outline + 배지를 씌우고
 * console 에 "무엇을 무엇으로 바꿔야 하는지" 를 남긴다.
 *
 * **차단은 CI, 인지는 가드** — 역할이 다르다. 가드는 앱 동작을 바꾸지 않는다.
 */
const meta: Meta = {
  title: "Tokens/Policy Guard",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**DS 정책 위반 런타임 가드.** CI 가 잡지 못하는 런타임 상태(카드 없는 본문 블록 · " +
          "page·card 동일색 · 3층 중첩 · 인라인 색 리터럴)를 화면에서 즉시 인지시킨다. " +
          "Storybook 은 자동 적용, 소비 앱은 dev 모드에서 한 줄. 차단은 `lint:tokens` 가 담당.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/* ─── 규칙 표 ────────────────────────────────────────── */

const RULES: { rule: DsPolicyRule; label: string; detects: string; fix: string }[] = [
  {
    rule: "raw-color",
    label: "인라인 색 리터럴",
    detects: "인라인 style 의 hex/rgba · SVG fill·stroke 리터럴 · bg-white 계열 고정색 유틸",
    fix: "토큰으로 — var(--color-card) · var(--color-border-strong) · var(--color-text-tertiary)",
  },
  {
    rule: "uncarded-content",
    label: "카드 없는 본문 블록",
    detects: "`.wds-page-content` 직속 자녀가 카드 표면이 아님 (회색 바닥에 맨몸 배치)",
    fix: "의미 단위(테이블·차트·폼 섹션)를 bg-card 블록으로 감쌀 것",
  },
  {
    rule: "surface-collapse",
    label: "page·card 동일색",
    detects: "--color-bg 와 --color-card 가 같은 값 → 카드가 보더만 남아 층이 사라짐",
    fix: "페이지는 회색, 카드는 흰색 — 두 토큰을 같은 값으로 만들지 말 것",
  },
  {
    rule: "card-depth",
    label: "3층 이상 중첩 카드",
    detects: "본문 안에서 bg-card 선언이 3층 이상 쌓임",
    fix: "층은 page → card 2단까지. 더 필요하면 surface-50/100/200 으로 표현",
  },
];

function RuleTable() {
  return (
    <div className="flex flex-col gap-8px">
      {RULES.map((r) => (
        <div
          key={r.rule}
          className="flex flex-col gap-4px bg-card border border-default rounded-8px p-12px"
        >
          <div className="flex items-center gap-8px">
            <code
              className="text-xs px-6px py-2px rounded-4px bg-surface-100 text-secondary"
              style={{ fontFamily: "var(--font-family-mono)" }}
            >
              {r.rule}
            </code>
            <span
              className="text-md font-bold text-primary"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {r.label}
            </span>
          </div>
          <span
            className="text-base text-secondary"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            <strong>탐지</strong> — {r.detects}
          </span>
          <span
            className="text-base text-tertiary"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            <strong>고치는 법</strong> — {r.fix}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 가드가 탐지하는 4개 규칙 — 각 규칙이 무엇을 잡고 무엇으로 바꿔야 하는지. */
export const Rules: Story = {
  render: () => (
    <div className="wds-page-content flex flex-col gap-12px">
      <RuleTable />
    </div>
  ),
};

/* ─── 위반 시연 ──────────────────────────────────────── */

/**
 * 가드를 **이 영역에만** 국소 적용한다. 전역 가드(preview.tsx)와 달리 `root` 를
 * 이 컨테이너로 한정해, 시연 위반이 카탈로그의 다른 영역을 오염시키지 않게 한다.
 */
function GuardScope({
  rules,
  children,
}: {
  rules: DsPolicyRule[];
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return enableDsPolicyGuard({ root: ref.current, rules, log: false });
  }, [rules]);
  return <div ref={ref}>{children}</div>;
}

const UNCARDED = ["uncarded-content"] as DsPolicyRule[];

/**
 * 위반이 화면에서 어떻게 보이는가 — 위쪽은 카드로 감싼 정상 블록, 아래쪽은 회색 바닥에
 * 맨몸으로 놓인 블록. 아래쪽에만 빨간 점선 outline + `uncarded-content` 배지가 붙는다.
 *
 * (배지는 `::after` 로 그려지므로 레이아웃을 밀지 않는다.)
 */
export const ViolationDemo: Story = {
  render: () => (
    <GuardScope rules={UNCARDED}>
      <div
        className="wds-page-content flex flex-col gap-16px"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="bg-card border border-default rounded-8px p-16px">
          <span
            className="text-md text-primary"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            ✅ 정상 — 의미 단위가 <code>bg-card</code> 블록으로 감싸져 회색 바닥 위에 쌓여 있다.
          </span>
        </div>

        <div className="p-16px">
          <span
            className="text-md text-primary"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            ❌ 위반 — 카드 없이 회색 바닥에 맨몸으로 놓인 본문 블록. 가드가 여기에 배지를 붙인다.
          </span>
        </div>
      </div>
    </GuardScope>
  ),
};

/* ─── 사용법 ─────────────────────────────────────────── */

/** 켜고 끄는 방법 — 특히 **자동화 컨텍스트에서 반드시 꺼야 하는** 이유. */
export const Usage: Story = {
  render: () => (
    <div className="wds-page-content">
      <div className="bg-card border border-default rounded-8px p-16px flex flex-col gap-12px">
        {[
          {
            t: "Storybook",
            d: "자동 적용 — `.storybook/preview.tsx` 가 켠다. 별도 조치 불필요.",
          },
          {
            t: "소비 앱 (dev)",
            d: 'if (import.meta.env.DEV) import("@whatap/design-system").then((m) => m.enableDsPolicyGuard());',
          },
          {
            t: "프로덕션",
            d: "호출하지 않으면 그만. 호출해도 스캔만 하고 앱 동작은 바꾸지 않는다.",
          },
          {
            t: "⚠️ 자동화 (테스트·스냅샷)",
            d: "가드가 DOM(data-ds-violation)과 화면(outline·배지)을 바꾸므로 켠 채로 두면 스토리 테스트가 깨지고 스냅샷에 경보가 찍힌다. vitest 는 `__vitest_browser__` 감지로, 시각 스냅샷은 URL `?dsGuard=off` 로 자동 비활성.",
          },
          {
            t: "예외 표시",
            d: 'data-ds-policy-ok="<이유>" — 소스의 `// raw-color-ok:` 와 같은 역할.',
          },
        ].map((row) => (
          <div key={row.t} className="flex flex-col gap-2px">
            <span
              className="text-base font-bold text-primary"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {row.t}
            </span>
            <span
              className="text-sm text-secondary"
              style={{ fontFamily: "var(--font-family-mono)" }}
            >
              {row.d}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
