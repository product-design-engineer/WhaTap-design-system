import { AiCard } from "./_primitives";

/**
 * AnswerSkeleton — AI 답변 카드가 도착하기 전의 자리표시자(스켈레톤).
 *
 * ## Purpose
 * 헬스체크 원인 진단처럼 **데이터 수집 + 집계(산수)** 를 거쳐야 답이 나오는 응답은
 * 체감 대기가 길다(Argus 실측 TTFT 평균 3.99초·최대 21초). 빈 화면을 두면 "안 눌렸나"로
 * 읽히므로, 도착할 답변과 **같은 골격**의 회색 블록을 먼저 깔고 shimmer 로 진행을 알린다.
 *
 * ## When to use
 * - [[AiCard]] 기반 답변(제목 + 리드 + 불릿 + 근거)이 곧 그 자리에 렌더될 때.
 * - 응답 시간이 1초를 넘길 수 있는 모든 분석·진단 응답.
 *
 * ## When NOT to use
 * - **무엇을 하는 중인지 문장으로 알려야 할 때** → [[LoadingMessage]] (한 줄 안내).
 *   둘은 같이 쓸 수 있다 — 안내 줄 아래에 스켈레톤 카드.
 * - 단계별 도구 호출 진행 표시 → [[StepsTimeline]].
 * - 10초 넘는 단계 연산의 진행 자체 → [[AiProgress]]. 이 컴포넌트는 그 아래에서 «무엇이 올지» 만 보인다.
 * - 즉시(<300ms) 렌더되는 정적 카드 — 깜빡임만 만든다.
 *
 * ## Composition rules
 * - 블록 개수·너비는 **실제 답변의 골격을 따라간다** — 도착 시 레이아웃이 튀지 않아야 한다.
 *   기본값은 제목 1 + 리드 2줄 + 불릿 `bullets`개 + 근거 1줄.
 * - shimmer 는 `.ai-skeleton` 클래스(토큰 CSS) — 컴포넌트에서 색을 직접 칠하지 않는다.
 * - `prefers-reduced-motion` 이면 shimmer 가 자동으로 꺼진다(토큰 CSS 에서 처리).
 * - [[AiProgress]] 와 함께 깔면 `still` 로 shimmer 를 끈다. 진행 카드가 떠 있는 동안 움직이는 곳은
 *   그 머리 그림 하나다. 이때 자리 표시는 마지막 단계(작성)에서만 깐다.
 *
 * @example
 * ```tsx
 * {loading ? <AnswerSkeleton bullets={4} /> : <AiEntryMessages ... />}
 * ```
 */
export default function AnswerSkeleton({
  bullets = 3,
  /** 카드 등장 지연 — 여러 카드를 stagger 로 깔 때 사용. */
  delay = 0,
  /** 상단 caption(예: "원인 진단") 자리 표시 여부. */
  caption = true,
  /** true 면 shimmer 를 끈다. [[AiProgress]] 와 함께 쓸 때(움직이는 곳은 하나). */
  still = false,
}: {
  bullets?: number;
  delay?: number;
  caption?: boolean;
  still?: boolean;
}) {
  return (
    <AiCard delay={delay}>
      <div className="flex flex-col gap-8px w-full" aria-busy="true" aria-live="polite">
        {caption && <Bar w="64px" h={10} still={still} />}

        {/* 제목 줄 — 이모지 자리 + 헤딩 */}
        <div className="flex items-center gap-6px">
          <Bar w="18px" h={16} still={still} />
          <Bar w="38%" h={16} still={still} />
        </div>

        {/* 리드 2줄 */}
        <div className="flex flex-col gap-4px">
          <Bar w="100%" h={13} still={still} />
          <Bar w="82%" h={13} still={still} />
        </div>

        {/* 불릿 — 실제 답변의 불릿 수만큼 */}
        <div className="flex flex-col gap-6px pl-12px">
          {Array.from({ length: bullets }).map((_, i) => (
            <Bar key={i} w={`${92 - i * 7}%`} h={11} still={still} />
          ))}
        </div>

        {/* 근거 줄 */}
        <Bar w="70%" h={11} still={still} />
      </div>
    </AiCard>
  );
}

function Bar({ w, h, still }: { w: string; h: number; still?: boolean }) {
  return <div className="ai-skeleton" data-still={still ? "" : undefined} style={{ width: w, height: h }} />;
}
