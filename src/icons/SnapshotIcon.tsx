/**
 * IcSnapshot — 스냅샷(카메라 셔터) 아이콘.
 *
 * "이 값은 특정 시점에 찍힌 것" 을 뜻하는 자리에 쓴다 — 판정 기준 시각 칩, 스냅샷 보고서,
 * 캡처된 상태 카드 등. 시계 아이콘(현재 시각·경과)과 구별해서 쓸 것: 시계는 *지금 몇 시*,
 * 셔터는 *언제 찍힌 값*이다.
 *
 * 공통 아이콘을 DS 에 올리는 것과 같은 이유다 — 에셋이 없으면 소비자가 각자 인라인 SVG 를 그리고,
 * 같은 아이콘의 굵기·크기·색이 화면마다 갈라진다.
 *
 * `currentColor` 를 쓴다 — Chip/Button 이 자신의 fg 토큰을 물려주면 그대로 따른다(경고 톤 칩
 * 안에서는 경고색으로 같이 바뀐다). 크기는 아이콘 크기 정책의 4단 스케일(24/20/16/12)만 받는다.
 */
export function IcSnapshot({ size = 16 }: { size?: 24 | 20 | 16 | 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {/* 몸체 + 상단 뷰파인더 턱 — 턱이 없으면 작은 크기에서 그냥 사각형으로 읽힌다. */}
      <path
        d="M1.9 4.9h2.2l.95-1.4h3.9l.95 1.4h2.2a.9.9 0 0 1 .9.9v5.8a.9.9 0 0 1-.9.9H1.9a.9.9 0 0 1-.9-.9V5.8a.9.9 0 0 1 .9-.9Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* 렌즈 */}
      <circle cx="7.5" cy="8.7" r="2.35" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default IcSnapshot;
