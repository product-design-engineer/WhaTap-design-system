import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { withSpec } from "../_spec";

/** 개발 스펙을 꺼낼 컴포넌트 이름(설명 문자열과 섞이지 않게 식별자로 둔다 — 카탈로그 생성기가 문자열 리터럴을 이어 붙인다). */
const SPEC_OF = "AiStageMotion";
import { AiStageMotion } from "@whatap/design-system/widget";

const meta: Meta<typeof AiStageMotion> = {
  title: "Primitives/AiStageMotion",
  component: AiStageMotion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: withSpec(
          SPEC_OF,
          "**AI 연산 단계 그림.** 수집 · 분석 · 작성 세 종류. 반복 재생이 아니라 `progress`(0~1, 처리 수 ÷ 전체)를 받아 그린다. " +
          "[[AiProgress]] 머리 32px 자리에서 단계가 바뀔 때 그림만 바뀐다. 동작 줄이기 설정이면 움직임 없이 진행 상태만 그린다.",
        ),
      },
    },
  },
  argTypes: {
    stage: { control: "inline-radio", options: ["collect", "analyze", "write"] },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: { type: "number" } },
    still: { control: "boolean" },
    marker: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
};
export default meta;
type Story = StoryObj<typeof AiStageMotion>;

/** ① 데이터 수집 — 모인 점 수 = 수집이 끝난 에이전트 비율(12개 중). */
export const Collect: Story = { args: { stage: "collect", progress: 0.4, size: 96 } };

/** ② 데이터 분석 — 스캔 위치 = 분석한 트랜잭션 비율. `marker` 를 넘으면 이상 구간이 경고 색으로 남는다. */
export const Analyze: Story = { args: { stage: "analyze", progress: 0.55, marker: 0.3, size: 96 } };

/** ③ 분석 정보 작성 — 그어진 줄 = 작성이 끝난 답변 항목 비율. */
export const Write: Story = { args: { stage: "write", progress: 0.6, size: 96 } };

/** 진행 카드 머리 자리의 실제 크기(32px). */
export const ActualSize: Story = { args: { stage: "analyze", progress: 0.55, marker: 0.3 } };

/** 멈춤 — 동작 줄이기 설정 또는 중단된 작업. 진행 상태만 그린다. */
export const Still: Story = { args: { stage: "collect", progress: 0.5, size: 96, still: true } };

/** 세 종류를 진행률 0 → 1 로 돌려 본다(설명용 순환. 실제 화면은 서버 처리 수를 넣는다). */
export const AllStages: Story = {
  render: () => {
    const Demo = () => {
      const [p, setP] = useState(0);
      useEffect(() => {
        let id = 0;
        const t0 = performance.now();
        const loop = (now: number) => {
          setP((((now - t0) / 1000) % 5) / 4.4);
          id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
      }, []);
      const frac = Math.min(1, p);
      return (
        <div className="flex gap-24px items-end">
          {(["collect", "analyze", "write"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-8px">
              <div className="bg-surface-50 rounded-8px" style={{ padding: 12 }}>
                <AiStageMotion stage={s} progress={frac} marker={s === "analyze" ? 0.3 : undefined} size={96} />
              </div>
              <span className="text-base text-tertiary">{s}</span>
            </div>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};
