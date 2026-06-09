/**
 * AiClickCursor — 자동 클릭 손 커서 (시연용 인터랙션 데모, 공용).
 *
 * ## Purpose
 * 시나리오/Storybook 데모에서 "AI 가 어디를 누를지" 를 시각적으로 알려주는 데코레이션
 * 인디케이터. 실제 클릭을 발생시키지 않는 순수 연출 요소 — `pointer-events: none` 으로
 * 입력을 가로채지 않고, `aria-hidden` 으로 접근성 트리에서 제외. 프로덕션 인터랙션이 아닌
 * 시연 목적임을 분명히 한다.
 *
 * ## When to use
 * - 시나리오 데모/녹화/Storybook 에서 다음 클릭 지점을 손가락으로 가리킬 때.
 * - 자동 재생되는 walkthrough 의 "탭" 연출.
 *
 * ## When NOT to use
 * - 실제 클릭 가능한 컨트롤 → 일반 `<button>` 등 인터랙티브 요소.
 * - 시연이 아닌 프로덕션 UI 의 영구 표식 → 데코레이션 커서 부적합.
 *
 * ## Composition rules
 * - 부모는 반드시 `position: relative` — 이 컴포넌트는 `absolute` 로 절대 위치.
 * - `z-index: 999` 로 위젯 콘텐츠 위에 항상 떠 있고 `pointer-events: none`.
 * - 위치는 `style` 의 right/top px 등으로 부모 코너 기준 미세 조정 (버튼 우측 위 탭 형태).
 * - 애니메이션은 `ai-click-hand` 클래스 — fadeIn(0.25s) + tap loop(0.85s 무한). 기본 48px.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <AiSendButton active />
 *   <AiClickCursor style={{ right: -6, top: -6 }} />
 * </div>
 * ```
 */
import type { CSSProperties } from "react";

export default function AiClickCursor({
  size = 48,
  style,
}: {
  /** 한 변 px (기본 48 = 32 * 150%) */
  size?: number;
  /** 위치 보정 등 추가 스타일 */
  style?: CSSProperties;
}) {
  return (
    <img
      src="/icons/pointing-hand.svg"
      alt=""
      aria-hidden="true"
      className="ai-click-hand absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        zIndex: 999,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
        ...style,
      }}
    />
  );
}
