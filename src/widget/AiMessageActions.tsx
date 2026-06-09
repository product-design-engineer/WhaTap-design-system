/**
 * AI 위젯 — AI 응답 하단 피드백 액션 (Figma 27598:4604).
 *
 * 우측 정렬 3개 outline 아이콘: 👍 like / 👎 dislike / 📋 copy.
 * 사용자가 AI 응답에 대해 좋아요/싫어요/복사 동작을 할 수 있는 toolbar.
 *
 * 컬러 토큰: stroke var(--color-text-tertiary) (sementic_background_secondary), gap 8px (spacing_xs).
 * 상단에 var(--color-border-default) 1px divider (옵션) — 응답 카드와 시각적으로 분리.
 */
import { useState } from "react";

type Reaction = "like" | "dislike" | null;

export default function AiMessageActions({
  divider = false,
  onLike,
  onDislike,
  onCopy,
}: {
  /** 위쪽 var(--color-border-default) 디바이더 표시 여부 */
  divider?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
  onCopy?: () => void;
}) {
  const [reaction, setReaction] = useState<Reaction>(null);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    setReaction((r) => (r === "like" ? null : "like"));
    onLike?.();
  };
  const handleDislike = () => {
    setReaction((r) => (r === "dislike" ? null : "dislike"));
    onDislike?.();
  };
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
    onCopy?.();
  };

  return (
    <div
      className="flex items-center justify-end gap-[8px] w-full"
      style={{
        paddingTop: divider ? 8 : 0,
        borderTop: divider ? "1px solid var(--color-border-default)" : "none",
      }}
    >
      <ActionBtn ariaLabel="도움이 됐어요" active={reaction === "like"} onClick={handleLike}>
        <ThumbUpIcon filled={reaction === "like"} />
      </ActionBtn>
      <ActionBtn ariaLabel="도움이 되지 않았어요" active={reaction === "dislike"} onClick={handleDislike}>
        <ThumbDownIcon filled={reaction === "dislike"} />
      </ActionBtn>
      <ActionBtn ariaLabel={copied ? "복사 완료" : "복사"} active={copied} onClick={handleCopy}>
        {copied ? <CopiedCheckIcon /> : <CopyIcon />}
      </ActionBtn>
    </div>
  );
}

function ActionBtn({
  ariaLabel,
  active,
  onClick,
  children,
}: {
  ariaLabel: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex items-center justify-center size-[20px] rounded-[4px] cursor-pointer transition-colors"
      style={{
        background: active ? "rgba(41,108,242,0.08)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

/* ─── icons ─────────────────────────────────────────────── */
function ThumbUpIcon({ filled }: { filled?: boolean }) {
  const stroke = filled ? "var(--color-brand-blue)" : "var(--color-text-tertiary)";
  const fill = filled ? "var(--color-brand-blue)" : "none";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 14V7.5 M5.5 7.5l2.2-4.5a1 1 0 0 1 1.95.3v3.2H13a1 1 0 0 1 1 1.2l-1 5a1 1 0 0 1-1 .8H5.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
      <path
        d="M2.5 7.5h3V14h-3a.5.5 0 0 1-.5-.5v-5.5a.5.5 0 0 1 .5-.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
    </svg>
  );
}
function ThumbDownIcon({ filled }: { filled?: boolean }) {
  const stroke = filled ? "var(--color-indicator-critical)" : "var(--color-text-tertiary)";
  const fill = filled ? "var(--color-indicator-critical)" : "none";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 2v6.5 M10.5 8.5l-2.2 4.5a1 1 0 0 1-1.95-.3V9.5H3a1 1 0 0 1-1-1.2l1-5a1 1 0 0 1 1-.8h6.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
      <path
        d="M13.5 8.5h-3V2h3a.5.5 0 0 1 .5.5v5.5a.5.5 0 0 1-.5.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.2" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <path d="M5.5 1.5h7c.55 0 1 .45 1 1v7" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function CopiedCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7l3 3 6-6.5"
        stroke="var(--color-status-success)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
