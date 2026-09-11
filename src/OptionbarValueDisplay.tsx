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
 * <OptionbarValueDisplay value="ORA11K" size="sm" />                  // 24px 행
 * <OptionbarValueDisplay value="ORA11K" display="chip" />             // 읽기 전용 값임을 칩으로 신호
 * ```
 */
import Chip from "./Chip";

export type OptionbarValueDisplaySize = "sm" | "md" | "lg";
/** 표현 방식 — text(평문, 기본) / chip(무채색 [[Chip]]). */
export type OptionbarValueDisplayVariant = "text" | "chip";

/** 사이즈 스펙 — md(32px) 는 기존 값 verbatim, sm(24px) 은 한 단계 아래. */
/* 컨트롤 공통 스케일 (feedback-control-size-scale) — sm 24 / md 28 / lg 32. */
const SIZE = {
  lg: { h: "h-32px", text: "text-md", chip: "md" },
  md: { h: "h-28px", text: "text-base", chip: "md" },
  sm: { h: "h-24px", text: "text-base", chip: "sm" },
} as const;

export default function OptionbarValueDisplay({
  value,
  size = "sm",
  display = "text",
}: {
  value: string;
  /** 높이 — sm(24px, **기본**) / md(32px). */
  size?: OptionbarValueDisplaySize;
  /**
   * 표현 방식 — `text`(평문, 기본) / `chip`.
   * `chip` 은 **무채색(neutral·soft)** 고정 — 값에 상태 색을 입히면 severity 로 오독된다.
   * 행의 다른 항목이 전부 인터랙티브 컨트롤인데 이 값만 읽기 전용임을 알릴 때 사용.
   */
  display?: OptionbarValueDisplayVariant;
}) {
  const spec = SIZE[size];
  if (display === "chip") {
    // 칩 자체 높이(sm 18 / md 20)는 행 높이보다 작으므로 행 높이 박스 안에서 수직 중앙 정렬.
    return (
      <div className={`flex items-center ${spec.h} min-w-0`} title={value}>
        <Chip tone="neutral" variant="soft" size={spec.chip}>
          {value}
        </Chip>
      </div>
    );
  }
  return (
    <div
      className={`flex items-center ${spec.h} ${spec.text} text-primary leading-normal tracking-normal truncate`}
      style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      title={value}
    >
      {value}
    </div>
  );
}
