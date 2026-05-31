/**
 * AI 위젯 — 시간별 GPU 사용률 막대 차트.
 *
 * 24개 시간 슬롯의 사용률(%)을 막대로 표시. 진입 시 각 막대가 하단에서
 * 순차적으로 성장(scaleY 0→1, 50ms 스태거)하는 "화려한" 등장.
 */
export default function AiUsageChart({
  caption = "Hourly GPU Utilization",
  values,
  highlightThreshold = 50,
  delay = 0,
}: {
  caption?: string;
  /** 24개 hourly 사용률 (0~100). null이면 데이터 없음 */
  values: (number | null)[];
  /** 이 값을 넘으면 짙은 색 강조 */
  highlightThreshold?: number;
  delay?: number;
}) {
  const HEIGHT = 96;
  return (
    <div
      className="ai-anim-in flex flex-col gap-[8px] w-full bg-white border border-[#eaeaea] rounded-[8px] p-[12px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {caption}
        </span>
        <span
          className="text-xs text-disabled tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          0–23시
        </span>
      </div>
      <div
        className="flex items-end gap-[2px] w-full"
        style={{ height: HEIGHT }}
      >
        {values.map((v, i) => {
          const h = v === null ? 0 : Math.max(2, (v / 100) * HEIGHT);
          const isHigh = (v ?? 0) >= highlightThreshold;
          const barDelay = delay + 100 + i * 35;
          return (
            <div
              key={i}
              className="ai-anim-bar flex-1 min-w-0 rounded-[2px]"
              style={{
                height: h,
                background: v === null
                  ? "#f1f2f4"
                  : isHigh
                    ? "#3DA9FF"
                    : "#b7dbff",
                animationDelay: `${barDelay}ms`,
              }}
              title={v === null ? "" : `${i}시 · ${v.toFixed(1)}%`}
            />
          );
        })}
      </div>
    </div>
  );
}
