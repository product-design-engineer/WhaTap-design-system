/**
 * MemberUsageBar — 사람별 사용량 한 줄. Primitives layer.
 *
 * ## Purpose
 * 이름 · 값 · 막대를 한 줄에 세워, 여러 사람을 위아래로 쌓았을 때 «누가 많이 썼는지» 가
 * 막대 길이로 한눈에 보이게 한다.
 *
 * ## When to use
 * - 한 덩어리(플랜 · 프로젝트)의 사용량을 사람별로 갈라 보여 주는 목록.
 * - 항목이 5~20개쯤이고 순위가 관심사인 자리.
 *
 * ## When NOT to use
 * - 항목이 서넛뿐 → 표 한 줄이면 된다. 막대는 여럿을 견줄 때 뜻이 선다.
 * - 한계 대비 소비량 → [[UsageGauge]]. 이 줄의 분모는 «한계» 가 아니라 «전체 사용량» 이다.
 * - 정렬·필터·페이지가 필요한 목록 → [[DataTable]] + [[Pagination]].
 *
 * ## Composition rules
 * - **막대 색은 항상 brand-blue 다.** 분모가 사용량 한계가 아니라 «플랜 전체 사용량» 이므로
 *   많이 썼다는 것이 곧 위험은 아니다. 여기에 warning · critical 을 쓰면 [[UsageGauge]] 의
 *   톤 어휘와 뜻이 갈린다.
 * - 이름은 줄어들고(`truncate`) 값은 줄어들지 않는다. 값이 밀려 잘리면 줄의 쓸모가 없다.
 * - 값은 숫자 폰트(`--font-family-numeric`)로 오른쪽에 선다 — 위아래 줄의 자릿수가 맞아야 견줄 수 있다.
 *
 * @example
 * ```tsx
 * {rows.map((r) => (
 *   <MemberUsageBar key={r.email} name={r.name} value={credits(r.used)} percent={r.used / total * 100} />
 * ))}
 * ```
 */
import UsageGauge from "./UsageGauge";

export type MemberUsageBarProps = {
  /** 사람 이름 · 계정. 좁아지면 줄어든다. */
  name: string;
  /** 그 사람이 쓴 양. 줄어들지 않는다. */
  value: string;
  /** 전체 사용량 대비 비율 0~100. */
  percent: number;
  className?: string;
};

export default function MemberUsageBar({ name, value, percent, className }: MemberUsageBarProps) {
  return (
    <div className={`flex flex-col gap-4px w-full ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-8px">
        <span className="truncate text-base text-secondary">{name}</span>
        <span
          className="shrink-0 text-base text-primary"
          style={{ fontFamily: "var(--font-family-numeric)" }}
        >
          {value}
        </span>
      </div>
      <UsageGauge label={`${name} 사용 비중`} percent={percent} tone="neutral" />
    </div>
  );
}
