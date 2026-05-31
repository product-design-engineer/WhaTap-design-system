/**
 * AI 위젯 — "N steps..." 콜랩서블 진행 타임라인 (이미지 11.21.51 스타일).
 *
 * 헤더(▼ N steps) 클릭으로 펼침/접힘. 각 step은 ✓ 체크 또는 회전 spinner.
 * 마지막 running step만 spinner, 나머지는 모두 완료.
 */
import { useState } from "react";

export type TimelineStep = {
  label: string;
  /** true면 spinner, false면 ✓ */
  running?: boolean;
};

export default function AiStepsTimeline({
  steps,
  defaultOpen = true,
  delay = 0,
}: {
  steps: TimelineStep[];
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = steps.filter((s) => !s.running).length;
  return (
    <div
      className="ai-anim-in flex flex-col gap-[6px] w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-[6px] text-md text-secondary tracking-default leading-normal cursor-pointer self-start"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .2s" }}
        >
          <path d="M3 4.5l3 3 3-3" stroke="#4c4c4c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {steps.length} steps{completed < steps.length ? "..." : ""}
      </button>
      {open && (
        <div className="flex flex-col gap-[4px] w-full">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-[8px] bg-white border border-[#eaeaea] rounded-[6px] px-[12px] h-[36px] cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-[8px] min-w-0">
                {s.running ? (
                  <span
                    className="size-[14px] rounded-full border-[1.5px] border-[#296CF2] border-t-transparent shrink-0"
                    style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
                  />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <circle cx="7" cy="7" r="6.5" fill="#00B442" />
                    <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  className="text-md text-primary tracking-default leading-normal truncate"
                  style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                >
                  {s.label}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <path d="M4 2l4 4-4 4" stroke="#adadad" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
