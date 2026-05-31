/**
 * WhaTapAiContext — 라우트 간 WhaTap AI 위젯 상태 + 대화 문맥 공유.
 *
 * 단일 페이지 안에서는 위젯이 닫혀도 다음에 열 때 컨텍스트가 살아 있고,
 * 라우트가 바뀌어도 (예: /project-list → /flex-board) 같은 conversation
 * 으로 이어집니다.
 *
 * 정책: feedback-common-components-catalog — chrome/위젯 상태는 공용.
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
