/**
 * AiInsightSection — 선택 제목 + 본문 문단으로 된 AI 분석 텍스트 섹션.
 *
 * ## Purpose
 * AI 응답 메시지 스택 안에서 "분석 결과:" 같은 미디엄 레벨 헤딩(`title`, 굵게)과
 * 본문 문단(`body`, `whitespace-pre-wrap`)을 렌더하는 가장 단순한 서술형 블록.
 * `delay` 로 페이드인 등장 시점을 스택 흐름에 맞춰 지연.
 *
 * ## When to use
 * - AI 응답 중 한 단락의 서술/설명 텍스트(제목은 선택).
 * - 차트·표 위/아래에 붙는 해설 문단.
 *
 * ## When NOT to use
 * - 톤(critical/warning 등) 강조 헤딩이 필요 → [[AiCard]] + AiSectionHeading 의 `tone` 사용.
 * - 표·차트·목록 등 구조화 데이터 → 해당 전용 위젯 카드.
 * - 추론 단계/진행 타임라인 → [[AiReasoning]] · [[AiStepsTimeline]].
 *
 * ## Composition rules
 * - 배경·테두리 없는 투명 텍스트 블록 — 카드 외형이 필요하면 [[AiCard]] 로 감싸 composition.
 * - 텍스트 색은 primary 토큰, 폰트는 한국어 토큰 사용 — 인라인 색 지정 금지.
 *
 * @example
 * ```tsx
 * <AiInsightSection
 *   title="분석 결과"
 *   body={"최근 1시간 응답시간이 평소 대비 18% 증가했습니다.\n주요 원인은 DB 커넥션 대기입니다."}
 * />
 * ```
 */
export default function AiInsightSection({
  title,
  body,
  delay = 0,
}: {
  title?: string;
  body: string;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-4px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {title && (
        <p
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </p>
      )}
      <p
        className="text-md text-primary tracking-default leading-loose whitespace-pre-wrap"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {body}
      </p>
    </div>
  );
}
