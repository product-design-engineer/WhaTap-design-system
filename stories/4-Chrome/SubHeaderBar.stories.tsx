import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubHeaderBar, Button } from "@whatap/design-system";

/**
 * Stories for [[SubHeaderBar]] — 페이지 헤더 아래 40px 보조 네비 행.
 */
const meta: Meta<typeof SubHeaderBar> = {
  title: "Chrome/SubHeaderBar",
  component: SubHeaderBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**페이지 헤더(48px) 아래 보조 행 — 고정 40px.** 뒤로가기·브레드크럼·보조 액션 컨테이너. " +
          "사이드바 조직 스위처(40px)와 같은 높이라 좌/우 컬럼 2행이 정렬됨(헤더 48 → 보조 40 chrome 스케일). " +
          "`box-border` 로 padding/border 가 높이를 부풀리지 않음. 페이지에서 inline div 로 재구현 금지.",
      },
    },
  },
  argTypes: {
    children: { control: false, description: "좌측 내용 — 백 버튼 + 브레드크럼 등." },
    right: { control: false, description: "우측 정렬 보조 액션(선택)." },
  },
  decorators: [(Story) => (<div style={{ width: 720 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof SubHeaderBar>;

/** 백 버튼만 — 가장 흔한 형태. */
export const Default: Story = {
  args: {
    children: <Button variant="basic" size="md">← 엔터프라이즈 선택</Button>,
  },
};

/** 백 버튼 + 브레드크럼. */
export const WithBreadcrumb: Story = {
  args: {
    children: (
      <>
        <Button variant="basic" size="md">← 엔터프라이즈 관리</Button>
        <span className="text-base text-tertiary">
          / 조직: <span className="text-secondary font-medium">와탭랩스</span>
        </span>
      </>
    ),
  },
};

/** 우측 보조 액션 동반. */
export const WithRightAction: Story = {
  args: {
    children: <Button variant="basic" size="md">← 관리 홈</Button>,
    right: <Button size="md">새 조직</Button>,
  },
};
