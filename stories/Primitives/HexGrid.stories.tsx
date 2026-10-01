import type { Meta, StoryObj } from "@storybook/react-vite";
import { HexGrid } from "@whatap/design-system";
import type { HexItem, HexTone } from "@whatap/design-system";

/**
 * Stories for [[HexGrid]] — 디바이스를 헥사곤으로 배치하는 리소스 맵.
 *
 * active 유닛은 차트 계열 1 로 채워지고, 그 위 외곽선·글로우는 테마와 무관한 흰색 전경이다
 * (허용 예외 — 소스에 `raw-color-ok` + `data-ds-policy-ok` 두 채널로 표기).
 */
const TONES: HexTone[] = ["active", "active", "idle", "active", "warning", "active", "idle", "critical"];
const make = (n: number): HexItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `gpu-${i}`, label: String(i), tone: TONES[i % TONES.length] }));

const meta: Meta<typeof HexGrid> = {
  title: "Primitives/HexGrid",
  component: HexGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    columns: { control: { type: "number", min: 2, max: 12, step: 1 } },
    radius: { control: { type: "number", min: 12, max: 40, step: 2 } },
  },
  decorators: [(Story) => (<div style={{ width: 420, height: 260 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof HexGrid>;

/** 기본 — 16개 디바이스, 4가지 tone. */
export const Default: Story = {
  args: { items: make(16), columns: 6 },
};

/** active / idle 만 — 가동 현황. */
export const ActiveIdle: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({ id: `gpu-${i}`, label: String(i), tone: i < 8 ? "active" : "idle" })),
    columns: 6,
  },
};

/** 큰 유닛 — `radius` 로 크기 조정. */
export const LargeRadius: Story = {
  args: { items: make(8), columns: 4, radius: 32 },
};
