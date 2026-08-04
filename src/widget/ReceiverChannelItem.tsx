import { TONE_DOT } from "./_tokens";
import type { ChannelKey, ChannelState } from "./AiReceiverChannels";

/**
 * ReceiverChannelItem — [[AiReceiverChannels]] 의 단일 채널 행(`<li>`).
 *
 * ## Purpose
 * 알림 수신 채널 한 건을 한 줄로 렌더 — 이모지 아이콘 · 라벨(+유료 배지) · 보조 정보 · 토글 핀(mock).
 * `AiReceiverChannels` 의 `channels.map(...)` 안에 인라인되어 있던 행 마크업을 그대로 추출한 것.
 *
 * ## When to use
 * - [[AiReceiverChannels]] 가 `channels.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 카드 chrome / 헤딩 → 부모 [[AiReceiverChannels]] 가 책임.
 * - 채널이 아닌 다른 목록 항목 → 해당 위젯의 행 컴포넌트 사용.
 *
 * ## Composition rules
 * - 채널 데이터(`icon`/`label`/`detail`/`paid`)와 상태(`enabled`)만 주입 — 행 외형은 이 컴포넌트가 책임.
 * - 토글 핀 색은 tone 토큰(`TONE_DOT.low`) 사용, 인라인 hex 는 off 상태 트랙에만 한정.
 * - 토글은 visual mock — 실제 상태는 부모가 `enabled` 로 제어하고 클릭은 `onToggle` 로 위임.
 * - `onToggle` 미지정 시 행 클릭 비활성(read-only).
 *
 * @example
 * ```tsx
 * {channels.map((c) => (
 *   <ReceiverChannelItem
 *     key={c.key}
 *     channelKey={c.key}
 *     icon={CHANNEL_ICON[c.key]}
 *     label={c.label}
 *     detail={c.detail}
 *     paid={c.paid}
 *     enabled={c.enabled}
 *     onToggle={onToggle}
 *   />
 * ))}
 * ```
 */
export default function ReceiverChannelItem({
  channelKey,
  icon,
  label,
  detail,
  paid,
  enabled,
  onToggle,
}: {
  /** 채널 식별자. `onToggle` 콜백에 그대로 전달됨 */
  channelKey: ChannelKey;
  /** 표시할 이모지 아이콘. 부모가 `CHANNEL_ICON[key]` 로 매핑해 주입 */
  icon: string;
  label: ChannelState["label"];
  /** 표시할 보조 정보. 예: "kyungho.oh@whatap.io", "010-****-1234" */
  detail?: ChannelState["detail"];
  /** 유료 프로젝트 전용 채널 표시 (SMS / WhatsApp) */
  paid?: ChannelState["paid"];
  enabled: ChannelState["enabled"];
  /** 토글 클릭. 미지정이면 행 클릭 비활성. */
  onToggle?: (key: ChannelKey, next: boolean) => void;
}) {
  const interactive = !!onToggle;
  return (
    <li
      className={`flex items-center gap-10px py-6px border-b border-color-var-color-surface-50 last-border-b-0 ${
        interactive ? "cursor-pointer hover-bg-surface-50" : ""
      }`}
      onClick={() => interactive && onToggle!(channelKey, !enabled)}
    >
      {/* 이모지 아이콘 */}
      <span className="text-lg leading-none shrink-0 w-20px text-center">
        {icon}
      </span>

      {/* 라벨 + 보조 정보 */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-6px">
          <span
            className="text-base font-bold text-primary tracking-default leading-normal"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {label}
          </span>
          {paid && (
            <span
              className="text-chart px-4px py-1px rounded-6px tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-korean)",
                fontWeight: "var(--font-weight-medium)",
                background: "var(--color-surface-100)",
                color: "var(--color-text-tertiary)",
              }}
            >
              유료
            </span>
          )}
        </div>
        {detail && (
          <span
            className="text-sm text-tertiary tracking-default leading-normal truncate"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
          >
            {detail}
          </span>
        )}
      </div>

      {/* 토글 핀 (mock — visual only) */}
      <span
        className="shrink-0 relative inline-block w-28px h-16px rounded-full transition-colors"
        style={{ background: enabled ? TONE_DOT.low : "var(--color-surface-200)" }}
        aria-hidden
      >
        <span
          // raw-color-ok: 트랙(컬러/회색) 위 knob — Switch 프리미티브와 같은 고정 흰색.
          className="absolute top-2px size-12px rounded-full bg-white transition-left"
          style={{ left: enabled ? 14 : 2 }}
        />
      </span>
    </li>
  );
}
