/**
 * InstanceListItem — 인스턴스 목록 한 행 (상태 dot + 클러스터 배지 + 이름). Primitives layer.
 *
 * ## Purpose
 * 인스턴스 선택 목록에서 한 대상을 그리는 행. 왼쪽 dot 이 살아있는지를, 파란 원형 배지가
 * 클러스터 소속인지를, 배경이 지금 고른 것인지를 각각 나눠 말한다.
 *
 * ## When to use
 * - [[InstanceSelectPanel]] 의 목록 행.
 * - 같은 모양이 필요한 다른 대상 선택 목록(노드·에이전트).
 *
 * ## When NOT to use
 * - 선택된 값을 접어 보여주는 트리거 → [[OptionbarInstanceSelector]].
 * - 다중 선택 체크 목록 → [[FilterDropdownOptionItem]].
 *
 * ## Composition rules
 * - dot 색은 `status` 매핑 고정 (활성 success · 비활성 border-divider).
 * - 클러스터 배지는 `cluster` 가 참일 때만. 배지 글자는 한 자(예: "C").
 * - 선택 행은 배경 `--color-status-info-soft` + 이름 brand-blue. 체크 표시는 쓰지 않는다(단일 선택).
 * - 이름은 truncate — 목록 폭이 이름을 자르지 행을 늘리지 않는다.
 *
 * @example
 * ```tsx
 * <InstanceListItem name="dmx-rac19-1" cluster selected onClick={pick} />
 * <InstanceListItem name="dmx-3-11" status="idle" onClick={pick} />
 * ```
 */

export type InstanceListItemStatus = "active" | "idle";

export type InstanceListItemProps = {
  /** 인스턴스 이름. */
  name: string;
  /** 수집 상태 — active(초록) / idle(회색). 기본 active. */
  status?: InstanceListItemStatus;
  /** 클러스터 소속 배지 노출. */
  cluster?: boolean;
  /** 클러스터 배지 글자. 기본 "C". */
  clusterLabel?: string;
  /** 선택 상태. */
  selected?: boolean;
  onClick?: () => void;
};

export default function InstanceListItem({
  name,
  status = "active",
  cluster = false,
  clusterLabel = "C",
  selected = false,
  onClick,
}: InstanceListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex items-center w-full text-left cursor-pointer transition-colors hover-bg-surface-100"
      style={{
        gap: 8,
        padding: "6px 12px",
        border: "none",
        background: selected ? "var(--color-status-info-soft)" : "transparent",
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: 8,
          height: 8,
          flex: "0 0 auto",
          background:
            status === "active"
              ? "var(--color-status-success)"
              : "var(--color-border-divider)",
        }}
      />
      {cluster && (
        <span
          className="flex items-center justify-center rounded-full text-xs font-bold"
          data-ds-policy-ok="컬러 위 고정 흰색 전경"
          style={{
            width: 16,
            height: 16,
            flex: "0 0 auto",
            background: "var(--color-brand-blue)",
            // raw-color-ok: 브랜드 블루로 채운 원형 배지 안 전경 — 테마와 무관하게 흰색이어야 한다.
            color: "#fff",
          }}
        >
          {clusterLabel}
        </span>
      )}
      <span
        className={`text-base truncate ${selected ? "text-brand-blue font-medium" : "text-primary"}`}
      >
        {name}
      </span>
    </button>
  );
}
