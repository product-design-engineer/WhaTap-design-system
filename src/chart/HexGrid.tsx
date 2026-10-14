import React, { type ReactNode } from "react";

/**
 * HexGrid — 리소스 맵 (헥사곤 그리드). GPU 디바이스 · 서버처럼 개별 장치를 한 칸씩 깐다.
 *
 * ## Purpose
 * 개별 장치(GPU 디바이스 · 서버 등)를 헥사곤으로 배치하여 상태(active · idle · warning · critical)를
 * 색상으로 시각화. 토폴로지 파악에 사용. 필요하면 장치 하나를 가리키고(hover 툴팁) · 고르고(`onSelect`) ·
 * 일부만 남겨 보이게(`highlightIds`) 할 수 있다.
 *
 * ## When to use
 * - GPU 대시보드에서 디바이스별 상태를 한눈에 볼 때
 * - 자원 맵(Resource Map) 시각화 · 서버 상태 맵(SMS 리소스 보드)
 * - 배너 · 칩이 가리키는 장치를 맵에서 찾아 보여 줄 때 → `highlightIds`
 * - 장치 하나를 눌러 그 장치의 상세 · 원인 진단으로 들어갈 때 → `onSelect` + `renderTooltip`
 *
 * ## When NOT to use
 * - 노드-엣지 관계가 필요 → [[TopologyCanvas]]
 * - 시계열 데이터 → [[MiniLineChart]]
 * - 장치 수백 개를 군집 단위로 요약 → [[AiTargetMesh]]
 * - 아이콘 · 텍스트에 붙는 설명 말풍선 → [[Tooltip]] (HexGrid 툴팁은 맵 안 헥사곤 전용)
 *
 * ## Composition rules
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 여백 · 「GPU Map」 제목 줄 · 범례를 뺀다). [[WidgetFrame]] 안에 넣을 때 쓴다.
 *   범례는 `HEX_GRID_LEGEND` 를 WidgetFrame `legend` 로 넘긴다(같은 색 토큰). 제목 · 메뉴도 WidgetFrame 이 맡는다(patterns §15).
 * - 개수를 범례에 붙일 때는 `hexGridLegend(items)` 를 WidgetFrame `legend` 로 넘긴다 → `Critical 3` 처럼
 *   라벨 뒤에 칸 수가 붙는다. 칠해진 색을 센다(톤이 0 개여도 줄은 남는다). 라벨은 `labels` 로 바꾼다.
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0). 툴팁 상자도 [[Tooltip]] 을 쓰지 않고 직접 그린다.
 * - 색은 chart/status 토큰만 사용. 툴팁 상자는 `bg-card` · `--color-border-default` · `--shadow-md` · 텍스트 토큰.
 * - SVG 기반. 헥사곤은 polygon. 툴팁은 SVG 와 **같은 좌표계**(viewBox → 픽셀 환산)로 hover 헥사곤에 붙는
 *   HTML overlay 다(patterns §5). `pointer-events: none` 이라 툴팁 안에 버튼을 넣지 않는다. 행동은 헥사곤 클릭으로.
 * - 상호작용은 **opt-in**. `onSelect` 나 `renderTooltip` 이 없으면 hover 흐림 · 포인터 · role 이 전혀 붙지 않는다(GPU 맵 기본은 정적).
 * - `onSelect` 를 주면 헥사곤이 버튼이 된다(`role="button"` · Tab 으로 닿고 Enter/Space 로 고른다). 이름은 `ariaLabel` → `label` → `id` 순.
 * - hover 중엔 나머지가 약하게(0.32) 흐려지고, `highlightIds` 가 있으면 밖의 칸은 강하게(0.18) 흐려진다.
 *   **하이라이트가 hover 보다 우선**한다. 가리키는 대상이 마우스 움직임에 흔들리면 안 된다.
 * - `label` 이 비면 글자를 그리지 않는다(서버 맵처럼 라벨 없는 맵).
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
 *
 * <WidgetFrame title="Server Status Map" legend={hexGridLegend(servers)}>
 *   <HexGrid
 *     frame={false}
 *     items={servers}
 *     highlightIds={bannerHosts}
 *     onSelect={(s) => openDiagnosis(s.id)}
 *     renderTooltip={(s) => <ServerTip id={s.id} />}
 *   />
 * </WidgetFrame>
 * ```
 */

export type HexTone = "active" | "idle" | "warning" | "critical";

export type HexItem = {
  id: string;
  /** 헥사곤 가운데 글자. 비우거나 없으면 글자를 그리지 않는다(서버 맵 등). */
  label?: string;
  tone: HexTone;
  /** 접근 이름(`onSelect` 가 있을 때 버튼 이름). 없으면 `label` → `id`. */
  ariaLabel?: string;
};

export type HexGridProps = {
  items: HexItem[];
  /** 한 행의 최대 헥사곤 수 (기본 6) */
  columns?: number;
  /** 헥사곤 반지름 (기본 24) */
  radius?: number;
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄 · 범례)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
  /**
   * 헥사곤을 고를 때. 주면 헥사곤이 버튼이 된다(포인터 · `role="button"` · Tab · Enter/Space).
   * 없으면 포인터 · role 변화 없음.
   */
  onSelect?: (item: HexItem) => void;
  /**
   * 주면 이 id 들만 또렷하게 남기고 나머지를 강하게(0.18) 흐린다. hover 흐림보다 우선.
   * `null` · 생략이면 하이라이트 없음.
   */
  highlightIds?: ReadonlySet<string> | readonly string[] | null;
  /**
   * hover · 키보드 포커스한 헥사곤에 붙는 툴팁 내용. 상자(표면 · 테두리 · 그림자)는 HexGrid 가 그린다.
   * `pointer-events: none` 이라 툴팁 안에 버튼을 넣지 않는다.
   */
  renderTooltip?: (item: HexItem) => ReactNode;
};

const TONE_FILL: Record<HexTone, string> = {
  active: "var(--color-chart-series-1)",
  idle: "var(--color-surface-200)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
};

/** 껍데기를 끈 HexGrid 의 범례 — [[WidgetFrame]] `legend` 로 넘긴다. 색은 헥사곤과 같은 토큰. */
export const HEX_GRID_LEGEND = [
  { label: "Active", color: TONE_FILL.active },
  { label: "Idle", color: TONE_FILL.idle },
  { label: "Warning", color: TONE_FILL.warning },
  { label: "Critical", color: TONE_FILL.critical },
];

const LEGEND_TONES: HexTone[] = ["active", "idle", "warning", "critical"];

/**
 * 칸 수를 붙인 범례. [[WidgetFrame]] `legend` 로 넘긴다(`Critical 3`). 순서 · 색은 `HEX_GRID_LEGEND` 와 같다.
 * 칠해진 톤을 센다. 0 개인 톤도 줄은 남긴다(범례 자리가 데이터마다 흔들리지 않게).
 * `labels` 로 톤 이름을 바꾼다(예: `{ active: "정상", idle: "비활성" }`).
 */
export function hexGridLegend(
  items: readonly Pick<HexItem, "tone">[],
  labels?: Partial<Record<HexTone, string>>,
): { label: string; color: string }[] {
  const counts: Record<HexTone, number> = { active: 0, idle: 0, warning: 0, critical: 0 };
  for (const it of items) counts[it.tone]++;
  return LEGEND_TONES.map((tone, i) => ({
    label: `${labels?.[tone] ?? HEX_GRID_LEGEND[i].label} ${counts[tone]}`,
    color: TONE_FILL[tone],
  }));
}

/** hover 중 나머지 칸 · 하이라이트 밖 칸의 불투명도. */
const HOVER_DIM_OPACITY = 0.32;
const HIGHLIGHT_DIM_OPACITY = 0.18;

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
  frame = true,
  onSelect,
  highlightIds,
  renderTooltip,
}: HexGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);
  /** hover · 포커스 중인 칸. 상호작용이 켜졌을 때만 쓴다. */
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [focusRingId, setFocusRingId] = React.useState<string | null>(null);
  const interactive = !!onSelect || !!renderTooltip;
  const highlightSet = React.useMemo<ReadonlySet<string> | null>(() => {
    if (!highlightIds) return null;
    return highlightIds instanceof Set ? highlightIds : new Set(highlightIds as readonly string[]);
  }, [highlightIds]);

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

  /** 칸 중심 좌표(viewBox 단위). 툴팁을 같은 좌표계에 붙이려고 렌더와 같은 식으로 구한다. */
  const positions = new Map<string, { x: number; y: number }>();
  rowItems.forEach((row, ri) => {
    const oddOffset = ri % 2 === 1 ? (hexW + gap) / 2 : 0;
    const centerOffset = ri === rowItems.length - 1 ? lastRowShift : 0;
    const y = ri * (hexH * 0.75 + gap) + hexH / 2;
    row.forEach((item, ci) => positions.set(item.id, { x: ci * (hexW + gap) + radius + oddOffset + centerOffset, y }));
  });

  return (
    <div className={frame ? "flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px h-full" : "flex flex-col h-full min-w-0"}>
      {frame && (
      <div className="flex items-center justify-between mb-4px shrink-0">
        <span className="text-md font-medium text-secondary">GPU Map</span>
        {/* 범례는 헥사곤이 쓰는 네 톤을 다 말한다. 종전엔 Active · Idle 둘뿐이라 주황 · 빨강이 범례에 없었다. */}
        <div className="flex items-center gap-8px">
          {HEX_GRID_LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-4px">
              <div className="rounded-2px" style={{ width: 8, height: 8, background: l.color }} />
              <span className="text-sm text-tertiary">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 상호작용이 켜지면 툴팁이 칸 밖으로 잘리지 않게 overflow 를 연다(SVG 는 100% 라 넘치지 않는다). */}
      <div ref={containerRef} className={`relative flex-1 min-h-0 flex items-center justify-center${interactive ? "" : " overflow-hidden"}`}>
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

          {rowItems.map((row) => {
            return row.map((item) => {
              const { x, y } = positions.get(item.id)!;
              const isActive = item.tone === "active";
              const gradId = isActive ? "hex-grad-active" : item.tone === "idle" ? "hex-grad-idle" : undefined;
              const outOfHighlight = !!highlightSet && !highlightSet.has(item.id);
              const hoverDim = interactive && activeId !== null && activeId !== item.id;
              const opacity = outOfHighlight ? HIGHLIGHT_DIM_OPACITY : hoverDim ? HOVER_DIM_OPACITY : 1;
              const dimmable = interactive || !!highlightSet;
              const name = item.ariaLabel ?? (item.label || item.id);
              return (
                <g
                  key={item.id}
                  filter="url(#hex-shadow)"
                  opacity={dimmable ? opacity : undefined}
                  style={
                    dimmable
                      ? { transition: "opacity 120ms ease", cursor: onSelect ? "pointer" : undefined, outline: interactive ? "none" : undefined }
                      : undefined
                  }
                  role={onSelect ? "button" : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-label={onSelect ? name : undefined}
                  onMouseEnter={interactive ? () => setActiveId(item.id) : undefined}
                  onMouseLeave={interactive ? () => setActiveId((cur) => (cur === item.id ? null : cur)) : undefined}
                  onFocus={
                    interactive
                      ? (e) => {
                          setActiveId(item.id);
                          if (e.currentTarget.matches(":focus-visible")) setFocusRingId(item.id);
                        }
                      : undefined
                  }
                  onBlur={
                    interactive
                      ? () => {
                          setActiveId((cur) => (cur === item.id ? null : cur));
                          setFocusRingId((cur) => (cur === item.id ? null : cur));
                        }
                      : undefined
                  }
                  onClick={onSelect ? () => onSelect(item) : undefined}
                  onKeyDown={
                    onSelect
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(item);
                          }
                        }
                      : undefined
                  }
                >
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
                  {/* 키보드 포커스 링. 컨트롤의 focus 는 ring(브랜드 파랑). SVG g 는 outline 이 고르지 않아 외곽선으로 그린다. */}
                  {focusRingId === item.id && (
                    <polygon points={hexPoints(x, y, radius + 1)} fill="none" stroke="var(--color-brand-blue)" strokeWidth="2" />
                  )}
                  {item.label ? (
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
                  ) : null}
                </g>
              );
            });
          })}
        </svg>
        {renderTooltip && activeId !== null && size && (() => {
          const pos = positions.get(activeId);
          const item = items.find((it) => it.id === activeId);
          if (!pos || !item) return null;
          /* SVG 와 같은 좌표계. viewBox(meet) 를 컨테이너 픽셀로 환산한다(patterns §5). */
          const vbW = totalW + pad * 2;
          const vbH = totalH + pad * 2;
          const scale = Math.min(size.w / vbW, size.h / vbH);
          const ox = (size.w - vbW * scale) / 2;
          const oy = (size.h - vbH * scale) / 2;
          const px = ox + (pos.x + pad) * scale;
          const py = oy + (pos.y + pad) * scale;
          const off = radius * scale * 0.5;
          /* 칸 중심이 오른쪽 · 아래 절반이면 반대쪽으로 편다. 맵 밖으로 덜 나가게. */
          const flipX = px > size.w / 2;
          const flipY = py > size.h / 2;
          return (
            <div
              role="tooltip"
              className="absolute z-10 pointer-events-none bg-card border border-color-var-color-border-default rounded-6px px-12px py-8px shadow-md text-sm text-primary whitespace-nowrap"
              style={{
                left: flipX ? px - off : px + off,
                top: flipY ? py - off : py + off,
                transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
                fontFamily: "var(--font-family-korean)",
              }}
            >
              {renderTooltip(item)}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
