/**
 * WhaTap AI 위젯 공용 프리미티브.
 *
 * AI 위젯 메시지 카드들이 반복적으로 사용하는 빌딩 블록 5종 — Card / Caption / SectionHeading /
 * ToneBadge / BulletList. 신규 메시지 카드 작성 시 인라인 div/span 을 새로 짜지 말고 이 프리미티브를
 * 조립하세요.
 *
 * 정책: [[feedback_widget_primitives]] — 모든 위젯 카드의 흰 배경/보더/라운드/패딩/애니메이션은
 * `<AiCard>` 가 책임집니다. 색은 `tokens.color.*` 토큰만 사용.
 */
import type { ReactNode } from "react";
import { TONE_BG, TONE_DOT, TONE_LABEL, type Tone } from "./_tokens";

/* ─────────────────────────────────────────────────────────────────────
 *  AiCard
 * ─────────────────────────────────────────────────────────────────── */

/**
 * AiCard — AI 위젯 메시지의 표준 컨테이너.
 *
 * ## Purpose
 * AI 가 사용자에게 보내는 메시지의 단위 카드. 흰 배경 + `var(--color-border-default)` 보더 + 8px 라운드 + 기본 12px 패딩 +
 * `ai-anim-in` 진입 애니메이션. WhaTap AI 위젯 전체에서 일관된 메시지 표현을 보장합니다.
 *
 * ## When to use
 * - AI 응답 메시지 단위 (1 메시지 = 1 AiCard).
 * - 메시지 본문이 헤딩 + 표 + 차트 + step list 등 복수 요소를 담을 때.
 * - 카드 진입 stagger 애니메이션이 필요한 모든 경우 (`delay` prop 으로 순차 지연).
 *
 * ## When NOT to use
 * - 사용자 발화 버블 → [[AiUserBubble]] (우측 정렬, 회색 배경).
 * - 도구 호출 진행 표시 → [[AiToolCallStep]] (자체 chrome 보유).
 * - 카드 chrome 없는 콘텐츠 (예: 로딩 진행 표시 자체) → 일반 div.
 *
 * ## Composition rules
 * - 헤더는 [[AiSectionHeading]] 또는 [[AiCaption]] 으로 — 인라인 텍스트 헤더 금지.
 * - 인라인 색상 리터럴 (`#xxx`) 금지 — 색이 필요하면 `tokens.color.*` 참조.
 * - `delay` 는 부모 메시지 시퀀스에서 계산 — 일반적으로 `i * 360` (ms).
 * - 너비는 부모(`flex-col w-full`)에 맞춤 — 카드 내부에서 override 하지 말 것.
 *
 * @example
 * ```tsx
 * <AiCard delay={200}>
 *   <AiSectionHeading tone="critical">🔴 핵심 이상 징후</AiSectionHeading>
 *   <AiBulletList items={["httpc 응답시간 4,294ms", "압도적 dominant"]} />
 * </AiCard>
 * ```
 */
export function AiCard({
  children,
  delay = 0,
  padding = 12,
  gap = 8,
  className = "",
}: {
  /** 카드 본문 — 다른 primitive 들의 조합 권장. */
  children: ReactNode;
  /** `ai-anim-in` 진입 애니메이션 지연 (ms). stagger 효과에 사용. 기본 0. */
  delay?: number;
  /** 안쪽 패딩 (px). 0 으로 무패딩 가능. 기본 12. */
  padding?: number;
  /** 자식 요소 간 세로 갭 (px). 0 으로 gap 제거. 기본 8. */
  gap?: number;
  /** 추가 className — 너비/높이 override 등 특수 케이스에만. */
  className?: string;
}) {
  return (
    <div
      className={`ai-anim-in flex flex-col w-full bg-card border border-color-var-color-border-default rounded-8px ${className}`}
      style={{ animationDelay: `${delay}ms`, padding, gap }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  AiCaption
 * ─────────────────────────────────────────────────────────────────── */

/**
 * AiCaption — 위젯 카드 내부의 작은 섹션 라벨 (캡션).
 *
 * ## Purpose
 * 카드 안의 sub-section 머리에 붙는 11px 굵은 회색 대문자 라벨. `REASONING`, `COST ANALYSIS` 같은
 * 영문 키 라벨 또는 한국어 sub-heading 으로 사용.
 *
 * ## When to use
 * - 한 카드 안에 여러 sub-section 이 있어 각각을 분류 표기해야 할 때.
 * - 표/차트 위에 "무엇을 보여주는 영역인지" 1-2 단어로 명시.
 *
 * ## When NOT to use
 * - 카드 메인 헤딩 → [[AiSectionHeading]] (13px, dot/emoji 포함).
 * - 사용자 본문 텍스트 → 일반 `<p>` 스타일.
 *
 * ## Composition rules
 * - 항상 대문자 또는 짧은 한 줄 텍스트. 긴 문장은 부적합.
 * - 색·크기·굵기 override 하지 말 것 — 디자인 시스템 일관성.
 *
 * @example
 * ```tsx
 * <AiCaption>REASONING</AiCaption>
 * <AiCaption>최근 5분 액티브 스레드 상태</AiCaption>
 * ```
 */
export function AiCaption({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
      style={{ fontFamily: "var(--font-family-korean)" }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  AiSectionHeading
 * ─────────────────────────────────────────────────────────────────── */

/**
 * AiSectionHeading — 카드 메인 헤딩 (컬러 도트 또는 이모지 + 굵은 한국어).
 *
 * ## Purpose
 * 카드의 주제를 한 줄로 명시하는 13px 굵은 헤딩. 좌측에 톤 도트(`tone` prop) 또는 이모지(`emoji` prop)
 * 로 시각 강조. "🔴 핵심 이상 징후", "● 비용 분석", "📊 데이터 시각화" 등 패턴.
 *
 * ## When to use
 * - 모든 위젯 카드의 첫 줄 (대부분의 AiCard 안에 1개).
 * - 분류 톤이 있는 메시지 — critical/warning/info 의 색 신호 동시에 전달.
 *
 * ## When NOT to use
 * - 카드 sub-section 라벨 → [[AiCaption]] (더 작음).
 * - dot/emoji 둘 다 없이 텍스트만 → div + class 로 충분.
 *
 * ## Composition rules
 * - `tone` 또는 `emoji` 중 하나만 (양쪽 동시 = emoji 우선, dot 생략).
 * - `tone` 사용 시 [[tokens]].color.indicator 의 색이 자동 적용 — 인라인 컬러 override 금지.
 * - 텍스트는 짧게 (10자 이내 권장). 긴 헤딩은 본문으로 분리.
 *
 * @example
 * ```tsx
 * <AiSectionHeading tone="critical">🔴 핵심 이상 징후</AiSectionHeading>
 * <AiSectionHeading emoji="📊">데이터 시각화</AiSectionHeading>
 * <AiSectionHeading tone="info">정상 동작 중</AiSectionHeading>
 * ```
 */
export function AiSectionHeading({
  tone,
  emoji,
  children,
}: {
  /** 좌측 도트의 톤. `emoji` 우선이라 둘 다 주면 도트 생략. */
  tone?: Tone;
  /** 도트 대신 표시할 이모지 (예: `"📊"`, `"📌"`). `tone` 보다 우선. */
  emoji?: string;
  /** 헤딩 텍스트 — 짧을수록 좋음 (10자 이내 권장). */
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-6px">
      {emoji ? (
        <span className="text-lg leading-none">{emoji}</span>
      ) : tone ? (
        <span className="size-10px rounded-full" style={{ background: TONE_DOT[tone] }} />
      ) : null}
      <span
        className="text-md font-bold text-primary tracking-default leading-normal"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  AiToneBadge
 * ─────────────────────────────────────────────────────────────────── */

/**
 * AiToneBadge — 분류 결과를 작은 컬러 칩으로 표시.
 *
 * ## Purpose
 * GPU/리소스 분석 등 시나리오에서 "고활용/활용/저활용/완전 유휴" 같은 분류 결과를 작은 알약 모양의
 * 컬러 칩으로 노출. 좌측 도트(`tokens.color.indicator`) + 라벨(`tokens.label`) + 배경
 * (`tokens.color.surface`) 이 한 톤으로 통일.
 *
 * ## When to use
 * - 분류 표의 셀 안에서 row 의 분류 결과를 시각화 ([[AiClassificationTable]]).
 * - 카드 헤딩 옆에 분류 상태 부착 (보조 정보).
 *
 * ## When NOT to use
 * - 메인 강조 신호 → [[AiSectionHeading]] 의 `tone` 사용 (더 큼, 시각적 가중치 큼).
 * - 단순 텍스트 라벨 → 일반 `<span>`.
 * - Tone 이 없는 일반 정보 → 톤 없이 표시할 거면 다른 컴포넌트 검토.
 *
 * ## Composition rules
 * - 기본 라벨은 `tokens.label[intent].value` 자동 사용 — `label` prop 으로만 override.
 * - 인라인 컬러 override 금지 — 토큰 시스템 일관성.
 *
 * @example
 * ```tsx
 * <AiToneBadge tone="critical" />          // 출력: ● 고활용 (기본 라벨)
 * <AiToneBadge tone="info" label="저활용 (10% 미만)" />
 * ```
 */
export function AiToneBadge({
  tone,
  label,
}: {
  /** 배지 톤 — 도트 색·배경색·기본 라벨이 모두 이 톤으로 결정됨. */
  tone: Tone;
  /** 기본 라벨(`tokens.label[intent]`) 대신 사용할 텍스트. 짧을수록 좋음. */
  label?: string;
}) {
  const text = label ?? TONE_LABEL[tone];
  return (
    <div
      className="flex items-center gap-4px px-6px py-2px rounded-10px self-start whitespace-nowrap"
      style={{ background: TONE_BG[tone] }}
    >
      <span
        className="size-6px rounded-full shrink-0"
        style={{ background: TONE_DOT[tone] }}
      />
      <span
        className="text-xs tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)", color: TONE_DOT[tone] }}
      >
        {text}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  AiBulletList
 * ─────────────────────────────────────────────────────────────────── */

/**
 * AiBulletList — 위젯 본문의 통일 bullet list.
 *
 * ## Purpose
 * 카드 본문 안의 항목 나열을 일관된 `ul/li` 스타일로 노출. 12px 좌측 들여쓰기 + disc bullet + 4c4c4c
 * 텍스트 + 한국어 폰트. AI 응답에서 가장 흔한 "key findings", "권장 조치" 등의 표현.
 *
 * ## When to use
 * - 3개 이상 항목 나열 (1-2 개면 인라인 텍스트가 자연스러움).
 * - 평등한 weight 의 항목들 (강조 없는 등가 정보).
 *
 * ## When NOT to use
 * - 항목별 강조가 필요 → 각 항목을 별도 카드 또는 [[AiClassificationTable]] 로.
 * - step-by-step 진행 → [[AiStepsTimeline]] 의 ✓/spinner 패턴 사용.
 * - 숫자가 포함된 표 → [[AiCostTable]] 등 전용 table 컴포넌트.
 *
 * ## Composition rules
 * - 텍스트 안에 인라인 컬러 적용 금지 — 톤 강조가 필요하면 항목 자체를 다른 카드로 분리.
 * - `size="md"` 는 카드 헤더 바로 아래 본문에 (13px), `size="sm"` 은 부가 정보에 (12px, 기본).
 *
 * @example
 * ```tsx
 * <AiBulletList items={[
 *   "httpc 응답시간 4,294ms — 압도적 dominant",
 *   "method/sql/dbc/socket 은 정상 범위",
 *   "외부 API 의존도 ↑ 가능성 높음",
 * ]} />
 * ```
 */
export function AiBulletList({ items, size = "sm" }: {
  /** 항목 문자열 배열. 마크업 필요하면 컴포넌트 분리 검토. */
  items: string[];
  /** 텍스트 크기. `sm` (12px, 회색, 기본) / `md` (13px, 진한 회색). */
  size?: "sm" | "md";
}) {
  const textCls =
    size === "md"
      ? "text-md text-primary tracking-default leading-normal"
      : "text-base text-secondary tracking-default leading-relaxed";
  return (
    <ul className="flex flex-col gap-3px pl-12px">
      {items.map((b, i) => (
        <li
          key={i}
          className={`${textCls} list-disc list-outside`}
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {b}
        </li>
      ))}
    </ul>
  );
}
