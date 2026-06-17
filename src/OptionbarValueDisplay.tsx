/**
 * OptionbarValueDisplay — Chrome / Foundation. [[OptionbarPage]] 의 텍스트 전용 값 표시.
 *
 * ## Purpose
 * 옵션바 항목 중 인터랙션 없는 단순 텍스트 값(예: 데이터베이스 이름)을 32px 박스에 표시.
 * 다른 옵션(LiveTimerCompact · InstanceSelector · PresetSelect)과 동일한 32px height baseline.
 *
 * ## When to use
 * - [[OptionbarPage]] 내부의 읽기 전용 텍스트 항목 (기본 용법 — 데이터베이스 옵션).
 * - 옵션바 밖에서 **동일한 32px 텍스트 값 표시**가 필요한 경우.
 *
 * ## When NOT to use
 * - **드롭다운 선택** → [[OptionbarInstanceSelector]] / [[PresetSelect]].
 * - **시간 표시 + 제어** → [[LiveTimerCompact]].
 * - **편집 가능한 텍스트** → [[TextField]].
 *
 * ## Composition rules
 * - 높이 32px 고정 — 옵션바 baseline 통일.
 * - 폰트는 `--font-family-numeric` · regular weight — 값 표시 전용.
 * - 색은 `text-primary` — 인라인 hex 금지.
 * - 긴 텍스트는 `truncate` + `title` 속성으로 잘림 + 호버 전체 표시.
 *
 * @example
 * ```tsx
 * <OptionbarValueDisplay value="ORA11K" />
 * ```
 */
export default function OptionbarValueDisplay({ value }: { value: string }) {
  return (
    <div
      className="flex items-center h-32px text-md text-primary leading-normal tracking-normal truncate"
      style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      title={value}
    >
      {value}
    </div>
  );
}
