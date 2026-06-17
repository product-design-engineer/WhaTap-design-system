/**
 * OptionbarInstanceSelector — 상태 dot + 라벨 + chevron 의 인스턴스 셀렉터.
 *
 * ## Purpose
 * 옵션바 "인스턴스" 항목 — 좌측 상태 dot(`status`: ok/warn/error/idle) + 선택된
 * 인스턴스 라벨 + 우측 chevron-down 토글로 구성된 32px 드롭다운 트리거 버튼.
 * 토글/오픈 상태는 `open`·`onToggle` 로 외부 제어(트리거만 제공, 옵션 패널은 호출측 책임).
 *
 * ## When to use
 * - [[OptionbarPage]] 의 "인스턴스" 항목.
 * - 상태 색 dot 으로 헬스를 즉시 보여줘야 하는 인스턴스 선택 트리거.
 *
 * ## When NOT to use
 * - 상태 dot 이 없는 일반 라벨 드롭다운(프리셋 등) → [[PresetSelect]].
 * - 시간 범위 선택 → [[TimeRangeSelector]].
 * - 일반 텍스트/검색 입력 → [[TextField]].
 *
 * ## Composition rules
 * - 폭 `width`(기본 180px), minHeight 32px, 1px border-divider + rounded 2.
 * - status → dot 색은 `STATUS_COLOR` 매핑(ok #00C853 / warn·error·idle 토큰) 고정.
 * - 라벨은 numeric 폰트 + truncate. chevron 은 `open` 시 180deg 회전.
 * - `title=""` 이면 내부 title 렌더 억제(부모가 라벨을 그릴 때 중복 방지).
 *
 * @example
 * ```tsx
 * <OptionbarInstanceSelector
 *   label="DMX-3-12-949"
 *   status="ok"
 *   open={open}
 *   onToggle={() => setOpen((v) => !v)}
 * />
 * ```
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
    <div className="flex flex-col gap-6px">
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
          className="flex items-center justify-between w-full bg-card border border-color-var-color-border-divider rounded-2px cursor-pointer hover-opacity-70 transition-shadow"
          style={{
            minHeight: 32,
            padding: "5px 4px 5px 8px",
          }}
        >
          {/* 선택값 영역 */}
          <div className="flex items-center gap-4px min-w-0 flex-1 pr-4px">
            <span
              className="shrink-0 size-8px rounded-full"
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
