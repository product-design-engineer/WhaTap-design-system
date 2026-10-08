import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "@whatap/design-system";

/**
 * Stories for [[RadioGroup]] — 서로 배타인 선택지 중 하나를 고르는 폼 값 (Primitive).
 *
 * 선택지를 펼쳐 둔다. 세로(기본) · 가로 · 풀이(description) · 고를 수 없는 선택지.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**서로 배타인 선택지 2–5개 중 하나를 고르는 폼 값.** Select 처럼 접어 두지 않고 모두 펼쳐서, 선택지끼리 무엇이 다른지 한 번에 읽히게 한다. " +
          "처음부터 하나를 골라 두고(추천이 있으면 그것), 고를 수 없는 선택지는 지우지 않고 흐리게 둔다. " +
          "6개 이상이면 Select, 뷰 전환이면 Tabs 를 쓴다 — 라디오는 «값» 이고 탭은 «보기» 다.",
      },
    },
  },
  argTypes: {
    direction: { control: { type: "radio" }, options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

/** 가로 두 개 — 과금 범위. 고르면 그 아래 입력이 열리는 폼(호출자가 value 로 분기). */
export const Horizontal: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("all");
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <RadioGroup
            label="과금 범위"
            direction="horizontal"
            value={v}
            onChange={setV}
            items={[
              { value: "all", label: "전체 프로젝트 (7개)" },
              { value: "pick", label: "직접 선택" },
            ]}
          />
          {v === "pick" && <span className="text-base text-tertiary">여기에 프로젝트 고르기가 열린다</span>}
        </div>
      );
    };
    return <Demo />;
  },
};

/** 세로 + 풀이 — 선택지마다 무엇이 다른지 한 줄. */
export const WithDescription: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("daily");
      return (
        <RadioGroup
          label="요약 메일 주기"
          value={v}
          onChange={setV}
          items={[
            { value: "daily", label: "매일", description: "오전 9시에 전날 판정을 모아 보냅니다" },
            { value: "weekly", label: "매주", description: "월요일 오전 9시에 지난주를 모아 보냅니다" },
            { value: "off", label: "보내지 않음" },
          ]}
        />
      );
    };
    return <Demo />;
  },
};

/** 고를 수 없는 선택지 — 지우지 않고 흐리게. 이유는 아래 문장이 말한다. */
export const WithDisabledItem: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <RadioGroup
        label="과금 범위"
        direction="horizontal"
        defaultValue="pick"
        items={[
          { value: "all", label: "전체 프로젝트 (0개)", disabled: true },
          { value: "pick", label: "직접 선택" },
        ]}
      />
      <span className="text-base text-tertiary">선택 가능한 프로젝트가 없습니다. 모든 프로젝트가 다른 플랜에 속해 있습니다.</span>
    </div>
  ),
};

/** 묶음 전체 비활성. */
export const Disabled: Story = {
  render: () => (
    <RadioGroup
      label="공개 범위"
      disabled
      defaultValue="org"
      items={[
        { value: "me", label: "나만" },
        { value: "org", label: "조직 전체" },
      ]}
    />
  ),
};
