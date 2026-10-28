/**
 * HeatmapCell — 값 하나를 색 한 칸으로 접는 히트맵 셀. Primitives layer.
 *
 * ## Purpose
 * 순차 스케일(`--color-heatmap-*`) 위에서 0~1 정규화 값을 배경색으로 바꿔 그리는 한 칸.
 * 값이 없으면(`value === null`) 색을 쓰지 않고 빈 표면(`--color-surface-200`)으로 남긴다 —
 * "0 이다" 와 "모른다" 를 색으로 구분하기 위해서다.
 *
 * ## When to use
 * - 시간·일자 격자 위에 지표 강도를 펴 보이는 히트맵 ([[Heatmap]] 의 셀).
 * - 값의 크기 비교가 목적이고, 정확한 수치는 tooltip/연동 차트가 맡을 때.
 *
 * ## When NOT to use
 * - ON/OFF 이분 상태 격자 → [[EventWeekTimeMatrix]] (색이 아니라 상태).
 * - 상태 4단계(정상/경고/위험/미수집) 같은 범주형 → [[Chip]]·상태 dot. 순차 스케일은 범주에 쓰지 않는다.
 * - 시계열 추이 자체 → [[MiniLineChart]].
 *
 * ## Composition rules
 * - 색은 `--color-heatmap-0 … 100` stop 사이 `color-mix` 보간. 컴포넌트 안 raw hex 금지.
 * - `value` 는 **정규화된 0~1**. 원 단위 → 0~1 변환은 호출측 책임(축 최댓값을 아는 쪽이 판단한다).
 * - 선택은 배경이 아니라 **테두리**(`--color-status-warning`)로 표시 — 배경은 이미 값이 쓰고 있다.
 * - `title` 이 있으면 [[Tooltip]] `block` 으로 띄운다(래퍼가 grid 칸 폭을 채워야 한다). 네이티브 `title` 은 뜨는 데 1초 넘게 걸리고
 *   생김새가 브라우저마다 달라, 값을 색으로만 말하는 격자에서 수치를 확인하는 유일한 길로는
 *   느리다. 접근성 라벨(`aria-label`)은 그대로 둔다.
 * - 스크린리더 이름은 `ariaLabel` → 없으면 `title`. 클릭 가능한 셀에 둘 다 없으면 이름 없는 버튼이
 *   된다 — [[Heatmap]] 은 축 라벨로 기본 이름을 만들어 넘긴다. 단독으로 쓸 때도 하나는 준다.
 * - `onClick` 이 없으면 `<button disabled>` 가 아니라 `<div aria-hidden>` 로 그린다. 읽기 전용 격자의
 *   칸 수만큼 비활성 버튼이 생기면 보조기술이 수백 개의 «이름 없는 버튼» 을 읽는다. 읽기 전용
 *   격자의 의미는 [[Heatmap]] 루트 라벨이 한 번에 진다.
 * - `label` 은 셀 안 좌하단 마이크로 캡션(일자 등). 색 대비를 위해 값이 진할수록 흰 글자로 뒤집는다.
 * - 정사각형을 강제하지 않는다 — 폭은 grid 가, 높이는 `height` 가 정한다.
 * - `onHoverChange` 는 마우스뿐 아니라 focus 에서도 울린다. 키보드로 훑는 사람도 범례 표식을
 *   보게 하기 위해서다 — 값을 색으로만 말하는 격자에서 이 연결이 끊기면 값을 읽을 길이 없다.
 *
 * @example
 * ```tsx
 * <HeatmapCell value={0.82} label="19" selected onClick={() => pick(19)} />
 * <HeatmapCell value={null} height={13} />
 * ```
 */

import Tooltip from "../Tooltip";

/** 스케일 stop — whatap-ds.css `--color-heatmap-*` 와 같은 지점. */
const STOPS = [0, 20, 40, 50, 60, 80, 90, 100] as const;

/**
 * stop → CSS 변수. **이름을 문자열로 조립하지 않는다**(`--color-heatmap-${n}`).
 * 조립하면 토큰 정합성 게이트(`check-token-sync`)가 참조를 정적으로 볼 수 없어서, 토큰이
 * 지워져도 아무도 모른 채 색만 사라진다. 여덟 줄을 적는 값이 그것보다 싸다.
 */
const STOP_VAR: Record<(typeof STOPS)[number], string> = {
  0: "var(--color-heatmap-0)",
  20: "var(--color-heatmap-20)",
  40: "var(--color-heatmap-40)",
  50: "var(--color-heatmap-50)",
  60: "var(--color-heatmap-60)",
  80: "var(--color-heatmap-80)",
  90: "var(--color-heatmap-90)",
  100: "var(--color-heatmap-100)",
};

/**
 * 정규화 값(0~1) → 히트맵 스케일 색.
 * 인접한 두 stop 토큰을 `color-mix` 로 섞어 연속 색을 만든다 (토큰 밖 hex 를 만들지 않는다).
 */
export function heatmapScaleColor(value: number): string {
  const pct = Math.min(100, Math.max(0, value * 100));
  let i = 0;
  while (i < STOPS.length - 2 && pct > STOPS[i + 1]) i += 1;
  const lo = STOPS[i];
  const hi = STOPS[i + 1];
  const t = hi === lo ? 0 : (pct - lo) / (hi - lo);
  const loShare = Math.round((1 - t) * 100);
  return `color-mix(in srgb, ${STOP_VAR[lo]} ${loShare}%, ${STOP_VAR[hi]})`;
}

export type HeatmapCellProps = {
  /** 정규화된 값 0~1. `null` 이면 데이터 없음(빈 표면). */
  value: number | null;
  /** 셀 안 좌하단 마이크로 라벨 (일자 등). */
  label?: string;
  /** 선택 표시 — 테두리 강조. */
  selected?: boolean;
  /** 셀 높이(px). 폭은 grid 가 정한다. 기본 13px. */
  height?: number;
  /** 클릭 콜백. 없으면 read-only(커서·hover 없음). */
  onClick?: () => void;
  /** hover 시 [[Tooltip]] 본문 + 스크린리더 라벨. */
  title?: string;
  /** 스크린리더 라벨만 따로 줄 때(툴팁 없이). 없으면 `title` 을 쓴다. */
  ariaLabel?: string;
  /** 커서가 들고 남을 때 알린다 — 범례가 이 값에 표식을 세운다. 벗어나면 `null`. */
  onHoverChange?: (value: number | null) => void;
};

export default function HeatmapCell({
  value,
  label,
  selected = false,
  height = 13,
  onClick,
  title,
  ariaLabel,
  onHoverChange,
}: HeatmapCellProps) {
  const empty = value === null;
  const interactive = !!onClick;
  // 값이 진해질수록 셀 배경이 어두워진다 → 라벨을 흰 글자로 뒤집는 지점.
  const labelOnDark = !empty && (value! <= 0.35 || value! >= 0.85);

  const hover = {
    onMouseEnter: onHoverChange ? () => onHoverChange(value) : undefined,
    onMouseLeave: onHoverChange ? () => onHoverChange(null) : undefined,
  };
  const className = `relative rounded-2px transition-colors ${
    interactive ? "cursor-pointer hover-brightness-95" : "cursor-default"
  }`;
  const style = {
    // 폭은 부모가 준다 — grid 칸에 직접 놓이든 [[Tooltip]] block 래퍼 안에 놓이든
    // 100% 로 채운다. 이게 없으면 래퍼 안에서 내용만큼(테두리 4px)으로 쪼그라든다.
    width: "100%",
    height,
    background: empty ? "var(--color-surface-200)" : heatmapScaleColor(value!),
    border: selected
      ? "2px solid var(--color-status-warning)"
      : "2px solid transparent",
    padding: 0,
  } as const;
  const caption = label && (
    <span
      className="absolute text-xs tabular-nums"
      data-ds-policy-ok="컬러 위 고정 흰색 전경"
      style={{
        left: 3,
        bottom: 2,
        color: labelOnDark ? "var(--color-text-inverse)" : "var(--color-text-tertiary)",
      }}
    >
      {label}
    </span>
  );

  const cell = interactive ? (
    <button
      type="button"
      onClick={onClick}
      {...hover}
      onFocus={onHoverChange ? () => onHoverChange(value) : undefined}
      onBlur={onHoverChange ? () => onHoverChange(null) : undefined}
      aria-label={ariaLabel ?? title}
      aria-pressed={selected}
      className={className}
      style={style}
    >
      {caption}
    </button>
  ) : (
    <div aria-hidden {...hover} className={className} style={style}>
      {caption}
    </div>
  );

  /* 툴팁은 내용이 있을 때만 감싼다 — 빈 툴팁 래퍼가 격자 칸 수만큼 생기면 값도 없이 비용만 든다.
     `block` 은 필수다: 래퍼가 inline 이면 grid 칸 폭을 못 채워 셀이 세로 막대로 무너진다. */
  return title ? (
    <Tooltip content={title} hoverDelayMs={80} block>
      {cell}
    </Tooltip>
  ) : (
    cell
  );
}
