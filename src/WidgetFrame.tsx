import type { CSSProperties, ReactNode } from "react";
import ActionMenu, { type ActionMenuAction } from "./ActionMenu";
import CardHead from "./CardHead";
import EmptyState from "./EmptyState";
import ToolbarIconButton from "./ToolbarIconButton";

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
 * - 칸 안 차트는 모두 `frame={false}` 로 담는다: [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniDonutChart]] · [[KpiCard]] · [[HexGrid]]
 *   · [[ActiveTransactionArc]] · [[ScatterHeatmap]]. 표([[DataTable]])는 `bleed`.
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
 * - 제목은 지표 이름만 쓴다(「TPS」 「응답시간」). 범위 · 대상 수 · 단위처럼 «지금 무엇을 보는가» 는 `meta` 로.
 * - **헤더 오른쪽 아이콘 메뉴는 둘로 고정한다: 전체 화면(⛶) + 더보기(⋮).** 순서도 고정이다.
 *   설정 · 복사 · 상세로 이동 같은 나머지 행동은 전부 더보기(`menu`) 안으로 접는다. 아이콘을 늘어놓지 않는다.
 *   위젯마다 아이콘 수가 다르면 칸이 좁을 때 제목이 칸마다 다른 자리에서 잘린다.
 * - 버튼은 [[ToolbarIconButton]] 을 24px 로 줄여 쓴다(자리에서 `--wds-toolbar-control-h` 를 덮는다). 헤더 줄은 24px 고정이라
 *   메뉴가 있는 칸과 없는 칸의 본문 시작선이 같다.
 * - AI 진입점은 아이콘으로 더하지 않는다. 그 화면이 AI 위젯을 여는 화면이면(patterns §15) 더보기의 **첫 줄**로 넣는다.
 * - **범례는 본문 오른쪽 위 한 줄**(`legend`). 헤더 오른쪽은 메뉴 자리라 범례를 올리지 않는다. 계열이 셋을 넘거나
 *   항목 글이 길면(도넛 · 분포) 한 줄에 넣지 말고 본문 안에서 차트 옆 열로 그린다.
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
 *   meta="최근 30분"
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
 * <WidgetFrame title="DB 액티브 세션" meta="최근 30분" state="collect-gap" stateDescription="2대 · 18분째 끊김" />
 * ```
 */

export type WidgetFrameState = "ready" | "no-data" | "collect-gap";

export type WidgetFrameLegendItem = {
  label: string;
  /** 시리즈 색 토큰(`var(--color-chart-series-N)`). hex 금지. */
  color: string;
};

export type WidgetFrameProps = {
  /** 지표 이름. 범위 · 대상 · 단위는 `meta` 로. */
  title: string;
  /** 머리 우측: 지금 보는 범위 · 대상 수 · 단위. 글자면 tertiary 로 그린다. */
  meta?: ReactNode;
  /** 전체 화면(⛶). 주면 아이콘이 선다. 헤더 메뉴의 첫 칸. */
  onFullscreen?: () => void;
  /**
   * 더보기(⋮) 안의 줄. 주면 아이콘이 선다. 헤더 메뉴의 둘째 칸.
   * 설정 · 복사 · 상세로 이동 등. AI 위젯을 여는 화면이면 「AI 에게 묻기」 를 첫 줄로.
   */
  menu?: ActionMenuAction[];
  /** 본문 오른쪽 위 한 줄 범례. 계열 셋 이하에만. */
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

export default function WidgetFrame({
  title,
  meta,
  onFullscreen,
  menu,
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
  const hasMenu = !!onFullscreen || !!menu?.length;

  return (
    <section
      aria-label={title}
      className={`flex flex-col h-full min-h-0 min-w-0 bg-card border border-color-var-color-border-default rounded-4px overflow-hidden ${className ?? ""}`}
    >
      <div className="flex items-center gap-8px h-24px px-12px shrink-0" style={{ boxSizing: "content-box", paddingTop: 8, paddingBottom: 4 }}>
        <div className="flex-1 min-w-0">
          <CardHead
            title={title}
            meta={typeof meta === "string" ? <span className="text-sm text-tertiary">{meta}</span> : meta}
          />
        </div>
        {hasMenu && (
          <div className="flex items-center gap-4px shrink-0" style={MENU_SIZE}>
            {onFullscreen && <ToolbarIconButton icon="bottom-fullscreen.svg" label="전체 화면" onClick={onFullscreen} />}
            {!!menu?.length && (
              <ActionMenu placement="bottom-end" items={menu} trigger={<ToolbarIconButton icon={MoreIcon} label="더보기" />} />
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
            {!!legend?.length && (
              <ul
                aria-label="범례"
                className="flex items-center justify-end gap-12px shrink-0"
                style={{ listStyle: "none", margin: 0, padding: bleed ? "0 var(--wds-widget-body-px)" : 0 }}
              >
                {legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-4px text-sm text-secondary whitespace-nowrap">
                    <span aria-hidden className="shrink-0 rounded-2px" style={{ width: 8, height: 8, background: l.color }} />
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
            {children}
          </>
        )}
      </div>

      {footer && <div className="px-12px pb-4px shrink-0 text-sm text-tertiary">{footer}</div>}
    </section>
  );
}
