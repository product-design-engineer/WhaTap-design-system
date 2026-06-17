/**
 * AiStepsTimeline — "N steps" 접기/펼치기 진행 타임라인.
 *
 * ## Purpose
 * 여러 실행 단계를 행 카드 목록으로 보여주는 접이식 타임라인. 헤더(`N steps`,
 * 미완료가 있으면 `...` 표기)를 클릭해 펼침/접힘. 각 step 은 완료 시 status-success 체크,
 * 진행 중(`running: true`)이면 회전 spinner 로 표시. `defaultOpen`·`delay` 로 초기 상태와
 * 등장 시점을 제어.
 *
 * ## When to use
 * - 다단계 작업의 진행 상태를 펼칠 수 있는 목록으로 보여줄 때.
 * - 완료/진행 단계를 한눈에 요약하고 상세는 접어둘 때.
 *
 * ## When NOT to use
 * - 단일 tool 호출 + 결과 서술 → [[AiToolCallStep]].
 * - 카드 형태의 reasoning 단계 묶음 → [[AiReasoning]].
 * - 단순 로딩 표시 → [[AiLoadingMessage]].
 *
 * ## Composition rules
 * - 카드 없는 단독 블록 — 외형 카드가 필요하면 [[AiCard]] 로 감싸 composition.
 * - 각 step 행은 흰 배경 + border-default 1px 라운드 카드, 마커 색은 토큰(완료 status-success / 진행 brand-blue) — 인라인 hex 금지.
 * - 진행 중 단계는 마지막 하나만 `running: true` 로 두는 것을 권장.
 *
 * @example
 * ```tsx
 * <AiStepsTimeline
 *   steps={[
 *     { label: "지표 수집" },
 *     { label: "이상 구간 분석" },
 *     { label: "리포트 생성", running: true },
 *   ]}
 * />
 * ```
 */
import { useState } from "react";
import TimelineStepItem from "./TimelineStepItem";

export type TimelineStep = {
  label: string;
  /** true면 spinner, false면 ✓ */
  running?: boolean;
};

export default function AiStepsTimeline({
  steps,
  defaultOpen = true,
  delay = 0,
}: {
  steps: TimelineStep[];
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = steps.filter((s) => !s.running).length;
  return (
    <div
      className="ai-anim-in flex flex-col gap-6px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-6px text-md text-secondary tracking-default leading-normal cursor-pointer self-start"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .2s" }}
        >
          <path d="M3 4.5l3 3 3-3" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {steps.length} steps{completed < steps.length ? "..." : ""}
      </button>
      {open && (
        <div className="flex flex-col gap-4px w-full">
          {steps.map((s, i) => (
            <TimelineStepItem key={i} label={s.label} running={s.running} />
          ))}
        </div>
      )}
    </div>
  );
}
