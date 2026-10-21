/**
 * KpiField — 카드 머리에서 값 하나를 라벨과 함께 세우는 한 칸. Primitives layer.
 *
 * ## Purpose
 * 라벨 위 · 값 아래로 서는 속성 한 칸. 여러 개를 한 줄에 늘어놓아 카드가 «자기를 요약하는»
 * 자리를 만든다.
 *
 * 라벨을 값 왼쪽에 두지 않는다. 값의 길이가 제각각이라 세로선이 맞지 않고, 칸이 넷쯤 서면
 * 라벨과 값이 서로 다른 리듬으로 어긋난다.
 *
 * ## When to use
 * - 상세 화면 머리 카드의 속성 줄 (플랜 종류 · 사용량 한계 · 청구일 처럼 값 하나짜리 사실들).
 * - 그리드로 2~4칸 늘어놓는 자리. 한 칸만 세울 일은 거의 없다.
 *
 * ## When NOT to use
 * - 편집할 수 있는 값 → [[TextField]] · [[Select]]. 이 칸은 읽기 전용이다.
 * - 추세를 봐야 하는 수치 → [[MiniLineChart]]. 숫자 하나로는 답이 안 되는 자리다.
 * - 상태 낱말 하나 → [[Chip]]. 라벨이 필요 없다면 칸이 아니다.
 * - 표의 셀 → [[DataTable]]. 여러 행이 같은 기준을 공유하면 그건 표다.
 *
 * ## Composition rules
 * - **값이 굵고 라벨은 그대로다.** 이 행에서 읽히는 것은 값이고 라벨은 그 값이 무엇인지
 *   가리키는 말이라, 같은 무게로 서면 눈이 값을 먼저 잡지 못한다.
 * - 라벨 10px `text-tertiary` · 값 12px `font-semibold` `text-secondary`. 값에 다른 크기를
 *   쓰고 싶으면 `children` 안에서 감싼다(누적 크레딧처럼 머리 숫자로 쓰는 자리).
 * - `min-w-0` 이라 그리드 안에서 줄어든다. 폭은 담는 그리드가 정한다.
 *
 * @example
 * ```tsx
 * <div className="grid grid-cols-4 gap-16px">
 *   <KpiField label="플랜 종류">종량제</KpiField>
 *   <KpiField label="사용량 한계">500,000원 (250,000 크레딧)</KpiField>
 * </div>
 * ```
 */
import type { ReactNode } from "react";

export type KpiFieldProps = {
  /** 값이 무엇인지 가리키는 말. 짧게. */
  label: string;
  /** 값. 굵게 선다. 다른 크기가 필요하면 여기서 감싼다. */
  children: ReactNode;
  /** 루트 요소(라벨 · 값 세로 묶음)에 덧붙는 클래스 — 배치(여백 · 폭)용. 색 · 크기 override 금지. */
  className?: string;
};

export default function KpiField({ label, children, className }: KpiFieldProps) {
  return (
    <div className={`flex flex-col gap-4px min-w-0 ${className ?? ""}`}>
      <span className="text-xs text-tertiary">{label}</span>
      <span className="text-base text-secondary font-semibold">{children}</span>
    </div>
  );
}
