/**
 * EventWeekTimeMatrix — 요일(7) × 시간(24) 알림 수신 매트릭스.
 *
 * 사용 위치:
 *  - 경고 알림 > 이벤트 수신 설정 > 요일·시간별 알림 설정
 *  - 향후 다른 알림류 페이지(예: 보고서 전송 시간대)에서도 재사용 가능
 *
 * 디자인 정책:
 *  - 셀 ON = Tone "low" 의 배경(#e8f4ff) + 도트(#296CF2)
 *  - 셀 OFF = 회색 격자 (#f1f2f4)
 *  - 시간 헤더는 6시간 간격(0/6/12/18)만 표시 — 24개 다 쓰면 비좁음
 *  - 요일 헤더는 한국어 약어 (월/화/수/목/금/토/일)
 *
 * 디자인 자산 없이 합리적 외형으로 만든 stub — 진짜 디자인 들어오면 색·셀크기 갱신.
 */

const DEFAULT_DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export type EventWeekTimeMatrixProps = {
  /** 7 × 24 boolean 그리드. weekdays[d][h] = true 면 해당 시간대 알림 수신. */
  weekdays: boolean[][];
  /** 셀 토글 콜백. 미지정이면 read-only. */
  onToggle?: (day: number, hour: number, next: boolean) => void;
  /** 요일 라벨 (기본: 월~일) */
  dayLabels?: string[];
  /** 캡션 (위쪽 안내 라벨) */
  caption?: string;
};

export default function EventWeekTimeMatrix({
  weekdays,
  onToggle,
  dayLabels = DEFAULT_DAY_LABELS,
  caption,
}: EventWeekTimeMatrixProps) {
  const interactive = !!onToggle;

  return (
    <div className="flex flex-col gap-[6px]">
      {caption && (
        <span className="text-base font-bold text-primary tracking-default leading-normal">
          {caption}
        </span>
      )}

      {/* 시간 헤더 (6시간 간격) */}
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "28px repeat(24, 1fr)", gap: "2px" }}
      >
        <span /> {/* 좌상단 빈 칸 */}
        {Array.from({ length: 24 }, (_, h) => (
          <span
            key={h}
            className="text-chart text-tertiary text-center leading-none tabular-nums"
          >
            {h % 6 === 0 ? String(h).padStart(2, "0") : ""}
          </span>
        ))}
      </div>

      {/* 7 행 × 24 열 */}
      {weekdays.map((row, d) => (
        <div
          key={d}
          className="grid items-center"
          style={{ gridTemplateColumns: "28px repeat(24, 1fr)", gap: "2px" }}
        >
          <span className="text-sm text-secondary font-medium leading-none">
            {dayLabels[d]}
          </span>
          {row.map((on, h) => (
            <button
              key={h}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onToggle!(d, h, !on)}
              className={`h-[14px] rounded-[2px] transition-colors ${
                interactive ? "cursor-pointer hover:brightness-95" : "cursor-default"
              }`}
              style={{
                background: on ? "#296CF2" : "#f1f2f4",
                border: on ? "1px solid #1f57c8" : "1px solid #e0e1e3",
              }}
              aria-label={`${dayLabels[d]} ${String(h).padStart(2, "0")}시 ${on ? "수신" : "미수신"}`}
              aria-pressed={on}
            />
          ))}
        </div>
      ))}

      {/* 범례 */}
      <div className="flex items-center gap-[10px] mt-[4px]">
        <span className="flex items-center gap-[4px]">
          <span className="inline-block w-[12px] h-[10px] rounded-[2px]" style={{ background: "#296CF2", border: "1px solid #1f57c8" }} />
          <span className="text-xs text-secondary">수신</span>
        </span>
        <span className="flex items-center gap-[4px]">
          <span className="inline-block w-[12px] h-[10px] rounded-[2px]" style={{ background: "#f1f2f4", border: "1px solid #e0e1e3" }} />
          <span className="text-xs text-secondary">미수신</span>
        </span>
      </div>
    </div>
  );
}
