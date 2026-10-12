/**
 * Tooltip — Primitives layer.
 *
 * ## Purpose
 * hover/focus 시 트리거 옆에 짧은 보조 정보 표시. 폼 helper, DataTable 행 hover 상세,
 * 헤더 아이콘 설명 등 페이지 전반의 microcopy 채널.
 *
 * ## When to use
 * - 아이콘 only 버튼의 라벨 (ARIA + 시각 양쪽)
 * - 짧은 helper text (1-2 문장)
 * - hover 시 추가 메타 (생성 시각, 권한, 단위 설명 등)
 *
 * ## When NOT to use
 * - 글자(라벨 · 값 · 문장)에 설명을 다는 자리 → [[InfoTip]]. 글자에 밑줄을 그어 트리거로 쓰지 않는다(patterns §16)
 * - 클릭 액션을 담아야 함 → `Popover` (별도 컴포넌트)
 * - 긴 본문 (3 문장+) → `AiInsightSection` 또는 inline 본문
 * - 모달 같은 무거운 컨테이너 → `Modal`
 *
 * ## Composition rules
 * - 토큰만 — bg `--color-text-strong` · fg `--color-bg` (테마 반전 대비) · 그림자 `--shadow-sm`. 리터럴 금지.
 * - 트리거는 children 한 개. 키보드(`Tab` focus + `Escape`) 지원
 * - 4 방향(top/right/bottom/left) — top default
 * - delay (hover 200ms / focus 즉시) 으로 spam 방지
 * - 패널은 `createPortal` + `position: fixed` — 트리거 조상의 `overflow: hidden`
 *   (예: [[Sidebar]] Min 모드)에 잘리지 않음. 좌표는 열릴 때 트리거 rect 로 계산,
 *   스크롤/리사이즈 시 재계산.
 * - 트리거가 행처럼 폭을 채워야 하면 `block` — 래퍼가 `flex + width:100%` 로 전환.
 *
 * @example
 * ```tsx
 * <Tooltip content="평일 09–19시 알림만 ON">
 *   <button>?</button>
 * </Tooltip>
 *
 * <Tooltip content="권한이 없습니다" placement="bottom">
 *   <Button disabled>삭제</Button>
 * </Tooltip>
 * ```
 */
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export type TooltipProps = {
  /** 툴팁 본문 — 1-2 문장 권장. */
  content: ReactNode;
  /** 트리거 한 개 (button/icon 등). cloneElement 로 ARIA 주입. */
  children: ReactElement;
  /** 배치 — default top. */
  placement?: TooltipPlacement;
  /** hover 시 표시 지연 ms — default 200. focus 는 즉시. */
  hoverDelayMs?: number;
  /** 강제 표시 (디버그/Storybook). undefined 면 자동. */
  open?: boolean;
  /** 비활성 — disabled tooltip 일 때. */
  disabled?: boolean;
  /** 트리거가 폭을 채우는 행(row)일 때 — 래퍼를 `flex + width:100%` 로 전환. default false(inline). */
  block?: boolean;
};

const OFFSET_PX = 6;

/** 트리거 rect 기준 fixed 좌표 — portal 패널이 조상 overflow 에 잘리지 않게 viewport 기준 배치. */
function fixedPosition(rect: DOMRect, placement: TooltipPlacement): React.CSSProperties {
  switch (placement) {
    case "top":
      return { top: rect.top - OFFSET_PX, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
    case "bottom":
      return { top: rect.bottom + OFFSET_PX, left: rect.left + rect.width / 2, transform: "translate(-50%, 0)" };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - OFFSET_PX, transform: "translate(-100%, -50%)" };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + OFFSET_PX, transform: "translate(0, -50%)" };
  }
}

export default function Tooltip({
  content,
  children,
  placement = "top",
  hoverDelayMs = 200,
  open: forcedOpen,
  disabled = false,
  block = false,
}: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  const isOpen = forcedOpen ?? visible;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // 열릴 때 트리거 rect 로 fixed 좌표 계산 — 스크롤/리사이즈 동안 추적
  useLayoutEffect(() => {
    if (!isOpen || disabled) return;
    const update = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setPos(fixedPosition(rect, placement));
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, disabled, placement]);

  // Escape 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const show = () => {
    if (disabled) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(true), hoverDelayMs);
  };
  const showImmediate = () => {
    if (disabled) return;
    window.clearTimeout(timerRef.current);
    setVisible(true);
  };
  const hide = () => {
    window.clearTimeout(timerRef.current);
    setVisible(false);
  };

  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  const triggerProps = (children.props ?? {}) as Record<string, unknown>;
  const enhancedTrigger = cloneElement(children, {
    "aria-describedby": isOpen ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      (triggerProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      (triggerProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      (triggerProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
      showImmediate();
    },
    onBlur: (e: React.FocusEvent) => {
      (triggerProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
      hide();
    },
  } as Record<string, unknown>);

  // wrapper: 트리거 rect 측정 기준. block 이면 행(row) 트리거가 폭을 채우도록 flex 전환.
  const wrapperStyle: React.CSSProperties = block
    ? { display: "flex", width: "100%" }
    : { display: "inline-flex" };

  // panel: portal + fixed — 조상 overflow-hidden(예: Sidebar Min)에 잘리지 않음.
  // 색·그림자·타이포 전부 토큰 binding — 리터럴 금지.
  const showPanel = isOpen && !disabled && pos !== null;
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    ...(pos ?? { top: -9999, left: -9999 }),
    /* Modal(1000) 위에 서야 한다. 50 이던 때는 모달 안 툴팁이 백드롭 뒤에 깔려 보이지 않았다(2026-10-07). */
    zIndex: 1100,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    backgroundColor: "var(--color-text-strong)",
    color: "var(--color-text-inverse)",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--leading-snug)",
    boxShadow: "var(--shadow-sm)",
    opacity: showPanel ? 1 : 0,
    transition: "opacity 120ms",
  };

  return (
    <span ref={wrapperRef} style={wrapperStyle}>
      {enhancedTrigger}
      {createPortal(
        <span id={id} role="tooltip" style={panelStyle} aria-hidden={!isOpen}>
          {content}
        </span>,
        document.body,
      )}
    </span>
  );
}
