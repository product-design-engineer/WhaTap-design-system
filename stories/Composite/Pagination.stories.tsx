import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@whatap/design-system";

/**
 * Stories for [[Pagination]] — 목록 하단의 페이지 이동 + 건수 요약.
 *
 * [[DataTable]] 과 한 세트다. 표를 세우면 페이지네이션도 세운다 — **페이지가 하나여도 그대로**.
 * 컨트롤을 지우면 목록 하단이 데이터에 따라 있다 없다 하면서 표 아래가 움직인다.
 */
const meta: Meta<typeof Pagination> = {
  title: "Composite/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**목록 하단 컨트롤.** 좌측에 「전체 N건 · 페이지당 M건」(지금 무엇의 일부를 보고 있는지), " +
          "우측에 이전 / 페이지 번호 / 다음. 행 높이는 툴바 컨트롤 높이(`--wds-toolbar-control-h` 32px), " +
          "안의 pill 은 24px, caret 은 12px. 활성 페이지는 brand-blue 테두리 + 글자색으로만 표시한다 — " +
          "배경을 칠하면 행 hover 와 충돌한다. 페이지가 8개를 넘으면 앞 5개 + 말줄임 + 마지막.",
      },
    },
  },
  argTypes: {
    page: { description: "현재 페이지(1-base).", control: { type: "number" } },
    totalPages: { description: "전체 페이지 수.", control: { type: "number" } },
    pageSize: { description: "페이지당 행 수 — 좌측 요약 문구에만 쓴다.", control: { type: "number" } },
    total: { description: "필터 적용 후 전체 건수 — 좌측 요약 문구.", control: { type: "number" } },
    hideSummary: { description: "좌측 요약 숨김 — 상단에 이미 같은 건수를 적어 둔 화면용.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

/** 기본 — 여러 페이지. 가운데 pill 하나가 활성이다. */
export const Default: Story = {
  args: { page: 2, totalPages: 5, pageSize: 10, total: 47, onChange: () => {} },
};

/** 페이지가 하나 — 컨트롤을 지우지 않는다. 이전·다음이 비활성이고 1 이 활성이다. */
export const SinglePage: Story = {
  args: { page: 1, totalPages: 1, pageSize: 10, total: 6, onChange: () => {} },
};

/** 8개 초과 — 앞 5개 + 말줄임 + 마지막. 말줄임은 버튼이 아니다. */
export const Truncated: Story = {
  args: { page: 3, totalPages: 24, pageSize: 20, total: 471, onChange: () => {} },
};

/** 요약 숨김 — 상단 툴바가 이미 건수를 적고 있는 화면. */
export const WithoutSummary: Story = {
  args: { page: 1, totalPages: 4, pageSize: 25, total: 88, hideSummary: true, onChange: () => {} },
};

/** 눌러서 넘기기 — 마지막 페이지에서 다음이, 첫 페이지에서 이전이 비활성이 되는 것을 본다. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [page, setPage] = useState(1);
      return <Pagination page={page} totalPages={5} pageSize={10} total={47} onChange={setPage} />;
    };
    return <Demo />;
  },
};
