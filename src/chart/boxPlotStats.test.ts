import { describe, expect, it } from "vitest";
import { boxPlotStats } from "./BoxPlotChart";

describe("boxPlotStats", () => {
  it("선형 보간 백분위 p5 · p25 · p50 · p75 · p95 · p99", () => {
    const s = boxPlotStats(Array.from({ length: 101 }, (_, i) => i))!;
    expect(s).toEqual({ p5: 5, p25: 25, p50: 50, p75: 75, p95: 95, p99: 99 });
  });
  it("순서와 무관 · 사이 값은 보간", () => {
    const s = boxPlotStats([30, 10, 20])!;
    expect(s.p50).toBe(20);
    expect(s.p25).toBe(15);
  });
  it("빈 값 · 숫자 아님은 null", () => {
    expect(boxPlotStats([])).toBeNull();
    expect(boxPlotStats([NaN])).toBeNull();
  });
});
