import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip } from "@whatap/design-system";

/**
 * Stories for [[Chip]] — Primitives 라벨/태그.
 *
 * severity 라벨, 카테고리 태그, 상태 표시 building block.
 */
const meta: Meta<typeof Chip> = {
  title: "Primitives/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**라벨·태그·상태 표시 primitive.** 3 variant(solid/soft/outline) × 5 tone(primary/warning/critical/success/neutral) " +
          "× 2 size(sm/md). closable=true 면 우측 × 버튼. " +
          "interactive 필터링이 필요하면 `FilterChip` 사용 (별개 컴포넌트, 추후 추가).",
      },
    },
  },
  argTypes: {
    variant: {
      description: "시각 강도. solid(채움) / soft(연한 배경) / outline(테두리).",
      control: { type: "select" },
      options: ["solid", "soft", "outline"],
    },
    tone: {
      description: "톤 (색 테마).",
      control: { type: "select" },
      options: ["primary", "warning", "critical", "success", "neutral"],
    },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    closable: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/** 기본 — soft + neutral. */
export const Default: Story = {
  args: { children: "Disk" },
};

/** variant 3종. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip variant="solid" tone="primary">solid</Chip>
      <Chip variant="soft" tone="primary">soft</Chip>
      <Chip variant="outline" tone="primary">outline</Chip>
    </div>
  ),
};

/** tone 5종 — severity·상태 표시에 적합. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-tertiary w-16">solid</span>
        <Chip variant="solid" tone="primary">Primary</Chip>
        <Chip variant="solid" tone="warning">Warning</Chip>
        <Chip variant="solid" tone="critical">Critical</Chip>
        <Chip variant="solid" tone="success">Success</Chip>
        <Chip variant="solid" tone="neutral">Neutral</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-tertiary w-16">soft</span>
        <Chip variant="soft" tone="primary">Primary</Chip>
        <Chip variant="soft" tone="warning">Warning</Chip>
        <Chip variant="soft" tone="critical">Critical</Chip>
        <Chip variant="soft" tone="success">Success</Chip>
        <Chip variant="soft" tone="neutral">Neutral</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-tertiary w-16">outline</span>
        <Chip variant="outline" tone="primary">Primary</Chip>
        <Chip variant="outline" tone="warning">Warning</Chip>
        <Chip variant="outline" tone="critical">Critical</Chip>
        <Chip variant="outline" tone="success">Success</Chip>
        <Chip variant="outline" tone="neutral">Neutral</Chip>
      </div>
    </div>
  ),
};

/** 사이즈 — sm(18px) / md(20px) / lg(28px). lg 는 폼 묶음에서 32px input/button 과 정렬할 때. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip size="sm" tone="primary" variant="soft">sm</Chip>
      <Chip size="md" tone="primary" variant="soft">md</Chip>
      <Chip size="lg" tone="primary" variant="soft">lg</Chip>
    </div>
  ),
};

/** leadingIcon — 도트·아이콘 슬롯. */
export const WithLeadingIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip tone="critical" variant="soft" leadingIcon={<span style={{ fontSize: 8 }}>●</span>}>
        Critical
      </Chip>
      <Chip tone="warning" variant="soft" leadingIcon={<span style={{ fontSize: 8 }}>●</span>}>
        Warning
      </Chip>
      <Chip tone="primary" variant="soft" leadingIcon={<span style={{ fontSize: 8 }}>●</span>}>
        Info
      </Chip>
      <Chip tone="neutral" variant="outline" leadingIcon="📁">
        Disk
      </Chip>
    </div>
  ),
};

/** closable — 우측 × 버튼 + onClose. */
export const Closable: Story = {
  render: () => {
    const Demo = () => {
      const [chips, setChips] = useState([
        { id: "disk", tone: "primary" as const, label: "Disk" },
        { id: "jvm", tone: "warning" as const, label: "JVM" },
        { id: "k8s", tone: "success" as const, label: "Kubernetes" },
      ]);
      return (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <Chip
              key={c.id}
              tone={c.tone}
              variant="soft"
              closable
              onClose={() => setChips(chips.filter((x) => x.id !== c.id))}
            >
              {c.label}
            </Chip>
          ))}
          {chips.length === 0 && (
            <span className="text-sm text-tertiary">모두 닫힘 — 새로고침으로 복원</span>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

/** 실제 사용 — severity row + 카테고리 row. */
export const Realistic: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 text-sm text-tertiary">DataTable severity 컬럼</div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="critical" variant="soft" leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Critical</Chip>
          <Chip tone="warning" variant="soft" leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Warning</Chip>
          <Chip tone="primary" variant="soft" leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Info</Chip>
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm text-tertiary">카탈로그 카테고리</div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="neutral" variant="outline">Disk</Chip>
          <Chip tone="neutral" variant="outline">JVM</Chip>
          <Chip tone="neutral" variant="outline">Kubernetes</Chip>
          <Chip tone="neutral" variant="outline">Network</Chip>
        </div>
      </div>
    </div>
  ),
};
