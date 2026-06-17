import { ReactNode } from "react";

/**
 * Stage — 프로토타입 페이지를 감싸는 16:9 무대(stage) 래퍼.
 *
 * ## Purpose
 * 어두운 배경 위에 콘텐츠를 가운데 정렬하고, 최대 1280px·16:9 비율의 흰색 무대를
 * 그려 모든 프로토타입 페이지가 동일한 캔버스에서 보이도록 한다. 우상단에 옵션 `badge` 표시.
 *
 * ## When to use
 * - 시나리오/프로토타입 페이지의 최상위 래퍼 (한 화면 = 한 Stage)
 * - 발표·캡처용 고정 16:9 프레임이 필요할 때
 *
 * ## When NOT to use
 * - 실제 제품의 풀-블리드(full-bleed) 반응형 레이아웃 → [[DashboardLayout]]
 * - 페이지 내부 chrome (헤더/사이드바) → [[PageHeader]] / [[Sidebar]]
 * - 모달·toast 같은 오버레이 → [[Modal]] / [[Toast]]
 *
 * ## Composition rules
 * - 한 페이지에 하나만, 최상위에 배치. `children` 이 무대 안에 `overflow-hidden` 으로 클립됨.
 * - 무대는 `aspectRatio: "16 / 9"`, `max-w-1280px` 고정 — 내부는 이 비율 기준으로 구성.
 * - `badge` 는 fixed 우상단 라벨(시나리오 이름 등), 미지정 시 생략.
 *
 * @example
 * ```tsx
 * <Stage badge="DB · RAC">
 *   <DashboardLayout>…</DashboardLayout>
 * </Stage>
 * ```
 */
export default function Stage({
  badge,
  children,
}: {
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0a0a14" }}>
      {badge && (
        <div className="fixed top-4 right-4 z-1000 px-3_5 py-2 rounded-full text-sm font-semibold tracking-wider border border-white-10 text-white" style={{ background: "rgba(26, 26, 46, 0.85)" }}>
          {badge}
        </div>
      )}
      <div
        className="w-full max-w-1280px bg-cf5f6f8 rounded-lg overflow-hidden relative shadow-0_20px_60px_rgba-0-0-0-0_45"
        style={{ aspectRatio: "16 / 9" }}
      >
        {children}
      </div>
    </div>
  );
}
