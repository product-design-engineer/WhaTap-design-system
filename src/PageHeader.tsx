/**
 * 48px 페이지 헤더 (좌: 타이틀 + WhaTap AI + Docs / 우: 고객지원 + 알림 + 아바타).
 *
 * 공통 정책(feedback-page-header-invariant): WhaTap AI 위젯 토글과 무관하게
 * 항상 동일한 레이아웃·동일한 가시 요소·동일한 크기로 렌더링됩니다. 어떤
 * 호출처도 이 컴포넌트의 내부 항목을 숨기거나 줄일 수 없습니다(prop으로
 * 제거 API를 의도적으로 제공하지 않음).
 *
 * WhaTap AI 토글 버튼은 [[AiAssistantButton]] 컴포넌트 — 인라인 마크업 → 토큰 binding 컴포넌트로 dogfooding.
 *
 * 가변 데이터:
 *   - `title`        — "K8s-GPU / GPU 트렌드"와 같은 페이지 제목
 *   - `aiActive`     — WhaTap AI 버튼의 active 상태
 *   - `onAiToggle`   — 버튼 클릭 핸들러
 */
import AiAssistantButton from "./widget/AiAssistantButton";

export default function PageHeader({
  title,
  aiActive = false,
  onAiToggle,
}: {
  title: string;
  aiActive?: boolean;
  onAiToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between h-[48px] box-border px-[8px] bg-white border-b border-[#e6e6e6] shrink-0">
      {/* 좌측: 타이틀 + AI/Docs */}
      <div className="flex items-center gap-[24px] shrink-0">
        <p
          className="text-2xl text-primary tracking-display whitespace-nowrap leading-normal"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {title}
        </p>
        <div className="flex items-center gap-[8px]">
          <AiAssistantButton aiActive={aiActive} onClick={onAiToggle} />
          <button
            className="flex items-center justify-center gap-[4px] h-[32px] px-[16px] py-[8px] rounded-full border border-[#adadad] bg-white text-md text-primary tracking-default cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M4 2H9.5L12 4.5V13C12 13.55 11.55 14 11 14H4C3.45 14 3 13.55 3 13V3C3 2.45 3.45 2 4 2Z" stroke="#4c4c4c" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M9.5 2V5H12" stroke="#4c4c4c" strokeWidth="1.2" strokeLinejoin="round" />
              <line x1="5" y1="7.5" x2="11" y2="7.5" stroke="#4c4c4c" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="9.5" x2="11" y2="9.5" stroke="#4c4c4c" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="11.5" x2="9" y2="11.5" stroke="#4c4c4c" strokeWidth="1" strokeLinecap="round" />
            </svg>
            Docs
          </button>
        </div>
      </div>

      {/* 우측: 고객지원 + 알림 + 아바타 */}
      <div className="flex items-center gap-[16px] h-full shrink-0">
        <button
          className="flex items-center justify-center gap-[4px] h-[32px] px-[16px] py-[8px] rounded-full border border-[#adadad] bg-white text-md text-primary tracking-default cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="6" stroke="#4c4c4c" strokeWidth="1.2" />
            <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8 7.5 8 8.5" stroke="#4c4c4c" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="10.5" r="0.75" fill="#4c4c4c" />
          </svg>
          고객지원
        </button>
        <div className="flex items-center gap-[16px]">
          <div className="shrink-0 size-[24px] flex items-center justify-center cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10V14L20 16V17H4V16L6 14V10Z"
                stroke="#4c4c4c"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M10 19.5C10 20.6 10.9 21.5 12 21.5C13.1 21.5 14 20.6 14 19.5"
                stroke="#4c4c4c"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="shrink-0 size-[24px] cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="avatar-grad" x1="0" y1="0" x2="24" y2="24">
                  <stop stopColor="#4fc3f7" />
                  <stop offset="1" stopColor="#296cf2" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="12" fill="url(#avatar-grad)" />
              <text
                x="12"
                y="17"
                textAnchor="middle"
                fontSize="13px"
                fontWeight="700"
                fill="#fff"
                fontFamily="Roboto, sans-serif"
              >
                S
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
