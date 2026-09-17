import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectPopover, Select } from "@whatap/design-system";

/**
 * Stories for [[SelectPopover]] — 묶음과 색 표식을 가진 단일 선택.
 */
const meta: Meta<typeof SelectPopover> = {
  title: "Composite/SelectPopover",
  component: SelectPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**네이티브 `<select>` 로는 못 그리는 목록.** 옵션이 성격별로 갈리거나(묶음 헤더) " +
          "옵션마다 색 표식이 붙어야 할 때 쓴다. 평평한 짧은 목록은 [[Select]] 가 맞다 — " +
          "네이티브라 키보드·a11y 를 브라우저가 준다.\\n\\n" +
          "색 표식은 **화면 다른 곳과 같은 색**일 때만 단다. 목록에서만 쓰는 장식색은 의미 없는 구분을 만든다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SelectPopover>;

const SORT_GROUPS = [
  {
    label: "부하 시간",
    options: [
      { value: "elapsed", label: "Elapsed Time" },
      { value: "cpu", label: "CPU Time" },
    ],
  },
  {
    label: "I/O",
    options: [
      { value: "logicalReads", label: "Logical Reads" },
      { value: "physicalReads", label: "Physical Reads" },
    ],
  },
  {
    label: "Wait Class",
    options: [
      /* 계열 정체성 색 — 값이 이름인 구 --color-palette-* 는 폐지됐다(고르는 규칙이 없고 다크가 없었다).
         역할 토큰 --color-chart-series-* 를 쓰고, 「분류되지 않음」에 해당하는 Other 만 무채색이다. */
      { value: "app", label: "Application", swatch: "var(--color-chart-series-1)" },
      { value: "concurrency", label: "Concurrency", swatch: "var(--color-chart-series-7)" },
      { value: "userio", label: "User I/O", swatch: "var(--color-chart-series-3)" },
      { value: "commit", label: "Commit", swatch: "var(--color-chart-series-5)" },
      { value: "idle", label: "Idle", swatch: "var(--color-chart-series-2)" },
      { value: "other", label: "Other", swatch: "var(--color-border-divider)" },
    ],
  },
];

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: 340, paddingBottom: 240 }}>{children}</div>
);

/** 기본 — 묶음 헤더 + 색 표식. 헤더는 고를 수 없다. */
export const Default: Story = {
  render: () => {
    const [v, setV] = useState("elapsed");
    return (
      <Frame>
        <SelectPopover label="정렬 기준" size="sm" value={v} onChange={setV} groups={SORT_GROUPS} />
      </Frame>
    );
  },
};

/** 색 표식이 붙은 값을 고른 상태 — 트리거에도 같은 색이 따라온다. */
export const SwatchSelected: Story = {
  render: () => {
    const [v, setV] = useState("userio");
    return (
      <Frame>
        <SelectPopover label="정렬 기준" size="sm" value={v} onChange={setV} groups={SORT_GROUPS} />
      </Frame>
    );
  },
};

/** [[Select]] 와 나란히 — 트리거 높이·표면이 같아 한 줄에서 어긋나지 않는다. */
export const AlongsideSelect: Story = {
  render: () => {
    const [v, setV] = useState("elapsed");
    const [g, setG] = useState("sql");
    return (
      <Frame>
        <div className="wds-field-row flex items-center" style={{ gap: 16 }}>
          <Select
            label="그룹화"
            size="sm"
            value={g}
            onChange={setG}
            options={[
              { value: "sql", label: "SQL" },
              { value: "session", label: "세션" },
            ]}
          />
          <SelectPopover label="정렬 기준" size="sm" value={v} onChange={setV} groups={SORT_GROUPS} />
        </div>
      </Frame>
    );
  },
};
