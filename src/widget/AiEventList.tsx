/**
 * AiEventList — 실시간 알림 / 이벤트 기록 카드.
 *
 * 위젯 안에서 "최근 N 시간 알림 N건" 을 요약하고 각 행을 시간 + 심각도 + 소스 +
 * 메시지로 표시. AI 응답의 "이벤트 조회" 패스에 사용됩니다.
 *
 * 정책: feedback-widget-primitives — AiCard + AiSectionHeading + tone 토큰.
 */
import { AiCard, AiSectionHeading } from "./_primitives";
import { TONE_DOT, TONE_BG, type Tone } from "./_tokens";

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
        {rows.map((r, i) => {
          const tone = SEVERITY_TONE[r.severity];
          return (
            <li
              key={i}
              className="flex items-start gap-[8px] py-[6px] border-b border-[color:var(--color-surface-50)] last:border-b-0"
            >
              {/* 시간 (고정폭) */}
              <span
                className="shrink-0 text-sm text-tertiary tracking-default leading-relaxed w-[42px] tabular-nums"
                style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}
              >
                {r.time}
              </span>

              {/* 심각도 도트 + 라벨 (컬러 칩) */}
              <span
                className="shrink-0 flex items-center gap-[4px] px-[5px] py-[1px] rounded-[8px] whitespace-nowrap"
                style={{ background: TONE_BG[tone] }}
              >
                <span
                  className="size-[5px] rounded-full"
                  style={{ background: TONE_DOT[tone] }}
                />
                <span
                  className="text-xs tracking-default leading-none"
                  style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)", color: TONE_DOT[tone] }}
                >
                  {SEVERITY_LABEL[r.severity]}
                </span>
              </span>

              {/* source + message — 한 줄 truncate */}
              <span
                className="text-base text-primary tracking-default leading-relaxed flex-1 min-w-0 truncate"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                <span className="text-secondary">{r.source}</span>
                <span className="text-gray-pale mx-[6px]">·</span>
                {r.message}
              </span>
            </li>
          );
        })}
      </ul>
    </AiCard>
  );
}
