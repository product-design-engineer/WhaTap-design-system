/**
 * BlockCell — 이름이 들어간 상태 칸 하나. 상태 색으로 칠하고 대상 이름을 칸 안에 쓴다. Primitives layer.
 *
 * ## Purpose
 * 이름으로 대상을 찾아야 하는 상태 맵의 칸. 라이브 서버 인벤토리 맵은 3D 입체 블록에 서버명을 넣었는데, 입체 장식이 칸 면적을
 * 먹어 이름이 `EC2AM…` 로 잘렸다(patterns §21). 평면 사각 칸으로 이름 자리를 넓히고, 잘리면 전체 이름을 `title` 로 보인다.
 *
 * ## When to use
 * - [[BlockGrid]] 의 칸. 대상 하나 = 칸 하나.
 * - 이름 + 상태 하나를 작은 칸으로 보일 때(목록 옆 미니 맵).
 *
 * ## When NOT to use
 * - 이름 없이 많은 대상의 분포 → [[HexGrid]] 의 헥사곤.
 * - 상태 낱말 표지 → [[Chip]]. 칸은 맵의 단위다.
 *
 * ## Composition rules
 * - 색 · 글자색은 [[HexGrid]] 와 같은 상태 어휘(active · idle · warning · critical, 내부 `_statusTone`) — 두 맵이 같은 말을 한다.
 * - 이름은 `text-sm` · 한 줄 · 말줄임, 전체 이름은 `title`. 색만으로 상태를 말하지 않도록 `aria-label` 에 상태 이름을 함께 넣는다(§23).
 * - `onSelect` 를 주면 버튼이 된다(Tab · Enter/Space · 포커스 링). 없으면 정적 칸.
 * - 입체 장식(3D)은 그리지 않는다 — 장식이 이름 자리를 먹는다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 크기 | 폭 = 격자 칸 · 높이 32 · 반경 4 · 좌우 안쪽 8 |
 * | 칠 · 글자 | active `--color-chart-series-1` · idle `--color-surface-200` · warning `--color-status-warning` · critical `--color-status-error` / 글자 `--color-text-inverse`(idle 은 tertiary) |
 * | 이름 | `text-sm` · medium · 한 줄 말줄임 · 가운데 |
 * | 버튼 | `onSelect` 면 `<button>` · 포커스 `.wds-block-cell:focus-visible` 2px `--color-brand-blue` 바깥 링 |
 * | 접근성 | `aria-label` = 「이름 · 상태」 |
 *
 * @example
 * ```tsx
 * <BlockCell label="EC2AMAZ-7Q1" tone="critical" onSelect={() => open("EC2AMAZ-7Q1")} />
 * ```
 */
import { STATUS_TONE_FILL, STATUS_TONE_LABEL, STATUS_TONE_TEXT, type StatusTone } from "./_statusTone";

export type BlockCellProps = {
  /** 대상 이름 — 칸 안 글자. */
  label: string;
  /** 상태. */
  tone: StatusTone;
  /** 상태 이름 바꾸기(접근성 · 툴팁). 없으면 Active · Idle · Warning · Critical. */
  toneLabel?: string;
  /** 고를 때. 주면 버튼이 된다. */
  onSelect?: () => void;
};

export default function BlockCell({ label, tone, toneLabel, onSelect }: BlockCellProps) {
  const name = `${label} · ${toneLabel ?? STATUS_TONE_LABEL[tone]}`;
  const style = { height: 32, padding: "0 8px", background: STATUS_TONE_FILL[tone], color: STATUS_TONE_TEXT[tone] } as const;
  const text = <span className="block truncate text-sm font-medium text-center w-full">{label}</span>;
  return onSelect ? (
    <button type="button" aria-label={name} title={name} onClick={onSelect} className="wds-block-cell flex items-center w-full min-w-0 rounded-4px cursor-pointer" style={style}>
      {text}
    </button>
  ) : (
    <div role="img" aria-label={name} title={name} className="flex items-center w-full min-w-0 rounded-4px" style={style}>
      {text}
    </div>
  );
}
