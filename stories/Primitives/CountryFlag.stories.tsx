import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountryFlag } from "@whatap/design-system";

/**
 * Stories for [[CountryFlag]] — 언어·지역 선택 옆에 붙는 국기 아이콘.
 *
 * 국기 색은 `--color-flag-*` 토큰이다. 국가 표장이라 테마와 무관하게 고정되므로
 * 다크에서도 같은 색으로 보이는 것이 정상이다.
 */
const meta: Meta<typeof CountryFlag> = {
  title: "Primitives/Web · CountryFlag",
  component: CountryFlag,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**국기 아이콘.** `code` 로 ko · en · ja 를 고른다(30×20 비율). " +
          "색은 `--color-flag-*` 토큰 — 테마 불변.",
      },
    },
  },
  argTypes: {
    code: { control: { type: "select" }, options: ["ko", "en", "ja"] },
    size: { control: { type: "number", min: 12, max: 64, step: 2 } },
  },
};

export default meta;
type Story = StoryObj<typeof CountryFlag>;

/** 기본 — 대한민국. `size` 를 생략하면 부모를 100% 채우므로 단독 배치에선 항상 준다. */
export const Default: Story = {
  args: { code: "ko", size: 20 },
};

/** 지원 코드 3종. */
export const AllCodes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <CountryFlag code="ko" size={20} />
      <CountryFlag code="en" size={20} />
      <CountryFlag code="ja" size={20} />
    </div>
  ),
};

/** 크기 — `size` 는 너비(px). 높이는 2/3 로 따라온다(30×20). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <CountryFlag code="ko" size={16} />
      <CountryFlag code="ko" size={24} />
      <CountryFlag code="ko" size={40} />
    </div>
  ),
};
