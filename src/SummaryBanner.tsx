/**
 * SummaryBanner — 화면 상단 40px AI 요약 배너 (슬롯 구조).
 *
 * ## Purpose
 * 화면 진입 직후 AI 가 스스로 돌린 점검·요약 결과를 알리고, 심층 분석(위젯 전환)으로
 * 유도하는 상단 배너. 진입 후 `revealDelayMs` 뒤에 슬라이드-인 하여 "화면이 먼저 그려지고
 * 나서 AI 가 결과를 내놓았다" 는 시간차를 만든다.
 *
 * ## When to use
 * - 제품 화면 진입 시 자동 헬스체크/요약 결과를 알릴 때 (APM·RUM·CPM·SMS·DPM 공통)
 * - 사용자가 아무 것도 누르지 않아도 AI 가 먼저 훑은 결과를 노출해야 할 때
 *
 * ## When NOT to use
 * - 사용자 액션의 완료 확인 → [[Toast]] (자동 소멸, 일회성)
 * - AI 를 쓸 수 없는 상태 안내 → [[UnavailableNotice]] (위젯 본문)
 * - 대화형 진입점 → [[PageHeaderAiInline]] / [[AssistantButton]]
 *
 * ## Composition rules
 * - **슬롯 구조**: 배너는 40px 규격·정렬·모션만 책임지고, 내용은 전부 슬롯으로 주입한다.
 *   `symbol`(기본 회전 심볼) · `children`(주 문장) · `summary`(보조 카운트) ·
 *   `tags`(Chip 등 판정 칩) · `actions`(주 액션 버튼).
 * - 높이 40px 고정 — 패딩이 아니라 height 로 고정해 슬롯 내용이 커져도 배너가 늘어나지 않는다.
 * - `tone="info"`(기본)은 정보성 표면 토큰, `tone="neutral"` 은 무채색 표면 토큰.
 * - 액션 슬롯에는 [[AssistantButton]] 처럼 32px 이하 높이 컨트롤만 넣는다.
 * - 색은 토큰만 사용. 인라인 색 리터럴 금지.
 *
 * @example
 * ```tsx
 * <SummaryBanner
 *   summary="주의 2 · 관찰 1 · 정상 3"
 *   tags={<><Chip variant="soft" tone="warning" size="sm">응답시간 21.7s</Chip></>}
 *   actions={<AssistantButton onClick={openWidget}>심층 분석하기</AssistantButton>}
 *   onClose={() => setOpen(false)}
 * >
 *   최근 1시간 헬스체크를 WhaTap AI가 분석했습니다
 * </SummaryBanner>
 * ```
 */
import { useEffect, useState, type ReactNode } from "react";
import AiSymbol from "./widget/AiSymbol";

/** 배경 톤 — 정보성(기본) / 무채색. 값은 토큰 단일 출처. */
export type AiSummaryBannerTone = "info" | "neutral";

export type AiSummaryBannerProps = {
  /** 주 문장 슬롯 — 한 줄 유지 권장. */
  children: ReactNode;
  /** 좌측 심볼 슬롯. 기본 회전 AI 심볼(16px). `null` 로 제거 가능. */
  symbol?: ReactNode;
  /** 보조 요약 슬롯 — 판정 카운트 등 짧은 텍스트. */
  summary?: ReactNode;
  /** 태그 슬롯 — [[Chip]] 등 판정 칩 나열. 폭이 좁으면 잘린다(overflow hidden). */
  tags?: ReactNode;
  /** 우측 액션 슬롯 — 주 액션 컨트롤(32px 이하). */
  actions?: ReactNode;
  /** 지정 시 우측 끝에 닫기(×) 노출. */
  onClose?: () => void;
  /** 등장 지연(ms). 기본 1000. `0` 이면 즉시(트랜지션 없음). */
  revealDelayMs?: number;
  /** 배경 톤. 기본 `"info"`. */
  tone?: AiSummaryBannerTone;
};

const BANNER_HEIGHT = 40;

const TONE_STYLE: Record<AiSummaryBannerTone, { bg: string; border: string }> = {
  info: { bg: "var(--color-brand-blue-bg)", border: "var(--color-brand-blue-bg-2)" },
  neutral: { bg: "var(--color-surface-50)", border: "var(--color-border-default)" },
};

export default function SummaryBanner({
  children,
  symbol,
  summary,
  tags,
  actions,
  onClose,
  revealDelayMs = 1000,
  tone = "info",
}: AiSummaryBannerProps) {
  const [shown, setShown] = useState(revealDelayMs === 0);

  useEffect(() => {
    if (revealDelayMs === 0) return;
    const id = setTimeout(() => setShown(true), revealDelayMs);
    return () => clearTimeout(id);
  }, [revealDelayMs]);

  const { bg, border } = TONE_STYLE[tone];

  return (
    /* 외곽 — 높이 0 → 40 트랜지션으로 아래 콘텐츠를 밀어내며 등장(겹치지 않음). */
    <div
      className="shrink-0 overflow-hidden"
      style={{
        height: shown ? BANNER_HEIGHT : 0,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(-4px)",
        transition: "height 280ms ease, opacity 280ms ease, transform 280ms ease",
      }}
    >
      <div
        className="flex items-center gap-10px px-12px shrink-0 box-border"
        style={{ height: BANNER_HEIGHT, background: bg, borderBottom: `1px solid ${border}` }}
      >
        {/* 심볼 슬롯 — 기본은 회전만(pulse 는 box-shadow 헤일로가 배경처럼 보인다) */}
        {symbol === undefined ? <AiSymbol size={16} className="ai-symbol-spin" /> : symbol}

        <span
          className="text-md font-bold text-primary tracking-default leading-none whitespace-nowrap"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {children}
        </span>

        {summary && (
          <span
            className="text-base text-tertiary leading-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {summary}
          </span>
        )}

        {tags && <span className="flex items-center gap-4px min-w-0 overflow-hidden">{tags}</span>}

        {(actions || onClose) && (
          <span className="flex items-center gap-6px ml-auto shrink-0">
            {actions}
            {onClose && (
              <button
                type="button"
                aria-label="요약 닫기"
                onClick={onClose}
                className="size-20px flex items-center justify-center cursor-pointer rounded-2px"
                style={{ color: "var(--color-text-tertiary)", background: "transparent", border: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
