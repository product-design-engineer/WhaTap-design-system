/**
 * WhaTap AI 위젯 (480px 우측 패널).
 *
 * 마크업은 /application/slider 라이브 위젯과 동일. 데이터는 prop으로 외부화:
 *   - `user`         — 인사말 좌측에 굵게 표시되는 사용자 이름
 *   - `pageHighlight` — 인사말 본문 안에 굵게 표시되는 페이지 이름
 *   - `actions`      — 하단 액션 칩 버튼 라벨 배열
 *   - `open` · `onClose` · `onNewSession` · `onFullscreen` — 상태/콜백
 *
 * Side-effect-free: /application/slider의 원본 위젯은 그대로 두고 React 라우트
 * (e.g. /gpu)에서 동일 룩앤필을 재현. CSS는 라이브 번들에서 추출해 index.css에
 * 옮겨둔 클래스를 사용.
 */
import { useEffect, useRef, useState } from "react";
import AiClickCursor from "./widget/AiClickCursor";

const WIDGET_WIDTH = 480;

export type WidgetAction = string;

export default function WhaTapAiWidget({
  open,
  onClose,
  onNewSession,
  onFullscreen,
  user = "Wha-tap Kim",
  pageHighlight = "애플리케이션 대시보드",
  actions = ["현재 상태 요약", "이상 징후 진단", "슬로우 트랜잭션 분석"],
  messages,
  inputValue,
  showLanding = true,
  attachments,
  scrollSignal,
  showSendCursor = false,
  onSubmit,
  inputPlaceholder = "어떤 작업을 함께 할까요?",
  tokenInput = 3395,
  tokenOutput = 181,
}: {
  open: boolean;
  onClose?: () => void;
  onNewSession?: () => void;
  onFullscreen?: () => void;
  user?: string;
  pageHighlight?: string;
  actions?: WidgetAction[];
  /** 토큰 사용량 표시 (Figma 29424:19317) — 모델 선택기 대체 */
  tokenInput?: number;
  tokenOutput?: number;
  messages?: import("react").ReactNode;
  inputValue?: string;
  showLanding?: boolean;
  /** 입력 영역 위에 노출할 첨부 파일 칩들 (Figma 27087:3416). */
  attachments?: { name: string; mime?: string }[];
  /**
   * 값이 변할 때마다 콘텐츠 영역을 부드럽게 최하단으로 자동 스크롤.
   * 시나리오 stage 같은 progress signal을 그대로 전달하면 됨.
   */
  scrollSignal?: unknown;
  /** true면 송신 버튼 위에 자동 클릭 손 커서 표시(데모용). */
  showSendCursor?: boolean;
  /**
   * 사용자가 input 에 입력 후 Enter 또는 send 버튼 클릭 시 호출.
   * inputValue 가 undefined 일 때만 활성 (editable mode).
   */
  onSubmit?: (value: string) => void;
  /** 입력창 placeholder 문구. 시나리오별 시작 prompt 안내에 사용. */
  inputPlaceholder?: string;
}) {
  // editable mode: parent 가 inputValue 를 지정하지 않으면 사용자가 직접 입력.
  const editable = inputValue === undefined;
  const [typed, setTyped] = useState("");
  const effectiveValue = editable ? typed : inputValue ?? "";
  const hasInput = effectiveValue.trim().length > 0;

  const handleSubmit = () => {
    if (!hasInput || !onSubmit) return;
    onSubmit(effectiveValue);
    setTyped("");
  };
  const handleKey = (e: import("react").KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    // 다음 paint 시점에 스크롤(새로 추가된 콘텐츠 높이 반영 후).
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollSignal]);
  return (
    <div
      className="shrink-0 overflow-hidden relative"
      style={{
        width: open ? WIDGET_WIDTH : 0,
        transition: "width 0.4s ease-in-out",
      }}
    >
      {/* 좌측 리사이즈 핸들 */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center"
        style={{ width: 6, cursor: "col-resize" }}
      >
        <div
          className="rounded-full transition-colors duration-150"
          style={{ width: 3, height: 32, backgroundColor: "rgba(0,0,0,0.12)" }}
        />
      </div>

      <div
        className="flex flex-col h-full bg-white border-l border-[#eaeaea]"
        style={{ width: WIDGET_WIDTH }}
      >
        {/* 헤더 (40px, 그라데이션) */}
        <div
          className="flex h-[40px] items-center px-[16px] py-[8px] shrink-0 w-full relative overflow-visible z-10"
          style={{
            background:
              "linear-gradient(138.94deg, rgb(0, 75, 224) 2.33%, rgb(139, 82, 255) 107.07%)",
          }}
        >
          <div className="flex flex-1 items-center justify-between min-w-0">
            <div className="flex gap-[4px] items-center shrink-0">
              <img alt="" className="size-[16px]" src="/icons/ai-header-symbol.svg" />
              <span
                className="text-lg font-bold text-white tracking-default leading-px-20 whitespace-nowrap"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                WhaTap AI
              </span>
            </div>
            <div className="flex gap-[8px] items-center shrink-0">
              <button
                type="button"
                onClick={onNewSession}
                aria-label="새로운 세션 추가"
                className="shrink-0 size-[20px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img alt="새로운 세션추가" src="/icons/ai-header-plus.svg" style={{ height: 14 }} />
              </button>
              <button
                type="button"
                onClick={onFullscreen}
                aria-label="전체 크기"
                className="shrink-0 size-[20px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img
                  alt="전체 크기"
                  src="/icons/ai-header-fullscreen.svg"
                  style={{ width: 16, height: 16 }}
                />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="shrink-0 size-[20px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img alt="닫기" src="/icons/ai-header-close.svg" style={{ height: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {/* 본문 — 인사말 + 액션 칩 (showLanding=true일 때만). ref → scrollSignal 변경 시 자동 스크롤 */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 flex flex-col items-center gap-[16px] overflow-y-auto overflow-x-hidden w-full pt-[16px] pb-[8px] px-[16px]"
        >
          {showLanding && (
          // key={open}로 위젯을 열 때마다 인사말 영역이 remount되어 entrance animation 재생
          <div key={open ? "open" : "closed"} className="bg-white flex flex-col items-start justify-center relative w-full">
            {/* AI 심볼 (호흡 + 회전) — 진입 시 fade-in이 한 번 추가로 재생 */}
            <div className="ai-anim-in mb-[12px]" style={{ animationDelay: "0ms" }}>
              <div
                className="relative shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  animation:
                    "aiSymbolBreathing 3s ease-in-out infinite, aiSymbolRotateSlow 25s linear infinite",
                }}
              >
                <img alt="" className="w-full h-full" src="/icons/ai-symbol-gradient.svg" />
              </div>
            </div>

            <div className="flex flex-col gap-[16px] items-start w-full">
              <div className="flex flex-1 flex-col gap-[16px] items-start justify-center min-w-0">
                <p
                  className="ai-anim-in text-md text-primary tracking-default w-full whitespace-pre-wrap leading-normal"
                  style={{
                    fontFamily: "var(--font-family-korean)",
                    fontWeight: "var(--font-weight-regular)",
                    animationDelay: "150ms",
                  }}
                >
                  <span
                    className="font-bold text-lg tracking-default leading-none"
                    style={{ fontFamily: "var(--font-family-korean)" }}
                  >
                    {user}
                  </span>
                  <span className="text-md leading-normal whitespace-pre-wrap">
                    님, 안녕하세요. WhaTap AI입니다.{"\n"}
                  </span>
                  <span
                    className="font-bold text-lg tracking-default leading-none"
                    style={{ fontFamily: "var(--font-family-korean)" }}
                  >
                    {pageHighlight}
                  </span>
                  <span className="text-md leading-normal whitespace-pre-wrap">
                    {" "}분석을 함께 하겠습니다. 무엇부터 살펴볼까요?
                  </span>
                </p>

                {/* 액션 칩 */}
                <div className="flex flex-wrap gap-[6px] items-start w-full">
                  {actions.map((label, i) => (
                    <button
                      key={label}
                      className="ai-anim-in ai-landing-action border border-[#296cf2] flex h-[32px] items-center justify-center px-[16px] rounded-[4px] cursor-pointer text-brand-blue hover:bg-[#d6e1ff] hover:border-[#d6e1ff] relative overflow-hidden w-fit whitespace-nowrap text-md bg-white"
                      style={{
                        fontFamily: "var(--font-family-korean)",
                        fontWeight: "var(--font-weight-medium)",
                        // entrance: 400ms부터 칩마다 80ms 스태거로 페이드인
                        animationDelay: `${400 + i * 80}ms`,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 시나리오 메시지 스택 */}
          {messages && (
            <div className="flex flex-col gap-[16px] w-full">{messages}</div>
          )}
        </div>

        {/* Input 영역 */}
        <div className="flex flex-col items-center justify-center px-[16px] shrink-0 w-full">
          <div
            className="ai-input-wrapper relative bg-white flex flex-col gap-[4px] items-center justify-center p-[12px] shrink-0 rounded-[8px] transition-all duration-200 w-full"
            style={{ border: hasInput ? "2px solid #296CF2" : "2px solid #c2d5fc" }}
          >
            {/* 첨부 파일 칩 행 (Figma 27087:3416) */}
            {attachments && attachments.length > 0 && (
              <div className="flex gap-[6px] items-center w-full overflow-x-auto pb-[4px]">
                {attachments.map((a, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-[4px] bg-white border border-[#d3d3d3] rounded-[6px] px-[8px] py-[6px] shrink-0"
                    style={{ width: 100 }}
                  >
                    <p
                      className="text-base font-bold text-primary tracking-default leading-normal truncate"
                      style={{ fontFamily: "var(--font-family-korean)" }}
                      title={a.name}
                    >
                      {a.name}
                    </p>
                    <span
                      className="self-start text-xs text-tertiary bg-[rgba(0,0,0,0.05)] rounded-[3px] px-[4px] py-[1px] uppercase"
                      style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                    >
                      {a.mime ?? "CSV"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-0 items-center p-[2px] w-full">
              <textarea
                placeholder={inputPlaceholder}
                rows={1}
                value={effectiveValue}
                readOnly={!editable}
                onChange={editable ? (e) => setTyped(e.target.value) : undefined}
                onKeyDown={editable ? handleKey : undefined}
                className="ai-input-textarea w-full text-lg text-primary tracking-default leading-normal resize-none outline-none border-0 bg-transparent placeholder:text-disabled"
                style={{
                  fontFamily: "var(--font-family-korean)",
                  fontWeight: "var(--font-weight-regular)",
                  minHeight: 20,
                  maxHeight: 120,
                }}
              />
            </div>
            <div className="flex items-center justify-between p-0 w-full">
              <div className="flex gap-[8px] items-center shrink-0">
                <input
                  multiple
                  accept=".csv,.pdf,.txt,.json,.log,image/*"
                  type="file"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  aria-label="파일 또는 이미지 추가"
                  className="group/plus flex items-center justify-center p-[2px] rounded-[4px] shrink-0 size-[20px] cursor-pointer border-0 bg-white hover:bg-black transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-colors">
                    <line x1="8" y1="3.33" x2="8" y2="12.67" className="stroke-[#4c4c4c] group-hover/plus:stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3.33" y1="8" x2="12.67" y2="8" className="stroke-[#4c4c4c] group-hover/plus:stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {/* 토큰 입출력 정보 (Figma 29424:19317) — plus 버튼 옆 pill */}
                <TokenUsageBadge inputTokens={tokenInput} outputTokens={tokenOutput} />
              </div>
              <div className="flex gap-[8px] items-center shrink-0">
                {/* 전송 버튼 — input에 텍스트가 있으면 활성(blue) */}
                <div className="relative shrink-0">
                <button
                  type="button"
                  disabled={!hasInput}
                  onClick={handleSubmit}
                  className="ai-send-btn flex items-center justify-center rounded-[4px] shrink-0 size-[24px] cursor-pointer transition-colors disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: hasInput ? "#296CF2" : "#f5f5f5",
                    border: hasInput ? "1px solid #296CF2" : "1px solid #d3d3d3",
                  }}
                  aria-label="전송"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 12V4M8 4L4 8M8 4L12 8"
                      stroke={hasInput ? "#fff" : "#adadad"}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {showSendCursor && (
                  <AiClickCursor style={{ right: -18, top: 6 }} />
                )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-0 items-center justify-end px-0 py-[4px] shrink-0 w-full">
            <p
              className="text-base text-disabled tracking-normal leading-none whitespace-nowrap"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TokenUsageBadge — AI 입출력 토큰 사용량 pill (Figma 29424:19317).
 *
 * "토큰 입력 3,395 · 출력 181" 형태. bg #f5f5f5 / radius 24px / px 8 / py 4 / 10px text,
 * 숫자만 bold. 모델 선택기 (Claude Opus 4) 자리에 대체 표시.
 */
function TokenUsageBadge({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div
      className="inline-flex items-center px-[8px] py-[4px] rounded-[24px] shrink-0"
      style={{ backgroundColor: "#f5f5f5" }}
      data-node-id="29424:19317"
    >
      <span
        className="text-xs leading-none text-black whitespace-nowrap"
        style={{ fontFamily: "var(--font-family-korean-inter)", fontWeight: "var(--font-weight-regular)" }}
      >
        토큰 입력 <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(inputTokens)}</strong> · 출력{" "}
        <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(outputTokens)}</strong>
      </span>
    </div>
  );
}
