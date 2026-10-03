import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SubHeaderBar,
  Button,
  Tabs,
  LiveTimerCompact,
  ToolbarIconButton,
  type TabsItem,
} from "@whatap/design-system";

/**
 * Stories for [[SubHeaderBar]] — 페이지 헤더 아래 40px 보조 네비 행.
 */
const meta: Meta<typeof SubHeaderBar> = {
  title: "Primitives/SubHeaderBar",
  component: SubHeaderBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**페이지 헤더(48px) 아래 보조 행 — 고정 40px.** 뒤로가기·브레드크럼·보조 실행 컨테이너. " +
          "사이드바 조직 스위처(40px)와 같은 높이라 좌/우 컬럼 2행이 정렬됨(헤더 48 → 보조 40 chrome 스케일). " +
          "`box-border` 로 padding/border 가 높이를 부풀리지 않음. 페이지에서 inline div 로 재구현 금지.",
      },
    },
  },
  argTypes: {
    left: { control: false, description: "좌측 슬롯(선택) — 백 버튼·브레드크럼·모드 Tabs 등." },
    children: { control: false, description: "`left` 별칭(기존 사용처 호환). `left` 가 우선." },
    center: { control: false, description: "가운데 슬롯(선택) — 남는 폭 차지 + 중앙 정렬." },
    right: { control: false, description: "우측 정렬 보조 실행(선택)." },
  },
  decorators: [(Story) => (<div style={{ width: 720 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof SubHeaderBar>;

/** 백 버튼만 — 가장 흔한 형태. */
export const Default: Story = {
  args: {
    children: <Button variant="basic" size="md">← 엔터프라이즈 선택</Button>,
  },
};

/** 백 버튼 + 브레드크럼. */
export const WithBreadcrumb: Story = {
  args: {
    children: (
      <>
        <Button variant="basic" size="md">← 엔터프라이즈 관리</Button>
        <span className="text-base text-tertiary">
          / 조직: <span className="text-secondary font-medium">와탭랩스</span>
        </span>
      </>
    ),
  },
};

/** 우측 보조 실행 동반. */
export const WithRightAction: Story = {
  args: {
    children: <Button variant="basic" size="md">← 관리 홈</Button>,
    right: <Button size="md">새 조직</Button>,
  },
};

/** 가운데 슬롯 — 좌/중/우 3분할. center 는 남는 폭을 차지하며 중앙 정렬. */
export const WithCenterSlot: Story = {
  args: {
    left: <Button variant="basic" size="md">← 뒤로</Button>,
    center: <span className="text-base text-secondary font-medium">서비스 대시보드</span>,
    right: <Button size="md">저장</Button>,
  },
};

/* ─── 대시보드 모드 행 ─── */

const FILTER_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2,2 L2,3.95 L11.05,13.67 L11.05,22 L12.99,20.56 L12.99,13.67 L22,3.95 L22,2 L2,2 Z M5.45,5 L18.61,5 L12.01,12 L5.45,5 Z" />
  </svg>
);

const PRINT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16,0 L16,4 L20,4 L20,14 L16,14 L16,20 L4,20 L4,14 L0,14 L0,4 L4,4 L4,0 L16,0 Z M14,14 L6,14 L6,18 L14,18 L14,14 Z M18,6 L2,6 L2,12 L18,12 L18,6 Z M6,8 L6,10 L4,10 L4,8 L6,8 Z M14,2 L6,2 L6,4 L14,4 L14,2 Z" />
  </svg>
);

const SHARE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M6.8,12 L10.8,8 L6.8,4 L5.672,5.128 L7.736,7.2 L0,7.2 L0,8.8 L7.736,8.8 L5.672,10.872 L6.8,12 Z M0,0 L0,4.8 L1.6,4.8 L1.6,1.6 L14.4,1.6 L14.4,14.4 L1.6,14.4 L1.6,11.2 L0,11.2 L0,16 L16,16 L16,0 L0,0 Z"
      transform="translate(2 2)"
    />
  </svg>
);

const MODE_TABS: TabsItem[] = [
  { value: "edit", label: "수정 모드" },
  { value: "admin", label: "관리자" },
  { value: "view", label: "뷰 모드" },
  { value: "filter", label: "필터", icon: FILTER_ICON },
];

const DASHBOARD_TOOLS = [
  { key: "print", label: "인쇄", icon: PRINT_ICON },
  { key: "settings", label: "설정", icon: "menu-settings.svg" },
  { key: "share", label: "공유/내보내기", icon: SHARE_ICON },
];

/**
 * 대시보드 모드 행 — 좌측 모드 [[Tabs]] + 우측 [[LiveTimerCompact]] · [[ToolbarIconButton]] 묶음.
 * 페이지에서 inline `<div>` 로 짜던 툴바를 슬롯 조합으로 대체한 형태.
 */
export const DashboardModeRow: Story = {
  decorators: [(Story) => (<div style={{ width: 1080 }}><Story /></div>)],
  render: () => {
    const [mode, setMode] = useState("view");
    return (
      <SubHeaderBar
        left={
          <Tabs
            variant="large"
            items={MODE_TABS}
            value={mode}
            onChange={setMode}
            aria-label="대시보드 모드"
          />
        }
        right={
          <>
            <LiveTimerCompact durationLabel="30분" />
            {DASHBOARD_TOOLS.map((t) => (
              <ToolbarIconButton
                key={t.key}
                icon={t.icon}
                label={t.label}
                tooltipPlacement="bottom"
              />
            ))}
          </>
        }
      />
    );
  },
};
