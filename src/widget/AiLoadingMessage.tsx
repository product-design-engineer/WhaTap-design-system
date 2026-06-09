/**
 * AI 위젯 — "데이터 수집 중" 등 로딩/진행 메시지 (Figma 27110:60783).
 *
 * 좌측 그라데이션 차트 아이콘 + 안내 텍스트. 보더는 var(--color-border-default), 라운드 8px,
 * 배경 흰색. 텍스트는 Noto Sans 13px 400 lineHeight 1.2 letterSpacing -0.1.
 */
export default function AiLoadingMessage({
  text = "분석에 필요한 데이터를 수집중입니다.",
}: {
  text?: string;
}) {
  return (
    <div
      className="flex items-center gap-[8px] w-full bg-white rounded-[8px] border border-[color:var(--color-border-default)] px-[12px] py-[10px]"
    >
      <LoadingIcon />
      <span
        className="text-md text-secondary tracking-default leading-tight"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {text}
      </span>
    </div>
  );
}

function LoadingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="ai-loading-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-whatap-blue)" />
          <stop offset="1" stopColor="var(--color-whatap-purple)" />
        </linearGradient>
      </defs>
      <path
        d="M2 2v11.5A0.5 0.5 0 0 0 2.5 14H14"
        stroke="url(#ai-loading-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11l2.5-3 2 2L13 5.5"
        stroke="url(#ai-loading-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
