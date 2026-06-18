/**
 * OptionbarPage — 모니터링 페이지 상단 옵션바(시간·인스턴스·DB·프리셋) 행.
 *
 * ## Purpose
 * 페이지 데이터 컨텍스트(시간 범위·인스턴스·데이터베이스·프리셋)를 한 행에 묶는
 * 옵션바 wrapper. 각 항목은 좌측 title + 우측 content 의 세로 stack 이며,
 * content 는 작은 sub-component([[LiveTimerCompact]] / [[OptionbarInstanceSelector]] /
 * ValueDisplay / NewVersionButton / [[PresetSelect]])로 분리되어 다른 페이지에서도
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
 *   (신규 버전·프리셋)은 `ml-auto` 로 좌측 빈 공간을 흡수.
 * - 모든 content chrome 은 32px height 로 baseline 통일.
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
import OptionbarItem from "./OptionbarItem";
import OptionbarValueDisplay from "./OptionbarValueDisplay";
import OptionbarNewVersionButton from "./OptionbarNewVersionButton";

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
  /** 신규 버전 버튼 라벨/링크 */
  newVersionHref = "#",
  newVersionLabel = "신규 버전",
  /** 프리셋 옵션 */
  presetLabel = "Default",
}: {
  liveTime?: string;
  durationLabel?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  instanceLabel?: string;
  instanceStatus?: InstanceStatus;
  databaseLabel?: string;
  newVersionHref?: string;
  newVersionLabel?: string;
  presetLabel?: string;
}) {
  return (
    <div className="flex flex-row items-end gap-12px flex-wrap p-8px bg-card border-b border-color-var-color-border-default">
      <OptionbarItem title="시간">
        <LiveTimerCompact
          time={liveTime}
          durationLabel={durationLabel}
          paused={paused}
          onTogglePause={onTogglePause}
        />
      </OptionbarItem>

      <OptionbarItem title="인스턴스">
        {/* title="" 로 내부 title 렌더 억제 (default "인스턴스"가 중복 표시되는 것 방지) */}
        <OptionbarInstanceSelector
          title=""
          label={instanceLabel}
          status={instanceStatus}
        />
      </OptionbarItem>

      <OptionbarItem title="데이터베이스">
        <OptionbarValueDisplay value={databaseLabel} />
      </OptionbarItem>

      {/* 신규 버전·프리셋은 우측 정렬 — ml-auto로 좌측 빈 공간 흡수 */}
      <div className="ml-auto flex flex-row items-end gap-12px flex-wrap">
        <OptionbarItem title="">
          <OptionbarNewVersionButton href={newVersionHref} label={newVersionLabel} />
        </OptionbarItem>

        <OptionbarItem title="프리셋">
          <PresetSelect label={presetLabel} />
        </OptionbarItem>
      </div>
    </div>
  );
}

