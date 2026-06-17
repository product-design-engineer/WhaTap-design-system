import { TONE_DOT, TONE_BG, type Tone } from "./_tokens";
import type { EventSeverity, EventRow } from "./AiEventList";

/**
 * EventListItem — [[AiEventList]] 의 단일 이벤트 행(`<li>`).
 *
 * ## Purpose
 * 이벤트 한 건을 한 줄로 렌더 — 시간(고정폭) · 심각도 칩(도트 + 라벨) · 소스 + 메시지(truncate).
 * `AiEventList` 의 `rows.map(...)` 안에 인라인되어 있던 행 마크업을 그대로 추출한 것.
 *
 * ## When to use
 * - [[AiEventList]] 가 `rows.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 카드 chrome / 헤딩 / 요약 줄 → 부모 [[AiEventList]] 가 책임.
 * - 이벤트가 아닌 다른 목록 항목 → 해당 위젯의 행 컴포넌트 사용.
 *
 * ## Composition rules
 * - 심각도 → Tone 매핑·라벨은 부모가 결정해 `tone` · `label` 로 주입 (이 컴포넌트는 표현용).
 * - 칩 색은 `TONE_BG`/`TONE_DOT` 토큰만 사용 — 인라인 hex 금지.
 * - 열 순서 고정: 시간(고정폭) · 심각도 칩 · 소스+메시지(truncate).
 * - `isLast` 면 하단 보더 제거. `last-border-b-0` 는 CSS `:last-child` 라 마지막 행에서만
 *   적용 → prop 으로 동일 결과를 명시적으로도 노출(둘 다 같은 결과). 시각/동작 무변경.
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => (
 *   <EventListItem
 *     key={i}
 *     time={r.time}
 *     tone={SEVERITY_TONE[r.severity]}
 *     label={SEVERITY_LABEL[r.severity]}
 *     source={r.source}
 *     message={r.message}
 *     isLast={i === rows.length - 1}
 *   />
 * ))}
 * ```
 */
export default function EventListItem({
  time,
  tone,
  label,
  source,
  message,
  isLast = false,
}: {
  /** "14:32" 또는 "06/12 14:32" */
  time: EventRow["time"];
  /** 심각도에서 매핑된 디자인 시스템 Tone (부모가 결정) */
  tone: Tone;
  /** 심각도 표시 라벨. 예: "Critical" */
  label: string;
  /** "server-prod-01", "oracle_dnx/RAC-1" */
  source: EventRow["source"];
  /** 한 줄 요약 메시지 */
  message: EventRow["message"];
  /** 마지막 항목이면 하단 보더 제거 */
  isLast?: boolean;
}) {
  return (
    <li
      className="flex items-start gap-8px py-6px border-b border-color-var-color-surface-50 last-border-b-0"
    >
      {/* 시간 (고정폭) */}
      <span
        className="shrink-0 text-sm text-tertiary tracking-default leading-relaxed w-42px tabular-nums"
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}
      >
        {time}
      </span>

      {/* 심각도 도트 + 라벨 (컬러 칩) */}
      <span
        className="shrink-0 flex items-center gap-4px px-5px py-1px rounded-8px whitespace-nowrap"
        style={{ background: TONE_BG[tone] }}
      >
        <span
          className="size-5px rounded-full"
          style={{ background: TONE_DOT[tone] }}
        />
        <span
          className="text-xs tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)", color: TONE_DOT[tone] }}
        >
          {label}
        </span>
      </span>

      {/* source + message — 한 줄 truncate */}
      <span
        className="text-base text-primary tracking-default leading-relaxed flex-1 min-w-0 truncate"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        <span className="text-secondary">{source}</span>
        <span className="text-gray-pale mx-6px">·</span>
        {message}
      </span>
    </li>
  );
}

export type { EventSeverity, EventRow };
