import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardLayout, PageHeader, OptionbarPage } from "@whatap/design-system";

/**
 * Stories for [[DashboardLayout]] — 페이지 chrome (Sidebar + 컨텐츠).
 */
const meta: Meta<typeof DashboardLayout> = {
  title: "Shell/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**페이지 chrome — Sidebar(240px) + 우측 컬럼 (header + main + widget slot).** Sidebar 가 자체 헤더를 " +
          "가지므로 grid 에서 별도 header row 두지 않음. header / main / children(widget) prop 으로 콘텐츠 주입. " +
          "feedback-page-header-invariant + feedback-widget-sidebar-collapse 정책이 layout 레벨에서 자동 적용.",
      },
    },
  },
  argTypes: {
    widgetOpen: { description: "위젯 열림 여부 — true 면 사이드바 collapse 자동 적용.", control: "boolean" },
    activeProduct: { description: "Sidebar 활성 제품.", control: "text" },
  },
  decorators: [(Story) => (<div style={{ height: 720 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof DashboardLayout>;

const SampleMain = (
  <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif" }}>
    <div style={{ fontSize: 14, color: "var(--color-text-tertiary)", marginBottom: 8 }}>Sample main content</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ background: "var(--color-card)", border: "1px solid var(--color-border-default)", borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Panel {i}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)" }}>{i * 12.4}</div>
        </div>
      ))}
    </div>
  </div>
);

/** 기본 — Sidebar + PageHeader + Main, widget 닫힘. */
export const Default: Story = {
  args: {
    activeProduct: "db",
    header: <PageHeader title="DB / oracle_dnx" />,
    main: SampleMain,
  },
};

/** Widget 열림 상태 — Sidebar collapse 자동 적용. */
export const WidgetOpen: Story = {
  args: {
    activeProduct: "db",
    widgetOpen: true,
    header: <PageHeader title="DB / oracle_dnx" aiActive />,
    main: SampleMain,
    children: (
      <div style={{ width: 480, background: "var(--color-card)", borderLeft: "1px solid var(--color-border-default)", padding: 24 }}>
        <div style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 13, color: "var(--color-text-tertiary)" }}>(이 자리에 WhaTapAiWidget)</div>
      </div>
    ),
  },
};

/** Header + Optionbar 조합 — 실제 페이지 흐름. */
export const WithOptionbar: Story = {
  args: {
    activeProduct: "db",
    header: (
      <>
        <PageHeader title="DB / oracle_dnx" />
        <OptionbarPage instanceLabel="DMX-3-12-949" instanceStatus="ok" databaseLabel="ORA11K" />
      </>
    ),
    main: SampleMain,
  },
};

/**
 * 인터랙티브 — 두 가지 접힘 트리거:
 *  1. 헤더 WhaTap AI 버튼 → `widgetOpen` 토글, 위젯이 열리면 사이드바가 정책상 강제 Min(80px).
 *  2. 로고 헤더 chevron → 위젯과 무관하게 사용자가 사이드바를 직접 접기/펴기(위젯 닫힘 상태에서).
 */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <DashboardLayout
          activeProduct="db"
          widgetOpen={open}
          header={<PageHeader title="DB / oracle_dnx" aiActive={open} onAiToggle={() => setOpen((v) => !v)} />}
          main={SampleMain}
        >
          {open && (
            <div style={{ width: 480, background: "var(--color-card)", borderLeft: "1px solid var(--color-border-default)", padding: 24 }}>
              <div style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 13, color: "var(--color-text-tertiary)" }}>
                AI 위젯 (이 자리에 WhaTapAiWidget). 헤더 AI 버튼으로 토글. 로고 헤더 chevron 은 위젯과 별개로 사이드바를 접습니다.
              </div>
            </div>
          )}
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};
