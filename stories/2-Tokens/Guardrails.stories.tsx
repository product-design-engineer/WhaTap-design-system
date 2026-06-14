import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Guardrails — WhaTap 디자인 시스템의 무결성 게이트.
 *
 * "정책을 사람이 지키길 바라는" 대신, 디자인 시스템이 깨지지 않도록 지키는 **불변식(invariant)** 목록입니다.
 * WhaTap 은 단일 출처(`tokens.css @theme static`)·소스온리 모델이라, 생성형 파이프라인 가드레일을 통째로
 * 옮기지 않고 **이 모델에 맞는 게이트만** 둡니다. 각 게이트의 현 강제 수준을 상태로 표기합니다.
 *
 * (격리: 본 페이지는 자체완결 — 외부 디자인 시스템을 참조하지 않습니다.)
 */
const meta: Meta = {
  title: "Tokens/Guardrails",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**WhaTap 디자인 시스템 무결성 게이트.** 단일 출처·소스온리 모델에 맞는 불변식 목록. " +
          "상태: 🟢 자동(빌드/구조로 강제) · 🟡 정책(문서/코드리뷰 수동) · 🔵 계획(자동 체크 도입 예정).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

type Status = "auto" | "policy" | "planned";
type Guardrail = {
  id: string;
  name: string;
  status: Status;
  invariant: string;
  prevents: string;
  command: string;
};

const STATUS: Record<Status, { dot: string; label: string }> = {
  auto: { dot: "var(--color-status-success)", label: "자동" },
  policy: { dot: "var(--color-status-warning)", label: "정책" },
  planned: { dot: "var(--color-text-disabled)", label: "계획" },
};

const GUARDRAILS: Guardrail[] = [
  {
    id: "token-single-source",
    name: "토큰 단일 출처",
    status: "auto",
    invariant:
      "`tokens.css` 의 `@theme static` 가 모든 토큰을 `:root` 에 항상 emit. 토큰 1값 변경 = 전 컴포넌트 반영, 소비 앱은 `tokens.css` import 만으로 인라인 `var(--color-X)` 보장.",
    prevents: "토큰 분산/누락 · 보더·색이 사라지는 tree-shake",
    command: "구조 (@theme static)",
  },
  {
    id: "catalog-build",
    name: "카탈로그 합본 생성",
    status: "auto",
    invariant:
      "`build:design` 가 docs 7종을 `DESIGN.md` 로 합본하고 `build-storybook`/`storybook` 직전 자동 실행. `/design-system/*.md` 로 서빙.",
    prevents: "오래된/손편집 합본 · AI 컨텍스트 stale",
    command: "scripts/build-design.mjs",
  },
  {
    id: "raw-color",
    name: "인라인 색 리터럴 금지",
    status: "policy",
    invariant:
      "`src/` 컴포넌트는 토큰/유틸로만 색 표현(raw hex·색함수 금지). 정확-매칭 hex 188건 토큰화 완료. lint 자동화는 계획.",
    prevents: "토큰 우회 raw color · 단일 출처 약화",
    command: "(계획) lint:tokens (check-no-raw-colors)",
  },
  {
    id: "docstring-standard",
    name: "docstring 4섹션 표준",
    status: "policy",
    invariant:
      "컴포넌트 docstring = Purpose / When to use / When NOT to use / Composition rules + `@example` (현재 58/58). autodocs prop 표와 함께 AI/사용자 1차 참조.",
    prevents: "컴포넌트 오선택 · 사용 가이드 부재",
    command: "(계획) docstring 커버리지 체크",
  },
  {
    id: "catalog-sync",
    name: "카탈로그 드리프트 방지",
    status: "planned",
    invariant:
      "Introduction/docs 의 컴포넌트 수·목록이 실제 export(`src/index.ts`)·Storybook `index.json` 과 1:1 일치.",
    prevents: "카탈로그 수/목록 드리프트 (예: Chrome 19↔20)",
    command: "(계획) check-catalog-sync",
  },
  {
    id: "ai-card-composition",
    name: "AI 카드 = AiCard 합성",
    status: "policy",
    invariant:
      "WhaTap AI 메시지 카드는 `AiCard` + Tone 토큰을 composition (인라인 카드 chrome·색 리터럴 금지).",
    prevents: "톤/외형 어긋남 · 카드 재구현",
    command: "patterns.md · 코드리뷰",
  },
  {
    id: "consumer-react-dedupe",
    name: "소비 React 단일화",
    status: "policy",
    invariant:
      "`link:` 심링크 소비 앱은 vite `resolve.dedupe: ['react','react-dom']` 로 React 단일 인스턴스 강제(DS 자체 react 중복 방지).",
    prevents: '"invalid hook call" (React 중복 로드)',
    command: "AI-INTEGRATION.md 온보딩",
  },
  {
    id: "chart-text-unit",
    name: "차트 텍스트 단위",
    status: "policy",
    invariant: "SVG `<text fontSize>` 는 `\"9px\"` 처럼 단위 명시(단위 없는 값은 viewBox 좌표로 계산).",
    prevents: "화면별 차트 텍스트 크기 변동",
    command: "patterns.md (5 핵심 규칙)",
  },
];

function Badge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-[6px] whitespace-nowrap">
      <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: s.dot }} />
      <span className="text-sm text-secondary tracking-default leading-none">{s.label}</span>
    </span>
  );
}

function Guardrails() {
  const count = (st: Status) => GUARDRAILS.filter((g) => g.status === st).length;
  return (
    <div className="flex flex-col gap-6 p-6 bg-white" style={{ fontFamily: "var(--font-family-korean)" }}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary tracking-display leading-tight">Guardrails</h1>
        <p className="text-base text-tertiary leading-normal max-w-2xl">
          디자인 시스템이 깨지지 않도록 지키는 불변식. 단일 출처·소스온리 WhaTap 모델에 맞는 게이트만 둡니다.
        </p>
      </header>

      <section className="flex gap-3">
        {(["auto", "policy", "planned"] as Status[]).map((st) => (
          <div key={st} className="flex items-center gap-[8px] px-3 py-2 border border-[color:var(--color-border-default)] rounded-md">
            <Badge status={st} />
            <span className="text-lg font-bold font-numeric text-primary leading-none tabular-nums">{count(st)}</span>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--color-border-strong)]">
              {["게이트", "상태", "불변식 (invariant)", "막는 것", "체크"].map((h) => (
                <th key={h} className="p-2 text-base font-bold text-secondary tracking-default align-bottom">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GUARDRAILS.map((g) => (
              <tr key={g.id} className="border-b border-[color:var(--color-border-default)] align-top">
                <td className="p-2 text-md font-medium text-primary whitespace-nowrap">{g.name}</td>
                <td className="p-2"><Badge status={g.status} /></td>
                <td className="p-2 text-base text-secondary leading-normal" style={{ maxWidth: 420 }}>{g.invariant}</td>
                <td className="p-2 text-base text-tertiary leading-normal" style={{ maxWidth: 220 }}>{g.prevents}</td>
                <td className="p-2 text-sm font-numeric text-tertiary leading-normal" style={{ maxWidth: 200 }}>{g.command}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** WhaTap 무결성 게이트 개요. */
export const Overview: Story = { render: () => <Guardrails /> };
