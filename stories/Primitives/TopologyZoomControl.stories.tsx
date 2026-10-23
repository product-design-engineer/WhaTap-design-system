import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyZoomControl, TOPOLOGY_ZOOM } from "@whatap/design-system";

/**
 * Stories for [[TopologyZoomControl]] — 배율 컨트롤(−/퍼센트/+).
 *
 * 상·하한(`TOPOLOGY_ZOOM`)은 캔버스의 휠 확대와 **같은 상수**를 쓴다. 두 경로가 서로 다른
 * 한계를 쓰면 휠로는 더 줄어드는데 버튼은 멈추는 식으로 어긋난다.
 */
const meta: Meta<typeof TopologyZoomControl> = {
  title: "Primitives/TopologyZoomControl",
  component: TopologyZoomControl,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof TopologyZoomControl>;

/** 기본 100% — 버튼으로 step(10%)씩 움직인다. */
export const Default: Story = {
  render: () => {
    const [scale, setScale] = useState(1);
    return <TopologyZoomControl scale={scale} onScaleChange={setScale} />;
  },
};

/** 하한(25%) — 축소 버튼이 비활성. */
export const AtMin: Story = {
  render: () => {
    const [scale, setScale] = useState<number>(TOPOLOGY_ZOOM.min);
    return <TopologyZoomControl scale={scale} onScaleChange={setScale} />;
  },
};

/** 상한(200%) — 확대 버튼이 비활성. */
export const AtMax: Story = {
  render: () => {
    const [scale, setScale] = useState<number>(TOPOLOGY_ZOOM.max);
    return <TopologyZoomControl scale={scale} onScaleChange={setScale} />;
  },
};

/** 다른 범위 — [[GeoMap]] 은 `limits` 로 100%~600% · 50% 단계. 하한(100%)이라 축소 버튼이 비활성. */
export const MapLimits: Story = {
  render: () => {
    const [scale, setScale] = useState(1);
    return <TopologyZoomControl scale={scale} onScaleChange={setScale} limits={{ min: 1, max: 6, step: 0.5 }} />;
  },
};
