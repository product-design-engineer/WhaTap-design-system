/**
 * DashboardBuildingProgress — 대시보드 구성/적용 중 노출되는 공용 로딩 화면.
 *
 * 사용처:
 *   - /db 의 "네, 적용하고 트렌드 보기" 클릭 후 RAC 대시보드 구성 (5s · 5 steps · 카드 chrome)
 *   - /flex-board 의 진입 직후 위젯 grid 구성 전 (3.2s · 4 steps · 카드 chrome 없음)
 *
 * 구조:
 *   gradient ring spinner + title + subtitle + 단계별 ✓ progress 리스트.
 *   `card` prop 으로 흰색 카드 chrome (DB 스타일) 토글, `intervalMs` 로 단계당 진행 속도 조정.
 *
 * 정책: feedback-common-components-catalog (chrome-level 공용 컴포넌트).
 */
import { useEffect, useState } from "react";

export type DashboardBuildingProgressProps = {
  /** 단계별 라벨. 길이 만큼 progress 가 진행. */
  steps: string[];
  /** 메인 제목 (굵게). */
  title: string;
  /** 보조 한 줄 (회색). */
  subtitle?: string;
  /** 단계별 ✓ 전환 간격 (ms). 전체 시간 = steps.length × intervalMs. */
  intervalMs?: number;
  /** true → 흰색 카드 chrome (border + radius). false → 콘텐츠만 (배경 그대로). */
  card?: boolean;
  /** 외곽 컨테이너 추가 className. */
  className?: string;
  /** 카드 / 컨테이너 배경색. card=false 일 때 부모 배경 그대로 두려면 미지정. */
  background?: string;
};

export default function DashboardBuildingProgress({
  steps,
  title,
  subtitle = "잠시만 기다려 주세요",
  intervalMs = 380,
  card = false,
  className = "",
  background,
}: DashboardBuildingProgressProps) {
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStepIdx((i) => Math.min(i + 1, steps.length)),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [steps.length, intervalMs]);

  const cardStyles = card
    ? { background: background ?? "#fff", border: "1px solid #eaeaea", borderRadius: 6 }
    : background
      ? { background }
      : {};

  return (
    <div
      className={`flex flex-col items-center justify-center gap-[16px] py-[60px] px-[40px] ${
        card ? "" : "flex-1 overflow-hidden"
      } ${className}`}
      style={cardStyles}
    >
      {/* gradient ring spinner */}
      <div
        className="size-[36px] rounded-full"
        style={{
          background: "conic-gradient(from 90deg, #004BE0, #8B52FF, #004BE0)",
          mask: "radial-gradient(circle 15px at center, transparent 98%, #000 100%)",
          WebkitMask: "radial-gradient(circle 15px at center, transparent 98%, #000 100%)",
          animation: "aiSymbolRotateSlow 1s linear infinite",
        }}
      />
      {/* title + subtitle */}
      <div className="flex flex-col gap-[6px] items-center">
        <p
          className="text-lg font-bold text-primary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </p>
        <p
          className="text-base text-tertiary tracking-default"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {subtitle}
        </p>
      </div>
      {/* step list */}
      <ul className="flex flex-col gap-[5px] mt-[4px]">
        {steps.map((s, i) => (
          <li
            key={s}
            className="flex items-center gap-[8px] text-base"
            style={{
              fontFamily: "var(--font-family-korean)",
              color: i < stepIdx ? "#4c4c4c" : "#adadad",
              opacity: i <= stepIdx ? 1 : 0.5,
              transition: "opacity 200ms, color 200ms",
            }}
          >
            {i < stepIdx ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" fill="#00B442" />
                <path
                  d="M4 7l2 2 4-4"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : i === stepIdx ? (
              <span
                className="size-[12px] rounded-full border-[1.5px] border-[#296CF2] border-t-transparent"
                style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
              />
            ) : (
              <span className="size-[12px] rounded-full border border-[#d3d3d3]" />
            )}
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
