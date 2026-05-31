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
 * - 클릭 액션을 담아야 함 → `Popover` (별도 컴포넌트)
 * - 긴 본문 (3 문장+) → `AiInsightSection` 또는 inline 본문
 * - 모달 같은 무거운 컨테이너 → `Modal`
 *
 * ## Composition rules
 * - 토큰만 — bg는 #1E1E1E (text-strong) 톤, fg는 #FFF (시인성)
 * - 트리거는 children 한 개. 키보드(`Tab` focus + `Escape`) 지원
 * - 4 방향(top/right/bottom/left) — top default
 * - delay (hover 200ms / focus 즉시) 으로 spam 방지
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
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

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
};

const OFFSET_PX = 6;

export default function Tooltip({
  content,
  children,
  placement = "top",
  hoverDelayMs = 200,
  open: forcedOpen,
  disabled = false,
}: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const isOpen = forcedOpen ?? visible;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

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

  // wrapper: position 컨테이너
  const wrapperStyle: React.CSSProperties = { position: "relative", display: "inline-flex" };

  // panel placement
  const panelStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 50,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    backgroundColor: "var(--color-text-strong)",
    color: "#fff",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--leading-snug)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    opacity: isOpen && !disabled ? 1 : 0,
    transition: "opacity 120ms",
  };

  switch (placement) {
    case "top":
      panelStyle.bottom = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.left = "50%";
      panelStyle.transform = "translateX(-50%)";
      break;
    case "bottom":
      panelStyle.top = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.left = "50%";
      panelStyle.transform = "translateX(-50%)";
      break;
    case "left":
      panelStyle.right = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.top = "50%";
      panelStyle.transform = "translateY(-50%)";
      break;
    case "right":
      panelStyle.left = `calc(100% + ${OFFSET_PX}px)`;
      panelStyle.top = "50%";
      panelStyle.transform = "translateY(-50%)";
      break;
  }

  return (
    <span style={wrapperStyle}>
      {enhancedTrigger}
      <span id={id} role="tooltip" style={panelStyle} aria-hidden={!isOpen}>
        {content}
      </span>
    </span>
  );
}
