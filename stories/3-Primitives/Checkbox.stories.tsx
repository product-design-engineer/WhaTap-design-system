import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@whatap/design-system";

/**
 * Stories for [[Checkbox]] — Primitives 체크박스.
 *
 * 다중 선택 필터·룰 편집기 boolean·DataTable 행 다중 선택의 building block.
 */
const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**Boolean 입력 primitive.** 폼·필터·테이블 다중 선택 등 전반의 boolean building block. " +
          "indeterminate 상태(부분 선택) 지원 — 트리/그룹 선택에 사용.",
      },
    },
  },
  argTypes: {
    checked: { description: "체크 상태. controlled.", control: "boolean" },
    indeterminate: {
      description: "부분 선택 상태 — 트리/그룹 선택 시. checked 와 독립.",
      control: "boolean",
    },
    disabled: { control: "boolean" },
    size: {
      description: "박스 크기 — sm(14px) / md(16px).",
      control: { type: "select" },
      options: ["sm", "md"],
    },
    label: { description: "옆 라벨 텍스트.", control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** 기본 — checked 상태. */
export const Default: Story = {
  args: { checked: true, label: "알림 활성화" },
};

/** Unchecked. */
export const Unchecked: Story = {
  args: { checked: false, label: "알림 비활성" },
};

/** 부분 선택 — 트리 부모 노드용. */
export const Indeterminate: Story = {
  args: { checked: false, indeterminate: true, label: "카테고리 (3/9 선택)" },
};

/** Disabled. */
export const Disabled: Story = {
  args: { checked: true, disabled: true, label: "권한 없음 — 변경 불가" },
};

/** 사이즈 비교. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox checked size="sm" label="small (14px)" onChange={() => {}} />
      <Checkbox checked size="md" label="medium (16px, default)" onChange={() => {}} />
    </div>
  ),
};

/** 인터랙티브 데모 — 클릭으로 토글. */
export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState(false);
      return (
        <Checkbox checked={v} onChange={setV}>
          클릭하여 상태 확인 — 현재 {v ? "ON" : "OFF"}
        </Checkbox>
      );
    };
    return <Demo />;
  },
};

/** 다중 항목 — 필터 dropdown 안 사용 가정. */
export const Multiple: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState({ disk: true, jvm: false, k8s: true, net: false });
      return (
        <div className="flex flex-col gap-2">
          <Checkbox checked={v.disk} onChange={(c) => setV({ ...v, disk: c })}>
            Disk
          </Checkbox>
          <Checkbox checked={v.jvm} onChange={(c) => setV({ ...v, jvm: c })}>
            JVM
          </Checkbox>
          <Checkbox checked={v.k8s} onChange={(c) => setV({ ...v, k8s: c })}>
            Kubernetes
          </Checkbox>
          <Checkbox checked={v.net} onChange={(c) => setV({ ...v, net: c })}>
            Network
          </Checkbox>
        </div>
      );
    };
    return <Demo />;
  },
};
