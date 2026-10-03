/**
 * AiExecutionResult — 작업 실행 후 결과 통지 메시지.
 *
 * ## Purpose
 * AI 가 어떤 작업을 **실행한 뒤** 그 결과를 사용자에게 알리는 읽기 전용 통지. variant 로 상태를
 * 구분(✅ success / ⚠️ failure / ❔ unknown)하고, 헤더(상태 라벨 + 타임스탬프) + 본문 한 줄 +
 * bullet 목록 + 상세 KV 라인 + 후속 안내(footer)로 구성됩니다. bullet/details/footer 는 옵션.
 *
 * ## When to use
 * - 규칙 등록·설정 변경 등 작업이 끝난 직후 성공/실패 결과를 통지할 때.
 * - 실패·미상 오류의 원인을 details(KV) + footer 후속 안내로 보여줄 때.
 *
 * ## When NOT to use
 * - 실행 **전** 미리보기 / 승인 요청 → [[AiAlertRulePreview]] + [[AiChoiceButtons]].
 * - 진행 중(스피너) 상태 표시 → 도구 호출 진행 표시 컴포넌트.
 * - 구성 제안 안내 → [[AiDashboardProposal]] / [[AiMigPlan]].
 *
 * ## Composition rules
 * - 이 컴포넌트는 `AiCard` chrome 없이 자체 `flex-col` 레이아웃 (헤더+타임스탬프 전용 구조).
 * - 상태 emoji/라벨은 `VARIANT_LABEL` 맵으로 고정 — 호출부에서 임의 변경하지 말 것.
 * - 텍스트 색은 토큰 (`--color-text-primary/secondary/tertiary`) 사용.
 *
 * @example
 * ```tsx
 * <AiExecutionResult
 *   variant="success"
 *   timestamp="2026-05-31 14:02:11"
 *   body="CPU 알림 임계값이 변경되었습니다."
 *   bullets={["Critical 90% → 85%"]}
 * />
 * ```
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
    <div className="flex flex-col gap-8px w-full">
      {/* 헤더: 상태 라벨 + 타임스탬프 */}
      <div className="flex items-center justify-between gap-8px">
        <div className="flex items-center gap-6px">
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
        <ul className="flex flex-col gap-4px pl-12px">
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
        <div className="flex flex-col gap-2px pl-12px">
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
