import type { Meta, StoryObj } from "@storybook/react-vite";
import DataTableRow from "../../src/DataTableRow";
import type { DataTableColumn } from "../../src/DataTable";

/**
 * Stories for [[DataTableRow]] — DataTable 본문의 단일 데이터 행(row).
 *
 * 트랙(`gridTemplate`)·정렬(`colAlign`)·density 토큰은 부모(DataTable)가 계산해 주입하므로
 * 스토리에서도 동일하게 값을 직접 넘긴다. 실제 테이블 맥락 재현을 위해 table/tbody 래퍼 대신
 * grid 행이 들어가는 카드 컨테이너로 감싼다.
 */

type Session = { no: number; name: string; cpu: number };

const columns: DataTableColumn<Session>[] = [
  { key: "no", header: "No", width: 40 },
  { key: "name", header: "세션", flex: 2 },
  { key: "cpu", header: "CPU", width: 80, numeric: true },
];

const gridTemplate = "40px 2fr 80px";

const colAlign = (c: DataTableColumn<Session>): "left" | "right" | "center" => {
  if (c.align) return c.align;
  if (typeof c.header === "string" && c.header.trim() === "No") return "center";
  return c.numeric ? "right" : "left";
};

const defaultTokens = {
  rowText: "text-md text-primary",
  rowHeight: "leading-normal",
  rowPadding: "px-12px py-10px gap-10px",
};

const meta: Meta<typeof DataTableRow<Session>> = {
  title: "Primitives/DataTableRow",
  component: DataTableRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DataTableRow<Session>>;

/** 기본 행 (default density) — No center / 텍스트 left / numeric right. */
export const Default: Story = {
  args: {
    row: { no: 1, name: "session-alpha", cpu: 42 },
    rowIndex: 0,
    columns,
    gridTemplate,
    colAlign,
    ...defaultTokens,
  },
};

/** 클릭 가능 행 — onRowClick 지정 시 cursor-pointer. */
export const Clickable: Story = {
  args: {
    row: { no: 2, name: "session-beta", cpu: 87 },
    rowIndex: 1,
    columns,
    gridTemplate,
    colAlign,
    ...defaultTokens,
    onRowClick: (row) => alert(`clicked ${row.name}`),
  },
};
