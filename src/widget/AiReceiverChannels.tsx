/**
 * AiReceiverChannels — 사용자별 알림 수신 채널 카드.
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
 * - 채널 단위가 아닌 일반 선택지 제시 → [[AiChoiceButtons]].
 *
 * ## Composition rules
 * - [[AiCard]] + [[AiSectionHeading]](📬) 프리미티브 조립 — 인라인 chrome 금지.
 * - 토글 핀 색은 tone 토큰(`TONE_DOT.low`) 사용, 인라인 hex 는 off 상태 트랙에만 한정.
 * - 토글은 visual mock — 실제 상태는 부모가 `enabled` 로 제어하고 `onToggle` 로 갱신.
 *
 * @example
 * ```tsx
 * <AiReceiverChannels
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
import { TONE_DOT, } from "./_tokens";

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

export default function AiReceiverChannels({
  caption = "알림 수신 채널",
  channels,
  onToggle,
  delay = 0,
}: {
  caption?: string;
  channels: ChannelState[];
  /** 토글 클릭. 미지정이면 행 클릭 비활성. */
  onToggle?: (key: ChannelKey, next: boolean) => void;
  delay?: number;
}) {
  return (
    <AiCard delay={delay}>
      <AiSectionHeading emoji="📬">{caption}</AiSectionHeading>

      <ul className="flex flex-col">
        {channels.map((c) => {
          const interactive = !!onToggle;
          return (
            <li
              key={c.key}
              className={`flex items-center gap-[10px] py-[6px] border-b border-[color:var(--color-surface-50)] last:border-b-0 ${
                interactive ? "cursor-pointer hover:bg-[#fafafa]" : ""
              }`}
              onClick={() => interactive && onToggle!(c.key, !c.enabled)}
            >
              {/* 이모지 아이콘 */}
              <span className="text-lg leading-none shrink-0 w-[20px] text-center">
                {CHANNEL_ICON[c.key]}
              </span>

              {/* 라벨 + 보조 정보 */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-[6px]">
                  <span
                    className="text-base font-bold text-primary tracking-default leading-normal"
                    style={{ fontFamily: "var(--font-family-korean)" }}
                  >
                    {c.label}
                  </span>
                  {c.paid && (
                    <span
                      className="text-chart px-[4px] py-[1px] rounded-[6px] tracking-default leading-none"
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
                {c.detail && (
                  <span
                    className="text-sm text-tertiary tracking-default leading-normal truncate"
                    style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                  >
                    {c.detail}
                  </span>
                )}
              </div>

              {/* 토글 핀 (mock — visual only) */}
              <span
                className="shrink-0 relative inline-block w-[28px] h-[16px] rounded-full transition-colors"
                style={{ background: c.enabled ? TONE_DOT.low : "#d4d6d8" }}
                aria-hidden
              >
                <span
                  className="absolute top-[2px] size-[12px] rounded-full bg-white transition-[left]"
                  style={{ left: c.enabled ? 14 : 2 }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </AiCard>
  );
}
