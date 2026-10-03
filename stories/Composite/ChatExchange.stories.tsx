import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiChatExchange } from "@whatap/design-system/widget";

const meta: Meta<typeof AiChatExchange> = {
  title: "Composite/ChatExchange",
  component: AiChatExchange,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**Q&A 페어 — 질문(사용자 버블) + 답변(AI 단일 문단) + (옵션) 첨부.** 위젯 안에서 가장 흔한 채팅 단위. " +
          "답변 비우면 사용자 메시지만 렌더 → reasoning/카드 sequence 가 이어진다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiChatExchange>;

export const QuestionAndAnswer: Story = {
  args: {
    question: "최근 응답시간 spike 원인이 뭔가요?",
    answer: "최근 5분 액티브 스레드 5종(method/sql/dbc/httpc/socket)을 비교한 결과, httpc 가 다른 series 의 합보다 큰 dominant pattern 으로 4,294ms 까지 spike. 외부 API 의존도가 높을 가능성이 큽니다.",
  },
};

export const QuestionOnly: Story = {
  args: { question: "현재 상태 요약해줘" },
};

export const WithFileAttachment: Story = {
  args: {
    question: "이 로그 분석해줘",
    answer: "log file 을 받았습니다. 분석을 진행할게요.",
    attachments: [{ kind: "file", name: "production.log.gz", mime: "application/gzip" }],
  },
};

export const MultiLineAnswer: Story = {
  args: {
    question: "조치 방안 알려줘",
    answer: "단기 — Circuit breaker + Timeout 설정 명확화\n중기 — 외부 API 캐싱 도입\n장기 — Microservice 분리로 의존도 분산",
  },
};
