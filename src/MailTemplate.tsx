/**
 * MailTemplate — Composite layer. 와탭이 보내는 알림 메일 한 통의 본문.
 *
 * ## Purpose
 * 제품 밖에 있는 사람을 부르는 메일의 뼈대. 회색 바탕 위 흰 카드 한 장에 로고 · 분류 칩 · 제목 ·
 * 인사 · 본문 · 버튼 하나 · 대체 주소 · 바닥글이 위에서 아래로 선다.
 *
 * 이벤트 알림(PLAT-607), 아침 브리핑(PLAT-691), WhaTap-AI 플랜 알림(PLAT-886)이 같은 뼈대를 화면마다
 * 따로 짜고 있었다. 메일은 받는 사람이 제품을 보고 있지 않을 때 닿는 유일한 표면이라, 종류마다 모양이
 * 다르면 «와탭에서 온 메일» 이라는 사실부터 흐려진다.
 *
 * 메일 클라이언트의 크롬(받은 편지함 · 보낸 사람 줄)은 이 컴포넌트가 그리지 않는다. 그것은 남의 제품
 * 화면이고, 프로토타입이 검토용으로 따로 재현한다. 이 컴포넌트는 «우리가 보내는 HTML» 만이다.
 *
 * ## When to use
 * - 사건 하나를 알리고 그 자리로 부르는 메일(한계 도달 · 정지 · 플랜 추가 · 요청)
 * - 하루 · 주기의 판정을 요약해 보내는 메일
 * - 메일 화면을 Storybook · 프로토타입에서 재현할 때
 *
 * ## When NOT to use
 * - 제품 안의 안내 → [[Notice]] · [[EmptyState]]. 메일 카드를 화면 안에 세우지 않는다
 * - 3rd-party 메신저 메시지 → 그 채널이 렌더링한다. 이 카드를 메시지 본문에 얹지 않는다
 * - 버튼이 둘 이상 필요한 메일 → 할 일을 하나로 줄인다. 받는 사람마다 할 일이 다르면 메일을 가른다
 *
 * ## Composition rules
 * - **제목에 판정을 싣는다.** 대부분은 받은 편지함 목록에서 제목만 읽고 닫는다. 「알림이 도착했습니다」
 *   처럼 무엇이 왔는지만 말하는 제목을 쓰지 않는다. 메일 제목 줄(subject)과 `title` 은 같은 문장이다
 * - **본문은 평문으로도 읽혀야 한다.** 첫 문단이 판정을 마치고, 다음이 무엇이 그대로인지, 마지막이 할 일이다.
 *   색이나 굵기로만 뜻을 싣지 않는다 — 많은 클라이언트가 스타일을 지운다
 * - **버튼은 하나다.** `action` 이 없으면 알리기만 하는 메일이다. 링크는 로그아웃 상태를 전제로
 *   로그인 화면을 지나는 주소를 준다(`/account/sign-in?from=email&next=…`)
 * - **대체 주소를 버튼 아래에 적는다**(`action.href`). 버튼이 막히는 클라이언트가 있다
 * - 인사(`greeting`)는 개인 편지함일 때만. 여럿이 함께 받는 주소로 가는 메일에는 두지 않는다
 * - 바닥글은 «왜 이 메일을 받았는가» 를 말한다. 수신 설정을 바꾸는 자리가 있으면 그것도 적는다
 *
 * @example
 * ```tsx
 * <MailTemplate
 *   category="WhaTap-AI 플랜"
 *   title="운영팀 플랜 · 사용량 한계에 닿아 AI 사용이 멈췄습니다"
 *   greeting="오경호 님,"
 *   action={{ label: "플랜 보기", href: "https://service.whatap.io/account/sign-in?from=email&next=%2Faccount%2Fbilling%2Fplan" }}
 *   footer="이 메일은 WhaTap-AI 플랜 알림입니다. 플랜의 결제권한자와 과금 범위 계정에게 보냅니다."
 * >
 *   <p>새 질문만 멈췄습니다. 지금까지의 대화와 이미 받은 판정은 그대로 있습니다.</p>
 *   <p>다음 주기가 시작되면 기본 크레딧이 다시 지급되어 이어서 씁니다.</p>
 * </MailTemplate>
 * ```
 */
import type { ReactNode } from "react";
import Button from "./Button";
import Chip from "./Chip";

export type MailTemplateAction = {
  /** 버튼 글자. 동사로 끝낸다(「플랜 보기」 · 「납부하기」). */
  label: string;
  /** 버튼이 가는 주소. 버튼 아래 대체 주소로도 적힌다. */
  href?: string;
  /** 재현 화면에서 누를 때. 실제 메일에는 `href` 만 남는다. */
  onClick?: () => void;
};

export type MailTemplateProps = {
  /** 제목 위 분류 칩. 어떤 종류의 메일인지(「WhaTap-AI 플랜」 · 「Critical」). */
  category?: ReactNode;
  /** 판정이 담긴 제목. 메일 제목 줄과 같은 문장이다. */
  title: ReactNode;
  /** 인사 한 줄. 개인 편지함일 때만. */
  greeting?: ReactNode;
  /** 본문 문단. `<p>` 를 넘기면 문단 간격이 붙는다. */
  children?: ReactNode;
  /** 할 일 하나. 없으면 버튼 없이 알리기만 한다. */
  action?: MailTemplateAction;
  /** 바닥글. 왜 이 메일을 받았는가. */
  footer?: ReactNode;
  /** 로고 이미지 주소. 메일 HTML 에서는 절대 주소여야 한다. */
  logoSrc?: string;
  className?: string;
};

export default function MailTemplate({
  category,
  title,
  greeting,
  children,
  action,
  footer,
  logoSrc = "/icons/whatap-logo.svg",
  className,
}: MailTemplateProps) {
  return (
    /* 바깥 회색은 메일 자신의 바탕이다. 클라이언트의 흰 페인 위에서 카드가 «한 통» 으로 서게 한다. */
    <div
      className={`flex w-full justify-center ${className ?? ""}`}
      style={{ background: "var(--color-surface-100)", padding: "28px 24px", borderRadius: 8, fontFamily: "var(--font-family-korean)" }}
    >
      <div
        className="w-full bg-card"
        style={{ maxWidth: 560, border: "1px solid var(--color-border-default)", borderRadius: 12, overflow: "hidden" }}
      >
        <div style={{ padding: "32px 32px 4px" }}>
          <img src={logoSrc} alt="WhaTap" style={{ height: 24, width: "auto", display: "block" }} />
        </div>

        <div className="flex flex-col" style={{ padding: "20px 32px", gap: 12 }}>
          {category && (
            <div>
              <Chip variant="soft" tone="neutral" size="sm">
                {category}
              </Chip>
            </div>
          )}
          <h1 className="text-xl font-bold text-primary" style={{ margin: 0 }}>
            {title}
          </h1>
          {/* 본문 문단은 한 칸씩 띄운다. 클라이언트가 스타일을 지워도 문단 경계가 남게 `<p>` 를 쓴다. */}
          <div className="flex flex-col text-md text-secondary" style={{ gap: 12, lineHeight: 1.6 }}>
            {greeting && <p style={{ margin: 0 }}>{greeting}</p>}
            {children}
          </div>

          {action && (
            <div className="flex flex-col" style={{ marginTop: 8, gap: 16 }}>
              <div>
                <Button variant="contained" tone="primary" size="xl" onClick={action.onClick}>
                  {action.label}
                </Button>
              </div>
              {action.href && (
                <p
                  className="text-xs text-tertiary"
                  style={{ margin: 0, paddingTop: 16, borderTop: "1px solid var(--color-border-soft)", lineHeight: 1.6, wordBreak: "break-all" }}
                >
                  버튼이 동작하지 않으면 아래 주소를 브라우저에 붙여넣으세요:
                  <br />
                  {action.href}
                </p>
              )}
            </div>
          )}
        </div>

        {footer && (
          <div style={{ padding: "16px 32px", background: "var(--color-surface-50)", borderTop: "1px solid var(--color-border-soft)" }}>
            <div className="text-xs text-tertiary" style={{ lineHeight: 1.6 }}>
              {footer}
              <br />© WhaTap Labs
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
