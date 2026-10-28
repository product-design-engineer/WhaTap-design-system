/**
 * ActiveTransactionSpeedWidget — 액티브 트랜잭션 스피드 패널. Composite layer.
 *
 * ## Purpose
 * APM · LLM 등 Application 모니터링 대시보드의 실시간 트래픽 시각화.
 * tone(normal/warning/critical) 별 bullet 이 좌→우로 흐르며,
 * RPS/TPS · totals · speed bar 가 동기 변동한다.
 *
 * ## When to use
 * - Application 대시보드의 실시간 트래픽 요약
 *
 * ## When NOT to use
 * - 지금 실행 중인 트랜잭션의 **분포**(normal/slow/very slow 비율)를 보여 줄 때 → [[ActiveTransactionArc]].
 * - 시간에 따른 처리량 추이 → [[MiniLineChart]] · [[MiniMultiLineChart]] — 이 위젯은 흐름 연출이지 시계열이 아니다.
 * - 실데이터 없이 장식으로 흘리기 — 숫자가 움직이면 사용자는 실측으로 읽는다. 데모·캡처에서는 `paused` 로 멈춘다.
 *
 * ## Metrics
 * - ✅ 실시간 유입 · 처리 속도(RPS · TPS)와 응답 속도 등급별 개수
 * - ❌ 지난 구간 추이(어제 TPS) → [[MiniLineChart]] — 이 위젯은 지금 흐름만 말한다
 *
 * ## Composition rules
 * - 외부 아이콘 의존: `/icons/speed-bullet-{tone}.svg`, `/icons/speed-bar-{tone}.svg`
 *   (소비 앱의 public 폴더에 배치)
 * - 색은 DS 토큰 — hex 금지. 등급별 개수(정상 · 느림 · 매우 느림)는 판정 등급 토큰 `--color-chart-speed-*`(§17) —
 *   같은 등급을 쓰는 [[ActiveTransactionArc]] · [[ScatterHeatmap]] 의 `SPEED_LEGEND` 와 같은 색.
 * - 좌우 RPS · TPS 는 [[MetricStat]] 이 그린다 — 같은 모양이라 좌우 대칭으로 읽힌다. 그래서 Composite 계층이다.
 * - `compact` 모드로 좁은 카드(Flex 보드 등) 대응
 *
 * @example
 * ```tsx
 * <ActiveTransactionSpeedWidget onOpenDetail={() => openDrawer("active-tx")} />
 * <ActiveTransactionSpeedWidget compact baseRps={40} baseTps={42} />
 * ```
 */
import { useEffect, useMemo, useRef, useState } from "react";
import MetricStat from "./MetricStat";

export type SpeedTone = "normal" | "warning" | "critical";

export type SpeedTotals = {
  normal: number;
  warning: number;
  critical: number;
  sum: number;
};

type Bullet = {
  id: number;
  left: number;
  top: number;
  tone: SpeedTone;
  opacity: number;
};

const TONE_TO_ICON: Record<SpeedTone, string> = {
  normal: "/icons/speed-bullet-normal.svg",
  warning: "/icons/speed-bullet-warning.svg",
  critical: "/icons/speed-bullet-critical.svg",
};

const TONE_CONFIG: Record<
  SpeedTone,
  { spawnLeft: number; speed: number; fadeInStart: number }
> = {
  normal: { spawnLeft: -5, speed: 28, fadeInStart: -5 },
  warning: { spawnLeft: 40, speed: 18, fadeInStart: 40 },
  critical: { spawnLeft: 65, speed: 11, fadeInStart: 65 },
};
const EXIT_LEFT = 105;

const DT_CLAMP_SECONDS = 0.1;
const INDICATOR_TICK_MS = 600;
const INDICATOR_CYCLE_SECONDS = 6;

const BAR_RATIOS = { normal: 0.6316, warning: 0.2895, critical: 0.0789 };

function computeBarSegments(totalBars: number) {
  const nCritical = Math.max(2, Math.round(totalBars * BAR_RATIOS.critical));
  const nWarning = Math.max(3, Math.round(totalBars * BAR_RATIOS.warning));
  const nNormal = Math.max(10, totalBars - nWarning - nCritical);
  const total = nNormal + nWarning + nCritical;
  return Array.from({ length: total }, (_, i) => {
    const p = total > 1 ? i / (total - 1) : 0.5;
    const brightness = 0.91 + 0.21 * Math.sin(p * Math.PI);
    const tone: SpeedTone =
      i < nNormal
        ? "normal"
        : i < nNormal + nWarning
          ? "warning"
          : "critical";
    const opacity = i === total - 1 ? 0.5 : i === total - 2 ? 0.75 : 1;
    return { tone, brightness, opacity };
  });
}

export type ActiveTransactionSpeedWidgetProps = {
  title?: string;
  baseRps?: number;
  baseTps?: number;
  baseTotals?: SpeedTotals;
  paused?: boolean;
  spawnRate?: number;
  onOpenDetail?: () => void;
  compact?: boolean;
};

export default function ActiveTransactionSpeedWidget({
  title = "액티브 트랜잭션 스피드",
  baseRps = 113,
  baseTps = 116,
  baseTotals = { normal: 298, warning: 51, critical: 29, sum: 378 },
  paused = false,
  spawnRate = 12,
  onOpenDetail,
  compact = false,
}: ActiveTransactionSpeedWidgetProps) {
  const sumCls = compact ? "text-2xl" : "text-3xl";
  const totCls = compact ? "text-sm" : "text-base";
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const nextIdRef = useRef(0);
  const spawnAccRef = useRef(0);
  const lastTRef = useRef(0);

  const [indicatorTick, setIndicatorTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndicatorTick((t) => t + 1),
      INDICATOR_TICK_MS,
    );
    return () => clearInterval(id);
  }, [paused]);

  const wave = Math.sin(
    ((indicatorTick * INDICATOR_TICK_MS) / 1000 / INDICATOR_CYCLE_SECONDS) *
      Math.PI *
      2,
  );
  const rps = Math.max(0, baseRps + Math.round(wave * 80));
  const tps = Math.max(0, baseTps + Math.round(wave * 80));
  const dynamicTotals = useMemo<SpeedTotals>(() => {
    const normal = Math.max(100, baseTotals.normal + Math.round(wave * 254));
    const warning = Math.max(15, baseTotals.warning + Math.round(wave * 42));
    const critical = Math.max(
      5,
      baseTotals.critical + Math.round(wave * 26),
    );
    return { normal, warning, critical, sum: normal + warning + critical };
  }, [wave, baseTotals.normal, baseTotals.warning, baseTotals.critical]);

  const totalBars = 28 + Math.round((wave + 1) * 9);
  const barSegments = useMemo(() => computeBarSegments(totalBars), [totalBars]);

  const totalsRef = useRef(dynamicTotals);
  totalsRef.current = dynamicTotals;

  useEffect(() => {
    if (paused) return;
    let rafId = 0;
    lastTRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(
        (now - lastTRef.current) / 1000,
        DT_CLAMP_SECONDS,
      );
      lastTRef.current = now;

      setBullets((prev) =>
        prev
          .map((b) => {
            const cfg = TONE_CONFIG[b.tone];
            const left = b.left + cfg.speed * dt;
            let opacity = 1;
            const fadeInEnd = cfg.fadeInStart + 10;
            if (left < fadeInEnd) {
              opacity = Math.max(0, (left - cfg.fadeInStart) / 10);
            } else if (left > 90) {
              opacity = Math.max(0, 1 - (left - 90) / 10);
            }
            return { ...b, left, opacity };
          })
          .filter((b) => b.left < EXIT_LEFT),
      );

      spawnAccRef.current += dt;
      const spawnInterval = 1 / spawnRate;
      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current = 0;
        const t = totalsRef.current;
        const total = t.normal + t.warning + t.critical || 1;
        const r = Math.random() * total;
        const tone: SpeedTone =
          r < t.normal
            ? "normal"
            : r < t.normal + t.warning
              ? "warning"
              : "critical";
        const cfg = TONE_CONFIG[tone];
        nextIdRef.current += 1;
        setBullets((prev) => [
          ...prev,
          {
            id: nextIdRef.current,
            left: cfg.spawnLeft + Math.random() * 5,
            top:
              (compact ? 34 : 16) + Math.random() * (compact ? 18 : 22),
            tone,
            opacity: 0,
          },
        ]);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused, spawnRate, compact]);

  return (
    <div className="bg-card border border-color-var-color-border-default rounded-4px flex flex-col h-full w-full overflow-hidden p-12px gap-4px">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 w-full">
        <div className="flex gap-4px items-center">
          <span
            className="text-base font-bold text-primary tracking-default whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {title}
          </span>
          <InfoIcon />
        </div>
        <div className="flex items-center gap-4px shrink-0">
          {onOpenDetail && (
            <button
              type="button"
              className="shrink-0 size-20px flex items-center justify-center cursor-pointer"
              onClick={onOpenDetail}
              aria-label="상세 보기"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5 10H15M15 10L11 6M15 10L11 14"
                  stroke="var(--color-text-primary)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <MenuDots />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 w-full items-stretch">
        {/* RPS */}
        <MetricStat label="RPS" value={rps} compact={compact} />

        {/* Plot area */}
        <div className="flex-1 min-w-0 relative">
          {/* Top counts */}
          <div
            className="absolute left-1-2 -translate-x-1-2 flex gap-6px items-center bg-card px-6px py-1px rounded-4px"
            style={{ top: -2, zIndex: 10, opacity: 0.9 }}
          >
            <span
              className={`${totCls} font-medium`}
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: "var(--color-chart-speed-normal)",
              }}
            >
              {dynamicTotals.normal}
            </span>
            <span
              className={`${totCls} font-medium`}
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: "var(--color-chart-speed-slow)",
              }}
            >
              {dynamicTotals.warning}
            </span>
            <span
              className={`${totCls} font-medium`}
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: "var(--color-chart-speed-very-slow)",
              }}
            >
              {dynamicTotals.critical}
            </span>
          </div>
          {/* Center sum */}
          <div
            className="absolute left-1-2 -translate-x-1-2 flex items-center justify-center"
            style={{ top: 18, zIndex: 10 }}
          >
            <span
              className={`${sumCls} text-primary leading-none`}
              style={{
                fontFamily: "var(--font-family-numeric)",
                fontWeight: "var(--font-weight-medium)",
                opacity: 0.7,
              }}
            >
              {dynamicTotals.sum}
            </span>
          </div>

          {/* Bullets */}
          {bullets.map((b) => (
            <div
              key={b.id}
              className="absolute"
              style={{
                width: 29,
                height: 11,
                left: `${b.left}%`,
                top: b.top,
                opacity: b.opacity,
                willChange: "left, opacity",
                zIndex: 1,
              }}
            >
              <img
                alt=""
                className="w-full h-full"
                src={TONE_TO_ICON[b.tone]}
              />
            </div>
          ))}

          {/* Speed bars */}
          <div
            className="absolute flex items-start justify-center"
            style={{
              left: "15%",
              top: 0,
              width: "70%",
              height: "100%",
              zIndex: 5,
            }}
          >
            <div
              className="relative flex items-start"
              style={{ height: "100%" }}
            >
              <div
                className="absolute inset-0 bg-card"
                style={{ zIndex: -1 }}
              />
              {barSegments.map((s, i) => (
                <img
                  key={i}
                  alt=""
                  className="shrink-0"
                  src={`/icons/speed-bar-${s.tone}.svg`}
                  style={{
                    width: 12,
                    height: "100%",
                    marginRight: -6,
                    filter: `brightness(${s.brightness})`,
                    opacity: s.opacity,
                    transition: "opacity 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TPS */}
        <MetricStat label="TPS" value={tps} align="end" compact={compact} />
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="text-tertiary cursor-pointer"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <line
        x1="7"
        y1="6"
        x2="7"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="7" cy="4.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function MenuDots() {
  return (
    <button
      type="button"
      aria-label="더보기"
      className="flex items-center justify-center size-16px rounded-2px cursor-pointer hover-bg-surface-100 shrink-0"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="3" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="7" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="11" r="1" fill="var(--color-text-tertiary)" />
      </svg>
    </button>
  );
}
