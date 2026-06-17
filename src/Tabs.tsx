/**
 * Tabs — Primitives layer.
 *
 * ## Purpose
 * 한 영역에서 여러 뷰를 전환하는 nav. 페이지 내 큰 탭(룰 편집기 섹션 분기 등)과
 * 작은 segmented control(시간 단위 1H/6H/24H 등) 양쪽을 variant 하나로 처리.
 *
 * ## When to use
 * - 페이지 안 본문 섹션 전환 (large variant — 룰 편집기·인시던트 상세)
 * - 작은 토글 그룹 (segmented variant — 시간 단위·정렬 기준)
 *
 * ## When NOT to use
 * - 글로벌 라우팅 → `Sidebar` + react-router
 * - 양자택일 boolean → `Switch` (추후)
 * - 단일 선택 옵션 > 5개 → `Select`
 *
 * ## Composition rules
 * - Tabs 는 *trigger* 만 제공. 패널 내용은 호출자가 `value` 로 분기 (shadcn/Radix 패턴)
 * - ARIA tablist 패턴 — role="tablist" / role="tab" / aria-selected
 * - 키보드: ArrowLeft/ArrowRight 활성 이동 (disabled 건너뜀), Home/End 양 끝
 * - 색 토큰만 — brand-blue / text-primary / text-tertiary / surface-100
 *
 * ## variant 비교
 * | variant     | 모양                                              | 사용 |
 * |-------------|---------------------------------------------------|------|
 * | `large`     | 라벨 + 하단 underline (활성), 라벨 사이 여백 큼   | 페이지 본문 섹션 |
 * | `segmented` | 둥근 박스 안 segment, 활성 = 흰 배경 + 그림자     | 시간 단위 등 compact |
 *
 * @example
 * ```tsx
 * <Tabs
 *   variant="large"
 *   items={[{ value: "rule", label: "룰" }, { value: "scope", label: "Scope" }, { value: "action", label: "액션" }]}
 *   value={tab}
 *   onChange={setTab}
 * />
 *
 * <Tabs
 *   variant="segmented"
 *   size="sm"
 *   items={[{ value: "1h", label: "1H" }, { value: "6h", label: "6H" }, { value: "24h", label: "24H" }]}
 *   value={range}
 *   onChange={setRange}
 * />
 * ```
 */
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import TabButton from "./TabButton";

export type TabsVariant = "large" | "segmented";
export type TabsSize = "sm" | "md" | "lg";

export type TabsItem = {
  /** 고유 식별자 — onChange 가 받는 값. */
  value: string;
  /** 표시 라벨. */
  label: ReactNode;
  /** 좌측 슬롯 — 아이콘. */
  icon?: ReactNode;
  /** 비활성 — 클릭/키보드 모두 건너뜀. */
  disabled?: boolean;
};

export type TabsProps = {
  /** 탭 항목 배열. */
  items: TabsItem[];
  /** 현재 활성 value. controlled. */
  value: string;
  /** 변경 콜백 — disabled 항목은 호출되지 않음. */
  onChange: (next: string) => void;
  /** 시각 variant. */
  variant?: TabsVariant;
  /** 사이즈 — sm / md(default) / lg. */
  size?: TabsSize;
  /** 전체 폭 — true 면 각 탭 균등 분배. */
  fullWidth?: boolean;
  /** aria-label — 다중 Tabs 가 같은 페이지에 있으면 필수. */
  "aria-label"?: string;
  /** 외부 className. */
  className?: string;
};

const SIZE = {
  sm: { h: 24, padX: 10, gap: 4, text: "text-sm" },
  md: { h: 32, padX: 14, gap: 6, text: "text-base" },
  lg: { h: 40, padX: 18, gap: 8, text: "text-md" },
} as const;

export default function Tabs({
  items,
  value,
  onChange,
  variant = "large",
  size = "md",
  fullWidth = false,
  "aria-label": ariaLabel,
  className = "",
}: TabsProps) {
  const groupId = useId();
  const spec = SIZE[size];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* ─── 키보드 이동 (ArrowLeft/Right + Home/End, disabled 건너뜀) ─── */
  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, currentIdx: number) => {
    const enabled = items
      .map((it, i) => ({ ...it, i }))
      .filter((x) => !x.disabled);
    if (enabled.length === 0) return;
    let nextIdx = currentIdx;
    if (e.key === "ArrowLeft") {
      const order = enabled.map((x) => x.i);
      const pos = order.indexOf(currentIdx);
      nextIdx = order[(pos - 1 + order.length) % order.length];
    } else if (e.key === "ArrowRight") {
      const order = enabled.map((x) => x.i);
      const pos = order.indexOf(currentIdx);
      nextIdx = order[(pos + 1) % order.length];
    } else if (e.key === "Home") {
      nextIdx = enabled[0].i;
    } else if (e.key === "End") {
      nextIdx = enabled[enabled.length - 1].i;
    } else {
      return;
    }
    e.preventDefault();
    onChange(items[nextIdx].value);
    tabRefs.current[nextIdx]?.focus();
  };

  if (variant === "segmented") {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`inline-flex rounded-md bg-color-var-color-surface-100 p-2px ${
          fullWidth ? "w-full" : ""
        } ${className}`}
      >
        {items.map((it, i) => (
          <TabButton
            key={it.value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            item={it}
            variant="segmented"
            selected={it.value === value}
            spec={spec}
            id={`${groupId}-tab-${it.value}`}
            fullWidth={fullWidth}
            onClick={() => !it.disabled && onChange(it.value)}
            onKeyDown={(e) => handleKey(e, i)}
          />
        ))}
      </div>
    );
  }

  /* ─── large variant — 하단 underline ─── */
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex items-end border-b border-color-var-color-border-default ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {items.map((it, i) => (
        <TabButton
          key={it.value}
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          item={it}
          variant="large"
          selected={it.value === value}
          spec={spec}
          id={`${groupId}-tab-${it.value}`}
          fullWidth={fullWidth}
          onClick={() => !it.disabled && onChange(it.value)}
          onKeyDown={(e) => handleKey(e, i)}
        />
      ))}
    </div>
  );
}
