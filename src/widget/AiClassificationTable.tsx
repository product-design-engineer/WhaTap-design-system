import ClassificationTableRow from "./ClassificationTableRow";

/**
 * AiClassificationTable — 리소스 활용도 분류 결과 데이터 테이블 카드.
 *
 * ## Purpose
 * 헤더 + N개 행으로 GPU 등 리소스를 활용도(고/활용/저/유휴)별로 분류해 보여주는 표.
 * 각 행: GPU# / 모델명 / 평균 / 최대 / 최소 / Pod / 분류(톤 컬러 배지). 선택적 설명·경고·
 * 캡션을 상단에 둘 수 있음. 진입 시 `ai-anim-in`.
 *
 * ## When to use
 * - 다수 리소스를 활용도 tone 으로 분류해 한눈에 비교할 때.
 * - 분류 결과를 컬러 배지로 시각 신호화하면서 통계(평균/최대/최소)도 함께 제시할 때.
 *
 * ## When NOT to use
 * - 비용 비교/분해 → [[AiCostTable]] · [[AiCostBreakdown]].
 * - 시간대별 사용률 추이 → [[AiUsageChart]].
 * - 알림/이벤트 기록 → [[AiEventList]].
 *
 * ## Composition rules
 * - 자체 표 레이아웃을 가지며 [[AiCard]] 로 감싸지 않음.
 * - 행 분류 배지는 로컬 `TONE_BADGE` 매핑(`ClassificationTone`: high/mid/low/idle/neutral)
 *   기반 — 색은 [[Tone]] 토큰(`--color-indicator-*` 등)을 참조. `badge` 로 라벨 override 가능.
 *   (배지 시각 표현은 공용 [[AiToneBadge]] 와 동일 패턴.)
 * - 배경/도트 색은 토큰 사용. 단, 일부 인라인 hex(`#ffe8e8`, `#fff7e0`, `#e8f4ff`)가
 *   매핑 테이블에 남아 있어 토큰화는 차후 정리 대상.
 * - `caption`/`description`/`warning` 은 모두 선택 — 없으면 해당 줄 생략.
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms).
 *
 * @example
 * ```tsx
 * <AiClassificationTable
 *   caption="GPU 활용도 분류"
 *   description="최근 24시간 평균 사용률 기준으로 분류했습니다."
 *   rows={[
 *     { gpu: 1, model: "A100", avg: "82%", max: "97%", min: "61%", pod: "train-1", tone: "high" },
 *     { gpu: 3, model: "A100", avg: "12%", max: "20%", min: "4%", pod: "infer-2", tone: "low" },
 *   ]}
 * />
 * ```
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
      className="ai-anim-in flex flex-col gap-8px w-full"
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
          className="flex items-start gap-6px rounded-6px px-10px py-6px"
          style={{ background: "#fff7e0" }}
        >
          <span className="text-base mt-1px">⚠️</span>
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
          className="text-base font-bold text-primary tracking-default leading-normal mt-2px"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          📊 {caption}
        </div>
      )}
      <div className="rounded-6px overflow-hidden border border-color-var-color-border-default">
        {/* 헤더 */}
        <div
          className="grid items-center px-6px py-6px bg-color-var-color-surface-50 gap-4px"
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
            <ClassificationTableRow
              key={i}
              row={r}
              badgeBg={badge.bg}
              badgeDot={badge.dot}
              badgeLabel={badge.label}
            />
          );
        })}
      </div>
    </div>
  );
}
