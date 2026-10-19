/**
 * OptionbarPage — 모니터링 페이지 상단 옵션바(시간·인스턴스·DB·프리셋) 행.
 *
 * ## Purpose
 * 페이지 데이터 컨텍스트(시간 범위·인스턴스·데이터베이스·프리셋)를 한 행에 묶는
 * 옵션바 wrapper. 각 항목은 좌측 title + 우측 content 의 세로 stack 이며,
 * content 는 작은 sub-component([[LiveTimerCompact]] / [[OptionbarInstanceSelector]] /
 * ValueDisplay / [[PresetSelect]])로 분리되어 다른 페이지에서도
 * 재사용된다. 데이터는 모두 prop 으로 외부화(데모 mock 값을 기본으로 채워 둠).
 *
 * ## When to use
 * - 라이브 DB / Server / APM 모니터링 페이지 상단의 데이터 필터 옵션 행.
 * - 시간·인스턴스·프리셋을 한 줄에 가로로 배열해야 하는 자리.
 *
 * ## When NOT to use
 * - 뒤로가기·브레드크럼 등 보조 네비게이션 행 → [[SubHeaderBar]].
 * - 시간 범위 입력만 단독으로 필요 → [[TimeRangeSelector]] 직접 사용.
 * - 텍스트/검색/숫자 폼 입력 → [[TextField]].
 *
 * ## Composition rules
 * - 루트는 `flex-row items-end` 행, 항목 간 12px gap, 하단 border-default.
 * - 각 항목은 `OptionbarItem`(title + content) 으로 감싼다. 우측 정렬 그룹
 *   (프리셋)은 `ml-auto` 로 좌측 빈 공간을 흡수.
 * - **필드 구성은 `items` 로 교체한다.** `items` 를 주면 기본 4항목(시간·인스턴스·데이터베이스·프리셋)
 *   대신 준 목록만 렌더한다 — 페이지마다 다른 옵션(시작일·큐브 지표 등)을 이 행으로 표현할 때 쓴다.
 *   `alignEnd: true` 인 항목은 `ml-auto` 우측 그룹으로 모인다(순서 유지).
 * - `items` 의 `content` 는 **호출부가 만든다** — 행의 모든 컨트롤에 같은 `size` 를 넘겨야 baseline 이
 *   맞는다(자동 주입하지 않는다: content 가 임의 노드라 prop 이름을 알 수 없다).
 * - `items` 의 content 도 등록된 컴포넌트만 쓴다 — 값 표시는 [[OptionbarValueDisplay]],
 *   선택은 [[PresetSelect]]·[[OptionbarInstanceSelector]]. 인라인 `<div>` 로 컨트롤 자작 금지.
 * - 모든 content chrome 은 `size` 한 값으로 높이를 맞춘다 — `sm`(24px, 기본) / `md`(28px) / `lg`(32px).
 *   LIVE 타이머 · 인스턴스 셀렉터 · DB 값 · 프리셋 셀렉터에 그대로 전달되어 행 baseline 이 어긋나지 않는다.
 *   기본값은 `layout="inline"` + `size="sm"` — 40px 행 안에 24px 컨트롤(가장 컴팩트한 표준 조합).
 * - `layout="inline"` 행 높이는 **40px 고정**(`box-border` + `minHeight:40`) — `size` 를 sm 으로 내려도
 *   행 자체는 40px 을 유지해 사이드바 스위처·[[SubHeaderBar]] 40px 라인과 어긋나지 않는다.
 * - 색·border 는 토큰(var(--color-border-default) 등) — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <OptionbarPage
 *   liveTime="12:01:35"
 *   durationLabel="10분"
 *   instanceLabel="DMX-3-12-949"
 *   instanceStatus="ok"
 *   databaseLabel="ORA11K"
 *   presetLabel="Default"
 * />
 *
 * // 임의 필드 구성 — 시작일 · 인스턴스 · 큐브 지표
 * <OptionbarPage
 *   items={[
 *     { title: "시작일", content: <OptionbarValueDisplay value="2026/08/19" size="sm" /> },
 *     {
 *       title: "인스턴스",
 *       content: <OptionbarInstanceSelector title="" size="sm" label="dmx-rac19-1" status="ok" />,
 *     },
 *     { title: "큐브 지표", content: <PresetSelect label="Buffer Cache Hit" size="sm" /> },
 *   ]}
 * />
 * ```
 */
import type { ReactNode } from "react";
import OptionbarInstanceSelector, {
  type InstanceStatus,
} from "./OptionbarInstanceSelector";
import LiveTimerCompact from "./LiveTimerCompact";
import PresetSelect from "./PresetSelect";
import OptionbarItem, { type OptionbarSize } from "./OptionbarItem";
import OptionbarValueDisplay from "./OptionbarValueDisplay";

/**
 * 옵션바 단일 필드 스펙 — `items` 로 임의 필드를 구성할 때 쓴다.
 * `content` 는 행의 다른 컨트롤과 같은 `size` 로 만들어 넘긴다(baseline 통일).
 */
export type OptionbarField = {
  /** 라벨. 빈 문자열이면 라벨 행을 숨긴다([[OptionbarItem]] 규칙). */
  title: string;
  /** 값 컨트롤 — 등록된 옵션바 chrome 컴포넌트. */
  content: ReactNode;
  /** true 면 `ml-auto` 우측 그룹으로 모인다(기본 false = 좌측 그룹). */
  alignEnd?: boolean;
};

export default function OptionbarPage({
  /** 시간 옵션 (live + duration tag) */
  liveTime,
  durationLabel = "10분",
  paused = false,
  onTogglePause,
  /** 인스턴스 옵션 */
  instanceLabel = "DMX-3-12-949",
  instanceStatus = "ok",
  /** 데이터베이스 옵션 (단순 라벨 값) */
  databaseLabel = "ORA11K",
  /** 프리셋 옵션 */
  presetLabel = "Default",
  /**
   * 필드 구성 교체 — 주면 기본 4항목(시간·인스턴스·데이터베이스·프리셋) 대신 이 목록만 렌더한다.
   * 미지정(기본)이면 기존 동작 그대로.
   */
  items,
  /** 항목 배치 — inline(타이틀을 값 좌측에, **기본**) / stack(타이틀 위·값 아래) / auto(행 폭으로 자동 전환) */
  layout = "inline",
  /** 행 전체 chrome 높이 — sm(24px, **기본**) / md(32px). 모든 하위 컨트롤에 일괄 전달. */
  size = "sm",
}: {
  liveTime?: string;
  /** 「시간」 항목 [[LiveTimerCompact]] 의 녹색 알약 태그(조회 구간, 기본 "10분"). `items` 를 주면 쓰이지 않는다. */
  durationLabel?: string;
  /** 「시간」 항목 일시정지 상태 — true 면 시계가 멈추고 배지가 STOP(기본 false). controlled — 전환은 호출측. */
  paused?: boolean;
  /** 「시간」 항목의 일시정지/재생 버튼을 누를 때. 인자 없음 — `paused` 를 뒤집는 것은 호출측. */
  onTogglePause?: () => void;
  instanceLabel?: string;
  /** 「인스턴스」 항목 좌측 상태 dot — ok(**기본**) / warn / error / idle. `items` 를 주면 쓰이지 않는다. */
  instanceStatus?: InstanceStatus;
  databaseLabel?: string;
  presetLabel?: string;
  items?: OptionbarField[];
  layout?: "stack" | "inline" | "auto";
  size?: OptionbarSize;
}) {
  // 좌·우 거터는 헤더(PageHeader·SubHeaderBar·PageHeaderAiInline)와 동일한 --wds-header-px 토큰으로 정렬.
  // inline 항목은 한 줄 가로 행 → 행 정렬은 center. stack 은 기존 items-end 유지.
  // auto 는 항목 높이가 폭에 따라 1줄/2줄로 달라지므로 center 로 둔다(stack 처럼 밑줄 정렬하면
  // 인라인으로 펴진 순간 라벨과 컨트롤의 baseline 이 어긋난다).
  const rowAlign = layout === "stack" ? "items-end" : "items-center";
  // inline 행 높이는 **40px 고정**(`box-border`) — size(sm 24 / md 28 / lg 32px) 가 바뀌어도 행 높이는 불변.
  // 사이드바 스위처·SubHeaderBar 40px 라인과 정렬을 보장하려면 padding 기반이 아니라 고정 높이여야 한다.
  // stack 은 항목이 2줄(타이틀+값)이라 높이 고정 없이 py-8px 유지.
  // auto 는 폭에 따라 1줄(인라인)↔2줄(스택)로 바뀌므로 높이를 고정하지 않는다.
  const rowBox = layout === "inline" ? "box-border" : "py-8px";
  /* 기본 4항목도 items 와 같은 스펙으로 표현한다 — 렌더 경로를 하나로 두면
     좌·우 그룹 마크업이 두 벌로 갈라지지 않는다(기본 경로 마크업은 종전과 동일). */
  const fields: OptionbarField[] = items ?? [
    {
      title: "시간",
      content: (
        <LiveTimerCompact
          size={size}
          time={liveTime}
          durationLabel={durationLabel}
          paused={paused}
          onTogglePause={onTogglePause}
        />
      ),
    },
    {
      title: "인스턴스",
      // title="" 로 내부 title 렌더 억제 (default "인스턴스"가 중복 표시되는 것 방지)
      content: (
        <OptionbarInstanceSelector
          title=""
          size={size}
          label={instanceLabel}
          status={instanceStatus}
        />
      ),
    },
    { title: "데이터베이스", content: <OptionbarValueDisplay value={databaseLabel} size={size} /> },
    // 프리셋은 우측 정렬 — ml-auto로 좌측 빈 공간 흡수
    { title: "프리셋", content: <PresetSelect label={presetLabel} size={size} />, alignEnd: true },
  ];
  const leading = fields.filter((f) => !f.alignEnd);
  const trailing = fields.filter((f) => f.alignEnd);
  const renderField = (f: OptionbarField, i: number) => (
    <OptionbarItem key={`${f.title}-${i}`} title={f.title} layout={layout}>
      {f.content}
    </OptionbarItem>
  );
  return (
    <div
      className={`wds-optionbar-row flex flex-row ${rowAlign} gap-12px flex-wrap ${rowBox} bg-card border-b border-color-var-color-border-default`}
      style={{
        paddingInline: "var(--wds-header-px)",
        // inline: 40px 고정선. minHeight 로 둬서 flex-wrap 이 일어나는 좁은 폭에서도 잘리지 않는다.
        // (min-h-40px 유틸은 whatap-ds.css 에 없고 새 클래스 추가는 금지 → 인라인 style)
        ...(layout === "inline" ? { minHeight: 40 } : null),
      }}
    >
      {leading.map(renderField)}

      {trailing.length > 0 && (
        <div className={`ml-auto flex flex-row ${rowAlign} gap-12px flex-wrap`}>
          {trailing.map(renderField)}
        </div>
      )}
    </div>
  );
}
