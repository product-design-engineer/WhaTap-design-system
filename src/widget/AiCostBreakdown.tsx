/**
 * AI 위젯 — 비용 분석 상세 (이미지 11.23.02 스타일).
 *
 * 헤더(컬러 칩) + 1줄 컨텍스트 + 4컬럼 표(GPU / Pod / 유휴 비율 / 일일 낭비) +
 * 소계 행 + 월 환산 라인.
 */
export type CostBreakdownRow = {
  gpu: string;
  pod: string;
  avg: string;
  idle: string;
  daily: string;
};

export default function AiCostBreakdown({
  toneLabel,
  toneColor,
  context,
  rows,
  subtotal,
  monthly,
  monthlyNote,
  delay = 0,
}: {
  /** "저활용 GPU - 낭비 비용 분석" 같은 헤더 */
  toneLabel: string;
  /** 헤더 좌측 도트 색상 */
  toneColor: string;
  /** "A100 40GB 참고 비용 ₩2,800/hr (온프레미스라 실비는…) 기준 일일 환산" */
  context?: string;
  rows: CostBreakdownRow[];
  /** 소계 (예: "₩268,600/일") */
  subtotal?: string;
  /** "월 환산 — 약 ₩8,058,000/월 (저활용 5개 GPU)" */
  monthly?: string;
  monthlyNote?: string;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-[8px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-[6px]">
        <span className="size-[10px] rounded-full" style={{ background: toneColor }} />
        <span
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {toneLabel}
        </span>
      </div>
      {context && (
        <p
          className="text-base text-secondary tracking-default leading-relaxed"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {context}
        </p>
      )}
      <div className="rounded-[6px] overflow-hidden border border-[#eaeaea]">
        <div
          className="grid items-center px-[8px] py-[6px] bg-[#f5f5f5] gap-[4px]"
          style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
        >
          {["GPU", "Pod", "평균 사용률", "유휴 비율", "일일 낭비"].map((h) => (
            <span
              key={h}
              className="text-sm font-bold text-secondary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {h}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid items-center px-[8px] py-[6px] gap-[4px] border-t border-[#eaeaea]"
            style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
          >
            <span
              className="text-base font-bold text-primary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              {r.gpu}
            </span>
            <span
              className="text-sm text-secondary tracking-default leading-snug truncate"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              title={r.pod}
            >
              {r.pod}
            </span>
            <span
              className="text-base text-secondary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
            >
              {r.avg}
            </span>
            <span
              className="text-base text-secondary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
            >
              {r.idle}
            </span>
            <span
              className="text-base font-bold text-primary tracking-default leading-none text-right"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              {r.daily}
            </span>
          </div>
        ))}
        {subtotal && (
          <div
            className="grid items-center px-[8px] py-[6px] gap-[4px] border-t border-[#eaeaea] bg-[#f9f9f9]"
            style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
          >
            <span
              className="text-base font-bold text-primary tracking-default leading-none col-span-4"
              style={{ fontFamily: "var(--font-family-korean)", gridColumn: "1 / span 4" }}
            >
              소계
            </span>
            <span
              className="text-md font-bold text-primary tracking-default leading-none text-right"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              {subtotal}
            </span>
          </div>
        )}
      </div>
      {monthly && (
        <p
          className="text-base text-primary tracking-default leading-relaxed"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          <span className="font-bold">월 환산</span> — {monthly}
          {monthlyNote && <span className="text-tertiary"> {monthlyNote}</span>}
        </p>
      )}
    </div>
  );
}
