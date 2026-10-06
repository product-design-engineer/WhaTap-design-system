import type { Meta, StoryObj } from "@storybook/react-vite";
import { InsightSection } from "@whatap/design-system/widget";

const meta: Meta<typeof InsightSection> = {
  title: "Primitives/InsightSection",
  component: InsightSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**AI 인사이트 단락 — 제목 + 본문.** 도구 호출 결과 / 분석 인사이트 / 결론을 한 단락으로 표현. " +
          "흰 배경 카드 chrome 없이 텍스트만 (위젯 본문 흐름의 일부).",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof InsightSection>;

export const TitleAndBody: Story = {
  args: {
    title: "현재 프로젝트 분석 결과",
    body: "최근 5분 동안 스레드 상태를 분석한 결과, httpc 가 압도적 dominant 입니다. 외부 API 응답 지연이 주요 원인으로 보입니다.",
  },
};

export const BodyOnly: Story = {
  args: {
    body: "데이터 수집이 완료되었습니다. 잠시 후 분석 결과가 표시됩니다.",
  },
};

export const LongBody: Story = {
  args: {
    title: "GPU MIG 슬라이스 상태",
    body: "총 8개의 MIG 슬라이스 중 6개가 사용 중이고, 2개가 idle 상태입니다. 신규 inference Pod 가 스케줄링 대기 중이라면 idle 슬라이스를 재할당하는 것을 권장합니다. 다만 트래픽이 가장 적은 시간대(02:00-04:00 KST)에 진행하는 것이 안전합니다.",
  },
};
