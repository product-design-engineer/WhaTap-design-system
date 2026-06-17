import { AiBulletList } from "./_primitives";

/**
 * ProposalSection — Part. [[AiDashboardProposal]] 의 단일 섹션(행).
 *
 * ## Purpose
 * 제안 카드 한 섹션을 렌더 — 이모지 헤딩 + 굵은 제목 + bullet 목록. 인라인으로
 * `sections.map(...)` 안에 흩어져 있던 섹션 마크업을 한 곳으로 모은 것.
 *
 * ## When to use
 * - [[AiDashboardProposal]] 가 `sections.map` 으로 섹션마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 제안 카드 전체(인트로 + 위치 + 섹션들 + 확인 질문) → [[AiDashboardProposal]].
 * - 헤딩 없는 단순 bullet 목록 → [[AiBulletList]] 직접 사용.
 *
 * ## Composition rules
 * - 데이터(emoji · title · bullets)만 주입 — 외형(헤딩/굵기/bullet)은 이 컴포넌트가 책임.
 * - bullet 렌더는 [[AiBulletList]] 프리미티브에 위임 — 인라인 목록 chrome 금지.
 *
 * @example
 * ```tsx
 * {sections.map((s, i) => (
 *   <ProposalSection key={i} emoji={s.emoji} title={s.title} bullets={s.bullets} />
 * ))}
 * ```
 */
export default function ProposalSection({
  emoji,
  title,
  bullets,
}: {
  /** 섹션 헤딩 이모지 (예: "📈") */
  emoji: string;
  /** 섹션 제목 (예: "성능") */
  title: string;
  /** bullet 목록 항목들 */
  bullets: string[];
}) {
  return (
    <div className="flex flex-col gap-4px">
      <div className="flex items-center gap-6px">
        <span className="text-lg leading-none">{emoji}</span>
        <span
          className="text-base font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </span>
      </div>
      <AiBulletList items={bullets} />
    </div>
  );
}
