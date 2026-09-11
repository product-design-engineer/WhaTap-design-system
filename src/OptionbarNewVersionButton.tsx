/**
 * OptionbarNewVersionButton — Chrome / Foundation. [[OptionbarPage]] 의 "신규 버전" 링크 버튼.
 *
 * ## Purpose
 * 옵션바 우측의 "신규 버전" CTA 버튼을 렌더. 그라데이션 sparkle 아이콘 + 라벨 + chevron-right.
 * 32px height · brand-blue 테두리 · hover 시 brand-blue-bg 배경 전환.
 *
 * ## When to use
 * - [[OptionbarPage]] 우측 정렬 그룹에서 렌더하는 **기본 용법**.
 * - 옵션바 밖에서 **동일한 신규 버전 CTA 외형**이 필요한 경우.
 *
 * ## When NOT to use
 * - **일반 액션 버튼** → [[Button]] (variant/tone 체계).
 * - **AI 진입 버튼** → [[AiAssistantButton]] / [[AiInlinePrompt]].
 * - **텍스트 링크** — 이 컴포넌트는 버튼형 CTA 전용.
 *
 * ## Composition rules
 * - 높이 32px — 옵션바 baseline 통일.
 * - 색은 토큰 (`--color-brand-blue` 테두리/아이콘, `--color-brand-blue-bg` hover 배경) — 인라인 hex 금지.
 * - `href` 로 `<a>` 감싸 — 네비게이션 목적. `<button>` 은 시각 외형 담당.
 * - sparkle SVG 는 brand-blue fill, chevron 은 text-tertiary stroke.
 *
 * @example
 * ```tsx
 * <OptionbarNewVersionButton href="/new-version" label="신규 버전" />
 * ```
 */
export default function OptionbarNewVersionButton({
  href = "#",
  label = "신규 버전",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <a href={href}>
      <button
        type="button"
        className="flex items-center justify-center gap-6px h-32px w-full px-12px rounded-4px bg-card border border-color-var-color-brand-blue text-md text-brand-blue cursor-pointer hover-bg-color-var-color-brand-blue-bg transition-colors"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9.5 2C8.5 9.68 2 10.5 2 10.5s6.5.82 7.5 8.5C10.5 11.32 17 10.5 17 10.5s-6.5-.82-7.5-8.5z"
            fill="var(--color-brand-blue)"
          />
          <path
            d="M18 13c-.5 4.06-4 4.5-4 4.5s3.5.44 4 4.5c.5-4.06 4-4.5 4-4.5s-3.5-.44-4-4.5z"
            fill="var(--color-brand-blue)"
          />
        </svg>
        <span className="flex-1 text-center">{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </a>
  );
}
