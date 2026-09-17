import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@whatap/design-system";

/**
 * Stories for [[Button]] — 공통 buton primitive.
 *
 * @whatap/wds Button-specs 기반: 3 variant × 4 size × 4 tone + disabled / loading / fullWidth.
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
          "3 variant (basic / contained / outline) × 4 size (xl 36 / lg 32 / md 24 / sm 20) × 4 tone (primary / tertiary / warning / critical) " +
          "+ disabled / loading / fullWidth. 모든 색은 토큰 binding (인라인 hex 금지).\n\n" +
          "**위계는 variant, 색 의미는 tone.** contained=1차 CTA · outline=2차 · basic=3차 텍스트. " +
          "`tone=\"tertiary\"` 는 색 의미가 없는 **중립 무채색** — 취소 · 닫기 · 나중에 · 더보기. " +
          "한 화면에 파란 버튼 두 개가 CTA 자리를 다투지 않게 하는 자리다.\n\n" +
          "AI 전용 그라데이션 버튼은 [[AiAssistantButton]], 송신 버튼은 [[AiSendButton]] 별도.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["basic", "contained", "outline"] },
    size:    { control: { type: "radio" }, options: ["xl", "lg", "md", "sm"] },
    tone:    { control: { type: "radio" }, options: ["primary", "tertiary", "warning", "critical"] },
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

/** 4 tone 비교 (contained lg). */
export const Tones: Story = {
  args: {},
  render: () => (
    <div className="flex gap-3 items-center">
      <Button tone="primary"  size="lg">Primary</Button>
      <Button tone="tertiary" size="lg">Tertiary</Button>
      <Button tone="warning"  size="lg">Warning</Button>
      <Button tone="critical" size="lg">Critical</Button>
    </div>
  ),
};

/**
 * tone="tertiary" — 색 의미가 없는 **중립 무채색** 액션.
 *
 * 위계(강조 단계)는 variant 가 담으므로 tertiary 도 3 variant 전부와 조합된다.
 * contained tertiary 는 "중립이지만 눌러야 하는" 버튼(예: 목록으로 돌아가기),
 * outline/basic tertiary 는 CTA 옆 취소·닫기 자리다.
 */
export const ToneTertiary: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <Button variant="contained" tone="tertiary" size="lg">목록으로</Button>
        <Button variant="outline"   tone="tertiary" size="lg">취소</Button>
        <Button variant="basic"     tone="tertiary" size="lg">나중에</Button>
      </div>
      <span className="text-sm text-tertiary">
        전경·보더는 테마 반전되는 text/border 토큰 — 다크에서도 대비 유지.
      </span>
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
      {(["primary", "tertiary", "warning", "critical"] as const).map((tone) => (
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

/**
 * 실제 사용 패턴 — 적용/취소 한 쌍.
 *
 * 취소는 `tone="tertiary"` (중립). CTA 만 브랜드 파란색을 갖는다 —
 * 취소까지 primary 로 두면 파란 버튼 둘이 시선을 나눠 가져 1차 액션이 흐려진다.
 */
export const PrimaryAndCancel: Story = {
  args: {},
  render: () => (
    <div className="flex gap-2 items-center">
      <Button variant="outline"   tone="tertiary" size="lg">취소</Button>
      <Button variant="contained" tone="primary"  size="lg">네, 적용하고 트렌드 보기</Button>
    </div>
  ),
};

/**
 * ❌ 안티패턴 — 취소를 tone="primary" 로 두기.
 *
 * 아래 두 줄을 나란히 보면 차이가 명확하다. 위: 파란 버튼 둘이 경쟁(❌).
 * 아래: 중립 취소 + 파란 CTA 하나(✅). 파괴적 액션 확인에서도 같다 —
 * critical 은 실행 버튼 쪽만, 취소는 tertiary.
 */
export const CancelToneComparison: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span className="text-sm text-tertiary" style={{ width: 88 }}>❌ 경쟁</span>
        <Button variant="outline"   tone="primary" size="lg">취소</Button>
        <Button variant="contained" tone="primary" size="lg">적용</Button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm text-tertiary" style={{ width: 88 }}>✅ 중립</span>
        <Button variant="outline"   tone="tertiary" size="lg">취소</Button>
        <Button variant="contained" tone="primary"  size="lg">적용</Button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm text-tertiary" style={{ width: 88 }}>✅ 파괴적</span>
        <Button variant="basic"     tone="tertiary" size="lg">취소</Button>
        <Button variant="contained" tone="critical" size="lg">삭제</Button>
      </div>
    </div>
  ),
};
