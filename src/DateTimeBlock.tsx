/**
 * DateTimeBlock — Chrome / Foundation. [[TimeRangeSelector]] 의 단일 datetime 입력 블록.
 *
 * ## Purpose
 * 듀얼 datetime 입력기의 한 쪽(start 또는 end)을 렌더.
 * `YYYY-MM-DD HH:MM` 형식 — year 4자리, 나머지 2자리 padding 자동. `parts.second` 를 주면 `HH:MM:SS` 까지 그린다.
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
 * - **초 칸은 `parts.second` 가 있을 때만** 그린다 — 없으면 예전과 같은 `HH:MM` DOM. 시각을 초까지 다루는 화면은
 *   `second` 를 넘긴다(Tab 순서 연 → 월 → 일 → 시 → 분 → 초).
 * - **숫자만 받는다.** 숫자가 아닌 글자는 치는 즉시 지운다(붙여넣기 포함). 칸마다 자릿수를 넘겨 칠 수 없다 — 연 4자리,
 *   나머지 2자리(`maxLength`). 숫자 키패드(`inputMode="numeric"`).
 * - 고쳐 쓴 값을 알아야 하는 호출부는 `onChange` 를 넘긴다 — 칸을 고치고 **벗어날 때(blur)** 전체 `DateParts` 를 받는다.
 *   칠 때마다 알리지 않는 이유: 부모가 값을 다시 내려보내면 칸이 새로 그려져 치는 도중 포커스가 끊긴다.
 *   [[TimeRangeSelector]] 는 이것으로 «직접 입력하면 자동 고정» 을 건다.
 * - **강조(emphasis).** 칸을 고치는 중(포커스가 안에 있음)이거나 `emphasis` 를 주면 블록 전체가 `--color-brand-blue-bg` 바탕 +
 *   안쪽 `--color-brand-blue` 1px 테두리로 바뀐다(`.wds-datetime-block`). 시작 · 종료 중 **지금 바꾸는 쪽**이 어디인지 보이게 한다.
 *   [[TimeRangeSelector]] 는 그 시각의 달력이 열려 있는 동안 `emphasis` 를 건다. 좌우 4px 여백은 평소에도 있어 강조가 켜져도 폭이 그대로다.
 * - **`parts` 가 바뀌면 표시도 바뀐다.** 칸은 사용자가 고쳐 쓸 수 있는 비제어 입력(`defaultValue`)이라
 *   그대로 두면 처음 받은 값에 멈춘다(이전 · 다음 이동이나 «최근 N분» 재검색 뒤에도 옛 시각이 남던 결함).
 *   그래서 칸마다 값으로 `key` 를 걸어 값이 바뀐 칸만 다시 그린다. 같은 값으로 다시 그려질 때는
 *   사용자가 고쳐 쓰던 글자를 지우지 않는다.
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
  /** 초 — 주면 `:SS` 칸이 생긴다. 생략하면 분까지만. */
  second?: string;
};

const pad2 = (v: string) => v.padStart(2, "0");
/** 숫자만 남긴다 — 붙여넣기 · 한글 입력도 같은 길로. */
const digitsOnly = (e: { currentTarget: HTMLInputElement }) => {
  const el = e.currentTarget;
  const clean = el.value.replace(/\D/g, "");
  if (clean !== el.value) el.value = clean;
};
const pad4 = (v: string) => v.padStart(4, "0");

export default function DateTimeBlock({
  parts,
  side,
  onChange,
  emphasis,
}: {
  parts: DateParts;
  side: "start" | "end";
  /** 강조 — 이 시각을 지금 바꾸는 중(달력이 열림)일 때. 칸에 포커스가 있을 때는 주지 않아도 강조된다. */
  emphasis?: boolean;
  /** 칸을 고치고 벗어날 때 전체 값을 받는다. 생략하면 비제어 입력 그대로. */
  onChange?: (next: DateParts) => void;
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
  /* 칸을 벗어날 때 한 번만 알린다 — 칠 때마다 알리면 부모가 다시 그리며 칸이 바뀌어 포커스가 끊긴다. */
  const commit = (key: keyof DateParts) =>
    onChange
      ? (e: { currentTarget: HTMLInputElement }) => {
          const v = e.currentTarget.value;
          if (v !== "" && v !== parts[key]) onChange({ ...parts, [key]: v });
        }
      : undefined;

  return (
    <div className="wds-datetime-block flex items-center w-fit" data-emphasis={emphasis || undefined} style={{ height: "100%" }}>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-year-w)" }}
        key={`year-${pad4(parts.year)}`}
        defaultValue={pad4(parts.year)}
        onInput={digitsOnly}
        onBlur={commit("year")}
        maxLength={4}
        inputMode="numeric"
        tabIndex={tabBase}
        aria-label={`${label} 년도`}
      />
      <span className={sepCls} aria-hidden>-</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        key={`month-${pad2(parts.month)}`}
        defaultValue={pad2(parts.month)}
        onInput={digitsOnly}
        onBlur={commit("month")}
        maxLength={2}
        inputMode="numeric"
        tabIndex={tabBase - 1}
        aria-label={`${label} 월`}
      />
      <span className={sepCls} aria-hidden>-</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        key={`day-${pad2(parts.day)}`}
        defaultValue={pad2(parts.day)}
        onInput={digitsOnly}
        onBlur={commit("day")}
        maxLength={2}
        inputMode="numeric"
        tabIndex={tabBase - 2}
        aria-label={`${label} 일`}
      />
      <span className={sepCls} style={{ ...numericFont, width: "var(--wds-datetime-space-w)", display: "inline-block" }} aria-hidden> </span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        key={`hour-${pad2(parts.hour)}`}
        defaultValue={pad2(parts.hour)}
        onInput={digitsOnly}
        onBlur={commit("hour")}
        maxLength={2}
        inputMode="numeric"
        tabIndex={tabBase - 3}
        aria-label={`${label} 시`}
      />
      <span className={sepCls} aria-hidden>:</span>
      <input
        className={inputCls}
        style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
        key={`minute-${pad2(parts.minute)}`}
        defaultValue={pad2(parts.minute)}
        onInput={digitsOnly}
        onBlur={commit("minute")}
        maxLength={2}
        inputMode="numeric"
        tabIndex={tabBase - 4}
        aria-label={`${label} 분`}
      />
      {parts.second !== undefined && (
        <>
          <span className={sepCls} aria-hidden>:</span>
          <input
            className={inputCls}
            style={{ ...numericFont, width: "var(--wds-datetime-field-w)" }}
            key={`second-${pad2(parts.second)}`}
            defaultValue={pad2(parts.second)}
            onInput={digitsOnly}
            onBlur={commit("second")}
            maxLength={2}
            inputMode="numeric"
            tabIndex={tabBase - 5}
            aria-label={`${label} 초`}
          />
        </>
      )}
    </div>
  );
}
