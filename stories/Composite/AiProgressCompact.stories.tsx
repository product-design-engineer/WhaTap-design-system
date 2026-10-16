import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiProgressCompact, UserBubble, type AiProgressCompactItem } from "@whatap/design-system/widget";
import { withSpec } from "../_spec";

/** 개발 스펙을 꺼낼 컴포넌트 이름(설명 문자열과 섞이지 않게 식별자로 둔다 — 카탈로그 생성기가 문자열 리터럴을 이어 붙인다). */
const SPEC_OF = "AiProgressCompact";

/* 예시: 대상 하나짜리 이어 묻는 질문(12초). 단계 경계(초)는 서버 이벤트가 오는 시각의 예시다. */
const TOTAL = 12;
const BOUNDS = [[1.5, 4], [4, 9], [9, 12]] as const;
const DEF = [
  { label: "데이터 수집", heading: "에러율 지표를 수집하고 있어요", unit: "지표", n: 2, detail: "지표 2종 수집" },
  { label: "데이터 분석", heading: "트랜잭션을 분석하고 있어요", unit: "트랜잭션", n: 1345, detail: "트랜잭션 1,345건 분석", find: { at: 0.4, text: "히트맵 경고 21건이 4초 이상 구간에 몰림" } },
  { label: "분석 정보 작성", heading: "분석 결과를 정리하고 있어요", unit: "답변 항목", n: 2, detail: "답변 항목 2건" },
] as const;

function stepsAt(t: number): AiProgressCompactItem[] {
  return DEF.map((d, i) => {
    const [a, b] = BOUNDS[i];
    const status = t >= b ? "done" : t >= a ? "active" : "pending";
    const progress = status === "done" ? 1 : status === "active" ? (t - a) / (b - a) : 0;
    return {
      label: d.label,
      title: d.heading,
      status,
      progress,
      count: { value: Math.floor(d.n * progress), total: d.n, unit: d.unit },
      detail: d.detail,
      findings: "find" in d && status !== "pending" && progress >= d.find.at ? [d.find.text] : [],
    };
  });
}

const meta: Meta<typeof AiProgressCompact> = {
  title: "Composite/AiProgressCompact",
  component: AiProgressCompact,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: withSpec(
          SPEC_OF,
          "**AI 연산 진행의 간편 버전.** 카드 없이 실행 내용 문장 한 줄. 진행 중에는 그 글자 위를 빛이 훑고 지나가고(글로우), 문장을 누르면 상세 연산 정보(단계 막대 · 처리 수 · 중간 발견)가 펼쳐진다. " +
          "대상 하나짜리 짧은 대기 · 이어 묻는 질문용이고, 기다림 자체를 보여야 하는 대표 연산은 `AiProgress` 카드를 쓴다.",
        ),
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 448 }}><Story /></div>],
  argTypes: {
    phase: { control: "inline-radio", options: ["running", "done", "stopped"] },
    elapsed: { control: { type: "range", min: 0, max: 12, step: 1 } },
    still: { control: "boolean" },
    expandable: { control: "boolean" },
    expanded: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof AiProgressCompact>;

/** 시작 — 아직 단계 전. 문장에 글로우. */
export const Starting: Story = { args: { phase: "running", elapsed: 1, steps: stepsAt(1) } };

/** 진행 — 실행 내용 한 줄 + «2/3 · 6초». 누르면 상세가 펼쳐진다. */
export const Running: Story = { args: { phase: "running", elapsed: 6, steps: stepsAt(6) } };

/** 진행 · 상세 펼침 — 단계 막대 · 처리 수 · 중간 발견. 상세는 움직이지 않는다. */
export const RunningExpanded: Story = { args: { phase: "running", elapsed: 6, steps: stepsAt(6), expanded: true } };

/** 완료 — 글로우가 멈추고 «3단계 완료 · 12초». */
export const Done: Story = { args: { phase: "done", elapsed: 12, steps: stepsAt(12) } };

/** 완료 · 상세 펼침. */
export const DoneExpanded: Story = { args: { phase: "done", elapsed: 12, steps: stepsAt(12), expanded: true } };

/** 중단 — «중단했어요 · 6초». 펼치면 끝난 단계와 발견, 멈춘 단계. */
export const Stopped: Story = { args: { phase: "stopped", elapsed: 6, steps: stepsAt(6), expanded: true } };

/** 펼침 끔 — `expandable={false}`. 셰브런 · 클릭 없이 상태 한 줄만. 상세를 보일 자리가 없을 때. */
export const NotExpandable: Story = { args: { phase: "running", elapsed: 6, steps: stepsAt(6), expandable: false } };

/** 펼침 끔 · 완료. */
export const NotExpandableDone: Story = { args: { phase: "done", elapsed: 12, steps: stepsAt(12), expandable: false } };

/** 글로우 멈춤 — 동작 줄이기 설정과 같은 모양. */
export const Still: Story = { args: { phase: "running", elapsed: 6, steps: stepsAt(6), still: true } };

/** 재생 — 스레드 안에서 12초. 끝나면 글로우가 멈추고 완료 문장으로 바뀐다. */
export const Playback: Story = {
  render: () => {
    const Demo = () => {
      const [t, setT] = useState(0);
      useEffect(() => {
        if (t >= TOTAL) return;
        const start = performance.now() - t * 1000;
        const id = window.setInterval(() => setT(Math.min(TOTAL, (performance.now() - start) / 1000)), 100);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [t >= TOTAL]);
      return (
        <div className="flex flex-col gap-8px">
          <button type="button" className="text-base text-secondary" style={{ alignSelf: "flex-start" }} onClick={() => setT(0)}>처음부터</button>
          <UserBubble>에러율은 어때?</UserBubble>
          <AiProgressCompact phase={t >= TOTAL ? "done" : "running"} elapsed={t} steps={stepsAt(t)} />
        </div>
      );
    };
    return <Demo />;
  },
};
