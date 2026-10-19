/**
 * ReceiverChannels — 사용자별 알림 수신 채널 카드.
 *
 * ## Purpose
 * 현재 켜진/꺼진 알림 수신 채널(✉️ 이메일 · 💬 SMS · 📞 WhatsApp · 📱 모바일)을 한 카드에
 * 요약해 보여주고, 위젯에서 "지금 이메일만 켜져있어요, 모바일도 켤까요?" 같은 채널 권유 흐름을
 * 돕습니다. 각 행은 라벨 + 보조 정보(주소/번호) + 유료 배지 + 토글 핀으로 구성됩니다.
 *
 * ## When to use
 * - 알림 채널 현황을 보여주고 켜기/끄기 권유를 곁들이는 안내 카드.
 * - 채널 토글까지만 가볍게 처리하는 흐름 (`onToggle` 미지정 시 read-only 현황 표시).
 *
 * ## When NOT to use
 * - 요일×시간, 이벤트 수신 태그, 3rd-party 연동 등 **정밀 설정** → 레거시 알림 설정 페이지에 위임.
 * - 채널 단위가 아닌 일반 선택지 제시 → [[ChoiceButtons]].
 *
 * ## Composition rules
 * - [[AiCard]] + [[AiSectionHeading]](📬) 프리미티브 조립 — 인라인 chrome 금지.
 * - 토글 핀 색은 tone 토큰(`TONE_DOT.low`) 사용, 인라인 hex 는 off 상태 트랙에만 한정.
 * - 토글은 visual mock — 실제 상태는 부모가 `enabled` 로 제어하고 `onToggle` 로 갱신.
 *
 * @example
 * ```tsx
 * <ReceiverChannels
 *   channels={[
 *     { key: "email", label: "이메일", detail: "kyungho.oh@whatap.io", enabled: true },
 *     { key: "mobile", label: "모바일", enabled: false },
 *     { key: "sms", label: "SMS", enabled: false, paid: true },
 *   ]}
 *   onToggle={(key, next) => setChannel(key, next)}
 * />
 * ```
 */
import { AiCard, AiSectionHeading } from "./_primitives";
import ReceiverChannelItem from "./ReceiverChannelItem";

export type ChannelKey = "email" | "sms" | "whatsapp" | "mobile";

export type ChannelState = {
  key: ChannelKey;
  label: string;
  /** 표시할 보조 정보. 예: "kyungho.oh@whatap.io", "010-****-1234" */
  detail?: string;
  enabled: boolean;
  /** 유료 프로젝트 전용 채널 표시 (SMS / WhatsApp) */
  paid?: boolean;
};

const CHANNEL_ICON: Record<ChannelKey, string> = {
  email: "✉️",
  sms: "💬",
  whatsapp: "📞",
  mobile: "📱",
};

export default function ReceiverChannels({
  caption = "알림 수신 채널",
  channels,
  onToggle,
  delay = 0,
}: {
  /** 카드 📬 헤딩 텍스트 (기본 «알림 수신 채널»). */
  caption?: string;
  /** 수신 채널 한 개 = 한 행 (`key` · `label` · `detail` · `enabled` · `paid`). 행마다 [[ReceiverChannelItem]] 로 그리고 `key` 가 아이콘을 정한다. 켜짐 상태는 이 배열이 정본이다. */
  channels: ChannelState[];
  /** 토글 클릭. 미지정이면 행 클릭 비활성. */
  onToggle?: (key: ChannelKey, next: boolean) => void;
  /** [[AiCard]] 진입 애니메이션 지연 (ms) — 여러 카드를 차례로 띄우는 stagger 용. 기본 0. */
  delay?: number;
}) {
  return (
    <AiCard delay={delay}>
      <AiSectionHeading emoji="📬">{caption}</AiSectionHeading>

      <ul className="flex flex-col">
        {channels.map((c) => (
          <ReceiverChannelItem
            key={c.key}
            channelKey={c.key}
            icon={CHANNEL_ICON[c.key]}
            label={c.label}
            detail={c.detail}
            paid={c.paid}
            enabled={c.enabled}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </AiCard>
  );
}
