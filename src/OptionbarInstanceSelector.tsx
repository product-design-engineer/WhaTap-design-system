/**
 * 인스턴스 셀렉터 (OptionbarPage 공용 컴포넌트).
 *
 * 라이브 SaaS-PG OptionbarPage의 "인스턴스" 항목 마크업 그대로:
 *   - 폭 180px
 *   - 1px solid var(--color-border-divider) 보더 + rounded 2
 *   - 좌측 상태 dot (status: ok/warn/error/idle) + 인스턴스 라벨 (Roboto 13px)
 *   - 우측 16×16 chevron-down 토글 (20×20 hit-area)
 *
 * 정책: feedback-decision-priorities (재활용), feedback-design-system-css-source
 * (라이브 마크업·아이콘 그대로). 색은 라이브 토큰(var(--color-border-divider)/#222/#00C853/var(--color-indicator-warning)/
 * var(--color-indicator-critical)/var(--color-text-tertiary)) 유지.
 */
export type InstanceStatus = "ok" | "warn" | "error" | "idle";

const STATUS_COLOR: Record<InstanceStatus, string> = {
  ok: "#00C853",
  warn: "var(--color-indicator-warning)",
  error: "var(--color-indicator-critical)",
  idle: "var(--color-border-divider)",
};

export default function OptionbarInstanceSelector({
  title = "인스턴스",
  width = 180,
  label,
  status = "ok",
  open = false,
  onToggle,
}: {
  title?: string;
  width?: number;
  /** 선택된 인스턴스 라벨 (예: "DMX-3-12-949") */
  label: string;
  status?: InstanceStatus;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      {title && (
        <div
          className="text-base font-bold text-primary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </div>
      )}
      <div style={{ width, position: "relative" }}>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between w-full bg-white border border-[color:var(--color-border-divider)] rounded-[2px] cursor-pointer hover:opacity-70 transition-shadow"
          style={{
            minHeight: 32,
            padding: "5px 4px 5px 8px",
          }}
        >
          {/* 선택값 영역 */}
          <div className="flex items-center gap-[4px] min-w-0 flex-1 pr-[4px]">
            <span
              className="shrink-0 size-[8px] rounded-full"
              style={{ background: STATUS_COLOR[status] }}
            />
            <span
              className="text-md truncate leading-normal"
              style={{
                fontFamily: "var(--font-family-numeric)",
                fontWeight: "var(--font-weight-regular)",
                color: "var(--color-text-primary)",
              }}
              title={label}
            >
              {label}
            </span>
          </div>

          {/* 우측 chevron-down */}
          <span
            className="flex items-center justify-center shrink-0"
            style={{ width: 20, height: 20, color: "var(--color-text-tertiary)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 180ms",
              }}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="m6.149 7.45-1.07 1.295 5.022 4.705 4.979-4.705-1.028-1.295-3.951 3.73z"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
