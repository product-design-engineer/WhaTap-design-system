import type { ReactNode } from "react";
import CardHead from "./CardHead";
import EmptyState from "./EmptyState";

/**
 * WidgetFrame — 대시보드 위젯 한 칸의 껍데기 (헤더 · 본문 · 푸터 + 빈 상태). Shell layer: 본문에 무엇이든 담고 [[CardHead]] 를 조립한다.
 *
 * ## Purpose
 * 대시보드 격자의 한 칸을 **같은 모양으로** 세운다. 표면 · 테두리 · 반경 · 안쪽 여백 · 제목 줄을
 * 이 컴포넌트 하나가 정하고, 차트 · 표 · 수치는 본문만 그린다. 껍데기를 차트마다 따로 정하면
 * 한 줄에 놓인 위젯들의 여백과 제목 굵기가 1~4px 씩 어긋나고, 사람은 그 차이를 «다른 종류의
 * 위젯» 으로 읽는다.
 *
 * 빈 상태도 이 껍데기가 맡는다. 데이터가 없는 것과 수집이 끊긴 것은 다른 사실이라 문장이 다르고,
 * 둘 다 **선을 0 으로 그리지 않는다** — 0 으로 그린 선은 «조용하다» 로 읽혀 끊긴 수집을 정상으로 감춘다.
 *
 * ## When to use
 * - 대시보드 · Flex 보드 격자의 위젯 한 칸 (액티브 트랜잭션 · 히트맵 · 이벤트 목록 · 프로젝트 표).
 * - 본문만 그리는 DS 컴포넌트를 담을 때 — [[ActiveTransactionArc]] · [[ScatterHeatmap]] · [[DataTable]] · [[HexGrid]] 본문.
 *
 * ## When NOT to use
 * - AI 위젯 **안**의 카드 → [[AiCard]]. 제품 화면에 AiCard 를 쓰면 그 칸이 AI 응답처럼 읽히고,
 *   반대로 AI 답변에 WidgetFrame 을 쓰면 답이 대시보드 조각처럼 읽힌다.
 * - 폼 · 설정의 구획 묶음 → `bg-card` 카드 + 구획 사이 선 (patterns §14).
 * - 상태를 알리는 상자 → [[Notice]].
 * - 아직 껍데기를 스스로 그리는 차트([[MiniMultiLineChart]] · [[MiniDonutChart]] · [[KpiCard]] · [[MiniLineChart]])
 *   를 그대로 넣기 → 카드가 두 겹이 된다. 그 차트들은 그대로 격자에 세우고, 껍데기 이관은 별도로 한다.
 *
 * ## Composition rules
 * - **높이는 부모가 정한다.** WidgetFrame 은 `h-full` 로 칸을 채우고, 격자 행 높이가 칸 높이다.
 *   위젯마다 높이를 따로 주면 같은 줄의 아래 선이 맞지 않는다.
 * - 제목은 지표 이름만 쓴다(「TPS」 「응답시간」). 범위 · 대상 수 · 단위처럼 «지금 무엇을 보는가» 는 `meta` 로.
 * - `bleed` 는 본문이 자기 가장자리를 가진 것(표 · 히트맵 · 도는 아크)에만 준다. 표에 안쪽 여백을 두면
 *   행 구분선이 카드 테두리에 닿지 않고 떠 보인다.
 * - 빈 상태는 `state` 로만 바꾼다. 본문 안에 빈 그림 · 0 선 · 「-」 를 직접 그리지 않는다.
 * - AI 진입점(`onAiTrigger` 류)은 이 껍데기에 두지 않는다. 붙일지는 위젯이 아니라 **페이지 성격**이 정한다(patterns §15).
 * - 색은 토큰만 — 표면 `--color-card` · 테두리 `--color-border-default`.
 *
 * @example
 * ```tsx
 * <WidgetFrame title="액티브 트랜잭션" meta="APM 24" bleed>
 *   <ActiveTransactionArc maxTx={maxTx} agent={agent} />
 * </WidgetFrame>
 *
 * <WidgetFrame title="DB 액티브 세션" meta="최근 30분" state="collect-gap" stateDescription="2대 · 18분째 끊김">
 *   <SessionChart />
 * </WidgetFrame>
 * ```
 */

export type WidgetFrameState = "ready" | "no-data" | "collect-gap";

export type WidgetFrameProps = {
  /** 지표 이름. 범위 · 대상 · 단위는 `meta` 로. */
  title: string;
  /** 머리 우측 끝 — 지금 보는 범위 · 대상 수 · 단위. 글자면 tertiary 로 그린다. */
  meta?: ReactNode;
  /** 본문 안쪽 여백을 없앤다. 표 · 히트맵처럼 본문이 자기 가장자리를 가질 때만. */
  bleed?: boolean;
  /**
   * 본문 상태. `ready` 가 아니면 `children` 대신 빈 상태 한 덩어리를 그린다.
   * - `no-data` — 이 구간에 수집된 값이 없다(대상은 살아 있다).
   * - `collect-gap` — 수집이 끊겨 그리지 못했다. «0» 이 아니라 «모름» 이다.
   */
  state?: WidgetFrameState;
  /** 빈 상태 사실 한 줄을 바꾼다. 기본은 상태마다 정해진 문장. */
  stateTitle?: ReactNode;
  /** 빈 상태 둘째 줄 — 그래서 무엇을 보면 되는가, 또는 끊긴 범위(「서버 12대 · 32분째」). */
  stateDescription?: ReactNode;
  /** 본문 아래 한 줄 — 범례 · 출처 · 마지막 수집 시각. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const STATE_TITLE: Record<Exclude<WidgetFrameState, "ready">, string> = {
  "no-data": "이 구간에 수집된 데이터가 없습니다",
  "collect-gap": "수집이 끊겨 그리지 않았습니다",
};

export default function WidgetFrame({
  title,
  meta,
  bleed = false,
  state = "ready",
  stateTitle,
  stateDescription,
  footer,
  children,
  className,
}: WidgetFrameProps) {
  const empty = state !== "ready";

  return (
    <section
      aria-label={title}
      className={`flex flex-col h-full min-h-0 min-w-0 bg-card border border-color-var-color-border-default rounded-4px overflow-hidden ${className ?? ""}`}
    >
      <div className="px-12px pt-8px pb-4px shrink-0">
        <CardHead
          title={title}
          meta={typeof meta === "string" ? <span className="text-sm text-tertiary">{meta}</span> : meta}
        />
      </div>

      <div
        className="flex flex-col flex-1 min-h-0"
        /* 여백은 이 한 곳에서만 정한다. 본문이 다시 여백을 두면 칸마다 안쪽 선이 달라진다. */
        style={bleed || empty ? undefined : { padding: "0 12px 12px" }}
      >
        {empty ? (
          <div className="flex flex-1 min-h-0 items-center">
            <EmptyState size="sm" title={stateTitle ?? STATE_TITLE[state]} description={stateDescription} />
          </div>
        ) : (
          children
        )}
      </div>

      {footer && <div className="px-12px pb-4px shrink-0 text-sm text-tertiary">{footer}</div>}
    </section>
  );
}
