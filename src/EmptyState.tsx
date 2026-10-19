/**
 * EmptyState — Patterns layer.
 *
 * ## Purpose
 * 목록 · 표 · 패널이 «보여 줄 것이 없을 때» 그 자리에 서는 한 덩어리. 가운데 정렬이다.
 *
 * 없다는 사실을 문장 한 줄로만 적어 두던 자리를 대신한다. 왼쪽 끝에 회색 한 줄을 놓으면
 * 그것이 표의 첫 행처럼 보여서, 사람은 «데이터가 한 줄 있다» 고 읽고 나서야 아니라는 것을
 * 안다. 비어 있음은 값이 아니라 «상태» 이므로 그 칸 전체가 그 사실을 말해야 한다.
 *
 * ## When to use
 * - [[DataTable]] 이 0행일 때 표 자리
 * - 필터 · 검색 결과가 없을 때
 * - 아직 아무것도 만들지 않은 목록의 첫 화면
 *
 * ## When NOT to use
 * - 불러오다 실패했을 때 → 그건 오류다. [[Notice]] `tone="critical"` 로 «무엇이 잘못됐나» 를 적는다
 * - 값 하나가 비었을 때(폼 칸 · 속성 행) → 그 자리는 「없음」 한 낱말이면 된다
 * - 로딩 중 → 비어 있는 것이 아니라 아직 모르는 것이다
 *
 * ## Composition rules
 * - 두 갈래를 갈라 쓴다. **아직 없다**(만들면 채워진다)와 **좁혀서 없다**(넓히면 나온다)는
 *   사람이 할 일이 다르다. 전자는 만드는 버튼, 후자는 조건을 푸는 버튼이 `action` 에 선다
 * - `title` 은 사실 한 줄이다. 「데이터가 없습니다」 처럼 무엇이 없는지 안 적으면, 화면이
 *   여럿인 제품에서 같은 문장이 여러 자리에 서고 어느 것이 비었는지 알 수 없다
 * - `description` 은 «그래서 무엇을 하면 되는가» 다. 사실을 두 번 적지 않는다
 * - **아이콘은 기본으로 두지 않는다**(2026-08-27). 돋보기를 세워 두었다가 지웠다. 없다는 것은
 *   그림으로 더 분명해지는 사실이 아니고, 표 자리에 그림이 서면 그 칸이 «다른 종류의 화면» 이
 *   된다. 필요한 자리에서만 `icon` 으로 넣는다. 넣더라도 톤은 낮춘다 — 색을 쓰면 비어 있는
 *   것이 경고처럼 읽힌다
 * - **테두리를 두르지 않는다**(2026-08-27). 한 겹 둘러 두었다가 지웠다. 이 덩어리는 이미
 *   카드 «안» 에 서므로 선이 두 겹이 되고, 안쪽 상자가 «또 하나의 카드» 처럼 읽힌다.
 *   자리를 잡는 것은 선이 아니라 위아래 여백이다
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="필터 조건에 맞는 계정이 없습니다"
 *   description="조건을 넓히면 다시 나타납니다."
 *   action={<Button variant="outline" size="md" onClick={reset}>필터 해제</Button>}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type EmptyStateSize = "sm" | "md";

export type EmptyStateProps = {
  /**
   * 위에 서는 그림. **기본은 없다.** 넣어야 뜻이 서는 자리에서만 준다.
   */
  icon?: ReactNode;
  /** 사실 한 줄. 무엇이 없는지까지 적는다. */
  title: ReactNode;
  /** 그래서 무엇을 하면 되는가. 사실을 되풀이하지 않는다. */
  description?: ReactNode;
  /** 아래에 서는 행동 하나. 조건을 푸는 버튼 · 만드는 버튼. */
  action?: ReactNode;
  /** 세로 여백. `sm` 은 모달 · 좁은 패널용. */
  size?: EmptyStateSize;
  /** 루트 요소(가운데 정렬 세로 묶음)에 덧붙는 클래스 — 배치(여백 · 폭)용. 색 · 크기 override 금지. */
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  /* 세로 여백이 이 컴포넌트의 거의 전부다. 위아래로 넉넉히 두지 않으면 «비었다» 가 아니라
     «한 줄짜리 결과» 로 보인다. 가로는 채우고(`w-full`) 안쪽만 가운데로 모은다. */
  const padY = size === "sm" ? 24 : 48;

  return (
    <div
      role="status"
      className={`flex w-full flex-col items-center justify-center text-center ${className ?? ""}`}
      /* 테두리도 배경도 없다. 이 덩어리는 카드 안에 서므로 선을 그으면 두 겹이 되고, 배경을
         칠하면 카드 안에 카드가 한 겹 더 생긴다. 자리는 위아래 여백이 잡는다. */
      style={{ paddingTop: padY, paddingBottom: padY, paddingInline: 16, gap: 4 }}
    >
      {icon && (
        <span className="inline-flex items-center justify-center text-tertiary" style={{ marginBottom: 4 }}>
          {icon}
        </span>
      )}
      <p className="text-md font-medium text-secondary">{title}</p>
      {description && <p className="text-base text-tertiary">{description}</p>}
      {action && <div className="flex items-center gap-8px" style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
