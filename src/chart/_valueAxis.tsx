/**
 * chart/_valueAxis — 플롯의 값축(Y) · 가로 격자 · 축선을 그리는 **내부 공통 부품**.
 *
 * ## Purpose
 * 선 · 막대 · 예측 차트가 각자 그리던 값축을 한 곳으로 모은다(patterns §26 공통 부품 1순위).
 * 깔끔한 최대값 계산 · 눈금 셋(최대 · 절반 · 0) · 단위 접미사 · 점선 격자 · 축선이 차트마다
 * 4벌로 복제돼 있었고, 격자는 이미 차트마다 색(불투명도)이 갈려 있었다. 벌이 여럿이면 한 벌을
 * 고칠 때 나머지와 어긋난다.
 *
 * ## When to use
 * - `src/chart/` 안에서 Y 값축을 가진 직교 좌표 차트를 만들 때 — 눈금 · 격자 · 축선은 여기서 가져다 쓴다.
 * - 기존 차트의 값축을 고칠 때 — 차트 파일이 아니라 이 파일을 고친다.
 *
 * ## When NOT to use
 * - 카탈로그 밖 내부 모듈이다. `index.ts` 로 내보내지 않는다 — 소비자는 차트 컴포넌트를 쓴다.
 * - 값축이 없는 차트(도넛 · 아크 · 헥사 · 히트맵 격자) — 그리지 않는다.
 * - [[ScatterHeatmap]] 의 10칸 격자는 판정 분포용 구조라 아직 이 부품으로 옮기지 않았다. 색만 같다.
 *
 * ## Composition rules
 * - 레이어 순서는 차트가 정한다: `ValueGrid`(마크 아래) → 마크 → `PlotAxisLines`(마크 위, 막대에 묻히지 않게) → `ValueAxisLabels`(글자 겹).
 * - 세 부품 모두 `position: relative` 인 플롯 상자 안에 absolute 로 선다. 가로 시작은 `--wds-widget-axis-gutter`(§15),
 *   세로 위치는 차트가 `yAt(ratio)` 로 준다 — ratio 는 **위에서부터** 0~1. 차트마다 좌표 계산(px 고정 · calc)이 달라도 부품은 그대로다.
 * - 축 제목은 그리지 않는다. 단위는 눈금 접미사가 맡는다(§26 결정, 2026-10-21).
 * - 격자는 `--color-border-soft` 점선 하나. 불투명도로 색을 흉내 내지 않는다(§26 결정, 2026-10-21).
 */
import type { CSSProperties } from "react";

/** 플롯 왼쪽 Y축 눈금 칸 — 모든 값축 차트가 같은 x 에 Y축 선을 세운다(§15). */
export const AXIS_GUTTER = "var(--wds-widget-axis-gutter)";

/** 1 · 2 · 4 · 5 · 10 × 10ⁿ 중 v 이상인 가장 작은 값. 0 이하면 0. */
export function niceMax(v: number): number {
  if (v <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

/** 눈금 · 값 라벨 숫자. 1000 이상은 `1.2K`, 그 아래는 정수로 반올림. */
export function formatAxisValue(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}

/** 눈금 위치(최대 대비 비율). 최대가 0 이면 바닥 하나. */
export function axisTicks(max: number): number[] {
  return max > 0 ? [1, 0.5, 0] : [0];
}

type YAt = (ratioFromTop: number) => string | number;

/** 눈금마다 가로 점선. 마크보다 먼저(아래) 그린다. */
export function ValueGrid({ ticks, yAt, right }: { ticks: number[]; yAt: YAt; right: string | number }) {
  return (
    <>
      {ticks.map((ratio) => (
        <div
          key={`grid-${ratio}`}
          aria-hidden
          className="absolute"
          style={{ left: AXIS_GUTTER, right, top: yAt(1 - ratio), height: 0, borderTop: "1px dashed var(--color-border-soft)" }}
        />
      ))}
    </>
  );
}

/** X 바닥선 + Y 세로선. 마크 위에 그려 막대에 묻히지 않게 한다. */
export function PlotAxisLines({ top, bottom, right }: { top: string | number; bottom: string | number; right: string | number }) {
  return (
    <>
      <div aria-hidden className="absolute bg-color-var-color-border-divider" style={{ left: AXIS_GUTTER, right, bottom, height: 1 }} />
      <div aria-hidden className="absolute bg-color-var-color-border-divider" style={{ left: AXIS_GUTTER, top, bottom, width: 1 }} />
    </>
  );
}

/** Y축 눈금 글자 — 눈금 칸 안 오른쪽 정렬 · `text-chart` · 숫자 서체 · tertiary(§15). 단위는 접미사. */
export function ValueAxisLabels({ ticks, yAt, max, unit = "" }: { ticks: number[]; yAt: YAt; max: number; unit?: string }) {
  return (
    <>
      {ticks.map((ratio) => (
        <span
          key={ratio}
          className="absolute text-chart text-tertiary leading-none"
          style={
            {
              fontFamily: "var(--font-family-numeric)",
              top: yAt(1 - ratio),
              transform: "translateY(-50%)",
              left: 0,
              textAlign: "right",
              paddingRight: 4,
              width: AXIS_GUTTER,
            } as CSSProperties
          }
        >
          {formatAxisValue(max * ratio) + unit}
        </span>
      ))}
    </>
  );
}
