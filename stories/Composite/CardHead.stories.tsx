import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardHead } from "@whatap/design-system";

/**
 * Stories for [[CardHead]] — 카드 머리 한 줄.
 */
const meta: Meta<typeof CardHead> = {
  title: "Composite/CardHead",
  component: CardHead,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**이름 · 탭 · 우측 메타를 한 줄에.** 이름은 이 영역이 무엇인지, 탭은 무엇으로 나뉘는지, " +
          "메타는 지금 무엇을 보고 있는지를 말한다. 셋을 위아래로 나누면 각 줄이 가로를 15% 안팎만 쓰면서 " +
          "세로만 34px 더 먹는다. 위계는 줄 구분이 아니라 굵기(이름 bold / 탭 regular)가 진다.\n\n" +
          "탭은 **`segmented` 기본**. `large` 의 밑줄은 컨테이너 폭을 가로질러야 뜻을 갖는데, 한 줄 머리에 " +
          "두면 줄 가운데 토막으로 남아 끝나다 만 구분선처럼 읽힌다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CardHead>;

const METRIC_TABS = [
  { value: "os", label: "OS" },
  { value: "session", label: "Session" },
  { value: "stat", label: "Stat" },
  { value: "wait", label: "Wait" },
];

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex flex-col bg-card border border-color-var-color-border-default rounded-4px"
    style={{ gap: 8, padding: 12 }}
  >
    {children}
    <div
      className="flex items-center justify-center text-base text-tertiary"
      style={{ height: 120, border: "1px dashed var(--color-border-default)" }}
    >
      카드 본문
    </div>
  </div>
);

/** 기본 — 이름 + 탭 + 우측 메타. */
export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState("os");
    return (
      <Card>
        <CardHead
          title="구간 지표"
          tabs={{ items: METRIC_TABS, value: tab, onChange: setTab }}
          meta={
            <span className="flex items-center text-base text-secondary" style={{ gap: 6 }}>
              <span className="font-medium text-primary tabular-nums">2026년 8월 19일</span>
              <span className="text-tertiary">·</span>
              <span>평균</span>
            </span>
          }
        />
      </Card>
    );
  },
};

/** large 변형 — 밑줄이 줄 가운데서 끊겨 끝나다 만 구분선처럼 읽힌다.
 *  `large` 를 쓰려면 탭을 머리 아래 자기 줄로 내려 밑줄이 카드를 가로지르게 한다. */
export const LargeVariantProblem: Story = {
  render: () => {
    const [tab, setTab] = useState("os");
    return (
      <Card>
        <CardHead
          title="구간 지표"
          tabs={{ items: METRIC_TABS, value: tab, onChange: setTab, variant: "large" }}
          meta={<span className="text-base text-secondary">2026년 8월 19일 · 평균</span>}
        />
      </Card>
    );
  },
};

/** 탭 없이 이름만 — 내용이 갈리지 않는 카드. */
export const TitleOnly: Story = {
  render: () => (
    <Card>
      <CardHead title="월 큐브 · 일 간격" />
    </Card>
  ),
};

/** 메타 없이 — 보고 있는 대상이 화면 다른 곳에서 이미 분명할 때. */
export const WithoutMeta: Story = {
  render: () => {
    const [tab, setTab] = useState("session");
    return (
      <Card>
        <CardHead title="구간 내역" tabs={{ items: METRIC_TABS, value: tab, onChange: setTab }} />
      </Card>
    );
  },
};
