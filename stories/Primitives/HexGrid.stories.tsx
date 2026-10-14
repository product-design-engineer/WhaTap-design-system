import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { HEX_GRID_LEGEND, HexGrid, WidgetFrame, hexGridLegend } from "@whatap/design-system";
import type { HexItem, HexTone } from "@whatap/design-system";

/**
 * Stories for [[HexGrid]] — 디바이스를 헥사곤으로 배치하는 리소스 맵.
 *
 * active 유닛은 차트 계열 1 로 채워지고, 그 위 외곽선·글로우는 테마와 무관한 흰색 전경이다
 * (허용 예외 — 소스에 `raw-color-ok` + `data-ds-policy-ok` 두 채널로 표기).
 *
 * 상호작용(`onSelect` · `renderTooltip` · `highlightIds`)은 opt-in 이다. 주지 않으면 GPU 맵처럼 정적으로 그린다.
 */
const TONES: HexTone[] = ["active", "active", "idle", "active", "warning", "active", "idle", "critical"];
const make = (n: number): HexItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `gpu-${i}`, label: String(i), tone: TONES[i % TONES.length] }));

const meta: Meta<typeof HexGrid> = {
  title: "Primitives/Chart · HexGrid",
  component: HexGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    columns: { control: { type: "number", min: 2, max: 12, step: 1 } },
    radius: { control: { type: "number", min: 12, max: 40, step: 2 } },
  },
  decorators: [(Story) => (<div style={{ width: 420, height: 260 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof HexGrid>;

/** 기본 — 16개 디바이스, 4가지 tone. */
export const Default: Story = {
  args: { items: make(16), columns: 6 },
};

/** active / idle 만 — 가동 현황. */
export const ActiveIdle: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({ id: `gpu-${i}`, label: String(i), tone: i < 8 ? "active" : "idle" })),
    columns: 6,
  },
};

/** 큰 유닛 — `radius` 로 크기 조정. */
export const LargeRadius: Story = {
  args: { items: make(8), columns: 4, radius: 32 },
};

/** 대시보드 칸 — `frame={false}` 로 껍데기를 끄고 [[WidgetFrame]] 에 담는다. 범례는 `HEX_GRID_LEGEND` 를 WidgetFrame `legend` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 420, height: 260 }}>
      <WidgetFrame title="GPU Map" legend={HEX_GRID_LEGEND} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <HexGrid items={make(16)} columns={6} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/* ── 서버 맵 데모 데이터: 라벨 없는 칸 · 툴팁에 쓸 지표 ── */
type Server = HexItem & { cpu: number; memory: number; rule: string; verdict: string };
const SERVER_TONES: HexTone[] = ["warning", "critical", "warning", "warning", "warning", "warning", "warning", "warning", "critical", "warning", "warning", "critical", "warning", "warning"];
const SERVERS: Server[] = SERVER_TONES.map((tone, i) => {
  const host = `ip-10-21-13-${101 + i * 7}`;
  return {
    id: host,
    ariaLabel: `${host} · ${tone}`,
    tone,
    cpu: tone === "critical" ? 80 + i : 5 + i * 2,
    memory: tone === "critical" ? 88 + (i % 8) : 20 + i * 3,
    rule: tone,
    verdict: tone === "critical" ? "주의 (심각)" : i % 4 === 0 ? "주의" : "관찰",
  };
});
const byId = new Map(SERVERS.map((s) => [s.id, s]));

/** 툴팁 내용. 첫 줄 호스트, 그 아래 「라벨: 값」 줄. 상자는 HexGrid 가 그린다. */
function ServerTip({ id, hint }: { id: string; hint?: string }) {
  const s = byId.get(id);
  if (!s) return null;
  const rows: [string, string][] = [
    ["경고 룰", s.rule],
    ["헬스체크", s.verdict],
    ["CPU", `${s.cpu}%`],
    ["Memory", `${s.memory}%`],
  ];
  return (
    <div className="flex flex-col gap-2px">
      <span className="text-md font-medium text-primary font-numeric">{s.id}</span>
      {rows.map(([k, v]) => (
        <span key={k} className="text-sm text-secondary">
          {k}: <span className="font-bold text-primary">{v}</span>
        </span>
      ))}
      {hint && <span className="text-sm text-tertiary mt-6px">{hint}</span>}
    </div>
  );
}

const CRITICAL_HOSTS = SERVERS.filter((s) => s.tone === "critical").map((s) => s.id);

/**
 * 상호작용. `onSelect`(헥사곤이 버튼이 된다 · Tab · Enter/Space) · `renderTooltip`(hover · 포커스한 칸에 붙는 상자) ·
 * `highlightIds`(배너 칩이 가리키는 칸만 남기고 0.18 로 흐린다. hover 흐림 0.32 보다 우선).
 */
export const Interactive: Story = {
  render: function Render() {
    const [highlight, setHighlight] = useState<boolean>(true);
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div className="flex flex-col gap-8px" style={{ width: 420, height: 260 }}>
        <div className="flex items-center gap-8px text-sm text-secondary">
          <label className="flex items-center gap-4px">
            <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
            Critical 만 하이라이트
          </label>
          <span className="text-tertiary">선택: {picked ?? "없음"}</span>
        </div>
        <div className="flex-1 min-h-0">
          <HexGrid
            items={SERVERS}
            columns={5}
            highlightIds={highlight ? CRITICAL_HOSTS : null}
            onSelect={(it) => setPicked(it.id)}
            renderTooltip={(it) => <ServerTip id={it.id} hint="클릭하면 이 서버 원인 진단" />}
          />
        </div>
      </div>
    );
  },
};

/**
 * 서버 맵 칸. `frame={false}` 로 [[WidgetFrame]] 에 담고, 범례는 `hexGridLegend(items, labels)` 로 칸 수를 붙인다
 * (`Critical 3`). 칠해진 톤을 세고, 0 개인 톤도 줄은 남는다.
 */
export const InWidgetFrameServerMap: Story = {
  render: function Render() {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div style={{ width: 420, height: 280 }}>
        <WidgetFrame
          title="Server Status Map"
          legend={hexGridLegend(SERVERS, { active: "Normal", idle: "Inactive" })}
          summary={picked ? `선택 ${picked}` : undefined}
          onFullscreen={() => {}}
          menu={[{ key: "detail", label: "상세로 이동" }]}
        >
          <HexGrid
            items={SERVERS}
            columns={5}
            frame={false}
            onSelect={(it) => setPicked(it.id)}
            renderTooltip={(it) => <ServerTip id={it.id} />}
          />
        </WidgetFrame>
      </div>
    );
  },
};
