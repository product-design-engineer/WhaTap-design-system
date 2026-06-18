/**
 * DateTimeBlock — Chrome / Foundation. [[TimeRangeSelector]] 의 단일 datetime 입력 블록.
 *
 * ## Purpose
 * 듀얼 datetime 입력기의 한 쪽(start 또는 end)을 렌더.
 * `YYYY-MM-DD HH:MM` 형식 — year 4자리, 나머지 2자리 padding 자동.
 * numeric 폰트(`--font-family-numeric`) + `tabular-nums` 로 자릿수 세로 정렬.
 *
 * ## When to use
 * - [[TimeRangeSelector]] 내부에서 start/end 각각 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바/옵션바 밖에서 **동일한 datetime 입력 외형**이 필요한 경우 (예: 모달 내 시간 입력, 필터 팝오버).
 *
 * ## When NOT to use
 * - **시간 범위 전체**(start~end + LIVE + 이동) → [[TimeRangeSelector]].
 * - **LIVE 현재 시각만** compact 표시 → [[LiveTimerCompact]].
 * - **일반 텍스트/숫자 입력** → [[TextField]].
 * - **날짜 피커(캘린더 팝업)** → 별도 DatePicker (미구현, STORIES_ROADMAP 2차 라운드).
 *
 * ## Composition rules
 * - `DateParts` 데이터만 주입 — 표시 포맷(padding · separator · 폰트)은 이 컴포넌트가 책임.
 * - **Width 정책 — content hug (`w-fit`):** 컨테이너는 `width: fit-content` 로 내용물에 맞춤.
 *   내부 input 폭은 컴포넌트 토큰으로 제어:
 *   - `--wds-datetime-year-w` (28px) — year 4자리
 *   - `--wds-datetime-field-w` (16px) — month/day/hour/minute 2자리
 *   - `--wds-datetime-space-w` (6px) — 날짜-시간 사이 공백
 *   인라인 px 금지 — 토큰 값을 변경하면 모든 DateTimeBlock 에 일괄 반영.
 * - 폰트는 `--font-family-numeric` + `tabular-nums` — 자릿수 정렬 보장.
 * - 색은 토큰 (`text-primary` 입력값 · `text-tertiary` separator) — 인라인 hex 금지.
 * - input 은 `border-none bg-transparent` — 부모 컨테이너의 보더/배경에 의존.
 * - `side` prop 으로 aria-label 접두어(시작/종료) 자동 결정.
 *
 * @example
 * ```tsx
 * <DateTimeBlock parts={{ year: "2026", month: "06", day: "17", hour: "14", minute: "30" }} side="start" />
 * ```
 */

export type DateParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

const pad2 = (v: string) => v.padStart(2, "0");
const pad4 = (v: string) => v.padStart(4, "0");

export default function DateTimeBlock({
  parts,
  side,
}: {
  parts: DateParts;
  side: "start" | "end";
}) {
  const inputCls =
    "outline-none border-none bg-transparent text-base text-primary text-center";
  const numericFont = {
    fontFamily: "var(--font-family-numeric)",
    fontVariantNumeric: "tabular-nums" as const,
  };
  const sepCls = "text-base text-tertiary";
  const tabBase = side === "start" ? -100000000 : -200000000;
  const label = side === "start" ? "시작" : "종료";

  return (
    <div className="flex items-center w-fit" style={{ height: "100%" }}>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-year-w)" }}
        defaultValue={pad4(parts.year)}
        tabIndex={tabBase}
        aria-label={`${label} 년도`}
      />
      <span className={sepCls} aria-hidden>-</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        defaultValue={pad2(parts.month)}
        tabIndex={tabBase - 1}
        aria-label={`${label} 월`}
      />
      <span className={sepCls} aria-hidden>-</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        defaultValue={pad2(parts.day)}
        tabIndex={tabBase - 2}
        aria-label={`${label} 일`}
      />
      <span className={sepCls} style={{ ...numericFont, width: "var(--wds-datetime-space-w)", display: "inline-block" }} aria-hidden> </span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        defaultValue={pad2(parts.hour)}
        tabIndex={tabBase - 3}
        aria-label={`${label} 시`}
      />
      <span className={sepCls} aria-hidden>:</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        defaultValue={pad2(parts.minute)}
        tabIndex={tabBase - 4}
        aria-label={`${label} 분`}
      />
    </div>
  );
}
