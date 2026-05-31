/**
 * AI 위젯 — 자동 클릭 손 커서 (공용).
 *
 * 시나리오 데모에서 "AI가 어디를 누를지" 시각적으로 알려주는 인디케이터.
 * 부모는 반드시 `position: relative`여야 하며, 이 컴포넌트는 absolute로 절대
 * 위치한다. `z-index: 999`로 위젯 콘텐츠 위에 항상 떠있고, pointer-events: none.
 *
 * 애니메이션: `ai-click-hand` 클래스 — fadeIn(0.25s) + tap loop(0.85s 무한).
 * 기본 사이즈 48px (32 → 150%). 부모 컨테이너의 코너 가까이에 right/top px로
 * 미세 조정해 버튼 우측 위에서 탭하는 형태를 만든다.
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
