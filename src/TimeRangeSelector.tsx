/**
 * TimeRangeSelector — LIVE 토글 + 듀얼 datetime + duration 태그의 시간 범위 입력기.
 *
 * ## Purpose
 * LIVE 토글 · 이전/다음 이동 · 듀얼 datetime(`start`~`end`) 입력 · duration 태그 ·
 * 달력 버튼을 한 박스에 묶은 시간 범위 셀렉터. datetime 은 `YYYY-MM-DD HH:MM` 으로
 * 정규화 표시(month/day/hour/minute 2자리, year 4자리 자동 padding, numeric 폰트로
 * 자리수 정렬). 이동/달력/LIVE 동작은 `onLive`/`onPrev`/`onNext`/`onPickDate` 콜백으로 외부화.
 *
 * «최근 N분» 같은 상대 구간은 검색할 때 두 가지로 동작할 수 있다. **갱신**은 검색을 누를 때마다
 * 그 순간을 끝점으로 구간을 다시 계산하고(10:00 에 «최근 5분» → 09:55~10:00, 10:03 에 다시 검색 →
 * 09:58~10:03), **고정**은 처음 고른 순간의 구간을 그대로 다시 조회한다. 두 동작은 시간 표시만으로는
 * 구별되지 않아서 `rangeMode` 를 주면 셀렉터 오른쪽 끝에 지금의 동작을 글자로 세운다.
 * `rangeMode` 를 주지 않으면 예전과 똑같이 그려진다(기존 화면은 바뀌지 않는다).
 * — 갱신/고정 표시는 2026-10-26 시안이다. 기본값 · URL 공유 · 저장값 처리 정책은 아직 정해지지 않았다.
 *
 * ## When to use
 * - 시작~종료 절대 시간 범위를 직접 입력/이동해야 하는 옵션바 "시간" 항목.
 * - LIVE 와 과거 범위 조회를 한 컨트롤에서 전환해야 할 때.
 * - «최근 N분» 을 검색할 때 구간이 새로 계산되는지(갱신) 그대로인지(고정) 사용자가 알아야 할 때 → `rangeMode`.
 * - 사용자가 두 동작을 직접 고를 수 있어야 할 때 → `rangeMode` + `onRangeModeChange` (두 칸 토글).
 *
 * ## When NOT to use
 * - LIVE 현재 시각 + polling 만 compact 하게 보여주면 충분 → [[LiveTimerCompact]].
 * - 옵션바 전체 행 구성 → [[OptionbarPage]] (이 컴포넌트를 항목으로 품을 수 있음).
 * - 일반 텍스트/숫자 입력 → [[TextField]].
 * - 실제로 조회된 구간을 결과 위에 적을 때 → [[TimeChip]] (`label="조회 구간"`). 셀렉터는 «고르는» 자리이고 결과의 구간은 «읽는» 자리다.
 *
 * ## Composition rules
 * - 단일 `--color-border-control` + `--radius-control` 박스, LIVE 버튼과 datetime 영역을 1px divider 로 분할.
 * - `start`/`end` 는 padding 무관 date parts 입력, 표시 시 `pad2`/`pad4` 자동 적용.
 * - duration 태그는 #00B543 알약. 아이콘은 라이브 SVG·토큰 색 그대로.
 * - 갱신/고정 표시는 박스 오른쪽 끝, 1px divider 뒤에 선다. 아이콘만 두지 말고 «갱신»·«고정» 글자를 함께 쓴다 — 아이콘만으로는 두 동작을 구별하지 못한다.
 * - 갱신은 `--color-brand-blue`, 고정은 `--color-text-secondary`. 갱신을 경고색으로 칠하지 않는다 — 잘못된 상태가 아니라 동작의 종류다.
 * - 캘린더나 직접 입력으로 고른 구간은 항상 고정이다. 이때는 `onRangeModeChange` 를 넘기지 말 것 — 토글이 사라지고 «고정» 글자만 남는다.
 * - 갱신 모드는 저절로 다시 조회하지 않는다. 사용자가 검색을 누를 때만 다시 계산한다 — 저절로 흐르는 것은 LIVE 의 몫이다.
 * - 옆에 붙이는 검색 [[Button]] 은 `size="lg"`(32px) — 박스 높이 32px 와 맞춘다. 한 줄에서 높이가 다르면 바닥선이 어긋난다.
 *
 * ## Spec
 * - `rangeMode` 없음 → 기존과 같은 DOM(표시 영역이 아예 그려지지 않는다).
 * - `rangeMode` 만 → 읽기 전용 표시(아이콘 + 글자, 12px medium). Tooltip 으로 동작 설명.
 * - `rangeMode` + `onRangeModeChange` → 두 칸 토글 `[갱신 | 고정]`, 각 칸 `aria-pressed`, 그룹 `role="group" aria-label="최근 구간 동작"`.
 * - 눌린 칸: `bg-surface-100` + 모드 색 글자. 안 눌린 칸: `text-tertiary`, hover `bg-surface-100`.
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
 *
 * // «최근 10분» — 검색할 때마다 구간을 다시 계산하고, 사용자가 고정으로 바꿀 수 있다
 * <TimeRangeSelector durationLabel="최근 10분" rangeMode={mode} onRangeModeChange={setMode} />
 * ```
 */
import DateTimeBlock from "./DateTimeBlock";
import type { DateParts } from "./DateTimeBlock";
import Tooltip from "./Tooltip";

/** «최근 N분» 의 검색 동작 — rolling(갱신: 검색마다 다시 계산) · fixed(고정: 고른 구간 유지). */
export type TimeRangeMode = "rolling" | "fixed";

const MODE_LABEL: Record<TimeRangeMode, string> = { rolling: "갱신", fixed: "고정" };
const MODE_HINT: Record<TimeRangeMode, string> = {
  rolling: "검색할 때마다 그 시각을 끝점으로 구간을 다시 계산합니다",
  fixed: "처음 고른 구간을 그대로 다시 조회합니다",
};
const MODE_COLOR: Record<TimeRangeMode, string> = {
  rolling: "var(--color-brand-blue)",
  fixed: "var(--color-text-secondary)",
};

export default function TimeRangeSelector({
  title = "시간",
  start = { year: "2026", month: "05", day: "15", hour: "13", minute: "27" },
  end = { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  durationLabel = "10분",
  onLive,
  onPrev,
  onNext,
  onPickDate,
  rangeMode,
  onRangeModeChange,
}: {
  /** 상단 제목. 빈 문자열이면 제목 줄을 그리지 않는다. */
  title?: string;
  /** 시작 시각. 자릿수가 모자라도 표시할 때 채운다. */
  start?: DateParts;
  /** 종료 시각. */
  end?: DateParts;
  /** 녹색 알약 글자 — 「10분」 · 「최근 10분」. */
  durationLabel?: string;
  /** LIVE 버튼을 눌렀을 때. */
  onLive?: () => void;
  /** 이전 구간으로 이동. */
  onPrev?: () => void;
  /** 다음 구간으로 이동. */
  onNext?: () => void;
  /** 달력 버튼 — 호출측이 캘린더를 띄운다. 거기서 고른 구간은 고정이다. */
  onPickDate?: () => void;
  /**
   * «최근 N분» 의 검색 동작 표시 — `rolling`(갱신) · `fixed`(고정).
   * 생략하면 표시 영역을 그리지 않는다(기존 모양 그대로). 시안 — 정책 확정 전.
   */
  rangeMode?: TimeRangeMode;
  /** 넘기면 표시가 두 칸 토글이 되어 사용자가 동작을 바꿀 수 있다. 캘린더 · 직접 입력 구간에서는 넘기지 않는다. */
  onRangeModeChange?: (mode: TimeRangeMode) => void;
}) {
  return (
    <div className="flex flex-col gap-6px">
      {title && (
        <div
          className="text-base font-bold text-primary tracking-default"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </div>
      )}
      <div className="flex items-stretch border border-color-var-color-border-control rounded-control bg-card overflow-hidden">
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
            data-ds-policy-ok="success 알약 위 전경 — 컬러 배경 위 고정 흰색"
            // raw-color-ok: success 알약 위 전경 — 컬러 배경 위 고정 흰색.
            className="flex items-center px-4px h-16px rounded-2px text-base font-bold text-white"
            style={{
              background: "var(--color-status-success)",
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

        {rangeMode && (
          <>
            <div className="w-1px bg-color-var-color-border-divider" />
            <RangeModeIndicator mode={rangeMode} onChange={onRangeModeChange} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 갱신 / 고정 표시 (시안) ─── */
function RangeModeIndicator({
  mode,
  onChange,
}: {
  mode: TimeRangeMode;
  onChange?: (mode: TimeRangeMode) => void;
}) {
  if (!onChange) {
    return (
      <Tooltip content={MODE_HINT[mode]} placement="bottom">
        <span
          className="flex items-center gap-4px px-8px h-full text-base font-medium"
          style={{ color: MODE_COLOR[mode], fontFamily: "var(--font-family-korean)" }}
        >
          <ModeIcon mode={mode} />
          {MODE_LABEL[mode]}
        </span>
      </Tooltip>
    );
  }
  return (
    <div role="group" aria-label="최근 구간 동작" className="flex items-center gap-2px px-4px">
      {(["rolling", "fixed"] as const).map((m) => (
        <Tooltip key={m} content={MODE_HINT[m]} placement="bottom">
          <button
            type="button"
            aria-pressed={m === mode}
            onClick={() => m !== mode && onChange(m)}
            className={`flex items-center gap-4px px-6px h-20px rounded-2px text-base font-medium cursor-pointer ${
              m === mode ? "bg-surface-100" : "text-tertiary hover-bg-surface-100"
            }`}
            style={{
              color: m === mode ? MODE_COLOR[m] : undefined,
              fontFamily: "var(--font-family-korean)",
            }}
          >
            <ModeIcon mode={m} />
            {MODE_LABEL[m]}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

function ModeIcon({ mode }: { mode: TimeRangeMode }) {
  return mode === "rolling" ? (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.46-3.54" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.5 2h5l-.6 4.2L12.5 9h-9l2.6-2.8L5.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── icons (라이브 SVG 그대로) ─── */
function IcLiveTime() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* raw-color-ok: 라이브 디자인시스템 SVG 원본 그대로 — 픽셀 일치 보장(CLAUDE.md 라이브 CSS 정책). */}
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
