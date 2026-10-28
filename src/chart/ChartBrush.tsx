/**
 * ChartBrush — 시간축을 끌어 구간을 고른다(확대). 끄는 동안 플롯 위에 고른 띠. Primitives layer.
 *
 * ## Purpose
 * 수십 초 ~ 수 분을 한 폭에 넣은 Flame · Waterfall 은 앞쪽 짧은 구간이 폭의 몇 % 로 눌려 색 띠로만 읽힌다(patterns §21 — 라이브 세션 Flame 은
 * 162초 중 앞 2초가 3%). 구간을 골라 그 부분만 펼쳐 보게 한다. 플롯 위를 끌면 막대 hover · 클릭과 겹치므로 **시간축 줄만** 끄는 자리다.
 *
 * ## When to use
 * - 경과 시간이 X 인 차트의 확대 — [[FlameChart]] · [[WaterfallChart]].
 * - 긴 구간(수십 초 ~ 수 분)에 짧은 구간이 섞여 앞쪽이 눌릴 때 — 고른 구간만 펼쳐 이름을 읽게 한다.
 *
 * ## When NOT to use
 * - 대시보드 시간 범위 바꾸기(조회 기간) → 옵션바의 기간 선택. 이것은 차트 안 보기 확대다.
 * - 지도 · 토폴로지 배율 → [[TopologyZoomControl]].
 *
 * ## Composition rules
 * - 플롯 상자와 같은 자리(`left` · `right` · `top` · `bottom`)에 둔다. 끄는 자리는 아래 `strip` 높이(시간축 줄)뿐 — 나머지는 포인터를 통과시킨다.
 * - 끄는 동안 띠 `--color-brand-blue-wash` + 양 끝 1px `--color-brand-blue-border-tint`. 놓으면 `onSelect(from, to)`(플롯 폭 비율 0~1).
 * - 폭 `minRatio`(기본 1%) 미만으로 끈 것은 클릭으로 보고 버린다. 되돌리기(전체 보기)는 차트가 둔다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 끄는 자리 | 플롯 아래 `strip` 14px(시간 글자 줄) · 커서 `col-resize` |
 * | 띠 | 플롯 위 ~ 아래 · `--color-brand-blue-wash` · 양 끝 1px `--color-brand-blue-border-tint` |
 * | 결과 | `onSelect(from, to)` 0~1 · `minRatio` 0.01 미만 무시 |
 *
 * @example
 * ```tsx
 * <ChartBrush left={0} right={8} onSelect={(a, b) => setView([v0 + (v1 - v0) * a, v0 + (v1 - v0) * b])} />
 * ```
 */
import { useRef, useState } from "react";

export type ChartBrushProps = {
  /** 고른 구간 — 플롯 폭 비율(0~1, from < to). */
  onSelect: (from: number, to: number) => void;
  /** 플롯 왼쪽 끝 — CSS 길이. 차트의 플롯과 같게. */
  left?: number | string;
  /** 플롯 오른쪽 끝. */
  right?: number | string;
  /** 플롯 위 끝. */
  top?: number | string;
  /** 플롯 아래 끝 — 시간축 줄 위. 끄는 줄은 이 아래 `strip` 높이. */
  bottom?: number | string;
  /** 끄는 줄 높이(px) — 플롯 아래(시간 글자 줄). 기본 14. */
  strip?: number;
  /** 이보다 좁게 끈 것은 버린다. 기본 0.01. */
  minRatio?: number;
};

export default function ChartBrush({ onSelect, left = 0, right = 0, top = 0, bottom = 0, strip = 14, minRatio = 0.01 }: ChartBrushProps) {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);
  const ratio = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    return r && r.width > 0 ? Math.min(1, Math.max(0, (x - r.left) / r.width)) : 0;
  };
  const lo = drag ? Math.min(drag.a, drag.b) : 0;
  const hi = drag ? Math.max(drag.a, drag.b) : 0;
  return (
    <div ref={box} className="absolute pointer-events-none" style={{ left, right, top, bottom }}>
      {drag && (
        <span
          aria-hidden
          className="absolute"
          style={{
            left: `${lo * 100}%`,
            width: `${(hi - lo) * 100}%`,
            top: 0,
            bottom: 0,
            background: "var(--color-brand-blue-wash)",
            borderLeft: "1px solid var(--color-brand-blue-border-tint)",
            borderRight: "1px solid var(--color-brand-blue-border-tint)",
          }}
        />
      )}
      <div
        role="slider"
        aria-label="구간 확대 — 시간축을 끌어 고른다"
        aria-valuenow={0}
        className="absolute pointer-events-auto"
        style={{ left: 0, right: 0, bottom: -strip, height: strip, cursor: "col-resize", touchAction: "none" }}
        onPointerDown={(ev) => {
          const a = ratio(ev.clientX);
          setDrag({ a, b: a });
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => drag && setDrag({ a: drag.a, b: ratio(ev.clientX) })}
        onPointerUp={() => {
          if (drag && hi - lo >= minRatio) onSelect(lo, hi);
          setDrag(null);
        }}
        onPointerCancel={() => setDrag(null)}
      />
    </div>
  );
}
