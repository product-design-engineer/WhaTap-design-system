/**
 * KpiCard — 대형 KPI 숫자 카드 (GPU 대시보드 요약 지표).
 *
 * ## Purpose
 * GPU 대시보드의 Total VRAM Memory, Avg GPU Utilization 같은
 * 핵심 지표를 큰 숫자로 강조 표시. StatCard보다 시각적으로 크고
 * 숫자 중심 레이아웃.
 *
 * ## When to use
 * - 대시보드에서 핵심 KPI 4~6개를 큰 숫자로 나열할 때
 * - VRAM, 사용률, 메모리 등 단일 수치를 강조할 때
 *
 * ## When NOT to use
 * - 컴팩트한 요약 바 (톤 인디케이터 + 트렌드) → [[StatCard]]
 * - 시계열 추이 → [[MiniLineChart]]
 *
 * ## Composition rules
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 안쪽 여백 · 제목 줄을 뺀다). [[WidgetFrame]] 안에 넣을 때 쓴다.
 *   제목은 WidgetFrame `title`, 범위는 `meta`, 범례는 `legend`, 메뉴는 `onFullscreen` · `menu` 가 맡는다(patterns §15).
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 숫자는 numeric 폰트, 단위는 tertiary 색상
 * - 타이틀은 카드 상단, 숫자는 중앙 정렬
 *
 * @example
 * ```tsx
 * <KpiCard title="Total VRAM Memory" value="293.13" unit="GiB" />
 * <KpiCard title="Avg GPU Utilization" value="32.72" unit="%" />
 * ```
 */

export type KpiCardProps = {
  title: string;
  value: string;
  unit?: string;
  /** stagger 진입 애니메이션 delay(ms) */
  delay?: number;
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

export default function KpiCard({ title, value, unit, delay, frame = true }: KpiCardProps) {
  const style = delay !== undefined
    ? { animationDelay: `${delay}ms` } as React.CSSProperties
    : undefined;

  return (
    <div
      className={frame ? "flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-12px py-8px h-full" : "flex flex-col h-full min-w-0"}
      style={style}
    >
      {frame && <span className="text-md font-medium text-secondary truncate shrink-0">{title}</span>}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <span
          className="text-primary leading-none"
          style={{ fontFamily: "var(--font-family-numeric)" }}
        >
          <span className="font-bold" style={{ fontSize: 32 }}>{value}</span>
          {unit && (
            <span className="text-tertiary font-medium" style={{ fontSize: 16, marginLeft: 4 }}>{unit}</span>
          )}
        </span>
      </div>
    </div>
  );
}
