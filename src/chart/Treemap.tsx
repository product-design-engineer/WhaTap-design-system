/**
 * Treemap — 계층 구성의 크기를 칸 면적으로. 그룹 안에 항목 칸, 칸 넓이 = 값. Composite layer.
 *
 * ## Purpose
 * 많은 대상이 «전체에서 얼마씩 차지하는가» 를 한 판에 — 네임스페이스 › 파드 메모리 · 서비스 › 호스트 CPU 시간 · 모델 › GPU 수.
 * 막대로 수십 개를 늘어놓으면 길어지고, 도넛은 조각이 6개를 넘으면 읽히지 않는다. 트리맵은 넓이로 크기를, 묶음으로 계층을 말한다.
 * 라이브에 배치된 화면을 찾지 못한 유형이라(patterns §21) 문서의 요소(면적 = 값 · 테두리 · 작은 칸 라벨 숨김 · 색 기준 · 계층)로 만든다.
 *
 * ## When to use
 * - 대상 10~200개의 몫 비교 + 1단계 묶음 — 네임스페이스별 파드 메모리 · 서비스별 호스트 CPU 시간 · 디스크 용량 구성.
 * - 큰 몫이 어디 몰렸는지(쏠림)를 찾을 때.
 *
 * ## When NOT to use
 * - 대상 10개 미만 · 정밀 비교 → [[BarList]] · [[MiniDonutChart]](합 100% · 6개 이하).
 * - 시간 흐름 → [[StackedAreaChart]].
 * - 대상마다 상태(색이 판정) → [[HexGrid]] · [[BlockGrid]]. 트리맵 색은 묶음이지 상태가 아니다.
 *
 * ## Metrics
 * - ✅ 양수이고 더할 수 있는 크기의 계층 구성 — 네임스페이스 › 파드 메모리(MiB) · 서비스 › 호스트 CPU 시간 · 볼륨 › 디렉터리 용량 · 모델 › GPU 수
 * - ❌ 음수 · 0 이 섞인 값(증감) — 넓이로 말할 수 없다
 * - ❌ 비율(%) · 평균처럼 더하면 뜻이 없는 값 — 칸 넓이의 합이 거짓 전체를 말한다
 * - ❌ 시간 흐름 · 정밀 비교 → [[StackedAreaChart]] · [[BarList]]
 *
 * ## Composition rules
 * - 요소를 조합한다 — 묶음 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]]. 칸만 그린다(배치는 내부 `_treemapLayout` squarified). 그래서 Composite 계층이다.
 * - **색은 묶음(1단계)의 계열 슬롯**(`--color-chart-series-1..8`, 묶음 순서) — 묶음이 없으면 한 색(series-1). 상태색을 쓰지 않는다(§17 · §23).
 *   묶음이 8개를 넘으면 큰 8개만 색, 나머지는 「기타」(`--color-chart-neutral`) 로 합친다(§22).
 * - 칸 사이 1px 카드색. **라벨은 칸이 폭 56 · 높이 28 이상일 때만**(이름 `text-sm` + 값 `text-xs`, 흰 글자 — «컬러 위 고정 흰색 전경» 예외) — 작은 칸은 [[ChartTooltip]] 이 말한다.
 * - 크기 순으로 배치(큰 칸이 왼쪽 위). 넓이가 값에 비례하도록 납작한 칸을 피한다(squarified).
 * - hover: 칸을 가리키면 나머지 0.32 + 툴팁(이름 · 묶음 · 값 · 전체의 %), 범례 항목을 가리키면 그 묶음만 남긴다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 배치 | squarified · 묶음 먼저 나누고 묶음 안을 다시 나눈다 · 칸 사이 1px `--color-card` |
 * | 색 | 묶음 `--color-chart-series-{n}`(n ≤ 8) · 묶음 없음 series-1 · 넘친 묶음 「기타」 `--color-chart-neutral` |
 * | 라벨 | 칸 ≥ 56 × 28 일 때 · 이름 `text-sm` medium + 값 `text-xs` · 흰색 고정(컬러 위 전경 예외 · 두 채널 표기) · 안쪽 6 · 말줄임 |
 * | 범례 | 묶음이 있으면 위 오른쪽 한 줄 · 사각 견본(§26) · 이름 + 합계 |
 * | hover | 칸 · 범례 → 나머지 0.32 · [[ChartTooltip]](이름 · 묶음 · 값 + 단위 · 전체의 %) |
 * | 접근성 | 판 `role="img"` + 큰 칸 다섯 「이름 값」 요약 |
 *
 * @example
 * ```tsx
 * <Treemap unit="MiB" data={namespaces.map((ns) => ({ label: ns.name, children: ns.pods.map((p) => ({ label: p.name, value: p.mem })) }))} />
 * ```
 */
import { useEffect, useRef, useState } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";
import { squarify, type TreemapRect } from "./_treemapLayout";

export type TreemapNode = {
  /** 이름. */
  label: string;
  /** 값(양수) — 묶음이면 비워 두고 `children` 합을 쓴다. */
  value?: number;
  /** 묶음 안 항목 — 1단계까지. */
  children?: ReadonlyArray<{ label: string; value: number }>;
};

export type TreemapProps = {
  /** 묶음(children 있음) 또는 항목(value) 목록. 섞으면 항목은 각자 묶음 하나로 친다. */
  data: ReadonlyArray<TreemapNode>;
  /** 값 뒤 단위. */
  unit?: string;
  /** 묶음 범례 줄. 기본 true(묶음이 있을 때). */
  legend?: boolean;
};

/* 슬롯 1~8 — 토큰 이름을 문자 그대로(토큰 게이트가 참조를 읽는다) */
const SERIES = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
  "var(--color-chart-series-4)",
  "var(--color-chart-series-5)",
  "var(--color-chart-series-6)",
  "var(--color-chart-series-7)",
  "var(--color-chart-series-8)",
] as const;
const OTHER = "var(--color-chart-neutral)";
const MAX_GROUPS = 8;
const LABEL_W = 56;
const LABEL_H = 28;

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });

type Leaf = { label: string; group: string; value: number; color: string; rect: TreemapRect };

export default function Treemap({ data, unit = "", legend = true }: TreemapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const grouped = data.some((d) => d.children?.length);
  /* 묶음 — 합 큰 순 · 8개 넘으면 나머지는 「기타」 */
  let groups = data
    .map((d) => ({ label: d.label, items: d.children?.length ? [...d.children] : [{ label: d.label, value: d.value ?? 0 }] }))
    .map((g) => ({ ...g, sum: g.items.reduce((n, it) => n + Math.max(0, it.value), 0) }))
    .filter((g) => g.sum > 0)
    .sort((a, b) => b.sum - a.sum);
  if (grouped && groups.length > MAX_GROUPS) {
    const rest = groups.slice(MAX_GROUPS - 1);
    groups = [...groups.slice(0, MAX_GROUPS - 1), { label: "기타", items: rest.flatMap((g) => g.items.map((it) => ({ ...it, label: `${g.label} · ${it.label}` }))), sum: rest.reduce((n, g) => n + g.sum, 0) }];
  }
  const total = groups.reduce((n, g) => n + g.sum, 0);
  const colorOf = (gi: number, label: string) => (!grouped ? SERIES[0] : label === "기타" && gi === MAX_GROUPS - 1 ? OTHER : SERIES[gi] ?? OTHER);

  const leaves: Leaf[] = [];
  if (size.w > 0 && size.h > 0) {
    const gRects = squarify(groups.map((g) => g.sum), { x: 0, y: 0, w: size.w, h: size.h });
    groups.forEach((g, gi) => {
      const items = [...g.items].sort((a, b) => b.value - a.value);
      const rs = grouped ? squarify(items.map((it) => it.value), gRects[gi]) : [gRects[gi]];
      items.forEach((it, k) => leaves.push({ label: it.label, group: g.label, value: it.value, color: colorOf(gi, g.label), rect: rs[k] }));
    });
  }
  const h = hover != null ? leaves[hover] : null;
  const summary = `트리맵 — ${[...leaves].sort((a, b) => b.value - a.value).slice(0, 5).map((l) => `${l.label} ${fmt(l.value)}${unit}`).join(", ")}`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ gap: 8 }}>
      {grouped && legend && (
        <div className="flex flex-wrap justify-end" style={{ columnGap: 12, rowGap: 4 }}>
          {groups.map((g, gi) => (
            <ChartLegendItem
              key={g.label}
              color={colorOf(gi, g.label)}
              label={g.label}
              value={`${fmt(g.sum)}${unit}`}
              onHover={(on) => setFocus(on ? g.label : null)}
              dimmed={focus != null && focus !== g.label}
            />
          ))}
        </div>
      )}
      <div ref={ref} className="relative flex-1 min-h-0 w-full" role="img" aria-label={summary} style={{ minHeight: 120 }}>
        {leaves.map((l, i) => {
          const dim = (hover != null && hover !== i) || (focus != null && focus !== l.group);
          const showLabel = l.rect.w >= LABEL_W && l.rect.h >= LABEL_H;
          return (
            <div
              key={`${l.group}-${l.label}-${i}`}
              className={`${MARK_CLASS} absolute overflow-hidden`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                left: l.rect.x,
                top: l.rect.y,
                width: l.rect.w,
                height: l.rect.h,
                background: l.color,
                boxShadow: "inset 0 0 0 0.5px var(--color-card)",
                opacity: dim ? DIM_OPACITY : 1,
                padding: 6,
              }}
            >
              {showLabel && (
                <span
                  className="block"
                  data-ds-policy-ok="컬러 위 고정 흰색 전경"
                  // raw-color-ok: 계열 색 칸 위 글자 — 테마와 무관하게 흰색(다크에서 text-inverse 는 어두워 읽히지 않는다).
                  style={{ color: "#fff" }}
                >
                  <span className="block truncate text-sm" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {l.label}
                  </span>
                  <span className="block truncate text-xs" style={{ fontFamily: "var(--font-family-numeric)" }}>
                    {fmt(l.value)}
                    {unit}
                  </span>
                </span>
              )}
            </div>
          );
        })}
        {h && (
          <ChartTooltip
            left={h.rect.x + h.rect.w / 2}
            top={h.rect.y + h.rect.h / 2}
            flipX={h.rect.x + h.rect.w / 2 > size.w / 2}
            flipY={h.rect.y + h.rect.h / 2 > size.h / 2}
            title={h.label}
            rows={[...(grouped ? [{ label: "묶음", value: h.group, color: h.color }] : []), { label: "값", value: `${fmt(h.value)}${unit}` }]}
            footer={`전체의 ${total > 0 ? fmt((h.value / total) * 100) : 0}%`}
          />
        )}
      </div>
    </div>
  );
}
