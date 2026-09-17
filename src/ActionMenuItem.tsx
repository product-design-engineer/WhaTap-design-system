/**
 * ActionMenuItem — [[ActionMenu]] 패널 안에 서는 «행동» 한 줄. Primitives layer.
 *
 * ## Purpose
 * 누르면 무슨 일이 일어나는 한 줄. 값을 고르는 것이 아니라 **일을 시작하는** 자리다.
 * 좌측 아이콘(선택) · 라벨 · 보조 설명 한 줄까지가 전부고, 체크 표시는 없다 —
 * 체크는 「지금 이게 켜져 있다」 는 뜻이라, 누르면 화면이 넘어가는 줄에 붙으면 거짓말이 된다.
 *
 * ## When to use
 * - [[ActionMenu]] 의 `items` 가 렌더하는 각 줄. 보통 직접 부르지 않고 메뉴가 부른다.
 * - 메뉴 본문을 `children` 으로 직접 짤 때, 그 안에서 줄 모양을 맞추려 할 때.
 *
 * ## When NOT to use
 * - 값을 고르는 줄(필터 옵션·다중 선택) → [[FilterDropdownOptionItem]]. 그쪽은 체크가 붙는다.
 * - 화면을 이동하는 좌측 네비 줄 → [[SidebarMenuItem]].
 * - 목록의 한 건(레코드) → [[ListRow]]. 이건 메뉴 줄이지 데이터가 아니다.
 *
 * ## Composition rules
 * - **한 줄은 동사다.** 「AI 보고서」처럼 명사만 두면 고르는 것인지 만드는 것인지 흐려진다.
 *   명사로 둘 수밖에 없으면 `description` 에 무슨 일이 일어나는지 적는다.
 * - `tone="critical"` 은 **되돌릴 수 없는 일**에만 쓴다. 색이 흔해지면 경고가 아니게 된다.
 *   그리고 파괴적 행동은 이 줄에서 끝내지 않는다 — 확인 한 단계를 [[Modal]] 로 받는다
 *   (`docs/patterns.md` P1).
 * - 아이콘을 어떤 줄엔 넣고 어떤 줄엔 빼지 않는다. 한 메뉴 안에서는 전부 넣거나 전부 뺀다 —
 *   섞으면 라벨의 시작선이 어긋나 목록이 두 덩어리로 읽힌다.
 * - 색은 토큰으로만 — 배경은 `--color-surface-100`(hover), 글자는 `--color-text-*`.
 *   hex 를 박으면 다크에서 뒤집힌다.
 *
 * @example
 * ```tsx
 * <ActionMenuItem label="AI 보고서" description="대화로 조건을 잡는다" onSelect={startAi} />
 * <ActionMenuItem label="삭제" tone="critical" onSelect={confirmDelete} />
 * ```
 */
import type { ReactNode } from "react";

/** 줄의 성격. `critical` 은 되돌릴 수 없는 일에만. */
export type ActionMenuItemTone = "default" | "critical";

export type ActionMenuItemProps = {
  /** 줄에 적히는 말. 되도록 동사로. */
  label: ReactNode;
  /** 아래 붙는 보조 한 줄 — 무슨 일이 일어나는지. */
  description?: ReactNode;
  /** 좌측 아이콘. 한 메뉴 안에서는 전부 넣거나 전부 뺀다. */
  icon?: ReactNode;
  /** 누르면 할 일. */
  onSelect?: () => void;
  /** 성격. 기본 default. */
  tone?: ActionMenuItemTone;
  /** 비활성 — 이유를 말할 수 없으면 아예 빼는 편이 낫다. */
  disabled?: boolean;
  /** 외부 className. */
  className?: string;
};

export default function ActionMenuItem({
  label,
  description,
  icon,
  onSelect,
  tone = "default",
  disabled = false,
  className = "",
}: ActionMenuItemProps) {
  const labelColor =
    disabled
      ? "var(--color-text-disabled)"
      : tone === "critical"
        ? "var(--color-status-error)"
        : "var(--color-text-primary)";

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full text-left flex items-start gap-8px ${disabled ? "" : "cursor-pointer hover-bg-surface-100"} transition-colors ${className}`}
      /* padding 유틸(px-12px · py-8px)이 whatap-ds.css 에 없다 — 클래스로 쓰면 조용히 무시되므로 인라인. */
      style={{ padding: "8px 12px", background: "transparent", border: 0 }}
    >
      {icon && (
        <span className="shrink-0 flex items-center" style={{ marginTop: 1, color: labelColor }}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex flex-col gap-2px">
        <span className="text-base font-medium truncate" style={{ color: labelColor }}>
          {label}
        </span>
        {description !== undefined && description !== null && (
          <span className="text-sm text-tertiary">{description}</span>
        )}
      </span>
    </button>
  );
}
