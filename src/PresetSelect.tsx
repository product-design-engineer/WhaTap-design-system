/**
 * PresetSelect — 우측 정렬 프리셋 드롭다운 + 우측 작은 저장/관리 아이콘 버튼.
 *
 * 라이브 마크업 `PresetSelector-styles__DropdownText` 등 그대로 옮긴 공용 컴포넌트.
 * DB / Server / APM 모든 페이지의 우측 옵션바에서 동일하게 사용.
 *
 * 정책: feedback-design-system-css-source / feedback-common-components-catalog
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
    <div className="flex items-center gap-[4px]">
      <button
        type="button"
        onClick={onOpenList}
        className="flex items-center justify-between h-[32px] px-[10px] bg-white border border-[#adadad] rounded-[4px] cursor-pointer hover:bg-gray-50"
        style={{ width }}
      >
        <span
          className="text-md text-primary truncate"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {label}
        </span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="#757575">
          <path d="M6.149 7.45L5.08 8.745l5.022 4.705 4.979-4.705-1.028-1.295-3.951 3.73z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="프리셋 관리"
        onClick={onManage}
        className="flex items-center justify-center size-[32px] bg-white border border-[#adadad] rounded-[4px] cursor-pointer hover:bg-gray-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#757575">
          <path d="M2 22V2h16l4 4.051V22H2zM8 4H4v16h2v-8h12v8h2V6.873L17.164 4H16v4H8V4zm8 10H8v6h8v-6zM14 4h-4v2h4V4z" />
        </svg>
      </button>
    </div>
  );
}
