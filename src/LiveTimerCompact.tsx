/**
 * LiveTimerCompact — http://localhost:5180/application/slider 의 LIVE 타이머 (sm 24px · md 32px)
 * 마크업/SVG/색상값 verbatim 복제. 모든 페이지의 LIVE 시간 선택자 공용.
 *
 * Exact-design (라이브 application/slider, 5/16):
 *   ┌──────┬──────────────────────────┐
 *   │ ▌▌  │ LIVE  12:01:35  [📅]     │
 *   └──────┴──────────────────────────┘
 *     기본은 배경이 없다 — 녹색 progress fill 은 기본 off 다. LIVE 텍스트 뒤에 옅은 색 띠가
 *     깔리면 배지가 "칩"처럼 읽혀서, 정작 상태를 말하는 색(초록/회색)이 배경에 묻힌다.
 *     라이브 화면의 polling cycle 연출이 필요한 자리에서만 `showPollingProgress` 로 켠다.
 *
 *   * pause = 녹색 ▌▌ (또는 paused 시 ▶ 재생 모드)
 *   * 좌측 박스 (pause): chained 보더 4px 0 0 4px, border-top/left/bottom 만 (right 없음)
 *   * 우측 박스 (timer): chained 보더 0 4px 4px 0, 4면 보더
 *   * paused=true → 시계 정지 (LIVE → STOP), progress 도 정지
 *   * durationLabel: 우측 캘린더 자리에 녹색 알약 태그 ("10분", "30분" 등).
 *     캘린더 아이콘과 동시 표시도 가능 — 필요 시 calendar prop 으로 제어.
 *
 * ## Purpose
 * LIVE 모니터링의 현재 시각을 compact 박스로 표시.
 * 좌측 pause/play 버튼(`onTogglePause`) + 우측 타이머 박스(LIVE 배지 + 시각 + 선택적
 * duration 알약/달력)로 구성. `time` 미지정 시 시스템 시각으로 자동 tick 하며,
 * `paused=true` 면 시계가 멈추고 배지가 STOP 으로 바뀐다.
 * `refreshIntervalMs` 는 폴링 주기 값이며, `showPollingProgress` 를 켰을 때만
 * 배경 progress fill 의 한 cycle 길이로도 쓰인다(끈 상태에선 시각 표현 없음).
 *
 * ## When to use
 * - 옵션바 "시간" 항목에서 LIVE 현재 시각을 compact 하게 보여줄 때.
 * - [[OptionbarPage]] 의 시간 슬롯 등 세로 공간이 한정된 자리.
 *
 * ## When NOT to use
 * - 시작~종료 절대 범위 입력/이동이 필요 → [[TimeRangeSelector]].
 * - 옵션바 전체 행 구성 → [[OptionbarPage]].
 *
 * ## Composition rules
 * - 높이는 `size` 로 결정 — `sm`(24px) / `md`(32px, **기본**). pause(좌)·timer(우) 가
 *   chained 보더로 한 알약처럼 붙음.
 * - `sm` 은 아이콘 16px · LIVE `text-sm` · 시각 `text-md` · 알약 14px 로 함께 내려가 32px 과
 *   같은 비율을 유지. 옵션바 24px 기본선에 맞출 때 쓴다([[OptionbarPage]] 는 `size="sm"` 을
 *   명시로 내려주므로 옵션바 baseline 은 이 컴포넌트 기본값과 무관하게 24px 로 정렬된다).
 * - `durationLabel` 만 있으면 캘린더 자리에 녹색(`--color-status-success`) 알약 표시.
 *   `showCalendar` 로 캘린더 아이콘을 명시 제어(default: durationLabel 없을 때만 true).
 * - 색은 토큰(var(--color-status-success) 등). 기본값에서는 배지 뒤에 배경을 깔지 않는다.
 *
 * @example
 * ```tsx
 * <LiveTimerCompact paused={paused} onTogglePause={togglePause} durationLabel="10분" />
 * <LiveTimerCompact time="12:01:35" refreshIntervalMs={3000} showCalendar onOpenCalendar={open} />
 * <LiveTimerCompact size="sm" durationLabel="10분" />          // 24px — 40px 보조 행·컴팩트 옵션바 (기본 lg=32px)
 * <LiveTimerCompact showPollingProgress refreshIntervalMs={5000} />  // polling fill 연출 opt-in
 * ```
 */
import { useEffect, useRef, useState } from "react";

export type LiveTimerCompactSize = "sm" | "md" | "lg";

/**
 * 사이즈 스펙 — md(32px) 는 기존 값 verbatim, sm(24px) 은 한 단계 아래.
 * 높이·아이콘·타이포·알약을 함께 내려 32px 대비 시각 비율을 유지한다.
 */
/* 컨트롤 공통 스케일 (feedback-control-size-scale) — sm 24 / md 28 / lg 32. */
const SIZE = {
  lg: {
    box: 32,
    padding: 8,
    icon: 20,
    gap: "gap-6px",
    live: "text-base",
    liveLeading: "leading-px-16",
    clock: "text-lg",
    pill: 16,
    pillFont: "var(--text-sm)",
    calendar: 16,
  },
  md: {
    box: 28,
    padding: 6,
    icon: 18,
    gap: "gap-4px",
    live: "text-sm",
    liveLeading: "leading-none",
    clock: "text-md",
    pill: 15,
    pillFont: "var(--text-xs)",
    calendar: 15,
  },
  sm: {
    box: 24,
    padding: 4,
    icon: 16,
    gap: "gap-4px",
    live: "text-sm",
    liveLeading: "leading-none",
    clock: "text-md",
    pill: 14,
    pillFont: "var(--text-xs)",
    calendar: 14,
  },
} as const;

export default function LiveTimerCompact({
  /** 시계 표시 문자열. 미지정 시 시스템 시각으로 자동 갱신. */
  time,
  paused = false,
  onTogglePause,
  /** polling 한 cycle (ms). 기본 5000ms. `showPollingProgress` 시 fill 한 cycle 길이. */
  refreshIntervalMs = 5000,
  /** 캘린더 클릭 핸들러. */
  onOpenCalendar,
  /** 녹색 알약 태그 라벨 ("10분"/"30분" 등). durationLabel 만 있으면 캘린더 자리에 표시. */
  durationLabel,
  /** 캘린더 아이콘 표시 여부 (default: durationLabel 이 없을 때만 true). */
  showCalendar,
  /** 사이즈 — sm(24px) / md(32px, **기본**). */
  size = "lg",
  /**
   * polling progress fill(옅은 녹색이 좌→우) 노출 여부. **기본 false.**
   * 켜면 refreshIntervalMs 동안 0→100% 를 채우고 cycle 마다 리셋한다(폴링 fire 시점 연출).
   * 기본값이 off 인 이유는 아래 렌더 주석 참고 — 배지가 "칩"처럼 읽히는 부작용 때문.
   */
  showPollingProgress = false,
}: {
  time?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  refreshIntervalMs?: number;
  onOpenCalendar?: () => void;
  durationLabel?: string;
  showCalendar?: boolean;
  size?: LiveTimerCompactSize;
  showPollingProgress?: boolean;
}) {
  const spec = SIZE[size];
  const calendarVisible = showCalendar ?? !durationLabel;
  const [now, setNow] = useState(() => new Date());
  const [progress, setProgress] = useState(0);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (paused) {
      lastTickRef.current = Date.now();
      return;
    }
    if (!showPollingProgress) {
      /* 시계만 tick 한다 — progress fill 이 없으면 60ms 보간이 필요 없다.
         refreshIntervalMs 는 폴링 주기 API 로 남아 있다(호출부 다수가 넘긴다). */
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }
    const TICK_MS = 60; // 60ms tick → CSS transition (16ms linear) 와 자연 보간
    const id = setInterval(() => {
      const nowMs = Date.now();
      const delta = nowMs - lastTickRef.current;
      lastTickRef.current = nowMs;
      setNow(new Date());
      setProgress((p) => {
        const next = p + delta / refreshIntervalMs;
        return next >= 1 ? 0 : next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [paused, refreshIntervalMs, showPollingProgress]);

  const display =
    time ??
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => n.toString().padStart(2, "0"))
      .join(":");

  return (
    <div className="flex shrink-0" style={{ height: spec.box }}>
      {/* Pause/play — 좌측 chained 보더 (top/left/bottom only) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onTogglePause}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTogglePause?.();
          }
        }}
        aria-label={paused ? "재생" : "일시정지"}
        className="flex items-center justify-center bg-card cursor-pointer"
        style={{
          width: spec.box,
          height: spec.box,
          borderTop: "1px solid var(--color-border-control)",
          borderLeft: "1px solid var(--color-border-control)",
          borderBottom: "1px solid var(--color-border-control)",
          borderRadius: "4px 0px 0px 4px",
        }}
      >
        {paused ? (
          <svg width={spec.icon} height={spec.icon} viewBox="0 0 20 20" fill="none">
            <path d="M6 4l10 6-10 6V4z" fill="var(--color-status-success)" />
          </svg>
        ) : (
          <svg width={spec.icon} height={spec.icon} viewBox="0 0 20 20" fill="none">
            <rect x="6" y="3" width="2.5" height="14" rx="0.5" fill="var(--color-status-success)" />
            <rect x="11.5" y="3" width="2.5" height="14" rx="0.5" fill="var(--color-status-success)" />
          </svg>
        )}
      </div>

      {/* Timer box — 우측 chained 보더 (4면) + 텍스트. progress fill 은 opt-in. */}
      <div
        className="flex flex-col justify-center bg-card relative overflow-hidden"
        style={{
          height: spec.box,
          padding: spec.padding,
          border: "1px solid var(--color-border-control)",
          borderRadius: "0px 4px 4px 0px",
        }}
      >
        {/* Polling progress — 박스 전체 영역을 좌→우로 채우는 fill (텍스트 뒤 배경).
            **기본 off**: LIVE 텍스트 뒤에 옅은 색 띠가 깔리면 배지가 "칩"처럼 읽혀서,
            정작 상태를 말하는 색(초록/회색)이 배경에 묻힌다. 폴링 cycle 자체를 보여주는 것이
            화면의 목적일 때만 showPollingProgress 로 켠다. */}
        {showPollingProgress && (
          <div
            className="absolute top-0 bottom-0 left-0 pointer-events-none"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: "var(--color-status-success)",
              opacity: 0.18,
              transition: "width 16ms linear",
            }}
          />
        )}
        <div className={`flex items-center ${spec.gap} relative`}>
          {/* 배지는 **라이브성 주장**이다 — 정지 상태에서 "LIVE" 를 띄우면 지나간 스냅샷을
              지금 상황으로 오해하게 만든다(장애 대응에서 가장 비싼 오해). paused 면 STOP. */}
          <span
            className={`${spec.live} ${spec.liveLeading} font-medium whitespace-nowrap`}
            /* LIVE↔STOP 은 상태 전환이므로 색이 즉시 튀지 않게 한다 — 눌렀을 때 무엇이 바뀌었는지
               눈으로 따라갈 수 있어야 한다. 색은 클래스가 아니라 토큰 인라인으로 준다 —
               `.text-tertiary` 유틸은 whatap-ds.css 에 없어서(등록 클래스만 사용) 조용히 무시된다. */
            style={{
              fontFamily: "var(--font-family-numeric)",
              color: paused ? "var(--color-text-tertiary)" : "var(--color-status-success)",
              transition: "color 240ms ease",
              /* 애니메이션 없음 — ai-symbol-pulse 는 box-shadow 글로우라 텍스트에 걸면
                 사각 헤일로가 배경처럼 깔린다(원형 AI 심볼 전용). 배경은 투명. */
              background: "transparent",
            }}
          >
            {paused ? "STOP" : "LIVE"}
          </span>
          <span
            className={`${spec.clock} font-bold text-primary leading-none tracking-metric whitespace-nowrap`}
            style={{ fontFamily: "var(--font-family-numeric)" }}
          >
            {display}
          </span>
          {durationLabel && (
            <span
              data-ds-policy-ok="녹색 알약 위 전경 — 컬러 배경 위 고정 흰색"
              // raw-color-ok: 녹색 알약 위 전경 — 컬러 배경 위 고정 흰색.
              className="inline-flex items-center justify-center px-5px rounded-2px text-white whitespace-nowrap shrink-0"
              style={{
                /* 기간 배지도 같은 이유로 정지 상태에선 초록(라이브 색)을 쓰지 않는다. */
                background: paused ? "var(--color-text-tertiary)" : "var(--color-status-success)",
                transition: "background-color 240ms ease",
                height: spec.pill,
                fontFamily: "var(--font-family-numeric)",
                fontSize: spec.pillFont,
                fontWeight: "var(--font-weight-bold)",
                lineHeight: 1,
              }}
            >
              {durationLabel}
            </span>
          )}
          {calendarVisible && (
            <svg
              width={spec.calendar}
              height={spec.calendar}
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0 cursor-pointer"
              onClick={onOpenCalendar}
            >
              <rect x="2.5" y="3" width="11" height="11" rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
              <line x1="5.5" y1="2" x2="5.5" y2="4" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="10.5" y1="2" x2="10.5" y2="4" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="2.5" y1="6.5" x2="13.5" y2="6.5" stroke="var(--color-text-tertiary)" strokeWidth="1" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
