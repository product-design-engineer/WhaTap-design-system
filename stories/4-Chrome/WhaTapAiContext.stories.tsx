import type { Meta, StoryObj } from "@storybook/react-vite";
import { WhaTapAiProvider, useWhaTapAi } from "@whatap/design-system";

/**
 * Stories for [[WhaTapAiContext]] — 라우트 간 WhaTap AI 위젯 상태 공유.
 */
const meta: Meta = {
  title: "WhaTap AI/Context",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**WhaTap AI 위젯의 글로벌 상태 + 대화 문맥 공유 컨텍스트.** `WhaTapAiProvider` 로 앱을 감싸고 " +
          "`useWhaTapAi()` 훅으로 어디서든 접근. `aiActive` (위젯 열림 상태) + `lastPrompt` (라우트 전이 시 chat continuation).\n\n" +
          "Provider 외부에서 `useWhaTapAi()` 호출 시 throw — Provider 안에서만 사용.",
      },
    },
  },
};
export default meta;

function ConsumerDemo() {
  const { aiActive, setAiActive, lastPrompt, setLastPrompt } = useWhaTapAi();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: "'Noto Sans', sans-serif", maxWidth: 480 }}>
      <h3 style={{ fontSize: 14, margin: 0, fontWeight: 700, color: "#222" }}>Context Consumer</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13 }}>aiActive:</span>
        <strong style={{ color: aiActive ? "#296CF2" : "#757575" }}>{String(aiActive)}</strong>
        <button
          onClick={() => setAiActive(!aiActive)}
          style={{
            padding: "4px 10px",
            border: "1px solid #adadad",
            borderRadius: 4,
            background: "#fff",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Toggle
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 13 }}>lastPrompt:</span>
        <pre style={{ background: "#f5f5f5", border: "1px solid #eaeaea", borderRadius: 4, padding: 8, fontSize: 11, margin: 0 }}>
          {lastPrompt ? JSON.stringify(lastPrompt, null, 2) : "(none)"}
        </pre>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setLastPrompt({ text: "현재 상태 요약", fromRoute: "/db" })}
            style={{ padding: "4px 10px", border: "1px solid #adadad", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer" }}
          >
            Set prompt
          </button>
          <button
            onClick={() => setLastPrompt(null)}
            style={{ padding: "4px 10px", border: "1px solid #adadad", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer" }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

/** Provider + consumer 데모 — 상태 변경/조회 인터랙티브. */
export const ProviderAndConsumer: StoryObj = {
  render: () => (
    <WhaTapAiProvider>
      <ConsumerDemo />
    </WhaTapAiProvider>
  ),
};

/** 사용 패턴 (코드 스니펫). */
export const UsagePattern: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 720, fontFamily: "'Noto Sans', sans-serif" }}>
      <p style={{ fontSize: 13, color: "#4c4c4c", lineHeight: 1.6 }}>
        앱 루트에서 <code>WhaTapAiProvider</code> 로 감싸고, 어느 페이지에서든 <code>useWhaTapAi()</code> 훅으로 접근.
      </p>
      <pre style={{ background: "#f5f5f5", border: "1px solid #eaeaea", borderRadius: 6, padding: 16, fontSize: 12, color: "#222", overflow: "auto" }}>
{`// main.tsx
import { WhaTapAiProvider } from "@whatap/design-system";

<WhaTapAiProvider>
  <Routes>{/* ... */}</Routes>
</WhaTapAiProvider>

// any page
import { useWhaTapAi } from "@whatap/design-system";

function MyPage() {
  const { aiActive, setAiActive, lastPrompt } = useWhaTapAi();
  // ...
}`}
      </pre>
    </div>
  ),
};
