import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Chip, ExtensionPanel } from "@whatap/design-system";

/**
 * Stories for [[ExtensionPanel]] — AI 대화 옆에 여는 콘텐츠 미리보기 패널.
 */
const meta: Meta<typeof ExtensionPanel> = {
  title: "Composite/ExtensionPanel",
  component: ExtensionPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**대화 «옆에» 콘텐츠가 열리는 자리.** [[WhaTapAiWidget]] 이 「일반 페이지 위에 AI 가 열리는 것」이라면 " +
          "이쪽은 「AI 대화 옆에 보고서·상세가 열리는 것」이다. 둘 다 [[DashboardLayout]] 의 children 슬롯에 " +
          "들어가지만 역할이 다르다.\n\n" +
          "폭은 기본 480px 이고 좌측 핸들을 끌어 320~720px 로 조절한다. 닫히면 width 0 으로 접히므로 " +
          "**본문 레이아웃이 밀렸다 돌아온다** — 접힘을 오버레이로 착각해 위에 띄우지 않는다. " +
          "드래그 중에는 transition 을 끄고 포인터를 따라가고, 놓으면 복원한다(끌 때 뒤따라오면 손에 안 붙는다).\n\n" +
          "헤더는 40px 고정 — [[WhaTapAiWidget]] 헤더와 같은 줄에 선다. AI 그라데이션을 쓰지 않는다: " +
          "이 패널이 말하는 것은 AI 가 아니라 **콘텐츠**다.\n\n" +
          "독립적으로 답을 받아야 하면 [[Modal]] 이고, 위젯 자체는 [[WhaTapAiWidget]] 이다.",
      },
    },
  },
  argTypes: {
    open: { description: "열림 여부. false 면 width 0 으로 접힌다.", control: "boolean" },
    title: { description: "헤더 타이틀.", control: "text" },
    defaultWidth: { description: "초기 폭(px). 기본 480.", control: { type: "number" } },
  },
};
export default meta;
type Story = StoryObj<typeof ExtensionPanel>;

/* 패널은 자기 폭만 갖고 높이는 부모가 준다 — 스토리에서도 셸을 흉내 낸 틀 안에 세운다. */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex bg-bg" style={{ height: 520 }}>
    <div className="flex-1 min-w-0 flex items-center justify-center">
      <span className="text-base text-tertiary">(대화 영역)</span>
    </div>
    {children}
  </div>
);

const Body = () => (
  <div className="flex flex-col gap-12px" style={{ padding: 16 }}>
    <div className="flex items-center gap-6px">
      <p className="text-md font-medium text-primary">주간 통합 운영 보고서</p>
      <Chip tone="primary" variant="soft" size="sm">AI</Chip>
    </div>
    <p className="text-sm text-tertiary">2026-05-26 ~ 2026-06-01 · 대상 api-gateway, payment-core</p>
    <div className="bg-card border border-color-var-color-border-default rounded-4px" style={{ height: 160 }} />
    <div className="bg-card border border-color-var-color-border-default rounded-4px" style={{ height: 120 }} />
  </div>
);

/** 열린 상태 — 좌측 핸들을 끌면 폭이 바뀐다. */
export const Open: Story = {
  render: (args) => (
    <Shell>
      <ExtensionPanel {...args} open title="보고서 미리보기">
        <Body />
      </ExtensionPanel>
    </Shell>
  ),
};

/** 헤더 액션 — 닫기 버튼 «왼쪽»에 선다. 닫기가 항상 맨 끝이어야 자리가 흔들리지 않는다. */
export const WithHeaderActions: Story = {
  render: (args) => (
    <Shell>
      <ExtensionPanel
        {...args}
        open
        title="보고서 미리보기"
        headerActions={<Button variant="outline" size="sm">다운로드</Button>}
      >
        <Body />
      </ExtensionPanel>
    </Shell>
  ),
};

/** 열고 닫기 — 접히면 본문이 그 폭을 되찾는다(오버레이가 아니다). */
export const Toggle: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex bg-bg" style={{ height: 520 }}>
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <Button variant="contained" tone="primary" size="lg" onClick={() => setOpen((v) => !v)}>
            {open ? "패널 닫기" : "패널 열기"}
          </Button>
        </div>
        <ExtensionPanel open={open} title="보고서 미리보기" onClose={() => setOpen(false)}>
          <Body />
        </ExtensionPanel>
      </div>
    );
  },
};
