/**
 * StatCard — 요약 지표 카드 (큰 숫자 + 라벨 + 선택적 트렌드).
 *
 * ## Purpose
 * GPU 리소스 보드, 서버 운영 현황 등 대시보드 상단에 핵심 KPI를
 * 나열할 때 사용하는 작은 요약 카드. 큰 숫자 하나와 라벨, 선택적 트렌드
 * 아이콘(상승/하강/안정)으로 구성.
 *
 * ## When to use
 * - 대시보드 상단 요약 바에 3~6개 KPI를 수평 나열할 때
 * - 자원 총량(Total GPU, Active, Idle 등) 같은 단일 수치 표시
 *
 * ## When NOT to use
 * - 시계열 추이가 필요 → [[MiniLineChart]]
 * - 범주 비율 분포 → [[MiniDonutChart]]
 * - 진행률/사용률 게이지 → [[UsageGauge]]
 *
 * ## Composition rules
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 색은 semantic 토큰만 사용 (status/text) — 차트 계열(`--color-chart-series-*`)은 차트가 아니므로 쓰지 않는다
 * - `tone`으로 좌측 인디케이터 색상 결정
 * - `trend`는 선택적 — 미지정 시 인디케이터 없음
 *
 * @example
 * ```tsx
 * <StatCard label="Total GPU" value="16" unit="ea" tone="neutral" />
 * <StatCard label="Active" value="8" tone="success" trend="up" />
 * ```
 */

export type StatCardTone = "neutral" | "success" | "warning" | "critical" | "info";
export type StatCardTrend = "up" | "down" | "stable";

export type StatCardProps = {
  /** 지표 이름 — 값 위 `text-sm` tertiary 한 줄, 넘치면 말줄임. */
  label: string;
  /** 표시할 값(포맷 끝난 문자열, 예: "1,234") — `text-xl` bold numeric. */
  value: string;
  /** 값 뒤 단위(예: "ms", "%"). 미지정이면 생략. */
  unit?: string;
  /** 좌측 6px 상태 dot 색 — neutral(**기본**) / success / warning / critical / info. 값 글자색은 바뀌지 않는다. */
  tone?: StatCardTone;
  /** 값 뒤 추세 화살표 — up(▲ success 색) / down(▼ error 색) / stable(─). 미지정이면 생략. */
  trend?: StatCardTrend;
  /** stagger 진입 애니메이션 delay(ms) */
  delay?: number;
};

const TONE_COLORS: Record<StatCardTone, string> = {
  neutral: "var(--color-text-tertiary)",
  success: "var(--color-status-success)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
  info: "var(--color-status-info)",
};

const TREND_ARROWS: Record<StatCardTrend, string> = {
  up: "▲",
  down: "▼",
  stable: "─",
};

const TREND_COLORS: Record<StatCardTrend, string> = {
  up: "var(--color-status-success)",
  down: "var(--color-status-error)",
  stable: "var(--color-text-tertiary)",
};

export default function StatCard({
  label,
  value,
  unit,
  tone = "neutral",
  trend,
  delay,
}: StatCardProps) {
  const style = delay !== undefined
    ? { animationDelay: `${delay}ms` } as React.CSSProperties
    : undefined;

  return (
    <div
      className="flex items-center gap-8px bg-card border border-color-var-color-border-default rounded-4px px-12px py-8px flex-1 min-w-0"
      style={style}
    >
      {/* 좌측 톤 인디케이터 */}
      <div
        className="shrink-0 rounded-full"
        style={{ width: 6, height: 6, background: TONE_COLORS[tone] }}
      />

      {/* 라벨 + 값 */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-tertiary truncate leading-tight">{label}</span>
        <div className="flex items-baseline gap-4px">
          <span
            className="text-xl font-bold text-primary leading-none"
            style={{ fontFamily: "var(--font-family-numeric)" }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm text-tertiary leading-none">{unit}</span>
          )}
          {trend && (
            <span
              className="text-xs leading-none ml-2px"
              style={{ color: TREND_COLORS[trend] }}
            >
              {TREND_ARROWS[trend]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
