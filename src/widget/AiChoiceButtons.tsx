/**
 * AI 위젯 — 사용자 선택 CTA 한 쌍.
 *
 * Primary(그라데이션)와 Secondary(아웃라인) 두 옵션. 라벨/설명은 prop으로
 * 주입. 진입 시 페이드인.
 */
export type Choice = {
  label: string;
  /** 보조 라벨 (선택, "(98%)" 등) */
  hint?: string;
  onClick?: () => void;
};

export default function AiChoiceButtons({
  primary,
  secondary,
  delay = 0,
}: {
  primary: Choice;
  secondary: Choice;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-[8px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={primary.onClick}
        className="flex items-center justify-center h-[36px] px-[16px] rounded-[6px] bg-[color:var(--color-brand-blue)] text-white text-md tracking-default cursor-pointer transition-colors hover:bg-[color:var(--color-brand-blue-deep)]"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {primary.label}
        {primary.hint && <span className="ml-[4px] opacity-90">{primary.hint}</span>}
      </button>
      <button
        onClick={secondary.onClick}
        className="flex items-center justify-center h-[36px] px-[16px] rounded-[6px] bg-white text-brand-blue text-md tracking-default border border-[color:var(--color-brand-blue)] cursor-pointer transition-colors hover:bg-[color:var(--color-brand-blue-bg)]"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {secondary.label}
        {secondary.hint && <span className="ml-[4px] opacity-80">{secondary.hint}</span>}
      </button>
    </div>
  );
}
