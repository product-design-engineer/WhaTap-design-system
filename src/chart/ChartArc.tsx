/**
 * ChartArc — 호(arc) 트랙 · 채움 · 바깥 임계 띠. 호 게이지와 방사형 셀이 쓰는 마크 하나. Primitives layer.
 *
 * ## Purpose
 * «범위 안 얼마나 찼나» 를 원호 길이로 그린다. 직선 막대([[UsageGauge]])와 같은 뜻을 둥근 칸에서 말할 때 쓴다 — 대시보드 중앙 게이지,
 * 다중 지표 셀의 링. 호의 시작 · 끝 각도와 굵기를 한 곳이 정해, 호 게이지마다 각도가 달라지지 않게 한다.
 *
 * ## When to use
 * - [[ArcGauge]] 의 호. 0~1 비율 하나를 원호 길이로.
 * - 임계 구간을 호 바깥 얇은 띠로 함께 보일 때(`bands`).
 *
 * ## When NOT to use
 * - 직선 막대 → [[UsageGauge]] · [[RangeGauge]].
 * - 칸으로 끊어 쌓는 고리 → [[ChartRadialBars]].
 * - 합 100% 구성 → [[MiniDonutChart]].
 *
 * ## Composition rules
 * - 각도는 12시 기준 시계 방향 도. 기본 −120° ~ +120°(240°) — 아래가 열려 가운데 값 · 양 끝 글자 자리가 생긴다.
 * - 트랙 `--color-surface-100`(직선 게이지와 같다) · 채움 `color` · 끝 둥글게.
 * - 임계 띠(`bands`)는 호 바깥 3px 간격 · 굵기 3. 색은 상태 토큰. 값과 따로 «어디서부터 위험인가» 를 보인다.
 * - 크기는 `size`(정사각 px). 가운데는 비어 있다 — 글자는 담는 쪽이 얹는다(`children`).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 각도 | `start` −120 ~ `end` 120(도, 12시 기준 시계 방향) |
 * | 굵기 | `thickness` 10 · 끝 둥글게 |
 * | 트랙 | `--color-surface-100` |
 * | 임계 띠 | 호 바깥 3px · 굵기 3 · 끝 각지게 |
 * | 접근성 | 장식(`aria-hidden`) — 값은 담는 쪽 글자가 말한다 |
 *
 * @example
 * ```tsx
 * <ChartArc ratio={0.72} color="var(--color-brand-blue)" bands={[{ from: 0.8, to: 0.95, color: "var(--color-status-warning)" }]} />
 * ```
 */
import type { ReactNode } from "react";

export type ChartArcBand = {
  /** 시작 비율(0~1). */
  from: number;
  /** 끝 비율(0~1). */
  to: number;
  /** 띠 색 — 상태 토큰. */
  color: string;
};

export type ChartArcProps = {
  /** 채움 비율 0~1(밖은 자른다). */
  ratio: number;
  /** 채움 색 토큰. hex 금지. */
  color: string;
  /** 정사각 크기(px). 기본 140. */
  size?: number;
  /** 호 굵기(px). 기본 10. */
  thickness?: number;
  /** 시작 각도(도, 12시 기준 시계 방향). 기본 −120. */
  start?: number;
  /** 끝 각도. 기본 120. */
  end?: number;
  /** 바깥 임계 띠. */
  bands?: ReadonlyArray<ChartArcBand>;
  /** 가운데에 얹는 내용(값 · 라벨). */
  children?: ReactNode;
};

const BAND_GAP = 3;
const BAND_W = 3;

function arc(c: number, r: number, a0: number, a1: number) {
  const p = (deg: number) => {
    const t = ((deg - 90) * Math.PI) / 180;
    return `${(c + r * Math.cos(t)).toFixed(2)} ${(c + r * Math.sin(t)).toFixed(2)}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)}`;
}

export default function ChartArc({ ratio, color, size = 140, thickness = 10, start = -120, end = 120, bands = [], children }: ChartArcProps) {
  const c = size / 2;
  const r = c - BAND_GAP - BAND_W - thickness / 2;
  const rb = r + thickness / 2 + BAND_GAP + BAND_W / 2;
  const at = (k: number) => start + (end - start) * Math.min(1, Math.max(0, k));
  const fill = Math.min(1, Math.max(0, ratio));
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg aria-hidden className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={arc(c, r, start, end)} fill="none" stroke="var(--color-surface-100)" strokeWidth={thickness} strokeLinecap="round" />
        {fill > 0 && <path d={arc(c, r, start, at(fill))} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" />}
        {bands.map((b, i) =>
          b.to > b.from ? <path key={i} d={arc(c, rb, at(b.from), at(b.to))} fill="none" stroke={b.color} strokeWidth={BAND_W} /> : null,
        )}
      </svg>
      {children != null && <span className="relative flex flex-col items-center">{children}</span>}
    </span>
  );
}
