/**
 * SettingsIcon — 모든 시나리오 공용 톱니바퀴 (gear/cog) 아이콘.
 *
 * 기존 변형들 (blob path, 회전 광선 등) 을 이 컴포넌트로 통일:
 *   - pages/project-list/ProjectCard.tsx (local SettingIcon)
 *   - pages/flex-board/operation.tsx (ActionIcon "설정")
 *   - pages/flex-board/FlexBoardWidget.tsx (IconButton "설정")
 *   - pages/db/DbRacDashboard.tsx (2곳)
 *
 * 디자인: 8-tooth 가운데 hole, viewBox 24, fillRule evenodd. Material-style 톱니바퀴.
 *
 * 정책: feedback-common-components-catalog (chrome-level 공용 아이콘).
 */
import type { CSSProperties } from "react";

export default function SettingsIcon({
  size = 16,
  color = "#757575",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.841 1.5a2.854 2.854 0 0 1 2.846 2.802q.484.242.933.543a2.836 2.836 0 0 1 3.835 1.078l.949 1.654a2.874 2.874 0 0 1-.99 3.88 9 9 0 0 1 0 1.085 2.874 2.874 0 0 1 .99 3.881l-.949 1.654a2.836 2.836 0 0 1-3.835 1.078q-.45.3-.933.543A2.854 2.854 0 0 1 12.84 22.5h-1.897A2.854 2.854 0 0 1 8.1 19.698a9 9 0 0 1-.934-.543 2.836 2.836 0 0 1-3.835-1.078l-.948-1.654a2.874 2.874 0 0 1 .99-3.88 9 9 0 0 1 0-1.085 2.874 2.874 0 0 1-.99-3.881l.948-1.654a2.836 2.836 0 0 1 3.835-1.078q.45-.3.934-.543A2.854 2.854 0 0 1 10.944 1.5zm.008 1.75h-1.932a.97.97 0 0 0-.967.972v1.254a6.75 6.75 0 0 0-2.714 1.579l-1.08-.628a.963.963 0 0 0-1.32.356l-.967 1.684a.976.976 0 0 0 .354 1.328l1.08.628a6.9 6.9 0 0 0 0 3.154l-1.08.628a.976.976 0 0 0-.354 1.328l.966 1.684a.963.963 0 0 0 1.32.356l1.081-.628a6.75 6.75 0 0 0 2.714 1.579v1.254a.97.97 0 0 0 .967.972h1.932a.97.97 0 0 0 .966-.972v-1.254a6.75 6.75 0 0 0 2.714-1.579l1.082.628a.963.963 0 0 0 1.32-.356l.966-1.684a.976.976 0 0 0-.354-1.328l-1.08-.628a6.9 6.9 0 0 0 0-3.154l1.08-.628a.976.976 0 0 0 .354-1.328l-.967-1.684a.963.963 0 0 0-1.32-.356l-1.08.628a6.75 6.75 0 0 0-2.714-1.579V4.222a.97.97 0 0 0-.967-.972m-.911 5.25c1.921 0 3.478 1.567 3.478 3.5s-1.557 3.5-3.478 3.5S8.46 13.933 8.46 12s1.557-3.5 3.478-3.5m0 1.75c-.96 0-1.74.784-1.74 1.75s.78 1.75 1.74 1.75 1.74-.784 1.74-1.75-.78-1.75-1.74-1.75"
      />
    </svg>
  );
}
