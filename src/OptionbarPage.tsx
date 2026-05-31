/**
 * OptionbarPage — 라이브 DB 모니터링 페이지 우측 옵션 패널 공용 컴포넌트.
 *
 * 마크업: 라이브 `OptionbarPage-styles__OptionWrapper`의 vertical stack을
 * 그대로 옮긴 wrapper. 각 항목은 좌측 title + 우측 content. content들은
 * 작은 sub-component(LiveTimerCompact / DbInstanceSelect / ValueDisplay /
 * NewVersionButton / PresetSelect)로 분리하여 다른 페이지에서도 재사용.
 *
 * 데이터는 모두 prop으로 외부화 — 데모 mock 값을 기본으로 채워 둠.
 *
 * 정책: feedback-common-components-catalog (chrome 레벨 공용),
 * feedback-design-system-css-source (라이브 마크업/SVG 그대로).
 */
import type { ReactNode } from "react";
import OptionbarInstanceSelector, {
  type InstanceStatus,
} from "./OptionbarInstanceSelector";
import LiveTimerCompact from "./LiveTimerCompact";
import PresetSelect from "./PresetSelect";

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
    <div className="flex flex-row items-end gap-[12px] flex-wrap p-[8px] bg-white border-b border-[#eaeaea]">
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
        <ValueDisplay value={databaseLabel} />
      </OptionbarItem>

      {/* 신규 버전·프리셋은 우측 정렬 — ml-auto로 좌측 빈 공간 흡수 */}
      <div className="ml-auto flex flex-row items-end gap-[12px] flex-wrap">
        <OptionbarItem title="">
          <NewVersionButton href={newVersionHref} label={newVersionLabel} />
        </OptionbarItem>

        <OptionbarItem title="프리셋">
          <PresetSelect label={presetLabel} />
        </OptionbarItem>
      </div>
    </div>
  );
}

/* ─── shared row wrapper ─── */
function OptionbarItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      {title && (
        <div
          className="text-base font-bold text-primary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── ValueDisplay (데이터베이스 옵션) — 텍스트만 표시 (32px 박스 정렬).
   다른 옵션 (LiveTimer / InstanceSelect / NewVersionButton / PresetSelect)
   모두 32px height chrome 이므로, 본 컴포넌트도 동일 높이로 baseline 통일. */
function ValueDisplay({ value }: { value: string }) {
  return (
    <div
      className="flex items-center h-[32px] text-md text-primary leading-normal tracking-normal truncate"
      style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      title={value}
    >
      {value}
    </div>
  );
}

/* ─── NewVersionButton — 그라데이션 sparkle 아이콘 + 라벨 + chevron-right ─── */
function NewVersionButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href}>
      <button
        type="button"
        className="flex items-center justify-center gap-[6px] h-[32px] w-full px-[12px] rounded-[4px] bg-white border border-[#296CF2] text-md text-brand-blue cursor-pointer hover:bg-[#d6e1ff] transition-colors"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9.5 2C8.5 9.68 2 10.5 2 10.5s6.5.82 7.5 8.5C10.5 11.32 17 10.5 17 10.5s-6.5-.82-7.5-8.5z"
            fill="#296CF2"
          />
          <path
            d="M18 13c-.5 4.06-4 4.5-4 4.5s3.5.44 4 4.5c.5-4.06 4-4.5 4-4.5s-3.5-.44-4-4.5z"
            fill="#296CF2"
          />
        </svg>
        <span className="flex-1 text-center">{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </a>
  );
}
