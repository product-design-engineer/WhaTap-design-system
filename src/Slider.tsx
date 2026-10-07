import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * Slider — Primitives. 한 축 위에서 크기를 고르는 막대.
 *
 * ## Purpose
 * 값들이 **크기순으로 한 줄에 놓이고, 지금 고른 값이 그 줄의 어디쯤인지가 판단에 쓰일 때** 고르는 컨트롤이다.
 * [[Select]] 는 고른 값 하나만 보여 주고 나머지를 접는다. 상한 · 임계치처럼 «얼마나 크게» 를 정하는 자리에서는
 * 접힌 목록보다 전체 범위와 지금 위치가 한눈에 보이는 막대가 빨리 읽힌다.
 *
 * 네이티브 `<input type="range">` 위에 그린다. 키보드(← → · Home · End · PageUp/Down) · 스크린리더 ·
 * 터치는 브라우저가 맡는다.
 *
 * 값을 받는 방식은 둘이다.
 * - **연속** — `min` · `max` · `step`. 퍼센트 · 임계치처럼 사이 값이 모두 의미 있을 때
 * - **정해진 값(`stops`)** — 고를 수 있는 값이 몇 개로 정해져 있을 때. 값의 간격과 상관없이 **같은 간격의
 *   눈금**에 놓는다(0 · 10만 · 50만 · 200만 처럼 커질수록 벌어지는 금액). 값은 늘 `stops` 중 하나다
 *
 * ## When to use
 * - 상한 · 한도 · 임계치처럼 크기순으로 놓인 값 중 하나를 고를 때 (사용량 한계 · 알림 임계치 · 보존 기간)
 * - 지금 값이 범위의 어디쯤인지가 고르는 데 도움이 될 때
 *
 * ## When NOT to use
 * - 크기순이 아닌 선택지(국가 · 통화 · 정렬 기준) → [[Select]]. 막대 위에 놓으면 없는 순서가 생긴다
 * - 정확한 숫자를 쳐야 하는 값(금액 직접 입력 · 포트 번호) → [[TextField]]. 막대로는 한 단위씩 맞추기 어렵다
 * - 선택지가 둘뿐이면 → [[Switch]] 또는 [[Tabs]] `segmented`
 * - 범위(시작 ~ 끝) 두 값을 고르는 자리 → 지금은 지원하지 않는다. 손잡이 하나만 그린다
 *
 * ## Composition rules
 * - **지금 고른 값은 막대 밖에 글로 적는다.** 막대 위치만으로 «50만 원» 을 읽게 하지 않는다. 폼에서는 라벨 줄이나
 *   막대 위 한 줄에 쓰고, 같은 문장을 `valueText` 로 스크린리더에도 준다
 * - 눈금 글자(`markLabel`)는 짧게 쓴다(「50만」). 단위와 풀이는 위 문장이 맡는다. 눈금마다 긴 문장을 달지 않는다
 * - 폭은 부모가 정한다(`width: 100%`). 폼 열(420px)에 세울 때는 `className` 으로 그 폭을 준다
 * - 색은 토큰만 — 채운 구간 `--color-brand-blue` · 빈 구간 `--color-surface-200` · 손잡이 `--color-card`
 * - 시각 라벨이 없으면 `label`(= aria-label) 또는 `aria-labelledby` 필수
 *
 * @example
 * ```tsx
 * // 정해진 값 — 같은 간격의 눈금
 * <Slider
 *   stops={[0, 100_000, 200_000, 500_000, 1_000_000, 2_000_000]}
 *   value={limit}
 *   onChange={setLimit}
 *   markLabel={(v) => (v === 0 ? "0" : `${v / 10_000}만`)}
 *   valueText={(v) => `${v.toLocaleString()}원`}
 *   label="사용량 한계"
 * />
 * // 연속
 * <Slider min={50} max={100} step={5} defaultValue={80} label="CPU 임계치" />
 * ```
 */
export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue" | "type" | "min" | "max" | "step"> {
  /** controlled 값. `stops` 를 주면 그중 하나여야 한다. */
  value?: number;
  /** uncontrolled 초기값. 없으면 `stops[0]` 또는 `min`. */
  defaultValue?: number;
  /** 값이 바뀔 때. 끄는 동안에도 불린다. */
  onChange?: (value: number) => void;
  /** 연속 — 최솟값. default 0. `stops` 가 있으면 무시. */
  min?: number;
  /** 연속 — 최댓값. default 100. `stops` 가 있으면 무시. */
  max?: number;
  /** 연속 — 간격. default 1. `stops` 가 있으면 무시. */
  step?: number;
  /** 정해진 값 — 크기순 배열. 값의 간격과 상관없이 같은 간격의 눈금에 놓인다. */
  stops?: readonly number[];
  /** 눈금 아래 글자. `stops` 면 눈금마다, 연속이면 양 끝(min · max)에만 선다. 없으면 눈금 글자 없음. */
  markLabel?: (value: number) => ReactNode;
  /** 스크린리더가 읽는 값 문장(aria-valuetext). 없으면 숫자 그대로. */
  valueText?: (value: number) => string;
  /** 시각 라벨이 없을 때의 이름(= aria-label). */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** 손잡이 지름. 눈금 위치를 손잡이 중심에 맞추는 데도 쓴다(트랙 양 끝에서 반지름만큼 안쪽). */
const THUMB = 16;

/** 눈금 글자 위치. 손잡이 중심이 움직이는 구간(양 끝에서 반지름만큼 안쪽) 위의 비율 p. */
function markStyle(p: number): CSSProperties {
  /* 양 끝 글자는 막대 밖으로 넘치지 않게 끝에 붙인다. 가운데 것만 중심 정렬이다. */
  if (p <= 0) return { left: 0 };
  if (p >= 1) return { right: 0 };
  return { left: `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${p})`, transform: "translateX(-50%)" };
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    stops,
    markLabel,
    valueText,
    label,
    disabled = false,
    className = "",
    style,
    ...rest
  },
  ref,
) {
  const discrete = !!stops && stops.length > 1;
  const [internal, setInternal] = useState<number>(defaultValue ?? (discrete ? stops![0] : min));
  const current = value ?? internal;

  /* 정해진 값이면 input 은 눈금 번호(0 … n-1)를 움직이고, 바깥에는 값으로 바꿔 준다.
     값에 없는 수가 오면 가장 가까운 눈금에 선다. */
  const index = discrete
    ? stops!.reduce((best, v, i) => (Math.abs(v - current) < Math.abs(stops![best] - current) ? i : best), 0)
    : 0;
  const lo = discrete ? 0 : min;
  const hi = discrete ? stops!.length - 1 : max;
  const pos = discrete ? index : current;
  const ratio = hi > lo ? Math.min(1, Math.max(0, (pos - lo) / (hi - lo))) : 0;

  const commit = (raw: number) => {
    const next = discrete ? stops![raw] : raw;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const marks: number[] = discrete ? [...stops!] : [min, max];
  const markRatio = (v: number, i: number) => (discrete ? i / (stops!.length - 1) : (v - min) / (max - min || 1));

  return (
    <div className={`wds-slider ${className}`.trim()} data-disabled={disabled || undefined} style={style}>
      <input
        ref={ref}
        type="range"
        className="wds-slider-input"
        min={lo}
        max={hi}
        step={discrete ? 1 : step}
        value={pos}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={valueText ? valueText(current) : undefined}
        onChange={(e) => commit(Number(e.currentTarget.value))}
        /* 채운 구간의 끝. 손잡이 중심과 맞도록 양 끝 반지름만큼 안쪽에서 잰다. */
        style={{ "--wds-slider-fill": `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${ratio})` } as CSSProperties}
        {...rest}
      />
      {markLabel && (
        <div className="wds-slider-marks" aria-hidden>
          {marks.map((v, i) => (
            <span
              key={v}
              className="wds-slider-mark"
              data-active={(discrete ? i === index : v === current) || undefined}
              style={markStyle(markRatio(v, i))}
            >
              {markLabel(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

Slider.displayName = "Slider";

export default Slider;
