/**
 * WhaTap AI pinwheel symbol with gradient.
 * Use `size` for px size, `className` for wrapper styling.
 */
export default function AiSymbol({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = `aiSymGrad-${size}`;
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
      <path d="M69.9469 52.0397L0 121.436H113.664L177.558 56.0822V0.834821H162.088L111.646 52.0397H69.9469Z" fill={`url(#${id})`} />
      <path d="M234.053 250.795L304 181.399H190.336L126.442 246.753V302H141.911L192.354 250.795H234.053Z" fill={`url(#${id})`} />
      <path d="M251.142 69.7602L181.557 0L182.063 113.862L247.586 177.577L302.736 177.331L302.667 161.835L251.328 111.532L251.142 69.7602Z" fill={`url(#${id})`} />
      <path d="M52.2329 231.996L121.809 301.765L121.317 187.903L55.8028 124.18L0.652893 124.419L0.719801 139.915L52.0525 190.224L52.2329 231.996Z" fill={`url(#${id})`} />
      <defs>
        <linearGradient id={id} x1="50" y1="50" x2="260" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#004BE0" />
          <stop offset="1" stopColor="#8B52FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
