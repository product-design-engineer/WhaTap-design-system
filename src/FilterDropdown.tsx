/**
 * FilterDropdown — Primitives layer.
 *
 * ## Purpose
 * 트리거 클릭 시 펼쳐지는 다중 선택 드롭다운. FilterBar(Chrome) 안에 다중 배치되어
 * "카테고리 / 심각도 / 시간 윈도우" 등의 다중 필터 진입점 역할.
 *
 * Modal 보다 가벼움 — backdrop 없음, body scroll lock 없음. 작은 패널이라 absolute
 * positioning 으로 충분.
 *
 * ## When to use
 * - 페이지 헤더의 다중 선택 필터 (카테고리·심각도)
 * - 옵션 5~20 정도 — count 표시 가능
 *
 * ## When NOT to use
 * - 단일 선택 + 5~20 옵션 → `Select`
 * - 단일 선택 + 20+ 옵션 (검색 필요) → `Combobox` (추후)
 * - 50+ 옵션 다중 선택 → 별도 패널 페이지 (FilterDropdown 부적합)
 * - 단일 토글 → `FilterChip`
 *
 * ## Composition rules
 * - 트리거는 외부에서 받음 (`trigger` prop) — Button / FilterChip 등 ReactElement
 * - 패널은 `absolute` 로 트리거 옆에 위치 (Portal 안 씀 — 작은 패널)
 * - outside-click + ESC 로 닫힘 (각각 prop disable 가능)
 * - options 모드: `options` + `value` + `onChange` 다중 선택 Checkbox 자동 렌더
 * - 자유 children: 사용자가 panel 본문 자유 구성 (Apply/Cancel 등 footer 추가 가능)
 *
 * ## ARIA
 * - 트리거: `aria-haspopup="listbox"` + `aria-expanded`
 * - 패널: `role="dialog"` (작은 panel)
 *
 * @example
 * ```tsx
 * <FilterDropdown
 *   trigger={<FilterChip selected={selected.length > 0} count={selected.length}>카테고리</FilterChip>}
 *   title="카테고리"
 *   options={[
 *     { value: "disk", label: "Disk", count: 12 },
 *     { value: "jvm",  label: "JVM",  count: 43 },
 *     { value: "k8s",  label: "Kubernetes", count: 8 },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   placement="bottom-start"
 * />
 * ```
 */
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import FilterDropdownOptionItem from "./FilterDropdownOptionItem";

export type FilterDropdownPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export type FilterDropdownOption = {
  value: string;
  label: string;
  /** 우측 카운트 (예: 발생 빈도). */
  count?: number | string;
  /** 비활성 옵션. */
  disabled?: boolean;
};

export type FilterDropdownProps = {
  /** 트리거 ReactElement — Button / FilterChip 등. onClick 자동 주입. */
  trigger: ReactElement;
  /** 패널 상단 타이틀. */
  title?: ReactNode;
  /** options 모드: Checkbox 묶음 자동 렌더. */
  options?: FilterDropdownOption[];
  /** 다중 선택된 value 배열 (controlled, options 모드 한정). */
  value?: string[];
  /** options 모드 변경 콜백 — 즉시 호출 (지연 적용 패턴은 children + footer 로 직접). */
  onChange?: (next: string[]) => void;
  /** 자유 children — options 무시하고 panel 본문 직접 구성. */
  children?: ReactNode;
  /** 패널 footer slot — Apply/Cancel 등 액션 영역. */
  footer?: ReactNode;
  /** 펼침 위치. default bottom-start. */
  placement?: FilterDropdownPlacement;
  /** 패널 width(px). default 240. */
  width?: number;
  /** controlled open. 미지정 시 internal 상태. */
  open?: boolean;
  /** open 변경 콜백. */
  onOpenChange?: (open: boolean) => void;
  /** outside-click 으로 닫기 비활성. */
  disableOutsideClick?: boolean;
  /** ESC 키로 닫기 비활성. */
  disableEscClose?: boolean;
  /** disabled. */
  disabled?: boolean;
  /** 외부 className — wrapper. */
  className?: string;
};

const OFFSET_PX = 4;

export default function FilterDropdown({
  trigger,
  title,
  options,
  value = [],
  onChange,
  children,
  footer,
  placement = "bottom-start",
  width = 240,
  open: controlledOpen,
  onOpenChange,
  disableOutsideClick = false,
  disableEscClose = false,
  disabled = false,
  className = "",
}: FilterDropdownProps) {
  const panelId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = (controlledOpen ?? internalOpen) && !disabled;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  /* ─── outside-click + ESC ─── */
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (disableOutsideClick) return;
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableEscClose) {
        e.stopPropagation();
        setOpen(false);
      }
    };
    // mousedown 이 onClick 보다 먼저 — outside button 클릭 시 panel 닫고 그 button 의 동작은 그대로
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, disableOutsideClick, disableEscClose]);

  /* ─── 트리거 cloneElement: onClick + aria + ref ─── */
  if (!isValidElement(trigger)) {
    return <>{trigger}</>;
  }

  const triggerProps = (trigger.props ?? {}) as Record<string, unknown>;
  const enhancedTrigger = cloneElement(trigger, {
    "aria-haspopup": "listbox",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? panelId : undefined,
    onClick: (e: React.MouseEvent) => {
      (triggerProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      if (!disabled) setOpen(!isOpen);
    },
  } as Record<string, unknown>);

  /* ─── 패널 placement style ─── */
  const panelStyle: CSSProperties = {
    position: "absolute",
    zIndex: 60,
    width,
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border-default)",
    borderRadius: 6,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: isOpen ? "flex" : "none",
    flexDirection: "column",
    maxHeight: 360,
  };
  switch (placement) {
    case "bottom-start":
      panelStyle.top = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.left = 0;
      break;
    case "bottom-end":
      panelStyle.top = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.right = 0;
      break;
    case "top-start":
      panelStyle.bottom = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.left = 0;
      break;
    case "top-end":
      panelStyle.bottom = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.right = 0;
      break;
  }

  /* ─── options 모드 토글 ─── */
  const toggleOption = (optValue: string) => {
    if (!onChange) return;
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-flex ${className}`}
      style={{ verticalAlign: "top" }}
    >
      {enhancedTrigger}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label={typeof title === "string" ? title : "필터"}
        style={panelStyle}
      >
        {/* 헤더 — title 있으면. font-bold 적용(타이포 위계 정책).
            하단 border 없음 — 헤더 bold + 옵션 regular 의 font weight 차이로 위계 충분.
            spacing 만으로 헤더 / 본문 분리 (padding bottom 6 + body padding top 4 = 10px 공백). */}
        {title && (
          <div
            className="flex items-center justify-between text-md font-bold text-primary"
            style={{ padding: "10px 12px 6px" }}
          >
            <span>{title}</span>
            {options && value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange?.([])}
                className="text-sm font-medium text-tertiary hover:text-secondary"
                style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
              >
                모두 해제
              </button>
            )}
          </div>
        )}
        {/* body */}
        <div
          className="flex-1 overflow-auto"
          style={{ padding: options ? (title ? "4px 12px 8px" : "8px 12px") : 0 }}
        >
          {options ? (
            <ul className="flex flex-col gap-1" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {options.map((opt) => (
                <li key={opt.value}>
                  <FilterDropdownOptionItem
                    option={opt}
                    checked={value.includes(opt.value)}
                    onToggle={() => toggleOption(opt.value)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            children
          )}
        </div>
        {/* footer — 액션 영역 명시 분리. inline border (utility class 의존 회피). */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2"
            style={{ padding: "8px 12px", borderTop: "1px solid var(--color-border-soft)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
