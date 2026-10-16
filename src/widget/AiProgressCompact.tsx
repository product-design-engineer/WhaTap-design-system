import { useState, type ReactNode } from "react";
import AiProgressStep, { type AiProgressCount, type AiProgressStepStatus } from "./AiProgressStep";

/**
 * AiProgressCompact — AI 연산 진행의 간편 버전. 실행 내용 문장 한 줄에 글로우가 흐르고, 누르면 상세 연산 정보가 펼쳐진다.
 *
 * ## Purpose
 * 기다리는 동안 카드를 세우지 않고 «지금 하는 일» 한 문장만 보인다(«트랜잭션을 분석하고 있어요»).
 * 진행 중에는 그 글자 위를 빛이 왼쪽에서 오른쪽으로 훑고 지나간다(`.wds-ai-shimmer`). 그것이 «아직 일하는 중» 의 유일한 표시다.
 * 문장을 누르면 아래로 상세 연산 정보가 펼쳐진다: 단계 수로 나눈 막대 · 단계별 처리 수 · 중간 발견([[AiProgressStep]]).
 * 끝나면 «3단계 완료 · 23초», 중단하면 «중단했어요 · 15초» 로 바뀌고 글로우가 멈춘다. 펼치기 · 접기는 늘 이 한 줄에서 한다.
 *
 * ## When to use
 * - 대상이 하나인 짧은 대기(위젯 진입 · 이어 묻는 질문)처럼 진행 카드가 과한 자리. 스레드 흐름을 끊지 않는다.
 * - 화면 폭이 좁아 카드를 세울 수 없을 때(인라인 프롬프트 아래 · 사이드 패널).
 *
 * ## When NOT to use
 * - 단계가 길고 10초를 넘기는 대표 연산(원인 진단 · 통합 분석)처럼 기다림 자체를 보여야 할 때 → [[AiProgress]].
 *   예상 시간 · 「완료되면 알림」 · 「중단」 · 30초 지연 사유는 그 카드에만 있다.
 * - 2초 안에 끝나는 응답 → [[LoadingMessage]].
 * - 한 대기에 이것과 [[AiProgress]] 를 함께 두지 않는다. 같은 진행을 두 번 말한다.
 *
 * ## Composition rules
 * - 문장은 [[AiProgress]] 와 같은 규칙: «{처리하는 대상}을/를 {동작}하고 있어요». `label` 고정, `title` 과 `count.unit` 은 같은 대상.
 * - 움직이는 곳은 글로우 하나. 펼친 상세(막대 · 단계)는 멈춰 있다. 펼친 상세에 [[AiStageMotion]] 을 더하지 않는다.
 * - 글로우는 진행 중에만. 완료 · 중단이면 멈춘 글자. `prefers-reduced-motion` 이면 글로우 없이 글자만(컴포넌트가 따른다).
 * - 펼침은 이 한 줄이 맡는다(`aria-expanded`). 상세 아래에 「접기」 를 따로 두지 않는다.
 * - `steps` 는 [[AiProgress]] 의 `steps` 와 같은 모양이다(`stage` · `marker` 는 쓰지 않는다). 같은 서버 이벤트에서 만든다.
 * - 색은 토큰만. 글로우는 `--color-text-disabled` 바탕 위를 `--color-text-primary` 가 지나간다(차이를 크게 둔다).
 *   글로우가 멈추면(완료 · 중단 · 동작 줄이기) 글자는 `--color-text-tertiary` 로 읽힌다.
 *
 * ## Spec
 * 한 줄 버튼(전체 폭 · 왼쪽 정렬 · 배경 없음) + 펼친 상세. 값은 `whatap-ds.css` 의 `.wds-ai-progress-compact*` · `.wds-ai-shimmer`.
 *
 * | 부위 | 치수 · 간격 | 글자 · 색 |
 * |---|---|---|
 * | 한 줄 | padding 4px 0 · 사이 6px · 세로 가운데 | 문장 `--text-md` 13px regular · 줄높이 1.4 / 진행 중 `.wds-ai-shimmer` / 메타(«2/3 · 14초») `--text-base` 12px `--color-text-tertiary` · numeric · tabular-nums / 셰브런 12px 아래(펼치면 위) |
 * | 글로우 | 배경 그라데이션 폭 250% · 2s linear 무한 · 오른쪽 → 왼쪽 위치 이동 | 바탕 `--color-text-disabled` · 빛 `--color-text-primary`(35% ~ 65% 구간, 50% 가 가장 진함) · `background-clip: text` |
 * | 완료 · 중단 문장 | 같은 줄 · 글로우 없음 | `--color-text-tertiary` · «N단계 완료 · {초}초» / «중단했어요 · {초}초» |
 * | 펼친 상세 | 위 4px · 아래 4px · 막대 다음 단계 목록 | 막대: 칸 높이 4 · 간격 3 · 트랙 `--color-surface-100` · 채움 `--color-brand-blue`. 단계: [[AiProgressStep]] 단독 격자(16px · 8px) |
 * | 포커스 | 2px `--color-brand-blue` · 바깥 2px · radius 4 | |
 *
 * 접근성: 문장에 `role="status"` · `aria-live="polite"`(단계 전환 · 완료 · 중단 때만 바뀐다) · 버튼 `aria-expanded` · `aria-controls`.
 * 글로우는 장식이다. 동작 줄이기면 글자만 남는다.
 *
 * @example
 * ```tsx
 * <AiProgressCompact phase="running" elapsed={14} steps={steps} />
 * ```
 */
export type AiProgressCompactPhase = "running" | "done" | "stopped";

export type AiProgressCompactItem = {
  /** 단계 이름. 고정 «데이터 수집» · «데이터 분석» · «분석 정보 작성». */
  label: ReactNode;
  /** 이 단계가 진행 중일 때 한 줄 문장. «{대상}을/를 {동작}하고 있어요». */
  title: ReactNode;
  status: AiProgressStepStatus;
  /** 0~1. 이 단계의 처리 비율(처리 수 ÷ 전체). 펼친 상세의 막대 칸이 쓴다. */
  progress: number;
  count?: AiProgressCount;
  detail?: ReactNode;
  findings?: ReactNode[];
};

export type AiProgressCompactProps = {
  /** 단계. [[AiProgress]] 의 `steps` 를 그대로 넘겨도 된다(같은 모양). */
  steps: AiProgressCompactItem[];
  phase: AiProgressCompactPhase;
  /** 경과 초. 완료면 걸린 시간. */
  elapsed: number;
  /** 상세 펼침(제어). 미지정이면 접힌 채로 시작하는 내부 상태. */
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  /** 진행 단계가 아직 없을 때 문장. 기본 «질문을 확인하고 있어요». */
  startingTitle?: ReactNode;
  /** 완료 문장. 기본 «{단계 수}단계 완료». 뒤에 « · {초}초» 가 붙는다. */
  doneTitle?: ReactNode;
  /** 중단 문장. 기본 «중단했어요». 뒤에 « · {초}초» 가 붙는다. */
  stoppedTitle?: ReactNode;
  /** true 면 글로우를 멈춘다. 미지정이면 `prefers-reduced-motion` 을 따른다(CSS). */
  still?: boolean;
};

const Chevron = ({ up }: { up: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ flex: "none", transform: up ? "rotate(-90deg)" : "rotate(90deg)" }}>
    <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

let seq = 0;

export default function AiProgressCompact({
  steps,
  phase,
  elapsed,
  expanded,
  onExpandedChange,
  startingTitle = "질문을 확인하고 있어요",
  doneTitle,
  stoppedTitle = "중단했어요",
  still,
}: AiProgressCompactProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const [detailId] = useState(() => `wds-ai-progress-compact-${++seq}`);
  const open = expanded ?? innerOpen;
  const toggle = () => {
    if (expanded === undefined) setInnerOpen(!open);
    onExpandedChange?.(!open);
  };

  const n = steps.length;
  const secs = Math.max(0, Math.floor(elapsed));
  const activeIdx = steps.findIndex((s) => s.status === "active");
  const current = activeIdx >= 0 ? steps[activeIdx] : undefined;
  const running = phase === "running";

  let sentence: ReactNode;
  let meta: string;
  /* 완료 · 중단은 카드의 윗줄과 같은 글자 «N단계 완료 · {초}초». 메타 칸은 비운다. */
  if (phase === "done") {
    sentence = <>{doneTitle ?? `${n}단계 완료`} · <span className="font-numeric tabular-nums">{secs}초</span></>;
    meta = "";
  } else if (phase === "stopped") {
    sentence = <>{stoppedTitle} · <span className="font-numeric tabular-nums">{secs}초</span></>;
    meta = "";
  } else {
    sentence = current ? current.title : startingTitle;
    meta = current ? `${activeIdx + 1}/${n} · ${secs}초` : `${secs}초`;
  }

  /* 중단이면 진행 단계가 «여기서 멈췄어요», 아직 시작 안 한 단계는 지운다(AiProgress 와 같다). */
  const view = steps
    .map((s) => (phase === "stopped" && s.status === "active" ? { ...s, status: "halted" as const } : s))
    .filter((s) => !(phase === "stopped" && s.status === "pending"));

  return (
    <div className="wds-ai-progress-compact">
      <button type="button" className="wds-ai-progress-compact-row" aria-expanded={open} aria-controls={detailId} onClick={toggle}>
        <span
          className={`wds-ai-progress-compact-text${running && !still ? " wds-ai-shimmer" : ""}`}
          role="status"
          aria-live="polite"
        >
          {sentence}
        </span>
        {meta && <span className="wds-ai-progress-compact-meta">{meta}</span>}
        <Chevron up={open} />
      </button>
      {open && (
        <div className="wds-ai-progress-compact-detail" id={detailId}>
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
          <ul className="wds-ai-progress-steps wds-ai-progress-compact-steps">
            {view.map((s, i) => (
              <AiProgressStep key={i} status={s.status} label={s.label} count={s.count} detail={s.detail} findings={s.findings} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
