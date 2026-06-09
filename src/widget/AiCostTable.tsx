/**
 * AI 위젯 — 비용 비교 테이블.
 *
 * 현행/제안 2-row 비교. 절감액·절감률은 우측 강조 카드로 표시.
 * 진입 시 fadeInUp 애니메이션 + 절감 카드는 보더 글로우.
 */
export type CostRow = {
  label: string; // "현행" / "제안"
  detail: string; // "A100 GPU 4개 (평균 사용률 32%)"
  cost: string; // "₩8,322,000/월"
  highlight?: boolean;
};

export default function AiCostTable({
  caption = "Cost Analysis",
  rows,
  savingsLabel,
  savingsValue,
  delay = 0,
}: {
  caption?: string;
  rows: CostRow[];
  /** "약 30.1% 비용 절감" 같은 풋라인 (선택) */
  savingsLabel?: string;
  /** "₩2,502,000 / 월" 같은 보조 라인 (선택) */
  savingsValue?: string;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-[8px] w-full bg-white border border-[color:var(--color-border-default)] rounded-[8px] p-[12px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {caption}
        </span>
      </div>

      <div className="flex flex-col rounded-[6px] overflow-hidden border border-[color:var(--color-border-default)]">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between px-[10px] py-[8px] ${
              i > 0 ? "border-t border-[color:var(--color-border-default)]" : ""
            }`}
            style={{
              background: r.highlight ? "#eef4ff" : "#fff",
            }}
          >
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm text-tertiary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {r.label}
              </span>
              <span
                className="text-base text-primary tracking-default leading-normal mt-[3px]"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {r.detail}
              </span>
            </div>
            <span
              className="text-lg text-primary font-bold tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: r.highlight ? "var(--color-brand-blue)" : "#222",
              }}
            >
              {r.cost}
            </span>
          </div>
        ))}
      </div>

      {(savingsLabel || savingsValue) && (
        <div
          className="flex items-center justify-between px-[10px] py-[8px] rounded-[6px]"
          style={{
            background: "linear-gradient(95deg, rgba(0,75,224,0.08) 0%, rgba(139,82,255,0.08) 100%)",
            border: "1px solid rgba(41,108,242,0.25)",
          }}
        >
          {savingsLabel && (
            <span
              className="text-base font-bold tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-korean)",
                color: "var(--color-whatap-blue)",
              }}
            >
              {savingsLabel}
            </span>
          )}
          {savingsValue && (
            <span
              className="text-md font-bold tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: "var(--color-whatap-blue)",
              }}
            >
              {savingsValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
