/**
 * IcSearch — 검색(돋보기) 아이콘.
 *
 * [[FilterBar]] 문서가 `TextField leadingIcon=search` 를 표준 용법으로 지시하는데 DS 에 에셋이
 * 없어서 소비자(events/catalog 등)가 각자 인라인 SVG 를 다시 그리고 있었다. 같은 아이콘을
 * 두 번 그리면 크기·굵기·색이 갈라지므로 여기로 올린다.
 *
 * `currentColor` 를 쓴다 — TextField/Button 이 자신의 fg 토큰을 물려주면 그대로 따른다.
 * 크기는 아이콘 크기 정책의 4단 스케일(24/20/16/12)만 받는다. 기본 16(32px 컨트롤 안).
 */
export function IcSearch({ size = 16 }: { size?: 24 | 20 | 16 | 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default IcSearch;
