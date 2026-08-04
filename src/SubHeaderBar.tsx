/**
 * SubHeaderBar — Chrome layer. 페이지 헤더(48px) 아래 보조 행(40px).
 *
 * ## Purpose
 * 뒤로가기 · 브레드크럼 · 모드 탭 · 보조 액션을 담는 **고정 40px** 보조 헤더 바.
 * 사이드바 조직 스위처(40px)와 동일 높이라 좌/우 컬럼 2행이 정렬됨
 * (헤더 48px → 보조 행 40px 의 일관된 chrome 스케일).
 *
 * ## When to use
 * - 페이지 헤더 아래 "← 뒤로" / 브레드크럼 / 탭 진입 직전 보조 네비 행
 * - 관리자 콘솔 · 계정/엔터프라이즈 영역의 보조 네비게이션 바
 * - 대시보드 모드 전환 행(수정/관리자/뷰 [[Tabs]]) + LIVE 타이머·툴바 아이콘 묶음
 *
 * ## When NOT to use
 * - 주 페이지 타이틀·AI 진입 → `PageHeader` / `PageHeaderAiInline` (48px)
 * - 시간/프리셋 등 데이터 필터 옵션 → `OptionbarPage` / `FilterBar`
 *
 * ## Composition rules
 * - 높이 40px 고정(`box-border`) — 페이지에서 inline `<div>` 로 재구현 금지.
 * - 슬롯 3개 **전부 optional** — 환경에 따라 있는 것만 렌더된다:
 *   `left`(= `children` 별칭) / `center` / `right`.
 * - `children` 은 기존 사용처 호환용 `left` 별칭. 둘 다 주면 `left` 가 이긴다.
 * - `center` 는 남는 폭을 차지하며 가운데 정렬. 없으면 left/right 가 양끝 정렬.
 * - 슬롯 내용은 등록 컴포넌트 조합으로 — 예: [[Tabs]] · [[LiveTimerCompact]] ·
 *   [[ToolbarIconButton]] · `Button`. 반복/의미 구조를 인라인 JSX 로 짜지 말 것.
 * - 좌우 padding 은 `--wds-header-px` 토큰 고정 — 헤더·사이드바와 세로 정렬을 맞추기 위함.
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
 *
 * // 대시보드 모드 행 — 좌: 모드 탭 / 우: LIVE 타이머 + 툴바 아이콘
 * <SubHeaderBar
 *   left={<Tabs variant="large" items={MODES} value={mode} onChange={setMode} aria-label="대시보드 모드" />}
 *   right={
 *     <>
 *       <LiveTimerCompact durationLabel="30분" />
 *       <ToolbarIconButton icon="icon-print.svg" label="인쇄" tooltipPlacement="bottom" />
 *     </>
 *   }
 * />
 * ```
 */
import type { ReactNode } from "react";

export type SubHeaderBarProps = {
  /** 좌측 내용 — 백 버튼 · 브레드크럼 · 모드 [[Tabs]] 등(선택). `children` 과 동의어. */
  left?: ReactNode;
  /** `left` 의 별칭 — 기존 사용처 호환용(선택). `left` 가 있으면 무시된다. */
  children?: ReactNode;
  /** 가운데 슬롯 — 남는 폭을 차지하며 중앙 정렬(선택). */
  center?: ReactNode;
  /** 우측 정렬 보조 액션(선택). */
  right?: ReactNode;
  /** 외부 className — 루트 바에 병합. */
  className?: string;
};

export default function SubHeaderBar({
  left,
  children,
  center,
  right,
  className = "",
}: SubHeaderBarProps) {
  const leading = left ?? children;
  return (
    <div
      className={`flex items-center justify-between h-40px box-border gap-8px bg-card border-b border-color-var-color-border-strong shrink-0 ${className}`}
      style={{ paddingInline: "var(--wds-header-px)" }}
    >
      {/* 좌측 슬롯은 비어도 렌더 — justify-between 기준점이라 right 만 있을 때도 우측 정렬 유지 */}
      <div className="flex items-center gap-8px min-w-0">{leading}</div>
      {center != null && (
        <div className="flex items-center justify-center gap-8px min-w-0 flex-1">{center}</div>
      )}
      {right != null && <div className="flex items-center gap-8px shrink-0">{right}</div>}
    </div>
  );
}
