import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PageHeaderLanguageMenu from "../../src/PageHeaderLanguageMenu";

/**
 * Stories for [[PageHeaderLanguageMenu]] — PageHeader 우측 언어 설정 트리거 + 드롭다운.
 *
 * 지구본 24px 아이콘을 누르면 선택지가 펴진다. 라벨은 그 언어 자기 이름이다.
 * 드롭다운이 오른쪽 정렬로 펴지므로 컨테이너 오른쪽에 붙여 실제 헤더 맥락을 보인다.
 */
const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

const meta: Meta<typeof PageHeaderLanguageMenu> = {
  title: "Primitives/PageHeaderLanguageMenu",
  component: PageHeaderLanguageMenu,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", width: 320, height: 200 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PageHeaderLanguageMenu>;

/** 기본: 한국어 선택 상태. 아이콘을 누르면 펴진다. */
export const Default: Story = {
  args: { value: "ko", options: LANGS },
};

/** 인터랙티브: 고르면 체크가 옮겨 가고, 머리글도 그 언어로 바뀐다. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const TITLE: Record<string, string> = { ko: "언어", en: "Language", ja: "言語" };
    const Demo = () => {
      const [lang, setLang] = useState("ko");
      return <PageHeaderLanguageMenu value={lang} options={LANGS} title={TITLE[lang]} onChange={setLang} />;
    };
    return <Demo />;
  },
};
