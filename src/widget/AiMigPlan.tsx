/**
 * AI 위젯 — MIG 통합 기획 (이미지 11.23.14/37/48 스타일).
 *
 * 섹션 헤딩 + 본문 bullet 목록 + 통합 기회 요약 테이블 + 우선순위 액션 카드.
 */
export type MigPlanRow = {
  label: string;
  /** "MIG (1g.10gb × 4)" 같은 구성 */
  config: string;
  /** "₩134,400" */
  monthly: string;
  /** 강조 색상 (선택) */
  highlight?: boolean;
};

export type MigAction = {
  step: number;
  body: string;
};

export default function AiMigPlan({
  heading = "MIG 통합 기획 (A100 핵심 활용 전략)",
  bullets,
  rows,
  totalLabel = "통합 비용 요약",
  total,
  totalNote,
  actionsHeading = "우선순위 액션",
  actions,
  delay = 0,
}: {
  heading?: string;
  bullets?: string[];
  rows?: MigPlanRow[];
  totalLabel?: string;
  total?: string;
  totalNote?: string;
  actionsHeading?: string;
  actions?: MigAction[];
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-[10px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-[6px]">
        <span className="size-[10px] rounded-full" style={{ background: "var(--color-brand-blue)" }} />
        <span
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {heading}
        </span>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-[3px] pl-[12px]">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="text-base text-secondary tracking-default leading-relaxed list-disc list-outside"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      {rows && rows.length > 0 && (
        <div className="rounded-[6px] overflow-hidden border border-[color:var(--color-border-default)]">
          <div
            className="grid items-center px-[8px] py-[6px] bg-[color:var(--color-surface-50)] gap-[4px]"
            style={{ gridTemplateColumns: "1.4fr 1.4fr 1fr" }}
          >
            {["구성", "분할/Pod", "월 환산"].map((h) => (
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
              className="grid items-center px-[8px] py-[6px] gap-[4px] border-t border-[color:var(--color-border-default)]"
              style={{
                gridTemplateColumns: "1.4fr 1.4fr 1fr",
                background: r.highlight ? "#eef4ff" : "#fff",
              }}
            >
              <span
                className="text-base font-bold text-primary tracking-default leading-snug"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                {r.label}
              </span>
              <span
                className="text-sm text-secondary tracking-default leading-snug"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {r.config}
              </span>
              <span
                className="text-base font-bold text-primary tracking-default leading-none text-right"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                {r.monthly}
              </span>
            </div>
          ))}
        </div>
      )}

      {total && (
        <div
          className="flex items-center justify-between rounded-[6px] px-[10px] py-[8px]"
          style={{
            background:
              "linear-gradient(95deg, rgba(0,75,224,0.06) 0%, rgba(139,82,255,0.06) 100%)",
            border: "1px solid rgba(41,108,242,0.2)",
          }}
        >
          <span
            className="text-base font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-korean)", color: "var(--color-whatap-blue)" }}
          >
            {totalLabel}
          </span>
          <span
            className="text-md font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-numeric)", color: "var(--color-whatap-blue)" }}
          >
            {total}
            {totalNote && <span className="ml-[4px] text-sm opacity-80">{totalNote}</span>}
          </span>
        </div>
      )}

      {actions && actions.length > 0 && (
        <>
          <div className="flex items-center gap-[6px] mt-[4px]">
            <span className="size-[10px] rounded-full" style={{ background: "var(--color-indicator-critical)" }} />
            <span
              className="text-md font-bold text-primary tracking-default leading-normal"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {actionsHeading}
            </span>
          </div>
          <ol className="flex flex-col gap-[4px] pl-[18px]">
            {actions.map((a) => (
              <li
                key={a.step}
                className="text-base text-primary tracking-default leading-relaxed list-decimal list-outside"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {a.body}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
