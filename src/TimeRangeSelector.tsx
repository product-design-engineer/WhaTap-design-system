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
 * **동작 정본(2026-10-28, 기획 «[타임 셀렉터] 동작 제안»)** 이 쓰는 조각도 모두 선택 prop 이다 — 시각은 초까지(`DateParts.second`),
 * 달력은 시작 · 종료 시각마다(`onPickStart` · `onPickEnd`), 구간 길이는 드롭다운(`durations`), 갱신/고정은 📌 버튼 하나
 * (`rangeControl="pin"`), 라이브는 ▶/■ 토글(`live`). 넘기지 않으면 예전과 같은 DOM 이다.
 *
 * ## When to use
 * - 시작~종료 절대 시간 범위를 직접 입력/이동해야 하는 옵션바 "시간" 항목.
 * - LIVE 와 과거 범위 조회를 한 컨트롤에서 전환해야 할 때.
 * - «최근 N분» 을 검색할 때 구간이 새로 계산되는지(갱신) 그대로인지(고정) 사용자가 알아야 할 때 → `rangeMode`.
 * - 사용자가 두 동작을 직접 고를 수 있어야 할 때 → `rangeMode` + `onRangeModeChange`. 동작 정본 화면은 `rangeControl="pin"`(📌 하나).
 * - 분석 메뉴처럼 구간 길이를 고르고(5분 · 10분 …) 시각을 초까지 다루는 화면 → `durations` + `second` + `onPickStart`/`onPickEnd`.
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
 * - **구간 길이는 언제나 종료 시각에서 거꾸로 계산한다**(호출측 몫). 갱신이면 종료 시각이 곧 «지금»이라 «최근 10분»,
 *   고정이면 고정된 종료 시각에서 10분이다. 그래서 드롭다운 글자는 갱신 · 라이브일 때 «최근 10분», 고정일 때 «10분» —
 *   컴포넌트가 `rangeMode` · `live` 를 보고 고른다. 목록에 없는 길이(17분)면 «직접 지정».
 * - **길이를 고르는 것만으로는 갱신/고정이 바뀌지 않는다.** 라이브 중에 고르면 라이브가 이어지고 길이만 바뀐다.
 * - **직접 입력 · 달력 · 이전/다음은 고정이다.** 호출측은 `onStartChange` · `onEndChange` · `onPickStart` · `onPickEnd` ·
 *   `onPrev` · `onNext` 에서 `rangeMode` 를 `fixed` 로 바꾸고, 라이브 중이었다면 라이브를 끈다.
 * - **라이브 중지(■) = 멈춘 순간의 구간으로 고정.** 갱신으로 넘기면 다음 검색에서 구간이 바뀌어 멈춘 의미가 없어진다.
 * - 달력 패널은 이 컴포넌트가 그리지 않는다(트리거만). 패널은 시작 > 종료가 되는 날짜와 메뉴의 최대 조회 기간을 넘는
 *   날짜를 **미리 흐리게 막는다**. 직접 입력으로 넘기면 검색 버튼 옆에 이유를 한 줄 적고 검색을 막는다.
 * - 고정된 구간으로 화면을 열 때(저장된 구간)는 셀렉터 아래에 안내 한 줄 —
 *   «어제 13:50~14:00 으로 고정된 구간을 보여 드리고 있어요 · [최근 5분 보기]» ([[Notice]]).
 * - 📌 버튼은 아이콘 + «고정» 글자. 눌림(고정)은 `--color-brand-blue-bg` 바탕 + `--color-brand-blue` 1px 테두리 · 글자 — 고정은
 *   «구간이 움직이지 않는다» 는 걸 놓치면 안 되는 상태라 한눈에 띄운다. 안 눌림(갱신)은 `text-tertiary`.
 * - 시각마다 달력 버튼을 누르면 [[Calendar]] 판이 그 버튼 아래에 뜬다(`onStartChange` · `onEndChange` 가 있을 때). 고른 날짜는
 *   시각(시 · 분 · 초)을 그대로 두고 날짜만 바꾼다. 시작 달력은 종료일 뒤를, 종료 달력은 시작일 앞을 막고, `minDate` · `maxDate` ·
 *   `maxRangeDays` 밖도 막는다. 바깥을 누르거나 Esc 면 닫힌다. 판은 상자 밖에 띄운다 — 상자는 `overflow-hidden` 이라 안에 두면 잘린다.
 * - 옆에 붙이는 검색 [[Button]] 과 «바로 조회» 프리셋 버튼은 `size="lg"`(32px) — 박스 높이 32px 와 맞춘다. 한 줄에서 높이가 다르면 바닥선이 어긋난다.
 *
 * ## Spec
 * - `rangeMode` 없음 → 기존과 같은 DOM(표시 영역이 아예 그려지지 않는다).
 * - `rangeMode` 만 → 읽기 전용 표시(아이콘 + 글자, 12px medium). Tooltip 으로 동작 설명.
 * - `rangeMode` + `onRangeModeChange` → 두 칸 토글 `[갱신 | 고정]`, 각 칸 `aria-pressed`, 그룹 `role="group" aria-label="최근 구간 동작"`.
 * - 눌린 칸: `bg-surface-100` + 모드 색 글자. 안 눌린 칸: `text-tertiary`, hover `bg-surface-100`.
 * - `rangeControl="pin"` + `onRangeModeChange` → 📌 «고정» 버튼 하나, `aria-pressed = (rangeMode === "fixed")`. 누르면 반대 값으로.
 * - `live` 지정 → 라이브 버튼 `aria-pressed={live}` · `aria-label` «라이브 시작» / «라이브 중지», 아이콘 ▶ / ■(`--color-status-success`).
 *   라이브 중(■)에는 링이 1.6초마다 퍼지는 펄스(`.wds-live-pulse`, 1 → 1.3배 · 투명해짐) — 계속 갱신 중인 화면을 멈춘 화면과 구별한다.
 *   `prefers-reduced-motion` 이면 펄스를 멈춘다.
 * - `onPickStart` · `onPickEnd` · `onStartChange` · `onEndChange` 중 하나라도 → 각 시각 바로 뒤에 달력 버튼(«시작 시각 달력» · «종료 시각 달력»,
 *   `aria-expanded`), 오른쪽 단일 달력 버튼은 없앤다. 판은 버튼 왼쪽 −12px · 상자 아래 4px · `z-index 50`.
 * - `durations` → 초록 알약에 ▾ 가 붙고 위에 투명한 네이티브 `<select aria-label="구간 길이">` 를 겹친다(키보드 · 스크린리더는 브라우저 목록).
 *   길이 표기: 나누어떨어지는 가장 큰 단위 — 5분 · 1시간 · 1일.
 * - `start.second` · `end.second` → `HH:MM:SS`. 칸 순서 연 → 월 → 일 → 시 → 분 → 초.
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
 *
 * // 동작 정본 — 초 · 시각마다 달력 · 길이 드롭다운 · 📌 · 라이브 토글
 * <TimeRangeSelector
 *   start={{ ...s, second: "00" }} end={{ ...e, second: "00" }}
 *   live={live} onLive={toggleLive}
 *   durations={[5, 10, 30, 60]} duration={10} onDurationChange={pickLength}
 *   rangeMode={mode} onRangeModeChange={setMode} rangeControl="pin"
 *   onPickStart={openStartCal} onPickEnd={openEndCal}
 *   onStartChange={pinIt} onEndChange={pinIt}
 * />
 * ```
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Calendar from "./Calendar";
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
  rangeControl = "segmented",
  live,
  onPickStart,
  onPickEnd,
  onStartChange,
  onEndChange,
  durations,
  duration,
  onDurationChange,
  minDate,
  maxDate,
  maxRangeDays,
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
  /** 넘기면 표시가 토글이 되어 사용자가 동작을 바꿀 수 있다. 모양은 `rangeControl`. */
  onRangeModeChange?: (mode: TimeRangeMode) => void;
  /**
   * 갱신/고정 토글 모양 — `segmented`(기본, [갱신 | 고정] 두 칸) · `pin`(📌 고정 버튼 하나 — 눌리면 고정, 떼면 갱신).
   * `onRangeModeChange` 가 있을 때만 의미가 있다.
   */
  rangeControl?: "segmented" | "pin";
  /**
   * 라이브 상태. 넘기면 라이브 버튼이 토글이 된다 — `false` ▶ 라이브 시작 · `true` ■ 중지(`aria-pressed`).
   * 생략하면 예전처럼 ▶ 버튼 하나(`onLive` 만 부른다).
   */
  live?: boolean;
  /** 시작 시각 옆 달력 버튼. `onPickStart`·`onPickEnd` 중 하나라도 주면 시각마다 달력 버튼을 두고 `onPickDate` 버튼은 그리지 않는다. */
  onPickStart?: () => void;
  /** 종료 시각 옆 달력 버튼. */
  onPickEnd?: () => void;
  /** 시작 시각 칸을 고치고 벗어날 때 · 달력에서 날짜를 고를 때 — 호출측은 여기서 고정으로 바꾼다(직접 입력 = 고정). */
  onStartChange?: (next: DateParts) => void;
  /** 종료 시각 칸을 고치고 벗어날 때 · 달력에서 날짜를 고를 때. */
  onEndChange?: (next: DateParts) => void;
  /** 구간 길이 목록(분). 넘기면 초록 알약이 드롭다운이 된다 — 예: `[5, 10, 30, 60, 180, 360, 720, 1440]`. */
  durations?: number[];
  /** 지금 구간 길이(분). 목록에 없거나 `null` 이면 «직접 지정». */
  duration?: number | null;
  /** 구간 길이를 고를 때. 종료 시각에서 거꾸로 계산하는 것은 호출측 몫이다. */
  onDurationChange?: (minutes: number) => void;
  /** 달력에서 고를 수 있는 가장 이른 날 `YYYY-MM-DD` — 데이터 보관 기간의 시작. */
  minDate?: string;
  /** 달력에서 고를 수 있는 가장 늦은 날 `YYYY-MM-DD` — 보통 오늘. */
  maxDate?: string;
  /** 메뉴의 최대 조회 기간(일). 반대쪽 시각에서 이 일수를 넘는 날은 달력에서 막는다. */
  maxRangeDays?: number;
}) {
  const perSideCalendar = Boolean(onPickStart || onPickEnd || onStartChange || onEndChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const [cal, setCal] = useState<{ side: "start" | "end"; left: number } | null>(null);

  /* 바깥을 누르면 달력을 닫는다. */
  useEffect(() => {
    if (!cal) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setCal(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [cal]);

  const openCal = (side: "start" | "end") => (e: MouseEvent<HTMLButtonElement>) => {
    (side === "start" ? onPickStart : onPickEnd)?.();
    if (!(side === "start" ? onStartChange : onEndChange)) return; // 날짜를 받을 곳이 없으면 판을 띄우지 않는다
    const root = rootRef.current?.getBoundingClientRect();
    const btn = e.currentTarget.getBoundingClientRect();
    setCal((c) => (c?.side === side ? null : { side, left: root ? btn.left - root.left : 0 }));
  };

  const startDay = dayOf(start);
  const endDay = dayOf(end);
  const limits =
    cal?.side === "start"
      ? {
          min: latest(minDate, maxRangeDays !== undefined ? shiftDay(endDay, -maxRangeDays) : undefined),
          max: earliest(maxDate, endDay),
        }
      : {
          min: latest(minDate, startDay),
          max: earliest(maxDate, maxRangeDays !== undefined ? shiftDay(startDay, maxRangeDays) : undefined),
        };
  const pickDay = (date: string) => {
    const [year, month, day] = date.split("-");
    if (cal?.side === "start") onStartChange?.({ ...start, year, month, day });
    else onEndChange?.({ ...end, year, month, day });
    setCal(null);
  };
  const pillLabel = durations
    ? duration != null && durations.includes(duration)
      ? `${!live && rangeMode === "fixed" ? "" : "최근 "}${formatMinutes(duration)}`
      : "직접 지정"
    : durationLabel;
  return (
    <div ref={rootRef} className="relative flex flex-col gap-6px">
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
        {live === undefined ? (
          <button
            type="button"
            onClick={onLive}
            aria-label="LIVE"
            className="flex items-center justify-center px-6px cursor-pointer hover-bg-surface-100"
          >
            <IcLiveTime />
          </button>
        ) : (
          <Tooltip content={live ? "라이브 중지 — 지금 구간 그대로 고정합니다" : "라이브 시작 — 누르지 않아도 계속 최신으로"} placement="bottom">
            <button
              type="button"
              onClick={onLive}
              aria-pressed={live}
              aria-label={live ? "라이브 중지" : "라이브 시작"}
              className="flex items-center justify-center px-6px cursor-pointer hover-bg-surface-100"
            >
              {live ? <IcLiveStop /> : <IcLivePlay />}
            </button>
          </Tooltip>
        )}
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

          <DateTimeBlock parts={start} side="start" onChange={onStartChange} />
          {perSideCalendar && <CalendarButton label="시작 시각 달력" expanded={cal?.side === "start"} onClick={openCal("start")} />}
          <span className="text-base text-tertiary">~</span>
          <DateTimeBlock parts={end} side="end" onChange={onEndChange} />
          {perSideCalendar && <CalendarButton label="종료 시각 달력" expanded={cal?.side === "end"} onClick={openCal("end")} />}

          <span
            data-ds-policy-ok="success 알약 위 전경 — 컬러 배경 위 고정 흰색"
            // raw-color-ok: success 알약 위 전경 — 컬러 배경 위 고정 흰색.
            className={`relative flex items-center gap-2px px-4px h-16px rounded-2px text-base font-bold text-white whitespace-nowrap ${
              durations ? "hover-opacity-70" : ""
            }`}
            style={{
              background: "var(--color-status-success)",
              fontFamily: "var(--font-family-numeric)",
            }}
          >
            {pillLabel}
            {durations && (
              <>
                <IcChevronDown />
                <select
                  aria-label="구간 길이"
                  value={duration != null && durations.includes(duration) ? String(duration) : ""}
                  onChange={(e) => e.currentTarget.value && onDurationChange?.(Number(e.currentTarget.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {!(duration != null && durations.includes(duration)) && (
                    <option value="" disabled>
                      직접 지정
                    </option>
                  )}
                  {durations.map((m) => (
                    <option key={m} value={m}>
                      {`${!live && rangeMode === "fixed" ? "" : "최근 "}${formatMinutes(m)}`}
                    </option>
                  ))}
                </select>
              </>
            )}
          </span>

          {!perSideCalendar && <CalendarButton label="달력" onClick={onPickDate} />}
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
            {rangeControl === "pin" && onRangeModeChange ? (
              <PinToggle mode={rangeMode} onChange={onRangeModeChange} />
            ) : (
              <RangeModeIndicator mode={rangeMode} onChange={onRangeModeChange} />
            )}
          </>
        )}
      </div>

      {cal && (
        <div className="absolute" style={{ top: "100%", left: Math.max(0, cal.left - 12), marginTop: 4, zIndex: 50 }}>
          <Calendar
            aria-label={cal.side === "start" ? "시작 날짜 선택" : "종료 날짜 선택"}
            value={cal.side === "start" ? startDay : endDay}
            min={limits.min}
            max={limits.max}
            today={maxDate}
            onSelect={pickDay}
            onClose={() => setCal(null)}
          />
        </div>
      )}
    </div>
  );
}

const pad2 = (v: string) => v.padStart(2, "0");
const dayOf = (p: DateParts) => `${p.year.padStart(4, "0")}-${pad2(p.month)}-${pad2(p.day)}`;
const shiftDay = (s: string, n: number) => {
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${pad2(String(t.getMonth() + 1))}-${pad2(String(t.getDate()))}`;
};
const latest = (...xs: (string | undefined)[]) => xs.filter(Boolean).sort().pop();
const earliest = (...xs: (string | undefined)[]) => xs.filter(Boolean).sort()[0];

/** 분 → «5분» · «1시간» · «1일». 나누어떨어지는 가장 큰 단위로. */
function formatMinutes(m: number) {
  if (m >= 1440 && m % 1440 === 0) return `${m / 1440}일`;
  if (m >= 60 && m % 60 === 0) return `${m / 60}시간`;
  return `${m}분`;
}

function CalendarButton({
  label,
  onClick,
  expanded,
}: {
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-haspopup={expanded === undefined ? undefined : "dialog"}
      aria-expanded={expanded}
      className="flex items-center justify-center cursor-pointer hover-opacity-70"
    >
      <IcStartDate />
    </button>
  );
}

/* ─── 📌 고정 버튼 하나 — 눌리면 고정, 떼면 갱신 ─── */
function PinToggle({ mode, onChange }: { mode: TimeRangeMode; onChange: (mode: TimeRangeMode) => void }) {
  const pinned = mode === "fixed";
  return (
    <div className="flex items-center px-4px">
      <Tooltip
        content={pinned ? "고정 — 검색해도 구간을 그대로 둡니다. 누르면 갱신" : "갱신 — 검색할 때마다 지금 기준으로 다시 계산합니다. 누르면 고정"}
        placement="bottom"
      >
        <button
          type="button"
          aria-pressed={pinned}
          onClick={() => onChange(pinned ? "rolling" : "fixed")}
          className={`flex items-center gap-4px px-6px h-20px rounded-2px text-base font-medium cursor-pointer ${
            pinned ? "" : "text-tertiary hover-bg-surface-100"
          }`}
          style={{
            /* 눌림 = 고정. 회색 바탕은 눌린 줄 몰라서 brand 옅은 바탕 + 1px brand 테두리로 한눈에 띄운다. */
            background: pinned ? "var(--color-brand-blue-bg)" : undefined,
            boxShadow: pinned ? "inset 0 0 0 1px var(--color-brand-blue)" : undefined,
            color: pinned ? "var(--color-brand-blue)" : undefined,
            fontFamily: "var(--font-family-korean)",
          }}
        >
          <ModeIcon mode="fixed" />
          고정
        </button>
      </Tooltip>
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
/* 라이브 토글(`live` 지정 시) — ▶ 시작 · ■ 중지. 둘이 한 쌍이라 같은 토큰 색으로 그린다. */
function IcLivePlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="var(--color-status-success)" strokeWidth="2" />
      <path d="M10 8l6 4-6 4V8z" fill="var(--color-status-success)" />
    </svg>
  );
}
function IcLiveStop() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ overflow: "visible" }}>
      <circle className="wds-live-pulse" cx="12" cy="12" r="9" stroke="var(--color-status-success)" strokeWidth="2" />
      <circle cx="12" cy="12" r="9" stroke="var(--color-status-success)" strokeWidth="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="var(--color-status-success)" />
    </svg>
  );
}
function IcChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
