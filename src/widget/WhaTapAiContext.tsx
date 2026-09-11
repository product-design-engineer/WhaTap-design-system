/**
 * WhaTapAiContext — State layer. 라우트 간 WhaTap AI 위젯 상태 + 대화 문맥 공유 컨텍스트.
 *
 * ## Purpose
 * WhaTap AI 위젯의 열림/닫힘(`aiActive`)과 마지막 사용자 prompt(`lastPrompt`)를
 * 앱 전역에서 공유. 위젯이 닫혀도 다음에 열 때 컨텍스트가 살아 있고, 라우트가
 * 바뀌어도(예: /project-list → /flex-board) 같은 conversation 으로 이어짐.
 * `WhaTapAiProvider`(Provider) + `useWhaTapAi`(consumer hook) 한 쌍으로 제공.
 *
 * ## When to use
 * - 여러 라우트에 걸쳐 [[WhaTapAiWidget]] 의 개폐 상태/대화 연속성을 유지해야 할 때.
 * - [[PageHeader]] 의 AI 토글과 [[DashboardLayout]] 의 `widgetOpen` 을 한 source 로 묶을 때.
 *
 * ## When NOT to use
 * - 한 화면 안에서만 쓰는 일시적 토글 → 로컬 `useState` 로 충분, 컨텍스트 불필요.
 * - 위젯의 시각적 셸 자체 → [[WhaTapAiWidget]] / [[DashboardLayout]].
 *
 * ## Composition rules
 * - 트리 최상단을 `WhaTapAiProvider` 로 감싸고, 하위는 `useWhaTapAi()` 로 소비
 *   (Provider 밖 호출 시 throw).
 * - `lastPrompt` 는 라우트 전이 시 chat 연속용 — 새 페이지에서 소비 후 `setLastPrompt(null)` 로 clear.
 * - 정책(feedback-common-components-catalog): chrome/위젯 상태는 공용 — 화면마다 재선언 금지.
 *
 * @covers WhaTapAiProvider
 *
 * @example
 * ```tsx
 * <WhaTapAiProvider>
 *   <App />
 * </WhaTapAiProvider>
 *
 * // 하위 컴포넌트
 * const { aiActive, setAiActive, lastPrompt, setLastPrompt } = useWhaTapAi();
 * <PageHeader title="..." aiActive={aiActive} onAiToggle={() => setAiActive(!aiActive)} />
 * ```
 */
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/** 이전 페이지에서 사용자가 입력한 마지막 prompt — 새 페이지에서 chat continuation
 *  에 사용 (사용자 bubble 로 노출). */
export type LastPrompt = {
  /** 입력 텍스트 (예: "네") */
  text: string;
  /** 어떤 라우트에서 입력됐는지 (debug/analytics 목적) */
  fromRoute: string;
};

type Ctx = {
  /** 위젯 열림/닫힘 상태 — 라우트 간 유지 */
  aiActive: boolean;
  setAiActive: (v: boolean) => void;
  /** 마지막으로 사용자가 입력한 prompt (라우트 전이 시 chat 연속용). 소비 후 clear. */
  lastPrompt: LastPrompt | null;
  setLastPrompt: (p: LastPrompt | null) => void;
};

const WhaTapAiContext = createContext<Ctx | null>(null);

export function WhaTapAiProvider({ children }: { children: ReactNode }) {
  const [aiActive, setAiActive] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<LastPrompt | null>(null);
  const value = useMemo<Ctx>(
    () => ({ aiActive, setAiActive, lastPrompt, setLastPrompt }),
    [aiActive, lastPrompt],
  );
  return (
    <WhaTapAiContext.Provider value={value}>{children}</WhaTapAiContext.Provider>
  );
}

export function useWhaTapAi(): Ctx {
  const ctx = useContext(WhaTapAiContext);
  if (!ctx) {
    throw new Error("useWhaTapAi must be used within WhaTapAiProvider");
  }
  return ctx;
}
