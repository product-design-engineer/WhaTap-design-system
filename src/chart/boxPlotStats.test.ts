import { describe, expect, it } from "vitest";
import { boxPlotStats } from "./BoxPlotChart";

describe("boxPlotStats", () => {
  it("선형 보간 사분위 · 중앙값", () => {
    const s = boxPlotStats([1, 2, 3, 4, 5, 6, 7, 8, 9])!;
    expect([s.q1, s.median, s.q3]).toEqual([3, 5, 7]);
    expect([s.low, s.high]).toEqual([1, 9]);
    expect(s.outliers).toEqual([]);
  });
  it("Tukey 1.5 × IQR 밖은 이상치 · 수염은 안쪽 가장 먼 값", () => {
    const s = boxPlotStats([10, 11, 12, 12, 13, 14, 15, 80])!;
    expect(s.outliers).toEqual([80]);
    expect(s.high).toBe(15);
  });
  it("빈 값 · 숫자 아님은 null", () => {
    expect(boxPlotStats([])).toBeNull();
    expect(boxPlotStats([NaN])).toBeNull();
  });
});
