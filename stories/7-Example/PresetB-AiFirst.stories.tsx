import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeaderAiInline, WhaTapAiWidget,
} from "@whatap/design-system";
import type { AiPromptSuggestion } from "@whatap/design-system/widget";

/**
 * **프리셋 B — AI 전용 페이지.**
 *
 * 헤더에서 바로 자연어 입력 → 위젯이 즉시 열리는 1-step UX.
 * Sidebar + PageHeaderAiInline + WhaTapAiWidget.
 *
 * `docs/GUIDE.md` "프리셋 B" 코드 템플릿과 1:1 대응.
 */

/* ─── Mock data ──────────────────────────────────────── */

const ROLLING_PLACEHOLDERS = [
  "GPU 사용률이 급증한 노드를 찾아줘",
  "최근 1시간 GPU 메모리 추세를 분석해줘",
  "유휴 GPU 워크로드를 정리 제안해줘",
  "GPU 스케줄링 최적화 방안을 알려줘",
];

const AI_SUGGESTIONS: AiPromptSuggestion[] = [
  { id: "spike",   label: "Spike 분석",     query: "지금 GPU spike 의 원인을 분석해줘" },
  { id: "top-pod", label: "TOP Pod",        query: "GPU 사용량이 높은 Pod 5개를 보여줘" },
  { id: "trend",   label: "트렌드 요약",     query: "최근 24 시간 GPU 활용도 추세 요약" },
  { id: "alert",   label: "알림 룰 제안",    query: "이 페이지에 적합한 알림 룰 추천" },
];

const SampleMain = (
  <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif" }}>
    <div style={{ fontSize: 14, color: "#757575", marginBottom: 12 }}>
      AI 전용 페이지 — 헤더 인라인 입력으로 위젯 진입
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {["GPU 사용률", "메모리", "네트워크"].map((label) => (
        <div key={label} style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#757575" }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#222" }}>
            {Math.floor(Math.random() * 80 + 10)}%
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Meta ───────────────────────────────────────────── */

const meta: Meta = {
  title: "Example/B — AI 전용 페이지",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**프리셋 B — AI 전용 페이지.** Sidebar + PageHeaderAiInline + WhaTapAiWidget.\n\n" +
          "페이지 자체가 AI 중심. 헤더에서 바로 자연어 입력 → 위젯 즉시 열림 (1-step UX).\n\n" +
          "**포함 컴포넌트:** DashboardLayout · PageHeaderAiInline(AiInlinePrompt 내장) · WhaTapAiWidget\n\n" +
          "**핵심 기능:** 롤링 placeholder + suggestion chip + 인라인 송신 → 위젯 활성화.",
      },
    },
  },
  decorators: [(Story) => (<div style={{ height: 720 }}><Story /></div>)],
};
export default meta;

/* ─── Story ──────────────────────────────────────────── */

/** Example — 인라인 AI 입력 → 위젯 열기 + 사이드바 축소. */
export const Example: StoryObj = {
  render: () => {
    const Demo = () => {
      const [aiActive, setAiActive] = useState(false);
      const [lastQuery, setLastQuery] = useState("");

      const handleSubmit = (query: string) => {
        setLastQuery(query);
        setAiActive(true);
      };

      return (
        <DashboardLayout
          widgetOpen={aiActive}
          activeProduct="k8s"
          header={
            <PageHeaderAiInline
              title="AI 대시보드"
              promptPlaceholders={ROLLING_PLACEHOLDERS}
              promptSuggestions={AI_SUGGESTIONS}
              onPromptSubmit={handleSubmit}
            />
          }
          main={
            <>
              {SampleMain}
              {lastQuery && (
                <div style={{ padding: "0 24px", fontFamily: "'Noto Sans', sans-serif" }}>
                  <div className="text-sm text-tertiary mt-2">
                    마지막 질문: <span className="text-primary font-medium">{lastQuery}</span>
                  </div>
                </div>
              )}
            </>
          }
        >
          <WhaTapAiWidget
            open={aiActive}
            onClose={() => setAiActive(false)}
            pageHighlight="AI 대시보드"
          />
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};
