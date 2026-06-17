/**
 * SubHeaderBar — Chrome layer. 페이지 헤더(48px) 아래 보조 행(40px).
 *
 * ## Purpose
 * 뒤로가기 · 브레드크럼 · 보조 액션을 담는 **고정 40px** 보조 헤더 바.
 * 사이드바 조직 스위처(40px)와 동일 높이라 좌/우 컬럼 2행이 정렬됨
 * (헤더 48px → 보조 행 40px 의 일관된 chrome 스케일).
 *
 * ## When to use
 * - 페이지 헤더 아래 "← 뒤로" / 브레드크럼 / 탭 진입 직전 보조 네비 행
 * - 관리자 콘솔 · 계정/엔터프라이즈 영역의 보조 네비게이션 바
 *
 * ## When NOT to use
 * - 주 페이지 타이틀·AI 진입 → `PageHeader` / `PageHeaderAiInline` (48px)
 * - 시간/프리셋 등 데이터 필터 옵션 → `OptionbarPage` / `FilterBar`
 *
 * ## Composition rules
 * - 높이 40px 고정(`box-border`) — 페이지에서 inline `<div>` 로 재구현 금지.
 * - `children` = 좌측 내용(주로 `<Button variant="basic" size="md">` 백 버튼 + 브레드크럼 텍스트)
 * - `right` = 우측 정렬 보조 액션(선택)
 *
 * @example
 * ```tsx
 * <SubHeaderBar>
 *   <Button variant="basic" size="md" onClick={goBack}>← 엔터프라이즈 선택</Button>
 * </SubHeaderBar>
 *
 * <SubHeaderBar right={<Button size="md">새 조직</Button>}>
 *   <Button variant="basic" size="md" onClick={goBack}>← 엔터프라이즈 관리</Button>
 *   <span className="text-base text-tertiary">/ 조직: <span className="text-secondary font-medium">와탭랩스</span></span>
 * </SubHeaderBar>
 * ```
 */
import type { ReactNode } from "react";

export type SubHeaderBarProps = {
  /** 좌측 내용 — 백 버튼 + 브레드크럼 등. */
  children?: ReactNode;
  /** 우측 정렬 보조 액션(선택). */
  right?: ReactNode;
  /** 외부 className — 루트 바에 병합. */
  className?: string;
};

export default function SubHeaderBar({ children, right, className = "" }: SubHeaderBarProps) {
  return (
    <div
      className={`flex items-center justify-between h-40px box-border px-16px gap-8px bg-card border-b border-color-var-color-border-strong shrink-0 ${className}`}
    >
      <div className="flex items-center gap-8px min-w-0">{children}</div>
      {right != null && <div className="flex items-center gap-8px shrink-0">{right}</div>}
    </div>
  );
}
