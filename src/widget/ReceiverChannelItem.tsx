import Switch from "../Switch";
import type { ChannelKey, ChannelState } from "./ReceiverChannels";

/**
 * ReceiverChannelItem — [[ReceiverChannels]] 의 단일 채널 행(`<li>`).
 *
 * ## Purpose
 * 알림 수신 채널 한 건을 한 줄로 렌더 — 이모지 아이콘 · 라벨(+유료 배지) · 보조 정보 · [[Switch]] 토글.
 * `AiReceiverChannels` 의 `channels.map(...)` 안에 인라인되어 있던 행 마크업을 그대로 추출한 것.
 *
 * ## When to use
 * - [[ReceiverChannels]] 가 `channels.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 카드 chrome / 헤딩 → 부모 [[ReceiverChannels]] 가 책임.
 * - 채널이 아닌 다른 목록 항목 → 해당 위젯의 행 컴포넌트 사용.
 *
 * ## Composition rules
 * - 채널 데이터(`icon`/`label`/`detail`/`paid`)와 상태(`enabled`)만 주입 — 행 외형은 이 컴포넌트가 책임.
 * - **토글은 [[Switch]] 프리미티브를 쓴다.** 예전에는 트랙·knob 을 손으로 그린 visual mock 이었는데,
 *   즉시 반영 설정(수신 on/off)은 Switch 의 의도와 정확히 일치하고, mock 은 `role="switch"`·
 *   `aria-checked`·키보드 조작이 전부 없었다. 색·치수·focus-visible 링도 Switch 가 소유한다.
 * - `size="sm"`(40×22) — 2행 높이 행에 들어가는 컴팩트 단계. 행 높이를 밀지 않는다.
 * - 행 전체도 클릭 가능하지만(마우스 편의), Switch 클릭이 행 핸들러로 **버블링하면 두 번 토글**되므로
 *   Switch 래퍼에서 전파를 멈춘다. 키보드는 Switch 가 단독으로 받는다.
 * - `onToggle` 미지정 시 read-only — 행 클릭 비활성 + Switch `disabled`.
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
      <span className="text-lg shrink-0 w-20px text-center">
        {icon}
      </span>

      {/* 라벨 + 보조 정보 */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-6px">
          <span
            className="text-base font-bold text-primary tracking-default"
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
            className="text-sm text-tertiary tracking-default truncate"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
          >
            {detail}
          </span>
        )}
      </div>

      {/* 토글 — Switch 프리미티브. 행 클릭과 이중 토글되지 않도록 전파를 멈춘다. */}
      <span className="shrink-0 inline-flex" onClick={(e) => e.stopPropagation()}>
        <Switch
          size="sm"
          checked={enabled}
          disabled={!interactive}
          onChange={(next) => onToggle?.(channelKey, next)}
          label={`${label} 수신`}
        />
      </span>
    </li>
  );
}
