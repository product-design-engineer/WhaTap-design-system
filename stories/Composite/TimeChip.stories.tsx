import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeChip, IcSnapshot } from "@whatap/design-system";

/**
 * Stories for [[TimeChip]] — 화면에 나가는 시간값의 단일 표기.
 *
 * 날짜 · 구간 · 판정 기준 시각 · 차트 축이 전부 같은 크기·같은 자형으로 선다.
 */
const meta: Meta<typeof TimeChip> = {
  title: "Composite/TimeChip",
  component: TimeChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**시간값 표기 단일 출처.** Chip md(20px) soft/neutral 고정 + 자형 규칙(값 numeric / 라벨·꼬리말 korean). " +
          "size 를 열지 않는 것이 이 컴포넌트의 요점 — 화면마다 크기가 갈리면 같은 종류의 사실이 두 모양으로 읽힌다. " +
          "문장 안에서 말하는 시각은 칩으로 싸지 않는다(글줄이 끊긴다).",
      },
    },
  },
  argTypes: {
    label: { description: "한글 접두 라벨(「구간」·「판정 기준」). 값만 세울 때는 생략." },
    value: { description: "시간값 본체 — numeric 자형." },
    note: { description: "꼬리말(「(화)」·「· 방금」)." },
    tone: {
      description: "낡은 값·주의가 필요한 시각은 warning.",
      control: { type: "inline-radio" },
      options: ["neutral", "warning"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof TimeChip>;

/** 값만 — 헤더 옆 날짜. */
export const Default: Story = {
  args: { value: "8월 11일", note: "(화)" },
};

/** 라벨 + 값 — 분석 구간. */
export const WithLabel: Story = {
  args: { label: "구간", value: "8월 9일 18:00 ~ 10:08" },
};

/** 아이콘 + 꼬리말 — 스냅샷 기준 시각. 아이콘은 값의 «성격»(언제 찍힌 것)을 말할 때만 쓴다. */
export const Snapshot: Story = {
  args: { label: "판정 기준", value: "10:08", note: "· 방금", leadingIcon: <IcSnapshot size={12} /> },
};

/** 낡은 값 — 칩 자체가 색으로 알린다. */
export const Stale: Story = {
  args: { label: "판정 기준", value: "10:08", note: "· 7분 전", tone: "warning", leadingIcon: <IcSnapshot size={12} /> },
};

/** 한 화면에 여럿이 설 때 — 크기·자형이 같아 «같은 종류의 값» 으로 읽힌다. */
export const Together: Story = {
  render: () => (
    <div className="flex items-center gap-8px flex-wrap">
      <TimeChip value="8월 11일" note="(화)" />
      <TimeChip label="구간" value="8월 9일 18:00 ~ 10:08" />
      <TimeChip label="판정 기준" value="10:08" note="· 방금" leadingIcon={<IcSnapshot size={12} />} />
      <TimeChip value="02:10" />
    </div>
  ),
};
