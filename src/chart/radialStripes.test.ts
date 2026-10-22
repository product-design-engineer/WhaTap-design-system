import { describe, expect, it } from "vitest";
import { radialStripes } from "./ChartRadialBars";

const seg = (...v: number[]) => v.map((value) => ({ value, color: "var(--color-chart-speed-normal)" }));

describe("radialStripes", () => {
  it("값 ÷ max × levels 를 반올림한다", () => {
    expect(radialStripes(seg(50, 30, 20), 100, 10)).toEqual([5, 3, 2]);
  });
  it("0 보다 큰 구간은 최소 한 줄 — 작은 값이 사라지지 않는다", () => {
    expect(radialStripes(seg(98, 1, 1), 100, 10)).toEqual([8, 1, 1]);
  });
  it("0 은 그리지 않는다 · 빈 칸은 줄 0", () => {
    expect(radialStripes(seg(0, 0, 0), 100, 10)).toEqual([0, 0, 0]);
  });
  it("합은 levels 를 넘지 않는다 — 가장 많은 구간부터 덜어 낸다", () => {
    const r = radialStripes(seg(10, 6, 4), 20, 10);
    expect(r.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(10);
    expect(r).toEqual([5, 3, 2]);
    const r2 = radialStripes(seg(34, 33, 33), 100, 10);
    expect(r2.reduce((a, b) => a + b, 0)).toBe(10);
  });
});
