/**
 * MetricStat — 차트 옆에 서는 수치 하나: 작은 라벨 위에 큰 숫자, 필요하면 단위와 보조 줄. Primitives layer.
 *
 * ## Purpose
 * 그림 옆에서 정확한 값을 숫자로 못박는다. 그림은 흐름 · 분포의 느낌을, 이 수치는 값을 말한다.
 * 같은 카드 안 수치들이 같은 모양이어야 좌우 · 위아래가 대칭으로 읽혀 서로 비교된다
 * (들어온 RPS 와 나간 TPS · 활성과 비활성 에이전트).
 *
 * ## When to use
 * - [[ActiveTransactionSpeedWidget]] 의 왼쪽 RPS(`align="start"`) · 오른쪽 TPS(`align="end"`).
 * - [[ActiveTransactionArc]] 의 Max TX(단위 「초」 + 보조 줄 = 트랜잭션 이름) · Agent 활성 · 비활성.
 * - 흐름 · 게이지 · 고리 그림 옆에 실시간 수치 하나를 라벨과 함께 세울 때.
 *
 * ## When NOT to use
 * - 카드 하나를 숫자 하나로 채우는 핵심 지표 → [[KpiCard]] · [[StatCard]].
 * - 카드 머리의 속성 한 칸(값이 낱말일 수 있는 자리) → [[KpiField]].
 *
 * ## Composition rules
 * - 라벨은 기본 줄바꿈. `truncateLabel` 이면 한 줄 말줄임(전체는 `title`) — 칸 여럿을 나란히 둘 때 두 줄로 꺾여 숫자 줄 높이가 칸마다 달라지지 않게([[MetricGrid]] 가 켠다, 2026-10-23).
 * - 라벨 `text-sm` · `text-tertiary`, 숫자 `text-2xl`(compact `text-lg`) · `text-primary` · 중간 굵기 · 숫자 서체.
 * - 단위(`unit`)는 숫자 바로 뒤 `text-sm` · tertiary — 숫자보다 크면 숫자가 묻힌다.
 * - 보조 줄(`caption`)은 숫자 아래 `text-sm` · secondary · 말줄임(전체는 `title`). 값이 «누구의» 값인지 말한다.
 * - 폭은 기본 고정(72px, compact 56px) — 숫자 자릿수가 바뀌어도 옆 그림이 흔들리지 않는다. 담는 열이 폭을 정하면 `width="auto"`.
 * - `align` 으로 바깥쪽 끝에 붙인다(왼쪽 `start` · 오른쪽 `end`).
 *
 * ## Spec
 * | 항목 | 기본 | compact |
 * |---|---|---|
 * | 폭 | 72px(`width` 로 바꿈 · `auto` 면 담는 열) | 56px |
 * | 라벨 | `text-sm` · tertiary · 숫자 서체 | 같음 |
 * | 숫자 | `text-2xl` · primary · medium · 숫자 서체 · 라벨과 사이 2px | `text-lg` |
 * | 단위 | 숫자 뒤 2px · `text-sm` · tertiary · 숫자와 기준선 맞춤 | 같음 |
 * | 보조 줄 | 숫자 아래 4px · `text-sm` · secondary · 한 줄 말줄임 | 같음 |
 *
 * @example
 * ```tsx
 * <MetricStat label="RPS" value={113} />
 * <MetricStat label="TPS" value={116} align="end" />
 * <MetricStat label="Max TX" value={30} unit="초" caption="TC-1-57-8094" />
 * ```
 */
import type { ReactNode } from "react";

export type MetricStatProps = {
  /** 라벨(「RPS」 「Max TX」). */
  label: string;
  /** 수치. */
  value: ReactNode;
  /** 숫자 뒤 단위(「초」 「%」). */
  unit?: string;
  /** 숫자 아래 보조 줄 — 이 값이 누구의 값인지(트랜잭션 · 에이전트 이름). 한 줄 말줄임. */
  caption?: string;
  /** 붙일 끝 — 왼쪽 수치 `start`, 오른쪽 수치 `end`. 기본 `start`. */
  align?: "start" | "end";
  /** 좁은 카드용 작은 크기. */
  compact?: boolean;
  /** 폭(px). 기본 72(compact 56). `auto` 면 담는 열이 정한다. */
  width?: number | "auto";
  /** 라벨 한 줄 말줄임(전체는 `title`). 기본 false — 줄바꿈. 칸 여럿을 나란히 둘 때([[MetricGrid]]). */
  truncateLabel?: boolean;
};

export default function MetricStat({ label, value, unit, caption, align = "start", compact = false, width, truncateLabel = false }: MetricStatProps) {
  const NUM = { fontFamily: "var(--font-family-numeric)" } as const;
  const w = width === "auto" ? undefined : width ?? (compact ? 56 : 72);
  return (
    <div
      className={`flex flex-col justify-center min-w-0 ${w == null ? "" : "shrink-0"} ${align === "end" ? "items-end" : "items-start"}`}
      style={{ width: w }}
    >
      <span
        className={`text-sm text-tertiary${truncateLabel ? " truncate" : ""}`}
        title={truncateLabel ? label : undefined}
        style={{ ...NUM, fontWeight: "var(--font-weight-regular)", maxWidth: truncateLabel ? "100%" : undefined }}
      >
        {label}
      </span>
      <span className="flex items-baseline mt-2px" style={{ gap: 2 }}>
        <span className={`${compact ? "text-lg" : "text-2xl"} text-primary leading-none`} style={{ ...NUM, fontWeight: "var(--font-weight-medium)" }}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-tertiary" style={NUM}>
            {unit}
          </span>
        )}
      </span>
      {caption && (
        <span className="text-sm text-secondary truncate mt-4px" title={caption} style={{ ...NUM, maxWidth: "100%" }}>
          {caption}
        </span>
      )}
    </div>
  );
}
