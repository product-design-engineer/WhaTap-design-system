/**
 * chart/_emphasis — 가리킨 마크를 강조하는 공통 값. 카탈로그 밖 내부 모듈.
 *
 * 규칙(patterns §26 «강조», 2026-10-23 사용자 결정): 가리킨 마크는 불투명 + 카드색 2px 고리(선은 굵게), 나머지는 `DIM_OPACITY` 로 흐린다.
 * **색은 바꾸지 않는다** — 색은 계열 · 상태의 것이다(§17). 전환은 CSS `.wds-chart-mark`(120ms, 동작 줄이기면 없음)가 맡는다.
 * [[HexGrid]] 가 먼저 쓰던 흐림 값(0.32)을 모든 차트가 같이 쓴다.
 */

/** 가리킨 것 밖 마크의 불투명도. */
export const DIM_OPACITY = 0.32;

/** 가리킨 점 · 칸 둘레 고리 — 겹친 마크 위에서도 떠 보이게 카드색. */
export const EMPHASIS_RING = "0 0 0 2px var(--color-card)";

/** 전환을 받는 마크 클래스(whatap-ds.css). */
export const MARK_CLASS = "wds-chart-mark";

/** 가리킨 대상이 있을 때 이 마크가 흐려지는가. */
export function dimmed<T>(hover: T | null | undefined, self: T): boolean {
  return hover != null && hover !== self;
}
