import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@whatap/design-system";

/**
 * Stories for [[Slider]] — 한 축 위에서 크기를 고르는 막대 (Primitive).
 *
 * 연속(`min` · `max` · `step`)과 정해진 값(`stops`, 같은 간격 눈금) 두 방식. 지금 값은 막대 밖에 글로 적는다.
 */
const meta: Meta<typeof Slider> = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**크기순으로 놓인 값 중 하나를 고르는 막대.** 상한 · 임계치처럼 «얼마나 크게» 를 정하는 자리에서 전체 범위와 지금 위치를 한눈에 보여 준다. " +
          "고를 값이 정해져 있으면 `stops` 로 주고, 값의 간격과 상관없이 같은 간격의 눈금에 놓인다. " +
          "지금 고른 값은 막대 위치만으로 읽게 하지 않고 막대 밖에 글로 적는다. 크기순이 아닌 선택지에는 쓰지 않는다 — 그 자리는 Select 다.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Slider>;

const LIMITS = [0, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];
const man = (v: number) => (v === 0 ? "0" : `${v / 10_000}만`);
const won = (v: number) => `${v.toLocaleString("ko-KR")}원`;

/** 정해진 값 — 사용량 한계. 금액 간격은 고르지 않지만 눈금은 같은 간격이다. 지금 값은 위 한 줄이 말한다. */
export const Stops: Story = {
  render: (args) => {
    const Demo = () => {
      const [v, setV] = useState(500_000);
      return (
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="text-base text-primary">누적 사용액 {won(v)}까지</span>
          <Slider {...args} stops={LIMITS} value={v} onChange={setV} markLabel={man} valueText={won} label="사용량 한계" />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 바닥값(floor) — 이미 쓴 값보다 낮게는 못 고른다. 아래 눈금은 흐리게 서고, 끌면 손잡이가 floor(눈금 사이)에서 멈춘다. */
export const Floor: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState(500_000);
      return (
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="text-base text-primary">누적 사용액 {won(v)}까지 · 지금 누적 사용액 150,000원</span>
          <Slider stops={LIMITS} floor={150_000} value={v} onChange={setV} markLabel={man} valueText={won} label="사용량 한계" />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 연속 — min · max · step. 눈금 글자는 양 끝에만 선다. */
export const Continuous: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState(80);
      return (
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="text-base text-primary">CPU {v}% 이상이면 알림</span>
          <Slider min={50} max={100} step={5} value={v} onChange={setV} markLabel={(x) => `${x}%`} valueText={(x) => `${x}%`} label="CPU 임계치" />
        </div>
      );
    };
    return <Demo />;
  },
};

/** uncontrolled — defaultValue. 눈금 글자 없이 막대만. */
export const Uncontrolled: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Slider defaultValue={30} label="보존 비율" />
    </div>
  ),
};

/** 사용할 수 없음. */
export const Disabled: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Slider stops={LIMITS} value={200_000} markLabel={man} disabled label="사용량 한계" />
    </div>
  ),
};
