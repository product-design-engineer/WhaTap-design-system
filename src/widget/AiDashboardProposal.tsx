/**
 * AI 위젯 — 대시보드 구성 제안 카드 (DB Exact-design 기준).
 *
 * 인트로 본문 + 위치 안내 + N개의 섹션(이모지 헤딩 + bullet 목록) + 최종 확인 질문.
 * 모든 데이터는 prop으로 외부화 — DB·APM·GPU 등 다른 컨텍스트에서도 재사용 가능.
 */
import { AiCard, AiBulletList } from "./_primitives";

export type ProposalSection = {
  emoji: string;
  title: string;
  bullets: string[];
};

export default function AiDashboardProposal({
  intro,
  locationHeading,
  locationLabel,
  sections,
  closingQuestion,
  delay = 0,
}: {
  /** 첫 문단 (예: "oracle_dnx 프로젝트에 적용된 RAC 지표를 활용한 …") */
  intro: string;
  /** 위치 안내 헤딩 이모지 (예: "📊") */
  locationHeading?: string;
  /** 위치 안내 본문 (예: "대시보드: 우측 → '인스턴스 모니터링'") */
  locationLabel?: string;
  /** 섹션들 — 각 섹션: 이모지 + 제목 + bullet 목록 */
  sections: ProposalSection[];
  /** 끝맺음 확인 질문 (예: "이 구성으로 …해도 좋을까요?") */
  closingQuestion: string;
  delay?: number;
}) {
  return (
    <AiCard delay={delay} padding={12} gap={10}>
      <p
        className="text-md text-primary tracking-default leading-loose"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {intro}
      </p>

      {locationLabel && (
        <div className="flex items-start gap-[6px]">
          {locationHeading && <span className="text-lg leading-none">{locationHeading}</span>}
          <span
            className="text-base font-bold text-primary tracking-default leading-normal"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {locationLabel}
          </span>
        </div>
      )}

      {sections.map((s, i) => (
        <div key={i} className="flex flex-col gap-[4px]">
          <div className="flex items-center gap-[6px]">
            <span className="text-lg leading-none">{s.emoji}</span>
            <span
              className="text-base font-bold text-primary tracking-default leading-normal"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {s.title}
            </span>
          </div>
          <AiBulletList items={s.bullets} />
        </div>
      ))}

      <p
        className="text-md text-primary tracking-default leading-relaxed mt-[4px]"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {closingQuestion}
      </p>
    </AiCard>
  );
}
