/**
 * AI 위젯 — 분류 결과 데이터 테이블 (이미지 11.22.45 스타일).
 *
 * 헤더 + N개 행. 각 행: GPU# / 모델명 / 평균 / 최대 / 최소 / Pod / 분류(컬러 배지).
 * 분류 배지는 tone에 따라 색상이 다름.
 */

export type ClassificationTone = "high" | "mid" | "low" | "idle" | "neutral";

const TONE_BADGE: Record<ClassificationTone, { bg: string; dot: string; label: string }> = {
  high:    { bg: "#ffe8e8", dot: "var(--color-indicator-critical)", label: "고활용" },
  mid:     { bg: "#fff7e0", dot: "var(--color-indicator-warning)", label: "활용" },
  low:     { bg: "#e8f4ff", dot: "var(--color-brand-blue)", label: "저활용" },
  idle:    { bg: "var(--color-surface-100)", dot: "var(--color-text-tertiary)", label: "완전 유휴" },
  neutral: { bg: "var(--color-surface-100)", dot: "var(--color-text-tertiary)", label: "" },
};

export type ClassificationRow = {
  gpu: string | number;
  model: string;
  avg: string;
  max: string;
  min: string;
  pod: string;
  tone: ClassificationTone;
  /** 배지 라벨 오버라이드 (기본은 tone의 label) */
  badge?: string;
};

export default function AiClassificationTable({
  caption,
  description,
  warning,
  rows,
  delay = 0,
}: {
  caption?: string;
  description?: string;
  warning?: string;
  rows: ClassificationRow[];
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-[8px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {description && (
        <p
          className="text-md text-primary tracking-default leading-loose"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {description}
        </p>
      )}
      {warning && (
        <div
          className="flex items-start gap-[6px] rounded-[6px] px-[10px] py-[6px]"
          style={{ background: "#fff7e0" }}
        >
          <span className="text-base mt-[1px]">⚠️</span>
          <span
            className="text-base text-secondary tracking-default leading-relaxed"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
          >
            {warning}
          </span>
        </div>
      )}
      {caption && (
        <div
          className="text-base font-bold text-primary tracking-default leading-normal mt-[2px]"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          📊 {caption}
        </div>
      )}
      <div className="rounded-[6px] overflow-hidden border border-[color:var(--color-border-default)]">
        {/* 헤더 */}
        <div
          className="grid items-center px-[6px] py-[6px] bg-[color:var(--color-surface-50)] gap-[4px]"
          style={{ gridTemplateColumns: "28px 1.4fr 0.7fr 0.6fr 0.6fr 1.3fr 0.8fr" }}
        >
          {["GPU", "모델명", "평균", "최대", "최소", "Pod", "분류"].map((h) => (
            <span
              key={h}
              className="text-sm font-bold text-secondary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {h}
            </span>
          ))}
        </div>
        {/* 행들 */}
        {rows.map((r, i) => {
          const badge = TONE_BADGE[r.tone];
          return (
            <div
              key={i}
              className="grid items-center px-[6px] py-[6px] gap-[4px] border-t border-[color:var(--color-border-default)]"
              style={{ gridTemplateColumns: "28px 1.4fr 0.7fr 0.6fr 0.6fr 1.3fr 0.8fr" }}
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
              >
                {r.model}
              </span>
              <span
                className="text-base font-bold text-primary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                {r.avg}
              </span>
              <span
                className="text-base text-secondary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
              >
                {r.max}
              </span>
              <span
                className="text-base text-secondary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
              >
                {r.min}
              </span>
              <span
                className="text-sm text-secondary tracking-default leading-snug truncate"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                title={r.pod}
              >
                {r.pod}
              </span>
              <div
                className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[10px] self-start whitespace-nowrap"
                style={{ background: badge.bg }}
              >
                <span
                  className="size-[6px] rounded-full shrink-0"
                  style={{ background: badge.dot }}
                />
                <span
                  className="text-xs tracking-default leading-none"
                  style={{
                    fontFamily: "var(--font-family-korean)",
                    fontWeight: "var(--font-weight-medium)",
                    color: badge.dot,
                  }}
                >
                  {r.badge ?? badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
