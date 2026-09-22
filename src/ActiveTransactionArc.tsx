/**
 * ActiveTransactionArc — APM 액티브 트랜잭션 Arc Equalizer 카드 본문.
 *
 * ## Purpose
 * APM 대시보드 · Flex 보드 등에서 쓰는 액티브 트랜잭션 도넛 시각화.
 * 동심 arc 세그먼트(normal/slow/very slow)와 회전 오버레이로 구성된다.
 * 3-column 레이아웃: 좌측 Max TX + Elapsed 범례 / 중앙 Arc / 우측 Agent 통계.
 *
 * ## When to use
 * - APM 대시보드 "액티브 트랜잭션" 위젯 본문.
 * - Flex 보드 위젯, 히어로 iframe 에셋 등 동일 시각화가 필요한 곳.
 *
 * ## When NOT to use
 * - 스피드 차트 (bullet flow) → [[ActiveTransactionSpeedWidget]].
 * - 범용 도넛 → [[MiniDonutChart]].
 *
 * ## Composition rules
 * - 위젯 chrome(CardChrome, FlexBoardWidget 등)은 소비자가 감싼다.
 * - 이 컴포넌트는 본문만 렌더한다 — `h-full` 부모 안에서 채워진다.
 * - 회전 오버레이는 12s linear infinite.
 *
 * @example
 * ```tsx
 * <ActiveTransactionArc />
 * <ActiveTransactionArc maxTx={{ name: "api-gw-01", value: 42 }} agent={{ active: 12, inactive: 3 }} />
 * ```
 */

export type ActiveTransactionArcProps = {
  /** Max TX 이름. */
  maxTx?: { name: string; value: number };
  /** Agent 통계. */
  agent?: { active: number; inactive: number };
};

export default function ActiveTransactionArc({
  maxTx = { name: "TC-1-57-8094", value: 30 },
  agent = { active: 7, inactive: 1 },
}: ActiveTransactionArcProps) {
  return (
    <div className="flex h-full items-stretch min-h-0 w-full px-[8px] pb-[8px] gap-[6px]">
      {/* left: Max TX + Elapsed legend */}
      <div className="flex flex-col shrink-0 min-w-0 justify-between" style={{ width: 72 }}>
        <div className="flex flex-col min-w-0">
          <p className="text-sm text-gray-mid leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Max TX</p>
          <p className="text-sm text-primary mt-[4px] leading-tight truncate" title={maxTx.name} style={{ fontFamily: "var(--font-family-numeric)" }}>{maxTx.name}</p>
          <p className="text-2xl text-primary mt-[4px] leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{maxTx.value}</p>
        </div>
        <div className="flex flex-col gap-[3px]">
          <p className="text-sm text-gray-mid leading-snug" style={{ fontFamily: "var(--font-family-numeric)" }}>Elapsed</p>
          <LegendDot color="#F34747" label="very slow" />
          <LegendDot color="#FFA012" label="slow" />
          <LegendDot color="#3DA9FF" label="normal" />
        </div>
      </div>
      {/* center: arc chart */}
      <div
        className="flex flex-1 items-center justify-center min-w-0 min-h-0 relative"
        style={{ containerType: "size" }}
      >
        <div
          className="relative"
          style={{
            width: "min(100cqw, 100cqh)",
            height: "min(100cqw, 100cqh)",
            aspectRatio: "1 / 1",
          }}
        >
          <ArcEqualizer />
        </div>
      </div>
      {/* right: Agent stats */}
      <div className="flex flex-col shrink-0 justify-between" style={{ width: 44 }}>
        <div className="flex flex-col">
          <p className="text-sm text-gray-mid leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Agent</p>
          <p className="text-sm text-primary mt-[4px] leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Active</p>
          <p className="text-2xl text-primary text-right mt-[2px] leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{agent.active}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-primary leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>Inactive</p>
          <p className="text-2xl text-primary text-right mt-[2px] leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>{agent.inactive}</p>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[4px] min-w-0">
      <div className="rounded-[2px] shrink-0" style={{ width: 10, height: 10, background: color }} />
      <span className="text-sm text-primary leading-none truncate" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}>{label}</span>
    </div>
  );
}

function ArcEqualizer() {
  return (
    <div className="relative w-full h-full">
      <img
        alt="Active Transaction Chart"
        className="absolute inset-0 w-full h-full"
        src="/icons/ark-equalizer.svg"
      />
      <div
        className="absolute inset-0"
        style={{ animation: "wds-ark-spin 12s linear infinite", transformOrigin: "50% 50%" }}
      >
        <img
          alt=""
          className="absolute left-0 top-0"
          src="/icons/ark-oval-left.svg"
          style={{ width: "50.67%", height: "100%" }}
        />
      </div>
      <style>{`@keyframes wds-ark-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
