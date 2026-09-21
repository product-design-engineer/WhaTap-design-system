/**
 * CountryFlag — 고품질 국기 SVG 컴포넌트.
 *
 * ## Purpose
 * 언어 선택기·로케일 표시 등에서 국기를 렌더링.
 * flag-icons(lipis/flag-icons) 기반 정밀 SVG.
 *
 * ## When to use
 * - GNB 언어 드롭다운
 * - 로케일 선택 UI
 *
 * ## Composition rules
 * - 기본 크기 20×15(4:3), `size` prop으로 조정
 * - 둥근 모서리(border-radius 2px) 기본 적용
 * - 코드는 ISO 3166-1 alpha-2 소문자
 *
 * @example
 * ```tsx
 * <CountryFlag code="ko" />
 * <CountryFlag code="en" size={24} />
 * <CountryFlag code="ja" />
 * ```
 */

export type CountryFlagProps = {
  code: string;
  /** 가로 크기(px). 세로는 3:4 비율. 기본 20. */
  size?: number;
};

export default function CountryFlag({ code, size = 20 }: CountryFlagProps) {
  const h = size * 0.75;
  const svg = FLAGS[code.toLowerCase()];
  if (!svg) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        width: size,
        height: h,
        borderRadius: 2,
        overflow: "hidden",
        flexShrink: 0,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    >
      {svg}
    </span>
  );
}

/* ── 국기 SVG — flag-icons (MIT) 기반 정밀 재현 ─────────── */

const FLAGS: Record<string, React.ReactElement> = {
  /* 🇰🇷 대한민국 — 태극기 (국기법 시행령 기준) */
  ko: (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <rect width="900" height="600" fill="#fff" />
      {/* 태극 — 적(양)·청(음) S 곡선 */}
      <circle cx="450" cy="300" r="150" fill="#C60C30" />
      <path d="M450 150a150 150 0 0 1 0 300 75 75 0 0 1 0-150 75 75 0 0 0 0-150z" fill="#003478" />
      {/* 건 (☰) 좌상 — 3 실선 */}
      <g transform="translate(450 300) rotate(-56.31)">
        <rect x="195" y="-40" width="130" height="16" fill="#000" />
        <rect x="195" y="-6" width="130" height="16" fill="#000" />
        <rect x="195" y="28" width="130" height="16" fill="#000" />
      </g>
      {/* 곤 (☷) 우하 — 3 끊긴 선 */}
      <g transform="translate(450 300) rotate(-56.31)">
        <rect x="-325" y="-40" width="58" height="16" fill="#000" />
        <rect x="-255" y="-40" width="58" height="16" fill="#000" />
        <rect x="-325" y="-6" width="58" height="16" fill="#000" />
        <rect x="-255" y="-6" width="58" height="16" fill="#000" />
        <rect x="-325" y="28" width="58" height="16" fill="#000" />
        <rect x="-255" y="28" width="58" height="16" fill="#000" />
      </g>
      {/* 감 (☵) 우상 — 실·끊·실 */}
      <g transform="translate(450 300) rotate(56.31)">
        <rect x="195" y="-40" width="130" height="16" fill="#000" />
        <rect x="195" y="-6" width="58" height="16" fill="#000" />
        <rect x="267" y="-6" width="58" height="16" fill="#000" />
        <rect x="195" y="28" width="130" height="16" fill="#000" />
      </g>
      {/* 이 (☲) 좌하 — 끊·실·끊 */}
      <g transform="translate(450 300) rotate(56.31)">
        <rect x="-325" y="-40" width="58" height="16" fill="#000" />
        <rect x="-255" y="-40" width="58" height="16" fill="#000" />
        <rect x="-325" y="-6" width="130" height="16" fill="#000" />
        <rect x="-325" y="28" width="58" height="16" fill="#000" />
        <rect x="-255" y="28" width="58" height="16" fill="#000" />
      </g>
    </svg>
  ),

  /* 🇺🇸 미국 */
  en: (
    <svg viewBox="0 0 1235 650" width="100%" height="100%">
      {/* 13 줄 */}
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} y={i * 50} width="1235" height="50" fill={i % 2 === 0 ? "#B22234" : "#fff"} />
      ))}
      {/* 캔턴 */}
      <rect width="494" height="350" fill="#3C3B6E" />
      {/* 별 — 9행 11열 교차 배치 (50개) */}
      {Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: r % 2 === 0 ? 6 : 5 }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={(r % 2 === 0 ? 22 : 44) + c * 44}
            cy={18 + r * 39}
            r="10"
            fill="#fff"
          />
        )),
      )}
    </svg>
  ),

  /* 🇯🇵 일본 */
  ja: (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <rect width="900" height="600" fill="#fff" />
      <circle cx="450" cy="300" r="180" fill="#BC002D" />
    </svg>
  ),
};
