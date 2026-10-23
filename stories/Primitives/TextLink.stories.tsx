import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextLink, Notice } from "@whatap/design-system";

/**
 * Stories for [[TextLink]] — 문장 안에서 다음 동선을 바로 여는 링크.
 */
const meta: Meta<typeof TextLink> = {
  title: "Primitives/TextLink",
  component: TextLink,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { children: "플랜 관리자", href: "#plan-admin" },
  argTypes: {
    external: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof TextLink>;

/** 기본 — `href` 를 주면 `<a>`. 밑줄은 hover · focus 에만. */
export const Default: Story = {};

/** 문장 안 — 도착지를 부르는 명사구에만 건다. 조사 · 동사는 링크 밖. */
export const InSentence: Story = {
  render: (args) => (
    <p className="text-base text-secondary" style={{ maxWidth: 480 }}>
      내가 만든 플랜이 없으면 <TextLink {...args} />에게 범위 추가를 요청해 주세요.
    </p>
  ),
};

/** `onClick` 만 — 라우터 이동처럼 코드로 옮길 때. `<button type="button">` 으로 그리고 모양은 같다. */
export const AsButton: Story = {
  args: { href: undefined, children: "mysql-v2-test 외 1" },
};

/** 제품 밖 문서 — `external` 이면 새 창(`rel="noopener noreferrer"`). */
export const External: Story = {
  args: { href: "https://docs.whatap.io", external: true, children: "WhaTap 문서" },
};

/** 톤 표면 위 — [[Notice]] 설명 줄 안에서도 `--color-text-link` 하나로 읽힌다. */
export const OnToneSurface: Story = {
  render: () => (
    <Notice
      tone="warning"
      title="결제 카드가 7일 뒤 만료됩니다"
      description={<>만료 전에 <TextLink href="#billing">결제 수단</TextLink>을 바꿔 주세요.</>}
    />
  ),
};
