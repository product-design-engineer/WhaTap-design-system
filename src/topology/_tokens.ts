/**
 * topology/_tokens — 토폴로지 tone → **유틸 클래스명** 매핑.
 *
 * 색은 인라인 style 로 주입하지 않는다. CSS 변수 문자열(`var(--…)`)조차 인라인으로 넣지 않고,
 * `whatap-ds.css` 에 등록된 유틸 클래스명만 넘긴다 — 색의 소유권을 CSS 한 곳에 둔다.
 * (좌표·크기처럼 레이아웃 엔진이 계산하는 값은 색이 아니므로 인라인으로 남는다.)
 */

/** 노드 뱃지·포트의 의미 색. */
export type TopologyTone = "default" | "ok" | "alert";

/** 뱃지 배경 클래스 — tone 원색. 이 위 전경은 항상 고정 흰색(`.text-white`). */
export const TOPOLOGY_BADGE_BG: Record<TopologyTone, string> = {
  default: "bg-topology-tone-default",
  ok: "bg-topology-tone-ok",
  alert: "bg-topology-tone-alert",
};

/** 포트 도트 `fill` 클래스. */
export const TOPOLOGY_PORT_FILL: Record<TopologyTone, string> = {
  default: "fill-topology-port",
  ok: "fill-topology-port-ok",
  alert: "fill-topology-port-alert",
};

/** 엣지 선 `stroke` 클래스 — 엣지는 default/alert 만 갖는다. */
export const TOPOLOGY_EDGE_STROKE: Record<"default" | "alert", string> = {
  default: "stroke-topology-edge",
  alert: "stroke-topology-edge-alert",
};
