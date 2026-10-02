import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiPromptInput } from "@whatap/design-system/widget";

const meta: Meta<typeof AiPromptInput> = {
  title: "Composite/Ai/PromptInput",
  component: AiPromptInput,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**사용자 자연어 입력창 (Figma 27087:3416).** WhaTapAiWidget 의 입력 영역 chrome 통째 — " +
          "textarea + 첨부 chip 행 + 토큰 pill + 첨부 버튼 + 송신 버튼 + 하단 caption.\n\n" +
          "- **Controlled** (`value` + `onChange`) — parent 가 텍스트 상태 관리\n" +
          "- **Editable** (`value` 미지정) — 내부 state 자동 관리, 시연 데모에 편리\n\n" +
          "border: 비어있을 때 `--color-brand-blue-bg-2`, 입력 있을 때 `--color-brand-blue` 로 자동 강조.",
      },
    },
  },
  argTypes: {
    value:           { control: "text",    description: "Controlled value. 미지정 시 editable mode." },
    placeholder:     { control: "text" },
    showSendCursor:  { control: "boolean" },
    disabled:        { control: "boolean" },
    caption:         { control: "text" },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiPromptInput>;

/** Empty — placeholder 노출, border 연한 파란. */
export const Empty: Story = {
  args: { value: "" },
};

/** Typing — controlled value 가 있어서 border 진한 파랑 + 송신 버튼 활성. */
export const Typing: Story = {
  args: { value: "GPU 활용도 분석 부탁드립니다." },
};

/** Long text — 여러 줄 입력 (max-height 120px 까지 확장). */
export const LongText: Story = {
  args: {
    value: "지금 프로젝트 전체 서버 디스크 사용량 90% 이상일때 Critical 알림 발생하도록 설정해주세요. 그리고 야간(22:00-06:00) 에는 자동으로 mute 되게도 해주세요.",
  },
};

/** With Attachment — 첨부 chip 행이 textarea 위에 노출. */
export const WithAttachment: Story = {
  args: {
    value: "이 로그 파일에서 에러 패턴 분석",
    attachments: [
      { name: "production.log.gz", mime: "GZIP" },
      { name: "metrics.csv", mime: "CSV" },
    ],
  },
};

/** Disabled — AI 응답 진행 중 등 입력 차단 상태. */
export const Disabled: Story = {
  args: { value: "분석 중인 입력 (차단)", disabled: true },
};

/** With Cursor — 시연용 자동 클릭 ripple. */
export const WithCursor: Story = {
  args: { value: "현재 상태 요약해줘", showSendCursor: true },
};

/** No Caption — 하단 안내 텍스트 제거 (특수 컨텍스트). */
export const NoCaption: Story = {
  args: { value: "", caption: "" },
};

/** Interactive — 실제 입력 + Enter 송신 동작 (editable mode). */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState<string[]>([]);
      return (
        <div className="flex flex-col gap-3">
          <AiPromptInput
            onSubmit={(v) => setSubmitted((arr) => [v, ...arr].slice(0, 5))}
            placeholder="어떤 작업을 함께 할까요?"
          />
          {submitted.length > 0 && (
            <div
              className="text-xs text-tertiary p-2 border border-var-color-border-default rounded"
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
