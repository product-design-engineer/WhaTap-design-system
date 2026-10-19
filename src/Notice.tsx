/**
 * Notice — 화면 흐름 안에 서는 상태 알림 카드. Primitives layer.
 *
 * ## Purpose
 * 「지금 이 화면에 이런 사정이 있다」 를 본문 자리에서 말하는 카드. 좌측 3px 색 띠가 성격을
 * 지고, 제목 한 줄 · 설명 한 줄 · (선택) 행동 버튼으로 끝난다.
 *
 * DS 에 없어서 소비자가 각자 `border-l-[3px]` 짜리 카드를 다시 짜던 패턴이다.
 * 세 곳에서 따로 짜자 띠 굵기와 제목 무게가 벌써 갈렸다.
 *
 * ## When to use
 * - 사람이 «알아야 하지만 지금 막을 일은 아닌» 사정 (삭제된 계정이 남아 있음 · 카드 만료 임박).
 * - 방금 한 일의 결과와 되돌리는 길 (수십 명을 한 번에 추가한 뒤).
 * - 왜 이 화면에 왔는지 (검증에 걸려 튕겨 나온 자리).
 *
 * ## When NOT to use
 * - 액션 완료의 가벼운 확인 → [[Toast]]. 흘려보내도 되는 것은 자리를 차지하지 않는다.
 * - 진행을 막고 답을 받아야 할 때 → [[Modal]]. 알림은 막지 않는다.
 * - 값 하나에 붙는 상태 표시 → [[Chip]]. 카드는 문장이 있을 때만이다.
 * - AI 가 낸 분석·경고 → `Ai*` 계열. 이 카드는 제품 화면의 것이다.
 *
 * ## Composition rules
 * - **두 모양 — `variant`.** `card` (기본) — 테두리를 두르고 «떠서» 선다. 페이지 흐름 사이에 끼는 자리.
 *   `bare` — 테두리 없이 띠와 바탕만. **이미 카드 안** 인 자리다. 카드 안에 또 테두리를
 *   얹으면 선이 두 겹이 되어 어느 것이 바탕인지 흐려진다. 같은 성격의 말을 두 자리에서
 *   하게 되므로 모양만 갈리고 낱말(`tone`)은 같아야 한다 — 그래서 컴포넌트를 나누지 않고
 *   prop 으로 둔다. **둘 다 톤 바탕을 진다**(아래). `bare` 는 모서리를 둥글리지 않는다 —
 *   담는 카드 안에서 둥근 면은 카드가 한 장 더 놓인 것처럼 보인다.
 * - **띠 색이 곧 성격이다.** 톤 낱말은 [[Chip]] 과 같다(primary · warning · critical ·
 *   success · neutral). 같은 사정을 화면마다 다른 낱말로 부르지 않게 하려는 것이다.
 * - **바탕은 톤의 `soft` 토큰으로 칠한다**(2026-08-27 정책 개정). 전에는 「배경을 칠하지
 *   않는다 · 색은 띠 3px 이 진다」 였는데, 흰 바탕 위의 3px 띠는 그 알림이 «어디서 시작해
 *   어디서 끝나는지» 를 긋지 못한다. 특히 카드 안(`bare`)에서는 담는 카드와 같은 흰 면이라
 *   제목과 설명이 본문 문단처럼 흘러 읽힌다. 바탕 한 겹이 그 덩어리의 경계다.
 * - **`soft` 토큰만 쓴다.** 톤 원색(`--color-status-warning` 등)으로 면을 채우지 않는다.
 *   그러면 알림 하나가 화면의 주인공이 되고, 그건 «막는» 자리의 어법이다([[Modal]]).
 *   쓰는 값은 [[Chip]] `variant="soft"` 와 **같은 토큰 표** 다 — 한 사정을 칩과 알림이 다른
 *   색으로 말하면 같은 톤 낱말이 두 뜻을 갖는다.
 * - 제목은 «사실 한 줄» 이다. 「주의하세요」 같은 부름말을 넣지 않는다 — 띠가 이미 그 일을 한다.
 * - `action` 은 카드 우측 끝이다. 제목 옆에 붙이면 제목 길이에 따라 버튼 자리가 제각각이 된다.
 * - 톤을 여럿 쌓지 않는다. 한 화면에 이 카드가 셋 넘게 서면 그건 알림이 아니라 목록이다.
 *
 * @example
 * ```tsx
 * <Notice tone="warning" title={`삭제된 계정 ${stale.length}개가 추가되어 있습니다`} description={names} />
 *
 * <Notice
 *   tone="primary"
 *   title={`${label} 에서 ${n}명을 추가했습니다`}
 *   description="모두 새로 추가됐습니다."
 *   action={<Button variant="outline" size="lg" onClick={undo}>되돌리기</Button>}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type NoticeTone = "primary" | "warning" | "critical" | "success" | "neutral";

/** `card` = 테두리를 두른 한 장 · `bare` = 이미 카드 «안» 인 자리의 톤 바탕 한 겹. */
export type NoticeVariant = "card" | "bare";

/** 띠 색. [[Chip]] 의 톤 낱말과 짝이 맞는다. */
const BAR: Record<NoticeTone, string> = {
  primary: "var(--color-brand-blue)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
  success: "var(--color-status-success)",
  neutral: "var(--color-border-strong)",
};

/**
 * 바탕 색. [[Chip]] `variant="soft"` 와 **같은 토큰 표** 다. 한 사정을 칩과 알림이 다른 색으로
 * 말하면 같은 톤 낱말이 두 뜻을 갖는다.
 */
const SOFT: Record<NoticeTone, string> = {
  primary: "var(--color-brand-blue-bg)",
  warning: "var(--color-status-warning-soft)",
  critical: "var(--color-status-error-soft)",
  success: "var(--color-status-success-soft)",
  neutral: "var(--color-surface-100)",
};

export type NoticeProps = {
  /** 성격. 기본 neutral — 색을 쓸 이유가 없으면 쓰지 않는다. */
  tone?: NoticeTone;
  /** 모양. 기본 card. 카드 안에 얹을 때만 bare. */
  variant?: NoticeVariant;
  /** 사실 한 줄. 부름말이 아니라 무슨 일이 있었는지를 적는다. */
  title: ReactNode;
  /** 보조 한 줄 — 이름 나열 · 다음에 무엇을 하면 되는지. */
  description?: ReactNode;
  /** 우측 끝 행동. 보통 [[Button]] `variant="outline"` 하나다. */
  action?: ReactNode;
  /** 제목·설명 아래로 더 붙일 것. 목록처럼 한 줄로 안 끝나는 경우에만. */
  children?: ReactNode;
  /** 외부 className — 바깥 카드. */
  className?: string;
};

export default function Notice({
  tone = "neutral",
  variant = "card",
  title,
  description,
  action,
  children,
  className,
}: NoticeProps) {
  const bare = variant === "bare";

  return (
    <div
      role="status"
      className={
        bare ? (className ?? "") : `rounded-8px border border-color-var-color-border-default ${className ?? ""}`
      }
      /* padding 유틸이 whatap-ds.css 에 없다(p-16px · pl-10px). 클래스로 쓰면 조용히 무시되므로
         인라인이다.

         `bare` 도 위아래 여백을 진다(2026-08-27). 종전에는 좌측 여백만 두고 위아래는 담는
         카드에 맡겼는데, 바탕을 칠하고 나니 그 면이 글자에 딱 붙어 띠만 길쭉하게 남았다.
         바탕이 있으면 그 바탕이 자기 여백을 가져야 한다. */
      style={
        bare
          ? {
              padding: "10px 12px",
              borderLeft: `3px solid ${BAR[tone]}`,
              /* 모서리를 둥글리지 않는다(2026-08-27 지시). 담는 카드 «안» 에 서는 자리라,
                 둥근 모서리는 그 안에 카드가 한 장 더 놓인 것처럼 보인다. 각진 면은 카드의
                 한 구역으로 읽힌다. 띠가 왼쪽 끝에서 곧게 서는 것도 각일 때다. */
              borderRadius: 0,
              background: SOFT[tone],
            }
          : {
              padding: 16,
              borderLeft: `3px solid ${BAR[tone]}`,
              background: SOFT[tone],
            }
      }
    >
      <div className="flex items-start justify-between gap-16px flex-wrap">
        <div className="min-w-0">
          <p className="text-base font-semibold text-primary">{title}</p>
          {description !== undefined && description !== null && (
            <p className={`text-base text-tertiary ${bare ? "mt-2px" : "mt-4px"}`}>{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
