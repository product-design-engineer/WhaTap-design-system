/**
 * TargetMeshCluster — 대상 종류 하나의 점 덩어리 + 이름 + 이상 / 판정 수치. 누르면 그 종류를 고른다. Primitives layer.
 *
 * ## Purpose
 * [[TargetMesh]] 의 열 하나. **점 하나 = 대상 하나**(축척이 1이 아니면 여러 개). 덩어리 반지름이 √개수라 면적이 곧 개수이고,
 * 이상(위험 · 경고) 점은 가운데부터, 수집이 끊긴 대상은 바깥 테두리부터 빈 점으로 그린다. 아래에 제품 아이콘 · 짧은 이름 ·
 * «이상 / 판정 수» 와 수집 없음 수를 적는다.
 *
 * ## When to use
 * - [[TargetMesh]] 의 군집 — 열을 1/N 등폭으로 나란히 둔다.
 * - 판정이 진행되는 동안 종류 하나가 끝날 때마다 `revealed` 를 켜서 그 군집을 점등할 때(진행률이 곧 데이터).
 *
 * ## When NOT to use
 * - 단독으로 대상 수를 말하는 숫자 칸 → [[KpiCard]].
 * - 장치 하나 = 칸 하나인 상태 맵 → [[HexGrid]].
 *
 * ## Composition rules
 * - 열 폭은 `flex: 1 1 0`(1/N 등폭) — 지름에 맞추면 열이 들쭉날쭉해 «어느 종류가 더 중요한가» 로 읽힌다.
 * - `scale` 은 반드시 전 종류 공통값(`meshScaleOf(items)`) — 종류마다 다르면 면적 비교가 깨진다.
 * - 분모는 등록 수가 아니라 판정된 수(`total − missing`).
 * - 색은 토큰만(`--color-indicator-critical` · `--color-status-warning` · `--color-status-success` · `--color-text-disabled`).
 * - 누를 수 있다는 신호는 hover · focus 에만(`.wds-mesh-cluster-btn`). `interactive={false}` 면 disabled.
 * - 동작 줄이기 설정에서는 점 호흡 · 점등이 멈춘다(CSS).
 *
 * @example
 * ```tsx
 * <TargetMeshCluster item={{ short: "APM", label: "APM 애플리케이션", total: 24, warning: 3, critical: 2 }} scale={1} revealed interactive />
 * ```
 */
import type React from "react";
import { BLOB_H, MESH_DOT_R, TONE_FILL, dotsFor, targetMeshDots, type TargetMeshItem } from "./_targetMesh";

export type TargetMeshClusterProps = {
  /** 대상 종류 하나. */
  item: TargetMeshItem;
  /** 점 하나가 뜻하는 대상 수 — 전 종류 공통([[TargetMesh]] 가 `meshScaleOf` 로 정해 넘긴다). */
  scale: number;
  /** 켜졌는지(판정이 끝났는지). 꺼져 있으면 덩어리가 투명하고 6px 아래에 있다. */
  revealed: boolean;
  /** false 면 누를 수 없다(판정 중). */
  interactive: boolean;
  /** 군집을 누를 때. */
  onSelect?: (item: TargetMeshItem) => void;
};

export default function TargetMeshCluster({ item, scale, revealed, interactive, onSelect }: TargetMeshClusterProps) {
  const missing = item.missing ?? 0;
  const missingDots = dotsFor(missing, scale);
  const { dots, radius } = targetMeshDots(item, scale);
  /* 빠진 점은 바깥 테두리부터 비운다 — 덩어리가 가장자리부터 헐어 보이므로 «덜 찍혔다» 가
     한눈에 읽힌다. */
  const gapIdx = new Set(
    dots
      .map((d, i) => ({ i, depth: d.depth, tone: d.tone }))
      .filter((d) => d.tone === "normal")
      .sort((a, b) => b.depth - a.depth)
      .slice(0, missingDots)
      .map((d) => d.i),
  );
  const w = Math.ceil(radius * 2) + 10;
  const abn = item.warning + item.critical;
  const alertColor = TONE_FILL[item.critical > 0 ? "critical" : "warning"];

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onSelect?.(item)}
      className="wds-mesh-cluster-btn flex flex-col items-center gap-6px bg-transparent border-0"
      style={{ flex: "1 1 0", minWidth: 0, cursor: interactive && onSelect ? "pointer" : "default" }}
      title={`${item.label} ${item.total}개 · 위험 ${item.critical} · 경고 ${item.warning}${item.hint ? ` · ${item.hint}` : ""}`}
    >
      <svg
        width={w}
        height={BLOB_H}
        className="wds-mesh-cluster"
        style={{ opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(6px)" }}
        aria-hidden
      >
        <g transform={`translate(${w / 2} ${BLOB_H / 2})`}>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={MESH_DOT_R}
              fill={gapIdx.has(i) ? "none" : TONE_FILL[d.tone]}
              stroke={gapIdx.has(i) ? "var(--color-text-disabled)" : undefined}
              strokeWidth={gapIdx.has(i) ? 1 : undefined}
              className={d.tone === "normal" ? "wds-mesh-dot" : "wds-mesh-dot-alert"}
              style={
                {
                  // 중심에서 멀수록 옅게 → 덩어리 테두리가 흐려져 원반이 아니라 구름으로 읽힌다.
                  "--dot-o": (0.95 - d.depth * 0.4).toFixed(2),
                  "--dot-r": `${MESH_DOT_R}px`,
                  // 지연을 중심 거리로 주면 물결이 안에서 바깥으로 한 방향으로 지나간다.
                  animationDelay: `${(d.depth * 1.1).toFixed(2)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>
      </svg>

      <span className="flex items-center gap-4px min-w-0">
        {item.iconSrc && <img src={item.iconSrc} alt="" width={16} height={16} className="block shrink-0" />}
        <span
          className="text-sm truncate"
          style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-family-korean)" }}
        >
          {item.short}
        </span>
      </span>
      <span className="text-sm whitespace-nowrap" style={{ fontFamily: "var(--font-family-numeric)" }}>
        {abn > 0 && <strong style={{ color: alertColor }}>{abn}</strong>}
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {abn > 0 ? "/" : ""}
          {/* 분모는 등록 수가 아니라 판정된 수. */}
          {item.total - missing}
        </span>
      </span>
      {missing > 0 && (
        <span className="text-sm whitespace-nowrap" style={{ color: "var(--color-status-warning)", fontFamily: "var(--font-family-korean)" }}>
          수집 없음 <span style={{ fontFamily: "var(--font-family-numeric)" }}>{missing}</span>
        </span>
      )}
    </button>
  );
}
