import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniLineChart, StatusTimeline, WidgetFrame, statusTimelineLegend } from "@whatap/design-system";
import type { StatusTimelineEvent } from "@whatap/design-system";

/**
 * Stories for [[StatusTimeline]] — 시간 위 사건 마커. 높이 = 건수, 색 = 심각도.
 */
const meta: Meta<typeof StatusTimeline> = {
  title: "Composite/Chart/StatusTimeline",
  component: StatusTimeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**상태 타임라인.** 격자 [[ChartGrid]](시간 글자마다 세로 점선) · 값축 [[ChartValueAxis]](건수) · 시간축 [[ChartTimeAxis]] 를 조합하고 마커만 그린다. " +
          "높이 = 건수(값축이 읽게 한다) · 색 = 심각도(critical · warning · info, 상태 토큰) — 계열 색과 섞지 않는다(§23). " +
          "라이브 위젯의 반전 시간 바는 쓰지 않는다(§21 결정).",
      },
    },
  },
  argTypes: {
    events: { description: "`{ at, count, severity, label? }[]` — at 은 start ~ end 와 같은 단위." },
    start: { description: "구간 시작(X 왼쪽 끝)." },
    end: { description: "구간 끝(X 오른쪽 끝)." },
    xLabels: { description: "X 시간 글자(같은 간격)." },
    max: { description: "건수 축 최대. 없으면 데이터에서." },
    frame: { description: "자기 좌우 여백 · 심각도 범례 줄. `false` 면 플롯만(WidgetFrame 안)." },
  },
};

export default meta;
type Story = StoryObj<typeof StatusTimeline>;

/* 14:22 ~ 14:50 (28분) — 분 단위 시각 */
const START = 0;
const END = 28;
const LABELS = ["14:22", "14:26", "14:30", "14:34", "14:38", "14:42", "14:46", "14:50"];
/* 툴팁 제목 시각 — 분 → 「14:34」 */
const formatAt = (m: number) => { const t = 22 + Math.round(m); return `14:${String(t).padStart(2, "0")}`; };
const EVENTS: StatusTimelineEvent[] = [
  { at: 1.5, count: 2, severity: "info", label: "배포 시작" },
  { at: 3, count: 1, severity: "info" },
  { at: 6.5, count: 4, severity: "warning", label: "CPU 80% 초과" },
  { at: 7, count: 7, severity: "warning" },
  { at: 7.5, count: 3, severity: "warning" },
  { at: 12, count: 14, severity: "critical", label: "응답 지연 · 에러 급증" },
  { at: 12.5, count: 18, severity: "critical" },
  { at: 13, count: 9, severity: "critical" },
  { at: 14, count: 5, severity: "warning" },
  { at: 20, count: 2, severity: "info", label: "롤백 완료" },
  { at: 26.5, count: 1, severity: "warning" },
];

const box = { width: 560, height: 180, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** 기본 — 단독이면 심각도 범례를 플롯 위 오른쪽에 세운다. 높이는 값축(건)이 읽게 한다. */
export const Default: Story = {
  args: { events: EVENTS, start: START, end: END, xLabels: LABELS, formatAt },
  render: (args) => (
    <div style={box}>
      <StatusTimeline {...args} />
    </div>
  ),
};

/** 빈 구간 — 사건이 없는 시간은 비어 있고, 사건이 하나도 없으면 축만 남는다. */
export const Empty: Story = {
  args: { events: [], start: START, end: END, xLabels: LABELS },
  render: (args) => (
    <div style={box}>
      <StatusTimeline {...args} />
    </div>
  ),
};

/** 건수 축 고정 — 여러 칸을 같은 높이 기준으로 비교할 때 `max`. */
export const FixedMax: Story = {
  args: { events: EVENTS.filter((e) => e.severity !== "critical"), start: START, end: END, xLabels: LABELS, max: 20 },
  render: (args) => (
    <div style={box}>
      <StatusTimeline {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + `statusTimelineLegend()` 를 [[WidgetFrame]] `legend` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 560, height: 200 }}>
      <WidgetFrame title="이벤트 타임라인" summary="최근 30분" legend={statusTimelineLegend()} onFullscreen={() => {}}>
        <StatusTimeline events={EVENTS} start={START} end={END} xLabels={LABELS} formatAt={formatAt} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 지표 아래에 붙이기 — 같은 시간 글자 · 같은 Y축 칸이라 응답시간이 튄 때와 사건이 세로로 맞는다. */
export const UnderMetric: Story = {
  render: () => {
    const values = Array.from({ length: 29 }, (_, i) => 120 + (i >= 12 && i <= 14 ? 600 - (i - 12) * 150 : (i % 5) * 8));
    return (
      <div className="flex flex-col gap-8px" style={{ width: 560 }}>
        <div style={{ height: 150 }}>
          <WidgetFrame title="응답시간">
            <MiniLineChart title="응답시간" values={values} xLabels={LABELS} unit="ms" frame={false} />
          </WidgetFrame>
        </div>
        <div style={{ height: 150 }}>
          <WidgetFrame title="이벤트" legend={statusTimelineLegend()}>
            <StatusTimeline events={EVENTS} start={START} end={END} xLabels={LABELS} formatAt={formatAt} frame={false} />
          </WidgetFrame>
        </div>
      </div>
    );
  },
};
