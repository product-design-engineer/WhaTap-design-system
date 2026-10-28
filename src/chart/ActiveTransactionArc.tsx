/**
 * ActiveTransactionArc — APM 액티브 트랜잭션 Arc Equalizer 카드 본문.
 *
 * ## Purpose
 * APM 대시보드 · Flex 보드 등에서 쓰는 액티브 트랜잭션 도넛 시각화.
 * 고리는 [[ChartRadialBars]] — 칸 하나 = 에이전트 하나, 안쪽에서 바깥으로 Normal · Slow · Very Slow 줄무늬가 쌓인다. 왼쪽 반원 호가 도는 «실시간» 장식(`sweep`).
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
 * ## Metrics
 * - ✅ 에이전트별 액티브 트랜잭션 수를 응답 속도 등급(normal · slow · very slow)으로
 * - ❌ 등급이 없는 일반 지표 — 고리 줄무늬가 등급을 말한다
 * - ❌ 에이전트가 16개를 넘을 때 → [[BarList]]
 *
 * ## Color
 * - 역할: 속도 등급 고정 — Normal `--color-chart-speed-normal` · Slow `--color-chart-speed-slow` · Very Slow `--color-chart-speed-very-slow`(`SPEED_LEGEND`)
 * - 상한: 등급 3개
 * - 금지: 계열 슬롯 · 상태색(Severity)으로 등급을 바꿔 칠하지 않는다
 *
 * ## Composition rules
 * - 고리는 [[ChartRadialBars]], 수치는 [[MetricStat]](Max TX = 단위 「초」 + 보조 줄 트랜잭션 이름 · Agent 활성 · 비활성), 범례는 [[ChartLegendItem]] 을 조합한다. 그래서 Composite 계층이다.
 * - 위젯 chrome(CardChrome, FlexBoardWidget 등)은 소비자가 감싼다.
 * - 이 컴포넌트는 본문만 렌더한다 — `h-full` 부모 안에서 채워진다.
 * - 고리는 `agents` 로 그린다. 종전엔 정적 이미지(hex 색)라 어떤 값이 와도 고리가 같았고 다크에서 바뀌지 않았다(2026-10-22 교체).
 * - 가운데 Total TX 는 기본 `agents` 의 합. `total` 을 주면 그 값.
 * - 회전 장식은 12s linear · 동작 줄이기 설정에서 멈춘다.
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
import ChartRadialBars from "./ChartRadialBars";

export type ActiveTransactionArcProps = {
  /** Max TX 이름. */
  maxTx?: { name: string; value: number };
  /** Agent 통계. */
  agent?: { active: number; inactive: number };
  /** 에이전트별 지금 액티브 트랜잭션 수(속도 등급별) — 고리의 칸 하나 = 에이전트 하나. 기본은 데모 8개. */
  agents?: ActiveTransactionAgentLoad[];
  /** 가운데 Total TX. 기본은 `agents` 의 합. */
  total?: number;
  /**
   * 자기 바깥 여백(좌우 · 아래 8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

/** 에이전트 하나의 지금 액티브 트랜잭션 수 — 응답 속도 등급별. */
export type ActiveTransactionAgentLoad = {
  /** 에이전트 이름(칸 툴팁). */
  name?: string;
  normal: number;
  slow: number;
  verySlow: number;
};

/** 데모 — 활성 7 · 비활성 1(마지막 칸이 빈다). 합 334. */
const DEMO_AGENTS: ActiveTransactionAgentLoad[] = [
  { name: "agent-01", normal: 38, slow: 6, verySlow: 4 },
  { name: "agent-02", normal: 52, slow: 4, verySlow: 2 },
  { name: "agent-03", normal: 30, slow: 8, verySlow: 6 },
  { name: "agent-04", normal: 44, slow: 3, verySlow: 1 },
  { name: "agent-05", normal: 61, slow: 5, verySlow: 3 },
  { name: "agent-06", normal: 27, slow: 9, verySlow: 5 },
  { name: "agent-07", normal: 23, slow: 2, verySlow: 1 },
  { name: "agent-08", normal: 0, slow: 0, verySlow: 0 },
];

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
  agents = DEMO_AGENTS,
  total: totalProp,
  frame = true,
}: ActiveTransactionArcProps) {
  const total = totalProp ?? agents.reduce((a, g) => a + g.normal + g.slow + g.verySlow, 0);
  /* 칸 안(frame=false) — 아크 왼쪽, 값 오른쪽 한 열(위에서 아래로 Max TX · Agent). 네 귀퉁이에 흩어 두지 않는다.
     Total 은 아크 가운데 하나만 — 같은 값을 두 번 쓰지 않는다. 범례는 WidgetFrame legend(SPEED_LEGEND). */
  if (!frame) {
    return (
      <div className="flex h-full items-center min-h-0 w-full" style={{ gap: 16 }}>
        <div className="relative h-full shrink-0" style={{ aspectRatio: "1 / 1", maxWidth: "60%" }}>
          <ArcEqualizer agents={agents} total={total} />
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
          <ArcEqualizer agents={agents} total={total} />
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

function ArcEqualizer({ agents, total }: { agents: ActiveTransactionAgentLoad[]; total: number }) {
  /* 고리는 데이터로 그린다 — 칸 = 에이전트, 구간 = 속도 등급(SPEED_LEGEND 순서: 안쪽 Normal → 바깥 Very Slow).
     가운데 글자 크기는 고리 폭을 따른다(cqw). */
  return (
    <ChartRadialBars
      sweep
      ariaLabel={`액티브 트랜잭션 · 에이전트 ${agents.length}개 · 합계 ${total}`}
      sectors={agents.map((a) => ({
        label: a.name,
        segments: [
          { value: a.normal, color: SPEED_LEGEND[0].color, label: SPEED_LEGEND[0].label },
          { value: a.slow, color: SPEED_LEGEND[1].color, label: SPEED_LEGEND[1].label },
          { value: a.verySlow, color: SPEED_LEGEND[2].color, label: SPEED_LEGEND[2].label },
        ],
      }))}
    >
      <span className="text-tertiary leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontSize: "5.5cqw" }}>Total TX</span>
      <span className="text-primary leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontSize: "13cqw", fontWeight: "var(--font-weight-medium)", marginTop: "1.5cqw" }}>{total}</span>
    </ChartRadialBars>
  );
}
