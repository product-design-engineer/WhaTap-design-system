/**
 * Toast — 시스템 수준 알림 (상단 중앙 fixed, 자동 dismiss).
 *
 * 시나리오 안에서 "AiExecutionResult" 와 같은 액션 결과가 위젯 안에 노출된 뒤,
 * 위젯 밖에서도 한 번 더 시각 확인이 필요한 경우 사용 (예: 알림 규칙 등록 완료).
 *
 * 정책: feedback-decision-priorities — 위젯 메시지와 정보 중복을 피하기 위해
 *   toast는 짧은 한 줄 + 선택적 action 만. 상세는 위젯에 둠.
 */
import { useEffect } from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "success" | "info" | "warning" | "error";

const VARIANT_COLOR: Record<ToastVariant, { dot: string; bg: string }> = {
  success: { dot: "#00B442", bg: "#E8F8EE" },
  info:    { dot: "#296CF2", bg: "#E8F0FE" },
  warning: { dot: "#FF8800", bg: "#FFF4E5" },
  error:   { dot: "#F34747", bg: "#FDECEC" },
};

export default function Toast({
  open,
  variant = "success",
  message,
  actionLabel,
  onAction,
  onClose,
  durationMs = 4500,
}: {
  open: boolean;
  variant?: ToastVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  /** 자동 dismiss 시간 (ms). 0이면 수동 닫기만. */
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open || durationMs === 0) return;
    const id = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(id);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const { dot } = VARIANT_COLOR[variant];

  const toastNode = (
    <div
      className="fixed top-[20px] left-1/2 z-[9999]"
      style={{
        animation: "toastSlideDown 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        transform: "translate(-50%, 0)",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-[12px] bg-white border border-[#eaeaea] rounded-[8px] px-[16px] py-[10px]"
        style={{
          boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          fontFamily: "var(--font-family-korean)",
        }}
      >
        {/* variant dot/icon */}
        <span
          className="flex items-center justify-center size-[18px] rounded-full shrink-0"
          style={{ background: dot }}
        >
          {variant === "success" && (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
        <span className="text-md font-bold text-primary tracking-default leading-normal whitespace-nowrap">
          {message}
        </span>
        {actionLabel && (
          <button
            type="button"
            onClick={() => {
              onAction?.();
              onClose?.();
            }}
            className="text-md text-brand-blue tracking-default leading-none cursor-pointer hover:underline shrink-0"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
          >
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex items-center justify-center size-[16px] cursor-pointer hover:opacity-70 shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1l-8 8" stroke="#757575" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(toastNode, document.body);
}
