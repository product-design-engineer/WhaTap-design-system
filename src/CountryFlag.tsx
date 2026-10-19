/**
 * CountryFlag — 고품질 국기 SVG 컴포넌트.
 *
 * ## Purpose
 * 언어 선택기·로케일 표시 등에서 국기를 렌더링.
 * Untitled UI Flag Icons(MIT) 기반 정밀 SVG(아래 FLAGS 주석 참고).
 *
 * ## When to use
 * - GNB 언어 드롭다운
 * - 로케일 선택 UI
 *
 * ## When NOT to use
 * - 국가·지역 데이터를 나타내는 차트·지도 범례 → 차트 색 토큰(`--color-chart-*`)으로 표현한다.
 * - 지원하지 않는 코드(ko · en · ja 외) — 없는 코드는 아무것도 렌더하지 않으므로 텍스트 라벨로 대체한다.
 * - 국기 색을 다른 UI 에 가져다 쓰기 — `--color-flag-*` 는 국기 안에서만 쓴다.
 *
 * ## Composition rules
 * - 비율 30×20(3:2). `size` 는 너비(px)이고 높이는 2/3 로 따라온다.
 * - `size` 를 생략하면 부모를 100% 채운다 — 단독 배치에서는 항상 `size` 를 준다.
 * - 둥근 모서리(border-radius 2px) 기본 적용
 * - 코드는 **언어 코드**(ISO 639-1 소문자: ko · en · ja) — 국가 코드(kr · us · jp)가 아니다.
 * - 색은 `--color-flag-*` 토큰 — 국가 표장이라 테마와 무관하게 고정(.dark 재매핑 없음).
 *
 * @example
 * ```tsx
 * <CountryFlag code="ko" size={20} />
 * <CountryFlag code="en" size={24} />
 * <CountryFlag code="ja" size={20} />
 * ```
 */

export type CountryFlagProps = {
  /** 언어 코드 — ko · en · ja (대소문자 무관). 그 외 코드는 아무것도 그리지 않는다. */
  code: string;
  /** 가로 크기(px). 세로는 2/3(30×20 비율). 생략하면 부모를 100% 채운다. */
  size?: number;
};

export default function CountryFlag({ code, size }: CountryFlagProps) {
  const svg = FLAGS[code.toLowerCase()];
  if (!svg) return null;

  /* size 가 주어지면 고정 치수, 없으면 부모에 꽉 차도록 100%. */
  const w = size ?? "100%";
  const h = size ? Math.round(size * (2 / 3)) : "100%";

  return (
    <span
      style={{
        display: "inline-flex",
        width: w,
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

/* ── 국기 SVG — Untitled UI Flag Icons (MIT) ─────────────
 * https://www.untitledui.com/resources/flag-icons
 * viewBox 30×20 rectangle 스타일. 고품질 디테일. */

const FLAGS: Record<string, React.ReactElement> = {
  /* 🇰🇷 대한민국 — 태극기 + 건곤감이 4괘 */
  ko: (
    <svg viewBox="0 0 30 20" width="100%" height="100%" fill="none">
      <path d="M30 0H0V20H30V0Z" fill="var(--color-flag-field-kr)" />
      <path d="M18.652 9.99964C18.652 10.9127 17.0168 13.1953 14.9998 13.1953C12.9828 13.1953 11.3477 10.9126 11.3477 9.99964C11.3477 7.98263 12.9828 6.34753 14.9998 6.34753C17.0168 6.34753 18.652 7.98263 18.652 9.99964Z" fill="var(--color-flag-red)" />
      <path d="M18.652 9.99963C18.652 12.0166 17.0168 13.6517 14.9998 13.6517C12.9828 13.6517 11.3477 12.0166 11.3477 9.99963" fill="var(--color-flag-blue-kr)" />
      <path d="M19.8415 12.2599L18.873 13.2283L19.5186 13.8739L20.4871 12.9054L19.8415 12.2599Z" fill="var(--color-flag-ink)" />
      <path d="M18.2282 13.8733L17.2598 14.8417L17.9054 15.4873L18.8738 14.5188L18.2282 13.8733Z" fill="var(--color-flag-ink)" />
      <path d="M21.779 14.1955L20.8105 15.1639L21.4561 15.8095L22.4246 14.8411L21.779 14.1955Z" fill="var(--color-flag-ink)" />
      <path d="M20.1657 15.8102L19.1973 16.7786L19.8429 17.4241L20.8113 16.4557L20.1657 15.8102Z" fill="var(--color-flag-ink)" />
      <path d="M20.8102 13.2278L19.8418 14.1962L20.4874 14.8417L21.4558 13.8733L20.8102 13.2278Z" fill="var(--color-flag-ink)" />
      <path d="M19.1969 14.8416L18.2285 15.8101L18.8741 16.4556L19.8425 15.4872L19.1969 14.8416Z" fill="var(--color-flag-ink)" />
      <path d="M18.2281 4.18896L20.8105 6.77136L21.4561 6.12578L18.8737 3.54338L18.2281 4.18896Z" fill="var(--color-flag-ink)" />
      <path d="M17.2601 5.15756L18.2285 6.12598L18.8741 5.48044L17.9056 4.51202L17.2601 5.15756Z" fill="var(--color-flag-ink)" />
      <path d="M18.8734 6.7717L19.8418 7.74011L20.4873 7.09457L19.5189 6.12616L18.8734 6.7717Z" fill="var(--color-flag-ink)" />
      <path d="M19.1956 3.22067L20.1641 4.18909L20.8097 3.54351L19.8412 2.57509L19.1956 3.22067Z" fill="var(--color-flag-ink)" />
      <path d="M20.8109 4.83481L21.7793 5.80322L22.4249 5.15764L21.4565 4.18923L20.8109 4.83481Z" fill="var(--color-flag-ink)" />
      <path d="M10.8031 16.7783L8.2207 14.1959L7.57512 14.8415L10.1575 17.4239L10.8031 16.7783Z" fill="var(--color-flag-ink)" />
      <path d="M11.7712 15.8102L10.8027 14.8418L10.1572 15.4873L11.1256 16.4557L11.7712 15.8102Z" fill="var(--color-flag-ink)" />
      <path d="M10.1579 14.1962L9.18945 13.2278L8.54387 13.8734L9.51229 14.8418L10.1579 14.1962Z" fill="var(--color-flag-ink)" />
      <path d="M12.7406 14.842L10.1582 12.2596L9.51262 12.9052L12.095 15.4876L12.7406 14.842Z" fill="var(--color-flag-ink)" />
      <path d="M8.22225 5.8025L10.8047 3.22009L10.1591 2.57451L7.57667 5.15692L8.22225 5.8025Z" fill="var(--color-flag-ink)" />
      <path d="M9.18905 6.77137L11.7715 4.18896L11.1259 3.54338L8.54346 6.12579L9.18905 6.77137Z" fill="var(--color-flag-ink)" />
      <path d="M10.1578 7.73976L12.7402 5.15735L12.0947 4.51181L9.51225 7.09422L10.1578 7.73976Z" fill="var(--color-flag-ink)" />
    </svg>
  ),

  /* 🇺🇸 미국 — 성조기 13줄 + 캔턴 별 */
  en: (
    <svg viewBox="0 0 30 20" width="100%" height="100%" fill="none">
      <path d="M30 0H0V20H30V0Z" fill="var(--color-flag-field)" />
      <path d="M30 2.49976H0V4.99951H30V2.49976Z" fill="var(--color-flag-red)" />
      <path d="M30 7.49988H0V9.99964H30V7.49988Z" fill="var(--color-flag-red)" />
      <path d="M30 12.4994H0V14.9991H30V12.4994Z" fill="var(--color-flag-red)" />
      <path d="M30 17.4996H0V19.9994H30V17.4996Z" fill="var(--color-flag-red)" />
      <path d="M15 0H0V10.7692H15V0Z" fill="var(--color-flag-blue-us)" />
      <path d="M5.84916 4.41162L5.60758 5.15482H4.82617L5.45846 5.61389L5.21687 6.35703L5.84916 5.89795L6.48104 6.35703L6.23951 5.61389L6.8718 5.15482H6.09033L5.84916 4.41162Z" fill="var(--color-flag-field)" />
      <path d="M6.09033 7.83676L5.84916 7.09363L5.60758 7.83676H4.82617L5.45846 8.2959L5.21687 9.03904L5.84916 8.5799L6.48104 9.03904L6.23951 8.2959L6.8718 7.83676H6.09033Z" fill="var(--color-flag-field)" />
      <path d="M2.78766 7.83676L2.54643 7.09363L2.30484 7.83676H1.52344L2.15572 8.2959L1.91414 9.03904L2.54643 8.5799L3.17836 9.03904L2.93684 8.2959L3.569 7.83676H2.78766Z" fill="var(--color-flag-field)" />
      <path d="M2.54643 4.41162L2.30484 5.15482H1.52344L2.15572 5.61389L1.91414 6.35703L2.54643 5.89795L3.17836 6.35703L2.93684 5.61389L3.569 5.15482H2.78766L2.54643 4.41162Z" fill="var(--color-flag-field)" />
      <path d="M5.84916 1.72961L5.60758 2.47287H4.82617L5.45846 2.932L5.21687 3.67514L5.84916 3.216L6.48104 3.67514L6.23951 2.932L6.8718 2.47287H6.09033L5.84916 1.72961Z" fill="var(--color-flag-field)" />
      <path d="M2.54643 1.72961L2.30484 2.47287H1.52344L2.15572 2.932L1.91414 3.67514L2.54643 3.216L3.17836 3.67514L2.93684 2.932L3.569 2.47287H2.78766L2.54643 1.72961Z" fill="var(--color-flag-field)" />
      <path d="M9.15184 4.41162L8.91031 5.15482H8.12891L8.76113 5.61389L8.51967 6.35703L9.15184 5.89795L9.78383 6.35703L9.54225 5.61389L10.1745 5.15482H9.39312L9.15184 4.41162Z" fill="var(--color-flag-field)" />
      <path d="M9.39312 7.83676L9.15184 7.09363L8.91031 7.83676H8.12891L8.76113 8.2959L8.51967 9.03904L9.15184 8.5799L9.78383 9.03904L9.54225 8.2959L10.1745 7.83676H9.39312Z" fill="var(--color-flag-field)" />
      <path d="M12.6958 7.83676L12.4546 7.09363L12.213 7.83676H11.4316L12.0638 8.2959L11.8223 9.03904L12.4546 8.5799L13.0865 9.03904L12.8449 8.2959L13.4772 7.83676H12.6958Z" fill="var(--color-flag-field)" />
      <path d="M12.4546 4.41162L12.213 5.15482H11.4316L12.0638 5.61389L11.8223 6.35703L12.4546 5.89795L13.0865 6.35703L12.8449 5.61389L13.4772 5.15482H12.6958L12.4546 4.41162Z" fill="var(--color-flag-field)" />
      <path d="M9.15184 1.72961L8.91031 2.47287H8.12891L8.76113 2.932L8.51967 3.67514L9.15184 3.216L9.78383 3.67514L9.54225 2.932L10.1745 2.47287H9.39312L9.15184 1.72961Z" fill="var(--color-flag-field)" />
      <path d="M12.4546 1.72961L12.213 2.47287H11.4316L12.0638 2.932L11.8223 3.67514L12.4546 3.216L13.0865 3.67514L12.8449 2.932L13.4772 2.47287H12.6958L12.4546 1.72961Z" fill="var(--color-flag-field)" />
    </svg>
  ),

  /* 🇯🇵 일본 — 일장기 */
  ja: (
    <svg viewBox="0 0 30 20" width="100%" height="100%" fill="none">
      <path d="M30 0H0V20H30V0Z" fill="var(--color-flag-field)" />
      <path d="M15 15.6246C18.1066 15.6246 20.625 13.1062 20.625 9.99966C20.625 6.8931 18.1066 4.37473 15 4.37473C11.8934 4.37473 9.375 6.8931 9.375 9.99966C9.375 13.1062 11.8934 15.6246 15 15.6246Z" fill="var(--color-flag-red)" />
    </svg>
  ),
};
