import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstanceListItem } from "@whatap/design-system";

/**
 * Stories for [[InstanceListItem]] — 인스턴스 목록 한 행.
 */
const meta: Meta<typeof InstanceListItem> = {
  title: "Primitives/InstanceListItem",
  component: InstanceListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**상태 dot + 클러스터 배지 + 이름.** dot 은 살아있는지를, 배지는 클러스터 소속인지를, " +
          "배경은 지금 고른 것인지를 각각 나눠 말한다. 단일 선택이라 체크 표시는 쓰지 않는다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InstanceListItem>;

/** 활성 인스턴스. */
export const Active: Story = { args: { name: "dmx-3-11" } };

/** 클러스터 소속. */
export const Cluster: Story = { args: { name: "dmx-rac19-1", cluster: true } };

/** 선택됨. */
export const Selected: Story = { args: { name: "dmx-rac19-1", cluster: true, selected: true } };

/** 비활성 — 수집이 멈춘 대상. */
export const Idle: Story = { args: { name: "DMX-OEL92-1", status: "idle" } };
