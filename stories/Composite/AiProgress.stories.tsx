import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiProgress, AnswerSkeleton, UserBubble, type AiProgressItem } from "@whatap/design-system/widget";

/* ── 예시 시나리오: «어제 오후 3시쯤 결제 API 응답시간이 갑자기 느려진 원인» ──
   단계 경계(초)는 서버 이벤트가 오는 시각의 예시다. 실제 화면은 이벤트로 넘어간다. */
const SCEN = {
  normal: { total: 23, bounds: [[2, 8], [8, 18], [18, 23]] as const, late: false },
  slow: { total: 41, bounds: [[2, 8], [8, 36], [36, 41]] as const, late: true },
};
const DEF = [
  { stage: "collect", label: "데이터 수집", heading: "성능 지표를 수집하고 있어요", unit: "에이전트", n: 12, detail: "에이전트 12개 · 응답시간 · TPS · 에러율" },
  {
    stage: "analyze", label: "데이터 분석", heading: "수집된 지표를 분석하고 있어요", unit: "트랜잭션", n: 1284, detail: "느린 트랜잭션 1,284건 분석",
    finds: [{ at: 0.3, text: "15:02 응답시간 평소의 4.8배" }, { at: 0.85, text: "DB 커넥션 대기 비중 71%" }], marker: 0.3,
  },
  { stage: "write", label: "분석 정보 작성", heading: "분석 결과를 정리하고 있어요", unit: "답변 항목", n: 3, detail: "원인 진단 · 근거 3건" },
] as const;

/** 경과 시간 → 단계 상태. 스토리 전용 시뮬레이션이다(화면은 서버 이벤트를 그대로 넣는다). */
function stepsAt(t: number, scen: keyof typeof SCEN): AiProgressItem[] {
  return DEF.map((d, i) => {
    const [a, b] = SCEN[scen].bounds[i];
    const status = t >= b ? "done" : t >= a ? "active" : "pending";
    const progress = status === "done" ? 1 : status === "active" ? (t - a) / (b - a) : 0;
    const finds = "finds" in d ? d.finds.filter((f) => status !== "pending" && progress >= f.at).map((f) => f.text) : [];
    return {
      stage: d.stage,
      label: d.label,
      title: d.heading,
      status,
      progress,
      count: { value: Math.floor(d.n * progress), total: d.n, unit: d.unit },
      detail: d.detail,
      findings: finds,
      marker: "marker" in d ? d.marker : undefined,
    };
  });
}

const meta: Meta<typeof AiProgress> = {
  title: "Composite/AiProgress",
  component: AiProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**10초 넘게 걸리는 AI 연산의 진행 카드(대기 표현 V2).** 어느 단계에 있는지 · 얼마나 진행됐는지 · 기다리는 동안 무엇을 할 수 있는지를 경과 시간대별로 보인다. " +
          "막대는 % 가 아니라 단계 수로 나눈 칸이고, 진행 칸만 실제 처리 수의 비율로 채운다. 10초부터 예상 시간 · 「완료되면 알림」 · 「중단」, 30초부터 지연 사유. " +
          "완료되면 «3단계 완료 · 23초» 한 줄로 접힌다. 기존 `LoadingMessage`(0~2초) · `Reasoning` · `StepsTimeline` 의 긴 대기 용도를 이 카드 하나로 모은다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 448 }}><Story /></div>],
  argTypes: {
    phase: { control: "inline-radio", options: ["running", "done", "stopped"] },
    elapsed: { control: { type: "range", min: 0, max: 45, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof AiProgress>;

const noop = () => {};

/** 0~2초 — 보내는 순간. 머리 한 줄과 단계 이름 한 줄만. 끝이 어디인지는 알리되 막대 · 목록은 아직 없다. */
export const Starting: Story = { args: { phase: "running", elapsed: 1, steps: stepsAt(1, "normal") } };

/** 단계 진행 — 진행 단계에 실제 처리 수(에이전트 8 / 12). 머리 그림은 수집. */
export const Collecting: Story = { args: { phase: "running", elapsed: 6, steps: stepsAt(6, "normal") } };

/** 10초~ — 예상 시간과 선택권. 중간 발견을 답보다 먼저 꺼낸다. */
export const Long: Story = {
  args: { phase: "running", elapsed: 14, steps: stepsAt(14, "normal"), expected: "보통 20초 안팎 걸려요", onNotifyChange: noop, onStop: noop },
};

/** 30초~ — 평소보다 오래 걸린다는 것과 그 이유. 처리 수가 오르는 것으로 멈추지 않았음을 보인다. */
export const Late: Story = {
  args: {
    phase: "running",
    elapsed: 33,
    steps: stepsAt(33, "slow"),
    expected: "보통 20초 안팎 걸려요",
    delayReason: "평소보다 오래 걸리고 있어요. DB 지표 응답이 느려 기다리는 중이에요.",
    notify: true,
    onNotifyChange: noop,
    onStop: noop,
  },
};

/** 작성 단계 — 이 단계에서만 답변 자리 표시를 함께 깐다(반짝임 없음). */
export const Writing: Story = {
  render: () => (
    <div className="flex flex-col gap-12px">
      <AiProgress phase="running" elapsed={20} steps={stepsAt(20, "normal")} expected="보통 20초 안팎 걸려요" onStop={noop} />
      <AnswerSkeleton still bullets={3} />
    </div>
  ),
};

/** 완료 — 한 줄로 접힌다. 누르면 과정이 그대로 펼쳐진다. */
export const Done: Story = { args: { phase: "done", elapsed: 23, steps: stepsAt(23, "normal") } };

/** 완료 · 펼침. */
export const DoneExpanded: Story = { args: { phase: "done", elapsed: 23, steps: stepsAt(23, "normal"), expanded: true } };

/** 중단 — 끝난 단계와 중간 발견은 남기고, 진행 중이던 단계만 «여기서 멈췄어요». */
export const Stopped: Story = { args: { phase: "stopped", elapsed: 15, steps: stepsAt(15, "normal") } };

/** 재생 — 보통 23초 · 지연 41초. 완료되면 접히고 답이 제목 → 본문 → 근거 순으로 한 번 나타난다(`.wds-ai-reveal`). */
export const Playback: Story = {
  render: () => {
    const Demo = () => {
      const [scen, setScen] = useState<keyof typeof SCEN>("normal");
      const [t, setT] = useState(0);
      const [stopAt, setStopAt] = useState<number | null>(null);
      const [notify, setNotify] = useState(false);
      const total = SCEN[scen].total;
      useEffect(() => {
        if (stopAt != null || t >= total) return;
        const id = window.setTimeout(() => setT((v) => Math.min(total, v + 0.1)), 100);
        return () => clearTimeout(id);
      }, [t, total, stopAt]);
      const now = stopAt ?? t;
      const phase = stopAt != null ? "stopped" : t >= total ? "done" : "running";
      const steps = stepsAt(now, scen);
      const restart = (s: keyof typeof SCEN) => {
        setScen(s);
        setT(0);
        setStopAt(null);
        setNotify(false);
      };
      return (
        <div className="flex flex-col gap-12px">
          <div className="flex gap-8px">
            <button type="button" className="text-base text-secondary" onClick={() => restart("normal")}>보통 23초</button>
            <button type="button" className="text-base text-secondary" onClick={() => restart("slow")}>지연 41초</button>
          </div>
          <UserBubble>어제 오후 3시쯤 결제 API 응답시간이 갑자기 느려진 원인 알려줘</UserBubble>
          <AiProgress
            phase={phase}
            elapsed={now}
            steps={steps}
            expected="보통 20초 안팎 걸려요"
            delayReason={SCEN[scen].late ? "평소보다 오래 걸리고 있어요. DB 지표 응답이 느려 기다리는 중이에요." : undefined}
            notify={notify}
            onNotifyChange={setNotify}
            onStop={() => setStopAt(t)}
          />
          {phase === "running" && steps[2].status === "active" && <AnswerSkeleton still bullets={3} />}
          {phase === "done" && (
            <div className="wds-ai-reveal bg-card border border-color-var-color-border-default rounded-8px flex flex-col gap-8px" style={{ padding: 12 }}>
              <span className="text-sm font-bold text-tertiary">원인 진단</span>
              <strong className="text-md text-primary">DB 커넥션 대기가 응답시간 급증의 주원인입니다</strong>
              <p className="text-md text-secondary" style={{ margin: 0 }}>
                15:02부터 17분 동안 결제 API 응답시간이 평소의 4.8배로 올랐고, 같은 구간 느린 트랜잭션의 71%가 DB 커넥션을 기다리는 데 시간을 썼습니다.
              </p>
              <ul className="text-md text-secondary" style={{ margin: 0, paddingLeft: 18 }}>
                <li>커넥션 풀 최대치(50)에 15:01부터 도달</li>
                <li>같은 시각 정산 배치가 커넥션 38개를 점유</li>
                <li>에러율 변화는 없음. 장애가 아니라 대기 지연</li>
              </ul>
            </div>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};
