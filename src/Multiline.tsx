/**
 * Multiline — 문자열 안의 줄바꿈(`\n`)을 `<br>` 로 그린다.
 *
 * ## Purpose
 * 데이터에서 온 문구가 줄바꿈을 품고 있을 때, 그것을 화면에서도 줄바꿈으로 보이게 한다.
 * 문자열을 그대로 렌더하면 `white-space` 가 `pre-wrap` 인 곳에서만 줄이 바뀌고
 * 그렇지 않은 곳에서는 공백으로 뭉개진다. 이 부품은 그 차이를 없앤다.
 *
 * ## When to use
 * - 문구를 데이터로 들고 있는 화면(마케팅 페이지·공지·배너)의 제목과 본문
 * - 원본 HTML 의 `<br>` 을 `\n` 으로 추출해 온 문자열
 *
 * ## When NOT to use
 * - 문단이 여럿인 긴 본문 → `<p>` 를 여러 개 쓴다
 * - 서식(굵게·링크)이 섞인 문자열 → 리치텍스트 렌더러를 쓴다. 이 부품은 텍스트만 다룬다
 * - 줄바꿈을 CSS 로 제어할 수 있는 곳 → `white-space: pre-wrap` 이 더 싸다
 *
 * ## Composition rules
 * - 감싸는 요소를 만들지 않는다(Fragment). 여백·정렬·글꼴은 부모가 정한다.
 * - `children` 이 비었거나 `null` 이면 아무것도 그리지 않는다 — 빈 껍데기가 여백을 만들지 않게.
 * - 텍스트만 받는다. ReactNode 를 받지 않는 것은 의도다.
 *
 * @example
 * ```tsx
 * <h2 className="heading-2"><Multiline>{page.heading}</Multiline></h2>
 * ```
 */
export default function Multiline({ children }: {
  /** 줄바꿈(`\n`)이 든 평문. 줄마다 `<br />` 로 끊어 그린다. 비거나 null 이면 아무것도 그리지 않는다. */
  children: string | null | undefined;
}) {
  if (!children) return null;
  return (
    <>
      {children.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}
