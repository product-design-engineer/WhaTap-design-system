/**
 * 차트 극단 사례 스토리 공용 데이터 — «100개» 와 «데이터 없음».
 *
 * 각 차트 스토리 끝의 `Extreme100` · `ExtremeEmpty` (단일 값 차트는 `ExtremeBounds`)가 이 파일을 쓴다.
 * 값은 난수가 아니라 정해진 식이다 — 시각 회귀 스냅샷이 매번 같아야 한다.
 *
 * 색은 patterns §22 를 따른다: 100개 중 앞 `HIGHLIGHT` 개만 series 색, 나머지는 `--color-chart-neutral`
 * 회색 다발. 범례에 100개를 다 띄울지는 차트마다 지금 동작 그대로 보여 준다 — 잘리면 잘리는 대로.
 * (선택 목록 범례는 후속 작업 — memory chart-legend-scale-time-mode)
 */

/** 극단 사례의 개체 수. */
export const EXTREME_N = 100;

/** 색을 받는 강조 개체 수(§22 권장 ≤ 5). */
export const HIGHLIGHT = 5;

/** `agent-001` … `agent-100` 처럼 자릿수를 맞춘 이름. */
export function names(n = EXTREME_N, prefix = "agent"): string[] {
  const w = String(n).length;
  return Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(w, "0")}`);
}

/**
 * 개체 `i` 의 값 `len` 개 — 개체마다 기준값과 위상이 다른 사인파. 0 이상.
 * `base` 근처에서 `amp` 만큼 흔들린다.
 */
export function wave(i: number, len = 20, base = 50, amp = 20): number[] {
  const b = base * (0.4 + ((i * 37) % 100) / 100);
  return Array.from({ length: len }, (_, t) => Math.max(0, Math.round((b + amp * Math.sin((t + i * 1.7) / 2.3)) * 10) / 10));
}

/** 개체 `i` 의 값 하나(0 ~ max). 개체마다 다르고 정해져 있다. */
export function scalar(i: number, max = 100): number {
  return Math.round((((i * 61 + 17) % 97) / 96) * max * 10) / 10;
}

/** 시각 라벨 `len` 개 — 13:00 부터 1분 간격. */
export function timeLabels(len = 20, startMin = 13 * 60): string[] {
  return Array.from({ length: len }, (_, t) => {
    const m = startMin + t;
    return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });
}

/** 개체 `i` 의 색 — 앞 `HIGHLIGHT` 개는 series 슬롯, 나머지는 회색 다발(§22). */
const SERIES = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
  "var(--color-chart-series-4)",
  "var(--color-chart-series-5)",
  "var(--color-chart-series-6)",
  "var(--color-chart-series-7)",
  "var(--color-chart-series-8)",
] as const;

export function colorOf(i: number, highlight = HIGHLIGHT): string {
  return i < Math.min(highlight, SERIES.length) ? SERIES[i] : "var(--color-chart-neutral)";
}

/** 스토리 설명 머리말 — 모든 극단 스토리가 같은 말로 시작한다. */
export const EXTREME_NOTE = {
  many: `**극단 · ${EXTREME_N}개** — 개체 ${EXTREME_N}개를 넣었을 때 지금 이 차트가 그리는 모습. 색은 앞 ${HIGHLIGHT}개만 series, 나머지는 회색 다발(patterns §22).`,
  empty: "**극단 · 데이터 없음** — 빈 배열 · null 을 넣었을 때 지금 이 차트가 그리는 모습. 빈 상태 문구는 WidgetFrame `state` 가 맡는다.",
  bounds: "**극단 · 0 과 상한 초과** — 단일 값 차트라 «100개» 대신 값의 양 끝을 넣었을 때 지금 그리는 모습.",
} as const;
