/**
 * AiPromptInput — 사용자 자연어 입력 영역 (위젯 인풋 chrome 통째).
 *
 * Figma: 27087:3416 (Common 파일).
 *
 * ## Purpose
 * `WhaTapAiWidget` 의 텍스트 입력 + 첨부 chip + 토큰 pill + 송신 버튼 + 하단 caption 을 묶은 단일
 * 단위. 위젯이 호출처별로 다른 입력 chrome 을 가져선 안 되며, 다른 페이지·시나리오 (검색 prompt /
 * 명령창 등) 에서 같은 입력 UX 가 필요하면 본 컴포넌트를 그대로 import.
 *
 * ## Composition (Figma 27087:3416 verbatim)
 * ```
 * ┌─ ai-input-wrapper (2px border, conditional var(--color-brand-blue-bg-2) / var(--color-brand-blue)) ─┐
 * │ [첨부 chips 행 — attachments prop 있을 때만]                    │
 * │                                                                  │
 * │ <textarea>  placeholder 또는 입력 텍스트                         │
 * │                                                                  │
 * │ [+ attach] [토큰 입력 N · 출력 M]              [⬆ AiSendButton] │
 * └────────────────────────────────────────────────────────────────┘
 * AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.  ← 하단 caption
 * ```
 *
 * ## When to use
 * - `WhaTapAiWidget` 내부 입력 영역 (현재 인라인 마크업의 추출 대상).
 * - 외부에서 AI 자연어 입력 UX 가 필요한 경우 (예: 인라인 검색 prompt, fullscreen 명령창).
 *
 * ## When NOT to use
 * - 일반 form text input → 표준 `<input>` 또는 `<textarea>` 사용.
 * - 한 줄 검색창 → 별도 search input (multi-line, 첨부, 토큰 pill 불필요).
 *
 * ## Controlled vs Editable mode
 * - `value` 가 정의되면 controlled (parent 가 텍스트 통제) — onChange 필수.
 * - `value` 가 `undefined` 면 editable mode (내부 typed state).
 * - 시연 시나리오에서 placeholder 만 보여주려면 controlled 로 빈 문자열 고정 + readOnly 효과.
 *
 * ## Composition rules
 * - 토큰 pill (`tokenInput` / `tokenOutput`) 는 [[TokenUsageBadge]] (Figma 29424:19317) — pill 형 inline.
 * - 송신 버튼은 [[AiSendButton]] (24×24 squared) — input 텍스트 있으면 활성 자동 전환.
 * - 첨부 chip 행은 `attachments` prop 있을 때만 노출. mime 미지정 시 "CSV" 로 fallback.
 * - 캡션 "AI 응답은 정확하지 않을 수 있습니다…" 는 prototype 전역 정책 — 임의로 제거하지 말 것.
 *
 * @example
 * ```tsx
 * const [text, setText] = useState("");
 * <AiPromptInput
 *   value={text}
 *   onChange={setText}
 *   onSubmit={(v) => sendToAi(v)}
 *   placeholder="어떤 작업을 함께 할까요?"
 *   tokenInput={3395}
 *   tokenOutput={181}
 * />
 * ```
 */
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import AiSendButton from "./SendButton";

export type AiPromptAttachment = {
  /** 파일 이름 (truncate 처리됨). */
  name: string;
  /** MIME 타입 라벨 (미지정 시 "CSV" 표시). */
  mime?: string;
};

export type AiPromptInputProps = {
  /** Controlled value. undefined → editable mode (내부 state). */
  value?: string;
  /** value 변경 콜백 — controlled mode 에서 필수. */
  onChange?: (v: string) => void;
  /** Enter 또는 송신 버튼 클릭 시 호출. value.trim() 비어있으면 호출 안 됨. */
  onSubmit?: (v: string) => void;
  /** placeholder 문구. 기본 "어떤 작업을 함께 할까요?". */
  placeholder?: string;
  /** 입력 영역 위에 노출할 첨부 chip. */
  attachments?: AiPromptAttachment[];
  /**
   * 입력창 왼쪽 알약 자리의 내용. 주면 토큰 배지 대신 이것이 선다.
   * 껍데기(회색 알약)는 여기서 그린다 — 호출측은 그 안의 글자만 정한다.
   */
  usagePill?: ReactNode;
  /** 토큰 입력 카운트 (Figma 29424:19317 pill). */
  tokenInput?: number;
  /** 토큰 출력 카운트. */
  tokenOutput?: number;
  /** 송신 버튼 위에 시연용 자동 클릭 ripple 표시. */
  showSendCursor?: boolean;
  /** 송신 버튼 클릭에 사용자 정의 핸들러 (시연용 onClick 직접 트리거). 없으면 textarea value 로 onSubmit. */
  onSendClick?: () => void;
  /** 하단 caption 텍스트. 정책상 default 유지 권장. */
  caption?: ReactNode;
  /** 첨부 추가 버튼 클릭 핸들러. */
  onAttachClick?: () => void;
  /** disabled — 전체 입력 차단 (AI 응답 진행 중 등). */
  disabled?: boolean;
  /**
   * Inline suggestion (ghost text). 입력이 비어 있을 때 흐린 글자로 추천 문구를 보여 준다.
   * 사용자가 **End · Tab · →(오른쪽 화살표)** 키를 누르면 추천 문구가 실제 입력값으로 채워진다.
   * placeholder 와 동시에 주면 suggestion 이 우선한다.
   */
  suggestion?: string;
  /** suggestion 을 수락했을 때 호출. 수락된 문자열이 인자로 들어온다. */
  onSuggestionAccept?: (v: string) => void;
};

const DEFAULT_CAPTION = "AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.";

export default function AiPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "어떤 작업을 함께 할까요?",
  attachments,
  usagePill,
  tokenInput = 3395,
  tokenOutput = 181,
  showSendCursor = false,
  onSendClick,
  caption = DEFAULT_CAPTION,
  onAttachClick,
  disabled = false,
  suggestion,
  onSuggestionAccept,
}: AiPromptInputProps) {
  const editable = value === undefined;
  const [typed, setTyped] = useState("");
  const effectiveValue = editable ? typed : value;
  const hasInput = effectiveValue.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** suggestion 이 보이는 조건: 입력이 비어 있고 suggestion 문자열이 있을 때. */
  const showSuggestion = !hasInput && !!suggestion;

  const acceptSuggestion = () => {
    if (!suggestion) return;
    if (editable) {
      setTyped(suggestion);
    } else if (onChange) {
      onChange(suggestion);
    }
    onSuggestionAccept?.(suggestion);
    /* 수락 직후 커서를 끝으로 보낸다. */
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.selectionStart = ta.selectionEnd = suggestion.length;
        ta.focus();
      }
    });
  };

  const submit = () => {
    if (!hasInput || disabled) return;
    if (onSendClick) {
      onSendClick();
    } else if (onSubmit) {
      onSubmit(effectiveValue);
      if (editable) setTyped("");
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    /* suggestion 수락: End · Tab · → (입력이 비어 있을 때) */
    if (showSuggestion && (e.key === "End" || e.key === "Tab" || e.key === "ArrowRight")) {
      e.preventDefault();
      acceptSuggestion();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  /* Glow 속도 — 폭이 넓을수록 느리게. 400px 기준 5s, 800px 기준 10s. */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [glowDuration, setGlowDuration] = useState(5);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const dur = Math.max(3, Math.min(10, (w / 400) * 5));
      setGlowDuration(dur);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const glowStyle = { animationDuration: `${glowDuration}s` };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Glow 래퍼 — 항상 2px padding 을 유지해서 레이아웃이 밀리지 않는다.
          입력 중일 때만 glow 클래스가 붙어 그라데이션이 보인다. 롤백은 클래스 제거. */}
      <div
        ref={wrapRef}
        className={`w-full rounded-10px p-2px${hasInput ? " ai-input-glow-wrap" : ""}`}
        style={{ position: "relative", background: hasInput ? "transparent" : "var(--color-brand-blue-bg-2)" }}
      >
        {hasInput && (
          <>
            <div className="ai-input-glow-spread" style={glowStyle} />
            <div className="ai-input-glow-line" style={glowStyle} />
            <div className="ai-input-glow-blur" style={glowStyle} />
          </>
        )}
        <div
          className="ai-input-wrapper relative bg-card flex flex-col gap-4px items-center justify-center p-12px shrink-0 rounded-8px transition-all duration-200 w-full"
      >
        {/* 첨부 chip 행 — Figma 27087:3416 */}
        {attachments && attachments.length > 0 && (
          <div className="flex gap-6px items-center w-full overflow-x-auto pb-4px">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="flex flex-col gap-4px bg-card border border-strong rounded-6px px-8px py-6px shrink-0"
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
                  className="self-start text-xs text-tertiary bg-surface-100 rounded-3px px-4px py-1px uppercase"
                  style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                >
                  {a.mime ?? "CSV"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* textarea + ghost suggestion overlay */}
        <div className="flex gap-0 items-center p-2px w-full" style={{ position: "relative" }}>
          {/* ghost text — suggestion 이 있고 입력이 비어 있을 때만 보인다. */}
          {showSuggestion && (
            <div
              aria-hidden
              className="ai-input-textarea w-full text-lg tracking-default leading-normal pointer-events-none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                padding: "2px",
                fontFamily: "var(--font-family-korean)",
                fontWeight: "var(--font-weight-regular)",
                color: "var(--color-text-disabled)",
                whiteSpace: "pre-wrap",
                minHeight: 20,
              }}
            >
              {suggestion}
            </div>
          )}
          <textarea
            ref={textareaRef}
            placeholder={showSuggestion ? undefined : placeholder}
            rows={1}
            value={effectiveValue}
            readOnly={!editable}
            disabled={disabled}
            onChange={
              editable
                ? (e) => setTyped(e.target.value)
                : onChange
                  ? (e) => onChange(e.target.value)
                  : undefined
            }
            onKeyDown={editable || onChange ? handleKey : undefined}
            className="ai-input-textarea w-full text-lg text-primary tracking-default leading-normal resize-none outline-none border-0 bg-transparent placeholder-text-disabled"
            style={{
              position: "relative",
              fontFamily: "var(--font-family-korean)",
              fontWeight: "var(--font-weight-regular)",
              minHeight: 20,
              maxHeight: 120,
              background: "transparent",
            }}
          />
        </div>

        {/* 하단 row: [+ attach] [token pill] ... [send button] */}
        <div className="flex items-center justify-between p-0 w-full">
          <div className="flex gap-8px items-center shrink-0">
            <button
              type="button"
              aria-label="파일 또는 이미지 추가"
              onClick={onAttachClick}
              disabled={disabled}
              className="group-plus flex items-center justify-center p-2px rounded-4px shrink-0 size-20px cursor-pointer border-0 bg-card hover-bg-invert transition-colors disabled-opacity-50 disabled-cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-colors">
                <line x1="8" y1="3.33" x2="8" y2="12.67" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-invert" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3.33" y1="8" x2="12.67" y2="8" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-invert" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {usagePill !== undefined && usagePill !== null ? (
              <UsagePill>{usagePill}</UsagePill>
            ) : (
              <TokenUsageBadge inputTokens={tokenInput} outputTokens={tokenOutput} />
            )}
          </div>
          <div className="flex gap-8px items-center shrink-0">
            <AiSendButton
              active={hasInput && !disabled}
              onClick={submit}
              showCursor={showSendCursor}
            />
          </div>
        </div>
      </div>
      </div>

      {/* 하단 caption */}
      {caption && (
        <div className="flex gap-0 items-center justify-end px-0 py-4px shrink-0 w-full">
          <p
            className="text-base text-disabled tracking-normal leading-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
          >
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * UsagePill — 입력창 옆 알약 한 칸. 내용은 호출측이 정한다(`usagePill`).
 *
 * 껍데기를 DS 가 그리는 이유 — 호출측이 배경까지 칠하면 알약이 두 겹으로 보인다.
 */
function UsagePill({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-flex items-center px-8px py-4px rounded-24px shrink-0"
      style={{ backgroundColor: "var(--color-surface-50)" }}
      data-node-id="29424:19317"
    >
      <span
        className="text-xs leading-none text-primary whitespace-nowrap"
        style={{ fontFamily: "Inter, 'Noto Sans KR', sans-serif", fontWeight: "var(--font-weight-regular)" }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * TokenUsageBadge — AI 입출력 토큰 사용량 pill (Figma 29424:19317).
 *
 * "토큰 입력 N · 출력 M" 형태. bg var(--color-surface-50) / radius 24px / px 8 / py 4 / 10px text, 숫자 bold.
 * AiPromptInput 의 내부 sub-component.
 */
function TokenUsageBadge({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div
      className="inline-flex items-center px-8px py-4px rounded-24px shrink-0"
      style={{ backgroundColor: "var(--color-surface-50)" }}
      data-node-id="29424:19317"
    >
      <span
        className="text-xs leading-none text-primary whitespace-nowrap"
        style={{ fontFamily: "Inter, 'Noto Sans KR', sans-serif", fontWeight: "var(--font-weight-regular)" }}
      >
        토큰 입력 <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(inputTokens)}</strong>
        {" · 출력 "}
        <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(outputTokens)}</strong>
      </span>
    </div>
  );
}
