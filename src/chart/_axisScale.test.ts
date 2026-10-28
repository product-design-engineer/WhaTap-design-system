import { describe, expect, it } from "vitest";
import { formatAxisValue } from "./_axisScale";

describe("formatAxisValue", () => {
  it("1000 이상은 K", () => {
    expect(formatAxisValue(1200)).toBe("1.2K");
  });
  it("10 이상은 정수", () => {
    expect(formatAxisValue(250)).toBe("250");
    expect(formatAxisValue(12.5)).toBe("13");
  });
  it("10 미만 소수는 반올림하지 않는다", () => {
    expect(formatAxisValue(2.5)).toBe("2.5");
    expect(formatAxisValue(0.2)).toBe("0.2");
    expect(formatAxisValue(0.25)).toBe("0.25");
    expect(formatAxisValue(1.25)).toBe("1.3");
  });
  it("정수 · 0 은 그대로", () => {
    expect(formatAxisValue(0)).toBe("0");
    expect(formatAxisValue(5)).toBe("5");
  });
});
