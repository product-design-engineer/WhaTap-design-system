/**
 * AiEventList — 실시간 알림 / 이벤트 기록 카드.
 *
 * ## Purpose
 * 위젯 안에서 "최근 N시간 알림 N건" 을 한 줄 요약하고, 각 이벤트 행을 시간 + 심각도 배지 +
 * 소스 + 메시지로 표시. 와탭 알림 심각도(critical/warning/info)를 디자인 시스템 [[Tone]]
 * (high/mid/low)으로 매핑해 컬러 칩으로 신호화. AI 응답의 "이벤트 조회" 패스에 사용.
 *
 * ## When to use
 * - 최근 알림/이벤트 목록을 시간순으로 요약해 보여줄 때.
 * - 심각도별 컬러 신호와 함께 소스·메시지를 한 줄로 압축 표시할 때.
 *
 * ## When NOT to use
 * - 리소스 활용도 분류 표 → [[AiClassificationTable]].
 * - 비용 비교/분해 → [[AiCostTable]] · [[AiCostBreakdown]].
 * - 단계별 도구 호출 진행 → [[AiStepsTimeline]].
 *
 * ## Composition rules
 * - 정책: feedback-widget-primitives — [[AiCard]] + [[AiSectionHeading]] + [[Tone]] 토큰.
 * - 컨테이너 chrome 은 [[AiCard]] 가 책임 (직접 보더/패딩 작성 금지).
 * - 심각도 배지 색은 `TONE_BG`/`TONE_DOT` 토큰만 사용 — 인라인 hex 금지.
 * - 행은 시간(고정폭) · 심각도 칩 · 소스+메시지(truncate) 순서 고정.
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms).
 *
 * @example
 * ```tsx
 * <AiEventList
 *   caption="최근 24시간 알림"
 *   summary="16건 (Critical 3 / Warning 13)"
 *   rows={[
 *     { time: "14:32", severity: "critical", source: "server-prod-01", message: "CPU 98% 지속" },
 *     { time: "13:10", severity: "warning", source: "oracle_dnx/RAC-1", message: "세션 급증" },
 *   ]}
 * />
 * ```
 */
import { AiCard, AiSectionHeading } from "./_primitives";
import { type Tone } from "./_tokens";
import EventListItem from "./EventListItem";

/** 와탭 알림 심각도 → 디자인 시스템 Tone 매핑 */
export type EventSeverity = "critical" | "warning" | "info";
const SEVERITY_TONE: Record<EventSeverity, Tone> = {
  critical: "high",
  warning: "mid",
  info: "low",
};
const SEVERITY_LABEL: Record<EventSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export type EventRow = {
  /** "14:32" 또는 "06/12 14:32" */
  time: string;
  severity: EventSeverity;
  /** "server-prod-01", "oracle_dnx/RAC-1" */
  source: string;
  /** 한 줄 요약 메시지 */
  message: string;
};

export default function AiEventList({
  caption = "최근 24시간 알림",
  summary,
  rows,
  delay = 0,
}: {
  /** 헤딩 텍스트 (기본: "최근 24시간 알림") */
  caption?: string;
  /** 요약 한 줄. 예: "16건 (Critical 3 / Warning 13)" */
  summary?: string;
  rows: EventRow[];
  delay?: number;
}) {
  return (
    <AiCard delay={delay}>
      <AiSectionHeading emoji="🔔">{caption}</AiSectionHeading>

      {summary && (
        <p
          className="text-base text-secondary tracking-default leading-relaxed"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {summary}
        </p>
      )}

      <ul className="flex flex-col">
        {rows.map((r, i) => (
          <EventListItem
            key={i}
            time={r.time}
            tone={SEVERITY_TONE[r.severity]}
            label={SEVERITY_LABEL[r.severity]}
            source={r.source}
            message={r.message}
            isLast={i === rows.length - 1}
          />
        ))}
      </ul>
    </AiCard>
  );
}
