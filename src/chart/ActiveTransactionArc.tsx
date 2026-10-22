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
 * - 수치는 [[MetricStat]](Max TX = 단위 「초」 + 보조 줄 트랜잭션 이름 · Agent 활성 · 비활성), 범례는 [[ChartLegendItem]] 을 조합한다. 그래서 Composite 계층이다.
 * - 위젯 chrome(CardChrome, FlexBoardWidget 등)은 소비자가 감싼다.
 * - 이 컴포넌트는 본문만 렌더한다 — `h-full` 부모 안에서 채워진다.
 * - 회전 오버레이는 12s linear infinite.
 * - 가운데 Total TX 는 `total` 값을 그린다. 에셋(ark-equalizer-ring.svg)에는 고리만 있다 — 종전엔 「334」 가 그림에 박혀 어느 화면이든 같은 숫자였다.
 * - `frame={false}` 면 바깥 여백(좌우 · 아래 8px)과 왼쪽 아래 Elapsed 범례를 빼고, **아크 왼쪽 · 값 오른쪽 한 열**(Max TX 「N초」 + 이름 ·
 *   Agent 활성 · 비활성)로 다시 놓는다. 네 귀퉁이에 흩어 두지 않는다. [[WidgetFrame]] 안에 넣을 때 쓴다 — 여백은
 *   WidgetFrame 이 갖고, 범례는 `SPEED_LEGEND` 를 WidgetFrame `legend` 로 넘겨 본문 오른쪽 위에 세운다(patterns §15).
 *   같은 속도 구분을 쓰는 [[ScatterHeatmap]] 칸도 같은 상수를 쓴다 — 낱말이 칸마다 달라지지 않게.
 *
 * @example
 * ```tsx
 * <ActiveTransactionArc />
 * <ActiveTransactionArc maxTx={{ name: "api-gw-01", value: 42 }} agent={{ active: 12, inactive: 3 }} />
 * ```
 */
import MetricStat from "../MetricStat";
import ChartLegendItem from "./ChartLegendItem";

export type ActiveTransactionArcProps = {
  /** Max TX 이름. */
  maxTx?: { name: string; value: number };
  /** Agent 통계. */
  agent?: { active: number; inactive: number };
  /** 가운데 Total TX. 그림에 박힌 글자가 아니라 이 값을 그린다. 기본 334. */
  total?: number;
  /**
   * 자기 바깥 여백(좌우 · 아래 8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

/**
 * 응답 속도 구분 범례 — Normal(0~3초) · Slow(3~8초) · Very Slow(8초 이상).
 * [[WidgetFrame]] `legend` 로 넘긴다. [[ActiveTransactionArc]] · [[ScatterHeatmap]] 칸이 함께 쓴다.
 */
export const SPEED_LEGEND = [
  { label: "Normal", color: "var(--color-chart-speed-normal)" },
  { label: "Slow", color: "var(--color-chart-speed-slow)" },
  { label: "Very Slow", color: "var(--color-chart-speed-very-slow)" },
];

export default function ActiveTransactionArc({
  maxTx = { name: "TC-1-57-8094", value: 30 },
  agent = { active: 7, inactive: 1 },
  total = 334,
  frame = true,
}: ActiveTransactionArcProps) {
  /* 칸 안(frame=false) — 아크 왼쪽, 값 오른쪽 한 열(위에서 아래로 Max TX · Agent). 네 귀퉁이에 흩어 두지 않는다.
     Total 은 아크 가운데 하나만 — 같은 값을 두 번 쓰지 않는다. 범례는 WidgetFrame legend(SPEED_LEGEND). */
  if (!frame) {
    return (
      <div className="flex h-full items-center min-h-0 w-full" style={{ gap: 16 }}>
        <div className="relative h-full shrink-0" style={{ aspectRatio: "1 / 1", maxWidth: "60%" }}>
          <ArcEqualizer total={total} />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1" style={{ gap: 12 }}>
          <MetricStat label="Max TX" value={maxTx.value} unit="초" caption={maxTx.name} width="auto" />
          <div className="flex" style={{ gap: 16 }}>
            <MetricStat label="Agent 활성" value={agent.active} width="auto" />
            <MetricStat label="Agent 비활성" value={agent.inactive} width="auto" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full items-stretch min-h-0 w-full gap-6px px-8px pb-8px">
      {/* left: Max TX + Elapsed legend */}
      <div className="flex flex-col shrink-0 min-w-0 justify-between" style={{ width: 72 }}>
        <MetricStat label="Max TX" value={maxTx.value} unit="초" caption={maxTx.name} width="auto" />
        <div className="flex flex-col gap-3px">
          <p className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-numeric)" }}>Elapsed</p>
          {[...SPEED_LEGEND].reverse().map((l) => (
            <ChartLegendItem key={l.label} color={l.color} label={l.label} />
          ))}
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
          <ArcEqualizer total={total} />
        </div>
      </div>
      {/* right: Agent stats — 위 활성 · 아래 비활성, 바깥쪽 끝 정렬 */}
      <div className="flex flex-col shrink-0 justify-between" style={{ width: 56 }}>
        <MetricStat label="Active" value={agent.active} align="end" width="auto" />
        <MetricStat label="Inactive" value={agent.inactive} align="end" width="auto" />
      </div>
    </div>
  );
}

function ArcEqualizer({ total }: { total: number }) {
  return (
    /* 가운데 글자는 그림에 박지 않는다 — 에셋(ark-equalizer-ring.svg)은 고리만, Total 은 이 값을 그린다. 크기는 아크 폭을 따른다(cqw). */
    <div className="relative w-full h-full" style={{ containerType: "inline-size" }}>
      <img
        alt="Active Transaction Chart"
        className="absolute inset-0 w-full h-full"
        src="/icons/ark-equalizer-ring.svg"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ fontFamily: "var(--font-family-numeric)" }}>
        <span className="text-tertiary leading-none" style={{ fontSize: "5.5cqw" }}>Total TX</span>
        <span className="text-primary leading-none" style={{ fontSize: "15cqw", fontWeight: "var(--font-weight-medium)", marginTop: "1.5cqw" }}>{total}</span>
      </div>
      <style>{`@keyframes wds-ark-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
