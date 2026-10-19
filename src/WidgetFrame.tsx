import type { CSSProperties, ReactNode } from "react";
import ActionMenu, { type ActionMenuAction } from "./ActionMenu";
import CardHead from "./CardHead";
import EmptyState from "./EmptyState";
import ToolbarIconButton from "./ToolbarIconButton";
import TriggerButton from "./widget/TriggerButton";

/**
 * WidgetFrame — 대시보드 위젯 한 칸의 껍데기 (헤더 · 본문 · 푸터 + 빈 상태). Shell layer: 본문에 무엇이든 담고 [[CardHead]] · [[ActionMenu]] 를 조립한다.
 *
 * ## Purpose
 * 대시보드 격자의 한 칸을 **같은 모양으로** 세운다. 표면 · 테두리 · 반경 · 안쪽 여백 · 제목 줄 ·
 * 헤더 오른쪽 아이콘 메뉴 · 범례 자리를 이 컴포넌트 하나가 정하고, 차트 · 표 · 수치는 본문만 그린다.
 * 껍데기를 차트마다 따로 정하면 한 줄에 놓인 위젯들의 여백 · 제목 굵기 · 메뉴 아이콘이 칸마다 달라지고,
 * 사람은 그 차이를 «다른 종류의 위젯» 으로 읽는다.
 *
 * 빈 상태도 이 껍데기가 맡는다. 데이터가 없는 것과 수집이 끊긴 것은 다른 사실이라 문장이 다르고,
 * 둘 다 **선을 0 으로 그리지 않는다**. 0 으로 그린 선은 «조용하다» 로 읽혀 끊긴 수집을 정상으로 감춘다.
 *
 * ## When to use
 * - 대시보드 · Flex 보드 격자의 위젯 한 칸 (액티브 트랜잭션 · 히트맵 · 이벤트 목록 · 프로젝트 표).
 * - 칸 안 차트는 모두 `frame={false}` 로 담는다: [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]] · [[ApdexChart]] · [[ForecastLineChart]]
 *   · [[BarList]] · [[MiniDonutChart]] · [[KpiCard]] · [[HexGrid]] · [[ActiveTransactionArc]] · [[ScatterHeatmap]]. 표([[DataTable]])는 `bleed`.
 * - 요약 숫자 여럿(애플리케이션 요약 같은)은 새 차트가 아니라 [[KpiField]] 를 세로로 쌓고 값만 크게(children) 둔다.
 *
 * ## When NOT to use
 * - AI 위젯 **안**의 카드 → [[AiCard]]. 제품 화면에 AiCard 를 쓰면 그 칸이 AI 응답처럼 읽히고,
 *   반대로 AI 답변에 WidgetFrame 을 쓰면 답이 대시보드 조각처럼 읽힌다.
 * - 폼 · 설정의 구획 묶음 → `bg-card` 카드 + 구획 사이 선 (patterns §14).
 * - 상태를 알리는 상자 → [[Notice]].
 * - 껍데기를 가진 차트를 `frame` 을 켠 채 넣기 → 카드가 두 겹이 된다. 넣을 때는 늘 `frame={false}`.
 *
 * ## Composition rules
 * - **높이는 부모가 정한다.** WidgetFrame 은 `h-full` 로 칸을 채우고, 격자 행 높이가 칸 높이다.
 * - **헤더는 제목과 메뉴만.** 제목은 지표 이름만 쓴다(「TPS」 「응답시간」). 값 · 건수 · 대상 수 · 단위 · 시간 범위를 헤더에 두지 않는다
 *   (2026-10-08 사용자 결정) — 헤더가 모든 칸에서 같은 모양이어야 격자가 읽힌다. 시간 범위는 페이지 옵션바가 한 번 말한다.
 * - 칸에 꼭 필요한 값(히트맵 건수 · 최대 · 최소 · 척도)은 **`summary`** — 본문 첫 줄 왼쪽. 같은 줄 오른쪽이 범례다.
 * - **헤더 오른쪽 아이콘 메뉴는 둘로 고정한다: 전체 화면(⛶) + 더보기(⋮).** 순서도 고정이다.
 *   설정 · 복사 · 상세로 이동 같은 나머지 행동은 전부 더보기(`menu`) 안으로 접는다. 아이콘을 늘어놓지 않는다.
 *   위젯마다 아이콘 수가 다르면 칸이 좁을 때 제목이 칸마다 다른 자리에서 잘린다.
 * - 버튼은 [[ToolbarIconButton]] 을 24px 로 줄여 쓴다(자리에서 `--wds-toolbar-control-h` 를 덮는다). 헤더 줄은 24px 고정이라
 *   메뉴가 있는 칸과 없는 칸의 본문 시작선이 같다.
 * - **AI 진입점은 `onAsk` 하나로 준다.** 주면 두 자리에 같은 동작이 선다: ⋮ 더보기의 **첫 줄** 「AI 에게 묻기」(늘 닿는 길 —
 *   터치 · 키보드)와 헤더 맨 앞 **호버 지름길** 아이콘. 지름길은 칸에 마우스가 올라가거나 칸 안에 포커스가 있을 때만 보이고
 *   자리는 늘 잡혀 있다(나타나도 제목이 밀리지 않는다). 순서는 [AI][⛶][⋮]. AI 위젯을 여는 화면에서만 준다 —
 *   레거시 차트 모드 · 전체 격자 화면에는 주지 않는다(patterns §15).
 * - **`draggable`** 은 칸을 사람이 배치하는 보드(Flex 보드)에만 켠다. 켜면 헤더가 끌기 손잡이가 되고(`.wds-widget-frame-handle`,
 *   커서 grab) 왼쪽 여백에 ⠿ 표시가 호버 때 나타난다. 메뉴 버튼 묶음(`.wds-widget-frame-actions`)은 끌기에서 뺀다.
 *   실제 이동 · 재배치는 격자(보드)가 맡는다 — 격자 라이브러리의 손잡이 선택자로 이 두 클래스를 넘긴다.
 *   배치가 정해진 대시보드에서는 켜지 않는다(제목 · 메뉴를 누르려다 칸이 밀린다).
 * - **범례는 본문 오른쪽 위 한 줄**(`legend`). 헤더 오른쪽은 메뉴 자리라 범례를 올리지 않는다.
 * - **지금 값**은 계열이 넷 이하면 범례 이름 뒤(`legend[].value`, 굵게), 계열 하나면 `summary`, 강조 계열이 여럿이면 [[MiniMultiLineChart]] 선 끝 배지(patterns §25). 한 칸에 두 방식을 함께 쓰지 않는다.
 *   **모든 차트 칸에 둔다 — 계열이 하나여도**(2026-10-08 사용자 결정). 이름은 제목이 아니라 계열 이름(「전체 APM」 「평균」 「usr」).
 *   예외는 이름표가 본문 안에 이미 있는 것뿐이다: [[BarList]](줄 이름) · [[MiniDonutChart]](옆 열) · [[ApdexChart]](띠 이름) · 숫자 칸([[KpiCard]] · [[KpiField]]).
 *   속도 구분(아크 · 히트맵)은 `SPEED_LEGEND`, GPU 맵은 `HEX_GRID_LEGEND` 를 그대로 넘긴다(칸 수를 붙이면 `hexGridLegend(items)` → `Critical 3`). 계열이 넷을 넘으면 줄바꿈 없이 넘치는 만큼 잘린다 — 그런 칸은 계열을 줄인다.
 * - 푸터는 출처 · 마지막 수집 시각 한 줄만. 범례를 푸터로 내리지 않는다.
 * - **본문 간격은 토큰 넷이 정한다**: 좌우 `--wds-widget-body-px` · 아래 `--wds-widget-body-pb` · 줄 간격 `--wds-widget-row-gap`
 *   · Y축 눈금 칸 `--wds-widget-axis-gutter`. 칸 안 차트는 모두 `frame={false}` 로 자기 바깥 여백을 0 으로 둔다. 그래야 한 줄의
 *   본문 시작선 · Y축 선 · X축 선이 같다. 그래프 축 글자는 모두 `text-chart`.
 * - `bleed` 는 표처럼 행이 칸 가장자리까지 닿아야 하는 것에만 준다. 아크 · 히트맵은 `bleed` 가 아니라 `frame={false}`.
 *   칸 안의 [[DataTable]] 은 자기 테두리를 지우고 칸 테두리를 쓴다.
 * - 빈 상태는 `state` 로만 바꾼다. 본문 안에 빈 그림 · 0 선 · 「-」 를 직접 그리지 않는다.
 * - 색은 토큰만: 표면 `--color-card` · 테두리 `--color-border-default` · 범례 색은 `--color-chart-series-N`.
 *
 * @example
 * ```tsx
 * <WidgetFrame
 *   title="TPS"
 *   onFullscreen={openFullscreen}
 *   menu={[
 *     { key: "settings", label: "위젯 설정", onSelect: openSettings },
 *     { key: "copy", label: "위젯 복사", onSelect: copyWidget },
 *     { key: "detail", label: "상세로 이동", onSelect: goDetail },
 *   ]}
 *   legend={[{ label: "전체 APM", color: "var(--color-chart-series-1)" }]}
 * >
 *   <TpsChart />
 * </WidgetFrame>
 *
 * <WidgetFrame title="DB 액티브 세션" state="collect-gap" stateDescription="2대 · 18분째 끊김" />
 * ```
 */

export type WidgetFrameState = "ready" | "no-data" | "collect-gap";

export type WidgetFrameLegendItem = {
  label: string;
  /** 시리즈 색 토큰(`var(--color-chart-series-N)`). hex 금지. */
  color: string;
  /**
   * 지금 값(단위 포함, 예: "86%"). 이름 뒤에 굵게 붙는다(patterns §25). 계열이 넷 이하일 때만.
   * 그보다 많으면 범례에 값을 싣지 않고 [[MiniMultiLineChart]] `endLabel`(선 끝 배지)로. 한 칸에 둘을 함께 쓰지 않는다.
   */
  value?: ReactNode;
};

export type WidgetFrameProps = {
  /** 지표 이름만. 값 · 단위 · 시간 범위는 헤더에 두지 않는다(값은 `summary`). */
  title: string;
  /**
   * 본문 첫 줄 왼쪽 — 칸에 꼭 필요한 값(건수 · 최대 · 최소 · 척도). 같은 줄 오른쪽이 범례.
   * 헤더에는 값을 두지 않는다(제목 · 메뉴만). 시간 범위는 쓰지 않는다. 글자면 tertiary.
   */
  summary?: ReactNode;
  /** 전체 화면(⛶). 주면 아이콘이 선다. 헤더 메뉴의 첫 칸. */
  onFullscreen?: () => void;
  /**
   * 더보기(⋮) 안의 줄. 주면 아이콘이 선다. 헤더 메뉴의 둘째 칸.
   * 설정 · 복사 · 상세로 이동 등. AI 위젯을 여는 화면이면 「AI 에게 묻기」 를 첫 줄로.
   */
  menu?: ActionMenuAction[];
  /**
   * AI 진입점. 주면 ⋮ 첫 줄 「AI 에게 묻기」와 헤더 맨 앞 호버 지름길 아이콘이 함께 선다(같은 동작).
   * AI 위젯을 여는 화면에서만 준다(patterns §15).
   */
  onAsk?: () => void;
  /** 헤더를 끌기 손잡이로. 칸을 사람이 배치하는 보드에만. 이동은 격자가 맡는다. */
  draggable?: boolean;
  /** 본문 오른쪽 위 한 줄 범례. 모든 차트 칸에 둔다(계열 하나여도). 이름표가 본문 안에 있는 BarList · 도넛 · Apdex · 숫자 칸은 제외. */
  legend?: WidgetFrameLegendItem[];
  /** 본문 안쪽 여백을 없앤다. 표처럼 행이 칸 가장자리까지 닿아야 할 때만(아크 · 히트맵은 frame={false} 로). */
  bleed?: boolean;
  /**
   * 본문 상태. `ready` 가 아니면 `children` 대신 빈 상태 한 덩어리를 그린다.
   * - `no-data`: 이 구간에 수집된 값이 없다(대상은 살아 있다).
   * - `collect-gap`: 수집이 끊겨 그리지 못했다. «0» 이 아니라 «모름» 이다.
   */
  state?: WidgetFrameState;
  /** 빈 상태 사실 한 줄을 바꾼다. 기본은 상태마다 정해진 문장. */
  stateTitle?: ReactNode;
  /** 빈 상태 둘째 줄: 그래서 무엇을 보면 되는가, 또는 끊긴 범위(「서버 12대 · 32분째」). */
  stateDescription?: ReactNode;
  /** 본문 아래 한 줄: 출처 · 마지막 수집 시각. 범례는 `legend`. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const STATE_TITLE: Record<Exclude<WidgetFrameState, "ready">, string> = {
  "no-data": "이 구간에 수집된 데이터가 없습니다",
  "collect-gap": "수집이 끊겨 그리지 않았습니다",
};

/* 헤더 줄(24px)에 맞춘다. ToolbarIconButton 은 이 토큰으로 정사각을 그리므로 버튼을 고치지 않고 자리에서 덮는다. */
const MENU_SIZE = { "--wds-toolbar-control-h": "24px" } as CSSProperties;

const MoreIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="3.5" r="1.25" fill="var(--color-text-tertiary)" />
    <circle cx="8" cy="8" r="1.25" fill="var(--color-text-tertiary)" />
    <circle cx="8" cy="12.5" r="1.25" fill="var(--color-text-tertiary)" />
  </svg>
);

const GripIcon = (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
    {[2, 6, 10].map((y) => (
      <g key={y}>
        <circle cx="2" cy={y} r="1" fill="var(--color-text-tertiary)" />
        <circle cx="6" cy={y} r="1" fill="var(--color-text-tertiary)" />
      </g>
    ))}
  </svg>
);

export default function WidgetFrame({
  title,
  summary,
  onFullscreen,
  menu,
  onAsk,
  draggable = false,
  legend,
  bleed = false,
  state = "ready",
  stateTitle,
  stateDescription,
  footer,
  children,
  className,
}: WidgetFrameProps) {
  const empty = state !== "ready";
  /* AI 는 ⋮ 첫 줄이 늘 닿는 길이다. 지름길 아이콘만 두면 터치 · 키보드에서 진입점이 사라진다. */
  const items: ActionMenuAction[] = [...(onAsk ? [{ key: "wds-ask", label: "AI 에게 묻기", onSelect: onAsk }] : []), ...(menu ?? [])];
  const hasMenu = !!onFullscreen || items.length > 0 || !!onAsk;

  return (
    <section
      aria-label={title}
      className={`wds-widget-frame flex flex-col h-full min-h-0 min-w-0 bg-card border border-color-var-color-border-default rounded-4px overflow-hidden ${className ?? ""}`}
    >
      <div
        className={`relative flex items-center gap-8px h-24px px-12px shrink-0${draggable ? " wds-widget-frame-handle" : ""}`}
        style={{ boxSizing: "content-box", paddingTop: 8, paddingBottom: 4 }}
      >
        {draggable && (
          /* 손잡이 표시 — 왼쪽 여백(12px) 안에 서서 제목을 밀지 않는다. */
          <span aria-hidden className="wds-widget-frame-reveal absolute flex items-center" style={{ left: 2, top: 8, height: 24 }}>
            {GripIcon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <CardHead title={title} />
        </div>
        {hasMenu && (
          <div className="wds-widget-frame-actions flex items-center gap-4px shrink-0" style={MENU_SIZE}>
            {onAsk && (
              /* 호버 지름길 — 자리는 늘 잡혀 있고 칸에 손이 닿을 때만 보인다(.wds-widget-frame-reveal). */
              <span className="wds-widget-frame-reveal flex items-center justify-center" style={{ width: 24, height: 24 }}>
                <TriggerButton size={14} animate={false} label={`${title} 위젯을 WhaTap-AI로 분석`} tooltip={`${title} 위젯을 WhaTap-AI로 분석`} tooltipPlacement="bottom" onClick={onAsk} />
              </span>
            )}
            {onFullscreen && <ToolbarIconButton icon="bottom-fullscreen.svg" label="전체 화면" onClick={onFullscreen} />}
            {items.length > 0 && (
              <ActionMenu placement="bottom-end" items={items} trigger={<ToolbarIconButton icon={MoreIcon} label="더보기" />} />
            )}
          </div>
        )}
      </div>

      <div
        className="wds-widget-frame-body flex flex-col flex-1 min-h-0"
        /* 여백 · 줄 간격은 이 한 곳에서 토큰으로만 정한다(--wds-widget-*). 칸 안 차트는 frame={false} 로
           자기 바깥 여백을 0 으로 두므로, 본문 시작선 · Y축 선 · 줄 간격이 모든 칸에서 같다. */
        style={{
          gap: "var(--wds-widget-row-gap)",
          ...(bleed || empty ? {} : { padding: "0 var(--wds-widget-body-px) var(--wds-widget-body-pb)" }),
        }}
      >
        {empty ? (
          <div className="flex flex-1 min-h-0 items-center">
            <EmptyState size="sm" title={stateTitle ?? STATE_TITLE[state]} description={stateDescription} />
          </div>
        ) : (
          <>
            {(!!legend?.length || summary) && (
              /* 본문 첫 줄 — 왼쪽 summary(값), 오른쪽 범례. 범례는 모든 차트 칸에 둔다(계열 하나여도). */
              <div className="flex items-center justify-between shrink-0" style={{ gap: 12, padding: bleed ? "0 var(--wds-widget-body-px)" : 0 }}>
                <span className="text-sm text-tertiary whitespace-nowrap truncate min-w-0" style={{ fontFamily: "var(--font-family-numeric)" }}>
                  {summary}
                </span>
                {!!legend?.length && (
                  <ul aria-label="범례" className="flex items-center justify-end gap-12px shrink-0" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {legend.map((l) => (
                      <li key={l.label} className="flex items-center gap-4px text-sm text-secondary whitespace-nowrap">
                        <span aria-hidden className="shrink-0 rounded-2px" style={{ width: 8, height: 8, background: l.color }} />
                        {l.label}
                        {l.value != null && (
                          <span className="text-primary font-semibold" style={{ fontFamily: "var(--font-family-numeric)" }}>
                            {l.value}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {children}
          </>
        )}
      </div>

      {footer && <div className="px-12px pb-4px shrink-0 text-sm text-tertiary">{footer}</div>}
    </section>
  );
}
