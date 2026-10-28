import { TOPOLOGY_BADGE_BG, type TopologyTone } from "./_tokens";

/**
 * TopologyCollapseToggle — Primitives. 토폴로지 노드 좌측의 색 뱃지 겸 펼침/접기 버튼.
 *
 * ## Purpose
 * [[TopologyNode]] 카드 왼쪽에 붙는 40px 폭의 컬러 뱃지. `+`(접힘) / `−`(펼침) 글리프로
 * 그룹의 접힘 상태를 나타내고, 클릭하면 토글한다. 모서리는 **좌상단만 카드 반경, 우하단만
 * 크게** 둥근 비대칭 형태(`.rounded-topology-badge`) — 카드에 파고든 잎(leaf) 모양이
 * 레퍼런스의 시각 서명이다.
 *
 * ## When to use
 * - [[TopologyNode]] 안에서 노드의 tone 을 드러내고 접힘을 토글할 때 (기본 용법).
 * - 그룹이 아닌 리프 노드에도 붙는다 — 그때는 `interactive={false}` 로 장식 뱃지가 된다.
 *
 * ## When NOT to use
 * - 사이드바·트리의 펼침 caret → [[SidebarMenuItem]] (caret 회전 방식).
 * - 일반 아이콘 버튼 → [[ToolbarIconButton]].
 * - 상태만 보여주는 원형 배지 → [[Chip]] / [[AiToneBadge]].
 *
 * ## Composition rules
 * - 색은 **유틸 클래스만** — 배경은 `TOPOLOGY_BADGE_BG` 의 클래스, 전경은 `.text-white`.
 *   인라인 style 로 색을 넣지 않는다(컬러 위 고정 흰색은 정책이 허용하는 예외지만,
 *   그것도 리터럴이 아니라 토큰 클래스로 표현한다).
 * - 높이는 부모 카드가 정한다(`.h-full`) — 자체 높이를 갖지 않는다.
 * - `interactive=false` 면 `<span>` 으로 렌더해 탭 순서·버튼 시맨틱을 만들지 않는다.
 *
 * @example
 * ```tsx
 * <TopologyCollapseToggle collapsed={node.collapsed} tone="alert" onToggle={() => toggle(node.id)} />
 * ```
 */
export default function TopologyCollapseToggle({
  collapsed = false,
  tone = "default",
  interactive = true,
  onToggle,
}: {
  /** 접힘 상태 — true 면 `+`, false 면 `−`. */
  collapsed?: boolean;
  /** 뱃지 배경색 의미. */
  tone?: TopologyTone;
  /** false 면 클릭 불가한 장식 뱃지(리프 노드용). */
  interactive?: boolean;
  onToggle?: () => void;
}) {
  const cls =
    "flex items-center justify-center shrink-0 w-40px h-full rounded-topology-badge " +
    // raw-color-ok: 노드 뱃지 — tone 원색 배경 위 고정 흰색 전경(테마 무관).
    "text-white " +
    TOPOLOGY_BADGE_BG[tone];
  const glyph = (
    <span className="text-lg font-normal">{collapsed ? "+" : "−"}</span>
  );

  if (!interactive) {
    return (
      <span className={cls} data-ds-policy-ok="컬러 위 고정 흰색 전경" aria-hidden="true">
        {glyph}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      data-ds-policy-ok="컬러 위 고정 흰색 전경"
      aria-expanded={!collapsed}
      aria-label={collapsed ? "펼치기" : "접기"}
      className={`${cls} cursor-pointer border-none p-0`}
    >
      {glyph}
    </button>
  );
}
