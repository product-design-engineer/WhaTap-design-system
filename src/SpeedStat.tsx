/**
 * SpeedStat — 실시간 처리량 수치 하나: 작은 라벨(RPS · TPS) 위에 큰 숫자. Primitives layer.
 *
 * ## Purpose
 * 흐름 그림 양옆에서 «들어오는 양 · 나가는 양» 을 숫자로 못박는다. 그림은 흐름의 느낌을, 이 수치는 정확한 값을 말한다.
 * 양쪽이 같은 모양이어야 좌우가 대칭으로 읽혀 «들어온 만큼 나가는가» 를 비교할 수 있다.
 *
 * ## When to use
 * - [[ActiveTransactionSpeedWidget]] 의 왼쪽 RPS(`align="start"`) · 오른쪽 TPS(`align="end"`).
 * - 흐름 · 게이지 그림 옆에 실시간 처리량 하나를 라벨과 함께 세울 때.
 *
 * ## When NOT to use
 * - 카드 하나를 숫자 하나로 채우는 핵심 지표 → [[KpiCard]] · [[StatCard]].
 * - 라벨 : 값 한 줄 → [[KpiField]].
 *
 * ## Composition rules
 * - 라벨 `text-sm` · `text-tertiary`, 숫자 `text-2xl`(compact `text-lg`) · `text-primary` · 중간 굵기 · 숫자 서체.
 * - 폭은 고정(72px, compact 56px) — 숫자 자릿수가 바뀌어도 가운데 그림이 흔들리지 않는다.
 * - `align` 으로 바깥쪽 끝에 붙인다(왼쪽 `start` · 오른쪽 `end`).
 *
 * ## Spec
 * | 항목 | 기본 | compact |
 * |---|---|---|
 * | 폭 | 72px | 56px |
 * | 라벨 | `text-sm` · tertiary · 숫자 서체 | 같음 |
 * | 숫자 | `text-2xl` · primary · medium · 숫자 서체 · 라벨과 사이 2px | `text-lg` |
 *
 * @example
 * ```tsx
 * <SpeedStat label="RPS" value={113} />
 * <SpeedStat label="TPS" value={116} align="end" />
 * ```
 */
import type { ReactNode } from "react";

export type SpeedStatProps = {
  /** 라벨(「RPS」 「TPS」). */
  label: string;
  /** 수치. */
  value: ReactNode;
  /** 붙일 끝 — 왼쪽 수치 `start`, 오른쪽 수치 `end`. 기본 `start`. */
  align?: "start" | "end";
  /** 좁은 카드용 작은 크기. */
  compact?: boolean;
};

export default function SpeedStat({ label, value, align = "start", compact = false }: SpeedStatProps) {
  return (
    <div
      className={`flex flex-col justify-center shrink-0 ${align === "end" ? "items-end" : "items-start"}`}
      style={{ width: compact ? 56 : 72 }}
    >
      <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}>
        {label}
      </span>
      <span
        className={`${compact ? "text-lg" : "text-2xl"} text-primary leading-none mt-2px`}
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}
      >
        {value}
      </span>
    </div>
  );
}
