import type { Meta, StoryObj } from "@storybook/react-vite";
import { Multiline } from "@whatap/design-system";

/**
 * Stories for [[Multiline]] — 문자열의 `\n` 을 `<br>` 로 그리는 텍스트 부품.
 */
const meta: Meta<typeof Multiline> = {
  title: "Primitives/Multiline",
  component: Multiline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Multiline>;

/** 줄바꿈이 있는 문자열 — 두 줄로 그려진다. */
export const Default: Story = {
  args: { children: "숨은 장애까지 추적하는\n애플리케이션 모니터링" },
};

/** 줄바꿈이 없으면 한 줄 그대로. */
export const SingleLine: Story = {
  args: { children: "한 줄짜리 문구" },
};

/** 빈 값이면 아무것도 그리지 않는다 — 빈 껍데기가 여백을 만들지 않게. */
export const Empty: Story = {
  args: { children: null },
};
