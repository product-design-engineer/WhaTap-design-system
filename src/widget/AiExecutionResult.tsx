/**
 * AI 위젯 — 실행 결과 메시지 (Figma 27139:62532).
 *
 * variant:
 *   - "success"  → ✅ 실행 완료
 *   - "failure"  → ⚠️ 실행 실패
 *   - "unknown"  → ❓ 알수 없는 오류
 *
 * 구조:
 *   [emoji 상태 라벨]          [yyyy-mm-dd HH:MM:SS]
 *   [본문(h4 bold 14)]
 *   • bullet 1
 *   • bullet 2
 *   ...
 *   [선택: 상세 블록 (KV 라인들)]
 *   [선택: 후속 안내 텍스트]
 *
 * 컬러는 #222(본문), var(--color-text-secondary)(보조), var(--color-text-tertiary)(timestamp).
 */

export type ExecutionResultVariant = "success" | "failure" | "unknown";

const VARIANT_LABEL: Record<ExecutionResultVariant, { emoji: string; title: string }> = {
  success: { emoji: "✅", title: "실행 완료" },
  failure: { emoji: "⚠️", title: "실행 실패" },
  unknown: { emoji: "❔", title: "알수 없는 오류" },
};

export type AiExecutionResultProps = {
  variant: ExecutionResultVariant;
  /** 타임스탬프 (yyyy-mm-dd HH:MM:SS) */
  timestamp: string;
  /** 본문 굵은 한 줄 (예: "CPU 알림 임계값이 변경되었습니다.") */
  body: string;
  /** 본문 아래 bullet 항목 */
  bullets?: string[];
  /** unknown 등에서 사용하는 상세 KV 라인 (라벨: 값) */
  details?: { label: string; value: string }[];
  /** 본문/세부 아래 굵은 후속 안내 */
  footer?: string;
};

export default function AiExecutionResult({
  variant,
  timestamp,
  body,
  bullets,
  details,
  footer,
}: AiExecutionResultProps) {
  const { emoji, title } = VARIANT_LABEL[variant];
  return (
    <div className="flex flex-col gap-[8px] w-full">
      {/* 헤더: 상태 라벨 + 타임스탬프 */}
      <div className="flex items-center justify-between gap-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-lg leading-none">{emoji}</span>
          <span
            className="text-md font-bold text-primary tracking-default leading-normal"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-base text-tertiary tracking-normal leading-normal"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {timestamp}
        </span>
      </div>

      {/* 본문 */}
      <p
        className="text-lg font-bold text-primary tracking-default leading-normal"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        {body}
      </p>

      {/* bullet 리스트 */}
      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-[4px] pl-[12px]">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="text-md text-primary tracking-default leading-normal list-disc list-outside"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      {/* details 블록 (라벨: 값) */}
      {details && details.length > 0 && (
        <div className="flex flex-col gap-[2px] pl-[12px]">
          {details.map((d, i) => (
            <div
              key={i}
              className="text-md text-secondary tracking-default leading-normal"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {d.label}: {d.value}
            </div>
          ))}
        </div>
      )}

      {/* footer */}
      {footer && (
        <p
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {footer}
        </p>
      )}
    </div>
  );
}
