/**
 * ActiveTransactionArc — APM 액티브 트랜잭션 Arc Equalizer 카드 본문.
 *
 * ## Purpose
 * APM 대시보드 · Flex 보드 등에서 쓰는 액티브 트랜잭션 도넛 시각화.
 * 동심 arc 세그먼트(normal/slow/very slow)와 회전 오버레이로 구성된다.
 * 3-column 레이아웃: 좌측 Max TX + Elapsed 범례 / 중앙 Arc / 우측 Agent 통계.
 *
 * ## When to use
 * - APM 대시보드 "액티브 트랜잭션" 위젯 본문.
 * - Flex 보드 위젯, 히어로 iframe 에셋 등 동일 시각화가 필요한 곳.
 *
 * ## When NOT to use
 * - 스피드 차트 (bullet flow) → [[ActiveTransactionSpeedWidget]].
 * - 범용 도넛 → [[MiniDonutChart]].
 *
 * ## Composition rules
 * - 위젯 chrome(CardChrome, FlexBoardWidget 등)은 소비자가 감싼다.
 * - 이 컴포넌트는 본문만 렌더한다 — `h-full` 부모 안에서 채워진다.
 * - 회전 오버레이는 12s linear infinite.
 * - 가운데 Total TX 는 `total` 값을 그린다. 원판(인라인 SVG, 색은 속도 토큰)에는 고리만 있다 — 종전엔 「334」 가 그림에 박혀 어느 화면이든 같은 숫자였다.
 * - `frame={false}` 면 바깥 여백(좌우 · 아래 8px)과 왼쪽 아래 Elapsed 범례를 빼고, **아크 왼쪽 · 값 오른쪽 한 열**(Max TX 「N초」 + 이름 ·
 *   Agent 활성 · 비활성)로 다시 놓는다. 네 귀퉁이에 흩어 두지 않는다. [[WidgetFrame]] 안에 넣을 때 쓴다 — 여백은
 *   WidgetFrame 이 갖고, 범례는 `SPEED_LEGEND` 를 WidgetFrame `legend` 로 넘겨 본문 오른쪽 위에 세운다(patterns §15).
 *   같은 속도 구분을 쓰는 [[ScatterHeatmap]] 칸도 같은 상수를 쓴다 — 낱말이 칸마다 달라지지 않게.
 *
 * @example
 * ```tsx
 * <ActiveTransactionArc />
 * <ActiveTransactionArc maxTx={{ name: "api-gw-01", value: 42 }} agent={{ active: 12, inactive: 3 }} />
 * ```
 */

import { useId } from "react";
import { ARC_DISC, ARC_INNER, ARC_OUTER, ARC_SEGMENTS, ARC_SPOKES, ARC_SWEEP, ARC_VIEWBOX } from "./arcEqualizerShape";

export type ActiveTransactionArcProps = {
  /** Max TX 이름. */
  maxTx?: { name: string; value: number };
  /** Agent 통계. */
  agent?: { active: number; inactive: number };
  /** 가운데 Total TX. 그림에 박힌 글자가 아니라 이 값을 그린다. 기본 334. */
  total?: number;
  /**
   * 자기 바깥 여백(좌우 · 아래 8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

/**
 * 응답 속도 구분 범례 — Normal(0~3초) · Slow(3~8초) · Very Slow(8초 이상).
 * [[WidgetFrame]] `legend` 로 넘긴다. [[ActiveTransactionArc]] · [[ScatterHeatmap]] 칸이 함께 쓴다.
 */
export const SPEED_LEGEND = [
  { label: "Normal", color: "var(--color-chart-speed-normal)" },
  { label: "Slow", color: "var(--color-chart-speed-slow)" },
  { label: "Very Slow", color: "var(--color-chart-speed-very-slow)" },
];

export default function ActiveTransactionArc({
  maxTx = { name: "TC-1-57-8094", value: 30 },
  agent = { active: 7, inactive: 1 },
  total = 334,
  frame = true,
}: ActiveTransactionArcProps) {
  /* 칸 안(frame=false) — 아크 왼쪽, 값 오른쪽 한 열(위에서 아래로 Max TX · Agent). 네 귀퉁이에 흩어 두지 않는다.
     Total 은 아크 가운데 하나만 — 같은 값을 두 번 쓰지 않는다. 범례는 WidgetFrame legend(SPEED_LEGEND). */
  if (!frame) {
    const LABEL = "text-sm text-tertiary leading-none";
    const NUM = { fontFamily: "var(--font-family-numeric)" } as const;
    return (
      <div className="flex h-full items-center min-h-0 w-full" style={{ gap: 16 }}>
        <div className="relative h-full shrink-0" style={{ aspectRatio: "1 / 1", maxWidth: "60%" }}>
          <ArcEqualizer total={total} />
        </div>
        <dl className="flex flex-col justify-center min-w-0 flex-1" style={{ gap: 12, margin: 0 }}>
          <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
            <dt className={LABEL} style={NUM}>Max TX</dt>
            <dd className="flex items-baseline text-primary leading-none" style={{ ...NUM, margin: 0, gap: 2 }}>
              <span className="text-2xl" style={{ fontWeight: "var(--font-weight-medium)" }}>{maxTx.value}</span>
              <span className="text-sm text-tertiary">초</span>
            </dd>
            <dd className="text-sm text-secondary leading-tight truncate" title={maxTx.name} style={{ ...NUM, margin: 0 }}>{maxTx.name}</dd>
          </div>
          <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
            <dt className={LABEL} style={NUM}>Agent</dt>
            <dd className="flex items-baseline text-primary leading-none whitespace-nowrap" style={{ ...NUM, margin: 0, gap: 6 }}>
              <span className="text-sm text-tertiary">활성</span>
              <span className="text-2xl" style={{ fontWeight: "var(--font-weight-medium)" }}>{agent.active}</span>
              <span className="text-sm text-tertiary">· 비활성</span>
              <span className="text-2xl" style={{ fontWeight: "var(--font-weight-medium)" }}>{agent.inactive}</span>
            </dd>
          </div>
        </dl>
      </div>
    );
  }
  return (
    <div className={`flex h-full items-stretch min-h-0 w-full gap-6px${frame ? " px-8px pb-8px" : ""}`}>
      {/* left: Max TX + Elapsed legend */}
      <div className="flex flex-col shrink-0 min-w-0 justify-between" style={{ width: 72 }}>
        <div className="flex flex-col min-w-0">
          <p className="text-sm text-tertiary leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Max TX</p>
          <p className="text-sm text-primary mt-4px leading-tight truncate" title={maxTx.name} style={{ fontFamily: "var(--font-family-numeric)" }}>{maxTx.name}</p>
          <p className="text-2xl text-primary mt-4px leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{maxTx.value}</p>
        </div>
        {/* 범례 — frame 일 때만. 칸 안(frame=false)에서는 WidgetFrame legend 로 본문 오른쪽 위에 선다(SPEED_LEGEND). */}
        {frame && (
          <div className="flex flex-col gap-3px">
            <p className="text-sm text-tertiary leading-snug" style={{ fontFamily: "var(--font-family-numeric)" }}>Elapsed</p>
            <LegendDot color="var(--color-chart-speed-very-slow)" label="very slow" />
            <LegendDot color="var(--color-chart-speed-slow)" label="slow" />
            <LegendDot color="var(--color-chart-speed-normal)" label="normal" />
          </div>
        )}
      </div>
      {/* center: arc chart */}
      <div
        className="flex flex-1 items-center justify-center min-w-0 min-h-0 relative"
        style={{ containerType: "size" }}
      >
        <div
          className="relative"
          style={{
            width: "min(100cqw, 100cqh)",
            height: "min(100cqw, 100cqh)",
            aspectRatio: "1 / 1",
          }}
        >
          <ArcEqualizer total={total} />
        </div>
      </div>
      {/* right: Agent stats */}
      <div className="flex flex-col shrink-0 justify-between" style={{ width: 44 }}>
        <div className="flex flex-col">
          <p className="text-sm text-tertiary leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Agent</p>
          <p className="text-sm text-primary mt-4px leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Active</p>
          <p className="text-2xl text-primary text-right mt-2px leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{agent.active}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-primary leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Inactive</p>
          <p className="text-2xl text-primary text-right mt-2px leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{agent.inactive}</p>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-4px min-w-0">
      <div className="rounded-2px shrink-0" style={{ width: 10, height: 10, background: color }} />
      <span className="text-sm text-primary leading-none truncate" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}>{label}</span>
    </div>
  );
}

/** 원판 색 — 속도 등급 토큰. 원판 · 바큇살은 normal 을 옅게 깔아 테마를 따른다(다크에서 밝은 원판이 남지 않게). */
const SPEED = ["var(--color-chart-speed-normal)", "var(--color-chart-speed-slow)", "var(--color-chart-speed-very-slow)"] as const;
/** 종전 그림의 옅은 원판(normal 18%) · 선(normal 40%)과 같은 농도. */
const DISC_OPACITY = 0.18;
const LINE_OPACITY = 0.4;

function ArcEqualizer({ total }: { total: number }) {
  const sweepId = `wds-ark-sweep-${useId().replace(/:/g, "")}`;
  return (
    /* 가운데 글자는 그림에 박지 않는다 — 원판은 모양만, Total 은 이 값을 그린다. 크기는 아크 폭을 따른다(cqw).
       원판은 인라인 SVG 로 그리고 색은 토큰이다 — <img> 로 띄우면 색이 그림에 박혀 다크를 따라오지 않는다. */
    <div className="relative w-full h-full" style={{ containerType: "inline-size" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${ARC_VIEWBOX} ${ARC_VIEWBOX}`} fill="none" role="img" aria-label="Active Transaction Chart">
        <path d={ARC_DISC} fill={SPEED[0]} fillOpacity={DISC_OPACITY} stroke={SPEED[0]} strokeOpacity={LINE_OPACITY} />
        {ARC_SEGMENTS.map(([speed, d], i) => (
          <path key={i} d={d} fillRule="evenodd" clipRule="evenodd" fill={SPEED[speed]} stroke="var(--color-card)" strokeOpacity={0.1} />
        ))}
        {ARC_SPOKES.map((d, i) => (
          <path key={i} d={d} stroke={SPEED[0]} strokeOpacity={LINE_OPACITY} />
        ))}
        <circle {...ARC_INNER} fill="var(--color-card)" stroke={SPEED[0]} strokeOpacity={LINE_OPACITY} />
        <circle {...ARC_OUTER} stroke={SPEED[0]} strokeOpacity={LINE_OPACITY} />
      </svg>
      <div
        className="absolute inset-0"
        style={{ animation: "wds-ark-spin 12s linear infinite", transformOrigin: "50% 50%" }}
      >
        <svg className="absolute left-0 top-0" viewBox="0 0 113 223" fill="none" aria-hidden="true" style={{ width: "50.67%", height: "100%" }}>
          <defs>
            <linearGradient id={sweepId} x1="56.5" y1="1.5" x2="56.5" y2="221.5" gradientUnits="userSpaceOnUse">
              <stop stopColor={SPEED[0]} />
              <stop offset="1" stopColor="var(--color-card)" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <path d={ARC_SWEEP} stroke={`url(#${sweepId})`} strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ fontFamily: "var(--font-family-numeric)" }}>
        <span className="text-tertiary leading-none" style={{ fontSize: "5.5cqw" }}>Total TX</span>
        <span className="text-primary leading-none" style={{ fontSize: "15cqw", fontWeight: "var(--font-weight-medium)", marginTop: "1.5cqw" }}>{total}</span>
      </div>
      <style>{`@keyframes wds-ark-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
