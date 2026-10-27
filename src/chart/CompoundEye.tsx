/**
 * CompoundEye — 서버 여럿을 원 칸 격자로. 칸마다 자원 사용률 셋(부채꼴) + 네트워크 둘(반 링). 겹눈처럼 한눈에 이상한 칸을 찾는다. Composite layer.
 *
 * ## Purpose
 * 라이브 서버 › 컴파운드아이를 보존한다(2026-10-22 결정). 서버 수십 대에서 «어느 서버가 무엇 때문에 이상한가» 를 모양으로 먼저 찾는다 —
 * 부채꼴 하나가 크게 부푼 칸, 링이 꽉 찬 칸. 라이브는 값을 읽을 길이 없었고(축 · 눈금 · 숫자 없음) 링과 부채꼴의 스케일이 섞였다(patterns §21).
 * 여기서는 칸 안 50% · 100% 기준 원, 범례에 링 스케일(«링 끝 = 100Mbps»), hover 툴팁에 다섯 값을 둔다.
 *
 * ## When to use
 * - 서버 · 노드 10~200대의 자원 + 네트워크를 한 화면에서 훑을 때 — 이상한 모양의 칸을 먼저 찾고 툴팁 · 상세로 읽는다.
 * - 같은 역할 서버 묶음(웹 · DB)의 편차를 볼 때.
 *
 * ## When NOT to use
 * - 지표 하나의 상태 분포 → [[HexGrid]] · [[BlockGrid]].
 * - 서버 몇 대의 값을 정확히 비교 → [[EqualizerChart]] · [[BarList]] · 표.
 * - 시간 흐름 → 선 차트.
 *
 * ## Metrics
 * - ✅ 서버별 자원 사용률 %(CPU · 메모리 · 디스크) + 네트워크 수신 · 송신(bps) — 같은 스케일로 비교할 서버 묶음
 * - ❌ 사용률이 아닌 절대량(메모리 GiB · 디스크 TB) — 부채꼴 반지름은 0~100% 다
 * - ❌ 부채꼴 넷 이상 · 다른 지표로 바꾸기 — 자리가 지표를 말한다(CPU 위 · 메모리 오른쪽 · 디스크 왼쪽)
 * - ❌ 서버 1~3대 → [[MetricGrid]] · [[RangeGauge]]
 *
 * ## Colors
 * - 정체성 — CPU · 메모리 · 디스크 = 계열 슬롯 `--color-chart-series-1` · `-2` · `-3`
 * - 판정 밖 — 수신 · 송신 링 · `--color-chart-neutral`
 *
 * ## Composition rules
 * - 요소를 조합한다 — 칸 [[CompoundEyeCell]] · 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]]. 격자 배치만 한다. 그래서 Composite 계층이다.
 * - **링 스케일은 하나 · 범례가 말한다(2026-10-23 추천안)** — `networkScale`(기본 100Mbps)이 링 끝. 넘으면 링이 꽉 차고 툴팁이 실제 값을 말한다.
 *   스케일 고르기(1Kbps ~ 1Gbps)는 화면 옵션바가 맡고 이 차트는 prop 으로 받는다.
 * - 색 = 자리: CPU · 메모리 · 디스크 = 계열 슬롯 1 · 2 · 3, 링 = `--color-chart-neutral`(수신 오른쪽 · 송신 왼쪽). 상태는 칸 바탕만(§23).
 * - 칸 정렬은 호출부 순서. 상태 나쁜 칸을 앞에 두려면 호출부가 정렬한다.
 * - hover: 칸을 가리키면 나머지 칸 0.32 + 툴팁(5값 · 상태). 범례를 가리키면 모든 칸에서 그 지표만 남긴다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 격자 | 칸 `cellSize` 96 · 가로 줄바꿈 · 사이 16 · 줄 사이 12 |
 * | 범례 | 위 한 줄 — CPU · 메모리 · 디스크(사각) · 링(선) «수신 → · ← 송신 · 링 끝 = {스케일}» |
 * | 툴팁 | [[ChartTooltip]] 칸 오른쪽(오른쪽 절반이면 왼쪽) · 5값 · 보조 줄 상태 |
 * | 접근성 | 칸마다 `role="img"` 요약 · 격자 `role="list"` |
 *
 * @example
 * ```tsx
 * <CompoundEye networkScale={100e6} servers={[{ name: "web-01", cpu: 42, memory: 68, disk: 31, rx: 40e6, tx: 12e6 }]} />
 * ```
 */
import { useRef, useState } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import CompoundEyeCell, { COMPOUND_EYE_COLOR, type CompoundEyeMetric } from "./CompoundEyeCell";

export type CompoundEyeServer = {
  /** 서버 이름. */
  name: string;
  /** 사용률 %(0~100). `null` = 수집 없음. */
  cpu: number | null;
  memory: number | null;
  disk: number | null;
  /** 네트워크 수신 · 송신(bps). */
  rx: number | null;
  tx: number | null;
  /** 상태 — 칸 바탕. */
  status?: "normal" | "warning" | "critical";
};

export type CompoundEyeProps = {
  /** 서버들 — 이 순서로 놓는다. */
  servers: ReadonlyArray<CompoundEyeServer>;
  /** 링 끝 값(bps). 기본 100Mbps. */
  networkScale?: number;
  /** 칸 지름(px). 기본 96. */
  cellSize?: number;
};

const STATUS_LABEL = { normal: "정상", warning: "경고", critical: "위험" } as const;

/** bps 글자 — 1000 단위(네트워크 관례). */
export function formatBps(v: number): string {
  const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
  let i = 0;
  let n = v;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return `${+n.toFixed(n < 10 && i ? 1 : 0)}${units[i]}`;
}

export default function CompoundEye({ servers, networkScale = 100e6, cellSize = 96 }: CompoundEyeProps) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number; flip: boolean } | null>(null);
  const [focus, setFocus] = useState<CompoundEyeMetric | null>(null);
  const ratio = (v: number | null) => (v == null ? null : Math.min(1, v / networkScale));
  const pct = (v: number | null) => (v == null ? "수집 없음" : `${Math.round(v)}%`);
  const bps = (v: number | null) => (v == null ? "수집 없음" : formatBps(v));
  const h = hover ? servers[hover.i] : null;
  const legend: { key: CompoundEyeMetric; label: string }[] = [
    { key: "cpu", label: "CPU" },
    { key: "memory", label: "메모리" },
    { key: "disk", label: "디스크" },
  ];

  return (
    <div className="flex flex-col w-full min-w-0" style={{ gap: 12 }}>
      <div className="flex flex-wrap items-center" style={{ columnGap: 12, rowGap: 4 }}>
        {legend.map((l) => (
          <ChartLegendItem key={l.key} color={COMPOUND_EYE_COLOR[l.key]} label={l.label} onHover={(on) => setFocus(on ? l.key : null)} dimmed={focus != null && focus !== l.key} />
        ))}
        <ChartLegendItem color={COMPOUND_EYE_COLOR.rx} shape="line" label="수신 →" onHover={(on) => setFocus(on ? "rx" : null)} dimmed={focus != null && focus !== "rx"} />
        <ChartLegendItem color={COMPOUND_EYE_COLOR.tx} shape="line" label="← 송신" onHover={(on) => setFocus(on ? "tx" : null)} dimmed={focus != null && focus !== "tx"} />
        <span className="text-sm text-tertiary">링 끝 = {formatBps(networkScale)} · 안쪽 원 50% · 100%</span>
      </div>
      <div ref={box} role="list" className="relative flex flex-wrap" style={{ columnGap: 16, rowGap: 12 }}>
        {servers.map((s, i) => (
          <div key={`${s.name}-${i}`} role="listitem">
            <CompoundEyeCell
              name={s.name}
              cpu={s.cpu}
              memory={s.memory}
              disk={s.disk}
              rxRatio={ratio(s.rx)}
              txRatio={ratio(s.tx)}
              rxLabel={bps(s.rx)}
              txLabel={bps(s.tx)}
              status={s.status}
              size={cellSize}
              focus={focus}
              dimmed={hover != null && hover.i !== i}
              onMouseEnter={(ev) => {
                const b = box.current?.getBoundingClientRect();
                const r = ev.currentTarget.getBoundingClientRect();
                if (!b) return;
                const flip = r.left + r.width / 2 - b.left > b.width / 2;
                setHover({ i, x: (flip ? r.left : r.right) - b.left, y: r.top + r.height / 2 - b.top, flip });
              }}
              onMouseLeave={() => setHover(null)}
            />
          </div>
        ))}
        {h && hover && (
          <ChartTooltip
            left={hover.x}
            top={hover.y}
            flipX={hover.flip}
            title={h.name}
            rows={[
              { label: "CPU", value: pct(h.cpu), color: COMPOUND_EYE_COLOR.cpu, shape: "square" },
              { label: "메모리", value: pct(h.memory), color: COMPOUND_EYE_COLOR.memory, shape: "square" },
              { label: "디스크", value: pct(h.disk), color: COMPOUND_EYE_COLOR.disk, shape: "square" },
              { label: "수신", value: bps(h.rx), color: COMPOUND_EYE_COLOR.rx, shape: "line" },
              { label: "송신", value: bps(h.tx), color: COMPOUND_EYE_COLOR.tx, shape: "line" },
            ]}
            footer={`상태 ${STATUS_LABEL[h.status ?? "normal"]}${(h.rx ?? 0) > networkScale || (h.tx ?? 0) > networkScale ? ` · 링 끝(${formatBps(networkScale)}) 넘음` : ""}`}
          />
        )}
      </div>
    </div>
  );
}
