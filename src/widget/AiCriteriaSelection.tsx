/**
 * AiCriteriaSelection — 분류/임계값 기준 선택 카드.
 *
 * ## Purpose
 * AI 가 제안한 분류 기준을 설명하고, 사용자가 그중 하나를 골라 다음 stage 로 진행하게 하는
 * 카드. Reasoning 헤딩 + 본문 + tone 별 기준 그룹(📊) + 참고 사항(📌) + 확인 질문 + 옵션 CTA
 * 로 구성됩니다. 옵션 클릭 시 선택지는 filled blue 로 강조, 나머지는 dim/disabled 되고
 * `selectionDelay` ms 후 `onSelect(key)` 가 호출됩니다.
 *
 * ## When to use
 * - AI 가 제시한 여러 기준(임계값·분류 정책 등) 중 사용자가 하나를 택해 흐름을 분기할 때.
 * - 선택지에 근거(reasoning)와 tone 별 기준 설명을 함께 보여줘야 할 때.
 * - 데모/시연에서 자동 선택 연출이 필요할 때 (`autoPick`).
 *
 * ## When NOT to use
 * - 단순 2지선다(예: 진행/취소) → [[AiChoiceButtons]] (primary/secondary 한 쌍).
 * - 선택 없이 정보만 제시하는 읽기 전용 제안 → [[AiDashboardProposal]] / [[AiAlertRulePreview]].
 *
 * ## Composition rules
 * - 이 카드는 `AiCard` chrome 없이 자체 흰 배경/보더/라운드 레이아웃 (선택 상태·tone 그룹 전용 구조).
 * - tone 색은 모듈 내 `TONE_BG` / `TONE_DOT` 맵(토큰 binding) 사용 — 인라인 hex 신규 추가 금지.
 * - 선택은 1회성 — `selectedKey` 가 정해지면 모든 옵션이 잠김(중복 선택 방지).
 *
 * @example
 * ```tsx
 * <AiCriteriaSelection
 *   body="제안을 3단계 심각도로 분류했습니다."
 *   groups={[
 *     { tone: "high", title: "즉시 조치", detail: "임계값 초과" },
 *     { tone: "mid", title: "관찰", detail: "경고 구간" },
 *   ]}
 *   options={[{ key: "strict", label: "엄격" }, { key: "default", label: "기본" }]}
 *   onSelect={(key) => goNext(key)}
 * />
 * ```
 */
import { useEffect, useState } from "react";
import CriteriaGroup from "./CriteriaGroup";
import CriteriaOptionButton from "./CriteriaOptionButton";
export type CriterionGroup = {
  /** 행 좌측 컬러/아이콘 토큰 ("low" 회색 · "mid" 노랑 · "high" 빨강 등) */
  tone: "low" | "mid" | "high" | "neutral";
  title: string;
  detail: string;
};

export type CriteriaOption = {
  key: string;
  label: string;
};

const TONE_BG: Record<CriterionGroup["tone"], string> = {
  low: "#e8f4ff",
  mid: "#fff7e0",
  high: "#ffe8e8",
  neutral: "var(--color-surface-100)",
};
const TONE_DOT: Record<CriterionGroup["tone"], string> = {
  low: "var(--color-brand-blue)",
  mid: "var(--color-indicator-warning)",
  high: "var(--color-indicator-critical)",
  neutral: "var(--color-text-tertiary)",
};

export default function AiCriteriaSelection({
  heading = "Reasoning",
  body,
  groups,
  notes,
  options,
  onSelect,
  delay = 0,
  selectionDelay = 450,
  autoPick,
}: {
  heading?: string;
  body: string;
  groups: CriterionGroup[];
  notes?: string[];
  options: CriteriaOption[];
  onSelect?: (key: string) => void;
  delay?: number;
  /** 클릭→onSelect 사이 시각적 강조 유지 시간(ms) */
  selectionDelay?: number;
  /** 데모 자동 클릭. `after` ms 시점에 `key` 옵션이 자동 클릭되며 그 직전 1.2s간 클릭 손 인디케이터 표시. */
  autoPick?: { key: string; after: number };
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pendingPick, setPendingPick] = useState<string | null>(null);
  const handleClick = (key: string) => {
    if (selectedKey) return;
    setPendingPick(null);
    setSelectedKey(key);
    setTimeout(() => onSelect?.(key), selectionDelay);
  };

  // autoPick: after - 1200ms에 손 인디케이터 등장 → after에 자동 클릭
  useEffect(() => {
    if (!autoPick) return;
    const showAt = Math.max(0, autoPick.after - 1200);
    const showId = setTimeout(() => setPendingPick(autoPick.key), showAt);
    const clickId = setTimeout(() => handleClick(autoPick.key), autoPick.after);
    return () => {
      clearTimeout(showId);
      clearTimeout(clickId);
    };
    // autoPick은 mount 시 1회만 적용 — props가 자주 바뀌지 않는 시나리오 가정.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="ai-anim-in flex flex-col gap-12px w-full bg-white border border-color-var-color-border-default rounded-8px p-12px"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        {heading}
      </span>

      <p
        className="text-md text-primary tracking-default leading-loose"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {body}
      </p>

      {/* 분류 기준 그룹 */}
      <div className="flex flex-col gap-6px">
        <div
          className="text-base font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          📊 제안 분류 기준
        </div>
        {groups.map((g, i) => (
          <CriteriaGroup
            key={i}
            title={g.title}
            detail={g.detail}
            background={TONE_BG[g.tone]}
            dotColor={TONE_DOT[g.tone]}
          />
        ))}
      </div>

      {/* 참고 사항 */}
      {notes && notes.length > 0 && (
        <div className="flex flex-col gap-4px">
          <div
            className="text-base font-bold text-primary tracking-default leading-normal"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            📌 참고 사항
          </div>
          <ul className="flex flex-col gap-2px pl-12px">
            {notes.map((n, i) => (
              <li
                key={i}
                className="text-base text-secondary tracking-default leading-normal list-disc list-outside"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p
        className="text-base text-secondary tracking-default leading-normal"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        이 기준으로 진행해도 될까요? 다른 임계값을 원하시면 알려주세요.
      </p>

      {/* CTA */}
      <div className="flex flex-wrap gap-6px">
        {options.map((o) => {
          const isSelected = selectedKey === o.key;
          const isDimmed = selectedKey !== null && !isSelected;
          const isPending = pendingPick === o.key && !selectedKey;
          return (
            <CriteriaOptionButton
              key={o.key}
              label={o.label}
              selected={isSelected}
              dimmed={isDimmed}
              pending={isPending}
              locked={selectedKey !== null}
              onClick={() => handleClick(o.key)}
            />
          );
        })}
      </div>
    </div>
  );
}

