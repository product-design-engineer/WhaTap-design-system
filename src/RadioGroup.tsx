import { useId, useState, type ReactNode } from "react";

/**
 * RadioGroup — Primitives. 서로 배타인 선택지 중 하나를 고르는 폼 값.
 *
 * ## Purpose
 * 선택지를 접어 두지 않고 **모두 펼쳐서** 하나를 고르게 한다. [[Select]] 는 고른 값만 보이고 나머지는 열어 봐야
 * 보인다. 선택지가 적고(2–5) 서로 무엇이 다른지가 판단에 쓰일 때는 펼쳐 두는 편이 한 번에 읽힌다.
 *
 * 네이티브 `<input type="radio">` 위에 그린다. 같은 `name` 으로 묶여 ← → ↑ ↓ 이동 · Space 선택 ·
 * 스크린리더의 «2개 중 1번째» 낭독을 브라우저가 맡는다. 묶음은 `role="radiogroup"` 이다.
 *
 * ## When to use
 * - 폼에서 서로 배타인 선택지 2–5개 중 하나 (과금 범위 «전체 / 직접 선택» · 알림 주기 · 공개 범위)
 * - 선택지마다 무엇이 다른지 짧게 덧붙여야 할 때 — `description`
 * - 한 선택지를 고르면 그 아래 입력이 더 열리는 폼 (호출자가 `value` 로 분기)
 *
 * ## When NOT to use
 * - 선택지가 6개 이상 → [[Select]]. 펼쳐 두면 폼이 길어지고 비교가 오히려 어렵다
 * - 켬/끔 하나 → [[Switch]](즉시 반영) 또는 [[Checkbox]](폼 제출)
 * - 여러 개를 함께 고르기 → [[Checkbox]] 여럿. 라디오는 하나만 남는다
 * - 화면의 뷰를 바꾸는 전환 → [[Tabs]]. 라디오는 «값» 이고 탭은 «보기» 다 — 탭으로 폼 값을 받으면 스크린리더가
 *   탭 전환으로 읽는다
 * - 크기순으로 놓인 값(상한 · 임계치) → [[Slider]]
 *
 * ## Composition rules
 * - **처음부터 하나를 골라 둔다.** 추천이 있으면 그것을 기본으로 둔다(patterns P4). 아무것도 안 고른 라디오는
 *   한 번 고르면 다시 «안 고름» 으로 돌아갈 수 없어, 빈 상태가 선택지로 남지 않는다
 * - 선택지 라벨은 짧은 명사구다. 풀이는 `description` 한 줄로, 같은 말을 라벨과 풀이에 되풀이하지 않는다
 * - 고를 수 없는 선택지는 지우지 않고 `disabled` 로 둔다. 왜 못 고르는지는 그 아래 문장이 말한다
 * - 가로(`direction="horizontal"`)는 선택지가 2–3개이고 `description` 이 없을 때만. 풀이가 붙으면 세로로 둔다
 * - 색은 토큰만 — 테두리 `--color-border-strong` · 고름 `--color-brand-blue` · 바탕 `--color-card`
 * - 묶음 라벨이 화면에 따로 있으면 `aria-labelledby`, 없으면 `label`(= aria-label) 필수
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="과금 범위"
 *   direction="horizontal"
 *   value={mode}
 *   onChange={setMode}
 *   items={[
 *     { value: "all", label: "전체 프로젝트 (7개)" },
 *     { value: "pick", label: "직접 선택" },
 *   ]}
 * />
 * ```
 */
export type RadioGroupDirection = "vertical" | "horizontal";

export interface RadioGroupItem<V extends string = string> {
  /** 선택지 값. */
  value: V;
  /** 선택지 라벨 — 짧은 명사구. */
  label: ReactNode;
  /** 라벨 아래 풀이 한 줄. */
  description?: ReactNode;
  /** 고를 수 없음. 지우지 않고 흐리게 둔다. */
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string = string> {
  /** 선택지 배열. */
  items: RadioGroupItem<V>[];
  /** controlled 값. */
  value?: V;
  /** uncontrolled 초기값. 없으면 고를 수 있는 첫 선택지. */
  defaultValue?: V;
  /** 고를 때. */
  onChange?: (value: V) => void;
  /** 배치 — default vertical. */
  direction?: RadioGroupDirection;
  /** 묶음 전체 비활성. */
  disabled?: boolean;
  /** 묶음 이름(= aria-label). 화면 라벨이 있으면 `aria-labelledby` 를 쓴다. */
  label?: string;
  "aria-labelledby"?: string;
  /** 같은 화면에 묶음이 여럿일 때 구분할 name. 없으면 자동. */
  name?: string;
  className?: string;
}

export default function RadioGroup<V extends string = string>({
  items,
  value,
  defaultValue,
  onChange,
  direction = "vertical",
  disabled = false,
  label,
  "aria-labelledby": labelledBy,
  name,
  className = "",
}: RadioGroupProps<V>) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const [internal, setInternal] = useState<V | undefined>(
    defaultValue ?? items.find((it) => !it.disabled)?.value,
  );
  const current = value ?? internal;

  const pick = (next: V) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-disabled={disabled || undefined}
      className={`wds-radio-group ${className}`.trim()}
      data-direction={direction}
    >
      {items.map((it) => {
        const off = disabled || !!it.disabled;
        return (
          <label key={it.value} className="wds-radio" data-disabled={off || undefined}>
            <input
              type="radio"
              className="wds-radio-input"
              name={groupName}
              value={it.value}
              checked={current === it.value}
              disabled={off}
              onChange={() => pick(it.value)}
            />
            <span className="wds-radio-circle" aria-hidden />
            <span className="wds-radio-text">
              <span className="wds-radio-label">{it.label}</span>
              {it.description != null && <span className="wds-radio-description">{it.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
