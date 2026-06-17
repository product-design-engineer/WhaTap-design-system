/**
 * LiveTimerCompact — http://localhost:5180/application/slider 의 LIVE 타이머 (32px)
 * 마크업/SVG/색상값 verbatim 복제. 모든 페이지의 LIVE 시간 선택자 공용.
 *
 * Exact-design (라이브 application/slider, 5/16):
 *   ┌──────┬──────────────────────────┐
 *   │ ▌▌  │▓LIVE▓ 12:01:35  [📅]     │   ← 박스 전체 fill polling progress
 *   └──────┴──────────────────────────┘
 *     배경 fill: opacity 0.18 녹색이 좌→우로 채워지며 cycle 마다 0% 리셋
 *
 *   * pause = 녹색 ▌▌ (또는 paused 시 ▶ 재생 모드)
 *   * 좌측 박스 (pause): chained 보더 4px 0 0 4px, border-top/left/bottom 만 (right 없음)
 *   * 우측 박스 (timer): chained 보더 0 4px 4px 0, 4면 보더
 *   * progress: 0% → 100% 를 refreshIntervalMs 동안 채움, 도달 시 0% 리셋 (polling fire)
 *   * paused=true → 시계 + progress 정지
 *   * durationLabel: 우측 캘린더 자리에 녹색 알약 태그 ("10분", "30분" 등).
 *     캘린더 아이콘과 동시 표시도 가능 — 필요 시 calendar prop 으로 제어.
 *
 * ## Purpose
 * LIVE 모니터링의 현재 시각 + polling 진행을 32px compact 박스로 표시.
 * 좌측 pause/play 버튼(`onTogglePause`) + 우측 타이머 박스(LIVE 배지 + 시각 + 선택적
 * duration 알약/달력)로 구성. `time` 미지정 시 시스템 시각으로 자동 tick 하며,
 * `refreshIntervalMs`(기본 5000ms) 주기로 배경 progress fill 이 좌→우로 채워지고 cycle
 * 마다 리셋된다. `paused=true` 면 시계·progress 모두 정지.
 *
 * ## When to use
 * - 옵션바 "시간" 항목에서 LIVE 현재 시각 + polling cycle 을 compact 하게 보여줄 때.
 * - [[OptionbarPage]] 의 시간 슬롯 등 세로 공간이 한정된 자리.
 *
 * ## When NOT to use
 * - 시작~종료 절대 범위 입력/이동이 필요 → [[TimeRangeSelector]].
 * - 옵션바 전체 행 구성 → [[OptionbarPage]].
 *
 * ## Composition rules
 * - 높이 32px 고정, pause(좌)·timer(우) 가 chained 보더로 한 알약처럼 붙음.
 * - `durationLabel` 만 있으면 캘린더 자리에 #00B543 알약 표시. `showCalendar` 로
 *   캘린더 아이콘을 명시 제어(default: durationLabel 없을 때만 true).
 * - 색은 토큰(var(--color-status-success) 등) — LIVE 텍스트·progress fill 라이브 값 유지.
 *
 * @example
 * ```tsx
 * <LiveTimerCompact paused={paused} onTogglePause={togglePause} durationLabel="10분" />
 * <LiveTimerCompact time="12:01:35" refreshIntervalMs={3000} showCalendar onOpenCalendar={open} />
 * ```
 */
import { useEffect, useRef, useState } from "react";

export default function LiveTimerCompact({
  /** 시계 표시 문자열. 미지정 시 시스템 시각으로 자동 갱신. */
  time,
  paused = false,
  onTogglePause,
  /** polling 한 cycle (ms). 기본 5000ms. */
  refreshIntervalMs = 5000,
  /** 캘린더 클릭 핸들러. */
  onOpenCalendar,
  /** 녹색 알약 태그 라벨 ("10분"/"30분" 등). durationLabel 만 있으면 캘린더 자리에 표시. */
  durationLabel,
  /** 캘린더 아이콘 표시 여부 (default: durationLabel 이 없을 때만 true). */
  showCalendar,
}: {
  time?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  refreshIntervalMs?: number;
  onOpenCalendar?: () => void;
  durationLabel?: string;
  showCalendar?: boolean;
}) {
  const calendarVisible = showCalendar ?? !durationLabel;
  const [now, setNow] = useState(() => new Date());
  const [progress, setProgress] = useState(0);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (paused) {
      lastTickRef.current = Date.now();
      return;
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
  }, [paused, refreshIntervalMs]);

  const display =
    time ??
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => n.toString().padStart(2, "0"))
      .join(":");

  return (
    <div className="flex shrink-0" style={{ height: 32 }}>
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
          width: 32,
          height: 32,
          borderTop: "1px solid rgb(173, 173, 173)",
          borderLeft: "1px solid rgb(173, 173, 173)",
          borderBottom: "1px solid rgb(173, 173, 173)",
          borderRadius: "4px 0px 0px 4px",
        }}
      >
        {paused ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 4l10 6-10 6V4z" fill="var(--color-status-success)" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="6" y="3" width="2.5" height="14" rx="0.5" fill="var(--color-status-success)" />
            <rect x="11.5" y="3" width="2.5" height="14" rx="0.5" fill="var(--color-status-success)" />
          </svg>
        )}
      </div>

      {/* Timer box — 우측 chained 보더 (4면), polling progress (배경 full-fill) + 텍스트 */}
      <div
        className="flex flex-col justify-center bg-card relative overflow-hidden"
        style={{
          height: 32,
          padding: 8,
          border: "1px solid rgb(173, 173, 173)",
          borderRadius: "0px 4px 4px 0px",
        }}
      >
        {/* Polling progress — 박스 전체 영역을 좌→우로 채우는 fill (텍스트 뒤 배경) */}
        <div
          className="absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: "rgb(0, 180, 66)",
            opacity: 0.18,
            transition: "width 16ms linear",
          }}
        />
        <div className="flex items-center gap-6px relative">
          <span
            className="text-base font-medium text-status-success leading-px-16 whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-numeric)" }}
          >
            LIVE
          </span>
          <span
            className="text-lg font-bold text-primary leading-none tracking-metric whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-numeric)" }}
          >
            {display}
          </span>
          {durationLabel && (
            <span
              className="inline-flex items-center justify-center px-5px rounded-2px text-white whitespace-nowrap shrink-0"
              style={{
                background: "#00B543",
                height: 16,
                fontFamily: "var(--font-family-numeric)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-bold)",
                lineHeight: 1,
              }}
            >
              {durationLabel}
            </span>
          )}
          {calendarVisible && (
            <svg
              width="16"
              height="16"
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
