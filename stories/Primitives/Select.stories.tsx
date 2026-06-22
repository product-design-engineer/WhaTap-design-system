import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@whatap/design-system";

const METRIC_OPTIONS = [
  { value: "disk.usage", label: "Disk usage (%)" },
  { value: "cpu.usage", label: "CPU usage (%)" },
  { value: "mem.usage", label: "Memory usage (%)" },
  { value: "net.tx", label: "Network TX (Mbps)" },
  { value: "net.rx", label: "Network RX (Mbps)" },
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

/**
 * Stories for [[Select]] — Primitives 단일 선택 드롭다운.
 *
 * 메트릭/심각도/단위 선택 등 단일 값 선택. native `<select>` 기반 — 펼침 메뉴 디자인은
 * 브라우저 기본. 시각 톤은 TextField 와 정렬.
 */
const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**단일 선택 primitive.** native `<select>` 기반 — a11y/키보드 자동, 펼침 메뉴 디자인은 브라우저 기본. " +
          "시각 톤 (size·border·padding) 은 TextField 와 정렬. `clearable` 동일 패턴 지원. " +
          "디자인 제어된 펼침 메뉴가 필요하면 추후 `Combobox` 별도 컴포넌트.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/** 기본 — md 사이즈 + 라벨. */
export const Default: Story = {
  args: {
    label: "메트릭",
    options: METRIC_OPTIONS,
    placeholder: "선택…",
    value: "disk.usage",
  },
};

/** 사이즈 비교 — TextField 와 동일 spec (24 / 28 / 32px). */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Select size="sm" label="sm (24px)" options={SEVERITY_OPTIONS} placeholder="dense 옵션바·인라인" />
      <Select size="md" label="md (28px)" options={SEVERITY_OPTIONS} placeholder="Modal 안 dense form" />
      <Select size="lg" label="lg (32px, default)" options={SEVERITY_OPTIONS} placeholder="페이지 헤더·옵션바" />
    </div>
  ),
};

/** placeholder — value 비어있을 때 표시. */
export const Placeholder: Story = {
  args: {
    label: "심각도",
    options: SEVERITY_OPTIONS,
    placeholder: "심각도를 선택하세요",
    value: "",
  },
};

/** clearable — value 있을 때 우측 × 버튼. chevron 옆에 배치. */
export const Clearable: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState<string>("critical");
      return (
        <div className="flex flex-col gap-3" style={{ width: 320 }}>
          <Select
            label="심각도"
            options={SEVERITY_OPTIONS}
            placeholder="선택…"
            value={v}
            onChange={setV}
            clearable
          />
          <span className="text-sm text-tertiary">현재 선택: {v || "(없음)"}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** invalid — 에러 상태. */
export const Invalid: Story = {
  args: {
    label: "메트릭",
    options: METRIC_OPTIONS,
    placeholder: "필수 선택",
    value: "",
    invalid: true,
    helperText: "메트릭을 선택하세요",
  },
};

/** disabled. */
export const Disabled: Story = {
  args: {
    label: "메트릭",
    options: METRIC_OPTIONS,
    value: "disk.usage",
    disabled: true,
  },
};

/** 옵션 일부 disabled — 권한 없는 메트릭 가정. */
export const PartiallyDisabledOptions: Story = {
  args: {
    label: "메트릭 (일부 권한 제한)",
    options: [
      { value: "disk.usage", label: "Disk usage (%)" },
      { value: "cpu.usage", label: "CPU usage (%)" },
      { value: "internal.metric", label: "(internal) 내부 메트릭 — 권한 없음", disabled: true },
    ],
    placeholder: "선택",
  },
};

/** 인터랙티브 — TextField + Select 폼 묶음. */
export const InForm: Story = {
  render: () => {
    const Demo = () => {
      const [metric, setMetric] = useState("disk.usage");
      const [severity, setSeverity] = useState("");
      return (
        <div className="flex flex-col gap-4" style={{ width: 400 }}>
          <Select
            label="메트릭"
            fullWidth
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
            clearable
            helperText="알림을 발생시킬 대상 메트릭"
          />
          <Select
            label="심각도"
            fullWidth
            options={SEVERITY_OPTIONS}
            value={severity}
            onChange={setSeverity}
            placeholder="선택…"
            clearable
            invalid={!severity}
            helperText={!severity ? "심각도를 선택하세요" : "선택됨"}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
