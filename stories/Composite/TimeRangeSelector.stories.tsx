import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Notice, TimeChip, TimeRangeSelector } from "@whatap/design-system";
import type { TimeRangeMode } from "@whatap/design-system";

/**
 * Stories for [[TimeRangeSelector]] — 옵션바 시간 범위 선택자.
 */
const meta: Meta<typeof TimeRangeSelector> = {
  title: "Composite/TimeRangeSelector",
  component: TimeRangeSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**조회할 구간(시작 시각 ~ 종료 시각)을 고르는 옵션바 컨트롤.** 라이브 · 이전/다음 · 시각 직접 입력 · 달력 · 구간 길이를 한 상자에 묶는다.\n\n" +
          "| 조각 | 규칙 | prop |\n" +
          "|---|---|---|\n" +
          "| 시각 | 연·월·일·시·분·초, 숫자만 · 자릿수 제한 | `start` · `end` (`second`) · `onStartChange` · `onEndChange` |\n" +
          "| 달력 | 시작 · 종료 시각마다 하나. 시작 > 종료 · 최대 조회 기간 · 보관 기간 밖은 미리 막는다 | `minDate` · `maxDate` · `maxRangeDays` |\n" +
          "| 구간 길이 | 언제나 종료 시각에서 거꾸로. 갱신 · 라이브 «최근 10분», 고정 «10분», 목록 밖 «직접 지정» | `durations` · `duration` · `onDurationChange` |\n" +
          "| 갱신 ↔ 고정 | 버튼 하나, 글자가 지금 상태(📌 고정 / ↻ 갱신). 누르면 바뀐다 | `rangeMode` · `rangeControl=\"pin\"` · `onRangeModeChange` |\n" +
          "| 라이브 | ▶ 시작 / ■ 중지(펄스). 중지하면 멈춘 순간의 구간으로 고정 | `live` · `onLive` |\n\n" +
          "직접 입력 · 달력 · 이전/다음은 고정이 되고, 라이브 중이면 라이브가 멈춘다. 길이를 고르는 것만으로는 갱신/고정이 바뀌지 않는다. " +
          "들어올 때는 링크에 담긴 구간 → 고정해 둔 구간 → «최근 5분» 순서이고, 고정해 둔 구간으로 열면 셀렉터 아래 Notice 한 줄로 알린다.",
      },
    },
  },
  argTypes: {
    title: { description: "상단 제목. 기본 «시간». 빈 문자열이면 제목 줄 없음.", control: "text" },
    durationLabel: { description: "초록 알약 글자(`durations` 를 안 줄 때).", control: "text" },
    rangeMode: { description: "rolling(갱신) · fixed(고정).", control: "inline-radio", options: [undefined, "rolling", "fixed"] },
    rangeControl: { description: "갱신/고정 토글 모양 — pin(버튼 하나, 글자가 지금 상태) · segmented([갱신 | 고정] 두 칸).", control: "inline-radio", options: ["segmented", "pin"] },
    live: { description: "라이브 상태. 넘기면 ▶ 시작 / ■ 중지 토글.", control: "boolean" },
    durations: { description: "구간 길이 목록(분). 넘기면 알약이 드롭다운.", control: "object" },
    duration: { description: "지금 구간 길이(분). 목록 밖이면 «직접 지정».", control: "number" },
  },
};
export default meta;
type Story = StoryObj<typeof TimeRangeSelector>;

/** 기본 — 선택 prop 없이 쓰는 모양(예전 화면 그대로). */
export const Default: Story = {
  name: "기본",
  args: { durationLabel: "10분" },
};

/** 제목 없음 — 옵션바 안처럼 위에 제목 줄을 두지 않을 때. */
export const NoTitle: Story = {
  name: "제목 없음",
  args: { title: "", durationLabel: "10분" },
};

const BASE = new Date(2026, 9, 26, 10, 5, 12).getTime();
const p2 = (n: number) => String(n).padStart(2, "0");
const hms = (t: number) => {
  const d = new Date(t);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
};
const parts = (t: number) => {
  const d = new Date(t);
  return {
    year: String(d.getFullYear()),
    month: p2(d.getMonth() + 1),
    day: p2(d.getDate()),
    hour: p2(d.getHours()),
    minute: p2(d.getMinutes()),
  };
};

type Range = { from: number; to: number };

/* ═══════════════════ ✅ 동작 정본 (2026-10-28) ═══════════════════ */

const LENGTHS = [5, 10, 30, 60, 180, 360, 720, 1440];
const partsS = (t: number) => ({ ...parts(t), second: p2(new Date(t).getSeconds()) });
const noop = () => {};
/** DateParts → 시각(ms). 고쳐 쓰는 도중의 덜 찬 값이면 NaN. */
const timeOf = (p: { year: string; month: string; day: string; hour: string; minute: string; second?: string }) =>
  new Date(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +(p.second ?? 0)).getTime();

function StateRow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6px">
      <span className="text-sm font-medium text-secondary">{caption}</span>
      <div className="w-fit">{children}</div>
    </div>
  );
}

/**
 * **정본 · 상태 한눈에.** 기획 «[타임 셀렉터] 동작 제안» 이 정한 조각을 모두 켠 모양입니다 —
 * 시각은 초까지, 달력은 시작 · 종료 시각마다, 구간 길이는 초록 알약 드롭다운, 갱신/고정은 버튼 하나(글자가 지금 상태), 라이브는 ▶ / ■ 토글.
 *
 * | 상태 | 알약 | 갱신/고정 버튼 | 라이브 버튼 |
 * |---|---|---|---|
 * | 갱신 | 최근 10분 | ↻ 갱신(회색) | ▶ |
 * | 고정 | 10분 | 📌 고정(파랑) | ▶ |
 * | 라이브 중 | 최근 10분 | ↻ 갱신 | ■ (펄스) |
 * | 직접 지정(목록 밖 길이) | 직접 지정 | 📌 고정 | ▶ |
 */
export const Canon_States: Story = {
  name: "정본 · 상태 한눈에",
  render: () => {
    const to = BASE;
    return (
      <div className="flex flex-col gap-16px">
        <StateRow caption="갱신 — 검색할 때마다 지금 기준으로 다시 계산">
          <TimeRangeSelector
            start={partsS(to - 10 * 60_000)} end={partsS(to)}
            live={false} durations={LENGTHS} duration={10}
            rangeMode="rolling" rangeControl="pin" onRangeModeChange={noop}
            onPickStart={noop} onPickEnd={noop}
          />
        </StateRow>
        <StateRow caption="고정 — 정한 구간을 그대로 다시 조회">
          <TimeRangeSelector
            start={partsS(to - 10 * 60_000)} end={partsS(to)}
            live={false} durations={LENGTHS} duration={10}
            rangeMode="fixed" rangeControl="pin" onRangeModeChange={noop}
            onPickStart={noop} onPickEnd={noop}
          />
        </StateRow>
        <StateRow caption="라이브 중 — 누르지 않아도 계속 최신">
          <TimeRangeSelector
            start={partsS(to - 10 * 60_000)} end={partsS(to)}
            live durations={LENGTHS} duration={10}
            rangeMode="rolling" rangeControl="pin" onRangeModeChange={noop}
            onPickStart={noop} onPickEnd={noop}
          />
        </StateRow>
        <StateRow caption="직접 지정 — 목록에 없는 길이(17분)">
          <TimeRangeSelector
            start={partsS(to - 17 * 60_000)} end={partsS(to)}
            live={false} durations={LENGTHS} duration={17}
            rangeMode="fixed" rangeControl="pin" onRangeModeChange={noop}
            onPickStart={noop} onPickEnd={noop}
          />
        </StateRow>
      </div>
    );
  },
};

type Landing = "first" | "saved" | "live";

function CanonFlowDemo() {
  const mountedAt = useRef(Date.now());
  const now = () => BASE + (Date.now() - mountedAt.current);
  const SAVED: Range = { from: BASE - 24 * 3600_000 - 10 * 60_000, to: BASE - 24 * 3600_000 };

  const [landing, setLanding] = useState<Landing>("first");
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState<TimeRangeMode>("rolling");
  const [minutes, setMinutes] = useState<number | null>(5);
  const [range, setRange] = useState<Range>({ from: BASE - 5 * 60_000, to: BASE });
  const [queriedAt, setQueriedAt] = useState(BASE);
  const [savedNotice, setSavedNotice] = useState(false);

  // 라이브 — 1초마다 종료 시각을 지금으로.
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const t = now();
      setRange((r) => ({ from: t - (r.to - r.from), to: t }));
      setQueriedAt(t);
    }, 1000);
    return () => window.clearInterval(id);
  }, [live]);

  const land = (l: Landing) => {
    setLanding(l);
    const t = now();
    setQueriedAt(t);
    if (l === "live") {
      setLive(true); setMode("rolling"); setMinutes(5); setRange({ from: t - 5 * 60_000, to: t }); setSavedNotice(false);
    } else if (l === "saved") {
      setLive(false); setMode("fixed"); setMinutes(10); setRange(SAVED); setSavedNotice(true);
    } else {
      setLive(false); setMode("rolling"); setMinutes(5); setRange({ from: t - 5 * 60_000, to: t }); setSavedNotice(false);
    }
  };

  // 직접 입력 · 달력 · 이전/다음 → 라이브 끄고 고정.
  const pin = (r: Range) => {
    setLive(false);
    setMode("fixed");
    const m = Math.round((r.to - r.from) / 60_000);
    setMinutes(LENGTHS.includes(m) ? m : null);
    setRange(r);
    setQueriedAt(now());
  };

  const search = () => {
    const t = now();
    if (!live && mode === "rolling" && minutes != null) setRange({ from: t - minutes * 60_000, to: t });
    setQueriedAt(t);
  };

  // 길이는 언제나 종료 시각에서 거꾸로. 갱신 · 라이브면 종료 시각 = 지금.
  const pickLength = (m: number) => {
    setMinutes(m);
    const to = live || mode === "rolling" ? now() : range.to;
    setRange({ from: to - m * 60_000, to });
    setQueriedAt(now());
  };

  const toggleLive = () => {
    if (live) {
      setLive(false); // ■ 중지 = 멈춘 순간의 구간으로 고정
      setMode("fixed");
    } else {
      const t = now();
      const m = minutes ?? 5;
      setLive(true); setMode("rolling"); setMinutes(m); setRange({ from: t - m * 60_000, to: t }); setSavedNotice(false);
    }
  };

  const toggleMode = (next: TimeRangeMode) => {
    setMode(next);
    if (next === "rolling") {
      const t = now();
      const m = minutes ?? 5;
      setMinutes(m);
      setRange({ from: t - m * 60_000, to: t });
      setQueriedAt(t);
      setSavedNotice(false);
    }
  };

  const span = range.to - range.from;

  return (
    <div className="flex flex-col gap-12px" style={{ maxWidth: 820 }}>
      <div className="flex items-center gap-4px flex-wrap">
        <span className="text-sm text-tertiary" style={{ marginRight: 4 }}>들어오기</span>
        {([
          ["first", "분석 메뉴 · 처음"],
          ["saved", "분석 메뉴 · 고정해 둔 구간 있음"],
          ["live", "실시간 메뉴"],
        ] as const).map(([k, label]) => (
          <Button key={k} size="sm" variant={landing === k ? "outline" : "basic"} tone="primary" onClick={() => land(k)}>
            {label}
          </Button>
        ))}
      </div>

      <div className="flex items-end gap-8px flex-wrap">
        <TimeRangeSelector
          start={partsS(range.from)}
          end={partsS(range.to)}
          live={live}
          onLive={toggleLive}
          durations={LENGTHS}
          duration={minutes}
          onDurationChange={pickLength}
          rangeMode={mode}
          rangeControl="pin"
          onRangeModeChange={toggleMode}
          minDate="2026-09-27"
          maxDate="2026-10-26"
          maxRangeDays={7}
          onStartChange={(p) => {
            const t = timeOf(p);
            pin(Number.isFinite(t) && t < range.to ? { from: t, to: range.to } : range);
          }}
          onEndChange={(p) => {
            const t = timeOf(p);
            pin(Number.isFinite(t) && t > range.from ? { from: range.from, to: t } : range);
          }}
          onPrev={() => pin({ from: range.from - span, to: range.to - span })}
          onNext={() => pin({ from: range.from + span, to: range.to + span })}
        />
        <Button variant="contained" tone="primary" size="lg" disabled={live} onClick={search}>
          검색
        </Button>
      </div>

      {savedNotice && (
        <Notice
          tone="primary"
          title={`어제 ${hms(range.from).slice(0, 5)}~${hms(range.to).slice(0, 5)} 으로 고정된 구간을 보여 드리고 있어요`}
          action={
            <Button variant="outline" size="sm" tone="primary" onClick={() => toggleMode("rolling")}>
              최근 5분 보기
            </Button>
          }
        />
      )}

      <div className="bg-card p-16px flex flex-col gap-8px" style={{ borderRadius: "var(--radius-md)" }}>
        <div className="flex items-center gap-8px flex-wrap">
          <TimeChip label="조회 구간" value={`${hms(range.from)} ~ ${hms(range.to)}`} />
          <TimeChip label="조회 시각" value={hms(queriedAt)} />
          <span className="text-sm text-secondary">
            {live ? "라이브 — 1초마다 최신" : mode === "fixed" ? "고정 — 검색해도 구간 그대로" : "갱신 — 검색하면 지금 기준으로 다시 계산"}
          </span>
        </div>
        <span className="text-base text-tertiary">결과 영역(예시)</span>
      </div>
    </div>
  );
}

/**
 * **정본 · 동선 (직접 눌러 보세요).** 기획 «[타임 셀렉터] 동작 제안» 의 케이스 표를 그대로 움직입니다. 시계는 10:05:12 에서 시작해 실제로 흐릅니다.
 *
 * - **들어오기** — 분석 메뉴 처음: 최근 5분 · 갱신 / 고정해 둔 구간 있음: 어제 구간 · 고정 + 안내 한 줄 / 실시간 메뉴: 라이브.
 * - **검색** — 갱신이면 종료 시각이 지금으로 옮겨지고, 고정이면 같은 구간을 다시 조회합니다(조회 시각만 바뀜).
 * - **초록 알약(구간 길이)** — 언제나 종료 시각에서 거꾸로. 갱신 · 라이브는 «최근 N분», 고정은 «N분». 고르는 것만으로 갱신/고정은 바뀌지 않습니다.
 * - **📅 달력** — 시작 · 종료 시각 뒤의 📅 를 누르면 달력이 뜹니다. 시작 달력은 종료일 뒤를, 종료 달력은 시작일 앞을 막고, 보관 기간(9/27 이전) · 오늘(10/26) 이후 · 최대 조회 기간 7일 밖도 흐리게 막습니다. 고르면 시각은 그대로 두고 날짜만 바뀝니다.
 * - **달력 · 직접 입력 · ‹ ›** — 고정으로 바뀌고, 라이브 중이었다면 라이브가 멈춥니다. 칸마다 자릿수를 넘겨 칠 수 없습니다(연 4 · 나머지 2).
 * - **갱신 ↔ 고정 버튼** — 글자가 지금 상태(↻ 갱신 / 📌 고정). 누르면 바뀌고, 갱신으로 바꾸면 지금 기준으로 다시 계산합니다.
 * - **▶ / ■** — 라이브 시작 / 중지. 중지하면 멈춘 순간의 구간으로 고정됩니다.
 */
export const Canon_Flow: Story = {
  name: "정본 · 동선 (직접 눌러 보세요)",
  parameters: { layout: "padded" },
  render: () => <CanonFlowDemo />,
};
