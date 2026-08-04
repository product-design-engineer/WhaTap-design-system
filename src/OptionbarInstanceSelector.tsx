/**
 * OptionbarInstanceSelector — 상태 dot + 라벨 + chevron 의 인스턴스 셀렉터.
 *
 * ## Purpose
 * 옵션바 "인스턴스" 항목 — 좌측 상태 dot(`status`: ok/warn/error/idle) + 선택된
 * 인스턴스 라벨 + 우측 chevron-down 토글로 구성된 드롭다운 트리거 버튼.
 * 높이는 `size` — `sm`(24px, **기본**) / `md`(32px).
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
 * - 폭 `width`(기본 180px), minHeight 은 `size` 로 결정(sm 24px 기본 / md 32px), 1px border-divider + rounded 2.
 * - `sm` 은 padding·dot·chevron·라벨 타이포가 함께 내려가 32px 과 같은 비율을 유지
 *   ([[LiveTimerCompact]] `size="sm"` 과 같은 24px 라인).
 * - status → dot 색은 `STATUS_COLOR` 매핑(ok #00C853 / warn·error·idle 토큰) 고정.
 * - 라벨은 numeric 폰트 + truncate. chevron 은 `open` 시 180deg 회전.
 * - `title=""` 이면 내부 title 렌더 억제(부모가 라벨을 그릴 때 중복 방지).
 *
 * @example
 * ```tsx
 * <OptionbarInstanceSelector size="sm" title="" label="DMX-3-12-949" status="ok" />
 *
 * <OptionbarInstanceSelector
 *   label="DMX-3-12-949"
 *   status="ok"
 *   open={open}
 *   onToggle={() => setOpen((v) => !v)}
 * />
 * ```
 */
export type InstanceStatus = "ok" | "warn" | "error" | "idle";
export type OptionbarInstanceSelectorSize = "sm" | "md";

/** 사이즈 스펙 — md(32px) 는 기존 값 verbatim, sm(24px) 은 한 단계 아래. */
const SIZE = {
  md: { minHeight: 32, padding: "5px 4px 5px 8px", dot: "size-8px", label: "text-md", chevronBox: 20, chevron: 16 },
  sm: { minHeight: 24, padding: "3px 2px 3px 6px", dot: "size-6px", label: "text-base", chevronBox: 16, chevron: 14 },
} as const;

const STATUS_COLOR: Record<InstanceStatus, string> = {
  ok: "var(--color-status-success)",
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
  size = "sm",
}: {
  title?: string;
  width?: number;
  /** 선택된 인스턴스 라벨 (예: "DMX-3-12-949") */
  label: string;
  status?: InstanceStatus;
  open?: boolean;
  onToggle?: () => void;
  /** 높이 — sm(24px, **기본**) / md(32px). */
  size?: OptionbarInstanceSelectorSize;
}) {
  const spec = SIZE[size];
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
            minHeight: spec.minHeight,
            padding: spec.padding,
          }}
        >
          {/* 선택값 영역 */}
          <div className="flex items-center gap-4px min-w-0 flex-1 pr-4px">
            <span
              className={`shrink-0 ${spec.dot} rounded-full`}
              style={{ background: STATUS_COLOR[status] }}
            />
            <span
              className={`${spec.label} truncate leading-normal`}
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
            style={{ width: spec.chevronBox, height: spec.chevronBox, color: "var(--color-text-tertiary)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={spec.chevron}
              height={spec.chevron}
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
