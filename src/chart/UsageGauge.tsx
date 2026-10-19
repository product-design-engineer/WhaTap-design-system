/**
 * UsageGauge — 남은 여유를 한 줄 막대로 말하는 게이지. Primitives layer.
 *
 * ## Purpose
 * 「한계 대비 얼마나 썼는가」 를 6px 막대 하나로 그린다. 트랙이 전체, 채운 만큼이 쓴 양이다.
 *
 * 같은 막대가 목록 · 상세 · 사용량 세 화면에 인라인으로 세 번 따로 그려져 있었다. 트랙 색과
 * 높이가 조금씩 달랐고, 그중 하나는 `--color-bg-tertiary` 라는 없는 토큰을 참조해 트랙이
 * 아예 보이지 않았다. 값 하나를 세 곳이 같은 모양으로 말해야 한다.
 *
 * ## When to use
 * - 분모가 분명한 소비량 — 사용량 한계 대비 청구 대상 사용량, 좌석 정원 대비 사용 좌석.
 * - 숫자와 «함께» 선다. 막대만으로는 얼마나 남았는지 못 읽는다.
 *
 * ## When NOT to use
 * - **분모가 없을 때.** 한계가 없는 plan 은 그리지 않는다 — 채움 비율이 뜻을 갖지 못한다.
 *   그 사실을 문장으로 적는 편이 낫다.
 * - 시간에 따른 변화 → [[MiniLineChart]]. 막대는 «지금 한 시점» 이다.
 * - 진행 중인 작업의 완료도 → [[DashboardBuildingProgress]]. 이건 소비량이지 진행도가 아니다.
 *
 * ## Composition rules
 * - **톤은 호출부가 정한다.** 「남은 여유 20% 이하면 warning」 같은 기준은 제품 규칙이지
 *   디자인 시스템의 것이 아니다(과금 화면은 `_plans.ts` 의 `limitTone` 이 정한다).
 *   DS 는 받은 톤을 색으로만 옮긴다.
 * - 트랙은 `--color-surface-100` — tokens.css 가 「트랙(progress/skeleton)」 용으로 정의한 값이다.
 * - 높이 6px · 양끝 라운드. 막대 위아래에 여백을 두는 것은 담는 쪽 몫이다.
 * - `label` 은 필수 — 스크린리더가 «무엇의» 진행 막대인지 읽는 이름이다(«청구 사용량»).
 * - `percent` 는 0~100 으로 잘라 쓴다. 넘겨받은 값이 범위를 벗어나도 막대가 트랙을 넘지 않는다.
 *
 * @example
 * ```tsx
 * <UsageGauge label="청구 사용량" percent={(total - remaining) / total * 100} tone={limitTone(remaining, total)} />
 * ```
 */
export type UsageGaugeTone = "neutral" | "warning" | "critical";

/** 톤별 막대 색. [[Chip]] 과 같은 톤 어휘를 쓰되 막대 색은 여기서 정한다. */
const BAR: Record<UsageGaugeTone, string> = {
  neutral: "var(--color-brand-blue)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
};

export type UsageGaugeProps = {
  /** 채움 비율 0~100. 범위를 벗어난 값은 잘라 쓴다. */
  percent: number;
  /** 스크린리더 이름 — 무엇을 잰 막대인지. 화면에 보이는 라벨과 같은 말을 쓴다. */
  label: string;
  /** 성격. 기준(몇 %부터 warning 인지)은 호출부가 정한다. */
  tone?: UsageGaugeTone;
  /** 트랙(바깥 막대) 요소에 붙는 클래스 — 배치(여백 · 폭)용. 색 · 크기 override 금지. */
  className?: string;
};

export default function UsageGauge({ label, percent, tone = "neutral", className }: UsageGaugeProps) {
  const w = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(w)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full rounded-full overflow-hidden ${className ?? ""}`}
      style={{ height: 6, background: "var(--color-surface-100)" }}
    >
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: BAR[tone] }} />
    </div>
  );
}
