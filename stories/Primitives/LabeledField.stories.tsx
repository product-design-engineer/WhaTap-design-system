import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LabeledField, Tabs } from "@whatap/design-system";

/**
 * Stories for [[LabeledField]] — 라벨 위, 컨트롤 아래.
 */
const meta: Meta<typeof LabeledField> = {
  title: "Primitives/LabeledField",
  component: LabeledField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**라벨 슬롯이 없는 컨트롤을 폼처럼 세우는 래퍼.** 라벨 타이포·간격은 [[TextField]] 와 같은 규칙을 쓴다 — " +
          "`size` 를 감싸는 컨트롤과 같은 값으로 주면 한 줄에 나란히 서도 라벨 높이가 어긋나지 않는다. " +
          "`label` prop 을 이미 가진 [[TextField]]·[[Select]] 에는 쓰지 않는다 — 라벨을 두 번 그리게 된다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LabeledField>;

/** 한 줄 조건 바 — 부모에 `wds-field-row-sm`(2필드 · 400px) 을 붙이면 라벨이 인라인으로 펴진다.
 *  스토리 캔버스를 400px 아래로 좁히면 자동으로 세로로 돌아간다.
 *  필드가 3개 이상인 줄은 `wds-field-row`(720px) 를 쓴다. */
export const InlineLabelRow: Story = {
  render: () => {
    const [v, setV] = useState("month");
    return (
      <div className="wds-field-row-sm" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledField label="조회 기간">
          <Tabs
            variant="segmented"
            size="lg"
            items={[
              { value: "day", label: "일 (5분)" },
              { value: "month", label: "월 (일별)" },
            ]}
            value={v}
            onChange={setV}
          />
        </LabeledField>
        <LabeledField label="집계">
          <Tabs
            variant="segmented"
            size="lg"
            items={[
              { value: "avg", label: "평균" },
              { value: "max", label: "최대" },
            ]}
            value="avg"
            onChange={() => {}}
          />
        </LabeledField>
      </div>
    );
  },
};

/** 세그먼트 토글에 라벨 붙이기 (컨테이너 선언 없음 → 세로). */
export const WithSegmentedTabs: Story = {
  render: () => {
    const [v, setV] = useState("day");
    return (
      <LabeledField label="조회 기간">
        <Tabs
          variant="segmented"
          size="lg"
          items={[
            { value: "day", label: "일 (5분)" },
            { value: "month", label: "월 (일별)" },
          ]}
          value={v}
          onChange={setV}
        />
      </LabeledField>
    );
  },
};
