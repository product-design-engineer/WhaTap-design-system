import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * Calendar — 날짜 판(연 · 월 · 일), 필요하면 시각(시 · 분 · 초)까지. Primitives layer.
 *
 * ## Purpose
 * 달력 버튼을 눌렀을 때 뜨는 판이다. 한 달을 7열 격자로 보여 주고 날짜 하나를 고르게 한다.
 * `time` 을 주면 판 아래에 시 · 분 · 초 칸과 «고른 값» 한 줄(`YYYY-MM-DD HH:MM:SS`)이 붙어, 연부터 초까지 한 판에서 정한다.
 * 고를 수 없는 날짜(시작 시각보다 앞선 종료일 · 최대 조회 기간 밖 · 데이터 보관 기간 밖)는
 * **미리 흐리게 막는다** — 고른 뒤에 오류를 띄우는 것보다 한 번 덜 번거롭다.
 *
 * ## When to use
 * - [[TimeRangeSelector]] 의 시작 · 종료 시각 달력 버튼(시각마다 하나)을 눌렀을 때 — `time` 을 주어 초까지 고른다.
 * - [[DatePicker]] 처럼 달력 버튼이 트리거만 있는 컨트롤에 판을 붙일 때 — 날짜만이면 `time` 을 생략한다.
 *
 * ## When NOT to use
 * - 상대 구간(최근 5분 · 1시간) → [[TimeRangeSelector]] 의 구간 길이 드롭다운.
 * - 두 날짜를 한 판에서 범위로 끌어 고르기 → 지원하지 않는다. 시작 · 종료 달력을 따로 연다.
 * - 시각만(날짜 없이) 고르기 → 이 판이 아니라 [[DateTimeBlock]] 칸에서 직접 입력한다.
 *
 * ## Composition rules
 * - 판은 `--color-card` 바탕 · `--color-border-default` 1px · `--radius-md` · `--shadow-md`. 띄우는 자리(팝오버 위치 ·
 *   바깥 누르면 닫기)는 부르는 쪽이 정한다 — 이 컴포넌트는 판만 그린다.
 * - 머리줄은 «« ‹ 2026년 10월 › »» — 안쪽 ‹ › 는 한 달, 바깥 « » 는 한 해. 연도를 몇 해 건너뛸 때 달을 열두 번 누르지 않게 한다.
 * - 요일 줄은 일요일부터. 날짜 칸은 28px 정사각 · `--radius-control`.
 * - 고른 날: `--color-brand-blue` 바탕 + 흰 글자. 오늘: `--color-brand-blue` 1px 테두리. 고를 수 없는 날: `--color-text-disabled` ·
 *   `aria-disabled` — 지우지 않고 흐리게 둔다(왜 못 고르는지는 부르는 쪽 문장이 말한다).
 * - 이번 달이 아닌 칸은 비워 둔다 — 지난달 · 다음 달 숫자를 흐리게 채우면 고를 수 없는 날과 구별되지 않는다.
 * - 숫자는 `--font-family-numeric` + `tabular-nums`.
 * - **`time` 이 없으면** 날짜를 누르는 즉시 `onSelect` 하고 끝난다(예전과 같다).
 * - **`time` 이 있으면** 날짜를 눌러도 닫히지 않는다 — 판 아래 «시각» 줄에서 시 · 분 · 초를 고치고, «고른 값» 줄이
 *   연부터 초까지 한 번에 보여 준 뒤 **적용** 을 눌러야 `onApply(date, time)` 한다. 취소 · Esc 는 아무것도 바꾸지 않는다.
 *   시각 칸은 숫자만 · 2자리 · 벗어날 때 범위로 맞춘다(시 0–23, 분 · 초 0–59). `time.second` 가 없으면 초 칸을 그리지 않는다.
 * - 키보드: ← → 하루, ↑ ↓ 일주일, Enter · Space 고르기, Esc 는 `onClose`. 판 안에서 Tab 은 한 칸(고른 날 또는 오늘)에만 선다.
 * - 날짜는 `YYYY-MM-DD` 문자열 하나로 주고받는다 — [[DatePicker]] 와 같은 형식.
 *
 * ## Spec
 * - 폭 = 7 × 28px + 좌우 패딩 12px. 머리줄 높이 28px, 요일 줄 `text-sm` `--color-text-tertiary`.
 * - `min` · `max` 는 포함(그 날은 고를 수 있다). 비우면 제한 없음.
 * - `month`(YYYY-MM)는 처음 보여 줄 달. 생략하면 `value` 의 달, 그것도 없으면 `today` 의 달.
 * - `time` 없음: 고르면 `onSelect("YYYY-MM-DD")`. 고를 수 없는 날은 눌러도 부르지 않는다.
 * - `time` 있음: 판 아래 `--color-border-default` 1px 위 선 · 12px 위 여백 뒤에
 *   (1) «시각» `text-sm` tertiary + 시 · 분 · 초 칸(각 28×28px, `--color-border-control` 1px, 포커스 시 `--color-brand-blue` 테두리),
 *   (2) «고른 값» `text-sm` tertiary + `YYYY-MM-DD HH:MM:SS` `text-md font-bold` numeric,
 *   (3) 오른쪽 정렬 «취소»(outline) · «적용»(`--color-brand-blue` 바탕 + 흰 글자) 24px 버튼.
 *   적용하면 `onApply("YYYY-MM-DD", { hour, minute, second? })` — 두 자리 문자열.
 *
 * @example
 * ```tsx
 * <Calendar value="2026-10-26" max="2026-10-26" min="2026-09-26" onSelect={setDay} onClose={close} />
 * <Calendar value="2026-10-26" time={{ hour: "16", minute: "08", second: "26" }} onApply={(d, t) => set(d, t)} onClose={close} />
 * ```
 */
export type CalendarTime = {
  hour: string;
  minute: string;
  /** 초 — 생략하면 초 칸을 그리지 않는다. */
  second?: string;
};

export type CalendarProps = {
  /** 고른 날 `YYYY-MM-DD`. */
  value?: string;
  /** 날짜를 고를 때(`time` 이 없을 때). */
  onSelect?: (date: string) => void;
  /** 시각 — 주면 판 아래에 시 · 분 · 초 칸과 적용 버튼이 붙는다. */
  time?: CalendarTime;
  /** 적용을 누를 때(`time` 이 있을 때). 날짜와 시각을 함께 받는다. */
  onApply?: (date: string, time: CalendarTime) => void;
  /** 고를 수 있는 가장 이른 날(포함). */
  min?: string;
  /** 고를 수 있는 가장 늦은 날(포함). */
  max?: string;
  /** 처음 보여 줄 달 `YYYY-MM`. */
  month?: string;
  /** 오늘 `YYYY-MM-DD` — 생략하면 실제 오늘. 스토리 · 스냅샷 고정용. */
  today?: string;
  /** Esc · 취소를 누를 때. */
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
const numeric = { fontFamily: "var(--font-family-numeric)", fontVariantNumeric: "tabular-nums" as const };

export default function Calendar({
  value,
  onSelect,
  time,
  onApply,
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
  /* 시각이 있으면 고른 날 · 시각은 적용 전까지 판 안에만 둔다. */
  const [draftDay, setDraftDay] = useState(value);
  const [draftTime, setDraftTime] = useState<CalendarTime | undefined>(time);
  const gridRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const withTime = time !== undefined;
  const selectedDay = withTime ? draftDay : value;

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

  const pick = (c: string) => {
    if (blocked(c)) return;
    if (withTime) {
      setDraftDay(c);
      setFocus(c);
    } else onSelect?.(c);
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
  const canApply = withTime && draftDay !== undefined && !blocked(draftDay);

  return (
    <div
      role="dialog"
      aria-label={ariaLabel}
      className="inline-flex flex-col gap-4px p-12px bg-card rounded-md shadow-md"
      style={{ border: "1px solid var(--color-border-default)" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose?.();
        }
      }}
    >
      <div className="flex items-center justify-between h-28px">
        <div className="flex items-center">
          <button type="button" aria-label="이전 해" className={navBtn} onClick={() => shiftMonth(-12)}>
            <Chevron dir="left" double />
          </button>
          <button type="button" aria-label="이전 달" className={navBtn} onClick={() => shiftMonth(-1)}>
            <Chevron dir="left" />
          </button>
        </div>
        <span className="text-md font-bold text-primary" style={numeric} aria-live="polite">
          {view.y}년 {view.m + 1}월
        </span>
        <div className="flex items-center">
          <button type="button" aria-label="다음 달" className={navBtn} onClick={() => shiftMonth(1)}>
            <Chevron dir="right" />
          </button>
          <button type="button" aria-label="다음 해" className={navBtn} onClick={() => shiftMonth(12)}>
            <Chevron dir="right" double />
          </button>
        </div>
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
              selected={c === selectedDay}
              today={c === now}
              disabled={blocked(c)}
              tabbable={c === tabStop}
              onPick={() => pick(c)}
            />
          ),
        )}
      </div>

      {withTime && draftTime && (
        <TimeFooter
          day={draftDay}
          time={draftTime}
          onTime={setDraftTime}
          canApply={canApply}
          onCancel={onClose}
          onApply={() => draftDay && onApply?.(draftDay, draftTime)}
        />
      )}
    </div>
  );
}

/* ─── 시각 줄 · 고른 값 · 적용 — `time` 이 있을 때만 ─── */
const LIMIT = { hour: 23, minute: 59, second: 59 } as const;
const UNIT = { hour: "시", minute: "분", second: "초" } as const;

function TimeFooter({
  day,
  time,
  onTime,
  canApply,
  onCancel,
  onApply,
}: {
  day?: string;
  time: CalendarTime;
  onTime: (t: CalendarTime) => void;
  canApply: boolean;
  onCancel?: () => void;
  onApply: () => void;
}) {
  const keys = (time.second === undefined ? ["hour", "minute"] : ["hour", "minute", "second"]) as (keyof typeof LIMIT)[];
  const summary = `${day ?? "----------"} ${keys.map((k) => (time[k] ?? "").padStart(2, "0")).join(":")}`;
  const btn = "flex items-center justify-center h-24px px-8px rounded-control text-base font-medium cursor-pointer";
  return (
    <div className="flex flex-col gap-8px mt-8px pt-12px" style={{ borderTop: "1px solid var(--color-border-default)" }}>
      <div className="flex items-center gap-8px">
        <span className="text-sm text-tertiary w-40px">시각</span>
        <div className="flex items-center gap-4px">
          {keys.map((k, i) => (
            <span key={k} className="flex items-center gap-4px">
              {i > 0 && (
                <span className="text-base text-tertiary" aria-hidden>
                  :
                </span>
              )}
              <TimeInput
                key={`${k}-${time[k]}`}
                label={UNIT[k]}
                value={time[k] ?? "00"}
                max={LIMIT[k]}
                onCommit={(v) => onTime({ ...time, [k]: v })}
              />
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-8px">
        <span className="text-sm text-tertiary w-40px">고른 값</span>
        <span className="text-md font-bold text-primary" style={numeric} aria-live="polite">
          {summary}
        </span>
      </div>
      <div className="flex items-center justify-end gap-6px">
        <button
          type="button"
          onClick={onCancel}
          className={`${btn} text-secondary hover-bg-surface-100`}
          style={{ border: "1px solid var(--color-border-control)" }}
        >
          취소
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={!canApply}
          className={`${btn} ${canApply ? "hover-opacity-70" : "cursor-not-allowed"}`}
          data-ds-policy-ok="컬러 위 고정 흰색 전경"
          // raw-color-ok: 적용 버튼 — brand 원색 바탕 위 고정 흰색 전경.
          style={{ background: canApply ? "var(--color-brand-blue)" : "var(--color-surface-200)", color: canApply ? "#fff" : "var(--color-text-disabled)" }}
        >
          적용
        </button>
      </div>
    </div>
  );
}

/** 두 자리 숫자 칸 — 숫자만, 벗어날 때 0~max 로 맞춘다. */
function TimeInput({ label, value, max, onCommit }: { label: string; value: string; max: number; onCommit: (v: string) => void }) {
  return (
    <input
      aria-label={label}
      defaultValue={value.padStart(2, "0")}
      maxLength={2}
      inputMode="numeric"
      onInput={(e) => {
        const el = e.currentTarget;
        const clean = el.value.replace(/\D/g, "");
        if (clean !== el.value) el.value = clean;
      }}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => {
        const n = Math.min(max, Math.max(0, Number(e.currentTarget.value || 0)));
        const v = p2(n);
        e.currentTarget.value = v;
        if (v !== value.padStart(2, "0")) onCommit(v);
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="w-28px h-28px rounded-control bg-card text-base text-primary text-center outline-none wds-calendar-time"
      style={numeric}
    />
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

function Chevron({ dir, double }: { dir: "left" | "right"; double?: boolean }) {
  const one = (x: number) => (dir === "left" ? `M${7.5 + x} 2.5L${4 + x} 6l${3.5} 3.5` : `M${4.5 + x} 2.5L${8 + x} 6l-3.5 3.5`);
  return (
    <svg width={double ? 16 : 12} height="12" viewBox={double ? "0 0 16 12" : "0 0 12 12"} fill="none" aria-hidden="true">
      <path d={double ? `${one(0)}${one(dir === "left" ? 4 : 4)}` : one(0)} stroke="var(--color-text-tertiary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
