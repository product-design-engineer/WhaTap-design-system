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
 * - 모든 content chrome 은 `size` 한 값으로 높이를 맞춘다 — `md`(32px, 기본) / `sm`(24px).
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
 * ```
 */
import OptionbarInstanceSelector, {
  type InstanceStatus,
} from "./OptionbarInstanceSelector";
import LiveTimerCompact from "./LiveTimerCompact";
import PresetSelect from "./PresetSelect";
import OptionbarItem, { type OptionbarSize } from "./OptionbarItem";
import OptionbarValueDisplay from "./OptionbarValueDisplay";

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
  /** 항목 배치 — inline(타이틀을 값 좌측에 나란히, **기본**) / stack(타이틀 위·값 아래) */
  layout = "inline",
  /** 행 전체 chrome 높이 — sm(24px, **기본**) / md(32px). 모든 하위 컨트롤에 일괄 전달. */
  size = "sm",
}: {
  liveTime?: string;
  durationLabel?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  instanceLabel?: string;
  instanceStatus?: InstanceStatus;
  databaseLabel?: string;
  presetLabel?: string;
  layout?: "stack" | "inline";
  size?: OptionbarSize;
}) {
  // 좌·우 거터는 헤더(PageHeader·SubHeaderBar·PageHeaderAiInline)와 동일한 --wds-header-px 토큰으로 정렬.
  // inline 항목은 한 줄 가로 행 → 행 정렬은 center. stack 은 기존 items-end 유지.
  const rowAlign = layout === "inline" ? "items-center" : "items-end";
  // inline 행 높이는 **40px 고정**(`box-border`) — size(md 32px / sm 24px) 가 바뀌어도 행 높이는 불변.
  // 사이드바 스위처·SubHeaderBar 40px 라인과 정렬을 보장하려면 padding 기반이 아니라 고정 높이여야 한다.
  // stack 은 항목이 2줄(타이틀+값)이라 높이 고정 없이 py-8px 유지.
  const rowBox = layout === "inline" ? "box-border" : "py-8px";
  return (
    <div
      className={`flex flex-row ${rowAlign} gap-12px flex-wrap ${rowBox} bg-card border-b border-color-var-color-border-default`}
      style={{
        paddingInline: "var(--wds-header-px)",
        // inline: 40px 고정선. minHeight 로 둬서 flex-wrap 이 일어나는 좁은 폭에서도 잘리지 않는다.
        // (min-h-40px 유틸은 whatap-ds.css 에 없고 새 클래스 추가는 금지 → 인라인 style)
        ...(layout === "inline" ? { minHeight: 40 } : null),
      }}
    >
      <OptionbarItem title="시간" layout={layout}>
        <LiveTimerCompact
          size={size}
          time={liveTime}
          durationLabel={durationLabel}
          paused={paused}
          onTogglePause={onTogglePause}
        />
      </OptionbarItem>

      <OptionbarItem title="인스턴스" layout={layout}>
        {/* title="" 로 내부 title 렌더 억제 (default "인스턴스"가 중복 표시되는 것 방지) */}
        <OptionbarInstanceSelector
          title=""
          size={size}
          label={instanceLabel}
          status={instanceStatus}
        />
      </OptionbarItem>

      <OptionbarItem title="데이터베이스" layout={layout}>
        <OptionbarValueDisplay value={databaseLabel} size={size} />
      </OptionbarItem>

      {/* 프리셋은 우측 정렬 — ml-auto로 좌측 빈 공간 흡수 */}
      <div className={`ml-auto flex flex-row ${rowAlign} gap-12px flex-wrap`}>
        <OptionbarItem title="프리셋" layout={layout}>
          <PresetSelect label={presetLabel} size={size} />
        </OptionbarItem>
      </div>
    </div>
  );
}

