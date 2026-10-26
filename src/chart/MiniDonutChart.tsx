/**
 * MiniDonutChart — 카드형 미니 도넛 차트 (분포·비율 요약).
 *
 * ## Purpose
 * GPU 인벤토리 모델별 분포, 리소스 할당 비율 등 범주형 데이터를
 * 작은 카드 안에서 시각화. 중앙에 합계나 핵심 수치를 표시.
 *
 * ## When to use
 * - 3~6개 범주의 비율 분포를 한눈에 보여줄 때 (대시보드 grid)
 * - 중앙 라벨로 전체 합계나 핵심 KPI를 함께 표시할 때
 *
 * ## When NOT to use
 * - 시계열 추이 표현 → [[MiniLineChart]]
 * - 정밀한 비교가 필요한 다중 시리즈 → [[MiniMultiLineChart]]
 * - 2개 이하 범주의 단순 진행률 → [[UsageGauge]]
 *
 * ## Metrics
 * - ✅ 합이 100% 인 3~6 범주 구성 — GPU 모델별 대수 · OS 분포 · 상태별 서버 수 · 할당 비율
 * - ❌ 합이 100% 가 아닌 값(여러 자원의 사용률) · 겹치는 범주 — 조각 합이 링을 꽉 채워 거짓 몫을 말한다
 * - ❌ 시간 흐름 · 7개 이상 범주 → [[MiniLineChart]] · [[BarList]]
 *
 * ## Color
 * - 역할: 계열 — 조각마다 `--color-chart-series-1..8`(호출부)
 * - 상한: 조각 6 · 슬롯 8
 * - 고정: 빈 고리(트랙) `--color-surface-100`
 * - 금지: 상태색으로 조각을 칠하지 않는다
 *
 * ## States
 * - 빈: 회색 고리(트랙) · 빈 범례 · 가운데 글자만 — 빈 상태 글은 그리지 않는다 — [[WidgetFrame]] `state`(no-data) 를 쓴다
 * - 빠짐: `null` 을 받지 않는다(타입이 숫자) — 수집 공백은 호출부가 거르거나 `state` 로
 * - 0: 조각 없음 · 범례에는 남는다 · 모두 0 이면 트랙만
 * - 넘침: 음수는 조각 0 이지만 합계를 줄여 다른 조각이 커진다 — 음수를 넘기지 않는다
 *
 * ## Limits
 * - 개수: 조각 3~6개 — 7개 이상이면 [[BarList]] · 같은 이름 조각 금지(키가 겹친다)
 * - 크기: 도넛 120 고정(굵기 18) · 범례가 나머지 폭
 * - 라벨: 범례 이름 말줄임 + `title` · 가운데 글자 말줄임 없음
 *
 * ## Composition rules
 * - 조각이나 범례 항목을 가리키면 그 조각만 남기고(나머지 0.32) [[ChartTooltip]] 이 조각 가운데에서 이름 · 값 · 전체 대비 비율을 보인다(patterns §26 «강조»).
 * - 범례는 [[ChartLegendItem]] 을 조합한다(`fill` — 값이 오른쪽 끝에 세로로 맞는다, patterns §26). 그래서 Composite 계층이다.
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 안쪽 여백 · 제목 줄을 뺀다). [[WidgetFrame]] 안에 넣을 때 쓴다.
 *   제목은 WidgetFrame `title`, 범위는 `meta`, 범례는 도넛 옆 열 그대로(항목 글이 길어 한 줄 범례로 올리지 않는다), 메뉴는 `onFullscreen` · `menu` 가 맡는다(patterns §15).
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 색은 차트 시리즈 토큰 (`--color-chart-series-1..8`)만 사용
 * - SVG 내부에 텍스트 없음 — 중앙 라벨은 HTML overlay
 * - `delay` 지정 시 stagger 진입 애니메이션 적용
 *
 * @example
 * ```tsx
 * <MiniDonutChart
 *   title="GPU 인벤토리"
 *   segments={[
 *     { label: "A100", value: 8, color: "var(--color-chart-series-1)" },
 *     { label: "H100", value: 4, color: "var(--color-chart-series-3)" },
 *   ]}
 *   centerLabel="12"
 *   centerSub="Total"
 * />
 * ```
 */
import { useState } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export type MiniDonutChartProps = {
  title: string;
  segments: DonutSegment[];
  /** 도넛 중앙 큰 숫자 */
  centerLabel?: string;
  /** 도넛 중앙 보조 텍스트 */
  centerSub?: string;
  /** stagger 진입 애니메이션 delay(ms) */
  delay?: number;
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

const SIZE = 120;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export default function MiniDonutChart({
  title,
  segments,
  centerLabel,
  centerSub,
  delay,
  frame = true,
}: MiniDonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const active = segments.filter((s) => s.value > 0).length;

  // 세그먼트 간 gap (stroke-dasharray 단위) — 2개 이상일 때만 구분선
  const SEG_GAP = active > 1 ? 3 : 0;
  const usable = CIRCUMFERENCE - SEG_GAP * active;

  // 각 segment의 stroke-dasharray/dashoffset 계산 (누적 offset)
  let cursor = 0;
  const arcs = segments.map((seg) => {
    const ratio = total > 0 ? seg.value / total : 0;
    const length = Math.max(0, ratio * usable);
    const dashGap = CIRCUMFERENCE - length;
    const offset = -cursor;
    cursor += length + (seg.value > 0 ? SEG_GAP : 0);
    return { ...seg, length, dashGap, offset, ratio };
  });

  /* 가리킨 조각(조각 · 범례) — 그 조각만 남기고 [[ChartTooltip]] 으로 이름 · 값 · 비율(patterns §26 «강조») */
  const [hover, setHover] = useState<string | null>(null);
  const h = arcs.find((a) => a.label === hover);
  /* 조각 가운데 각(12시 기준 시계 방향) → 링 위 좌표 */
  const midOf = (a: (typeof arcs)[number]) => {
    const deg = ((-a.offset + a.length / 2) / CIRCUMFERENCE) * 360;
    const t = ((deg - 90) * Math.PI) / 180;
    return { x: CENTER + RADIUS * Math.cos(t), y: CENTER + RADIUS * Math.sin(t) };
  };

  const style = delay !== undefined
    ? { animationDelay: `${delay}ms` } as React.CSSProperties
    : undefined;

  return (
    <div
      className={frame ? "group flex flex-col h-full bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px" : "group flex flex-col h-full min-w-0"}
      style={style}
    >
      {/* 헤더 — frame 일 때만. WidgetFrame 안에서는 그쪽 머리가 제목을 갖는다. */}
      {frame && (
        <div className="flex items-center justify-between mb-4px">
          <span className="text-md font-medium text-secondary truncate">{title}</span>
        </div>
      )}

      {/* 도넛 + 범례 */}
      <div className="flex items-center gap-12px flex-1 min-h-0">
        {/* SVG 도넛 */}
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* 배경 링 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="var(--color-surface-100)"
              strokeWidth={STROKE}
            />
            {/* 데이터 arc */}
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                className={MARK_CLASS}
                opacity={hover != null && hover !== arc.label ? DIM_OPACITY : 1}
                onMouseEnter={() => setHover(arc.label)}
                onMouseLeave={() => setHover(null)}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${arc.length} ${arc.dashGap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          {/* 중앙 라벨 (HTML overlay) */}
          {(centerLabel || centerSub) && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              {centerLabel && (
                <span
                  className="text-xl font-bold text-primary leading-none"
                  style={{ fontFamily: "var(--font-family-numeric)" }}
                >
                  {centerLabel}
                </span>
              )}
              {centerSub && (
                <span className="text-xs text-tertiary mt-2px">
                  {centerSub}
                </span>
              )}
            </div>
          )}
          {h && (
            <ChartTooltip
              left={midOf(h).x}
              top={midOf(h).y}
              /* 원형 — 조각 바깥쪽으로 편다(안쪽으로 펴면 링과 가운데 글자를 가린다) */
              flipX={midOf(h).x < CENTER}
              flipY={midOf(h).y < CENTER}
              offset={6}
              rows={[{ label: h.label, value: h.value.toLocaleString("en-US"), color: h.color }]}
              footer={`전체의 ${(h.ratio * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`}
            />
          )}
        </div>

        {/* 범례 */}
        <div className="flex flex-col gap-4px min-w-0 flex-1">
          {arcs.map((arc) => (
            <ChartLegendItem
              key={arc.label}
              color={arc.color}
              label={arc.label}
              value={arc.value}
              fill
              onHover={(on) => setHover(on ? arc.label : null)}
              dimmed={hover != null && hover !== arc.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
