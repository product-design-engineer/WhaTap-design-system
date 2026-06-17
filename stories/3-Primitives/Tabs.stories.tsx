import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "@whatap/design-system";

const SECTIONS = [
  { value: "rule", label: "룰" },
  { value: "scope", label: "Scope" },
  { value: "action", label: "액션" },
  { value: "history", label: "변경 이력" },
];

const TIME_RANGES = [
  { value: "1h", label: "1H" },
  { value: "6h", label: "6H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
];

/**
 * Stories for [[Tabs]] — Primitives 탭 컴포넌트.
 *
 * 페이지 본문 섹션 전환(large) + 작은 토글 그룹(segmented) 양쪽을 variant 하나로 처리.
 */
const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**탭 nav primitive.** 2 variant (large 페이지 본문 탭 / segmented 압축 토글) × 3 size (sm/md/lg). " +
          "ARIA tablist 패턴 + 키보드 화살표 이동(disabled 자동 건너뜀) + Home/End 양 끝. " +
          "trigger 만 제공 — 패널 내용은 호출자가 value 로 분기.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "시각 variant. large(페이지 본문) / segmented(compact 토글).",
      control: { type: "select" },
      options: ["large", "segmented"],
    },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    "aria-label": { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/** large variant — 페이지 본문 섹션 전환. */
export const Large: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("rule");
      return (
        <div style={{ width: 520 }}>
          <Tabs items={SECTIONS} value={v} onChange={setV} variant="large" aria-label="룰 편집기 섹션" />
          <div className="mt-4 rounded-md border border-color-var-color-border-default p-4 text-sm text-secondary">
            현재 탭: <b>{v}</b> — 본문 영역은 호출자가 value 로 분기하여 렌더링
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/** segmented variant — 압축 토글 (시간 단위 등). */
export const Segmented: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("24h");
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-tertiary">기간</span>
          <Tabs items={TIME_RANGES} value={v} onChange={setV} variant="segmented" size="sm" aria-label="시간 범위" />
          <span className="text-sm text-tertiary">선택: {v}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 사이즈 비교 — segmented 기준. */
export const Sizes: Story = {
  render: () => {
    const Demo = () => {
      const [a, setA] = useState("1h");
      const [b, setB] = useState("1h");
      const [c, setC] = useState("1h");
      return (
        <div className="flex flex-col gap-4">
          <Tabs items={TIME_RANGES} value={a} onChange={setA} variant="segmented" size="sm" aria-label="sm" />
          <Tabs items={TIME_RANGES} value={b} onChange={setB} variant="segmented" size="md" aria-label="md" />
          <Tabs items={TIME_RANGES} value={c} onChange={setC} variant="segmented" size="lg" aria-label="lg" />
        </div>
      );
    };
    return <Demo />;
  },
};

/** large + 아이콘 슬롯. */
export const WithIcons: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("logs");
      return (
        <div style={{ width: 540 }}>
          <Tabs
            variant="large"
            value={v}
            onChange={setV}
            aria-label="인시던트 상세"
            items={[
              { value: "logs", label: "로그", icon: <span>📄</span> },
              { value: "traces", label: "트레이스", icon: <span>🔗</span> },
              { value: "metrics", label: "메트릭", icon: <span>📊</span> },
              { value: "runbook", label: "런북", icon: <span>📘</span>, disabled: true },
            ]}
          />
          <div className="mt-4 rounded-md border border-color-var-color-border-default p-4 text-sm text-secondary">
            현재 탭: <b>{v}</b>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/** disabled 항목 — 키보드 이동 시 자동 건너뜀. */
export const WithDisabled: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("a");
      return (
        <div>
          <Tabs
            variant="large"
            value={v}
            onChange={setV}
            items={[
              { value: "a", label: "활성 A" },
              { value: "b", label: "비활성", disabled: true },
              { value: "c", label: "활성 C" },
              { value: "d", label: "권한 없음", disabled: true },
              { value: "e", label: "활성 E" },
            ]}
            aria-label="disabled 데모"
          />
          <p className="mt-3 text-sm text-tertiary">
            키보드 ← / → 시 disabled 자동 건너뜀. 현재: <b>{v}</b>
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

/** fullWidth — segmented + 균등 분배. */
export const FullWidth: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("warning");
      return (
        <div style={{ width: 400 }}>
          <Tabs
            variant="segmented"
            fullWidth
            value={v}
            onChange={setV}
            items={[
              { value: "critical", label: "Critical" },
              { value: "warning", label: "Warning" },
              { value: "info", label: "Info" },
            ]}
            aria-label="심각도 필터"
          />
          <p className="mt-3 text-sm text-tertiary">선택: {v}</p>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 실제 사용 — 페이지 본문 + 패널 토글. */
export const WithPanels: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("rule");
      return (
        <div style={{ width: 560 }}>
          <Tabs items={SECTIONS} value={v} onChange={setV} variant="large" aria-label="패널 데모" />
          <div className="mt-4 rounded-md border border-color-var-color-border-default p-5">
            {v === "rule" && (
              <div>
                <h4 className="text-md font-medium text-primary mb-2">룰 정의</h4>
                <p className="text-sm text-secondary">메트릭 / 임계값 / 지속 시간을 설정합니다.</p>
              </div>
            )}
            {v === "scope" && (
              <div>
                <h4 className="text-md font-medium text-primary mb-2">Scope</h4>
                <p className="text-sm text-secondary">호스트·마운트·태그로 대상을 좁힙니다.</p>
              </div>
            )}
            {v === "action" && (
              <div>
                <h4 className="text-md font-medium text-primary mb-2">액션</h4>
                <p className="text-sm text-secondary">발생 시 수신 채널과 에스컬레이션을 설정합니다.</p>
              </div>
            )}
            {v === "history" && (
              <div>
                <h4 className="text-md font-medium text-primary mb-2">변경 이력</h4>
                <p className="text-sm text-secondary">누가 언제 무엇을 변경했는지 audit log.</p>
              </div>
            )}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
