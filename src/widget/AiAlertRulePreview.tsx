/**
 * AiAlertRulePreview — 알림 규칙 등록 전 미리보기 카드.
 *
 * 구조 (Exact-design, MCP 시나리오):
 *   📋 알림 규칙 상세
 *   ┌─────────┬─────────────────────────────┐
 *   │ 항목    │ 내용                        │
 *   ├─────────┼─────────────────────────────┤
 *   │ 규칙 이름│ Disk                       │
 *   │ 카테고리│ server_disk                 │
 *   │ 조건    │ usedPercent > 90            │
 *   │ 심각도  │ 🔴 Critical                  │
 *   │ 대상    │ 전체 서버 · 전체 마운트 포인트 │
 *   └─────────┴─────────────────────────────┘
 *
 *   ℹ️ 참고
 *   • 기본 임계값은 Critical 95%, Warning 90% 이지만 ...
 *   • 마운트 포인트별로 개별 평가되므로 ...
 *
 * 정책: feedback-widget-primitives — AiCard + AiSectionHeading + AiBulletList 조립.
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
        <div className="text-base font-bold text-tertiary tracking-default leading-none px-[2px] py-[6px] border-b border-[#eaeaea]">
          항목
        </div>
        <div className="text-base font-bold text-tertiary tracking-default leading-none px-[2px] py-[6px] border-b border-[#eaeaea]">
          내용
        </div>
        {/* 데이터 행 */}
        {fields.map((f, i) => (
          <Fragment key={i}>
            <div
              className="text-base text-secondary tracking-default leading-normal px-[2px] py-[6px] border-b border-[#f5f5f5]"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {f.label}
            </div>
            <div
              className="text-md text-primary tracking-default leading-normal px-[2px] py-[6px] border-b border-[#f5f5f5]"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {f.value}
            </div>
          </Fragment>
        ))}
      </div>

      {/* 참고 노트 */}
      {notes && notes.length > 0 && (
        <div className="flex flex-col gap-[6px] mt-[4px]">
          <div className="flex items-center gap-[6px]">
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
