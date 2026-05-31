/**
 * AI 위젯 — 일반 분석 문단 섹션 (제목 + 본문).
 *
 * 시나리오 메시지 스택 안에서 "분석 결과:" 같은 미디엄 레벨 헤딩과 본문 텍스트를
 * 렌더링. 페이드인 등장 애니메이션 포함.
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
      className="ai-anim-in flex flex-col gap-[4px] w-full"
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
