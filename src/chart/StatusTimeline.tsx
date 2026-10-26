/**
 * StatusTimeline — 시간 위에 사건(이벤트)을 세로 마커로 세우는 상태 타임라인. 높이 = 건수, 색 = 심각도. Composite layer.
 *
 * ## Purpose
 * «언제 · 얼마나 · 얼마나 심하게» 를 한 줄에서 읽게 한다 — 통합 대시보드 이벤트 타임라인, 배포 · 경보 · 장애 기록.
 * 라이브 위젯은 빨강 하나 · 높이 범례 없음 · 이 위젯에만 있는 반전 시간 바였다(patterns §21). 여기서는 높이가 무엇인지
 * 값축이 말하고, 색은 심각도 셋으로 갈리며, 시간 글자는 다른 차트와 같은 [[ChartTimeAxis]] 다.
 *
 * ## When to use
 * - 시간 구간 안의 사건 기록 — 경보 · 이벤트 · 배포. 사건마다(또는 시간 칸마다) 건수와 가장 높은 심각도가 있다.
 * - 같은 시간축의 선 · 막대 차트 아래에 붙여 «그때 무슨 일이 있었나» 를 맞춰 볼 때.
 *
 * ## When NOT to use
 * - 연속 값의 흐름 → [[MiniLineChart]] · [[MiniBarChart]]. 사건이 아니라 측정값이다.
 * - 대상마다 상태가 이어지는 구간(서버 A 가 10:00~10:20 동안 Down) → 상태 구간 막대(아직 없음). 이것은 점 사건이다.
 * - 이벤트 목록 · 상세 → [[EventList]]. 타임라인은 분포를 보이고, 내용은 목록이 말한다.
 *
 * ## Metrics
 * - ✅ 점 사건의 건수와 심각도 — 경보 발생 · 이벤트 · 배포 · 재시작 · 장애 기록
 * - ❌ 연속 측정값(사용률 · 응답시간) → [[MiniLineChart]]
 * - ❌ 이어지는 상태 구간(10분 동안 Down) — 점 사건이 아니다
 *
 * ## Color
 * - 역할: 심각도 — critical `--color-status-error` · warning `--color-status-warning` · info `--color-status-info`
 * - 상한: 3
 * - 금지: 계열 색을 섞지 않는다(§23) · 색만으로 말하지 않는다(범례 이름 · 툴팁이 함께)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]](가로 눈금 + 시간 글자마다 세로 점선 `vertical`) · 값축 [[ChartValueAxis]](건수, 단위 `건`) ·
 *   시간축 [[ChartTimeAxis]]. 차트는 마커만 그린다(patterns §26). 그래서 Composite 계층이다.
 * - **높이 = 건수(2026-10-23 결정).** 값축이 높이를 읽게 한다 — 따로 «높이 = 건수» 범례를 두지 않는다. 0 건 마커는 그리지 않는다(빈 구간).
 * - **색 = 심각도** `critical`(`--color-status-error`) · `warning`(`--color-status-warning`) · `info`(`--color-status-info`). 계열 색을 섞지 않는다(§23).
 *   심각도는 색만으로 말하지 않는다 — 범례 이름(Critical · Warning · Info)과 [[ChartTooltip]] 의 심각도 이름이 함께 말한다.
 * - **반전 시간 바는 쓰지 않는다(2026-10-23 결정).** 이 위젯에만 있던 모양이라 공통 시간축으로 맞춘다(§26).
 * - 사건 위치는 `at`(시간 값, `start` ~ `end` 와 같은 단위). 같은 칸에 여럿이면 미리 묶어 건수를 더하고 가장 높은 심각도를 준다.
 * - 범례는 `statusTimelineLegend()` 를 [[WidgetFrame]] `legend` 로(`frame={false}`). 단독(`frame`)이면 플롯 위 오른쪽에 스스로 세운다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 마커 | 폭 3px · 반경 1px · 바닥에서 위로 · 최소 높이 2px · 가운데 = `at` 위치 |
 * | 색 | critical `--color-status-error` · warning `--color-status-warning` · info `--color-status-info` |
 * | 값축 | 최대 = 건수 최대를 1 · 2 · 4 · 5 · 10 × 10ⁿ 로 올림(`max` 로 고정) · 단위 `건` |
 * | 격자 | 가로 눈금 3 + 세로 점선 = 시간 글자 사이마다(`xLabels.length − 1`) |
 * | 플롯 여백 | 위 4 · 아래 14 · 오른쪽 8px · 왼쪽 `--wds-widget-axis-gutter`(28px) |
 * | 단독 범례 | Critical · Warning · Info 사각 견본, 플롯 위 오른쪽 · 간격 12px |
 * | hover | 마커 둘레 12px 세로 칸(플롯 높이 전체) · 가리킨 마커 5px, 나머지 0.32 · [[ChartTooltip]](이름 · 시각 `formatAt` · 심각도 · 건수) |
 * | 접근성 | 플롯 `role="img"` + 사건 수 요약 |
 *
 * @example
 * ```tsx
 * <WidgetFrame title="이벤트 타임라인" legend={statusTimelineLegend()}>
 *   <StatusTimeline start={t0} end={t1} xLabels={labels} events={events} frame={false} />
 * </WidgetFrame>
 * ```
 */
import { useState } from "react";
import ChartGrid from "./ChartGrid";
import ChartLegendItem from "./ChartLegendItem";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, niceMax } from "./_axisScale";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type StatusTimelineSeverity = "critical" | "warning" | "info";

export type StatusTimelineEvent = {
  /** 사건 시각 — `start` ~ `end` 와 같은 단위(epoch ms 등). */
  at: number;
  /** 건수 — 마커 높이. 0 이면 그리지 않는다. */
  count: number;
  /** 가장 높은 심각도 — 마커 색. */
  severity: StatusTimelineSeverity;
  /** 사건 이름(툴팁). */
  label?: string;
};

export type StatusTimelineProps = {
  /** 사건 목록 — `{ at, count, severity, label? }`. 같은 칸 사건은 미리 묶는다. */
  events: ReadonlyArray<StatusTimelineEvent>;
  /** 구간 시작 — X 왼쪽 끝. */
  start: number;
  /** 구간 끝 — X 오른쪽 끝. */
  end: number;
  /** X 시간 글자(같은 간격). 세로 점선이 글자 사이마다 선다. */
  xLabels: string[];
  /** 건수 축 최대. 없으면 건수 최대를 보기 좋은 값으로 올린다. */
  max?: number;
  /**
   * 자기 바깥 여백(좌우 8px)과 심각도 범례 줄을 둘지. 기본 `true`.
   * `false` 면 플롯만 — [[WidgetFrame]] 안에 넣고 범례는 `statusTimelineLegend()` 를 `legend` 로(patterns §15).
   */
  frame?: boolean;
  /** 툴팁 제목의 시각 표기(`at` → 「14:34」). 없으면 시각을 쓰지 않는다. */
  formatAt?: (at: number) => string;
};

const PAD_TOP = 4;
const PAD_BOTTOM = 14;
const PAD_RIGHT = 8;
const MARK_W = 3;

const SEVERITY_COLOR: Record<StatusTimelineSeverity, string> = {
  critical: "var(--color-status-error)",
  warning: "var(--color-status-warning)",
  info: "var(--color-status-info)",
};
const SEVERITY_LABEL: Record<StatusTimelineSeverity, string> = { critical: "Critical", warning: "Warning", info: "Info" };
const SEVERITY_ORDER: StatusTimelineSeverity[] = ["critical", "warning", "info"];

/** [[WidgetFrame]] `legend` 용 — 심각도 셋(사각 견본, 막대 마크). */
export function statusTimelineLegend() {
  return SEVERITY_ORDER.map((s) => ({ label: SEVERITY_LABEL[s], color: SEVERITY_COLOR[s] }));
}

export default function StatusTimeline({ events, start, end, xLabels, max, frame = true, formatAt }: StatusTimelineProps) {
  const span = end - start;
  const shown = events.filter((e) => e.count > 0 && e.at >= start && e.at <= end);
  const top = max ?? niceMax(Math.max(0, ...shown.map((e) => e.count)));
  const plot = { left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };
  const total = shown.reduce((n, e) => n + e.count, 0);
  /* 가리킨 마커 — [[ChartTooltip]] 으로 이름 · 심각도 · 건수를 보인다 */
  const [hover, setHover] = useState<number | null>(null);
  const xr = (at: number) => (span > 0 ? (at - start) / span : 0);
  const hr = (count: number) => (top > 0 ? Math.min(1, count / top) : 0);

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4px" style={{ padding: frame ? "0 8px" : 0 }}>
      {frame && (
        <div className="flex justify-end gap-12px">
          {statusTimelineLegend().map((l) => (
            <ChartLegendItem key={l.label} color={l.color} label={l.label} />
          ))}
        </div>
      )}
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={`상태 타임라인 — 사건 ${shown.length}개 · ${total}건`}>
        <ChartGrid
          max={top}
          padTop={PAD_TOP}
          padBottom={PAD_BOTTOM}
          right={PAD_RIGHT}
          vertical={xLabels.length > 1 ? xLabels.length - 1 : undefined}
        />
        {/* 마커 — 이 차트의 마크. 좌표는 플롯 상자 안 %, 바닥에서 위로 */}
        <div className="absolute" style={plot}>
          {shown.map((e, i) => (
            /* 맞히기 쉽게 — 마커(3px) 둘레 12px 세로 칸(플롯 높이 전체)이 hover 를 받는다.
               칸 높이를 마커 높이에 맞추면 안쪽 마커 % 가 그 칸 기준이 되어 높이가 비율의 제곱으로 줄어든다 */
            <span
              key={i}
              className="absolute flex justify-center"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ left: `${xr(e.at) * 100}%`, bottom: 0, width: 12, height: "100%", transform: "translateX(-50%)" }}
            >
              <span
                className={`${MARK_CLASS} absolute rounded-1px`}
                style={{
                  bottom: 0,
                  opacity: hover != null && hover !== i ? DIM_OPACITY : 1,
                  width: hover === i ? MARK_W + 2 : MARK_W,
                  height: `max(2px, ${hr(e.count) * 100}%)`,
                  background: SEVERITY_COLOR[e.severity],
                }}
              />
            </span>
          ))}
          {hover != null && shown[hover] && (
            <ChartTooltip
              left={`${xr(shown[hover].at) * 100}%`}
              top={`${(1 - hr(shown[hover].count)) * 100}%`}
              flipX={xr(shown[hover].at) > 0.5}
              title={[shown[hover].label, formatAt?.(shown[hover].at)].filter(Boolean).join(" · ") || SEVERITY_LABEL[shown[hover].severity]}
              rows={[
                { label: "심각도", value: SEVERITY_LABEL[shown[hover].severity], color: SEVERITY_COLOR[shown[hover].severity] },
                { label: "건수", value: `${shown[hover].count.toLocaleString("en-US")}건` },
              ]}
            />
          )}
        </div>
        <ChartValueAxis max={top} unit="건" padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />
      </div>
    </div>
  );
}
