import { TOPOLOGY_ZOOM } from "./layout";

/**
 * TopologyZoomControl — Primitives. `− 17% +` 형태의 배율 조절 컨트롤.
 *
 * ## Purpose
 * 캔버스 배율을 한 단계씩 올리고 내리며 현재 배율을 백분율로 보여준다. 휠 확대와 **같은
 * 상·하한**(`TOPOLOGY_ZOOM`)을 쓰므로 두 경로가 어긋나지 않는다.
 *
 * ## When to use
 * - [[TopologyCanvas]] 위에 얹는 뷰포트 컨트롤(보통 미니맵 하단).
 *
 * ## When NOT to use
 * - 값 증감 일반 폼 컨트롤 → `TextField` + 스텝퍼.
 * - 페이지 확대(브라우저 줌) — 그건 캔버스 배율이 아니다.
 *
 * ## Composition rules
 * - **상태를 갖지 않는다** — `scale` 을 받고 `onScaleChange` 로 올려보낸다. 캔버스·미니맵과
 *   같은 뷰포트 상태를 공유해야 하므로 자체 상태를 두면 어긋난다.
 * - 상·하한에 도달하면 해당 버튼을 `disabled` — 눌러도 안 변하는 버튼을 살려두지 않는다.
 * - 배율 표시는 `.font-numeric .tabular-nums` — 17%↔100% 로 바뀔 때 폭이 흔들리지 않게.
 *
 * @example
 * ```tsx
 * <TopologyZoomControl scale={view.scale} onScaleChange={(s) => setView({ ...view, scale: s })} />
 * ```
 */
export default function TopologyZoomControl({
  scale,
  onScaleChange,
}: {
  /** 현재 배율(1 = 100%). */
  scale: number;
  onScaleChange: (next: number) => void;
}) {
  const step = (delta: number) =>
    onScaleChange(
      Math.min(
        TOPOLOGY_ZOOM.max,
        Math.max(TOPOLOGY_ZOOM.min, Math.round((scale + delta) * 100) / 100),
      ),
    );

  return (
    <div className="flex items-center justify-between gap-8px h-32px px-8px bg-card rounded-lg shadow-xs">
      <button
        type="button"
        aria-label="축소"
        disabled={scale <= TOPOLOGY_ZOOM.min}
        onClick={() => step(-TOPOLOGY_ZOOM.step)}
        className="text-md text-secondary cursor-pointer border-none bg-transparent p-0"
      >
        −
      </button>
      <span className="text-sm text-secondary font-numeric tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        aria-label="확대"
        disabled={scale >= TOPOLOGY_ZOOM.max}
        onClick={() => step(TOPOLOGY_ZOOM.step)}
        className="text-md text-secondary cursor-pointer border-none bg-transparent p-0"
      >
        +
      </button>
    </div>
  );
}
