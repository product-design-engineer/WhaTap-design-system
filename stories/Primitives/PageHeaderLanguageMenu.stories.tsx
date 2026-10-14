import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { PageHeaderLanguageMenu } from "@whatap/design-system";

const OPTIONS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

/**
 * Stories for [[PageHeaderLanguageMenu]] — [[PageHeader]] 우측의 언어 설정(지구본 24px) 트리거 + 드롭다운.
 */
const meta: Meta<typeof PageHeaderLanguageMenu> = {
  title: "Primitives/PageHeaderLanguageMenu",
  component: PageHeaderLanguageMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**헤더 언어 설정 트리거.** 지구본 아이콘을 누르면 선택지가 펴지고 지금 언어에 체크가 붙는다. " +
          "보통 [[PageHeader]] 의 `language` prop 으로 켠다. 선택지 라벨은 그 언어 자기 이름(한국어 · English · 日本語)으로 적는다.",
      },
    },
  },
  // 드롭다운이 오른쪽 정렬로 펴지므로 트리거를 오른쪽에 두고 아래 공간을 확보한다.
  decorators: [(Story) => <div style={{ display: "flex", justifyContent: "flex-end", width: 280, height: 180 }}><Story /></div>],
  args: { value: "ko", options: OPTIONS, onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof PageHeaderLanguageMenu>;

/** 기본 — 닫힌 지구본 트리거. */
export const Default: Story = {};

/** 열림 — 트리거를 누르면 메뉴가 펴지고 지금 언어(한국어)에 체크. 다른 언어를 고르면 onChange 가 그 코드로 불리고 닫힌다. */
export const Open: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole("button", { name: "Language" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("menuitemradio", { name: "한국어" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "English" }));
    await expect(args.onChange).toHaveBeenCalledWith("en");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
  },
};

/** 제어 — 고른 값이 체크 위치로 돌아오는 실제 사용 흐름. 머리글을 화면 언어로 바꾼 예. */
export const Controlled: Story = {
  render: (args) => {
    const [lang, setLang] = useState("ko");
    return <PageHeaderLanguageMenu {...args} value={lang} onChange={setLang} title="언어" />;
  },
};
