/**
 * Pagination — 목록 하단의 페이지 이동 + 건수 요약.
 *
 * ## Purpose
 * [[DataTable]] 로 그린 목록을 페이지 단위로 넘긴다. 좌측에 "전체 N건 · 페이지당 M건"(지금
 * 무엇의 일부를 보고 있는지), 우측에 이전/페이지 번호/다음.
 *
 * 같은 페이지네이션이 소비자에서 **세 번 따로** 구현돼 있었다(events/rules · gpu/events ·
 * project-list). 세 곳의 버튼 크기·활성 표시·말줄임 규칙이 조금씩 달라서, 같은 제품인데
 * 화면마다 목록 하단이 다르게 보였다. 페이지네이션은 목록의 일부이므로 DataTable 과 같은
 * 층위에서 하나만 있어야 한다.
 *
 * ## When to use
 * - [[DataTable]] 아래. 행이 페이지당 상한을 넘을 수 있는 목록 전반.
 * - 페이지가 하나뿐인 목록에서도 — 컨트롤을 지우지 않고 이전 · 다음 비활성으로 세운다(Composition rules 「표와 한 세트다」).
 *
 * ## When NOT to use
 * - 무한 스크롤/실시간 스트림 목록 → 페이지 개념이 맞지 않는다.
 *
 * ## Composition rules
 * - **표와 한 세트다(2026-08-27 정책).** [[DataTable]] 을 세우면 페이지네이션도 세운다.
 *   **페이지가 하나여도 컨트롤을 지우지 않는다** — 이전 · 다음이 비활성이고 1 이 활성이다.
 *   누를 것이 없다는 사실을 컨트롤이 자기 모양으로 말한다.
 *   전에는 `totalPages <= 1` 에서 컨트롤을 지우고 건수만 남겼다(「누를 것이 없는 컨트롤은
 *   화면만 차지한다」). 그 절약이 더 비싼 것을 가져갔다: 목록 하단이 데이터에 따라 있다 없다
 *   해서 필터를 좁히면 표 아래가 접히고 넓히면 다시 밀린다 · 컨트롤이 아예 없으면 「이 목록은
 *   페이지를 넘길 수 없는 종류」 로 읽힌다 · 화면마다 하단이 달라지면 목록이 한 제품으로
 *   읽히지 않는다(이 컴포넌트가 생긴 이유).
 * - 행 높이는 툴바 컨트롤 높이(`--wds-toolbar-control-h`, 32px), 안의 페이지 pill 은 24px.
 * - caret 은 12px (아이콘 크기 정책). 텍스트 글리프(`<`·`›`)를 쓰지 않는다.
 * - 색·border 는 토큰. 활성 페이지는 brand-blue 테두리 + 글자색으로만 표시(배경 칠하지 않음 —
 *   행 hover 와 충돌한다).
 * - 페이지가 8개를 넘으면 앞 5개 + 말줄임 + 마지막. 말줄임은 버튼이 아니다(누를 수 없다).
 *
 * @example
 * ```tsx
 * <Pagination page={page} totalPages={totalPages} pageSize={10} total={rows.length} onChange={setPage} />
 * ```
 */
import type { ReactNode } from "react";

export type PaginationProps = {
  /** 현재 페이지(1-base). */
  page: number;
  /** 전체 페이지 수 — 8 이하면 번호 전부, 넘으면 1~5 + 말줄임 + 마지막. 1 이어도 컨트롤은 남는다. */
  totalPages: number;
  /** 페이지당 행 수 — 좌측 요약 문구에만 쓴다. */
  pageSize: number;
  /** 필터 적용 후 전체 건수 — 좌측 요약 문구. */
  total: number;
  /** 번호 · 이전 · 다음 클릭 시 이동할 페이지(1-base)를 받는다. controlled — `page` 갱신은 호출측. */
  onChange: (page: number) => void;
  /** 좌측 요약 문구 숨김 — 상단에 이미 같은 건수를 적어 둔 화면용. */
  hideSummary?: boolean;
};

/** 페이지 번호 목록 — 8개 초과면 앞 5개 + 말줄임 + 마지막. */
function pageItems(totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 8) return Array.from({ length: totalPages }, (_, i) => i + 1);
  return [1, 2, 3, 4, 5, "ellipsis", totalPages];
}

export default function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  onChange,
  hideSummary = false,
}: PaginationProps) {
  const summary = (
    <span
      className="text-sm text-tertiary leading-none"
      style={{ fontFamily: "var(--font-family-numeric)" }}
    >
      전체 {total.toLocaleString()}건 · 페이지당 {pageSize}건
    </span>
  );

  /* 페이지가 하나여도 컨트롤은 그대로 선다(2026-08-27 정책). 넘길 곳이 없다는 사실은 이전 ·
     다음이 비활성인 것으로 이미 말하고 있다. 줄을 통째로 지우면 목록 하단이 데이터에 따라
     있다 없다 하면서 표 아래가 움직인다. `pageItems` 는 1 하나를 돌려주므로 pill 도 한 개다. */
  return (
    <div
      className="flex items-center justify-between gap-12px px-8px shrink-0"
      style={{ height: "var(--wds-toolbar-control-h)" }}
    >
      {hideSummary ? <span /> : summary}
      <div className="flex items-center gap-4px">
        <PageBtn ariaLabel="이전 페이지" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Caret dir="left" />
        </PageBtn>
        {pageItems(totalPages).map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              aria-hidden="true"
              className="flex items-center justify-center text-sm text-tertiary leading-none"
              style={{ minWidth: 24, height: 24, fontFamily: "var(--font-family-numeric)" }}
            >
              …
            </span>
          ) : (
            <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>
              {p}
            </PageBtn>
          ),
        )}
        <PageBtn ariaLabel="다음 페이지" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <Caret dir="right" />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active = false,
  disabled = false,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center rounded-4px text-sm leading-none cursor-pointer transition-colors disabled-cursor-not-allowed"
      style={{
        minWidth: 24,
        height: 24,
        paddingInline: 6,
        fontFamily: "var(--font-family-numeric)",
        border: `1px solid ${active ? "var(--color-brand-blue)" : "var(--color-border-default)"}`,
        background: "var(--color-card)",
        color: active ? "var(--color-brand-blue)" : "var(--color-text-primary)",
        fontWeight: active ? "var(--font-weight-bold)" : undefined,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      {children}
    </button>
  );
}

/** caret 12px — 아이콘 크기 정책. */
function Caret({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}
    >
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
