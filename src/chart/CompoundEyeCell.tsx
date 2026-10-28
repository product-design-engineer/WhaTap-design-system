/**
 * CompoundEyeCell — 서버 한 대를 원 하나로. 안쪽 부채꼴 셋(CPU · 메모리 · 디스크, 반지름 = 사용률) + 바깥 반 링 둘(수신 · 송신). Primitives layer.
 *
 * ## Purpose
 * 라이브 서버 › 컴파운드아이의 셀이다(보존 결정, 2026-10-22). 라이브 셀은 축도 눈금도 숫자도 없어 셀끼리 상대 비교만 됐고,
 * 바깥 링(네트워크)과 안쪽 부채꼴(자원)이 한 원 안에서 서로 다른 스케일을 써 헷갈렸다(patterns §21).
 * 여기서는 **안쪽에 50% · 100% 기준 원**을 그어 부채꼴 반지름을 읽게 하고, **링은 틈으로 떼어** 다른 스케일임을 보이며, 스케일은 차트 범례가 말한다.
 *
 * ## When to use
 * - [[CompoundEye]] 의 칸 하나. 서버 · 노드 한 대의 자원 사용률 셋 + 네트워크 둘을 한 덩어리로.
 * - 대상 하나를 카드 안에 같은 모양으로 보일 때(상세 머리).
 *
 * ## When NOT to use
 * - 지표 하나의 상태만 → [[BlockCell]] · [[HexGrid]].
 * - 값을 정확히 읽어야 할 때 → [[MetricGrid]] · 표. 이 칸은 모양으로 고르고 툴팁으로 읽는다.
 *
 * ## Composition rules
 * - 바깥 링은 [[ChartArc]] 두 개(리프 Primitive 1개 — 계층 «리프 1개 예외»). 오른쪽 반 = 수신, 왼쪽 반 = 송신, 둘 다 12시에서 아래로 찬다(`fromEnd`).
 * - 부채꼴은 고정 자리 — CPU 위(−56° ~ 56°) · 메모리 오른쪽 아래 · 디스크 왼쪽 아래, 사이 8°. 반지름 = 사용률(0~100%, 선형). 위치가 지표를 말하므로 색은 계열 슬롯 1 · 2 · 3.
 * - 링 색은 `--color-chart-neutral` 하나 — 수신 · 송신은 좌우 자리가 말한다(계열 3슬롯 상한, §18).
 * - 바탕 원: 정상 `--color-surface-50` · 경고 `--color-status-warning-soft` · 위험 `--color-status-error-soft`. 상태는 바탕만, 부채꼴 색을 바꾸지 않는다(§23).
 * - 이름은 원 위 `text-sm` 한 줄 말줄임. 강조: `dimmed` 0.32, `focus` 면 그 지표만 남기고 나머지 마크 0.32(patterns §26).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 크기 | `size` 96(원) + 이름 줄 16 |
 * | 링 | [[ChartArc]] 굵기 4 · 수신 4° ~ 176° · 송신 −176° ~ −4°(`fromEnd`) · 트랙 `--color-surface-100` · 칠 `--color-chart-neutral` |
 * | 부채꼴 | 최대 반지름 = 링 안쪽 − 3 · 각 112° · 사이 8° · CPU series-1 · 메모리 series-2 · 디스크 series-3 |
 * | 기준 원 | 50% · 100% 1px `--color-border-soft` |
 * | 바탕 | normal `--color-surface-50` · warning `--color-status-warning-soft` · critical `--color-status-error-soft` |
 * | 접근성 | `role="img"` + 「이름 · CPU · 메모리 · 디스크 · 수신 · 송신」 |
 *
 * @example
 * ```tsx
 * <CompoundEyeCell name="web-01" cpu={42} memory={68} disk={31} rxRatio={0.4} txRatio={0.15} />
 * ```
 */
import type { MouseEvent } from "react";
import ChartArc from "./ChartArc";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type CompoundEyeMetric = "cpu" | "memory" | "disk" | "rx" | "tx";

export type CompoundEyeCellProps = {
  /** 서버 이름 — 원 위. */
  name: string;
  /** CPU 사용률 %(0~100). `null` = 수집 없음(부채꼴 없음). */
  cpu: number | null;
  /** 메모리 사용률 %. */
  memory: number | null;
  /** 디스크 사용률 %. */
  disk: number | null;
  /** 수신 — 링 스케일 대비 비율(0~1). 스케일은 차트가 정한다. */
  rxRatio: number | null;
  /** 송신 — 링 스케일 대비 비율(0~1). */
  txRatio: number | null;
  /** 상태 — 바탕 원. 기본 normal. */
  status?: "normal" | "warning" | "critical";
  /** 원 지름(px). 기본 96. */
  size?: number;
  /** 다른 칸이 강조 중이라 흐린다. */
  dimmed?: boolean;
  /** 이 지표만 남긴다(범례 hover). */
  focus?: CompoundEyeMetric | null;
  /** 접근성 요약에 붙일 수신 글자(「120Mbps」). 없으면 비율 %. */
  rxLabel?: string;
  /** 접근성 요약에 붙일 송신 글자. */
  txLabel?: string;
  /** 포인터가 들어올 때 — 차트가 툴팁을 칸 옆에 연다. */
  onMouseEnter?: (ev: MouseEvent<HTMLDivElement>) => void;
  /** 포인터가 나갈 때. */
  onMouseLeave?: () => void;
};

/* 자리 고정 — 토큰 이름을 문자 그대로(토큰 게이트가 참조를 읽는다) */
export const COMPOUND_EYE_COLOR: Record<CompoundEyeMetric, string> = {
  cpu: "var(--color-chart-series-1)",
  memory: "var(--color-chart-series-2)",
  disk: "var(--color-chart-series-3)",
  rx: "var(--color-chart-neutral)",
  tx: "var(--color-chart-neutral)",
};
const SECTOR: { key: "cpu" | "memory" | "disk"; from: number; to: number }[] = [
  { key: "cpu", from: -56, to: 56 },
  { key: "memory", from: 64, to: 176 },
  { key: "disk", from: 184, to: 296 },
];
const BG = { normal: "var(--color-surface-50)", warning: "var(--color-status-warning-soft)", critical: "var(--color-status-error-soft)" } as const;
const RING = 4;
/* ChartArc 는 바깥 임계 띠 자리(3 + 3)를 비워 둔다 — 링 중심 반지름 = size/2 − 6 − 굵기/2 */
const ARC_PAD = 6;

const pt = (c: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`;
};
const wedge = (c: number, r: number, from: number, to: number) => `M${c},${c}L${pt(c, r, from)}A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${pt(c, r, to)}Z`;

export default function CompoundEyeCell({
  name,
  cpu,
  memory,
  disk,
  rxRatio,
  txRatio,
  status = "normal",
  size = 96,
  dimmed = false,
  focus = null,
  rxLabel,
  txLabel,
  onMouseEnter,
  onMouseLeave,
}: CompoundEyeCellProps) {
  const c = size / 2;
  const inner = c - ARC_PAD - RING;
  const R = inner - 3;
  const vals = { cpu, memory, disk };
  const fade = (m: CompoundEyeMetric) => (focus != null && focus !== m ? DIM_OPACITY : 1);
  const pct = (v: number | null) => (v == null ? "없음" : `${Math.round(v)}%`);
  const summary = `${name} — CPU ${pct(cpu)} · 메모리 ${pct(memory)} · 디스크 ${pct(disk)} · 수신 ${rxLabel ?? pct(rxRatio == null ? null : rxRatio * 100)} · 송신 ${txLabel ?? pct(txRatio == null ? null : txRatio * 100)}`;

  return (
    <div
      role="img"
      aria-label={summary}
      className={`${MARK_CLASS} flex flex-col items-center min-w-0`}
      style={{ width: size, gap: 4, opacity: dimmed ? DIM_OPACITY : 1 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="block w-full truncate text-sm text-secondary text-center" style={{ lineHeight: "var(--leading-none)" }} title={name}>
        {name}
      </span>
      <span className="relative block" style={{ width: size, height: size }}>
        <svg aria-hidden className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={c} cy={c} r={inner} fill={BG[status]} />
          <circle cx={c} cy={c} r={R / 2} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" />
          <circle cx={c} cy={c} r={R} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" />
          {SECTOR.map((s) => {
            const v = vals[s.key];
            if (v == null || v <= 0) return null;
            return <path key={s.key} d={wedge(c, (R * Math.min(100, v)) / 100, s.from, s.to)} fill={COMPOUND_EYE_COLOR[s.key]} opacity={fade(s.key)} />;
          })}
        </svg>
        <span className="absolute inset-0" style={{ opacity: fade("rx") }}>
          <ChartArc ratio={rxRatio ?? 0} color={COMPOUND_EYE_COLOR.rx} size={size} thickness={RING} start={4} end={176} />
        </span>
        <span className="absolute inset-0" style={{ opacity: fade("tx") }}>
          <ChartArc ratio={txRatio ?? 0} color={COMPOUND_EYE_COLOR.tx} size={size} thickness={RING} start={-176} end={-4} fromEnd />
        </span>
      </span>
    </div>
  );
}
