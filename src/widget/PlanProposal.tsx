import PlanProposalRowComponent from "./PlanProposalRow";

/**
 * PlanProposal — AI 가 내놓는 실행 계획 제안 카드(요약 → 비교 표 → 합계 → 우선순위 액션).
 *
 * ## Purpose
 * AI 가 «이렇게 바꾸자» 를 제안할 때, 근거 요약과 항목별 구성 · 비용 비교, 합계, 실행 순서를 한
 * 카드에 읽기 전용으로 묶는다. 섹션 제목 + 요약 불릿 + 3열 비교 표 + 합계 띠 + 번호 매긴 우선순위
 * 액션으로 구성되며, 모든 영역은 옵션이라 데이터가 있는 블록만 렌더된다.
 *
 * 2026-10-19 `MigPlan`(«MIG 통합 기획») 에서 이름을 바꿨다. 처음엔 GPU MIG 분할 제안 한 화면용이었지만
 * 구조는 어떤 계획 제안에도 맞고, 이름이 GPU 전용이라 다른 자리에서 같은 카드를 다시 짜게 만들었다.
 * 표 머리도 `columns` 로 받는다(전에는 «구성 / 분할/Pod / 월 환산» 고정).
 *
 * ## When to use
 * - 자원 재배치 · 비용 절감 · 구성 변경처럼 **항목별 비교 + 합계 + 실행 단계** 로 제안할 때
 *   (GPU MIG 분할, 인스턴스 다운사이징, 보존 기간 조정 등).
 * - 비교 표에서 추천 행을 강조(`highlight`)하고 실행 순서를 함께 안내할 때.
 *
 * ## When NOT to use
 * - 제안을 **적용**하는 액션 → 이 카드는 읽기 전용 제안이다. 승인 · 적용 CTA 는 [[ChoiceButtons]] 로.
 * - 대시보드 · 위젯 구성 제안 → [[DashboardProposal]].
 * - 일반 키-값 요약 표 → [[AlertRulePreview]].
 * - 열이 셋이 아니거나 정렬 · 페이지가 필요한 표 → [[DataTable]].
 *
 * ## Composition rules
 * - 이 카드는 `AiCard` chrome 없이 자체 `flex-col` 레이아웃이다(표 · 합계 띠 등 전용 구조).
 * - 비교 표 행은 [[PlanProposalRow]] — 머리 열 수(`columns`)와 행 열 수는 3 으로 맞춘다.
 * - 색은 토큰만(`--color-brand-blue` · `--color-indicator-critical` · `--color-whatap-blue` ·
 *   `--gradient-ai-tint`). 인라인 hex 금지.
 * - 액션 버튼을 내부에 넣지 말 것 — 승인/적용 CTA 는 [[ChoiceButtons]] 로 분리.
 * - 제목은 제안의 내용을 말한다(예: «GPU 분할 제안 — A100 활용 전략»). 기본값 «실행 계획 제안» 을
 *   그대로 두지 않는다.
 *
 * @example
 * ```tsx
 * <PlanProposal
 *   heading="GPU 분할 제안 — A100 활용 전략"
 *   bullets={["A100 한 장을 4개 인스턴스로 분할"]}
 *   columns={["워크로드", "분할 구성", "월 비용"]}
 *   rows={[{ label: "Inference", detail: "MIG (3g.40gb × 1)", value: "₩520,125", highlight: true }]}
 *   total="₩1,580,000"
 *   totalNote="/월"
 *   actions={[{ step: 1, body: "테스트 환경에 MIG 구성 적용 (1주)" }]}
 * />
 * ```
 */
export type PlanProposalItem = {
  /** 항목 이름 — 첫 열. */
  label: string;
  /** 구성 설명 — 둘째 열. */
  detail?: string;
  /** 수치 — 셋째 열(숫자 글꼴 · 오른쪽 정렬). */
  value?: string;
  /** 추천 행 강조. */
  highlight?: boolean;
  /** @deprecated `detail` 을 쓴다. */
  config?: string;
  /** @deprecated `value` 를 쓴다. */
  monthly?: string;
};

export type PlanProposalStep = {
  /** 순서 번호(목록 key). 표시 번호는 목록 순서를 따른다. */
  step: number;
  /** 실행할 일 한 문장. */
  body: string;
};

export default function PlanProposal({
  /** 카드 제목 — 제안의 내용을 말한다. 기본값을 그대로 두지 말 것. */
  heading = "실행 계획 제안",
  /** 제목 아래 요약 불릿(근거 · 기대 효과). */
  bullets,
  /** 비교 표 머리 3열. */
  columns = ["항목", "구성", "비용"],
  /** 비교 표 행 — [[PlanProposalRow]] 로 그린다. */
  rows,
  /** 합계 띠의 왼쪽 라벨. */
  totalLabel = "합계",
  /** 합계 수치(숫자 글꼴). 없으면 합계 띠를 그리지 않는다. */
  total,
  /** 합계 수치 옆 보조 문구(예: "/월" · "기존 대비 81% 절감"). */
  totalNote,
  /** 우선순위 액션 목록의 제목. */
  actionsHeading = "우선순위 액션",
  /** 실행 순서 — 번호 매긴 목록. */
  actions,
  /** 등장 애니메이션 지연(ms) — 여러 카드를 stagger 로 깔 때. */
  delay = 0,
}: {
  heading?: string;
  bullets?: string[];
  columns?: [string, string, string];
  rows?: PlanProposalItem[];
  totalLabel?: string;
  total?: string;
  totalNote?: string;
  actionsHeading?: string;
  actions?: PlanProposalStep[];
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-10px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-6px">
        <span className="size-10px rounded-full" style={{ background: "var(--color-brand-blue)" }} />
        <span
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {heading}
        </span>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-3px pl-12px">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="text-base text-secondary tracking-default leading-relaxed list-disc list-outside"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      {rows && rows.length > 0 && (
        <div className="rounded-6px overflow-hidden border border-color-var-color-border-default">
          <div
            className="grid items-center px-8px py-6px bg-color-var-color-surface-50 gap-4px"
            style={{ gridTemplateColumns: "1.4fr 1.4fr 1fr" }}
          >
            {columns.map((h) => (
              <span
                key={h}
                className="text-sm font-bold text-secondary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                {h}
              </span>
            ))}
          </div>
          {rows.map((r, i) => (
            <PlanProposalRowComponent key={i} {...r} />
          ))}
        </div>
      )}

      {total && (
        <div
          className="flex items-center justify-between rounded-6px px-10px py-8px"
          style={{
            background:
              "var(--gradient-ai-tint)",
            border: "1px solid var(--color-brand-blue-border-tint)",
          }}
        >
          <span
            className="text-base font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-korean)", color: "var(--color-whatap-blue)" }}
          >
            {totalLabel}
          </span>
          <span
            className="text-md font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-numeric)", color: "var(--color-whatap-blue)" }}
          >
            {total}
            {totalNote && <span className="ml-4px text-sm opacity-80">{totalNote}</span>}
          </span>
        </div>
      )}

      {actions && actions.length > 0 && (
        <>
          <div className="flex items-center gap-6px mt-4px">
            <span className="size-10px rounded-full" style={{ background: "var(--color-indicator-critical)" }} />
            <span
              className="text-md font-bold text-primary tracking-default leading-normal"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {actionsHeading}
            </span>
          </div>
          <ol className="flex flex-col gap-4px pl-18px">
            {actions.map((a) => (
              <li
                key={a.step}
                className="text-base text-primary tracking-default leading-relaxed list-decimal list-outside"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {a.body}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
