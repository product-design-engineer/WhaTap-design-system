import { useState, type ReactNode } from "react";
import Button from "../Button";
import { AiCard } from "./_primitives";
import AiStageMotion, { type AiStage } from "./AiStageMotion";
import AiProgressStep, { type AiProgressCount, type AiProgressStepStatus } from "./AiProgressStep";

/**
 * AiProgress — 10초 넘게 걸리는 AI 연산의 진행 카드(WhaTap AI 대기 표현 V2).
 *
 * ## Purpose
 * 기다리는 동안 세 가지를 보인다. 어느 단계에 있는지 · 얼마나 진행됐는지 · 기다리는 동안 무엇을 할 수 있는지.
 * 경과 시간에 따라 카드가 바뀐다.
 * - 0~2초: 보내는 순간 «질문을 확인하고 있어요» 와 함께 모든 단계를 흐리게 미리 깐다(끝이 어디인지 알린다)
 * - 단계 진행: 서버 이벤트로 단계가 넘어간다. 진행 단계에 실제 처리 수, 머리 그림은 단계 성격대로 움직인다
 * - 10초~: 하단 줄에 예상 시간(`expected`) · 「완료되면 알림」 · 「중단」
 * - 30초~: 하단 줄이 경고 면으로 바뀌고 지연 사유(`delayReason`)를 말한다
 * - 완료: «3단계 완료 · 23초 · 과정 보기» 한 줄로 접힌다. 펼치면 과정이 그대로 있다
 * - 중단: 끝난 단계와 중간 발견은 남기고, 진행 중이던 단계만 «여기서 멈췄어요» 로 바꾼다
 *
 * ## When to use
 * - 단계가 둘 이상이고 10초를 넘길 수 있는 AI 응답(원인 진단 · 통합 분석 · 보고서 작성).
 * - 서버가 단계 전환 · 처리 수 · 중간 발견을 이벤트로 보내 줄 때. 진행률은 그 처리 수에서 나온다.
 *
 * ## When NOT to use
 * - 2초 안에 끝나는 응답 → [[LoadingMessage]] 한 줄. 짧은 응답에 진행 카드를 깔면 깜빡임만 남는다.
 * - 단계 이벤트가 없는 응답(시간에 맞춘 연출밖에 할 수 없다) → [[LoadingMessage]] + [[AnswerSkeleton]].
 *   진행 카드는 실제 진행을 말한다는 약속이다. 가짜 막대는 10초를 넘기면 멈춘 화면이 된다.
 * - 끝난 도구 호출 기록을 접어 두는 자리 → [[StepsTimeline]] · [[ToolCallStep]].
 *
 * ## Composition rules
 * - 진행 막대는 % 가 아니라 **단계 수로 나눈 칸**이다. 진행 중인 칸만 처리 수의 비율로 채운다.
 * - 움직이는 곳은 머리 그림([[AiStageMotion]]) 하나다. 단계 목록 · 막대 · 답변 자리 표시는 멈춰 있다.
 *   그래서 함께 까는 [[AnswerSkeleton]] 은 `still` 로 반짝임을 끈다. 자리 표시는 마지막 단계(작성)에서만 깐다.
 * - 중간 발견은 일반 기능 팁이 아니다. 이번 질문에서 찾은 관측 사실 한 줄이고, 답의 일부다.
 * - 예상 시간 근거(질문 유형별 소요 시간 중앙값)가 없으면 `expected` 를 넘기지 않는다. 경과 시간만 보인다.
 * - 「완료되면 알림」 은 위젯을 닫아도 작업이 이어지고 알림 경로가 있을 때만 `onNotifyChange` 를 넘긴다.
 * - 입력창은 막지 않는다. 진행 중에는 [[WhaTapAiWidget]] `onStop` 으로 송신 버튼을 중단 버튼으로 바꾼다.
 * - 완료 뒤 답변은 `.wds-ai-reveal` 로 감싸 제목 → 본문 → 근거 순으로 한 번 등장시킨다(④ 정보 표현).
 * - 동작 줄이기 설정이면 머리 그림 · 칩 · 하단 줄이 움직이지 않는다. 진행은 글자와 숫자로 알린다.
 *
 * @example
 * ```tsx
 * <AiProgress
 *   phase="running"
 *   elapsed={14}
 *   expected="보통 20초 안팎 걸려요"
 *   steps={[
 *     { stage: "collect", label: "데이터 수집", title: "성능 지표를 수집하고 있어요", status: "done", progress: 1, detail: "에이전트 12개 · 응답시간 · TPS · 에러율" },
 *     { stage: "analyze", label: "데이터 분석", title: "수집된 지표를 분석하고 있어요", status: "active", progress: 0.6,
 *       count: { value: 770, total: 1284, unit: "트랜잭션" }, findings: ["15:02 응답시간 평소의 4.8배"], marker: 0.3 },
 *     { stage: "write", label: "분석 정보 작성", title: "분석 결과를 정리하고 있어요", status: "pending", progress: 0 },
 *   ]}
 *   onStop={stop}
 * />
 * ```
 */
export type AiProgressPhase = "running" | "done" | "stopped";

export type AiProgressItem = {
  /** 머리 그림 종류. 이 단계가 진행 중일 때 머리에 그려진다. */
  stage: AiStage;
  /** 단계 이름. «데이터 수집». */
  label: ReactNode;
  /** 이 단계가 진행 중일 때 카드 제목. «성능 지표를 수집하고 있어요». */
  title: ReactNode;
  status: AiProgressStepStatus;
  /** 0~1. 이 단계의 처리 비율(처리 수 ÷ 전체). 막대 칸과 머리 그림이 함께 쓴다. */
  progress: number;
  /** 진행 중 처리 수. 분모가 있을 때만. */
  count?: AiProgressCount;
  /** 완료 뒤 한 줄. 무엇을 했는지. */
  detail?: ReactNode;
  /** 중간 발견. 찾은 시점부터 넘긴다. */
  findings?: ReactNode[];
  /** `analyze` 머리 그림의 이상 구간 표시 시점(0~1). 첫 발견과 같은 시점으로 맞춘다. */
  marker?: number;
};

export type AiProgressProps = {
  steps: AiProgressItem[];
  /** 진행 중 · 완료 · 중단. 진행 중인데 진행 단계가 없으면 0~2초 «질문 확인» 상태다. */
  phase: AiProgressPhase;
  /** 경과 시간(초). 완료면 걸린 시간. */
  elapsed: number;
  /** 10초부터 하단 줄에 서는 예상 시간 문장. 근거가 없으면 넘기지 않는다. */
  expected?: ReactNode;
  /** 30초(`lateAfter`)부터 하단 줄에 서는 지연 사유. «평소보다 오래 걸리고 있어요. DB 지표 응답이 느려 기다리는 중이에요.» */
  delayReason?: ReactNode;
  /** 하단 줄이 서는 시점(초). 기본 10. */
  longAfter?: number;
  /** 지연 사유로 바뀌는 시점(초). 기본 30. */
  lateAfter?: number;
  /** 「완료되면 알림」 이 켜져 있는가. */
  notify?: boolean;
  /** 주면 하단 줄에 「완료되면 알림」 토글이 선다. */
  onNotifyChange?: (next: boolean) => void;
  /** 주면 하단 줄에 「중단」 이 선다. */
  onStop?: () => void;
  /** 완료 뒤 펼침 상태(제어). 미지정이면 접힌 채로 시작하는 내부 상태. */
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  /** 0~2초 제목. 기본 «질문을 확인하고 있어요». */
  startingTitle?: ReactNode;
  /** 완료 제목(펼쳤을 때). 기본 «분석을 마쳤어요». */
  doneTitle?: ReactNode;
  /** 중단 제목. 기본 «중단했어요». */
  stoppedTitle?: ReactNode;
  /** 중단 뒤 카드 아래 안내. */
  stoppedNote?: ReactNode;
  /** true 면 머리 그림을 멈춘다. 미지정이면 `prefers-reduced-motion` 을 따른다. */
  still?: boolean;
};

const Chevron = ({ up = false }: { up?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ marginLeft: "auto", transform: up ? "rotate(-90deg)" : undefined }}>
    <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

const DoneMark = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{ flex: "none" }}>
    <circle cx="7" cy="7" r="6.5" fill="var(--color-status-success)" />
    <path
      d="M4 7.1l2 2 4-4"
      data-ds-policy-ok="컬러 원형 배지 위 체크마크 — 컬러 위 고정 흰색"
      // raw-color-ok: 컬러 원형 배지 위 체크마크 — 컬러 위 고정 흰색.
      stroke="#fff"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AiProgress({
  steps,
  phase,
  elapsed,
  expected,
  delayReason,
  longAfter = 10,
  lateAfter = 30,
  notify = false,
  onNotifyChange,
  onStop,
  expanded,
  onExpandedChange,
  startingTitle = "질문을 확인하고 있어요",
  doneTitle = "분석을 마쳤어요",
  stoppedTitle = "중단했어요",
  stoppedNote = "찾은 내용은 위에 남겨 두었어요. 같은 질문을 다시 보내면 처음부터 분석해요.",
  still,
}: AiProgressProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const open = expanded ?? innerOpen;
  const setOpen = (v: boolean) => {
    if (expanded === undefined) setInnerOpen(v);
    onExpandedChange?.(v);
  };

  const secs = Math.max(0, Math.floor(elapsed));
  const n = steps.length;

  /* 완료 · 접힘 — 한 줄. */
  if (phase === "done" && !open) {
    return (
      <AiCard padding={0} gap={0} className="overflow-hidden">
        <button type="button" className="wds-ai-progress-toggle" aria-expanded={false} onClick={() => setOpen(true)}>
          <DoneMark />
          <span>
            {n}단계 완료 · <span className="font-numeric tabular-nums">{secs}초</span> · 과정 보기
          </span>
          <Chevron />
        </button>
      </AiCard>
    );
  }

  /* 상태 변환. 중단이면 진행 중이던 단계가 «여기서 멈췄어요» 로, 아직 시작 안 한 단계는 지운다. */
  const view = steps
    .map((s) => (phase === "stopped" && s.status === "active" ? { ...s, status: "halted" as const } : s))
    .filter((s) => !(phase === "stopped" && s.status === "pending"));
  const activeIdx = steps.findIndex((s) => s.status === "active");
  const current = activeIdx >= 0 ? steps[activeIdx] : undefined;

  let title: ReactNode;
  if (phase === "stopped") title = stoppedTitle;
  else if (phase === "done") title = doneTitle;
  else if (current)
    title = (
      <>
        {current.title}{" "}
        <span className="font-numeric tabular-nums">
          ({activeIdx + 1}/{n})
        </span>
      </>
    );
  else title = startingTitle;

  /* 머리 그림 — 진행 단계의 그림. 시작 전이면 첫 단계 그림을 0 으로, 중단이면 멈춘 단계 그림을 멈춘 채로. */
  const motionStep = current ?? steps[0];
  const head =
    phase === "done" ? (
      <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, flex: "none" }}>
        <DoneMark />
      </span>
    ) : motionStep ? (
      <AiStageMotion
        stage={motionStep.stage}
        progress={current ? current.progress : 0}
        marker={motionStep.marker}
        still={phase === "stopped" ? true : still}
      />
    ) : null;

  const running = phase === "running";
  const late = running && delayReason != null && elapsed >= lateAfter;
  const long = running && elapsed >= longAfter && (expected != null || onNotifyChange || onStop);
  const actions = (
    <>
      {onNotifyChange && (
        <Button
          variant="outline"
          tone={notify ? "primary" : "tertiary"}
          size="md"
          aria-pressed={notify}
          onClick={() => onNotifyChange(!notify)}
        >
          {notify ? "완료되면 알려드릴게요" : "완료되면 알림"}
        </Button>
      )}
      {onStop && (
        <Button variant="outline" tone="tertiary" size="md" onClick={onStop}>
          중단
        </Button>
      )}
    </>
  );

  return (
    <AiCard padding={0} gap={0} className="overflow-hidden">
      <div className="wds-ai-progress-top">
        <div className="wds-ai-progress-title">
          {head}
          <span className="wds-ai-progress-title-text" role="status" aria-live="polite">
            {title}
          </span>
          <span className="wds-ai-progress-elapsed">{secs}초</span>
        </div>
        <div className="wds-ai-progress-bar" aria-hidden="true">
          {steps.map((s, i) => {
            const w = s.status === "done" ? 1 : s.status === "active" ? Math.max(0, Math.min(1, s.progress)) : 0;
            return (
              <i key={i} className="wds-ai-progress-seg">
                <b className="wds-ai-progress-seg-fill" style={{ width: `${(w * 100).toFixed(1)}%` }} />
              </i>
            );
          })}
        </div>
      </div>
      <ul className="wds-ai-progress-steps">
        {view.map((s, i) => (
          <AiProgressStep
            key={i}
            status={s.status}
            label={s.label}
            count={s.count}
            detail={s.detail}
            findings={s.findings}
          />
        ))}
      </ul>
      {phase === "stopped" && stoppedNote != null && <div className="wds-ai-progress-note">{stoppedNote}</div>}
      {late ? (
        <div className="wds-ai-progress-foot" data-late="">
          <span className="wds-ai-progress-foot-msg">{delayReason}</span>
          {actions}
        </div>
      ) : long ? (
        <div className="wds-ai-progress-foot">
          <span className="wds-ai-progress-foot-msg">{expected}</span>
          {actions}
        </div>
      ) : null}
      {phase === "done" && (
        <button type="button" className="wds-ai-progress-toggle" aria-expanded onClick={() => setOpen(false)}>
          접기
          <Chevron up />
        </button>
      )}
    </AiCard>
  );
}
