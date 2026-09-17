/**
 * ActionMenu — 트리거를 누르면 펼쳐지는 «행동» 목록. Composite layer.
 *
 * ## Purpose
 * 버튼 하나에 갈래가 여럿 매달릴 때 그 갈래를 담는 패널. 「＋ 보고서 ▾」 를 누르면
 * 「AI 보고서 / 정기 보고서 템플릿」 이 나오는 자리다. 고르는 순간 패널은 닫히고 **일이 시작된다** —
 * 값이 바뀌는 것이 아니다.
 *
 * 이 자리를 컴포넌트로 두는 이유는, 없을 때 소비자가 매번 `absolute` div 에 맨 `<button>` 을
 * 늘어놓았기 때문이다. 그렇게 짜면 바깥 클릭으로 닫히지 않거나, ESC 가 안 먹거나,
 * hover 색이 화면마다 달라진다. 실제로 세 가지가 전부 어긋나 있었다.
 *
 * ## When to use
 * - 한 버튼에 **행동**이 둘 이상 매달릴 때 (생성 갈래 · 내보내기 형식 · 행 단위 `⋮`).
 * - 행마다 붙는 케밥(`⋮`) 메뉴 — 수정 · 복제 · 삭제.
 *
 * ## When NOT to use
 * - **값을 고르는 것** → [[Select]](단일) · [[FilterDropdown]](다중). 고른 뒤에도 그 값이
 *   트리거에 남아 있어야 하면 그건 메뉴가 아니라 선택이다.
 * - 행동이 **하나뿐**일 때 → [[Button]] 그대로. 갈래가 없는데 ▾ 를 붙이면 한 번 더 누르게 만든다.
 * - 답을 받아야 진행되는 것 → [[Modal]]. 메뉴는 막지 않는다.
 * - 화면 이동 묶음 → [[SidebarMenuItem]] 의 `children`.
 *
 * ## Composition rules
 * - 트리거는 **밖에서 받는다**(`trigger`) — [[Button]] · [[ToolbarIconButton]] 무엇이든.
 *   `onClick` · `aria-haspopup` · `aria-expanded` 는 이 컴포넌트가 주입하므로 직접 달지 않는다.
 * - 줄은 [[ActionMenuItem]] 이 그린다. `items` 로 주거나, 더 자유로운 본문이 필요하면
 *   `children` 으로 짜되 그 안에서도 [[ActionMenuItem]] 을 쓴다 — 맨 `<button>` 을 늘어놓지 않는다.
 * - **고르면 닫힌다.** `onSelect` 뒤에 패널을 열어 두지 않는다. 열어 두면 방금 시킨 일이
 *   끝난 것인지 아닌지 알 수 없다.
 * - 패널은 `absolute` 다([[FilterDropdown]] 과 같은 방식) — portal 을 쓰지 않는다. 대신
 *   **감싸는 쪽에 `overflow: hidden` 이 있으면 잘린다.** 잘리는 자리에서는 [[Modal]] 로 바꾼다.
 * - 색·테두리는 토큰만(`--color-card` · `--color-border-default` · `--shadow-md`). hex 금지.
 * - 항목이 일곱을 넘으면 메뉴가 아니라 목록이다 — 검색이 붙는 [[FilterDropdown]] 이나
 *   별도 화면으로 옮긴다.
 *
 * ## ARIA
 * - 트리거: `aria-haspopup="menu"` + `aria-expanded`
 * - 패널: `role="menu"`, 줄은 `role="menuitem"`
 * - `↑`/`↓` 로 줄 사이 이동, `Esc` 로 닫고 트리거로 포커스 복귀
 *
 * @example
 * ```tsx
 * <ActionMenu
 *   trigger={<Button variant="contained" tone="primary" size="lg">＋ 보고서 ▾</Button>}
 *   placement="bottom-end"
 *   items={[
 *     { key: "ai",      label: "AI 보고서",        description: "대화로 조건을 잡는다", onSelect: startAi },
 *     { key: "regular", label: "정기 보고서 템플릿", onSelect: startRegular },
 *   ]}
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
  type ReactElement,
  type ReactNode,
} from "react";
import ActionMenuItem, { type ActionMenuItemTone } from "./ActionMenuItem";

/** 펼침 위치. 트리거가 화면 오른쪽에 붙어 있으면 `bottom-end`. */
export type ActionMenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export type ActionMenuAction = {
  /** React key. 라벨이 겹쳐도 되도록 따로 받는다. */
  key: string;
  /** 줄에 적히는 말. 되도록 동사로. */
  label: ReactNode;
  /** 보조 한 줄 — 무슨 일이 일어나는지. */
  description?: ReactNode;
  /** 좌측 아이콘. 한 메뉴 안에서는 전부 넣거나 전부 뺀다. */
  icon?: ReactNode;
  /** 성격. `critical` 은 되돌릴 수 없는 일에만. */
  tone?: ActionMenuItemTone;
  /** 비활성. */
  disabled?: boolean;
  /** 고르면 할 일. 끝나면 패널은 자동으로 닫힌다. */
  onSelect?: () => void;
};

export type ActionMenuProps = {
  /** 트리거 ReactElement — onClick · aria 는 자동 주입. */
  trigger: ReactElement;
  /** 줄 목록. 일곱을 넘기면 메뉴가 아니라 목록이다. */
  items?: ActionMenuAction[];
  /** 자유 본문 — `items` 대신 직접 짤 때. 그 안에서도 [[ActionMenuItem]] 을 쓴다. */
  children?: ReactNode;
  /** 펼침 위치. 기본 bottom-start. */
  placement?: ActionMenuPlacement;
  /** 패널 width(px). 기본 200. */
  width?: number;
  /** controlled open. 미지정 시 내부 상태. */
  open?: boolean;
  /** open 변경 콜백. */
  onOpenChange?: (open: boolean) => void;
  /** 트리거 비활성. */
  disabled?: boolean;
  /** 외부 className — wrapper. */
  className?: string;
};

const OFFSET_PX = 4;

export default function ActionMenu({
  trigger,
  items,
  children,
  placement = "bottom-start",
  width = 200,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className = "",
}: ActionMenuProps) {
  const panelId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = (controlledOpen ?? internalOpen) && !disabled;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  /* ─── outside-click + ESC + 화살표 이동 ───
     mousedown 이 onClick 보다 먼저 — 바깥 버튼을 누르면 패널이 닫히고 그 버튼의 동작은 그대로. */
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        /* 포커스를 트리거로 되돌린다 — 안 그러면 키보드 사용자가 문서 처음으로 떨어진다. */
        wrapperRef.current?.querySelector<HTMLElement>("[aria-haspopup='menu']")?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

      const rows = Array.from(
        panelRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']:not([disabled])") ?? [],
      );
      if (rows.length === 0) return;
      e.preventDefault();
      const at = rows.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === "ArrowDown" ? (at + 1) % rows.length : (at <= 0 ? rows.length : at) - 1;
      rows[next]?.focus();
    };

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isValidElement(trigger)) return <>{trigger}</>;

  const triggerProps = (trigger.props ?? {}) as Record<string, unknown>;
  const enhancedTrigger = cloneElement(trigger, {
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? panelId : undefined,
    onClick: (e: React.MouseEvent) => {
      (triggerProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      /* 바깥에 걸린 「아무 데나 누르면 닫기」 핸들러가 이 클릭까지 먹어 메뉴가 열리자마자
         닫히는 일이 흔하다 — 트리거 클릭은 여기서 멈춘다. */
      e.stopPropagation();
      if (!disabled) setOpen(!isOpen);
    },
  } as Record<string, unknown>);

  const vertical = placement.startsWith("bottom")
    ? { top: `calc(100% + ${OFFSET_PX}px)` }
    : { bottom: `calc(100% + ${OFFSET_PX}px)` };
  const horizontal = placement.endsWith("end") ? { right: 0 } : { left: 0 };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {enhancedTrigger}
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          className="absolute bg-card border border-color-var-color-border-default rounded-8px"
          style={{
            ...vertical,
            ...horizontal,
            width,
            zIndex: 20,
            padding: "4px 0",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {children ??
            items?.map((a) => (
              <ActionMenuItem
                key={a.key}
                label={a.label}
                description={a.description}
                icon={a.icon}
                tone={a.tone}
                disabled={a.disabled}
                /* 고르면 닫힌다 — 열어 두면 시킨 일이 끝났는지 알 수 없다. */
                onSelect={() => {
                  setOpen(false);
                  a.onSelect?.();
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
