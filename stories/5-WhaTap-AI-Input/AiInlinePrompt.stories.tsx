import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiInlinePrompt, type AiPromptSuggestion } from "@whatap/design-system/widget";

/**
 * 페이지 컨텍스트별 chip 카탈로그 예시 — DB RAC 페이지 시나리오에서 자주 묻는 질의.
 * 실 사용 시 각 페이지가 자기 카탈로그를 import 해서 주입 (1단계: 직접 주입).
 */
const DB_SUGGESTIONS: AiPromptSuggestion[] = [
  { id: "spike",     label: "Spike 분석",      query: "지금 RAC 인스턴스 spike 의 원인을 분석해줘" },
  { id: "top-sql",   label: "TOP SQL",         query: "지난 1시간 가장 느린 SQL 5개를 보여줘" },
  { id: "gc-wait",   label: "GC wait 추적",    query: "현재 노드 간 GC wait 추세를 분석해줘" },
  { id: "awr",       label: "AWR 리포트",      query: "최근 AWR 리포트의 주요 finding 을 요약해줘" },
  { id: "cleanup",   label: "Cleanup 제안",    query: "디스크 사용량이 높은 schema/table 정리 제안" },
];

const meta: Meta<typeof AiInlinePrompt> = {
  title: "WhaTap AI/Input/InlinePrompt",
  component: AiInlinePrompt,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**한 줄 inline 자연어 입력창 — `<AiPromptInput>` 의 single-row 변형 (Figma 27087:3416).**\n\n" +
          "모든 구성요소(첨부 chip · input · 첨부 버튼 · 송신)가 단일 행에 배열, height 고정 (~32px).\n\n" +
          "**제외:** TokenUsageBadge · 하단 caption · 첨부 chip 별도 행 · multi-line textarea · placeholder 회전.\n\n" +
          "**Suggestions 채널:** `suggestions` prop 으로 페이지 컨텍스트별 chip 제안을 input focus 시 floating dropdown 으로 펼침. " +
          "한 줄 invariant 는 보존 — chip 들은 별도 floating panel 에 위치. chip 클릭 → input value 자동 채우기, 송신은 사용자 액션 (⬆ 또는 Enter).\n\n" +
          "**사용처:** PageHeader 우측 inline prompt, 카드 / 모달 / sub-section 의 빠른 질문 입력. (PageHeader 적용은 예정 — 아직 wiring 되지 않음.)",
      },
    },
  },
  argTypes: {
    value:           { control: "text" },
    placeholder:     { control: "text" },
    showSendCursor:  { control: "boolean" },
    disabled:        { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiInlinePrompt>;

/** Empty — placeholder 노출, border 연한 파랑. height ~32px. */
export const Empty: Story = {
  args: { value: "" },
};

/** Typing — controlled value, border 진한 파랑 + 송신 활성. */
export const Typing: Story = {
  args: { value: "차트의 spike 원인 분석해줘" },
};

/** With Attachment — 첨부 chip 이 같은 행 안에 compact (max-w-[120px], truncate). */
export const WithAttachment: Story = {
  args: {
    value: "이 로그 분석",
    attachments: [{ name: "production.log.gz", mime: "GZIP" }],
  },
};

/** With Multiple Attachments — chip 가 늘어나면 input flex-1 가 자동 축소. */
export const WithMultipleAttachments: Story = {
  args: {
    value: "비교 분석",
    attachments: [
      { name: "metrics.csv", mime: "CSV" },
      { name: "trace.json", mime: "JSON" },
    ],
  },
};

/** Disabled — AI 응답 중. */
export const Disabled: Story = {
  args: { value: "분석 중인 입력", disabled: true },
};

/** With Cursor — 시연용 자동 클릭 ripple. */
export const WithCursor: Story = {
  args: { value: "현재 상태 요약해줘", showSendCursor: true },
};

/** With Suggestions — input focus 시 chip 제안이 아래로 floating dropdown 으로 펼침. 한 줄 invariant 유지. */
export const WithSuggestions: Story = {
  args: {
    suggestions: DB_SUGGESTIONS,
    defaultOpen: true,
    placeholder: "DB RAC 에 대해 질문...",
  },
};

/** With Suggestions + Attachment — chip 제안과 첨부 chip 공존. */
export const WithSuggestionsAndAttachment: Story = {
  args: {
    value: "이 로그와 함께 분석",
    attachments: [{ name: "awr-snap.txt", mime: "TXT" }],
    suggestions: DB_SUGGESTIONS,
    defaultOpen: true,
  },
};

/** Interactive Suggestions — chip 클릭 → input 자동 채우기 → 사용자가 ⬆ 또는 Enter 로 송신. */
export const InteractiveSuggestions: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState<string[]>([]);
      const [picks, setPicks] = useState<string[]>([]);
      return (
        <div className="flex flex-col gap-3">
          <AiInlinePrompt
            suggestions={DB_SUGGESTIONS}
            onSelectSuggestion={(s) => setPicks((arr) => [s.label, ...arr].slice(0, 5))}
            onSubmit={(v) => setSubmitted((arr) => [v, ...arr].slice(0, 5))}
            placeholder="DB RAC 에 대해 질문..."
          />
          <div
            className="text-xs text-tertiary p-2 border border-[var(--color-border-default)] rounded grid grid-cols-2 gap-3"
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

/** Interactive — Enter 송신, editable mode. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState<string[]>([]);
      return (
        <div className="flex flex-col gap-3">
          <AiInlinePrompt
            onSubmit={(v) => setSubmitted((arr) => [v, ...arr].slice(0, 5))}
            placeholder="WhaTap AI 에게 질문..."
          />
          {submitted.length > 0 && (
            <div
              className="text-xs text-tertiary p-2 border border-[var(--color-border-default)] rounded"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              최근 송신:
              <ul className="mt-1 ml-3 list-disc list-outside">
                {submitted.map((s, i) => <li key={i} className="truncate">{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};
