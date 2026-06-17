/**
 * Modal — Primitives layer.
 *
 * ## Purpose
 * Overlay dialog primitive. 페이지·드로어·confirmation 등의 base.
 * 인라인 `<div className="fixed inset-0 ...">` 새로 짜지 말 것 — backdrop·focus·ESC
 * 일관성은 이 컴포넌트가 보장.
 *
 * **위젯에서 사용 금지** — `feedback_widget_readonly_policy` 0. 대전제. Modal 은 페이지
 * 컨텍스트에서만 호출.
 *
 * ## When to use
 * - 페이지 confirmation ("정말 삭제하시겠습니까?")
 * - 사용자별 상세 편집 폼 (사용자 list 행 클릭)
 * - JSON 일괄 수정 등 정밀 입력 폼
 * - 시뮬레이션 결과 미리보기
 *
 * ## When NOT to use
 * - 작은 hover 라벨 → `Tooltip`
 * - 우측 슬라이드 패널 → `Drawer` (별개 컴포넌트, 추후)
 * - 비차단 알림 → `Toast`
 * - 인라인 본문 → 페이지 본문에 직접
 *
 * ## Composition rules
 * - Portal 로 `document.body` 에 마운트 — `overflow:hidden` 부모 영향 회피
 * - role="dialog" + aria-modal="true" + aria-labelledby (title) + aria-describedby (description)
 * - 3 채널 닫기: × 버튼 / ESC / backdrop 클릭 (각각 prop 으로 disable 가능)
 * - open 시 첫 focusable 요소로 focus 이동 (× 버튼 기본)
 * - 색·간격: surface 흰 배경 / border-default 외곽 / rgba(0,0,0,0.4) backdrop
 *
 * @example
 * ```tsx
 * <Modal open={open} onClose={close} title="삭제 확인" size="sm"
 *   footer={<>
 *     <Button onClick={close}>취소</Button>
 *     <Button tone="critical" onClick={confirm}>삭제</Button>
 *   </>}>
 *   이 룰을 삭제하시겠습니까? 되돌릴 수 없습니다.
 * </Modal>
 * ```
 */
import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  /** controlled open. */
  open: boolean;
  /** 닫기 콜백 — 3채널(× / ESC / backdrop) 모두 호출. */
  onClose: () => void;
  /** 사이즈 — sm(400px) / md(560px) / lg(720px) width. */
  size?: ModalSize;
  /** 상단 타이틀. */
  title?: ReactNode;
  /** 타이틀 아래 보조 설명 (선택). */
  description?: ReactNode;
  /** 본문. */
  children?: ReactNode;
  /** 하단 액션 영역 (보통 우측 정렬된 버튼 1-2개). */
  footer?: ReactNode;
  /** 우상단 × 버튼 숨김. default false. */
  hideCloseButton?: boolean;
  /** backdrop 클릭으로 닫기 비활성. default false. */
  disableBackdropClose?: boolean;
  /** ESC 키로 닫기 비활성. default false. */
  disableEscClose?: boolean;
  /** Portal mount target. default = document.body. */
  container?: HTMLElement | null;
  /** 외부 className — panel 에 추가. */
  className?: string;
};

const SIZE_WIDTH: Record<ModalSize, number> = {
  sm: 400,
  md: 560,
  lg: 720,
};

export default function Modal({
  open,
  onClose,
  size = "md",
  title,
  description,
  children,
  footer,
  hideCloseButton = false,
  disableBackdropClose = false,
  disableEscClose = false,
  container,
  className = "",
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ─── ESC 처리 ─── */
  useEffect(() => {
    if (!open || disableEscClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, disableEscClose, onClose]);

  /* ─── open 시 close 버튼으로 focus 이동 (없으면 panel) ─── */
  useEffect(() => {
    if (!open) return;
    // 한 tick 뒤 — portal 마운트 완료 후
    const t = window.setTimeout(() => {
      if (!hideCloseButton && closeBtnRef.current) {
        closeBtnRef.current.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, hideCloseButton]);

  /* ─── body scroll lock (open 동안) ─── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;

  const backdropStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    animation: "modalBackdropFadeIn 120ms ease",
  };

  const panelStyle: CSSProperties = {
    backgroundColor: "var(--color-card)",
    borderRadius: 8,
    border: "1px solid var(--color-border-default)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
    width: "100%",
    maxWidth: SIZE_WIDTH[size],
    maxHeight: "calc(100vh - 32px)",
    display: "flex",
    flexDirection: "column",
    animation: "modalPanelFadeIn 160ms ease",
  };

  return createPortal(
    <div
      role="presentation"
      style={backdropStyle}
      onMouseDown={(e) => {
        // backdrop 클릭만 닫기, panel 내부 mousedown 은 무시
        if (e.target === e.currentTarget && !disableBackdropClose) {
          onClose();
        }
      }}
    >
      {/* inline keyframes — tokens.css 의존 줄임 (Modal 만 쓰는 한정 애니메이션) */}
      <style>{`
        @keyframes modalBackdropFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalPanelFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        style={panelStyle}
        className={className}
      >
        {(title || !hideCloseButton) && (
          <div
            className="flex items-start justify-between gap-3"
            style={{
              padding: "16px 20px 12px",
              borderBottom: description ? "0" : "0",
            }}
          >
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-md font-bold text-primary"
                  style={{ margin: 0, lineHeight: "var(--leading-snug)" }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descId}
                  className="text-sm text-secondary"
                  style={{ margin: "4px 0 0", lineHeight: "var(--leading-normal)" }}
                >
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-tertiary transition-colors hover-bg-color-var-color-surface-100 hover:text-primary"
                style={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  border: 0,
                  backgroundColor: "transparent",
                  marginTop: -4,
                  marginRight: -6,
                }}
              >
                <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden>
                  <path
                    d="M3 3 L11 11 M11 3 L3 11"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div
          className="flex-1 overflow-auto text-base text-primary"
          style={{ padding: title || !hideCloseButton ? "4px 20px 16px" : "20px" }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2"
            style={{
              padding: "12px 20px 16px",
              borderTop: "1px solid var(--color-border-soft)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    target,
  );
}
