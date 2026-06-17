/**
 * TimeRangeSelector — LIVE 토글 + 듀얼 datetime + duration 태그의 시간 범위 입력기.
 *
 * ## Purpose
 * LIVE 토글 · 이전/다음 이동 · 듀얼 datetime(`start`~`end`) 입력 · duration 태그 ·
 * 달력 버튼을 한 박스에 묶은 시간 범위 셀렉터. datetime 은 `YYYY-MM-DD HH:MM` 으로
 * 정규화 표시(month/day/hour/minute 2자리, year 4자리 자동 padding, numeric 폰트로
 * 자리수 정렬). 이동/달력/LIVE 동작은 `onLive`/`onPrev`/`onNext`/`onPickDate` 콜백으로 외부화.
 *
 * ## When to use
 * - 시작~종료 절대 시간 범위를 직접 입력/이동해야 하는 옵션바 "시간" 항목.
 * - LIVE 와 과거 범위 조회를 한 컨트롤에서 전환해야 할 때.
 *
 * ## When NOT to use
 * - LIVE 현재 시각 + polling 만 compact 하게 보여주면 충분 → [[LiveTimerCompact]].
 * - 옵션바 전체 행 구성 → [[OptionbarPage]] (이 컴포넌트를 항목으로 품을 수 있음).
 * - 일반 텍스트/숫자 입력 → [[TextField]].
 *
 * ## Composition rules
 * - 단일 border-divider + rounded 4 박스, LIVE 버튼과 datetime 영역을 1px divider 로 분할.
 * - `start`/`end` 는 padding 무관 date parts 입력, 표시 시 `pad2`/`pad4` 자동 적용.
 * - duration 태그는 #00B543 알약. 아이콘은 라이브 SVG·토큰 색 그대로.
 *
 * @example
 * ```tsx
 * <TimeRangeSelector
 *   start={{ year: "2026", month: "05", day: "15", hour: "13", minute: "27" }}
 *   end={{ year: "2026", month: "05", day: "15", hour: "13", minute: "37" }}
 *   durationLabel="10분"
 *   onLive={goLive}
 *   onPickDate={openCalendar}
 * />
 * ```
 */
import DateTimeBlock from "./DateTimeBlock";
import type { DateParts } from "./DateTimeBlock";

export default function TimeRangeSelector({
  title = "시간",
  start = { year: "2026", month: "05", day: "15", hour: "13", minute: "27" },
  end = { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  durationLabel = "10분",
  onLive,
  onPrev,
  onNext,
  onPickDate,
}: {
  title?: string;
  start?: DateParts;
  end?: DateParts;
  durationLabel?: string;
  onLive?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onPickDate?: () => void;
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
      <div className="flex items-stretch border border-color-var-color-border-divider rounded-4px bg-card overflow-hidden">
        {/* Live 토글 */}
        <button
          type="button"
          onClick={onLive}
          aria-label="LIVE"
          className="flex items-center justify-center px-6px cursor-pointer hover-bg-surface-100"
        >
          <IcLiveTime />
        </button>
        <div className="w-1px bg-color-var-color-border-divider" />

        {/* 듀얼 datetime + 컨트롤 */}
        <div className="flex items-center gap-6px px-6px py-6px">
          <button
            type="button"
            onClick={onPrev}
            aria-label="이전"
            className="flex items-center justify-center cursor-pointer hover-opacity-70"
          >
            <IcLeft />
          </button>

          <DateTimeBlock parts={start} side="start" />
          <span className="text-base text-tertiary">~</span>
          <DateTimeBlock parts={end} side="end" />

          <span
            className="flex items-center px-4px h-16px rounded-2px text-base font-bold text-white leading-none"
            style={{
              background: "#00B543",
              fontFamily: "var(--font-family-numeric)",
            }}
          >
            {durationLabel}
          </span>

          <button
            type="button"
            onClick={onPickDate}
            aria-label="달력"
            className="flex items-center justify-center cursor-pointer hover-opacity-70"
          >
            <IcStartDate />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="다음"
            className="flex items-center justify-center cursor-pointer hover-opacity-70"
          >
            <IcRight />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── icons (라이브 SVG 그대로) ─── */
function IcLiveTime() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="translate(2,2)" fill="#00C853">
        <path d="M10,0 C15.5228475,0 20,4.4771525 20,10 C20,15.5228475 15.5228475,20 10,20 C4.4771525,20 0,15.5228475 0,10 C0,4.4771525 4.4771525,0 10,0 Z M10,2 C5.581722,2 2,5.581722 2,10 C2,14.418278 5.581722,18 10,18 C14.418278,18 18,14.418278 18,10 C18,5.581722 14.418278,2 10,2 Z M8,6 L14,10 L8,14 L8,6 Z" />
      </g>
    </svg>
  );
}
function IcLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 25" fill="none" aria-hidden="true">
      <g fill="var(--color-text-tertiary)" transform="translate(6,3)">
        <path
          d="M1.5573935,17.4635366 L0.14317994,16.049323 L7.21417994,8.97797383 L0.14317994,1.9071874 L1.5573935,0.492973834 L10.0426749,8.97825521 L1.5573935,17.4635366 Z"
          transform="translate(5.092927, 8.978255) scale(-1, 1) translate(-5.092927, -8.978255)"
        />
      </g>
    </svg>
  );
}
function IcRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g fill="var(--color-text-tertiary)" transform="translate(7,3)">
        <path d="M1.5573935,17.4635366 L0.14317994,16.049323 L7.21417994,8.97797383 L0.14317994,1.9071874 L1.5573935,0.492973834 L10.0426749,8.97825521 L1.5573935,17.4635366 Z" />
      </g>
    </svg>
  );
}
function IcStartDate() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g fill="var(--color-text-tertiary)" transform="translate(2,2)">
        <path d="M2.66666667,0 C1.18666667,0 0.0133333333,0 0.0133333333,0 L0,20 C0,20 1.18666667,20 2.66666667,20 L20,20 C20,20 20,18.8 20,17.3333333 L20,2.66666667 C20,1.2 20,0 20,0 L2.66666667,0 Z M3.00087166,18 C2.4481055,18 2,17.5500512 2,16.9931545 L2,5.00684547 C2,4.45078007 2.44463086,4 3.00087166,4 L16.9991283,4 C17.5518945,4 18,4.44994876 18,5.00684547 L18,16.9931545 C18,17.5492199 17.5553691,18 16.9991283,18 L3.00087166,18 Z M4,7 L8,7 L8,11 L4,11 L4,7 Z" />
      </g>
    </svg>
  );
}
