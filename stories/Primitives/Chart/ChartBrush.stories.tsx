import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartBrush, ChartTimeAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartBrush]] — 시간축 줄을 끌어 구간을 고른다(확대).
 */
const meta: Meta<typeof ChartBrush> = {
  title: "Primitives/Chart/ChartBrush",
  component: ChartBrush,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**구간 확대.** 플롯 아래 시간축 줄만 끄는 자리다 — 플롯 위 막대 hover · 클릭과 겹치지 않는다. " +
          "끄는 동안 플롯 위에 띠, 놓으면 `onSelect(from, to)`(0~1).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChartBrush>;

/** 시간축을 끌어 본다 — 고른 구간이 아래 글자로. */
export const Default: Story = {
  render: () => {
    const [sel, setSel] = useState<[number, number] | null>(null);
    return (
      <div style={{ width: 480 }}>
        <div className="relative" style={{ height: 120, background: "var(--color-surface-50)" }}>
          <ChartTimeAxis labels={["0s", "10s", "20s", "30s", "40s"]} left={0} right={0} />
          <ChartBrush left={0} right={0} top={0} bottom={14} onSelect={(a, b) => setSel([a, b])} />
        </div>
        <p className="text-sm text-secondary" style={{ marginTop: 8 }}>
          {sel ? `고른 구간 ${(sel[0] * 40).toFixed(1)}s – ${(sel[1] * 40).toFixed(1)}s` : "아래 시간 글자 줄을 끌어 보세요"}
        </p>
      </div>
    );
  },
};
