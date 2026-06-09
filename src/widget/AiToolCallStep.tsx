/**
 * AiToolCallStep — Agent SDK 스타일의 단일 tool invocation block.
 *
 * 구조:
 *   [▾ N steps completed]              <- collapsible header (running 중에는 spinner)
 *   [tool_name (code style)]            <- 펼친 상태에서만 표시
 *   [본문 narration text]               <- AI 가 사용자에게 보여주는 결과 설명 (항상 표시)
 *
 * 예시:
 *   1 steps completed
 *   whatap_bulk_create_event_rule
 *   먼저 올바른 디스크 사용량 필드를 확인하겠습니다.
 *
 * 정책: feedback-widget-primitives — primitives 사용 (필요 시 AiCard 미사용 단독 블록)
 */
import { useState } from "react";

export default function AiToolCallStep({
  stepsCompleted,
  running = false,
  toolName,
  body,
  defaultOpen = true,
  delay = 0,
}: {
  stepsCompleted: number;
  running?: boolean;
  toolName?: string;
  body?: string;
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="ai-anim-in flex flex-col gap-[6px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-[6px] self-start cursor-pointer"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="var(--color-text-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="text-md text-secondary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {stepsCompleted} step{stepsCompleted !== 1 ? "s" : ""}{" "}
          {running ? "running" : "completed"}
        </span>
        {running && (
          <span
            className="size-[12px] rounded-full border-[1.5px] border-[color:var(--color-brand-blue)] border-t-transparent shrink-0"
            style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
          />
        )}
      </button>

      {open && toolName && (
        <code
          className="self-start text-base text-secondary bg-[color:var(--color-surface-50)] border border-[color:var(--color-border-default)] rounded-[4px] px-[8px] py-[3px]"
          style={{
            fontFamily:
              "'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace",
          }}
        >
          {toolName}
        </code>
      )}

      {body && (
        <p
          className="text-md text-primary tracking-default leading-loose whitespace-pre-wrap"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
