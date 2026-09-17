/**
 * SelectPopover — 묶음과 색 표식을 가진 단일 선택 드롭다운. Composite layer.
 *
 * ## Purpose
 * 네이티브 `<select>` 로는 못 그리는 목록을 위한 선택 컨트롤. 옵션이 **묶음으로 갈리거나**
 * (부하 시간 / I/O / STAT / Wait Class), 옵션마다 **색 표식**이 붙어야 할 때 쓴다.
 * [[Select]] 문서가 「디자인 제어 필요 시 추후 SelectPopover」로 비워 둔 자리다.
 *
 * ## When to use
 * - 옵션이 성격별로 갈리고 그 갈래를 사람이 알아야 할 때 (묶음 헤더).
 * - 옵션이 화면 다른 곳의 색과 이어질 때 (대기 이벤트 색 · 시리즈 색).
 * - 목록이 길어 스크롤이 필요할 때 (기본 최대 높이 268px).
 *
 * ## When NOT to use
 * - 평평한 짧은 목록 → [[Select]]. 네이티브라 키보드·a11y 를 브라우저가 준다.
 * - 다중 선택 → [[FilterDropdown]].
 * - 상태 dot 이 붙은 인스턴스 선택 → [[OptionbarInstanceSelector]] + [[InstanceSelectPanel]].
 *
 * ## Composition rules
 * - 트리거 크기·표면은 [[Select]] 와 같다 — 같은 줄에 섞여도 어긋나지 않는다
 *   (`size` sm 24 / md 28 / lg 32, `--color-border-control` + `--radius-control`).
 * - **묶음 헤더는 고를 수 없다.** 헤더가 눌리면 값이 아닌 것이 값처럼 보인다.
 * - 색 표식(`swatch`)은 **화면 다른 곳과 같은 색**일 때만 단다. 목록에서만 쓰는 장식색은
 *   의미 없는 구분을 만든다.
 * - 팝오버는 트리거 아래 `absolute` — 부모가 `overflow` 로 자르면 호출측이 배치를 맡는다
 *   ([[InstanceSelectPanel]] 과 같은 규칙).
 * - 트리거를 갈아 끼울 수 있다(`trigger`) — [[FilterDropdown]] 과 같은 계약이다. 기본 트리거가
 *   앉을 수 없는 표면(컬러 배경 위 칩 따위)에서만 쓰고, 그 밖에는 기본형을 쓴다. 두 드롭다운이
 *   트리거를 받는 방식이 다르면 호출측이 어느 쪽인지 매번 확인해야 한다.
 * - 선택 항목은 배경 강조 + brand-blue. 체크 표시는 쓰지 않는다(단일 선택).
 *
 * @example
 * ```tsx
 * <SelectPopover
 *   label="정렬 기준"
 *   value={sort}
 *   onChange={setSort}
 *   groups={[
 *     { label: "부하 시간", options: [{ value: "elapsed", label: "Elapsed Time" }] },
 *     { label: "Wait Class", options: [{ value: "app", label: "Application", swatch: "var(--color-palette-3da9ff)" }] },
 *   ]}
 * />
 * ```
 */
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type SelectPopoverSize = "sm" | "md" | "lg";

export type SelectPopoverOption = {
  value: string;
  label: string;
  /** 앞에 붙는 색 표식 — 화면 다른 곳과 같은 색일 때만. */
  swatch?: string;
  disabled?: boolean;
};

export type SelectPopoverGroup = {
  /**
   * 묶음 헤더. 고를 수 없다. **비우면 헤더가 서지 않는다** — 갈래가 하나인 목록에서
   * 헤더는 아무것도 가르지 않으면서 한 줄을 차지하고, 옵션이 아닌 것이 목록 첫 줄에 선다.
   */
  label?: string;
  options: SelectPopoverOption[];
};

/** [[Select]] 와 같은 spec — 같은 줄에 섞여도 높이·글자가 어긋나지 않는다. */
const SIZE: Record<SelectPopoverSize, { h: number; padX: number; text: string }> = {
  sm: { h: 24, padX: 8, text: "text-sm" },
  md: { h: 28, padX: 10, text: "text-base" },
  lg: { h: 32, padX: 12, text: "text-md" },
};

export type SelectPopoverProps = {
  /** 상단 라벨 — [[Select]] 와 같은 필드 라벨 규칙(11px 고정). */
  label?: ReactNode;
  groups: SelectPopoverGroup[];
  value: string;
  onChange: (next: string) => void;
  size?: SelectPopoverSize;
  /** 목록 최대 높이(px). 기본 268. */
  maxListHeight?: number;
  /** 트리거 폭(px). 미지정 시 내용에 맞춘다. `trigger` 를 주면 쓰이지 않는다. */
  width?: number;
  disabled?: boolean;
  /**
   * 기본 트리거(Select 형 컨트롤) 대신 쓸 ReactElement. `onClick` · `aria-haspopup` ·
   * `aria-expanded` 를 DS 가 주입한다([[FilterDropdown]] 과 같은 계약).
   *
   * 기본 트리거는 흰 표면 + `--color-border-control` 이라 컬러 배경 위에서는 앉지 않는다.
   * 그런 자리에서 호출측이 칩 · 뱃지를 넘기게 하려고 열어 둔 문이다. `label` · `size` ·
   * `width` 는 기본 트리거의 spec 이므로 이때 함께 쓰지 않는다.
   */
  trigger?: ReactElement;
  /**
   * 팝오버 좌측 오프셋. 기본은 `0` — 트리거의 왼쪽 끝에 맞춘다.
   *
   * 트리거를 «감싼 표면» 이 좌우 여백을 가질 때 쓴다. 그때 트리거의 왼쪽은 그 표면의 안쪽이라,
   * 기본값으로 두면 패널이 표면 겉 테두리보다 여백만큼 들어가 서고 두 자산이 어긋나 보인다.
   * 감싼 여백과 «같은 토큰» 을 음수로 넘겨 표면 기준으로 되민다.
   */
  panelOffsetX?: number | string;
};

export default function SelectPopover({
  label,
  groups,
  value,
  onChange,
  size = "lg",
  maxListHeight = 268,
  width,
  disabled = false,
  trigger,
  panelOffsetX = 0,
}: SelectPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const spec = SIZE[size];

  /* 바깥을 누르면 닫는다 — 팝오버가 열린 채 다른 곳을 조작하면 어느 값이 살아있는지 흐려진다. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selected = groups.flatMap((g) => g.options).find((o) => o.value === value);

  return (
    <div className="wds-field inline-flex flex-col gap-1_5">
      {label !== undefined && label !== null && (
        <span className="text-sm font-medium text-primary">{label}</span>
      )}

      <div ref={rootRef} className="relative inline-flex" style={{ width }}>
        {/* 갈아 끼운 트리거 — onClick · aria 를 주입한다(호출측이 적어 둔 onClick 은 먼저 부른다). */}
        {trigger && isValidElement(trigger) ? (
          cloneElement(trigger, {
            "aria-haspopup": "listbox",
            "aria-expanded": open,
            onClick: (e: React.MouseEvent) => {
              (
                (trigger.props as Record<string, unknown>)?.onClick as
                  | ((e: React.MouseEvent) => void)
                  | undefined
              )?.(e);
              if (!disabled) setOpen((v) => !v);
            },
          } as Record<string, unknown>)
        ) : (
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full bg-card rounded-control transition-colors cursor-pointer"
          style={{
            height: spec.h,
            paddingInline: spec.padX,
            gap: 6,
            border: `1px solid ${open ? "var(--color-brand-blue)" : "var(--color-border-control)"}`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span className={`flex items-center truncate ${spec.text} text-primary`} style={{ gap: 6 }}>
            {selected?.swatch && (
              <span
                className="rounded-2px shrink-0"
                style={{ width: 8, height: 8, background: selected.swatch }}
              />
            )}
            <span className="truncate">{selected?.label ?? ""}</span>
          </span>
          <span className="pointer-events-none inline-flex shrink-0 items-center text-tertiary" aria-hidden>
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
              <path
                d="M3 4.5 L6 7.5 L9 4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        )}

        {open && (
          <div
            role="listbox"
            className="absolute bg-card rounded-2px"
            style={{
              top: trigger ? "calc(100% + 4px)" : spec.h + 4,
              left: panelOffsetX,
              minWidth: "100%",
              width: "max-content",
              maxHeight: maxListHeight,
              overflowY: "auto",
              zIndex: 50,
              paddingBlock: 4,
              border: "1px solid var(--color-border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {groups.map((g, gi) => (
              <div key={g.label ?? gi}>
                {/* 묶음 헤더 — 고를 수 없다. 헤더가 눌리면 값이 아닌 것이 값처럼 보인다.
                    라벨이 없으면 가를 것이 없다는 뜻이므로 서지 않는다. */}
                {g.label && (
                  <div
                    className="flex items-end text-base text-tertiary"
                    style={{ height: 28, padding: "0 8px 2px" }}
                  >
                    {g.label}
                  </div>
                )}
                {g.options.map((o) => {
                  const active = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={o.disabled}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`flex items-center w-full text-left cursor-pointer transition-colors hover-bg-surface-100 ${
                        active ? "text-brand-blue font-medium" : "text-primary"
                      }`}
                      style={{
                        height: 28,
                        paddingInline: 8,
                        gap: 6,
                        border: "none",
                        background: active ? "var(--color-status-info-soft)" : "transparent",
                      }}
                    >
                      {o.swatch && (
                        <span
                          className="rounded-2px shrink-0"
                          style={{ width: 8, height: 8, background: o.swatch }}
                        />
                      )}
                      <span className="text-md truncate">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
