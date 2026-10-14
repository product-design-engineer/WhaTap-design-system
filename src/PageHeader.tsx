/**
 * PageHeader — Chrome layer. 48px 페이지 최상단 헤더.
 *
 * ## Purpose
 * 페이지 상단 48px 고정 바. 좌측은 페이지 타이틀 + WhaTap AI 토글([[AssistantButton]])
 * + Docs 버튼, 우측은 고객지원 버튼 + 알림 벨(드롭다운) + 프로필 아바타(드롭다운).
 * [[Sidebar]] 의 48px 로고 헤더와 동일 높이로 chrome 의 최상단 행을 정렬.
 *
 * ## When to use
 * - [[DashboardLayout]] 의 `header` 슬롯에 들어가는 주 페이지 헤더.
 * - 페이지 타이틀과 WhaTap AI 진입점이 함께 필요한 모든 화면.
 *
 * ## When NOT to use
 * - 뒤로가기/브레드크럼 등 보조 네비 행 → [[SubHeaderBar]] (48px 아래 40px 행).
 * - 시간/프리셋 등 데이터 필터 옵션 → `OptionbarPage` / `FilterBar`.
 *
 * ## Composition rules
 * - 공통 정책(feedback-page-header-invariant): WhaTap AI 위젯 토글과 무관하게 항상
 *   동일한 레이아웃·가시 요소·크기로 렌더. 내부 항목을 숨기거나 줄이는 prop 은
 *   의도적으로 제공하지 않음.
 * - WhaTap AI 토글은 인라인 마크업이 아니라 [[AssistantButton]] 채택 (토큰 binding dogfooding).
 * - 높이 48px 고정(`box-border`) — 페이지에서 inline `<div>` 로 재구현 금지.
 * - 배경/경계/텍스트 색은 토큰 (`--color-border-strong` · `--color-text-*` · `--color-brand-blue-bg`).
 * - `notifications` 1건 이상이면 벨에 빨간 점 + 클릭 시 목록, `profileMenu` 있으면 아바타가 드롭다운.
 * - `language` 를 주면 벨 왼쪽에 [[PageHeaderLanguageMenu]](지구본 24px)가 선다. 같은 24px 아이콘 트리거라
 *   오른쪽 줄 간격(16px)이 그대로다. 헤더 고정 글자는 `labels` 로 번역해 넘긴다.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="K8s-GPU / GPU 트렌드"
 *   aiActive={aiActive}
 *   onAiToggle={() => setAiActive((v) => !v)}
 *   roleBadge="OWNER"
 *   profileMenu={[{ label: "엔터프라이즈 관리", onClick: goAdmin }]}
 *   notifications={[{ label: "임계값 초과: disk-usage" }]}
 * />
 * ```
 */
import { useState } from "react";
import AiAssistantButton from "./widget/AssistantButton";
import HeaderPillButton from "./HeaderPillButton";

/**
 * 헤더 컨트롤(WhaTap AI · Docs · 고객지원) 공통 사이즈 — **DS 정책 단일 출처**.
 * 48px 헤더 안에서 32px 는 상하 여백이 8px 밖에 남지 않아 바가 꽉 찬 인상을 준다.
 * DS 사이즈 스케일에서 한 단계 아래인 `sm`(24px)을 헤더 기본으로 쓴다 — 28px 같은
 * 스케일 밖 임의값을 만들지 않는다. 소비 레이어에서 개별 override 금지.
 */
const HEADER_CONTROL_SIZE = "sm" as const;
import { IcDocs, IcSupport } from "./icons/HeaderIcons";
import AiInlinePrompt, { type AiPromptSuggestion } from "./widget/InlinePrompt";
import PageHeaderNotificationItem from "./PageHeaderNotificationItem";
import PageHeaderProfileMenuItem from "./PageHeaderProfileMenuItem";
import PageHeaderLanguageMenu, { type LanguageOption } from "./PageHeaderLanguageMenu";

export type ProfileMenuItem = { label: string; onClick?: () => void };
export type NotificationItem = { label: string; onClick?: () => void };
/** 헤더 언어 설정. 주면 알림 벨 왼쪽에 [[PageHeaderLanguageMenu]] 가 선다. */
export type PageHeaderLanguage = {
  value: string;
  options: LanguageOption[];
  onChange?: (code: string) => void;
  /** 드롭다운 머리글. 기본 "Language". */
  title?: string;
};
/** 헤더 크롬의 고정 글자. 화면 언어를 바꿀 때 소비 레이어가 번역해 넘긴다. 미지정이면 한국어 기본값. */
export type PageHeaderLabels = {
  /** 고객지원 버튼. 기본 「고객지원」. */
  support?: string;
  /** 알림 드롭다운 머리글. 기본 「알림」. */
  notifications?: string;
  /** 프로필 드롭다운 헤더의 역할 옆 글자. 기본 「내 계정」. */
  myAccount?: string;
};

export default function PageHeader({
  title,
  aiActive = false,
  onAiToggle,
  hideAi = false,
  hideDocs = false,
  hideSupport = false,
  aiPrompt = false,
  aiPromptPlaceholder,
  aiPromptPlaceholders,
  aiPromptSuggestions,
  onAiPromptSubmit,
  onAiPromptSelectSuggestion,
  profileMenu,
  roleBadge,
  notifications,
  language,
  labels,
}: {
  title: string;
  aiActive?: boolean;
  onAiToggle?: () => void;
  /**
   * AI 진입점(WhaTap AI 버튼)을 숨긴다. 기본 false — 헤더 구성 불변 정책은 그대로다.
   *
   * **AI 모드 화면 전용 예외.** 화면 본문 자체가 대화인 화면(예: 전체 개요)에서는 이미
   * AI 안에 들어와 있으므로 「AI 를 연다」는 진입점이 뜻을 잃는다. 진입점이 둘로 보이면
   * 지금 하는 대화가 어느 쪽인지 알 수 없어진다. 위젯을 여는 화면에서는 켜지 않는다.
   */
  hideAi?: boolean;
  /**
   * Docs 버튼을 숨긴다. **기본 false — 제품 화면에서는 끄지 않는다.**
   *
   * 48px 헤더의 구성(타이틀 · AI 진입점 · Docs · 고객지원 · 알림 · 아바타)은 제품 화면에서
   * **불변**이다(소비앱 정책). 이 스위치는 문서 체계가 아예 없는 화면 — 별도 랜딩을 가진
   * 제품(URL 모니터링 등)의 셸 — 을 위한 것이다. 「이 화면엔 지금 문서가 없으니 잠깐 끄자」는
   * 쓰임이 아니다. 그렇게 쓰면 같은 제품 안에서 헤더가 화면마다 달라진다.
   */
  hideDocs?: boolean;
  /** 고객지원 버튼을 숨긴다. 기준은 `hideDocs` 와 같다 — 제품 화면에서는 끄지 않는다. */
  hideSupport?: boolean;
  /**
   * 헤더에 [[InlinePrompt]] 를 **직접** 얹는다(1-step 입력). 기본 false.
   *
   * `hideAi`(토글 pill 숨김)와 짝이다 — 본문이 대화인 화면이 아니라 **헤더가 유일한 AI
   * 진입점**인 제품에서, 버튼을 눌러 위젯을 여는 2-step 대신 바로 묻게 한다.
   * pill(`onAiToggle`)과 함께 켜지 않는다: 진입점이 둘로 보이면 지금 하는 말이 어디로
   * 가는지 모호해진다.
   */
  aiPrompt?: boolean;
  /** `aiPrompt` 의 placeholder. 정적 1문장. */
  aiPromptPlaceholder?: string;
  /** `aiPrompt` 의 롤링 placeholder — 제품별 핵심 prompt 배열. 입력이 비면 순환, 입력 시 정지. */
  aiPromptPlaceholders?: string[];
  /** `aiPrompt` 의 제안 칩. focus 시 floating dropdown 으로 뜬다. */
  aiPromptSuggestions?: AiPromptSuggestion[];
  /** `aiPrompt` 송신. */
  onAiPromptSubmit?: (v: string) => void;
  /** `aiPrompt` 제안 칩 선택. */
  onAiPromptSelectSuggestion?: (s: AiPromptSuggestion) => void;
  /** 우상단 아바타 클릭 시 드롭다운 메뉴(예: 엔터프라이즈 관리). 미지정이면 정적 아바타. */
  profileMenu?: ProfileMenuItem[];
  /** 프로필(아바타) 드롭다운 헤더에 표시할 역할(예: "OWNER"). 미지정이면 헤더 숨김. */
  roleBadge?: string;
  /** 알림(벨) 드롭다운. 1건 이상이면 벨에 빨간 점 표시 + 클릭 시 목록. */
  notifications?: NotificationItem[];
  /**
   * 언어 설정. 주면 알림 벨 왼쪽에 지구본 트리거가 선다. 미지정이면 헤더 구성은 종전과 같다.
   * 언어를 바꾼 뒤 화면을 다시 그리는 것은 소비 레이어 몫이다(이 헤더는 값만 알린다).
   */
  language?: PageHeaderLanguage;
  /** 헤더 크롬의 고정 글자(고객지원 · 알림 · 내 계정). 화면 언어가 한국어가 아닐 때 넘긴다. */
  labels?: PageHeaderLabels;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const hasNotify = !!notifications && notifications.length > 0;
  return (
    <div
      className="flex items-center justify-between h-48px box-border bg-card border-b border-color-var-color-border-strong shrink-0"
      style={{ paddingInline: "var(--wds-header-px)" }}
    >
      {/* 좌측: 타이틀 + AI/Docs */}
      <div className="flex items-center gap-24px shrink-0">
        <p
          className="text-2xl text-primary tracking-display whitespace-nowrap leading-normal"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {title}
        </p>
        <div className="flex items-center gap-8px">
          {!hideAi && <AiAssistantButton size={HEADER_CONTROL_SIZE} aiActive={aiActive} onClick={onAiToggle} />}
          {!hideDocs && (
            <HeaderPillButton size={HEADER_CONTROL_SIZE} icon={<IcDocs />}>Docs</HeaderPillButton>
          )}
        </div>
      </div>

      {/* 가운데: AI 인라인 프롬프트 — `aiPrompt` 일 때만. 헤더가 유일한 AI 진입점인 제품에서
          2-step(버튼 → 위젯) 대신 바로 묻게 한다. 좌우 그룹 사이를 flex-1 로 채우되 폭을
          묶어 둔다 — 타이틀이 길어져도 입력이 밀려 찌그러지지 않는다. */}
      {aiPrompt && (
        <div className="flex-1 flex justify-center min-w-0" style={{ paddingInline: 24 }}>
          <div className="w-full" style={{ maxWidth: 520 }}>
            <AiInlinePrompt
              placeholder={aiPromptPlaceholder}
              rollingPlaceholders={aiPromptPlaceholders}
              suggestions={aiPromptSuggestions}
              onSubmit={onAiPromptSubmit}
              onSelectSuggestion={onAiPromptSelectSuggestion}
            />
          </div>
        </div>
      )}

      {/* 우측: 고객지원 + 알림 + 아바타 */}
      <div className="flex items-center gap-16px h-full shrink-0">
        {!hideSupport && <HeaderPillButton size={HEADER_CONTROL_SIZE} icon={<IcSupport />}>{labels?.support ?? "고객지원"}</HeaderPillButton>}
        <div className="flex items-center gap-16px">
          {language && (
            <PageHeaderLanguageMenu
              value={language.value}
              options={language.options}
              onChange={language.onChange}
              title={language.title}
            />
          )}
          <div className="relative shrink-0 size-24px">
            <button
              type="button"
              className="size-24px flex items-center justify-center cursor-pointer relative"
              onClick={() => hasNotify && setNotifyOpen((o) => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10V14L20 16V17H4V16L6 14V10Z"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 19.5C10 20.6 10.9 21.5 12 21.5C13.1 21.5 14 20.6 14 19.5"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {hasNotify && (
                <span className="absolute top-1px right-1px size-7px rounded-full bg-indicator-critical border border-card" />
              )}
            </button>
            {hasNotify && notifyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifyOpen(false)} />
                <div className="absolute right-0 top-32px z-50 min-w-260px rounded-8px border border-color-var-color-border-default bg-card py-4px shadow-md">
                  <div className="px-14px py-6px text-xs text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>{labels?.notifications ?? "알림"}</div>
                  {notifications!.map((n) => (
                    <PageHeaderNotificationItem
                      key={n.label}
                      item={n}
                      onClick={() => { setNotifyOpen(false); n.onClick?.(); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="relative shrink-0 size-24px">
            <button
              type="button"
              className="size-24px cursor-pointer block"
              onClick={() => profileMenu && profileMenu.length > 0 && setProfileOpen((o) => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="avatar-grad" x1="0" y1="0" x2="24" y2="24">
                    <stop stopColor="var(--color-avatar-gradient-from)" />
                    <stop offset="1" stopColor="var(--color-brand-blue)" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="12" fill="url(#avatar-grad)" />
                {/* raw-color-ok: 그라데이션 아바타 위 이니셜 — 컬러 위 고정 흰색. */}
                <text x="12" y="17" textAnchor="middle" fontSize="13px" fontWeight="700" data-ds-policy-ok="그라데이션 아바타 위 이니셜 — 컬러 위 고정 흰색" fill="#fff" fontFamily="Roboto, sans-serif">S</text>
              </svg>
            </button>
            {profileMenu && profileMenu.length > 0 && profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-32px z-50 min-w-200px rounded-8px border border-color-var-color-border-default bg-card py-4px shadow-md">
                  {roleBadge && (
                    <div className="flex items-center gap-6px px-14px pt-8px pb-8px mb-2px border-b border-color-var-color-border-soft">
                      <span className="inline-flex items-center h-18px px-6px rounded-4px text-xs font-bold bg-var-color-brand-blue-bg text-color-var-color-brand-blue" style={{ fontFamily: "var(--font-family-korean)" }}>{roleBadge}</span>
                      <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>{labels?.myAccount ?? "내 계정"}</span>
                    </div>
                  )}
                  {profileMenu.map((it) => (
                    <PageHeaderProfileMenuItem
                      key={it.label}
                      item={it}
                      onClick={() => { setProfileOpen(false); it.onClick?.(); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
