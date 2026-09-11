/**
 * ListRow — 목록의 «한 건» 이 서는 카드 줄. Primitives layer.
 *
 * ## Purpose
 * 레코드 하나를 한 줄에 담는다. 왼쪽에 제목(+ 성격을 말하는 뱃지) 과 보조 한 줄,
 * 오른쪽에 메타(시각 · 상태). 줄 전체가 그 레코드를 여는 자리다.
 *
 * 표가 아니라 줄인 이유는 **열이 맞을 필요가 없는 목록**이 따로 있기 때문이다. 제목 길이가
 * 제각각이고 보조 줄이 있다 없다 하는 목록을 표에 넣으면 빈 칸이 열마다 생기고, 사람은
 * 그 빈 칸을 「값이 없음」 으로 읽는다. 열을 세로로 비교할 일이 없으면 줄이 맞다.
 *
 * ## When to use
 * - 보고서 · 예약 · 작업처럼 **건마다 길이가 다른** 목록.
 * - 항목을 눌러 상세로 넘어가는 목록.
 *
 * ## When NOT to use
 * - **열을 세로로 비교**하는 목록(수치 · 정렬 · 페이지네이션) → [[DataTable]]. 값을 견주려면
 *   열이 맞아야 하고, 그건 표의 일이다.
 * - 화면을 이동하는 좌측 네비 → [[SidebarMenuItem]].
 * - 눌러서 일이 시작되는 메뉴 줄 → [[ActionMenuItem]]. 그건 데이터가 아니다.
 * - 보여 줄 것이 아예 없을 때 → [[EmptyState]]. 빈 줄을 한 장 세우지 않는다.
 *
 * ## Composition rules
 * - **`title` 은 그 건의 이름이다.** 상태를 제목에 섞지 않는다(「주간 보고서(생성 중)」 ✕) —
 *   상태는 `meta` 의 [[Chip]] 이 진다. 섞으면 같은 사실이 두 자리에 서고 하나만 갱신된다.
 * - `badge` 는 제목 **옆**, `meta` 는 줄 **오른쪽 끝**이다. 성격(유형)은 이름에 붙고,
 *   변하는 값(시각 · 진행 상태)은 반대쪽에 모은다. 이 둘을 섞으면 훑는 눈이 좌우로 튄다.
 * - **`onClick` 을 주면 줄 전체가 눌린다.** 그때 `meta` 안에 또 버튼(`⋮`)을 두려면 그 버튼이
 *   `stopPropagation` 을 해야 한다 — 안 하면 케밥을 눌렀는데 상세가 열린다.
 * - `onClick` 이 없으면 hover 표식도 커서도 주지 않는다. 반응하는 것처럼 보이는데 아무 일도
 *   안 일어나는 줄이 가장 나쁘다.
 * - 색은 토큰만 — 면은 `--color-card`, 테두리는 `--color-border-default`,
 *   hover 테두리는 `--color-border-strong`. hex 를 박으면 다크에서 뒤집힌다.
 * - 보조 줄(`description`)은 **한 줄**이다. 넘치면 말줄임으로 끊고 전문은 상세에서 본다.
 *
 * @example
 * ```tsx
 * <ListRow
 *   title="주간 통합 운영 보고서 (5/26–6/1)"
 *   badge={<Chip tone="primary" variant="soft" size="sm">AI</Chip>}
 *   description="2026-05-26 ~ 2026-06-01 · 대상 api-gateway, payment-core"
 *   meta={<>
 *     <span className="text-sm text-tertiary font-numeric tabular-nums">2026-06-01 09:00</span>
 *     <Chip tone="success" variant="soft" size="md">생성 완료</Chip>
 *   </>}
 *   onClick={() => open(report.id)}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type ListRowProps = {
  /** 그 건의 이름. 상태를 섞지 않는다. */
  title: ReactNode;
  /** 제목 옆 성격 표시 — 보통 [[Chip]] 하나. */
  badge?: ReactNode;
  /** 보조 한 줄 — 기간 · 대상. 넘치면 말줄임. */
  description?: ReactNode;
  /** 줄 오른쪽 끝 — 시각 · 상태 [[Chip]] · 케밥 버튼. */
  meta?: ReactNode;
  /** 좌측 슬롯 — 제품 아이콘 · 체크박스. */
  leading?: ReactNode;
  /** 누르면 열린다. 주지 않으면 hover 표식도 커서도 없다. */
  onClick?: () => void;
  /** 지금 열려 있는 건. 목록과 상세가 같은 화면에 있을 때만 쓴다. */
  selected?: boolean;
  /** 외부 className. */
  className?: string;
};

export default function ListRow({
  title,
  badge,
  description,
  meta,
  leading,
  onClick,
  selected = false,
  className = "",
}: ListRowProps) {
  const clickable = typeof onClick === "function";

  return (
    <div
      /* 줄 전체가 눌리는 자리이므로 키보드로도 닿아야 한다. 누를 수 없는 줄은 그냥 div 다 —
         role·tabIndex 를 달아 두면 탭이 아무 일도 안 하는 자리에서 멈춘다. */
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-current={selected ? "true" : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`flex items-center justify-between gap-12px rounded-8px border bg-card transition-colors ${clickable ? "cursor-pointer" : ""} ${className}`}
      /* padding 유틸(px-14px · py-12px)이 whatap-ds.css 에 없다 — 인라인.
         테두리 색은 선택 여부로 갈린다. hover 는 CSS 클래스로 못 준다(토큰 값이 두 갈래라
         유틸 하나로 안 잡힌다) → 마우스 이벤트로 직접 바꾼다. */
      style={{
        padding: "12px 14px",
        borderColor: selected ? "var(--color-brand-blue)" : "var(--color-border-default)",
        background: selected ? "var(--color-brand-blue-bg)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (clickable && !selected) e.currentTarget.style.borderColor = "var(--color-border-strong)";
      }}
      onMouseLeave={(e) => {
        if (clickable && !selected) e.currentTarget.style.borderColor = "var(--color-border-default)";
      }}
    >
      {leading && <div className="shrink-0 flex items-center">{leading}</div>}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-6px min-w-0">
          <p className="text-md font-medium text-primary truncate">{title}</p>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {description !== undefined && description !== null && (
          <p className="text-sm text-tertiary truncate mt-2px">{description}</p>
        )}
      </div>

      {meta && <div className="flex items-center gap-16px shrink-0">{meta}</div>}
    </div>
  );
}
