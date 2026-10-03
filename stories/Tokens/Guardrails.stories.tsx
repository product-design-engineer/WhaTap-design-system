import type { Meta, StoryObj } from "@storybook/react-vite";
// ⚠️ 목록을 여기에 적지 않는다. `scripts/check-guardrails-meta.mjs` 가 roster
// (scripts/gate-roster.mjs)를 검사한 뒤 만든 **projection** 만 읽는다.
// 하드코딩 리터럴이면 재생성이 늘 같은 값을 만들어 `git diff` 가 낡음을 볼 수 없다.
import guardrailsData from "../../docs/guardrails.json";

/**
 * Guardrails — WhaTap 디자인 시스템의 무결성 게이트.
 *
 * "정책을 사람이 지키길 바라는" 대신, 디자인 시스템이 깨지지 않도록 지키는 **불변식(invariant)** 목록입니다.
 * WhaTap 은 단일 출처(`tokens.css` 의 `:root`)·소스온리·일반 CSS(Tailwind 미사용) 모델이라, 생성형 파이프라인 가드레일을 통째로
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
  /** 유도값 — 이 게이트를 부르는 pnpm 스크립트. */
  command: string;
  /** 유도값 — PR 워크플로에서 실제로 도달 가능한가. */
  inCI: boolean;
};

const GUARDRAILS = guardrailsData.gates as Guardrail[];

const STATUS: Record<Status, { dot: string; label: string }> = {
  auto: { dot: "var(--color-status-success)", label: "자동" },
  policy: { dot: "var(--color-status-warning)", label: "정책" },
  planned: { dot: "var(--color-text-disabled)", label: "계획" },
};


function Badge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-6px whitespace-nowrap">
      <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: s.dot }} />
      <span className="text-sm text-secondary tracking-default leading-none">{s.label}</span>
    </span>
  );
}

function Guardrails() {
  const count = (st: Status) => GUARDRAILS.filter((g) => g.status === st).length;
  return (
    <div className="flex flex-col gap-6 p-6 bg-card" style={{ fontFamily: "var(--font-family-korean)" }}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary tracking-display leading-tight">Guardrails</h1>
        <p className="text-base text-tertiary leading-normal max-w-2xl">
          디자인 시스템이 깨지지 않도록 지키는 불변식. 단일 출처·소스온리 WhaTap 모델에 맞는 게이트만 둡니다.
        </p>
      </header>

      <section className="flex gap-3">
        {(["auto", "policy", "planned"] as Status[]).map((st) => (
          <div key={st} className="flex items-center gap-8px px-3 py-2 border border-color-var-color-border-default rounded-md">
            <Badge status={st} />
            <span className="text-lg font-bold font-numeric text-primary leading-none tabular-nums">{count(st)}</span>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-color-var-color-border-strong">
              {["게이트", "상태", "CI", "불변식 (invariant)", "막는 것", "체크"].map((h) => (
                <th key={h} className="p-2 text-sm font-bold text-secondary tracking-default align-bottom">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GUARDRAILS.map((g) => (
              <tr key={g.id} className="border-b border-color-var-color-border-default align-top">
                <td className="p-2 text-base font-medium text-primary whitespace-nowrap">{g.name}</td>
                <td className="p-2"><Badge status={g.status} /></td>
                <td className="p-2 text-sm text-tertiary whitespace-nowrap">{g.inCI ? "돌고 있음" : "—"}</td>
                <td className="p-2 text-sm text-secondary leading-normal">{g.invariant}</td>
                <td className="p-2 text-sm text-tertiary leading-normal">{g.prevents}</td>
                <td className="p-2 text-sm font-numeric text-tertiary leading-normal">{g.command}</td>
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
