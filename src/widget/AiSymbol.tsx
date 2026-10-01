/**
 * AiSymbol — WhaTap AI 핀휠(pinwheel) 심볼 (그라데이션).
 *
 * ## Purpose
 * WhaTap AI 의 브랜드 심볼을 그리는 순수 SVG 아이콘. blue→purple 그라데이션의
 * 4-blade 핀휠 마크로, AI 진입점·로딩·헤더 등에서 AI 정체성을 표시한다.
 *
 * ## When to use
 * - AI 위젯/버튼/헤더 옆 브랜드 마크 (AI 기능임을 나타내는 시각 표식)
 * - AI 로딩·환영 화면의 장식 심볼
 *
 * ## When NOT to use
 * - 톱니바퀴·설정 등 일반 기능 아이콘 → [[SettingsIcon]] 등 icons/
 * - AI 입력/대화 UI 전체 → [[WhaTapAiWidget]] / [[AiWidget]]
 *
 * ## Composition rules
 * - 정사각형(`size` = px 너비/높이), `viewBox 304×302` 고정 비율.
 * - 그라데이션 id 는 `size` 로 유니크하게 생성 — 한 페이지에 여러 size 공존 OK.
 * - 기본은 blue→purple 그라데이션. `color` 를 주면 그 한 가지 색으로 칠한다.
 *   그라데이션은 흰 바탕을 전제로 만든 것이라, 색이 있는 면(위젯 헤더·브랜드 배경) 위에서는
 *   대비가 무너진다. 그 자리에서만 단색을 쓴다 — 취향으로 색을 바꾸는 prop 이 아니다.
 * - 데코레이션이므로 `aria-hidden`. 의미 전달이 필요하면 부모에 라벨 부여.
 *
 * @example
 * ```tsx
 * <AiSymbol size={20} className="mr-1" />
 * ```
 */
export default function AiSymbol({
  size = 16,
  color,
  className = "",
}: {
  size?: number;
  /** 주면 그라데이션 대신 이 한 가지 색으로 칠한다. 색이 있는 면 위에 놓일 때만 쓴다. */
  color?: string;
  className?: string;
}) {
  const id = `aiSymGrad-${size}`;
  const fill = color ?? `url(#${id})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 304 302"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M69.9469 52.0397L0 121.436H113.664L177.558 56.0822V0.834821H162.088L111.646 52.0397H69.9469Z" fill={fill} />
      <path d="M234.053 250.795L304 181.399H190.336L126.442 246.753V302H141.911L192.354 250.795H234.053Z" fill={fill} />
      <path d="M251.142 69.7602L181.557 0L182.063 113.862L247.586 177.577L302.736 177.331L302.667 161.835L251.328 111.532L251.142 69.7602Z" fill={fill} />
      <path d="M52.2329 231.996L121.809 301.765L121.317 187.903L55.8028 124.18L0.652893 124.419L0.719801 139.915L52.0525 190.224L52.2329 231.996Z" fill={fill} />
      {!color && (
      <defs>
        <linearGradient id={id} x1="50" y1="50" x2="260" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-whatap-blue)" />
          <stop offset="1" stopColor="var(--color-whatap-purple)" />
        </linearGradient>
      </defs>
      )}
    </svg>
  );
}
