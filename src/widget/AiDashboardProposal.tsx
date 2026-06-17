/**
 * AiDashboardProposal — AI 가 제안하는 대시보드 구성 안내 카드.
 *
 * ## Purpose
 * AI 가 만들 대시보드 구성을 사용자에게 **제안**하는 읽기 전용 카드. 인트로 본문 + 위치 안내
 * (이모지 + 라벨) + N개의 섹션(이모지 헤딩 + bullet 목록) + 끝맺음 확인 질문으로 구성됩니다.
 * 모든 데이터는 prop 으로 외부화되어 DB·APM·GPU 등 다른 컨텍스트에서도 재사용됩니다.
 *
 * ## When to use
 * - "이런 구성으로 대시보드를 만들까요?" 처럼 구성안을 섹션별로 제시하고 확인을 구하는 단계.
 * - 위치 안내(어느 메뉴/패널에 생기는지) + 섹션별 패널 목록을 함께 보여줄 때.
 *
 * ## When NOT to use
 * - 실제 대시보드 **생성/적용** 액션 → 이 카드는 제안 안내일 뿐, 확정 CTA 는 [[AiChoiceButtons]] 로 분리.
 * - 단순 KV 요약 표 → [[AiAlertRulePreview]].
 * - 실행 후 결과 통지 → [[AiExecutionResult]].
 *
 * ## Composition rules
 * - [[AiCard]] + [[AiBulletList]] 프리미티브 조립 — 인라인 chrome 금지.
 * - 카드 자체는 확인 질문까지만 — 승인/거부 버튼은 카드 밖 [[AiChoiceButtons]] 로.
 * - `delay` 는 부모 메시지 시퀀스에서 계산 (stagger).
 *
 * @example
 * ```tsx
 * <AiDashboardProposal
 *   intro="oracle_dnx 프로젝트에 RAC 지표 기반 대시보드를 제안합니다."
 *   locationHeading="📊"
 *   locationLabel="대시보드: 우측 → '인스턴스 모니터링'"
 *   sections={[{ emoji: "📈", title: "성능", bullets: ["CPU", "Wait Class"] }]}
 *   closingQuestion="이 구성으로 만들어도 좋을까요?"
 * />
 * ```
 */
import { AiCard } from "./_primitives";
import ProposalSection from "./ProposalSection";

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
        <div className="flex items-start gap-6px">
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
        <ProposalSection key={i} emoji={s.emoji} title={s.title} bullets={s.bullets} />
      ))}

      <p
        className="text-md text-primary tracking-default leading-relaxed mt-4px"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {closingQuestion}
      </p>
    </AiCard>
  );
}
