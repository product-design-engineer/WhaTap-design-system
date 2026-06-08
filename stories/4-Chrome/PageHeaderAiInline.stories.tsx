import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeaderAiInline } from "@whatap/design-system";
import type { AiPromptSuggestion } from "@whatap/design-system/widget";

/**
 * Stories for [[PageHeaderAiInline]] — PageHeader 의 AI inline variant.
 *
 * 기존 PageHeader 의 WhaTap AI 토글 버튼 자리를 AiInlinePrompt 로 대체.
 * AI 위젯 호출 entry 가 inline prompt 의 송신으로 이동.
 */

const GPU_SUGGESTIONS: AiPromptSuggestion[] = [
  { id: "spike",   label: "Spike 분석",     query: "지금 GPU spike 의 원인을 분석해줘" },
  { id: "top-pod", label: "TOP Pod",        query: "GPU 사용량이 높은 Pod 5개를 보여줘" },
  { id: "trend",   label: "트렌드 요약",     query: "최근 24 시간 GPU 활용도 추세 요약" },
  { id: "alert",   label: "알림 룰 제안",    query: "이 페이지에 적합한 알림 룰 추천" },
];

const DB_SUGGESTIONS: AiPromptSuggestion[] = [
  { id: "spike",   label: "Spike 분석",     query: "지금 RAC 인스턴스 spike 의 원인을 분석해줘" },
  { id: "top-sql", label: "TOP SQL",        query: "지난 1시간 가장 느린 SQL 5개를 보여줘" },
  { id: "gc-wait", label: "GC wait 추적",   query: "현재 노드 간 GC wait 추세를 분석해줘" },
  { id: "awr",     label: "AWR 리포트",     query: "최근 AWR 리포트의 주요 finding 을 요약해줘" },
];

const meta: Meta<typeof PageHeaderAiInline> = {
  title: "Chrome/PageHeaderAiInline",
  component: PageHeaderAiInline,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**48px 페이지 헤더의 AI inline variant.** 기존 [[PageHeader]] 의 WhaTap AI 토글 버튼 자리를 [[AiInlinePrompt]] 로 대체.\n\n" +
          "**차이 (vs PageHeader):**\n" +
          "- ❌ AiAssistantButton (WhaTap AI 토글) — 제거\n" +
          "- ✅ AiInlinePrompt — 중앙, `flex-1 + max-w-[480px]`\n" +
          "- 좌측 그룹: Title + Docs (Docs 는 Title 바로 우측에 인접)\n" +
          "- 우측 chrome: 고객지원 / 🔔 / Avatar — Docs 제외, 유지\n\n" +
          "**언제 사용:** inline prompt 가 AI 위젯 호출 entry 인 페이지 (위젯 토글 별도 entry 불필요).\n\n" +
          "**Composition rules:** inline prompt 는 `max-w-[480px]` cap, w-full 100% 강제 금지 ([[feedback_page_header_invariant]] 우측 chrome 잠식 방지). " +
          "48px height invariant 유지.\n\n" +
          "**롤링 placeholder (옵션):** `promptPlaceholders` (제품별 핵심 prompt 배열) 주입 시 입력이 비어 있을 때 placeholder 가 세로 순환. 송신 버튼은 비활성 유지(placeholder ≠ value). 미주입이면 `promptPlaceholder` 정적.",
      },
    },
  },
  argTypes: {
    title:               { description: "페이지 타이틀.", control: "text" },
    promptPlaceholder:   { description: "inline prompt placeholder (promptPlaceholders 미주입 시 정적 1개).", control: "text" },
    promptPlaceholders:  { description: "롤링 placeholder — 제품별 핵심 prompt 배열(옵션).", control: false },
    promptRollingIntervalMs: { description: "롤링 dwell 간격(ms). 기본 2800.", control: "number" },
    promptDefaultOpen:   { description: "Storybook/시연용 dropdown 강제 펼침.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeaderAiInline>;

/** 기본 — GPU 트렌드 페이지, suggestions 없음. */
export const Default: Story = {
  args: { title: "K8s-GPU / GPU 트렌드", promptPlaceholder: "GPU 트렌드에 대해 질문..." },
};

/** 제품별 핵심 prompt — 롤링 placeholder 데모용. */
const GPU_PLACEHOLDERS = [
  "지난 24시간 GPU 사용률을 요약해줘",
  "GPU 이상 사용 패턴을 진단해줘",
  "유휴 GPU 워크로드 정리를 제안해줘",
  "GPU 스케줄링 최적화 방안을 알려줘",
];

/** Rolling Placeholder — 입력이 비어 있을 때 제품별 핵심 prompt 가 세로로 롤링(옵션). 송신은 비활성 유지. */
export const RollingPlaceholder: Story = {
  args: {
    title: "K8s-GPU / GPU 트렌드",
    promptPlaceholders: GPU_PLACEHOLDERS,
    promptRollingIntervalMs: 2600,
    promptSuggestions: GPU_SUGGESTIONS,
  },
};

/** With Suggestions — GPU 페이지 컨텍스트 chip 4개, 마운트 시 dropdown 펼침. */
export const WithSuggestions: Story = {
  args: {
    title: "K8s-GPU / GPU 트렌드",
    promptPlaceholder: "GPU 트렌드에 대해 질문...",
    promptSuggestions: GPU_SUGGESTIONS,
    promptDefaultOpen: true,
  },
};

/** DB 페이지 — 다른 컨텍스트 카탈로그 (suggestion 채널이 페이지마다 다름 검증). */
export const DbContext: Story = {
  args: {
    title: "DB / oracle_dnx — RAC 인스턴스",
    promptPlaceholder: "이 DB 인스턴스에 대해 질문...",
    promptSuggestions: DB_SUGGESTIONS,
    promptDefaultOpen: true,
  },
};

/** 긴 타이틀 — inline prompt 가 max-w-[480px] cap 으로 우측 chrome 잠식 방지 검증. */
export const LongTitle: Story = {
  args: {
    title: "K8s-GPU · prod-cluster-01 · namespace=gpu-inference / 응답 시간 분석",
    promptPlaceholder: "GPU 응답 시간에 대해 질문...",
    promptSuggestions: GPU_SUGGESTIONS,
  },
};

/** Interactive — chip 선택 / 송신 로그. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState<string[]>([]);
      const [picks, setPicks] = useState<string[]>([]);
      return (
        <div className="flex flex-col">
          <PageHeaderAiInline
            title="DB / oracle_dnx"
            promptPlaceholder="DB 에 대해 질문..."
            promptSuggestions={DB_SUGGESTIONS}
            onPromptSubmit={(v) => setSubmitted((arr) => [v, ...arr].slice(0, 5))}
            onPromptSelectSuggestion={(s) => setPicks((arr) => [s.label, ...arr].slice(0, 5))}
          />
          <div
            className="text-xs text-tertiary p-3 grid grid-cols-2 gap-3 bg-[var(--color-surface-50)]"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            <div>
              chip 선택:
              <ul className="mt-1 ml-3 list-disc list-outside">
                {picks.length === 0 && <li className="opacity-50">(아직 없음)</li>}
                {picks.map((s, i) => <li key={i} className="truncate">{s}</li>)}
              </ul>
            </div>
            <div>
              송신:
              <ul className="mt-1 ml-3 list-disc list-outside">
                {submitted.length === 0 && <li className="opacity-50">(아직 없음)</li>}
                {submitted.map((s, i) => <li key={i} className="truncate">{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
