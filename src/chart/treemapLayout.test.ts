import { describe, expect, it } from "vitest";
import { squarify } from "./_treemapLayout";

const area = (r: { w: number; h: number }) => r.w * r.h;

describe("squarify", () => {
  it("면적이 값에 비례하고 상자를 채운다", () => {
    const rs = squarify([6, 6, 4, 3, 2, 2, 1], { x: 0, y: 0, w: 600, h: 400 });
    const total = rs.reduce((n, r) => n + area(r), 0);
    expect(total).toBeCloseTo(240000, 3);
    expect(area(rs[0]) / area(rs[6])).toBeCloseTo(6, 3);
  });
  it("칸이 상자 밖으로 나가지 않는다", () => {
    for (const r of squarify([5, 1, 1, 1, 9], { x: 10, y: 20, w: 300, h: 100 })) {
      expect(r.x).toBeGreaterThanOrEqual(10 - 1e-6);
      expect(r.y).toBeGreaterThanOrEqual(20 - 1e-6);
      expect(r.x + r.w).toBeLessThanOrEqual(310 + 1e-6);
      expect(r.y + r.h).toBeLessThanOrEqual(120 + 1e-6);
    }
  });
  it("0 · 음수는 넓이 0, 순서는 입력대로", () => {
    const rs = squarify([3, 0, -2, 1], { x: 0, y: 0, w: 100, h: 100 });
    expect(area(rs[1])).toBe(0);
    expect(area(rs[2])).toBe(0);
    expect(area(rs[0]) / area(rs[3])).toBeCloseTo(3, 3);
  });
});
