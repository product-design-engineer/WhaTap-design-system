/**
 * AI 위젯 — 분류 기준 선택 카드.
 *
 * Reasoning 헤딩 + 본문 + 카테고리 그룹들(아이콘 + 라벨) + 참고 사항 + 4개 CTA.
 * 사용자가 기준을 선택하면 onSelect(key)가 호출되어 다음 stage로 진행.
 *
 * 클릭 효과: 선택한 옵션은 즉시 filled blue로 강조, 나머지는 dim & disabled,
 *   `selectionDelay` ms 후 onSelect 호출.
 * 자동 데모: `autoPick={{ key, after }}`가 주어지면 `after - 1200ms` 후 클릭 손
 *   인디케이터가 해당 옵션 위에 나타나 tap 애니메이션 → `after`에 자동 클릭.
 */
import { useEffect, useState } from "react";
import AiClickCursor from "./AiClickCursor";
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
  neutral: "#f1f2f4",
};
const TONE_DOT: Record<CriterionGroup["tone"], string> = {
  low: "#296CF2",
  mid: "#F0B400",
  high: "#E53935",
  neutral: "#757575",
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
      className="ai-anim-in flex flex-col gap-[12px] w-full bg-white border border-[#eaeaea] rounded-[8px] p-[12px]"
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
      <div className="flex flex-col gap-[6px]">
        <div
          className="text-base font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          📊 제안 분류 기준
        </div>
        {groups.map((g, i) => (
          <div
            key={i}
            className="flex items-start gap-[8px] rounded-[6px] px-[10px] py-[6px]"
            style={{ background: TONE_BG[g.tone] }}
          >
            <span
              className="size-[8px] rounded-full mt-[6px] shrink-0"
              style={{ background: TONE_DOT[g.tone] }}
            />
            <div className="flex flex-col gap-[2px] min-w-0">
              <span
                className="text-base font-bold text-primary tracking-default leading-normal"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                {g.title}
              </span>
              <span
                className="text-base text-secondary tracking-default leading-normal"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {g.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 참고 사항 */}
      {notes && notes.length > 0 && (
        <div className="flex flex-col gap-[4px]">
          <div
            className="text-base font-bold text-primary tracking-default leading-normal"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            📌 참고 사항
          </div>
          <ul className="flex flex-col gap-[2px] pl-[12px]">
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
      <div className="flex flex-wrap gap-[6px]">
        {options.map((o) => {
          const isSelected = selectedKey === o.key;
          const isDimmed = selectedKey !== null && !isSelected;
          const isPending = pendingPick === o.key && !selectedKey;
          return (
            <div key={o.key} className="relative">
              <button
                onClick={() => handleClick(o.key)}
                disabled={selectedKey !== null}
                className="flex items-center justify-center h-[32px] px-[12px] rounded-[6px] text-base tracking-default border cursor-pointer whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-family-korean)",
                  fontWeight: "var(--font-weight-medium)",
                  background: isSelected ? "#296CF2" : "#fff",
                  color: isSelected ? "#fff" : "#296CF2",
                  borderColor: isSelected ? "#296CF2" : "#296CF2",
                  opacity: isDimmed ? 0.4 : 1,
                  pointerEvents: selectedKey ? "none" : "auto",
                  transition: "background 180ms, color 180ms, opacity 180ms, transform 120ms",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                  boxShadow: isSelected ? "0 2px 8px rgba(41,108,242,0.25)" : "none",
                }}
              >
                {o.label}
              </button>
              {isPending && (
                <AiClickCursor style={{ right: -16, top: 10 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

