import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeRangeSelector } from "@whatap/design-system";

/**
 * Stories for [[TimeRangeSelector]] — OptionbarPage 시간 범위 선택자.
 */
const meta: Meta<typeof TimeRangeSelector> = {
  title: "Composite/TimeRangeSelector",
  component: TimeRangeSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**듀얼 datetime + LIVE 토글 + 이동/달력 버튼 + duration 알약.** OptionbarPage 우측 시간 범위 입력기. " +
          "라이브 마크업 (`ic-live-time` / `ic-left` / `ic-right` / `ic-start-date`) 그대로 옮긴 공용 컴포넌트.\n\n" +
          "**표시 형식:** `YYYY-MM-DD HH:MM` — 단일 자리 입력값은 자동 padding (year 4자리, 나머지 2자리). " +
          "자리수 정렬은 `--font-family-numeric` (tabular-nums) 으로 보장.",
      },
    },
  },
  argTypes: {
    title: { description: "상단 제목. 기본 '시간'.", control: "text" },
    durationLabel: { description: "녹색 알약 태그 ('10분', '30분' 등).", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof TimeRangeSelector>;

/** 기본 — 10분 범위, 라이브 토큰. */
export const TenMinute: Story = {
  args: { durationLabel: "10분" },
};

/** 30분 범위. */
export const ThirtyMinute: Story = {
  args: {
    durationLabel: "30분",
    start: { year: "2026", month: "05", day: "15", hour: "13", minute: "07" },
    end: { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  },
};

/** 1시간 범위. */
export const OneHour: Story = {
  args: {
    durationLabel: "1시간",
    start: { year: "2026", month: "05", day: "15", hour: "12", minute: "37" },
    end: { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  },
};

/** 제목 없음 — inline 사용. */
export const NoTitle: Story = {
  args: { title: "", durationLabel: "10분" },
};

/** 커스텀 제목 — 분석 도구용. */
export const CustomTitle: Story = {
  args: { title: "분석 범위", durationLabel: "1시간" },
};

/**
 * 입력값 padding 미적용 — 표시 시 자동 `YYYY-MM-DD HH:MM` 정규화.
 * `month: "5"`, `day: "9"`, `hour: "3"`, `minute: "7"` 같은 단일자리 값이 들어와도 화면에는 `05-09 03:07` 로 표시.
 */
export const AutoPadding: Story = {
  args: {
    durationLabel: "10분",
    start: { year: "2026", month: "5", day: "9", hour: "3", minute: "7" },
    end:   { year: "2026", month: "5", day: "9", hour: "3", minute: "17" },
  },
};
