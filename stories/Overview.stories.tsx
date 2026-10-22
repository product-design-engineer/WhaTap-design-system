import type { Meta, StoryObj } from "@storybook/react-vite";
// ⚠️ 정책을 여기에 적지 않는다. `docs/patterns.md` 가 정본이고 이 페이지는 생성물만 읽는다.
//    (scripts/build-policies-json.mjs · build:design 에서 돈다)
//    하드코딩하면 재생성이 늘 같은 값을 만들어 `git diff` 가 낡음을 볼 수 없다 —
//    Guardrails 페이지가 roster projection 만 읽는 것과 같은 이유다.
import policiesData from "../docs/policies.json";

/**
 * Overview — 전역 Do / Don't.
 *
 * 컴포넌트마다 붙는 Do/Don't 는 각 컴포넌트 문서에 있다. 이 페이지는 **한 컴포넌트를 넘는
 * 규칙** — 헤더 불변 · 색 리터럴 0 · DataTable 종합 정책처럼 여러 자리에 걸치는 것 — 을 모은다.
 *
 * 기준은 **`@applies`(무엇을 만드는가)** 다. 컴포넌트 이름으로는 찾을 수 없는 규칙들이라
 * 「지금 표를 만든다 / 차트를 만든다 / 위젯 카드를 만든다」로 들어오게 했다.
 */
type Policy = {
  id: string;
  number: string;
  part: "pattern" | "policy";
  title: string;
  severity: "must" | "should" | "context";
  applies: string;
  anchor: string;
  whenToUse: string | null;
  whenNotToUse: string | null;
  rule: string | null;
  why: string | null;
  do: string[];
  dont: string[];
  components: string[];
  related: string[];
};

const policies = (policiesData as { policies: Policy[] }).policies;

/** `@applies` 기준 — 「무엇을 만드는가」. 사람이 들어오는 입구라 순서를 의도로 정한다. */
const AXES: { key: string; label: string; hint: string }[] = [
  { key: "process", label: "일하는 절차", hint: "만들기 전·후에 거치는 것 — 확인 · 통보 · 판단 순서" },
  { key: "chrome", label: "셸 (헤더 · 사이드바)", hint: "화면의 틀. 페이지를 오가도 변하지 않아야 하는 것" },
  { key: "table", label: "표", hint: "DataTable 과 그 안쪽" },
  { key: "chart", label: "차트", hint: "SVG 와 HTML 이 만나는 자리" },
  { key: "widget", label: "AI 위젯", hint: "위젯 안의 카드 · 흐름 · 진입점" },
  { key: "token", label: "토큰 · 색", hint: "값을 정하는 규칙" },
  { key: "type", label: "타이포 · 표기", hint: "글자 위계와 값 표기" },
  { key: "layer", label: "계층", hint: "Primitives · Composite · Shell 의 의존 방향" },
];

const SEVERITY: Record<Policy["severity"], { label: string; tone: string; note: string }> = {
  // 색은 토큰만 — 이 페이지도 §7 의 대상이다.
  must: { label: "반드시", tone: "var(--color-status-error)", note: "깨면 화면이 어긋난다" },
  should: { label: "권장", tone: "var(--color-status-warning)", note: "예외를 둘 수 있으나 근거가 필요하다" },
  context: { label: "판단", tone: "var(--color-text-tertiary)", note: "금지가 아니라 고를 때의 순서" },
};

const meta: Meta = {
  title: "Overview",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**한 컴포넌트를 넘는 규칙의 Do / Don't.** 컴포넌트별 Do/Don't 는 각 문서에 있고, 여기에는 " +
          "여러 자리에 걸치는 것만 모읍니다 — 헤더 불변 · 색 리터럴 0 · DataTable 종합 정책 같은 것.\n\n" +
          "**정본은 [patterns.md](/design-system/patterns.md) 이고 이 페이지는 생성물을 렌더합니다** " +
          "(`docs/policies.json`). 손으로 적은 목록이 아니므로 문서를 고치면 여기가 따라옵니다 — " +
          "그래야 네 번째 사본이 생기지 않습니다.\n\n" +
          "기준은 **「무엇을 만드는가」** 입니다. 컴포넌트 이름으로는 찾을 수 없는 규칙들이라, " +
          "「지금 표를 만든다 / 차트를 만든다」로 들어오게 했습니다.\n\n" +
          "## When to use\n" +
          "- **만들기 전에** — 지금 만드는 것(표 · 차트 · 위젯 카드 · 셸)의 기준을 열어 걸리는 규칙을 먼저 봅니다.\n" +
          "- 컴포넌트 문서가 답하지 않는 것을 찾을 때 — 「삭제 버튼을 만드는데 무엇을 거쳐야 하나」처럼 **여러 컴포넌트에 걸친** 물음.\n" +
          "- 리뷰에서 「이래도 되나」가 갈릴 때 — `반드시`/`권장`/`판단` 세 무게가 그 자리에서 답합니다.\n\n" +
          "## When NOT to use\n" +
          "- **한 컴포넌트의 사용법** → 그 컴포넌트 문서. 여기에는 한 컴포넌트를 넘는 것만 있습니다.\n" +
          "- **토큰 값을 고를 때** → [Color](/?path=/docs/tokens-color--docs) · [tokens.json](/design-system/tokens.json). " +
          "여기 `토큰 · 색` 기준은 「어떻게 정하나」이지 「무슨 값인가」가 아닙니다.\n" +
          "- **규칙을 고칠 때** → 이 페이지는 생성물입니다. [patterns.md](/design-system/patterns.md) 를 고치면 여기가 따라옵니다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/* ─── 조판 ─────────────────────────────────────────────────────────────────
   preview-head.html 의 docs 조판 규칙(제목 위계 · 불릿 들여쓰기 · 읽기 폭 78ch)은
   `.sbdocs-content` 안의 마크다운에만 걸린다. 이 페이지는 컴포넌트가 그리므로
   같은 원칙을 여기서 지킨다 — 제목 위 여백 ≫ 아래 여백 · 산문 폭 제한 · 단계별 마커. */

const Verdict = ({ mark, items, tone }: { mark: string; items: string[]; tone: string }) => {
  if (!items.length) return null;
  return (
    <ul style={{ listStyle: "none", margin: "0 0 12px", padding: 0, width: "100%" }}>
      {items.map((t, i) => (
        <li
          key={i}
          className="text-base text-primary"
          style={{ display: "flex", gap: 8, lineHeight: 1.7, marginBottom: 4 }}
        >
          <span style={{ color: tone, flex: "0 0 auto" }}>{mark}</span>
          <span style={{ minWidth: 0 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
};

const When = ({ label, body }: { label: string; body: string | null }) => {
  if (!body) return null;
  /* 「언제」는 여러 줄 불릿일 수 있다 — 마크다운 `- ` 를 그대로 살려 단계를 보인다. */
  const lines = body.split("\n").filter((l) => l.trim());
  return (
    <div style={{ marginBottom: 10, width: "100%" }}>
      <p className="text-sm font-bold text-secondary" style={{ margin: "0 0 2px" }}>
        {label}
      </p>
      {lines.map((l, i) => (
        <p
          key={i}
          className="text-base text-primary"
          style={{
            margin: 0,
            lineHeight: 1.7,
            paddingLeft: l.trim().startsWith("-") ? 14 : 0,
          }}
        >
          {l.replace(/^\s*-\s*/, "· ")}
        </p>
      ))}
    </div>
  );
};

const PolicyCard = ({ p }: { p: Policy }) => {
  const sev = SEVERITY[p.severity];
  return (
    <section
      className="bg-card border border-color-var-color-border-default rounded-8px"
      style={{ padding: 20, marginBottom: 12 }}
    >
      {/* 머리 — 이름 · 무게 · 번호. 번호는 patterns.md 참조용으로만 남긴다. */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <h3 className="text-lg font-bold text-primary" style={{ margin: 0 }}>
          {p.title}
        </h3>
        <span
          className="text-xs font-bold"
          style={{
            color: sev.tone,
            border: `1px solid ${sev.tone}`,
            borderRadius: 4,
            padding: "1px 6px",
            flex: "0 0 auto",
          }}
          title={sev.note}
        >
          {sev.label}
        </span>
        <span className="text-sm text-tertiary font-numeric">
          patterns {p.part === "pattern" ? "Part 1" : "Part 2"} · {p.number}
        </span>
      </div>

      {p.rule && (
        <p className="text-base text-primary" style={{ margin: "0 0 12px", width: "100%", lineHeight: 1.7 }}>
          {p.rule.split("\n")[0]}
        </p>
      )}

      <When label="언제 쓰나" body={p.whenToUse} />
      <When label="언제 쓰지 않나" body={p.whenNotToUse} />

      <Verdict mark="✅" items={p.do} tone="var(--color-status-success)" />
      <Verdict mark="❌" items={p.dont} tone="var(--color-status-error)" />

      {/* 걸리는 컴포넌트 — 역인덱스. 「이 컴포넌트를 쓰는데 무슨 규칙이 걸리나」의 반대 방향. */}
      {p.components.length > 0 && (
        <p className="text-sm text-tertiary" style={{ margin: "8px 0 0" }}>
          걸리는 컴포넌트 — {p.components.join(" · ")}
        </p>
      )}
    </section>
  );
};

/** 기준별 전문 — 「무엇을 만드는가」로 들어온다. */
export const ByWhatYouAreBuilding: Story = {
  name: "무엇을 만드는가로 찾기",
  render: () => {
    const used = AXES.filter((a) => policies.some((p) => p.applies === a.key));
    const orphan = policies.filter((p) => !AXES.some((a) => a.key === p.applies));
    return (
      <div className="bg-bg" style={{ padding: 24 }}>
        <p className="text-base text-secondary" style={{ width: "100%", lineHeight: 1.7, marginBottom: 24 }}>
          정책 <strong>{policies.length}</strong>개. 정본은{" "}
          <a href="/design-system/patterns.md">patterns.md</a> 이고 이 페이지는 생성물(
          <code>docs/policies.json</code>)을 렌더합니다.
        </p>

        {used.map((axis) => {
          const list = policies.filter((p) => p.applies === axis.key);
          return (
            <div key={axis.key} style={{ marginBottom: 48 }}>
              {/* 제목 위 여백 ≫ 아래 여백 — 제목이 아래 내용에 붙어야 「이 제목의 것」으로 읽힌다. */}
              <h2 className="text-xl font-bold text-primary" style={{ margin: "0 0 2px" }}>
                {axis.label}
                <span className="text-sm text-tertiary font-numeric" style={{ marginLeft: 10 }}>
                  {list.length}
                </span>
              </h2>
              <p className="text-sm text-tertiary" style={{ margin: "0 0 14px", width: "100%" }}>
                {axis.hint}
              </p>
              {list.map((p) => (
                <PolicyCard key={p.id} p={p} />
              ))}
            </div>
          );
        })}

        {/* 기준이 없는 정책이 생기면 조용히 사라지지 않게 드러낸다 — AXES 에 값을 더하라는 신호다. */}
        {orphan.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 className="text-xl font-bold text-primary" style={{ margin: "0 0 14px" }}>
              분류되지 않음
              <span className="text-sm text-tertiary" style={{ marginLeft: 10 }}>
                AXES 에 기준을 추가하세요
              </span>
            </h2>
            {orphan.map((p) => (
              <PolicyCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    );
  },
};

/** 한 장 요약 — 전부 훑을 때. 훑는 것이라 읽기 폭 제한을 받지 않는다. */
export const AllAtOnce: Story = {
  name: "정책 목록",
  render: () => (
    <div className="bg-bg" style={{ padding: 24 }}>
      <p className="text-base text-secondary" style={{ width: "100%", lineHeight: 1.7, marginBottom: 20 }}>
        판정만 모았습니다. 근거와 경계는 각 정책을 펼쳐 보거나{" "}
        <a href="/design-system/patterns.md">patterns.md</a> 를 봅니다.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="text-base" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {["정책", "무게", "만드는 것", "✅", "❌"].map((h) => (
                <th
                  key={h}
                  className="text-sm font-bold text-secondary"
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--color-border-strong)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id}>
                <td
                  className="text-base text-primary"
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", verticalAlign: "top" }}
                >
                  {p.title}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", verticalAlign: "top" }}>
                  <span className="text-xs font-bold" style={{ color: SEVERITY[p.severity].tone }}>
                    {SEVERITY[p.severity].label}
                  </span>
                </td>
                <td
                  className="text-sm text-tertiary"
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", verticalAlign: "top", whiteSpace: "nowrap" }}
                >
                  {AXES.find((a) => a.key === p.applies)?.label ?? p.applies}
                </td>
                <td
                  className="text-sm text-primary"
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", verticalAlign: "top" }}
                >
                  {p.do.length}
                </td>
                <td
                  className="text-sm text-primary"
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", verticalAlign: "top" }}
                >
                  {p.dont.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
