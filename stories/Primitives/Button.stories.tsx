import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@whatap/design-system";

/**
 * Stories for [[Button]] — 공통 buton primitive.
 *
 * @whatap/wds Button-specs 기반: 3 variant × 4 size × 3 tone + disabled / loading / fullWidth.
 */
const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**공통 Button primitive — @whatap/wds Button spec.**\n\n" +
          "3 variant (basic / contained / outline) × 4 size (xl 36 / lg 32 / md 24 / sm 20) × 3 tone (primary / warning / critical) " +
          "+ disabled / loading / fullWidth. 모든 색은 토큰 binding (인라인 hex 금지).\n\n" +
          "AI 전용 그라데이션 버튼은 [[AiAssistantButton]], 송신 버튼은 [[AiSendButton]] 별도.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["basic", "contained", "outline"] },
    size:    { control: { type: "radio" }, options: ["xl", "lg", "md", "sm"] },
    tone:    { control: { type: "radio" }, options: ["primary", "warning", "critical"] },
    loading:    { control: "boolean" },
    disabled:   { control: "boolean" },
    fullWidth:  { control: "boolean" },
    children:   { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

/** 기본 — contained primary lg. */
export const Default: Story = {
  args: { children: "확인", variant: "contained", tone: "primary", size: "lg" },
};

/** 3 variant 비교 (primary lg). */
export const Variants: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button variant="basic"     tone="primary" size="lg">Basic</Button>
      <Button variant="contained" tone="primary" size="lg">Contained</Button>
      <Button variant="outline"   tone="primary" size="lg">Outline</Button>
    </div>
  ),
};

/** 4 size 비교 (contained primary). */
export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button size="xl" tone="primary">XL 36</Button>
      <Button size="lg" tone="primary">LG 32</Button>
      <Button size="md" tone="primary">MD 24</Button>
      <Button size="sm" tone="primary">SM 20</Button>
    </div>
  ),
};

/** 3 tone 비교 (contained lg). */
export const Tones: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button tone="primary"  size="lg">Primary</Button>
      <Button tone="warning"  size="lg">Warning</Button>
      <Button tone="critical" size="lg">Critical</Button>
    </div>
  ),
};

/** Matrix — variant × tone (size lg 고정). */
export const VariantToneMatrix: Story = {
  args: {},
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "120px repeat(3, 1fr)", gap: 8, maxWidth: 720 }}>
      <span />
      <span className="text-sm text-tertiary text-center">basic</span>
      <span className="text-sm text-tertiary text-center">contained</span>
      <span className="text-sm text-tertiary text-center">outline</span>
      {(["primary", "warning", "critical"] as const).map((tone) => (
        <>
          <span key={`${tone}-label`} className="text-sm text-tertiary self-center">{tone}</span>
          <div key={`${tone}-basic`} className="flex justify-center"><Button variant="basic"     tone={tone} size="lg">Action</Button></div>
          <div key={`${tone}-contained`} className="flex justify-center"><Button variant="contained" tone={tone} size="lg">Action</Button></div>
          <div key={`${tone}-outline`} className="flex justify-center"><Button variant="outline"   tone={tone} size="lg">Action</Button></div>
        </>
      ))}
    </div>
  ),
};

/** Disabled 상태. */
export const Disabled: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button variant="contained" tone="primary"  size="lg" disabled>Contained Disabled</Button>
      <Button variant="outline"   tone="critical" size="lg" disabled>Outline Disabled</Button>
      <Button variant="basic"     tone="warning"  size="lg" disabled>Basic Disabled</Button>
    </div>
  ),
};

/** Loading — spinner overlay. */
export const Loading: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button variant="contained" tone="primary" size="lg" loading>저장 중...</Button>
      <Button variant="outline"   tone="primary" size="lg" loading>검증 중...</Button>
    </div>
  ),
};

/** fullWidth — 전체 폭 채우기 (모달 안 등). */
export const FullWidth: Story = {
  args: {},
  render: () => (
    <div style={{ width: 320 }}>
      <Button variant="contained" tone="primary" size="lg" fullWidth>적용하기 (320px wide)</Button>
    </div>
  ),
};

/** 실제 사용 패턴 — 적용/취소 한 쌍. */
export const PrimaryAndCancel: Story = {
  args: {},
  render: () => (
    <div className="flex gap-2 items-center">
      <Button variant="outline"   tone="primary" size="lg">취소</Button>
      <Button variant="contained" tone="primary" size="lg">네, 적용하고 트렌드 보기</Button>
    </div>
  ),
};
