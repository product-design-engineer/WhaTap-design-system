import { useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * ChartStackedColumn — 값축 위에 서는 세로 막대 하나. 구간을 아래에서 위로 쌓고 구간마다 값 글자를 붙인다. Primitives layer.
 *
 * ## Purpose
 * 한 단계 · 한 대상의 «얼마 중 얼마» 를 세로 막대 하나로 말한다. 아래 구간이 해당 몫(Allocated 6), 위 구간이 나머지(Not
 * Allocated 2)다. 구간 높이는 값축의 같은 `max` 를 분모로 하므로 [[ChartValueAxis]] 눈금과 높이가 맞는다.
 *
 * ## When to use
 * - 단계별 누적 막대(깔때기형) — [[GpuStatusBar]] 의 단계 하나.
 * - 범주 막대 차트에서 막대마다 «몫 + 나머지» 를 쌓아 보일 때.
 *
 * ## When NOT to use
 * - 시간 구간마다 막대(TPS · 응답시간) → [[MiniBarChart]] — 구간 수가 많고 막대가 칸을 꽉 채운다.
 * - 가로 막대 줄 → [[BarListItem]].
 * - 계열이 셋 이상인 누적 — 칸이 좁아 구간 글자가 겹친다. [[MiniBarChart]] 누적 + 범례.
 *
 * ## Composition rules
 * - 플롯 칸(높이가 정해진 세로 flex 칸) 안에 둔다. 막대 폭은 칸의 55%, 구간 높이는 `value / max`.
 * - 구간은 **아래에서 위로** 쌓는다(`segments[0]` 이 바닥). 구간 사이 간격 없음, 모서리 2px.
 * - 글자 자리: `inside` 는 구간 가운데에 고정 흰색(계열 색 위 전경 — 색 리터럴 정책의 허용 예외), `side` 는 막대 오른쪽 바깥에
 *   `text-secondary`. 칠이 연한 나머지 구간은 `side` 로 — 연한 면 위 흰 글자는 읽히지 않는다.
 * - **`side` 글자는 칸을 넘지 않는다(2026-10-26 사용자 결정 «범위를 넘지 않고 사람이 읽을 수 있게»).** 자리는 막대 오른쪽
 *   여백(칸의 22.5% − 4px)뿐이고 단어 단위로 줄을 바꾼다. 단어 하나가 여백보다 넓으면 그 구간 **안에 짙은 글자**
 *   (`text-secondary` — 연한 면 위라 읽힌다)로 옮기고, 구간 높이 · 막대 폭에도 안 들어가면 화면에서 감추고 스크린리더
 *   글자로만 남긴다 — 값은 조합처의 툴팁([[GpuStatusBar]])이 말한다. `inside` 글자도 같다 — 막대 폭 안에서 줄을 바꾸고,
 *   안 들어가면 감춘다(흰 글자가 막대 밖 흰 바탕으로 나가면 보이지 않는다). 넘친 글자가 옆 칸 · 카드 밖으로 나가던 결함
 *   («3 Not Effective» 가 카드 오른쪽 밖).
 * - 색은 마크 토큰. 몫 = 계열 색(`--color-chart-series-N`), 나머지 = `--color-surface-200`. 상태색을 «나머지» 로 쓰지 않는다(§17 · §23).
 * - 글자는 `text-chart`(9px) · 숫자 서체(§15 막대 값 글자).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 막대 폭 | 칸의 55% · 가운데 |
 * | 구간 높이 | `value / max` × 플롯 높이 · 모서리 2px |
 * | `inside` 글자 | 구간 가운데 · 고정 흰색 · `text-chart` · 숫자 서체 · 막대 폭 − 4px 안 단어 단위 줄바꿈 · 안 들어가면 스크린리더 글자만 |
 * | `side` 글자 | 막대 오른쪽 바깥 4px · 폭 ≤ 칸의 22.5% − 4px · 단어 단위 줄바꿈 · 줄 높이 1.2 · `text-secondary` · `text-chart` · 숫자 서체 |
 * | `side` 가 안 들어갈 때 | 구간 안 가운데 짙은 글자(`text-secondary`) → 그것도 안 되면 스크린리더 글자만 |
 *
 * @example
 * ```tsx
 * <ChartStackedColumn max={8} segments={[
 *   { value: 6, label: "6 Allocated", color: "var(--color-chart-series-1)", labelPlacement: "inside" },
 *   { value: 2, label: "2 Not Allocated", color: "var(--color-surface-200)", labelPlacement: "side" },
 * ]} />
 * ```
 */
export type ChartStackedSegment = {
  /** 구간 값. 0 이면 그리지 않는다. */
  value: number;
  /** 구간 글자(「6 Allocated」). 없으면 글자 없음. */
  label?: string;
  /** 구간 칠 토큰. hex 금지. */
  color: string;
  /** 글자 자리. 진한 계열 색 위 `inside`(흰 글자), 연한 나머지 `side`(막대 오른쪽 바깥). 기본 `inside`. */
  labelPlacement?: "inside" | "side";
};

export type ChartStackedColumnProps = {
  /** 아래에서 위로 쌓을 구간. `segments[0]` 이 바닥. */
  segments: ChartStackedSegment[];
  /** 값축 최대 — [[ChartValueAxis]] 와 같은 값. */
  max: number;
};

export default function ChartStackedColumn({ segments, max }: ChartStackedColumnProps) {
  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const read = () => setSize((p) => (p && p.w === el.clientWidth && p.h === el.clientHeight ? p : { w: el.clientWidth, h: el.clientHeight }));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* `side` 글자 자리 — 칸 폭과 글자 너비로 정한다. 재기 전(첫 그림)에는 `side` 그대로 둔다. */
  const fit = useMemo(() => {
    const font = probe.current ? getComputedStyle(probe.current).font : "";
    if (!size || !font || typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.font = font;
    const px = parseFloat(getComputedStyle(probe.current!).fontSize) || 9;
    const lineH = px * LINE;
    const barW = size.w * BAR;
    const free = (size.w * (1 - BAR)) / 2 - SIDE_GAP;
    return segments.map((s) => {
      if (!s.label) return null;
      const words = s.label.split(/\s+/);
      const width = (w: string) => ctx.measureText(w).width;
      const widest = Math.max(...words.map(width));
      if ((s.labelPlacement ?? "inside") === "side" && widest <= free) return "side" as const;
      /* 구간 안 — 막대 폭에서 단어 단위로 줄을 바꿔 구간 높이 안에 들면 안, 아니면 감춘다(스크린리더 글자만) */
      const segH = max > 0 ? (s.value / max) * size.h : 0;
      return widest <= barW - 4 && wrapCount(words, width, barW - 4) * lineH <= segH ? ("inside" as const) : ("hidden" as const);
    });
  }, [size, segments, max]);

  return (
    <div ref={root} className="relative flex items-center h-full w-full" style={{ flexDirection: "column-reverse" }}>
      <span ref={probe} aria-hidden className="absolute text-chart" style={{ visibility: "hidden", fontFamily: "var(--font-family-numeric)" }}>
        0
      </span>
      {segments.map((s, i) => {
        if (s.value <= 0) return null;
        const own = s.labelPlacement ?? "inside";
        const placement = fit?.[i] ?? own;
        return (
          <div
            key={i}
            className="relative flex items-center justify-center rounded-2px"
            style={{ width: `${BAR * 100}%`, height: max > 0 ? `${(s.value / max) * 100}%` : 0, background: s.color }}
          >
            {s.label &&
              (own === "inside" && placement === "inside" ? (
                <span
                  data-ds-policy-ok="차트 계열 색 막대 안 라벨 — 컬러 위 고정 흰색"
                  // raw-color-ok: 차트 계열 색으로 채운 막대 안 라벨 — 컬러 위 고정 흰색 전경.
                  className="absolute text-chart text-white text-center"
                  style={{ left: 2, right: 2, lineHeight: LINE, fontFamily: "var(--font-family-numeric)" }}
                >
                  {s.label}
                </span>
              ) : placement === "side" ? (
                <span
                  className="absolute text-chart text-secondary"
                  style={{
                    left: "100%",
                    marginLeft: SIDE_GAP,
                    /* 막대 오른쪽 여백만 — % 는 막대 폭 기준이라 칸 여백(칸의 (1 − 55%)/2)을 막대 폭으로 나눠 적는다 */
                    width: `calc(${(((1 - BAR) / 2 / BAR) * 100).toFixed(2)}% - ${SIDE_GAP}px)`,
                    lineHeight: LINE,
                    fontFamily: "var(--font-family-numeric)",
                  }}
                >
                  {s.label}
                </span>
              ) : placement === "inside" ? (
                <span
                  className="absolute text-chart text-secondary text-center"
                  style={{ left: 2, right: 2, lineHeight: LINE, fontFamily: "var(--font-family-numeric)" }}
                >
                  {s.label}
                </span>
              ) : (
                <span className="sr-only">{s.label}</span>
              ))}
          </div>
        );
      })}
    </div>
  );
}

/** 막대 폭 = 칸의 55% · side 글자 앞 여백 4px · 줄 높이 1.2 */
const BAR = 0.55;
const SIDE_GAP = 4;
const LINE = 1.2;

/** 단어를 폭 안에 욕심껏 담았을 때의 줄 수. */
function wrapCount(words: string[], width: (s: string) => number, max: number): number {
  let lines = 1;
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && width(next) > max) {
      lines += 1;
      cur = w;
    } else cur = next;
  }
  return lines;
}
