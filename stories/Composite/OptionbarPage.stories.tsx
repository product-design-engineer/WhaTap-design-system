import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DateTimeBlock,
  OptionbarInstanceSelector,
  OptionbarPage,
  TextField,
} from "@whatap/design-system";

/**
 * Stories for [[OptionbarPage]] — 페이지 우측 옵션 패널 (composite).
 */
const meta: Meta<typeof OptionbarPage> = {
  title: "Composite/OptionbarPage",
  component: OptionbarPage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**페이지 상단 옵션바 행 — composite chrome.** LiveTimerCompact + OptionbarInstanceSelector + " +
          "DataBase 값 + PresetSelect 를 한 행으로 묶음. DB / Server / APM 모든 모니터링 페이지에서 동일하게 사용.\n\n" +
          "**기본값:** `layout=\"inline\"`(타이틀이 값 좌측) + `size=\"sm\"`(컨트롤 24px). 행 컨테이너는 " +
          "`size` 와 무관하게 **40px 고정** — SubHeaderBar·사이드바 스위처와 같은 40px 라인.\n\n" +
          "✅ **Do** — 기본값 그대로 사용 · 행 단위로 `size` 를 하나만 지정(하위 4종에 일괄 전달) · 세로 공간이 " +
          "넉넉한 자리에서만 `size=\"md\"`(32px) 또는 `layout=\"stack\"` · 폭이 상황에 따라 변하는 화면(AI 위젯 개폐)은 `layout=\"auto\"`\n\n" +
          "**필드 교체:** `items`(`{ title, content, alignEnd? }[]`) 를 주면 기본 4항목 대신 그 목록만 렌더한다 — " +
          "페이지마다 다른 옵션(시작일·큐브 지표 등)을 같은 행 규격으로 표현할 때 쓴다. `content` 는 호출부가 만들고, " +
          "행의 모든 컨트롤에 같은 `size` 를 넘겨야 baseline 이 맞는다.\n\n" +
          "❌ **Don't** — 컨트롤마다 다른 `size` 지정(baseline 어긋남) · 행 높이를 padding 으로 만들기 · " +
          "inline `<div>` 로 옵션바 재구현 · 값 칩에 상태 톤 주기(값 칩은 `neutral` 만)",
      },
    },
  },
  argTypes: {
    liveTime: { description: "LIVE 시계 표시 문자열. 미지정 시 시스템 시각.", control: "text" },
    durationLabel: { description: "LiveTimer duration 알약 ('10분', '30분').", control: "text" },
    paused: { description: "LiveTimer 일시정지 상태.", control: "boolean" },
    instanceLabel: { description: "선택된 인스턴스 라벨.", control: "text" },
    instanceStatus: {
      description: "인스턴스 상태 dot.",
      control: { type: "radio" },
      options: ["ok", "warn", "error", "idle"],
    },
    databaseLabel: { description: "데이터베이스 라벨 (단순 텍스트).", control: "text" },
    presetLabel: { description: "프리셋 라벨.", control: "text" },
    items: {
      description:
        "필드 구성 교체 — 주면 기본 4항목(시간·인스턴스·데이터베이스·프리셋) 대신 이 목록만 렌더한다. " +
        "`{ title, content, alignEnd? }` 배열. 미지정이면 기존 동작 그대로.",
      control: false,
    },
    layout: {
      description:
        "항목 배치 — inline(타이틀을 값 좌측, **기본**) / stack(타이틀 위·값 아래) / auto(행 폭으로 자동 전환).",
      control: { type: "radio" },
      options: ["stack", "inline", "auto"],
    },
    size: {
      description: "행 전체 chrome 높이 — sm(24px, 기본) / md(32px). 모든 하위 컨트롤에 일괄 전달.",
      control: { type: "radio" },
      options: ["sm", "md"],
    },
  },
  decorators: [(Story) => (<div style={{ width: 1080 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof OptionbarPage>;

/** 라이브 기본값 — DB 모니터링 페이지 옵션바. */
export const DbMonitoring: Story = {
  args: {
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

/** Warning 상태 — 인스턴스 status warn. */
export const InstanceWarning: Story = {
  args: {
    durationLabel: "30분",
    instanceLabel: "DMX-3-12-950",
    instanceStatus: "warn",
    databaseLabel: "ORA11K",
    presetLabel: "운영 — 주간",
  },
};

/**
 * `size="md"` — 컨트롤만 32px 로 올린 변형. 행 자체는 40px 고정이라 라인은 그대로 유지된다.
 * (기본은 `layout="inline"` + `size="sm"`.)
 */
export const SizeMedium: Story = {
  args: {
    size: "md",
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

/** `layout="stack"` — 타이틀 위·값 아래 세로 스택. 세로 폭이 넉넉한 자리에서만. */
export const StackLayout: Story = {
  decorators: [(Story) => (<div style={{ width: 280 }}><Story /></div>)],
  args: {
    layout: "stack",
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

/** 일시정지 + Error — 셀렉터 error 색. */
export const PausedError: Story = {
  args: {
    paused: true,
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-951",
    instanceStatus: "error",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

/**
 * `layout="auto"` — 행 폭이 넉넉하면 라벨을 값 왼쪽에, 좁아지면 위로 접는다.
 *
 * 아래 두 상자는 **같은 props** 이고 폭만 다르다. 실제 화면에서는 AI 위젯(480px)이 열려
 * 행이 좁아지는 순간 아래 모양으로 바뀐다 — 뷰포트가 아니라 행 폭을 보기 때문이다.
 */
export const AutoLayout: Story = {
  render: () => (
    <div className="flex flex-col gap-24px">
      {[1200, 700].map((w) => (
        <div key={w} className="flex flex-col gap-6px" style={{ width: w }}>
          <span className="text-sm text-tertiary">가용 폭 {w}px</span>
          <OptionbarPage
            layout="auto"
            durationLabel="10분"
            instanceLabel="dmx-rac19-1"
            instanceStatus="ok"
            databaseLabel="ORA11K"
            presetLabel="Default"
          />
        </div>
      ))}
    </div>
  ),
};

/** 검색 아이콘 — 큐브 지표 필드 leadingIcon. */
const SearchIcon = () => (
  <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
    <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
    <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

/** 임의 필드 3종 — 시작일 · 인스턴스 · 큐브 지표. 스토리 두 곳에서 공유한다. */
const CUBE_FIELDS = [
  {
    title: "시작일",
    content: (
      <DateTimeBlock
        parts={{ year: "2026", month: "08", day: "19", hour: "00", minute: "00" }}
        side="start"
      />
    ),
  },
  {
    title: "인스턴스",
    content: <OptionbarInstanceSelector title="" size="sm" label="dmx-rac19-1" status="ok" />,
  },
  {
    title: "큐브 지표",
    content: (
      <TextField size="sm" value="[XOS] CPU" onChange={() => {}} leadingIcon={<SearchIcon />} />
    ),
  },
];

/**
 * `items` — 임의 필드 구성. 기본 4항목(시간·인스턴스·데이터베이스·프리셋) 대신
 * **시작일 · 인스턴스 · 큐브 지표** 를 같은 행 규격으로 렌더한다.
 *
 * 라벨은 `layout="inline"`(기본) 이 값 **좌측**에 붙인다 — 라벨 배치는 행이 소유하므로
 * 각 컨트롤의 자체 `label` prop 은 쓰지 않는다(둘 다 주면 라벨이 두 번 나온다).
 *
 * ⚠️ `시작일` 은 등록된 [[DateTimeBlock]](날짜+시각) 을 쓴다. 캘린더 팝업이 붙은 **날짜 전용
 * 입력(DateField)** 은 아직 DS 에 없다 — 필요하면 이 repo 에 먼저 추가한다(소비 측 자작 금지).
 */
export const ArbitraryFields: Story = {
  args: { size: "sm", items: CUBE_FIELDS },
};

/**
 * `items` + `layout="auto"` — **부모 가로 폭이 넉넉하면 라벨을 인라인(좌측)으로,
 * 좁으면 위로 접는다.** 기준은 뷰포트가 아니라 행이 실제로 쓸 수 있는 폭(container query,
 * 임계 880px) — AI 위젯이 열려 행이 좁아지는 순간 같은 화면에서도 라벨이 접힌다.
 *
 * 아래 두 상자는 **같은 props** 이고 폭만 다르다.
 */
export const ArbitraryFieldsAuto: Story = {
  render: () => (
    <div className="flex flex-col gap-24px">
      {[1200, 700].map((w) => (
        <div key={w} className="flex flex-col gap-6px" style={{ width: w }}>
          <span className="text-sm text-tertiary">
            가용 폭 {w}px — {w >= 880 ? "라벨 인라인(좌측)" : "라벨 위로 접힘"}
          </span>
          <OptionbarPage layout="auto" size="sm" items={CUBE_FIELDS} />
        </div>
      ))}
    </div>
  ),
};
