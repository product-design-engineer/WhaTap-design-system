/**
 * ChartRadialBars — 고리형 막대: 원을 칸(부채꼴)으로 나누고 칸마다 안쪽에서 바깥으로 쌓이는 줄무늬 막대. Primitives layer.
 *
 * ## Purpose
 * 대상(에이전트 등) 여럿의 «지금 쌓인 양» 과 그 구성을 한 원 안에서 함께 보인다. 칸 하나 = 대상 하나, 막대 길이 = 양,
 * 막대 색 구간 = 구성(예: 정상 · 느림 · 매우 느림). 줄무늬는 양을 `levels` 단계로 묶어 이퀄라이저처럼 읽히게 한다.
 * 종전 [[ActiveTransactionArc]] 는 이 그림을 정적 이미지로 두어 **어떤 값이 와도 고리가 같았다**(색도 hex 라 다크에서
 * 바뀌지 않았다). 이제 고리는 데이터로 그린다.
 *
 * ## When to use
 * - [[ActiveTransactionArc]] 의 고리 — 칸 = 에이전트, 구간 = 응답 속도 등급(`--color-chart-speed-*`).
 * - 대상 수가 4~16 개이고 대상마다 2~3 구간으로 쌓인 양을 한눈에 비교할 때(활성 대상이 원 둘레에 고르게 놓인다).
 *
 * ## When NOT to use
 * - 구성 비율 하나(합 = 100%) → [[MiniDonutChart]].
 * - 대상이 많아 칸이 가늘어지는 경우(16 개 초과) · 값을 정확히 읽어야 하는 비교 → 가로 막대 [[BarList]] · [[ChartStackedColumn]].
 * - 대상 하나의 진행률 → [[UsageGauge]].
 *
 * ## Composition rules
 * - 칸을 가리키면 나머지 칸을 흐리고(0.32) [[ChartTooltip]](리프 1개 — 계층 «리프 1개 예외»)이 칸 이름 · 구간 값 · 합계를 보인다(patterns §26 «강조»). SVG `<title>` 은 쓰지 않는다.
 * - 칸은 12시에서 시계 방향으로 `sectors` 순서대로 놓인다. 칸이 비면(합 0) 바탕만 남는다 — «대상은 있고 지금 양이 없다».
 * - 구간은 `segments` 순서대로 안쪽부터 쌓인다. 0 보다 큰 구간은 최소 한 줄 — 작은 값도 사라지지 않는다. 한 칸의 줄 수는 `levels` 를 넘지 않는다.
 * - 칸의 줄 수 = 합 ÷ `max` × `levels`(반올림), 구간에는 최대 나머지로 나눈다. `max` 기본값은 가장 큰 칸의 합 — 여러 차트를 나란히 비교하려면 같은 `max` 를 준다.
 * - 색은 토큰만: 바탕 `--color-chart-radial-track` · 구분선 `--color-chart-radial-divider` · 가운데 `--color-card` · 막대는 받은 `color`.
 * - 가운데 구멍은 `children` 자리 — 합계 숫자 등을 둔다(글자 크기는 차트 폭을 따른다: 컨테이너 단위 `cqw`).
 * - `sweep` 은 «실시간» 장식(왼쪽 반원 호가 12초에 한 바퀴). 데이터가 아니다. 동작 줄이기 설정에서는 멈춘다(CSS).
 * - 정사각 상자를 채운다 — 크기는 부모가 정한다.
 *
 * ## Spec
 * | 항목 | 값 (viewBox 200 기준) |
 * |---|---|
 * | 바탕 원판 | 반지름 94 · 칠 `--color-chart-radial-track` · 테두리 1 `--color-chart-radial-divider` |
 * | 가운데 구멍 | 반지름 38 · 칠 `--color-card` · 테두리 1 divider |
 * | 막대 영역 | 반지름 40 ~ 88, `levels` 줄(기본 10) · 줄 사이 0.8 |
 * | 칸 | 360 ÷ 칸 수 · 칸 사이 구분선 1 divider · 막대는 칸 양끝에서 1.5° 안쪽 |
 * | sweep | 반지름 99 왼쪽 반원 · 굵기 2.7 · 위 `sweepColor` → 아래 투명 · 12s linear 회전 |
 * | 접근성 | `role="img"` · `aria-label`(기본: 칸 수와 합계) |
 *
 * @example
 * ```tsx
 * <ChartRadialBars
 *   sectors={agents.map((a) => ({ label: a.name, segments: [
 *     { value: a.normal, color: "var(--color-chart-speed-normal)" },
 *     { value: a.slow, color: "var(--color-chart-speed-slow)" },
 *     { value: a.verySlow, color: "var(--color-chart-speed-very-slow)" },
 *   ] }))}
 *   sweep
 * >
 *   <span>334</span>
 * </ChartRadialBars>
 * ```
 */
import { stripeCounts } from "./_stripes";
import { useId, useState, type ReactNode } from "react";
import ChartTooltip from "./ChartTooltip";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type ChartRadialSegment = {
  /** 양. 0 이면 그리지 않는다. */
  value: number;
  /** 마크 색 토큰(`var(--color-chart-speed-normal)` 등). hex 금지. */
  color: string;
  /** 구간 이름(툴팁 · 접근성). */
  label?: string;
};

export type ChartRadialSector = {
  /** 칸 이름(대상 이름). 툴팁에 쓴다. */
  label?: string;
  /** 안쪽부터 쌓이는 구간. */
  segments: ChartRadialSegment[];
};

export type ChartRadialBarsProps = {
  /** 칸들 — 12시부터 시계 방향. */
  sectors: ChartRadialSector[];
  /** 막대 끝 기준값. 기본: 가장 큰 칸의 합. */
  max?: number;
  /** 한 칸 막대의 최대 줄 수. 기본 10. */
  levels?: number;
  /** 실시간 장식 호(왼쪽 반원 회전). 기본 false. */
  sweep?: boolean;
  /** sweep 색. 기본 `var(--color-chart-speed-normal)`. */
  sweepColor?: string;
  /** 접근성 이름. 기본: 「고리형 막대 · 칸 N개 · 합계 M」. */
  ariaLabel?: string;
  /** 가운데 구멍에 둘 내용(합계 등). */
  children?: ReactNode;
};

const C = 100;
const R_DISC = 94;
const R_HOLE = 38;
const R_BAR_IN = 40;
const R_BAR_OUT = 88;
const STRIPE_GAP = 0.8;
const PAD_DEG = 1.5;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const pt = (r: number, deg: number) => `${(C + r * Math.cos(rad(deg))).toFixed(2)} ${(C + r * Math.sin(rad(deg))).toFixed(2)}`;

/** 반지름 r0~r1, 각도 a0~a1(12시 기준 시계 방향, 도) 고리 조각. */
function ringPath(r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${pt(r1, a0)} A ${r1} ${r1} 0 ${large} 1 ${pt(r1, a1)} L ${pt(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${pt(r0, a0)} Z`;
}

/** 칸 하나의 구간별 줄 수 — 계산은 내부 `_stripes`(직선 이퀄라이저 [[EqualizerChart]] 와 공유). 이름은 호환을 위해 유지. */
export const radialStripes = (segments: ChartRadialSegment[], max: number, levels: number): number[] =>
  stripeCounts(segments.map((s) => s.value), max, levels);

export default function ChartRadialBars({
  sectors,
  max,
  levels = 10,
  sweep = false,
  sweepColor = "var(--color-chart-speed-normal)",
  ariaLabel,
  children,
}: ChartRadialBarsProps) {
  const gid = useId().replace(/:/g, "");
  const sums = sectors.map((s) => s.segments.reduce((a, g) => a + Math.max(0, g.value), 0));
  const top = max ?? Math.max(1, ...sums);
  const n = Math.max(1, sectors.length);
  const span = 360 / n;
  const pitch = (R_BAR_OUT - R_BAR_IN) / levels;
  const total = sums.reduce((a, b) => a + b, 0);
  /* 가리킨 칸 — 나머지 칸을 흐리고 [[ChartTooltip]] 으로 이름 · 구간 값 · 합(patterns §26 «강조») */
  const [hover, setHover] = useState<number | null>(null);
  const tipAt = (i: number) => {
    const t = rad((i + 0.5) * span);
    return { x: ((C + R_BAR_OUT * Math.cos(t)) / 200) * 100, y: ((C + R_BAR_OUT * Math.sin(t)) / 200) * 100 };
  };

  return (
    <div className="relative w-full h-full" style={{ containerType: "inline-size" }}>
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={ariaLabel ?? `고리형 막대 · 칸 ${sectors.length}개 · 합계 ${total}`}
      >
        <circle cx={C} cy={C} r={R_DISC} style={{ fill: "var(--color-chart-radial-track)", stroke: "var(--color-chart-radial-divider)" }} strokeWidth={1} />
        {sectors.length > 1 &&
          sectors.map((_, i) => {
            const a = i * span;
            return (
              <line
                key={`d${i}`}
                x1={C + R_HOLE * Math.cos(rad(a))}
                y1={C + R_HOLE * Math.sin(rad(a))}
                x2={C + R_DISC * Math.cos(rad(a))}
                y2={C + R_DISC * Math.sin(rad(a))}
                style={{ stroke: "var(--color-chart-radial-divider)" }}
                strokeWidth={1}
              />
            );
          })}
        {sectors.map((s, i) => {
          const a0 = i * span + PAD_DEG;
          const a1 = (i + 1) * span - PAD_DEG;
          const stripes = radialStripes(s.segments, top, levels);
          let level = 0;
          return (
            <g
              key={`s${i}`}
              className={MARK_CLASS}
              opacity={hover != null && hover !== i ? DIM_OPACITY : 1}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* 칸 전체가 hover 를 받게 — 줄무늬 사이 틈에서 깜빡이지 않도록 투명 칸 */}
              <path d={ringPath(R_BAR_IN, R_BAR_OUT, a0, a1)} fill="transparent" />
              {s.segments.flatMap((g, k) =>
                Array.from({ length: stripes[k] }, (_, j) => {
                  const r0 = R_BAR_IN + (level + j) * pitch;
                  const path = ringPath(r0, r0 + pitch - STRIPE_GAP, a0, a1);
                  if (j === stripes[k] - 1) level += stripes[k];
                  return <path key={`${k}-${j}`} d={path} style={{ fill: g.color }} />;
                }),
              )}
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R_HOLE} style={{ fill: "var(--color-card)", stroke: "var(--color-chart-radial-divider)" }} strokeWidth={1} />
      </svg>
      {sweep && (
        <svg viewBox="0 0 200 200" className="wds-chart-radial-sweep absolute inset-0 w-full h-full pointer-events-none" aria-hidden style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id={`sw${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: sweepColor }} />
              <stop offset="1" style={{ stopColor: sweepColor, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={`M ${C} ${C + 99} A 99 99 0 0 1 ${C} ${C - 99}`} fill="none" stroke={`url(#sw${gid})`} strokeWidth={2.7} strokeLinecap="round" />
        </svg>
      )}
      {children != null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">{children}</div>
      )}
      {hover != null && sectors[hover] && (
        <ChartTooltip
          left={`${tipAt(hover).x}%`}
          top={`${tipAt(hover).y}%`}
          /* 원형 — 칸 바깥쪽으로 편다(안쪽으로 펴면 고리를 가린다) */
          flipX={tipAt(hover).x < 50}
          flipY={tipAt(hover).y < 50}
          title={sectors[hover].label}
          rows={[...sectors[hover].segments].reverse().map((g) => ({ label: g.label ?? "", value: g.value.toLocaleString("en-US"), color: g.color }))}
          footer={sectors[hover].segments.length > 1 ? `합계 ${sums[hover].toLocaleString("en-US")}` : undefined}
        />
      )}
    </div>
  );
}
