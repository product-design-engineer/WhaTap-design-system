/**
 * PresetSelect — 프리셋 드롭다운 + 관리 아이콘 버튼.
 *
 * ## Purpose
 * 선택된 프리셋 라벨을 보여주는 드롭다운 트리거(`onOpenList`)와 그 우측의 정사각형
 * 관리 아이콘 버튼(`onManage`) 한 쌍. 두 콜백 모두 외부 제어이며, 컴포넌트 자체는
 * 트리거 버튼만 렌더하고 목록/관리 패널은 호출측이 띄운다.
 *
 * ## When to use
 * - [[OptionbarPage]] 우측의 "프리셋" 항목.
 * - DB / Server / APM 페이지 옵션바에서 프리셋 선택 + 관리 진입이 함께 필요한 자리.
 *
 * ## When NOT to use
 * - 상태 dot 이 필요한 인스턴스 선택 → [[OptionbarInstanceSelector]].
 * - 시간 범위 선택 → [[TimeRangeSelector]].
 * - 일반 텍스트/검색 입력 → [[TextField]].
 *
 * ## Composition rules
 * - 드롭다운 버튼 폭 `width`(기본 230px) + 32px 정사각 관리 버튼, 4px gap.
 * - 두 버튼 모두 32px height, border-divider + rounded 4 로 옵션바 baseline 통일.
 * - 라벨은 korean 폰트 + truncate. 색은 토큰(var(--color-border-divider) 등).
 *
 * @example
 * ```tsx
 * <PresetSelect
 *   label="Default"
 *   onOpenList={() => openPresetList()}
 *   onManage={() => openPresetManager()}
 * />
 * ```
 */

export default function PresetSelect({
  label,
  width = 230,
  onOpenList,
  onManage,
}: {
  label: string;
  /** dropdown 버튼 너비 (px). 기본 230. */
  width?: number;
  onOpenList?: () => void;
  onManage?: () => void;
}) {
  return (
    <div className="flex items-center gap-4px">
      <button
        type="button"
        onClick={onOpenList}
        className="flex items-center justify-between h-32px px-10px bg-card border border-color-var-color-border-divider rounded-4px cursor-pointer hover-bg-surface-100"
        style={{ width }}
      >
        <span
          className="text-md text-primary truncate"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {label}
        </span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--color-text-tertiary)">
          <path d="M6.149 7.45L5.08 8.745l5.022 4.705 4.979-4.705-1.028-1.295-3.951 3.73z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="프리셋 관리"
        onClick={onManage}
        className="flex items-center justify-center size-32px bg-card border border-color-var-color-border-divider rounded-4px cursor-pointer hover-bg-surface-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-tertiary)">
          <path d="M2 22V2h16l4 4.051V22H2zM8 4H4v16h2v-8h12v8h2V6.873L17.164 4H16v4H8V4zm8 10H8v6h8v-6zM14 4h-4v2h4V4z" />
        </svg>
      </button>
    </div>
  );
}
