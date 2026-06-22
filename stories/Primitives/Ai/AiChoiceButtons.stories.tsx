import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiChoiceButtons } from "@whatap/design-system/widget";

const meta: Meta<typeof AiChoiceButtons> = {
  title: "Primitives/Ai/AiChoiceButtons",
  component: AiChoiceButtons,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**Primary/Secondary 선택 버튼 쌍** — AI 제안에 대한 사용자 결정 (실행/취소 등). 보조 라벨(`hint`) 로 confidence 표시.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiChoiceButtons>;

export const Default: Story = {
  args: {
    primary: { label: "네, 적용하고 트렌드 보기", onClick: () => console.log("primary") },
    secondary: { label: "다른 구성을 제안받기", onClick: () => console.log("secondary") },
  },
};

export const WithHints: Story = {
  args: {
    primary: { label: "Critical 알림 규칙 등록", hint: "(98% 권장)", onClick: () => {} },
    secondary: { label: "취소", hint: "(나중에)", onClick: () => {} },
  },
};
