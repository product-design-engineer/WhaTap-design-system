/**
 * ThreadDivider — 대화 스레드 안에서 «여기부터 조건이 바뀌었다» 를 가르는 가운데 글자 구분선.
 *
 * ## Purpose
 * AI 대화 스레드의 경계 한 줄. 양옆 1px 선 사이에 짧은 글자를 둔다(예: 「여기부터 SRE 플랜」).
 * 선 위의 답과 아래의 답이 다른 조건(재원 · 대상 · 세션)에서 나갔다는 사실을 스레드에 남긴다.
 * 토스트처럼 사라지지 않으므로 나중에 스레드를 훑을 때도 답이 된다.
 *
 * ## When to use
 * - 대화 도중 재원(플랜) · 대상 프로젝트 같은 조건을 바꾼 순간, 그 자리에 한 줄.
 * - 스레드 안에서 앞뒤 답의 맥락이 갈리는 경계를 표시할 때.
 *
 * ## When NOT to use
 * - 답 하나의 끝맺음 선 → [[MessageActions]] 의 `divider`.
 * - 바뀐 사실의 설명 · 해야 할 일 → 카드(`AiCard`)나 [[UnavailableNotice]]. 구분선에 문장을 늘리지 말 것.
 * - 일시 확인(저장됨 · 복사됨) → Toast. 스레드에 남길 사실이 아니다.
 * - 카드 · 패널 안의 구획 → 테두리나 간격으로 가른다. 대화 스레드 밖에 쓰지 말 것.
 *
 * ## Composition rules
 * - 선은 `--color-border-default` 1px, 글자는 `text-base` · `text-tertiary`. 색 · 굵기를 호출부에서 바꾸지 말 것.
 * - 글자는 한 줄(`nowrap`)로 짧게 둔다. 「여기부터 ○○」 처럼 경계의 사실만 적는다.
 * - 스레드 메시지 스택의 자식으로 두고, 바뀐 순간의 위치(마지막 답 다음)에 끼운다. 맨 위에 모아 두지 말 것.
 * - 접근성: `role="separator"` 와 `aria-label`(글자와 같은 문장)을 갖는다.
 *
 * @example
 * ```tsx
 * <ThreadDivider>여기부터 SRE 플랜</ThreadDivider>
 * ```
 */
import type { ReactNode } from "react";

export type ThreadDividerProps = {
  /** 선 가운데 글자. 비우면 선만 선다. */
  children?: ReactNode;
  /** 스크린리더용 문장. 글자가 문자열이면 생략해도 그 글자를 쓴다. */
  label?: string;
  className?: string;
};

export default function ThreadDivider({ children, label, className }: ThreadDividerProps) {
  const aria = label ?? (typeof children === "string" ? children : undefined);
  const line = <span className="flex-1 h-1px" style={{ background: "var(--color-border-default)" }} />;
  return (
    <div role="separator" aria-label={aria} className={`flex items-center gap-8px w-full ${className ?? ""}`}>
      {line}
      {children != null && children !== "" && (
        <>
          <span
            className="text-base text-tertiary tracking-default whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {children}
          </span>
          {line}
        </>
      )}
    </div>
  );
}
