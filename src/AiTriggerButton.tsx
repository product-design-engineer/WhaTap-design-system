/**
 * AiTriggerButton — 인라인 WhaTap AI 진입점 (아이콘 전용, 애니메이션 심볼).
 *
 * ## Purpose
 * 차트 카드·테이블 행·셀 제목 옆에 놓여, 클릭하면 그 요소의 컨텍스트로 WhaTap AI
 * 위젯을 여는 미세 진입점. 그라데이션 핀휠 심볼이 숨쉬기(scale 1↔1.2 + glow)+저속
 * 회전으로 시선을 끌고, `reveal="hover"` 에서는 대상 위에 올렸을 때만 나타나 UI 를
 * 방해하지 않는다. (MiniLineChart 에 인라인으로 있던 AI 트리거를 추출.)
 *
 * ## When to use
 * - 지표 카드/행 제목 옆 "이 항목을 WhaTap AI 로 분석" 진입점 ([[MiniLineChart]], 테이블 행 등)
 * - 상시 노출이 과한 밀집 UI 에서 hover 시에만 드러내야 하는 AI 트리거
 *
 * ## When NOT to use
 * - 라벨 있는 전역 AI 버튼 → [[AiAssistantButton]] (PageHeader 우측 pill)
 * - 클릭 없는 브랜드 표식/장식 심볼 → [[AiSymbol]]
 * - AI 대화 UI 전체 → [[WhaTapAiWidget]]
 *
 * ## Composition rules
 * - `reveal="hover"` 는 **조상에 `group` 클래스가 있어야** 동작 (whatap-ds.css 의
 *   unlayered `.group:hover .group-hover-opacity-100`). 단독 배치 시엔 노출되지 않는다.
 * - 애니메이션은 기존 DS 키프레임 `aiSymbolBreathing` + `aiSymbolRotateSlow` 재사용 — 신규 CSS 없음.
 * - 아이콘은 데코(`alt=""`), 의미는 버튼 `aria-label`(기본 "WhaTap AI")이 전달.
 * - 심볼은 위젯 헤더와 동일 자산(`/icons/ai-symbol-gradient.svg`)을 써 시각 통일.
 * - 컨텍스트(metric·values·timeRange 등) 구성은 소비 측 `onClick` 에서 책임진다.
 *
 * @example
 * ```tsx
 * // hover 노출은 부모 .group 필요
 * <div className="group ...">
 *   <AiTriggerButton
 *     reveal="hover"
 *     tooltip="이 차트를 WhaTap AI로 분석"
 *     onClick={() => openAi({ metric, values })}
 *   />
 * </div>
 * ```
 */
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Tooltip, { type TooltipPlacement } from "./Tooltip";

/** 위젯 헤더 심볼과 동일한 DS 키프레임 재사용 (breathing 2.4s + 저속 회전 8s). */
const AI_SYMBOL_ANIMATION =
  "aiSymbolBreathing 2.4s ease-in-out infinite, aiSymbolRotateSlow 8s linear infinite";

export type AiTriggerButtonProps = {
  /** 클릭 시 AI 위젯을 해당 컨텍스트로 여는 핸들러. 컨텍스트 구성은 소비 측 책임. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * 노출 방식.
   * - `"always"`(기본): 상시 표시 — 숨쉬기로 시선 유도.
   * - `"hover"`: 부모 `.group` hover 시에만 fade-in (조상 `.group` 필요).
   */
  reveal?: "always" | "hover";
  /** 심볼 px 크기. 기본 13 (제목 옆 인라인 기준). */
  size?: number;
  /** 접근성 라벨(`aria-label`). 기본 "WhaTap AI". */
  label?: string;
  /** 숨쉬기+회전 애니메이션. `false` 면 정적 — prefers-reduced-motion 대응 스위치로도 사용. 기본 true. */
  animate?: boolean;
  /** 지정 시 `Tooltip` 으로 감싸 설명 노출. 미지정이면 소비 측이 합성. */
  tooltip?: ReactNode;
  /** tooltip placement. 기본 "right". */
  tooltipPlacement?: TooltipPlacement;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export default function AiTriggerButton({
  onClick,
  reveal = "always",
  size = 13,
  label = "WhaTap AI",
  animate = true,
  tooltip,
  tooltipPlacement = "right",
  className = "",
  ...rest
}: AiTriggerButtonProps) {
  const btn = (
    <button
      {...rest}
      type={rest.type ?? "button"}
      aria-label={label}
      onClick={onClick}
      className={`flex items-center cursor-pointer${
        reveal === "hover" ? " opacity-0 group-hover-opacity-100 transition-opacity" : ""
      }${className ? ` ${className}` : ""}`}
    >
      <img
        src="/icons/ai-symbol-gradient.svg"
        alt=""
        width={size}
        height={size}
        style={animate ? { animation: AI_SYMBOL_ANIMATION } : undefined}
      />
    </button>
  );

  return tooltip != null ? (
    <Tooltip content={tooltip} placement={tooltipPlacement}>
      {btn}
    </Tooltip>
  ) : (
    btn
  );
}
