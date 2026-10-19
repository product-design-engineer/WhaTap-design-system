/**
 * ToolCallStep — Agent SDK 스타일의 단일 tool 호출 블록 (접기 헤더 + tool 이름 + 서술 본문).
 *
 * ## Purpose
 * AI 가 실행한 하나의 tool/function 호출을 사용자에게 보여주는 블록. 구성:
 *   1. 접기/펼치기 헤더 — `[N steps completed/running]` (`running` 중엔 spinner).
 *   2. `toolName` — 펼친 상태에서만 보이는 code 스타일 칩.
 *   3. `body` — 항상 표시되는 서술 텍스트(AI 가 사용자에게 설명하는 결과).
 * `defaultOpen` 으로 초기 펼침 여부, `delay` 로 등장 애니메이션 시점을 제어.
 *
 * ## When to use
 * - 실제 MCP/tool 호출 한 건을 이름 + 결과 서술과 함께 노출할 때.
 * - 에이전트 실행 로그를 메시지 스택 안에 한 블록으로 보여줄 때.
 *
 * ## When NOT to use
 * - tool 호출 없는 일반 추론 단계 → [[Reasoning]].
 * - 여러 step 의 진행 상태를 한 목록으로 → [[StepsTimeline]].
 * - 단순 서술 문단 → [[InsightSection]].
 *
 * ## Composition rules
 * - 카드 없는 단독 블록 — 외형 카드가 필요하면 [[AiCard]] 로 감싸 composition (자체 배경/테두리 추가 금지).
 * - `toolName` 은 code/mono 폰트 칩으로만, 본문과 시각적으로 구분.
 * - spinner·칩 색은 토큰(brand-blue, surface-50, border-default) 사용 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <ToolCallStep
 *   stepsCompleted={1}
 *   toolName="whatap_bulk_create_event_rule"
 *   body="먼저 올바른 디스크 사용량 필드를 확인하겠습니다."
 * />
 * ```
 */
import { useState } from "react";

export default function ToolCallStep({
  stepsCompleted,
  running = false,
  toolName,
  body,
  defaultOpen = true,
  delay = 0,
}: {
  /** 헤더 «N step(s) …» 의 단계 수 — 1이면 단수 «step». */
  stepsCompleted: number;
  /** true 면 헤더가 «running» + 회전 스피너, false 면 «completed» (기본 false). */
  running?: boolean;
  /** 펼쳤을 때 헤더 아래 고정폭 글꼴 칩으로 보이는 도구 이름 (예: `query_metrics`). 생략하면 칩 없음. */
  toolName?: string;
  /** 도구 결과를 풀어 쓴 본문 (13px, 줄바꿈 유지). 접힘과 무관하게 항상 보인다. */
  body?: string;
  /** 처음에 도구 이름 칩을 펼쳐 둘지 (기본 true). 이후 헤더 클릭으로 내부에서 접고 편다 — 비제어. */
  defaultOpen?: boolean;
  /** 진입 애니메이션 지연 (ms, 바깥 래퍼 `animationDelay`) — stagger 용. 기본 0. */
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="ai-anim-in flex flex-col gap-6px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-6px self-start cursor-pointer"
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
            className="size-12px rounded-full border-1_5px border-color-var-color-brand-blue border-t-transparent shrink-0"
            style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
          />
        )}
      </button>

      {open && toolName && (
        <code
          className="self-start text-base text-secondary bg-color-var-color-surface-50 border border-color-var-color-border-default rounded-4px px-8px py-3px"
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
