import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * Calendar — 한 달 날짜 판. Primitives layer.
 *
 * ## Purpose
 * 달력 버튼을 눌렀을 때 뜨는 날짜 판이다. 한 달을 7열 격자로 보여 주고 날짜 하나를 고르게 한다.
 * 고를 수 없는 날짜(시작 시각보다 앞선 종료일 · 최대 조회 기간 밖 · 데이터 보관 기간 밖)는
 * **미리 흐리게 막는다** — 고른 뒤에 오류를 띄우는 것보다 한 번 덜 번거롭다.
 *
 * ## When to use
 * - [[TimeRangeSelector]] 의 시작 · 종료 시각 달력 버튼(시각마다 하나)을 눌렀을 때.
 * - [[DatePicker]] 처럼 달력 버튼이 트리거만 있는 컨트롤에 판을 붙일 때.
 *
 * ## When NOT to use
 * - 시각(시 · 분 · 초)까지 고르기 → 날짜는 이 판에서, 시각은 [[DateTimeBlock]] 칸에서 직접 입력한다.
 * - 상대 구간(최근 5분 · 1시간) → [[TimeRangeSelector]] 의 구간 길이 드롭다운.
 * - 두 날짜를 한 판에서 범위로 끌어 고르기 → 지원하지 않는다. 시작 · 종료 달력을 따로 연다.
 *
 * ## Composition rules
 * - 판은 `--color-card` 바탕 · `--color-border-default` 1px · `--radius-md` · `--shadow-md`. 띄우는 자리(팝오버 위치 ·
 *   바깥 누르면 닫기)는 부르는 쪽이 정한다 — 이 컴포넌트는 판만 그린다.
 * - 머리줄은 «‹ 2026년 10월 ›». 요일 줄은 일요일부터. 날짜 칸은 28px 정사각 · `--radius-control`.
 * - 고른 날: `--color-brand-blue` 바탕 + 흰 글자. 오늘: `--color-brand-blue` 1px 테두리. 고를 수 없는 날: `--color-text-disabled` ·
 *   `aria-disabled` — 지우지 않고 흐리게 둔다(왜 못 고르는지는 부르는 쪽 문장이 말한다).
 * - 이번 달이 아닌 칸은 비워 둔다 — 지난달 · 다음 달 숫자를 흐리게 채우면 고를 수 없는 날과 구별되지 않는다.
 * - 숫자는 `--font-family-numeric` + `tabular-nums`.
 * - 키보드: ← → 하루, ↑ ↓ 일주일, Enter · Space 고르기, Esc 는 `onClose`. 판 안에서 Tab 은 한 칸(고른 날 또는 오늘)에만 선다.
 * - 날짜는 `YYYY-MM-DD` 문자열 하나로 주고받는다 — [[DatePicker]] 와 같은 형식.
 *
 * ## Spec
 * - 폭 = 7 × 28px + 좌우 패딩 12px. 머리줄 높이 28px, 요일 줄 `text-sm` `--color-text-tertiary`.
 * - `min` · `max` 는 포함(그 날은 고를 수 있다). 비우면 제한 없음.
 * - `month`(YYYY-MM)는 처음 보여 줄 달. 생략하면 `value` 의 달, 그것도 없으면 `today` 의 달.
 * - 고르면 `onSelect("YYYY-MM-DD")`. 고를 수 없는 날은 눌러도 부르지 않는다.
 *
 * @example
 * ```tsx
 * <Calendar value="2026-10-26" max="2026-10-26" min="2026-09-26" onSelect={setDay} onClose={close} />
 * ```
 */
export type CalendarProps = {
  /** 고른 날 `YYYY-MM-DD`. */
  value?: string;
  /** 날짜를 고를 때. */
  onSelect?: (date: string) => void;
  /** 고를 수 있는 가장 이른 날(포함). */
  min?: string;
  /** 고를 수 있는 가장 늦은 날(포함). */
  max?: string;
  /** 처음 보여 줄 달 `YYYY-MM`. */
  month?: string;
  /** 오늘 `YYYY-MM-DD` — 생략하면 실제 오늘. 스토리 · 스냅샷 고정용. */
  today?: string;
  /** Esc 를 누를 때. */
  onClose?: () => void;
  /** 판 이름(스크린리더). 기본 «날짜 선택». */
  "aria-label"?: string;
};

const p2 = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${p2(m + 1)}-${p2(d)}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m: m - 1, d: d || 1 };
};
const todayStr = () => {
  const t = new Date();
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
};
const addDays = (s: string, n: number) => {
  const { y, m, d } = parse(s);
  const t = new Date(y, m, d + n);
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
};
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({
  value,
  onSelect,
  min,
  max,
  month,
  today,
  onClose,
  "aria-label": ariaLabel = "날짜 선택",
}: CalendarProps) {
  const now = today ?? todayStr();
  const start = parse(month ? `${month}-01` : (value ?? now));
  const [view, setView] = useState({ y: start.y, m: start.m });
  const [focus, setFocus] = useState(value ?? now);
  const gridRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const blocked = (s: string) => (min !== undefined && s < min) || (max !== undefined && s > max);

  /* 키보드로 옮긴 칸에 포커스를 따라 보낸다. 처음 열릴 때는 훔치지 않는다. */
  useEffect(() => {
    if (!moved.current) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focus}"]`)?.focus();
  }, [focus, view]);

  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => ymd(view.y, view.m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  const inView = (s: string) => {
    const p = parse(s);
    return p.y === view.y && p.m === view.m;
  };
  const tabStop = cells.includes(focus) ? focus : (cells.find((c) => c && !blocked(c)) ?? null);

  const shiftMonth = (n: number) => {
    const t = new Date(view.y, view.m + n, 1);
    setView({ y: t.getFullYear(), m: t.getMonth() });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
      return;
    }
    if (step === undefined) return;
    e.preventDefault();
    const next = addDays(tabStop ?? focus, step);
    moved.current = true;
    setFocus(next);
    if (!inView(next)) {
      const p = parse(next);
      setView({ y: p.y, m: p.m });
    }
  };

  const navBtn = "flex items-center justify-center w-28px h-28px rounded-control cursor-pointer hover-bg-surface-100";

  return (
    <div
      role="dialog"
      aria-label={ariaLabel}
      className="inline-flex flex-col gap-4px p-12px bg-card rounded-md shadow-md"
      style={{ border: "1px solid var(--color-border-default)" }}
    >
      <div className="flex items-center justify-between h-28px">
        <button type="button" aria-label="이전 달" className={navBtn} onClick={() => shiftMonth(-1)}>
          <Chevron dir="left" />
        </button>
        <span className="text-md font-bold text-primary" aria-live="polite">
          {view.y}년 {view.m + 1}월
        </span>
        <button type="button" aria-label="다음 달" className={navBtn} onClick={() => shiftMonth(1)}>
          <Chevron dir="right" />
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 28px)" }} aria-hidden>
        {WEEK.map((w) => (
          <span key={w} className="flex items-center justify-center h-24px text-sm text-tertiary">
            {w}
          </span>
        ))}
      </div>

      <div ref={gridRef} role="grid" className="grid" style={{ gridTemplateColumns: "repeat(7, 28px)", rowGap: 2 }} onKeyDown={onKey}>
        {cells.map((c, i) =>
          c === null ? (
            <span key={`b${i}`} aria-hidden />
          ) : (
            <DayCell
              key={c}
              date={c}
              selected={c === value}
              today={c === now}
              disabled={blocked(c)}
              tabbable={c === tabStop}
              onPick={() => !blocked(c) && onSelect?.(c)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function DayCell({
  date,
  selected,
  today,
  disabled,
  tabbable,
  onPick,
}: {
  date: string;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  tabbable: boolean;
  onPick: () => void;
}) {
  const d = Number(date.slice(8));
  const base = "flex items-center justify-center w-28px h-28px rounded-control text-base";
  const numeric = { fontFamily: "var(--font-family-numeric)", fontVariantNumeric: "tabular-nums" as const };
  if (selected) {
    return (
      <button
        type="button"
        data-date={date}
        aria-label={date}
        aria-selected
        aria-disabled={disabled || undefined}
        tabIndex={tabbable ? 0 : -1}
        onClick={onPick}
        className={`${base} font-bold cursor-pointer`}
        data-ds-policy-ok="컬러 위 고정 흰색 전경"
        // raw-color-ok: 고른 날 — brand 원색 바탕 위 고정 흰색 전경.
        style={{ ...numeric, background: "var(--color-brand-blue)", color: "#fff" }}
      >
        {d}
      </button>
    );
  }
  return (
    <button
      type="button"
      data-date={date}
      aria-label={date}
      aria-selected={false}
      aria-disabled={disabled || undefined}
      tabIndex={tabbable ? 0 : -1}
      onClick={onPick}
      className={`${base} ${disabled ? "cursor-not-allowed" : "cursor-pointer hover-bg-surface-100"}`}
      style={{
        ...numeric,
        color: disabled ? "var(--color-text-disabled)" : "var(--color-text-primary)",
        boxShadow: today ? "inset 0 0 0 1px var(--color-brand-blue)" : undefined,
      }}
    >
      {d}
    </button>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M7.5 2.5L4 6l3.5 3.5" : "M4.5 2.5L8 6l-3.5 3.5"}
        stroke="var(--color-text-tertiary)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
