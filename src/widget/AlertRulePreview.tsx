/**
 * AiAlertRulePreview — 알림 규칙 등록 전 미리보기 카드.
 *
 * ## Purpose
 * AI 가 만들 알림 규칙을 등록 **직전에** 사용자에게 읽기 전용으로 보여주는 카드.
 * 2-컬럼 KV 테이블(항목/내용)로 규칙 이름·카테고리·조건·심각도·대상을 요약하고,
 * 아래에 ℹ️ 참고 노트(임계값 기본값·평가 단위 등 주의점)를 덧붙입니다.
 * `fields` 의 `value` 는 ReactNode 라 심각도 `🔴 Critical` 같은 배지/색을 그대로 받습니다.
 *
 * ## When to use
 * - AI MCP 시나리오에서 "이 규칙으로 등록할까요?" 직전, 규칙 내용을 사람이 검토하는 단계.
 * - 룰의 핵심 필드(이름/조건/심각도/대상)를 한눈에 요약해 보여줄 때.
 *
 * ## When NOT to use
 * - 실제 규칙 **적용/등록** 액션 → 이 카드는 read-only 미리보기일 뿐, 적용은 레거시 알림 설정 페이지에서.
 * - 사용자 선택 CTA 가 필요 → [[AiChoiceButtons]] (예: "등록 / 수정") 를 카드 아래 별도로 배치.
 * - 실행 후 결과 통지 → [[AiExecutionResult]].
 *
 * ## Composition rules
 * - [[AiCard]] + [[AiSectionHeading]](📋) + [[AiBulletList]] 프리미티브 조립 — 인라인 chrome 금지.
 * - 색은 토큰 (`--color-border-default` · `--color-surface-50`) 사용, 심각도 색은 `value` ReactNode 쪽에서.
 * - 액션 버튼을 내부에 넣지 말 것 — preview 와 액션은 분리.
 *
 * @example
 * ```tsx
 * <AiAlertRulePreview
 *   title="알림 규칙 상세"
 *   fields={[
 *     { label: "규칙 이름", value: "Disk" },
 *     { label: "조건", value: "usedPercent > 90" },
 *     { label: "심각도", value: "🔴 Critical" },
 *   ]}
 *   notes={["기본 임계값은 Critical 95%, Warning 90% 입니다."]}
 * />
 * ```
 */
import { Fragment, type ReactNode } from "react";
import { AiCard, AiSectionHeading, AiBulletList } from "./_primitives";

export type AlertRuleField = {
  label: string;
  /** 값. 문자열 또는 ReactNode (예: 심각도 🔴 Critical, 배지 등) */
  value: ReactNode;
};

export default function AiAlertRulePreview({
  title = "알림 규칙 상세",
  fields,
  notes,
  notesTitle = "참고",
  delay = 0,
}: {
  title?: string;
  fields: AlertRuleField[];
  notes?: string[];
  notesTitle?: string;
  delay?: number;
}) {
  return (
    <AiCard delay={delay}>
      <AiSectionHeading emoji="📋">{title}</AiSectionHeading>

      {/* 2-컬럼 KV 테이블 (항목 / 내용) */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: "92px 1fr",
          fontFamily: "var(--font-family-korean)",
        }}
      >
        {/* 헤더 행 */}
        <div className="text-base font-bold text-tertiary tracking-default leading-none px-2px py-6px border-b border-color-var-color-border-default">
          항목
        </div>
        <div className="text-base font-bold text-tertiary tracking-default leading-none px-2px py-6px border-b border-color-var-color-border-default">
          내용
        </div>
        {/* 데이터 행 */}
        {fields.map((f, i) => (
          <Fragment key={i}>
            <div
              className="text-base text-secondary tracking-default leading-normal px-2px py-6px border-b border-color-var-color-surface-50"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {f.label}
            </div>
            <div
              className="text-md text-primary tracking-default leading-normal px-2px py-6px border-b border-color-var-color-surface-50"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {f.value}
            </div>
          </Fragment>
        ))}
      </div>

      {/* 참고 노트 */}
      {notes && notes.length > 0 && (
        <div className="flex flex-col gap-6px mt-4px">
          <div className="flex items-center gap-6px">
            <span className="text-lg leading-none">ℹ️</span>
            <span
              className="text-md font-bold text-primary tracking-default leading-none"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {notesTitle}
            </span>
          </div>
          <AiBulletList items={notes} size="sm" />
        </div>
      )}
    </AiCard>
  );
}
