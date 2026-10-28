/**
 * chart/_statusTone — 상태 맵(대상 하나 = 칸 하나)의 상태 어휘 · 색. 카탈로그 밖 내부 모듈.
 *
 * [[HexGrid]](허니컴)와 [[BlockGrid]](이름 있는 격자)가 같은 상태를 같은 색 · 같은 범례로 말하게 한다 — 두 맵이 한 화면에 서도
 * «Warning» 이 같은 색이어야 한다. 칸을 그리는 쪽이 각자 import 한다(`_axisScale.ts` 와 같은 자리).
 */
export type StatusTone = "active" | "idle" | "warning" | "critical";

/** 칸 칠. */
export const STATUS_TONE_FILL: Record<StatusTone, string> = {
  active: "var(--color-chart-series-1)",
  idle: "var(--color-surface-200)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
};

/** 칸 위 글자. 칠한 칸은 반전 글자, idle 은 tertiary. */
export const STATUS_TONE_TEXT: Record<StatusTone, string> = {
  active: "var(--color-text-inverse)",
  idle: "var(--color-text-tertiary)",
  warning: "var(--color-text-inverse)",
  critical: "var(--color-text-inverse)",
};

/** 범례 순서 · 기본 이름. */
export const STATUS_TONE_ORDER: StatusTone[] = ["active", "idle", "warning", "critical"];
export const STATUS_TONE_LABEL: Record<StatusTone, string> = { active: "Active", idle: "Idle", warning: "Warning", critical: "Critical" };

/**
 * 칸 수를 붙인 범례(`Critical 3`). 0 개인 상태도 줄을 남긴다 — 범례 자리가 데이터마다 흔들리지 않게(라이브 허니컴과 같다).
 * `labels` 로 상태 이름을 바꾼다.
 */
export function statusToneLegend(
  items: readonly { tone: StatusTone }[],
  labels?: Partial<Record<StatusTone, string>>,
): { label: string; color: string; shape?: "square" }[] {
  const counts: Record<StatusTone, number> = { active: 0, idle: 0, warning: 0, critical: 0 };
  for (const it of items) counts[it.tone]++;
  return STATUS_TONE_ORDER.map((tone) => ({ label: `${labels?.[tone] ?? STATUS_TONE_LABEL[tone]} ${counts[tone]}`, color: STATUS_TONE_FILL[tone] }));
}
