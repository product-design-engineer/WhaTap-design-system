/**
 * AiUnavailableNotice — WhaTap AI 를 사용할 수 없을 때 위젯 본문에 노출하는 안내 메시지.
 *
 * ## Purpose
 * 특정 사유(요금제 미포함 · 사용량 한도 초과 · 서비스 점검 · 데이터 수집 준비 · 권한 없음 ·
 * 리전 제한 · 일시적 오류)로 AI 대화를 시작할 수 없을 때, 위젯 본문 중앙에 원인·상태·다음
 * 행동을 한 화면으로 안내하는 blocking 상태 카드. 랜딩 인사말/시나리오 메시지를 대체합니다.
 *
 * ## When to use
 * - [[WhaTapAiWidget]] 의 `unavailable` prop 으로 전달 — 위젯은 열리지만 입력이 막힌 상태.
 * - AI 응답 자체가 불가능해 "무엇을 어떻게" 안내해야 할 때 (에러 토스트로는 부족한 상황).
 *
 * ## When NOT to use
 * - 일반 AI 분석 결과/경고 메시지 → [[AiInsightSection]] · [[AiCard]] + 톤 헤딩.
 * - 로딩/도구 실행 진행 → [[AiLoadingMessage]] · [[AiToolCallStep]].
 * - 입력은 가능한데 한 줄 힌트만 → placeholder / caption 텍스트.
 *
 * ## Composition rules
 * - `reason` preset 을 주면 제목/설명/액션 라벨이 자동 구성 — 개별 prop 으로 override 가능.
 * - 색은 `tokens.color.*` 만 사용, 인라인 hex 금지. 톤은 preset 의 `intent` 로 결정.
 * - 액션 버튼은 [[Button]] (variant="contained") 로 조립 — 여기서 새 버튼 마크업 만들지 말 것.
 * - 너비는 부모(`w-full`)에 맞추고 세로 가운데 정렬 — 위젯 본문 전체를 채웁니다.
 *
 * @example
 * ```tsx
 * // preset 사용
 * <AiUnavailableNotice reason="quota" onAction={openBilling} />
 *
 * // 커스텀 사용
 * <AiUnavailableNotice
 *   intent="warning"
 *   title="AI 사용이 일시 중단되었습니다"
 *   description={"조직 관리자가 WhaTap AI 를 비활성화했습니다."}
 *   actionLabel="관리자에게 문의"
 *   onAction={contactAdmin}
 * />
 * ```
 */
import type { ReactNode } from "react";
import Button from "../Button";
import { tokens, type SemanticIntent } from "./_tokens";

/** 사전 정의된 사용 불가 사유 키. */
export type AiUnavailableReason =
  | "plan"
  | "quota"
  | "maintenance"
  | "preparing"
  | "permission"
  | "region"
  | "error";

interface ReasonPreset {
  /** 안내 카드의 톤 — 아이콘 도트/헤딩 색을 결정. */
  intent: SemanticIntent;
  /** 좌상단 상태 아이콘 이모지. */
  icon: string;
  title: string;
  description: string;
  /** 기본 액션 버튼 라벨 (없으면 버튼 미노출). */
  actionLabel?: string;
}

/**
 * 사유별 기본 문구. 실제 서비스 카피에 맞춰 수정 가능하도록 단일 출처로 분리.
 */
export const AI_UNAVAILABLE_PRESETS: Record<AiUnavailableReason, ReasonPreset> = {
  plan: {
    intent: "info",
    icon: "🔒",
    title: "현재 요금제에서는 WhaTap AI 를 사용할 수 없습니다",
    description:
      "WhaTap AI 는 상위 요금제에서 제공되는 기능입니다. 요금제를 업그레이드하면 대시보드 분석과 이상 징후 진단을 AI 와 함께 진행할 수 있습니다.",
    actionLabel: "요금제 보기",
  },
  quota: {
    intent: "warning",
    icon: "📊",
    title: "이번 달 AI 사용량 한도를 모두 사용했습니다",
    description:
      "이번 결제 주기의 WhaTap AI 토큰 사용량 한도에 도달했습니다. 다음 주기에 자동으로 초기화되며, 한도를 늘리면 지금 바로 이어서 사용할 수 있습니다.",
    actionLabel: "사용량 한도 늘리기",
  },
  maintenance: {
    intent: "muted",
    icon: "🛠️",
    title: "WhaTap AI 서비스 점검 중입니다",
    description:
      "더 안정적인 서비스 제공을 위해 WhaTap AI 를 점검하고 있습니다. 점검이 끝나면 자동으로 다시 사용할 수 있으며, 대시보드의 다른 기능은 정상적으로 이용할 수 있습니다.",
  },
  preparing: {
    intent: "info",
    icon: "⏳",
    title: "분석할 데이터를 준비하고 있습니다",
    description:
      "이 프로젝트는 아직 AI 분석에 필요한 데이터가 충분히 수집되지 않았습니다. 에이전트 연결 후 데이터가 쌓이면 자동으로 AI 분석을 시작할 수 있습니다.",
    actionLabel: "에이전트 연결 확인",
  },
  permission: {
    intent: "warning",
    icon: "🚫",
    title: "WhaTap AI 사용 권한이 없습니다",
    description:
      "현재 계정에는 WhaTap AI 사용 권한이 부여되지 않았습니다. 조직 관리자에게 권한을 요청하면 이 프로젝트에서 AI 를 사용할 수 있습니다.",
    actionLabel: "관리자에게 요청",
  },
  region: {
    intent: "muted",
    icon: "🌐",
    title: "이 리전에서는 WhaTap AI 를 사용할 수 없습니다",
    description:
      "데이터 보호 정책에 따라 현재 프로젝트가 위치한 데이터 리전에서는 WhaTap AI 를 제공하지 않습니다. 지원되는 리전의 프로젝트에서는 정상적으로 사용할 수 있습니다.",
  },
  error: {
    intent: "critical",
    icon: "⚠️",
    title: "WhaTap AI 에 연결하지 못했습니다",
    description:
      "일시적인 오류로 AI 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 지원팀에 문의해 주세요.",
    actionLabel: "다시 시도",
  },
};

export interface AiUnavailableNoticeProps {
  /** 사전 정의된 사유. 지정하면 아래 개별 prop 의 기본값이 채워집니다. */
  reason?: AiUnavailableReason;
  /** 톤 override — 아이콘 도트/헤딩 색. */
  intent?: SemanticIntent;
  /** 상태 아이콘 이모지 override. */
  icon?: ReactNode;
  /** 제목 override. */
  title?: string;
  /** 설명 본문 override. */
  description?: string;
  /** 액션 버튼 라벨 override. 빈 문자열이면 버튼 숨김. */
  actionLabel?: string;
  /** 액션 버튼 클릭 핸들러. `actionLabel` 이 있어도 핸들러가 없으면 버튼은 렌더되지 않습니다. */
  onAction?: () => void;
}

export default function AiUnavailableNotice({
  reason,
  intent,
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: AiUnavailableNoticeProps) {
  const preset = reason ? AI_UNAVAILABLE_PRESETS[reason] : undefined;
  const tone: SemanticIntent = intent ?? preset?.intent ?? "muted";
  const resolvedIcon = icon ?? preset?.icon ?? "ℹ️";
  const resolvedTitle = title ?? preset?.title ?? "WhaTap AI 를 사용할 수 없습니다";
  const resolvedDescription = description ?? preset?.description ?? "";
  const resolvedActionLabel = actionLabel ?? preset?.actionLabel;
  const showAction = Boolean(resolvedActionLabel) && Boolean(onAction);

  const indicator = tokens.color.indicator[tone].cssVar!;
  const koFont = tokens.font.family.korean.value;

  return (
    <div className="ai-anim-in flex flex-1 flex-col items-center justify-center gap-16px w-full py-24px">
      {/* 상태 아이콘 — 이모지 (배경 없음) */}
      <span className="text-4xl leading-none shrink-0" style={{ lineHeight: 1 }}>
        {resolvedIcon}
      </span>

      {/* 제목 + 설명 */}
      <div className="flex flex-col items-center gap-8px w-full">
        <div className="flex items-center gap-6px">
          <span className="size-8px rounded-full shrink-0" style={{ background: indicator }} />
          <p
            className="text-lg font-bold text-primary tracking-default leading-normal text-center"
            style={{ fontFamily: koFont }}
          >
            {resolvedTitle}
          </p>
        </div>
        {resolvedDescription && (
          <p
            className="text-md text-secondary tracking-default leading-loose text-center whitespace-pre-wrap px-8px"
            style={{ fontFamily: koFont, fontWeight: "var(--font-weight-regular)" }}
          >
            {resolvedDescription}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      {showAction && (
        <Button variant="contained" tone="primary" size="md" onClick={onAction}>
          {resolvedActionLabel}
        </Button>
      )}
    </div>
  );
}
