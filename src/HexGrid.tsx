import React from "react";

/**
 * HexGrid — GPU 리소스 맵 (헥사곤 그리드).
 *
 * ## Purpose
 * GPU Map처럼 개별 GPU 디바이스를 헥사곤으로 배치하여
 * Active/Idle 상태를 색상으로 시각화. 토폴로지 파악에 사용.
 *
 * ## When to use
 * - GPU 대시보드에서 디바이스별 상태를 한눈에 볼 때
 * - 자원 맵(Resource Map) 시각화
 *
 * ## When NOT to use
 * - 노드-엣지 관계가 필요 → [[TopologyCanvas]]
 * - 시계열 데이터 → [[MiniLineChart]]
 *
 * ## Composition rules
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 색은 chart/status 토큰만 사용
 * - SVG 기반 — 헥사곤은 polygon, 라벨은 HTML overlay
 *
 * @example
 * ```tsx
 * <HexGrid
 *   items={[
 *     { id: "gpu-0", label: "M", tone: "active" },
 *     { id: "gpu-1", label: "P", tone: "idle" },
 *   ]}
 *   columns={6}
 * />
 * ```
 */

export type HexTone = "active" | "idle" | "warning" | "critical";

export type HexItem = {
  id: string;
  label: string;
  tone: HexTone;
};

export type HexGridProps = {
  items: HexItem[];
  /** 한 행의 최대 헥사곤 수 (기본 6) */
  columns?: number;
  /** 헥사곤 반지름 (기본 24) */
  radius?: number;
};

const TONE_FILL: Record<HexTone, string> = {
  active: "var(--color-chart-series-1)",
  idle: "var(--color-surface-200)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
};

const TONE_TEXT: Record<HexTone, string> = {
  active: "var(--color-text-inverse)",
  idle: "var(--color-text-tertiary)",
  warning: "var(--color-text-inverse)",
  critical: "var(--color-text-inverse)",
};

/** flat-top 헥사곤 꼭짓점 */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

export default function HexGrid({
  items,
  columns = 6,
  radius: _radius = 24,
}: HexGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 컨테이너 비율에 맞는 최적 columns 계산
  const gap = 6; // 유닛 간 여백
  const sqrt3 = Math.sqrt(3);

  function calcRadius(cols: number, rows: number, w: number, h: number) {
    // 가로: (cols 개 헥사곤 * 지름) + (cols-1 개 gap) + 오프셋 행 반칸
    const rW = (w - gap * cols) / (cols * 2 + 1);
    // 세로: row 간 0.75*hexH 간격 + gap
    const rH = (h - gap * rows) / (rows * sqrt3 * 0.75 + sqrt3 * 0.25);
    return Math.min(rW, rH);
  }

  let cols = columns;
  if (size) {
    // columns ± 2 범위에서 radius가 가장 큰(=공간을 가장 잘 채우는) 배치를 선택
    let bestR = 0;
    for (let c = Math.max(3, columns - 2); c <= columns + 2; c++) {
      const r = Math.ceil(items.length / c);
      const rr = calcRadius(c, r, size.w, size.h);
      if (rr > bestR) { bestR = rr; cols = c; }
    }
  }

  const rowItems: HexItem[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rowItems.push(items.slice(i, i + cols));
  }
  const rowCount = rowItems.length;

  let radius = _radius;
  if (size) {
    radius = Math.max(10, Math.min(Math.floor(calcRadius(cols, rowCount, size.w, size.h)), 48));
  }

  const hexW = radius * 2;
  const hexH = radius * Math.sqrt(3);

  const totalW = cols * (hexW + gap) - gap + radius;
  const totalH = rowCount * (hexH * 0.75 + gap) + hexH * 0.25;
  const pad = 4;

  /* 마지막 행이 cols 보다 적을 때 중앙 정렬 오프셋 */
  const lastRowLen = rowItems[rowItems.length - 1]?.length ?? 0;
  const lastRowShift = lastRowLen < cols ? ((cols - lastRowLen) * (hexW + gap)) / 2 : 0;

  return (
    <div className="flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px h-full">
      <div className="flex items-center justify-between mb-4px shrink-0">
        <span className="text-md font-medium text-secondary">GPU Map</span>
        <div className="flex items-center gap-8px">
          <div className="flex items-center gap-4px">
            <div className="rounded-2px" style={{ width: 8, height: 8, background: TONE_FILL.active }} />
            <span className="text-sm text-tertiary">Active</span>
          </div>
          <div className="flex items-center gap-4px">
            <div className="rounded-2px" style={{ width: 8, height: 8, background: TONE_FILL.idle }} />
            <span className="text-sm text-tertiary">Idle</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`${-pad} ${-pad} ${totalW + pad * 2} ${totalH + pad * 2}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Active — 중심이 밝은 radial gradient */}
            <radialGradient id="hex-grad-active" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="var(--color-chart-series-1)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-chart-series-1)" stopOpacity="0.75" />
            </radialGradient>
            {/* Idle — 은은한 입체감 */}
            <radialGradient id="hex-grad-idle" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="var(--color-surface-200)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-surface-200)" stopOpacity="0.8" />
            </radialGradient>
            {/* Inner glow — active 유닛 안쪽 빛 번짐 */}
            <filter id="hex-glow-active" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feComposite in="blur" in2="SourceGraphic" operator="atop" />
            </filter>
            {/* Drop shadow */}
            <filter id="hex-shadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="var(--color-shadow-flood)" floodOpacity="0.12" />
            </filter>
          </defs>

          {rowItems.map((row, ri) => {
            const isLastRow = ri === rowItems.length - 1;
            const oddOffset = ri % 2 === 1 ? (hexW + gap) / 2 : 0;
            const centerOffset = isLastRow ? lastRowShift : 0;
            const y = ri * (hexH * 0.75 + gap) + hexH / 2;
            return row.map((item, ci) => {
              const x = ci * (hexW + gap) + radius + oddOffset + centerOffset;
              const isActive = item.tone === "active";
              const gradId = isActive ? "hex-grad-active" : item.tone === "idle" ? "hex-grad-idle" : undefined;
              return (
                <g key={item.id} filter="url(#hex-shadow)">
                  <polygon
                    points={hexPoints(x, y, radius - 1)}
                    fill={gradId ? `url(#${gradId})` : TONE_FILL[item.tone]}
                    data-ds-policy-ok={isActive ? "컬러 위 고정 흰색 전경" : undefined}
                    // raw-color-ok: active 유닛은 브랜드 그라데이션 채움 — 그 위 외곽선은 테마와 무관한 흰색 전경.
                    stroke={isActive ? "rgba(255,255,255,0.25)" : "var(--color-border-default)"}
                    strokeWidth="1"
                  />
                  {/* Active inner glow overlay */}
                  {isActive && (
                    <polygon
                      points={hexPoints(x, y, radius - 4)}
                      fill="none"
                      data-ds-policy-ok="컬러 위 고정 흰색 전경"
                      // raw-color-ok: active 유닛 안쪽 글로우 — 브랜드 그라데이션 채움 위 흰색 전경.
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="2"
                      filter="url(#hex-glow-active)"
                    />
                  )}
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={TONE_TEXT[item.tone]}
                    fontSize="11px"
                    fontWeight="600"
                    fontFamily="var(--font-family-korean)"
                  >
                    {item.label}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
}
