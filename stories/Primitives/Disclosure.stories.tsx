import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Disclosure, TextField } from "@whatap/design-system";

/**
 * Stories for [[Disclosure]] — 머리말을 눌러 아래 내용을 펼치고 접는 덩어리.
 *
 * 머리말이 «접힌 것이 무엇이고 몇 개인가» 를 말하는 것이 이 컴포넌트의 거의 전부다.
 * 열림은 화살표와 `aria-expanded` 가 말하고, 낱말은 바뀌지 않는다.
 */
const meta: Meta<typeof Disclosure> = {
  title: "Primitives/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**펼치기/접기 primitive.** 머리말은 늘 보이고 내용은 펼쳤을 때만 선다. 기본은 접힘. " +
          "머리말에는 접힌 것이 무엇인지와 그 양을 적고, 「펼치기 · 접기」 낱말은 넣지 않는다. " +
          "여러 구획 중 하나만 보이게 하려면 `Tabs`, 다른 내용을 덮어야 하면 `Modal` 을 쓴다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Disclosure>;

const TAKEN = [
  ["주문 API", "운영팀"],
  ["정산 배치", "운영팀"],
  ["쿠버네티스 운영", "SRE"],
  ["커머스 웹", "서비스개발"],
] as const;

const TakenList = () => (
  <ul className="flex flex-col gap-4px text-base text-tertiary" style={{ paddingTop: 8, paddingLeft: 16 }}>
    {TAKEN.map(([p, plan]) => (
      <li key={p}>
        {p} · {plan} 플랜
      </li>
    ))}
  </ul>
);

/** 기본 — 접힘. 머리말이 접힌 것과 그 양을 말한다. */
export const Default: Story = {
  args: { summary: `다른 플랜에 속한 프로젝트 ${TAKEN.length}`, children: <TakenList /> },
};

/** 처음부터 펼친 상태(비제어 `defaultOpen`). */
export const DefaultOpen: Story = {
  args: { summary: `다른 플랜에 속한 프로젝트 ${TAKEN.length}`, defaultOpen: true, children: <TakenList /> },
};

/** 작은 머리말 — 캡션 · 좁은 패널. */
export const Small: Story = {
  args: { size: "sm", summary: "계산 근거", children: <p className="text-sm text-tertiary" style={{ paddingTop: 6 }}>기본요금 100,000원 · 첫 달 6일치 일할</p> },
};

/** 비활성. 펼칠 내용이 아직 없을 때. */
export const Disabled: Story = {
  args: { disabled: true, summary: "지난 주기 기록 0", children: null },
};

/**
 * 제어 모드 — 검색어가 접힌 쪽에 맞으면 화면이 펼친다. 찾는 것이 안에 있다는 것이 분명한 때만
 * 화면이 열림을 바꾼다.
 */
export const Controlled: Story = {
  render: () => {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const hit = q.trim() !== "" && TAKEN.some(([p]) => p.includes(q.trim()));
    return (
      <div className="flex flex-col gap-8px" style={{ width: 360 }}>
        <TextField size="lg" fullWidth value={q} onChange={setQ} placeholder="프로젝트 이름" />
        <Disclosure summary={`다른 플랜에 속한 프로젝트 ${TAKEN.length}`} open={hit || open} onOpenChange={setOpen}>
          <TakenList />
        </Disclosure>
      </div>
    );
  },
};
