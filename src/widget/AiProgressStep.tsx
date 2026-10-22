import type { ReactNode } from "react";

/**
 * AiProgressStep — [[AiProgress]] 진행 카드의 단계 한 줄.
 *
 * ## Purpose
 * 단계 이름과 그 단계의 상태를 한 줄로 보인다. 상태는 넷이다.
 * - `pending` 대기: 회색 점 + 흐린 이름. 첫 단계가 시작된 뒤 남은 단계를 보인다
 * - `active` 진행: 파란 고리 + 실제 처리 수(«에이전트 8 / 12»). 분모가 있을 때만 양을 보인다
 * - `done` 완료: 초록 체크 + 무엇을 했는지 한 줄(«에이전트 12개 · 응답시간 · TPS · 에러율»)
 * - `halted` 중단: 빈 원 + «여기서 멈췄어요»
 * 단계 아래에 중간 발견(«15:02 응답시간 평소의 4.8배»)을 칩으로 붙인다. 답보다 먼저 꺼내는 자리다.
 *
 * ## When to use
 * - [[AiProgress]] 가 `steps.map` 으로 렌더한다(기본 용법). 보통 단독으로 쓰지 않는다.
 *
 * ## When NOT to use
 * - 2초 안에 끝나는 짧은 진행 → [[ReasoningStep]] (점 애니메이션 한 줄).
 * - 접고 펼치는 도구 호출 기록 → [[TimelineStepItem]] · [[ToolCallStep]].
 * - 일반 폼의 단계 표시(1 · 2 · 3 마법사). AI 연산 진행 전용이다.
 *
 * ## Composition rules
 * - 처리 수 `count` 는 `active` 에서만 보인다. 분모(`total`)를 모르면 넘기지 않는다(퍼센트로 바꿔 적지 않는다).
 * - 움직이지 않는다. 진행 카드에서 움직이는 곳은 머리의 [[AiStageMotion]] 하나다.
 * - 발견 칩은 경고 면(`--color-status-warning-soft` · 글자 `--color-tone-text-warning`). 판정 문장이 아니라 관측 사실 한 줄.
 * - 색은 토큰만. 완료 체크 안의 흰 획만 컬러 위 고정 흰색 예외다.
 *
 * ## Spec
 * `<li>` 한 줄. 격자 2칸(아이콘 열 | 글자 열) · 위아래 padding 5px. 둘째 줄과 발견 칩은 글자 열에 선다.
 * 열 폭과 간격은 [[AiProgress]] 격자 변수를 따른다(`--wds-ai-progress-col` 32px · `--wds-ai-progress-gap` 8px). 단독으로 쓰면 16px · 8px. 마커는 아이콘 열 가운데.
 *
 * | 상태 | 마커(14×14 칸 · 위 2px) | 이름 | 둘째 줄 |
 * |---|---|---|---|
 * | `pending` | 점 6px `--color-border-divider` | `--text-base` regular `--color-text-disabled` | 없음 |
 * | `active` | 고리 12px · 선 2px `--color-brand-blue` · 안 `--color-brand-blue-tint` | `--text-base` medium `--color-text-primary` | `{unit} {value} / {total}` · `--color-brand-blue-deep` · 숫자 numeric · tabular-nums · 천 단위 구분 · value 는 내림하고 total 을 넘지 않게 자른다. `count` 가 없으면 `detail` |
 * | `done` | 원 14px `--color-status-success` + 흰 체크(선 1.4) | 같음 | `detail` · `--text-base` `--color-text-tertiary` |
 * | `halted` | 빈 원 14px(선 1.4) + 가로 막대 · `--color-text-disabled` | 같음 | `haltedText` · `--color-text-tertiary` |
 *
 * 발견 칩: 위 4px · padding 3px 8px · radius 4px · 폭은 내용만큼(최대 100%) · `--text-base` medium · 면 `--color-status-warning-soft` · 글자 `--color-tone-text-warning` · 글자 «{findingPrefix} · {내용}». 나타날 때 한 번 `wdsAiRise` 0.3s(동작 줄이기면 없음).
 * 스크린리더: 이름 뒤 숨은 글자 « · 대기 / 진행 중 / 완료 / 중단».
 *
 * @example
 * ```tsx
 * <AiProgressStep status="active" label="데이터 분석" count={{ value: 812, total: 1284, unit: "트랜잭션" }}
 *   findings={["15:02 응답시간 평소의 4.8배"]} />
 * ```
 */
export type AiProgressStepStatus = "pending" | "active" | "done" | "halted";

export type AiProgressCount = {
  /** 지금까지 처리한 수. */
  value: number;
  /** 처리할 전체 수(분모). */
  total: number;
  /** 단위 이름. «에이전트» · «트랜잭션» · «답변 항목». */
  unit: string;
};

export type AiProgressStepProps = {
  status: AiProgressStepStatus;
  /** 단계 이름. «데이터 수집». */
  label: ReactNode;
  /** `active` 의 처리 수. 분모가 있을 때만. */
  count?: AiProgressCount;
  /** `done` 에서 보이는 한 줄. 무엇을 했는지. `active` 에서 `count` 가 없으면 이 줄이 대신 선다. */
  detail?: ReactNode;
  /** `halted` 에서 보이는 한 줄. 기본 «여기서 멈췄어요». */
  haltedText?: ReactNode;
  /** 중간 발견. 단계 아래에 경고 면 칩으로 붙는다. */
  findings?: ReactNode[];
  /** 발견 칩 앞 머리말. 기본 «발견». */
  findingPrefix?: ReactNode;
};

const fmt = (n: number) => Math.floor(n).toLocaleString();

function Marker({ status }: { status: AiProgressStepStatus }) {
  if (status === "done")
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
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
  if (status === "halted")
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="6" fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.4" />
        <path d="M4.5 7h5" stroke="var(--color-text-disabled)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  if (status === "active")
    return (
      <span
        aria-hidden="true"
        className="block rounded-full"
        style={{ width: 12, height: 12, border: "2px solid var(--color-brand-blue)", background: "var(--color-brand-blue-tint)" }}
      />
    );
  return <span aria-hidden="true" className="block rounded-full" style={{ width: 6, height: 6, background: "var(--color-border-divider)" }} />;
}

const STATUS_SR: Record<AiProgressStepStatus, string> = { pending: "대기", active: "진행 중", done: "완료", halted: "중단" };

export default function AiProgressStep({
  status,
  label,
  count,
  detail,
  haltedText = "여기서 멈췄어요",
  findings,
  findingPrefix = "발견",
}: AiProgressStepProps) {
  let line: ReactNode = null;
  if (status === "done") line = detail;
  else if (status === "halted") line = haltedText;
  else if (status === "active")
    line = count ? (
      <>
        {count.unit} <span className="font-numeric tabular-nums">{fmt(Math.min(count.value, count.total))} / {fmt(count.total)}</span>
      </>
    ) : (
      detail
    );

  return (
    <li className="wds-ai-progress-step" data-status={status}>
      <span className="wds-ai-progress-step-mark">
        <Marker status={status} />
      </span>
      <span className="wds-ai-progress-step-label">
        {label}
        <span className="wds-ai-progress-sr"> · {STATUS_SR[status]}</span>
      </span>
      {line != null && line !== false && <span className="wds-ai-progress-step-detail">{line}</span>}
      {findings?.map((f, i) => (
        <span key={i} className="wds-ai-progress-find">
          {findingPrefix} · {f}
        </span>
      ))}
    </li>
  );
}
