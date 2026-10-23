/**
 * ChartSpanBar — 시간 구간 하나(시작 ~ 끝)를 가로 막대로. 안에 이름 한 줄. Primitives layer.
 *
 * ## Purpose
 * Flame · Waterfall 의 낱 막대 — «이 일이 언제 시작해 얼마나 걸렸나». 라이브 세션 Flame 은 막대가 좁아도 라벨을 넣어 `p…s` 처럼
 * 말줄임만 남았다(patterns §21). 여기서는 **라벨을 넣을지는 차트가 정한다**(막대 폭을 아는 쪽) — 좁은 막대는 이름 없이 색만, 이름은 툴팁이 말한다.
 *
 * ## When to use
 * - 경과 시간이 X 인 차트의 구간 하나 — [[FlameChart]] 의 호출 · 요청, [[WaterfallChart]] 의 단계(대기 · 연결 · 다운로드).
 * - 시작 · 끝이 있는 일을 시간 위에 놓을 때 — 배포 · 점검 구간, 작업(job) 실행 구간.
 *
 * ## When NOT to use
 * - 값의 크기(길이 = 값) → [[ChartBar]] · [[BarListItem]]. 이 막대의 길이는 시간이다.
 * - 시점 하나의 사건 → [[StatusTimeline]] 마커.
 *
 * ## Composition rules
 * - 자리(`start` · `end`, 플롯 폭 비율 0~1)는 차트가 계산한다. 이 막대는 그 상자를 칠하고 이름을 쓴다. 플롯 밖으로 나간 부분은 잘라 그린다.
 * - 색은 호출부가 준다 — 상태(_statusTone) 또는 계열 슬롯. 글자색도 함께(`textColor`).
 * - 이름은 한 줄 말줄임. 넣을지 말지는 `label` 을 주는지로 — 차트가 막대 폭 40px 이상일 때만 준다.
 * - 강조: `dimmed` 면 0.32(patterns §26 «강조»), `active` 면 1px 카드색 고리 + 바깥 1px 전경 테두리.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 상자 | 절대 배치 · 높이 = 부모 칸 · 최소 폭 1px · 반경 2 |
 * | 이름 | `text-xs` medium · 안쪽 4 · 한 줄 말줄임 · 색 `textColor` |
 * | 강조 | `dimmed` 0.32 · `active` 테두리 1px `--color-text-primary` |
 *
 * @example
 * ```tsx
 * <ChartSpanBar start={0.1} end={0.42} color="var(--color-chart-series-1)" textColor="var(--color-text-inverse)" label="GET /api/orders" />
 * ```
 */
import type { MouseEvent } from "react";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type ChartSpanBarProps = {
  /** 시작 — 플롯 폭 비율(0~1). 0 보다 작으면 잘린다. */
  start: number;
  /** 끝 — 플롯 폭 비율(0~1). 1 보다 크면 잘린다. */
  end: number;
  /** 칠 색 토큰. hex 금지. */
  color: string;
  /** 이름 글자색 토큰. 기본 `--color-text-inverse`. */
  textColor?: string;
  /** 막대 안 이름 — 없으면 색만(좁은 막대). */
  label?: string;
  /** 다른 막대가 강조 중이라 흐린다. */
  dimmed?: boolean;
  /** 가리키고 있는 막대 — 테두리. */
  active?: boolean;
  /** 위 끝(px). 없으면 0. */
  top?: number;
  /** 높이(px). 없으면 부모 높이 전체. */
  height?: number;
  /** 포인터가 들어올 때 — 차트가 툴팁 자리를 잡는다. */
  onMouseEnter?: (ev: MouseEvent<HTMLDivElement>) => void;
  /** 포인터가 움직일 때 — 툴팁이 포인터를 따라간다. */
  onMouseMove?: (ev: MouseEvent<HTMLDivElement>) => void;
  /** 포인터가 나갈 때. */
  onMouseLeave?: () => void;
  /** 막대를 고를 때(상세 열기). 주면 커서가 손가락. */
  onClick?: () => void;
};

export default function ChartSpanBar({
  start,
  end,
  color,
  textColor = "var(--color-text-inverse)",
  label,
  dimmed = false,
  active = false,
  top,
  height,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onClick,
}: ChartSpanBarProps) {
  const a = Math.max(0, start);
  const b = Math.min(1, end);
  if (b < a) return null;
  return (
    <div
      className={`${MARK_CLASS} absolute flex items-center overflow-hidden`}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        left: `${a * 100}%`,
        width: `max(1px, ${(b - a) * 100}%)`,
        top: top ?? 0,
        height: height ?? "100%",
        background: color,
        borderRadius: 2,
        opacity: dimmed ? DIM_OPACITY : 1,
        boxShadow: active ? "0 0 0 1px var(--color-text-primary)" : undefined,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {label && (
        <span className="block truncate text-xs" style={{ color: textColor, padding: "0 4px", fontWeight: "var(--font-weight-medium)", lineHeight: "var(--leading-none)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
