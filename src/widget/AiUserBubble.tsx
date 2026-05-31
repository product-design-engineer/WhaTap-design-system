/**
 * AiUserBubble — WhaTap AI 위젯 "인간 입력 정보 버블" 공용 컴포넌트.
 *
 * Figma source: Common file `ttJ3slHi0F7Hp8NE02c6nZ`, node `27110:53409`.
 *
 * Exact-design verbatim:
 *   - 배경: #f5f5f5 (sementic_background_page)
 *   - 라운드: 4px (radius_sm)
 *   - 패딩: 8px (spacing_xs)
 *   - 텍스트: 14px / line-height 1.4 / letter-spacing -0.1px / color #222
 *   - 폰트: Noto Sans / Noto Sans KR, weight 400
 *   - word-break: break-word, white-space pre-wrap (사용자 입력의 줄바꿈 보존)
 *   - 컨테이너 정렬: justify-end — 채팅 스레드 우측 정렬
 *   - max-width: 부모의 85% (긴 입력 시 오른쪽으로 치우치되 좌측 여백 확보)
 *
 * 정책: [[reference-ai-widget-content-guide]] / [[feedback-widget-primitives]]
 *      AI 위젯 메시지 타입은 모두 src/components/widget/ 에 위치.
 */
import type { ReactNode } from "react";

export type AiUserBubbleProps = {
  /** 사용자 입력 본문. 줄바꿈은 \n 그대로. */
  children: ReactNode;
  /** 추가 좌측 컨텐츠가 들어갈 wrapper 영역 (예: 첨부 미리보기). 거의 사용 안 함. */
  className?: string;
};

export default function AiUserBubble({ children, className }: AiUserBubbleProps) {
  return (
    <div className={`flex justify-end w-full ${className ?? ""}`} data-node-id="27110:53409">
      <div
        className="rounded-[4px] px-[8px] py-[8px]"
        style={{
          background: "#f5f5f5",
          maxWidth: "85%",
        }}
      >
        <p
          className="text-lg text-primary tracking-default leading-normal whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-regular)",
            wordBreak: "break-word",
            margin: 0,
          }}
          data-node-id="27110:53411"
        >
          {children}
        </p>
      </div>
    </div>
  );
}
