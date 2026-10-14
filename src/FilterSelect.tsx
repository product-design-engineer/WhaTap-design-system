/**
 * FilterSelect — 필터 줄에 서는 드롭다운 트리거. Primitives layer.
 *
 * ## Purpose
 * 「이 기준으로 걸러 보겠다」 를 여는 버튼 하나. 고른 값이 없으면 기준 이름(`label`)을,
 * 고르고 나면 그 요약(`summary` — 「첫 값 외 N」)을 자기 얼굴로 쓴다.
 *
 * ## When to use
 * - 목록 위 필터 줄. 여러 기준이 나란히 서고 각 기준이 하나씩 이 트리거를 갖는다.
 * - 열리는 목록은 [[FilterDropdown]] 이 그린다. 이것은 «여는 자리» 만 맡는다.
 *
 * ## When NOT to use
 * - 폼 안에서 값을 고르는 자리 → [[Select]]. 필터는 화면을 좁히는 것이고 폼은 값을 정하는 것이다.
 * - 켜고 끄는 기준 하나 → [[FilterChip]]. 목록을 열 필요가 없으면 트리거도 필요 없다.
 * - 이미 고른 값을 나열하는 자리 → [[Chip]]. 트리거는 요약만 지고, 낱낱은 아래에 칩으로 눕는다.
 *
 * ## Composition rules
 * - **고른 값이 있으면 테두리가 brand-blue 로 바뀐다.** 배경을 칠하지 않는다 — 필터 줄에
 *   기준이 네다섯 서는데 그중 둘이 채워지면 줄 전체가 얼룩진다. 테두리 한 겹이면 «이 기준은
 *   걸려 있다» 가 충분히 읽힌다.
 * - 글자색도 함께 바뀐다(`text-secondary` → `text-primary`). 테두리만으로는 색각 이상에서
 *   구별이 약하다.
 * - `minWidth` 132 — 기준 이름이 짧아도 트리거들이 들쭉날쭉하지 않게. 넘치면 늘어난다.
 * - chevron 은 12px, [[Select]] 와 같은 자형이다. 눌러야 열린다는 것을 모양이 말한다.
 * - 고른 값의 낱낱은 이 트리거가 지지 않는다. 아래 줄에 닫기 가능한 [[Chip]] 으로 나열한다 —
 *   트리거 안에 다 적으면 폭이 기준마다 달라지고, 하나만 지우는 길이 없다.
 *
 * @example
 * ```tsx
 * <FilterSelect
 *   label="상태"
 *   summary={picked.length === 1 ? first : `${first} 외 ${picked.length - 1}`}
 *   active={picked.length > 0}
 *   onClick={open}
 * />
 * ```
 */
import type { ComponentPropsWithoutRef } from "react";

export type FilterSelectProps = {
  /** 기준 이름. 고른 값이 없을 때 얼굴로 쓰인다. */
  label: string;
  /** 고른 값 요약 — 「첫 값 외 N」. 없으면 label 이 선다. */
  summary?: string;
  /** 고른 값이 하나라도 있는가. 테두리·글자색이 바뀐다. */
  active: boolean;
} & ComponentPropsWithoutRef<"button">;

export default function FilterSelect({ label, summary, active, ...rest }: FilterSelectProps) {
  return (
    <button
      type="button"
      role="combobox"
      aria-label={label}
      aria-expanded={undefined}
      {...rest}
      className="inline-flex items-center justify-between rounded-4px bg-card transition-colors shrink-0 cursor-pointer"
      style={{
        height: "var(--wds-toolbar-control-h)",
        paddingInline: 12,
        gap: 8,
        minWidth: 132,
        border: `1px solid ${active ? "var(--color-brand-blue)" : "var(--color-border-default)"}`,
      }}
    >
      <span
        className="truncate text-md"
        style={{ color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
      >
        {summary ?? label}
      </span>
      <span className="pointer-events-none inline-flex shrink-0 items-center text-tertiary" aria-hidden>
        <svg viewBox="0 0 12 12" width={12} height={12} fill="none">
          <path
            d="M3 4.5 L6 7.5 L9 4.5"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
