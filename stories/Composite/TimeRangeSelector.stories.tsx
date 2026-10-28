import { useEffect, useRef, useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { Button, Notice, TimeChip, TimeRangeSelector } from "@whatap/design-system";
import type { TimeRangeMode } from "@whatap/design-system";

/**
 * Stories for [[TimeRangeSelector]] — OptionbarPage 시간 범위 선택자.
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
          "**듀얼 datetime + LIVE 토글 + 이동/달력 버튼 + duration 알약.** OptionbarPage 우측 시간 범위 입력기. " +
          "라이브 마크업 (`ic-live-time` / `ic-left` / `ic-right` / `ic-start-date`) 그대로 옮긴 공용 컴포넌트.\n\n" +
          "**표시 형식:** `YYYY-MM-DD HH:MM` — 단일 자리 입력값은 자동 padding (year 4자리, 나머지 2자리). " +
          "자리수 정렬은 `--font-family-numeric` (tabular-nums) 으로 보장.\n\n" +
          "---\n\n" +
          "### 🧪 시안 — «최근 N분» 의 갱신 · 고정 (2026-10-26, 정책 확정 전)\n\n" +
          "아래 `시안 ·` 으로 시작하는 스토리들은 **회의용 시안**입니다. 기본값 · 공유 링크 · 저장값 처리는 아직 정해지지 않았고, " +
          "이 시안은 «정해지면 화면이 어떻게 보이는가» 를 미리 눌러 보기 위한 것입니다. 기존 화면은 바뀌지 않습니다 — " +
          "`rangeMode` 를 넘긴 화면에만 새 표시가 나타납니다.\n\n" +
          "**무엇이 문제인가.** «최근 5분» 을 고르고 검색한 뒤 3분 뒤에 다시 검색 버튼을 누르면, 사람마다 기대가 다릅니다.\n\n" +
          "| 동작 | 10:00 에 «최근 5분» 검색 | 10:03 에 다시 검색 | 이럴 때 맞다 |\n" +
          "|---|---|---|---|\n" +
          "| **갱신** | 09:55 ~ 10:00 | **09:58 ~ 10:03** (끝점이 지금으로 옮겨짐) | 방금 들어온 로그를 계속 확인할 때 |\n" +
          "| **고정** | 09:55 ~ 10:00 | **09:55 ~ 10:00** (그대로) | 특정 시점의 장애 구간을 붙잡고 볼 때 · 동료와 같은 화면을 볼 때 |\n\n" +
          "두 동작 모두 시간 표시만 보면 똑같이 «최근 5분» 이라서, 지금 어느 쪽인지 화면이 말해 주지 않으면 사용자는 짐작해야 합니다. " +
          "그래서 시안은 세 가지를 보여 줍니다.\n\n" +
          "1. **지금의 동작을 글자로** — 셀렉터 오른쪽 끝에 «↻ 갱신» 또는 «📌 고정». 고를 수 있게 할지(토글)는 [검토 필요] 항목이라 두 경우를 모두 만들었습니다.\n" +
          "2. **실제로 조회된 구간을 결과 위에** — «조회 구간 09:58:12 ~ 10:03:12» 처럼 **초까지** 적고, 따로 «조회 시각» 을 둡니다. " +
          "1분 안에 두 번 검색해도 조회 시각이 바뀌므로 «다시 조회는 됐다» 를 눈으로 확인할 수 있고, 구간 옆 문구가 «새로 계산됨 / 그대로» 를 알려 줍니다.\n" +
          "3. **두 단계를 한 단계로** — «5분 · 10분 · 30분 · 1시간» 을 누르면 바로 조회합니다(예전: 시간 고르기 → 검색). 캘린더나 직접 입력은 입력 도중에 조회가 나가면 안 되므로 지금처럼 확인을 거칩니다.\n\n" +
          "**정해진 것 · 안 정해진 것.**\n\n" +
          "| 항목 | 상태 | 시안의 제안 |\n" +
          "|---|---|---|\n" +
          "| 캘린더 · 직접 입력 구간 | ✅ 고정 (기존 그대로) | 토글 없이 «고정» 글자만 |\n" +
          "| 갱신 모드의 자동 재조회 | 제안 | 하지 않음 — 검색을 누를 때만. 저절로 흐르는 것은 LIVE 의 몫 |\n" +
          "| 초 단위 계산 | 제안 | 끝점을 초까지 잡는다(지금은 분 단위로 잘라 1분 안의 재검색이 같은 구간이 됨). 마지막 1분의 덜 찬 집계 처리는 엔지니어링 판단 |\n" +
          "| 공유 링크 | 제안 | 동작을 링크에 함께 싣는다 — 갱신: `?preset=5m&mode=rolling&from=…&to=…` · 고정: `?from=…&to=…&mode=fixed`. 받은 사람은 **보낸 사람이 본 구간을 먼저** 보고, 원하면 «최근으로 갱신». 시각은 타임존 포함 |\n" +
          "| 기존 저장값(대시보드 · 북마크) | 제안 | 일괄 변환 없음 — 동작 값이 없는 저장값은 예전 동작 그대로 해석, 새로 저장할 때부터 동작을 함께 기록 |\n" +
          "| 과도한 재요청 | 제안 | 조회 중엔 검색 버튼을 막고(로딩), 새 조회가 나가면 이전 것은 취소. 긴 구간(예: 로그 7일 초과)은 경고 후 진행 |\n" +
          "| 기본 동작 · 모드 전환 허용 · 온프레미스 설정 | ❓ 미정 | 전환을 허용하면 온프레미스 설정의 필요가 줄어든다 — 전환 여부부터 정하면 따라서 정해짐 |\n\n" +
          "**되돌리기(롤백).** 이 시안은 기존 prop 을 바꾸지 않고 선택 prop 두 개(`rangeMode` · `onRangeModeChange`)만 더했습니다. " +
          "쓰지 않으면 예전과 같은 화면이고, 채택하지 않기로 하면 시안 커밋을 되돌리면 끝납니다.\n\n" +
          "---\n\n" +
          "### ✅ 동작 정본 (2026-10-28, 기획 «[타임 셀렉터] 동작 제안»)\n\n" +
          "위 시안을 바탕으로 기획이 정한 동작입니다. `정본 ·` 스토리에서 눌러 볼 수 있습니다. 모두 선택 prop 이라 넘기지 않으면 예전 모양 그대로입니다.\n\n" +
          "| 조각 | prop | 규칙 |\n" +
          "|---|---|---|\n" +
          "| 초 단위 | `start.second` · `end.second` | 시각은 연·월·일·시·분·초 |\n" +
          "| 시각마다 달력 | `onPickStart` · `onPickEnd` | 달력 패널은 시작 > 종료 · 최대 기간 초과 날짜를 미리 흐리게 막는다 |\n" +
          "| 구간 길이 드롭다운 | `durations` · `duration` · `onDurationChange` | 언제나 종료 시각에서 거꾸로 · 갱신/라이브 «최근 N분», 고정 «N분», 목록 밖 «직접 지정» · 고르는 것만으로 갱신/고정은 안 바뀐다 |\n" +
          "| 📌 고정 버튼 | `rangeControl=\"pin\"` + `onRangeModeChange` | 눌리면 고정, 떼면 갱신 |\n" +
          "| 라이브 토글 | `live` + `onLive` | ▶ 시작 · ■ 중지 — 중지하면 멈춘 순간의 구간으로 고정 |\n" +
          "| 직접 입력 = 고정 | `onStartChange` · `onEndChange` | 직접 입력 · 달력 · 이전/다음 → 고정, 라이브 중이면 라이브 중지 |\n\n" +
          "들어올 때는 링크에 담긴 구간 → 고정해 둔 구간 → «최근 5분» 순서. 고정해 둔 구간으로 열면 셀렉터 아래에 안내 한 줄(Notice)을 띄웁니다.",
      },
    },
  },
  argTypes: {
    title: { description: "상단 제목. 기본 '시간'.", control: "text" },
    durationLabel: { description: "녹색 알약 태그 ('10분', '30분' 등).", control: "text" },
    rangeControl: {
      description: "갱신/고정 토글 모양 — segmented([갱신 | 고정] 두 칸, 기본) · pin(📌 고정 버튼 하나, 정본).",
      control: "inline-radio",
      options: ["segmented", "pin"],
    },
    live: { description: "라이브 상태. 넘기면 라이브 버튼이 ▶ 시작 / ■ 중지 토글이 된다.", control: "boolean" },
    durations: { description: "구간 길이 목록(분). 넘기면 초록 알약이 드롭다운이 된다.", control: "object" },
    duration: { description: "지금 구간 길이(분). 목록 밖이면 «직접 지정».", control: "number" },
    rangeMode: {
      description: "«최근 N분» 의 검색 동작 표시 — rolling(갱신) · fixed(고정). 비우면 표시 없음(기존 모양). 시안.",
      control: "inline-radio",
      options: [undefined, "rolling", "fixed"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof TimeRangeSelector>;

/** 기본 — 10분 범위, 라이브 토큰. */
export const TenMinute: Story = {
  args: { durationLabel: "10분" },
};

/** 30분 범위. */
export const ThirtyMinute: Story = {
  args: {
    durationLabel: "30분",
    start: { year: "2026", month: "05", day: "15", hour: "13", minute: "07" },
    end: { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  },
};

/** 1시간 범위. */
export const OneHour: Story = {
  args: {
    durationLabel: "1시간",
    start: { year: "2026", month: "05", day: "15", hour: "12", minute: "37" },
    end: { year: "2026", month: "05", day: "15", hour: "13", minute: "37" },
  },
};

/** 제목 없음 — inline 사용. */
export const NoTitle: Story = {
  args: { title: "", durationLabel: "10분" },
};

/** 커스텀 제목 — 분석 도구용. */
export const CustomTitle: Story = {
  args: { title: "분석 범위", durationLabel: "1시간" },
};

/**
 * 입력값 padding 미적용 — 표시 시 자동 `YYYY-MM-DD HH:MM` 정규화.
 * `month: "5"`, `day: "9"`, `hour: "3"`, `minute: "7"` 같은 단일자리 값이 들어와도 화면에는 `05-09 03:07` 로 표시.
 */
export const AutoPadding: Story = {
  args: {
    durationLabel: "10분",
    start: { year: "2026", month: "5", day: "9", hour: "3", minute: "7" },
    end:   { year: "2026", month: "5", day: "9", hour: "3", minute: "17" },
  },
};

/* ═══════════════════ 🧪 시안 — «최근 N분» 의 갱신 · 고정 ═══════════════════ */

/* 셀렉터는 부모 폭만큼 늘어난다(기존 동작). 시안에서는 내용 폭으로 세워 오른쪽 끝 표시가 박스 끝에 붙게 한다. */
const fit: Decorator = (Story) => (
  <div className="w-fit">
    <Story />
  </div>
);

/**
 * **시안 · 갱신 표시.** 셀렉터 오른쪽 끝의 «↻ 갱신» 은 «검색을 누를 때마다 그 순간을 끝점으로 구간을 다시 계산한다» 는 뜻입니다.
 * 마우스를 올리면 설명이 뜹니다. 사용자가 바꿀 수 없는(토글 없는) 모양입니다.
 */
export const Proposal_Rolling: Story = {
  name: "시안 · 갱신 표시",
  args: { durationLabel: "최근 10분", rangeMode: "rolling" },
  decorators: [fit],
};

/**
 * **시안 · 고정 표시.** «📌 고정» 은 «처음 고른 구간을 그대로 다시 조회한다» 는 뜻입니다.
 * 캘린더나 직접 입력으로 구간을 골랐을 때는 항상 이 모양입니다(기존과 같은 동작, 표시만 생김).
 */
export const Proposal_Fixed: Story = {
  name: "시안 · 고정 표시 (캘린더 · 직접 입력)",
  args: {
    durationLabel: "1시간",
    rangeMode: "fixed",
    start: { year: "2026", month: "10", day: "25", hour: "13", minute: "00" },
    end: { year: "2026", month: "10", day: "25", hour: "14", minute: "00" },
  },
  decorators: [fit],
};

function ModeToggleDemo() {
  const [mode, setMode] = useState<TimeRangeMode>("rolling");
  return (
    <div className="flex flex-col gap-8px w-fit">
      <TimeRangeSelector durationLabel="최근 10분" rangeMode={mode} onRangeModeChange={setMode} />
      <span className="text-sm text-tertiary">
        지금: {mode === "rolling" ? "갱신 — 다음 검색 때 구간이 새로 계산됩니다" : "고정 — 다음 검색에도 같은 구간을 봅니다"}
      </span>
    </div>
  );
}

/**
 * **시안 · 사용자가 직접 전환 ([검토 필요]).** `[갱신 | 고정]` 두 칸 중 하나를 눌러 동작을 바꿉니다.
 * 이 전환을 허용할지는 아직 정해지지 않았습니다. 허용하면 «기존처럼 고정으로 쓰고 싶은» 사용자 · 온프레미스 고객이
 * 스스로 바꿀 수 있어서 별도 설정 옵션의 필요가 줄어듭니다. 허용하지 않으면 바로 위 «갱신 표시» 모양만 씁니다.
 */
export const Proposal_ModeToggle: Story = {
  name: "시안 · 갱신 ↔ 고정 전환 [검토 필요]",
  render: () => <ModeToggleDemo />,
};

/* 회의용 가상 시계 — 첫 화면은 항상 같은 시각(스냅샷 고정), 그 뒤로는 실제로 흐른다. */
const BASE = new Date(2026, 9, 26, 10, 5, 12).getTime();
const PRESETS = [5, 10, 30, 60] as const;
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
const presetLabel = (m: number) => (m >= 60 ? `${m / 60}시간` : `${m}분`);

type Range = { from: number; to: number };

function SearchFlowDemo() {
  const mountedAt = useRef(Date.now());
  const now = () => BASE + (Date.now() - mountedAt.current);

  const [minutes, setMinutes] = useState<number>(5);
  const [custom, setCustom] = useState(false);
  const [mode, setMode] = useState<TimeRangeMode>("rolling");
  const [range, setRange] = useState<Range>({ from: BASE - 5 * 60_000, to: BASE });
  const [queriedAt, setQueriedAt] = useState(BASE);
  const [changed, setChanged] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // 조회 — 중복 클릭은 로딩 동안 막는다. 갱신이면 그 순간(초 포함)을 끝점으로 다시 계산.
  // next 가 있으면 사용자가 새 구간을 고른 것(프리셋 · 달력 · 이동) — «새로 계산 / 그대로» 문구는 검색 재실행에만 단다.
  const run = (next: Range | null) => {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const t = now();
      const r = next ?? (!custom && mode === "rolling" ? { from: t - minutes * 60_000, to: t } : range);
      setChanged(next ? null : r.from !== range.from || r.to !== range.to);
      setRange(r);
      setQueriedAt(t);
      setLoading(false);
    }, 600);
  };

  const pickPreset = (m: number) => {
    setMinutes(m);
    setCustom(false);
    const t = now();
    run({ from: t - m * 60_000, to: t });
  };

  const pickCalendar = () => {
    setCustom(true);
    run({ from: new Date(2026, 9, 25, 13, 0, 0).getTime(), to: new Date(2026, 9, 25, 14, 0, 0).getTime() });
  };

  const shift = (dir: -1 | 1) => {
    const span = range.to - range.from;
    setCustom(true);
    run({ from: range.from + dir * span, to: range.to + dir * span });
  };

  const effectiveMode: TimeRangeMode = custom ? "fixed" : mode;

  return (
    <div className="flex flex-col gap-12px" style={{ maxWidth: 720 }}>
      <div className="flex items-end gap-8px flex-wrap">
        <TimeRangeSelector
          start={parts(range.from)}
          end={parts(range.to)}
          durationLabel={custom ? presetLabel(Math.round((range.to - range.from) / 60_000)) : `최근 ${presetLabel(minutes)}`}
          rangeMode={effectiveMode}
          onRangeModeChange={custom ? undefined : setMode}
          onPickDate={pickCalendar}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
        />
        <Button variant="contained" tone="primary" size="lg" loading={loading} onClick={() => run(null)}>
          검색
        </Button>
      </div>

      <div className="flex items-center gap-4px">
        <span className="text-sm text-tertiary" style={{ marginRight: 4 }}>바로 조회</span>
        {PRESETS.map((m) => (
          <Button
            key={m}
            size="lg"
            variant={!custom && m === minutes ? "outline" : "basic"}
            tone="primary"
            disabled={loading}
            onClick={() => pickPreset(m)}
          >
            {presetLabel(m)}
          </Button>
        ))}
      </div>

      <div className="bg-card p-16px flex flex-col gap-8px" style={{ borderRadius: "var(--radius-md)" }}>
        <div className="flex items-center gap-8px flex-wrap">
          <TimeChip label="조회 구간" value={`${hms(range.from)} ~ ${hms(range.to)}`} />
          <TimeChip label="조회 시각" value={hms(queriedAt)} />
          {changed !== null && (
            <span className="text-sm text-secondary">
              {changed ? "구간을 새로 계산했습니다" : "같은 구간을 다시 조회했습니다"}
            </span>
          )}
        </div>
        <span className="text-base text-tertiary">결과 영역(예시) — 이 자리에 로그 목록 · 차트가 옵니다.</span>
      </div>
    </div>
  );
}

/**
 * **시안 · 검색 흐름 (직접 눌러 보세요).** 첫 화면은 10:05:12 기준 «최근 5분» 입니다. 시계는 실제로 흐릅니다.
 *
 * 1. **검색**을 몇 초 간격으로 눌러 보세요. 갱신이면 «조회 구간» 끝점이 매번 지금으로 옮겨지고(초 단위라 1분 안에 눌러도 바뀝니다), 고정이면 구간은 그대로이고 «조회 시각» 만 바뀝니다.
 * 2. 셀렉터 오른쪽 `[갱신 | 고정]` 을 바꾼 뒤 다시 검색해 보세요.
 * 3. **바로 조회**의 «10분 · 30분 …» 은 누르는 즉시 조회합니다 — 시간 고르기와 검색 두 단계가 한 단계가 됩니다.
 * 4. **달력 아이콘**(어제 13:00~14:00 을 고른 것으로 가정)이나 **‹ ›** 이동을 누르면 고른 구간이 되므로 «고정» 으로 바뀌고 전환 토글이 사라집니다.
 * 5. 조회 중(로딩)에는 검색 · 바로 조회 버튼이 막힙니다 — 연속 클릭으로 요청이 쌓이지 않게 하는 장치입니다.
 */
export const Proposal_SearchFlow: Story = {
  name: "시안 · 검색 흐름 (조회 구간 표시)",
  parameters: { layout: "padded" },
  render: () => <SearchFlowDemo />,
};

/**
 * **시안 · 바뀐 동작 최초 1회 안내.** 기본 동작을 «갱신» 으로 바꾸게 되면, 기존 사용자에게는 «같은 버튼이 다르게 동작하는» 변화입니다.
 * 그래서 처음 한 번 결과 위에 안내 카드를 띄우고, 예전처럼 쓰고 싶은 사람에게 «고정으로 쓰기» 길을 줍니다.
 * 한 번 닫거나 고르면 다시 띄우지 않습니다(어디에 기억할지는 제품 쪽 결정). 기본 동작을 바꾸지 않기로 하면 이 카드는 필요 없습니다.
 */
export const Proposal_FirstTimeNotice: Story = {
  name: "시안 · 바뀐 동작 최초 1회 안내",
  render: () => (
    <div className="flex flex-col gap-12px" style={{ maxWidth: 720 }}>
      <div className="w-fit">
        <TimeRangeSelector durationLabel="최근 5분" rangeMode="rolling" onRangeModeChange={() => {}} />
      </div>
      <Notice
        tone="primary"
        title="«최근 N분» 은 이제 검색할 때마다 지금 시각 기준으로 다시 계산됩니다"
        description="예전처럼 처음 고른 구간을 그대로 보려면 시간 선택기 오른쪽에서 «고정» 을 고르세요."
        action={
          <Button variant="outline" size="sm" tone="primary">
            고정으로 쓰기
          </Button>
        }
      />
    </div>
  ),
};

/**
 * **시안 · 긴 구간 경고.** 아주 긴 구간(예: 로그 7일 초과)은 조회가 오래 걸리고 서버에 부담을 줍니다.
 * 바로 조회를 보내지 않고 결과 위에서 한 번 알리고, 사용자가 «그래도 조회» 를 눌렀을 때만 보냅니다.
 * 기준 값(7일)은 예시이며 제품마다 엔지니어링이 정합니다.
 */
export const Proposal_LongRangeWarning: Story = {
  name: "시안 · 긴 구간 경고",
  render: () => (
    <div className="flex flex-col gap-12px" style={{ maxWidth: 720 }}>
      <div className="w-fit">
        <TimeRangeSelector
          durationLabel="14일"
          rangeMode="fixed"
          start={{ year: "2026", month: "10", day: "12", hour: "10", minute: "00" }}
          end={{ year: "2026", month: "10", day: "26", hour: "10", minute: "00" }}
        />
      </div>
      <Notice
        tone="warning"
        title="고른 구간이 14일로, 권장 범위(7일)를 넘습니다"
        description="조회가 오래 걸릴 수 있습니다. 구간을 줄이거나, 이대로 조회하세요."
        action={
          <Button variant="outline" size="sm" tone="warning">
            그래도 조회
          </Button>
        }
      />
    </div>
  ),
};

/* ═══════════════════ ✅ 동작 정본 (2026-10-28) ═══════════════════ */

const LENGTHS = [5, 10, 30, 60, 180, 360, 720, 1440];
const partsS = (t: number) => ({ ...parts(t), second: p2(new Date(t).getSeconds()) });
const noop = () => {};
/** DateParts → 시각(ms). 고쳐 쓰는 도중의 덜 찬 값이면 NaN. */
const timeOf = (p: { year: string; month: string; day: string; hour: string; minute: string; second?: string }) =>
  new Date(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +(p.second ?? 0)).getTime();

function StateRow({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6px">
      <span className="text-sm font-medium text-secondary">{caption}</span>
      <div className="w-fit">{children}</div>
    </div>
  );
}

/**
 * **정본 · 상태 한눈에.** 기획 «[타임 셀렉터] 동작 제안» 이 정한 조각을 모두 켠 모양입니다 —
 * 시각은 초까지, 달력은 시작 · 종료 시각마다, 구간 길이는 초록 알약 드롭다운, 갱신/고정은 📌 버튼 하나, 라이브는 ▶ / ■ 토글.
 *
 * | 상태 | 알약 | 📌 | 라이브 버튼 |
 * |---|---|---|---|
 * | 갱신 | 최근 10분 | 안 눌림 | ▶ |
 * | 고정 | 10분 | 눌림(파랑) | ▶ |
 * | 라이브 중 | 최근 10분 | 안 눌림 | ■ |
 * | 직접 지정(목록 밖 길이) | 직접 지정 | 눌림 | ▶ |
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
 * - **📌** — 누르면 고정, 떼면 갱신(지금 기준으로 다시 계산).
 * - **▶ / ■** — 라이브 시작 / 중지. 중지하면 멈춘 순간의 구간으로 고정됩니다.
 */
export const Canon_Flow: Story = {
  name: "정본 · 동선 (직접 눌러 보세요)",
  parameters: { layout: "padded" },
  render: () => <CanonFlowDemo />,
};
