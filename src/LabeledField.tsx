/**
 * LabeledField — 라벨 위, 컨트롤 아래로 묶는 세로 필드. Primitives layer.
 *
 * ## Purpose
 * 좌측 옵션 패널처럼 컨트롤이 세로로 쌓이는 자리에서 "이 값이 무엇인지" 를 위에 붙인다.
 * [[TextField]]·[[Select]] 는 자기 라벨을 가지고 있지만, [[OptionbarInstanceSelector]] 나
 * [[Tabs]] `segmented` 처럼 라벨 슬롯이 없는 컨트롤도 같은 리듬으로 세워야 한다.
 *
 * ## When to use
 * - 라벨 슬롯이 없는 컨트롤(세그먼트 토글·커스텀 트리거)을 폼처럼 세울 때.
 * - 라디오 · 체크박스 **묶음의 이름**을 화면에 보일 때 — `id` 를 [[RadioGroup]] `aria-labelledby` 로 잇는다(patterns §27).
 * - 한 패널 안에서 필드 여러 개의 라벨 높이·간격을 맞춰야 할 때.
 *
 * ## When NOT to use
 * - `label` prop 을 이미 가진 컨트롤([[TextField]]·[[Select]]) → 그쪽 prop 을 쓴다. 라벨을 두 번 그리지 않는다.
 * - 가로 라벨(라벨 왼쪽·컨트롤 오른쪽) → [[FilterBar]].
 *
 * ## Composition rules
 * - 라벨 타이포는 **[[TextField]]·[[Select]] 와 같은 필드 라벨 규칙** — `text-sm font-medium text-primary`
 *   (11px 고정), 라벨과 컨트롤 사이 간격 `gap-1_5`. 컨트롤 높이와 **무관하다**: 라벨은 컨트롤이
 *   24px 이든 32px 이든 라벨이라, 높이에 묶으면 값 글자와 같은 무게가 되어 라벨이 값을 이긴다.
 * - 그래서 `size` prop 이 없다. 컨트롤 크기는 감싸이는 컨트롤이 각자 진다.
 * - 배치는 부모가 정한다 — 부모에 `.wds-field-row` 가 있으면 폭이 넉넉할 때 라벨이 컨트롤
 *   좌측으로 붙고(인라인), 좁아지면 다시 위로 쌓인다. 컨테이너 선언이 없으면 늘 세로다.
 * - 라벨은 `htmlFor` 없이 시각 라벨로만 둔다 — 컨트롤이 버튼 묶음일 수 있어 label 결속이 성립하지 않는다.
 *   대신 `id` 를 주면 컨트롤에서 `aria-labelledby` 로 참조할 수 있다.
 *
 * @example
 * ```tsx
 * <LabeledField label="조회 기간">
 *   <Tabs variant="segmented" size="lg" items={items} value={v} onChange={setV} />
 * </LabeledField>
 * ```
 */
import type { ReactNode } from "react";

export type LabeledFieldProps = {
  /** 필드 라벨. */
  label: string;
  /** 라벨 element id — 컨트롤이 `aria-labelledby` 로 참조. */
  id?: string;
  /** 폭 채우기 — [[TextField]] `fullWidth` 와 나란히 쓸 때. */
  fullWidth?: boolean;
  /** 컨트롤. */
  children: ReactNode;
};

export default function LabeledField({
  label,
  id,
  fullWidth = false,
  children,
}: LabeledFieldProps) {
  return (
    <div className={`wds-field inline-flex flex-col gap-1_5 ${fullWidth ? "w-full" : ""}`}>
      <span id={id} className="text-sm font-medium text-primary">
        {label}
      </span>
      {children}
    </div>
  );
}
