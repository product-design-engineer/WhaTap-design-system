import { useEffect, useId, useState } from "react";

/**
 * AiStageMotion — AI 연산 단계(수집 · 분석 · 작성)를 진행률로 그리는 32px 애니메이션.
 *
 * ## Purpose
 * 10초 넘게 걸리는 AI 연산에서 «지금 무슨 일을 하는 중인가» 를 단계 성격에 맞는 그림으로 보인다.
 * 반복 재생 루프가 아니라 **`progress`(0~1) 를 받아 그린다.** 그림이 실제 진행과 함께 움직이므로
 * 진행이 멈추면 그림도 멈춘다. 세 종류다.
 * - `collect` 데이터 수집: 바깥 점 12개가 가운데로 모인다. 모인 점 수 = 수집이 끝난 비율
 * - `analyze` 데이터 분석: 선 그래프 위를 스캔 선이 지나간다. `marker` 를 넘으면 이상 구간 점이 경고 색으로 남는다
 * - `write` 분석 정보 작성: 문서 위에 줄이 한 줄씩 그어진다. 그어진 줄 = 작성이 끝난 항목 비율
 *
 * ## When to use
 * - [[AiProgress]] 머리의 32px 자리 (기본 용법. AiProgress 가 단계에 맞춰 자동으로 고른다).
 * - 진행 카드 없이 단계 그림만 크게 보여 주는 설명 화면(카탈로그 · 기획 문서). `size` 로 키운다.
 *
 * ## When NOT to use
 * - 2초 안에 끝나는 짧은 대기 → [[LoadingMessage]] (한 줄 안내).
 * - AI 가 «생각 중» 이라는 브랜드 표시 → [[AiSymbol]].
 * - 분모(처리할 전체 양)를 모르는 대기. 진행률을 지어내면 95% 에서 멈춘 그림이 된다. 이때는 [[LoadingMessage]].
 * - 완료 순간의 답변 등장(④ 정보 표현) → 답변을 `.wds-ai-reveal` 로 감싼다. 이 컴포넌트에는 완료 그림이 없다.
 *
 * ## Composition rules
 * - 한 화면에서 움직이는 곳은 하나다. 진행 카드에 이 그림을 하나만 둔다(단계 목록 · 막대는 멈춰 있다).
 * - `progress` 는 서버가 보낸 처리 수의 비율(처리 수 ÷ 전체)이다. 시간으로 계산한 가짜 비율을 넣지 않는다.
 * - 색은 토큰만: 진행 `--color-brand-blue` · 남은 것 `--color-text-disabled` · 이상 구간 `--color-status-warning`.
 * - `prefers-reduced-motion` 이면 자동으로 멈춘다(점 이동 · 맥박 · 커서 깜빡임 없음, 진행 상태만 그린다).
 *   `still` 로 직접 멈출 수도 있다(중단된 작업 등).
 * - 장식 그림이다(`aria-hidden`). 진행을 말하는 글자는 [[AiProgress]] 제목 · [[AiProgressStep]] 처리 수가 맡는다.
 *
 * @example
 * ```tsx
 * <AiStageMotion stage="analyze" progress={done / total} marker={0.3} />
 * ```
 */
export type AiStage = "collect" | "analyze" | "write";

export type AiStageMotionProps = {
  /** 단계 종류. 수집 · 분석 · 작성. */
  stage: AiStage;
  /** 0~1. 이 단계에서 처리가 끝난 비율(처리 수 ÷ 전체). */
  progress: number;
  /** 한 변 크기(px). 기본 32 — 진행 카드 머리 자리. 설명 화면에서는 96. */
  size?: number;
  /** true 면 시간에 따른 움직임(이동 · 맥박 · 깜빡임)을 끈다. 미지정이면 `prefers-reduced-motion` 을 따른다. */
  still?: boolean;
  /** `analyze` 전용. 이 진행률을 넘으면 이상 구간 점을 경고 색으로 남긴다(중간 발견과 같은 시점). */
  marker?: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const f2 = (n: number) => Number(n.toFixed(2));

/** `prefers-reduced-motion: reduce` 구독. */
function useReducedMotion() {
  const [rm, setRm] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setRm(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return rm;
}

/** 움직일 때만 도는 초 단위 시계. 멈춰 있으면 0 에 머문다. */
function useClock(running: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    let id = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running]);
  return t;
}

/* ── ① 데이터 수집 ─────────────────────────────────────────────────── */
function Collect({ frac, time, still }: { frac: number; time: number; still: boolean }) {
  const n = 12;
  const got = frac * n;
  const dots = Array.from({ length: n }, (_, k) => {
    const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
    const R = 13;
    const r0 = 3.4;
    let rad = R;
    let fill = "var(--color-text-disabled)";
    let r = 1.3;
    let op = 1;
    if (k < Math.floor(got)) {
      rad = r0;
      fill = "var(--color-brand-blue)";
    } else if (k === Math.floor(got) && frac < 1) {
      const p = still ? 0 : ease(got - k);
      rad = R + (r0 - R) * p;
      fill = "var(--color-brand-blue)";
      r = 1.5;
    } else {
      op = still ? 0.8 : 0.55 + 0.35 * Math.sin(time * 3 + k);
    }
    return <circle key={k} cx={f2(16 + Math.cos(ang) * rad)} cy={f2(16 + Math.sin(ang) * rad)} r={r} fill={fill} opacity={f2(op)} />;
  });
  return (
    <>
      <circle cx="16" cy="16" r="5.2" fill="none" stroke="var(--color-brand-blue)" strokeOpacity=".25" strokeWidth="1" />
      {dots}
    </>
  );
}

/* ── ② 데이터 분석 ─────────────────────────────────────────────────── */
const PTS: [number, number][] = [
  [3, 22], [5.4, 21], [7.8, 22.5], [10.2, 20.5], [12.6, 21.5], [15, 20],
  [17.4, 9], [19.8, 11], [22.2, 19], [24.6, 20.5], [27, 19.5], [29, 21],
];
const POLY = PTS.map((p) => p.join(",")).join(" ");
function yAt(x: number) {
  for (let i = 0; i < PTS.length - 1; i++) {
    const [ax, ay] = PTS[i];
    const [bx, by] = PTS[i + 1];
    if (x >= ax && x <= bx) return ay + (by - ay) * ((x - ax) / (bx - ax));
  }
  return PTS[PTS.length - 1][1];
}
function Analyze({ frac, time, still, marker, clipId }: { frac: number; time: number; still: boolean; marker?: number; clipId: string }) {
  const x = 3 + 26 * frac;
  const pr = still ? 2 : 1.8 + 0.8 * (0.5 + 0.5 * Math.sin(time * 6));
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={f2(x)} height="32" />
        </clipPath>
      </defs>
      <line x1="3" y1="27" x2="29" y2="27" stroke="var(--color-border-divider)" strokeWidth="1" />
      <polyline points={POLY} fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={POLY} fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`} />
      {frac < 1 && (
        <>
          <line x1={f2(x)} y1="4" x2={f2(x)} y2="27" stroke="var(--color-brand-blue)" strokeWidth="1" strokeOpacity=".55" />
          <circle cx={f2(x)} cy={f2(yAt(x))} r={f2(pr)} fill="var(--color-brand-blue)" />
        </>
      )}
      {marker != null && frac >= marker && (
        <>
          <circle cx="17.4" cy="9" r="3.4" fill="var(--color-status-warning)" fillOpacity=".22" />
          <circle cx="17.4" cy="9" r="1.9" fill="var(--color-status-warning)" />
        </>
      )}
    </>
  );
}

/* ── ③ 분석 정보 작성 ──────────────────────────────────────────────── */
const ROWS: [number, number][] = [[10.5, 12], [15, 12], [19.5, 12], [24, 7.5]];
function Write({ frac, time, still }: { frac: number; time: number; still: boolean }) {
  let cx = 10;
  let cy = 10.5;
  const lines = ROWS.map(([y, w], i) => {
    const p = clamp(frac * 4 - i, 0, 1);
    if (p > 0 && p < 1) {
      cx = 10 + w * p + 1.2;
      cy = y;
    }
    if (p >= 1 && i < ROWS.length - 1) {
      cx = 10;
      cy = ROWS[i + 1][0];
    }
    return (
      <g key={i}>
        <line x1="10" y1={y} x2={10 + w} y2={y} stroke="var(--color-surface-100)" strokeWidth="1.6" strokeLinecap="round" />
        {p > 0 && <line x1="10" y1={y} x2={f2(10 + w * p)} y2={y} stroke="var(--color-brand-blue)" strokeWidth="1.6" strokeLinecap="round" />}
      </g>
    );
  });
  const blink = still ? 1 : Math.floor(time * 2.2) % 2 ? 0.15 : 1;
  return (
    <>
      <rect x="7" y="3.5" width="18" height="25" rx="2.5" fill="var(--color-card)" stroke="var(--color-border-divider)" strokeWidth="1" />
      {lines}
      {frac < 1 && <line x1={f2(cx)} y1={f2(cy - 2.2)} x2={f2(cx)} y2={f2(cy + 2.2)} stroke="var(--color-text-primary)" strokeWidth="1" opacity={blink} />}
    </>
  );
}

export default function AiStageMotion({ stage, progress, size = 32, still, marker }: AiStageMotionProps) {
  const reduced = useReducedMotion();
  const isStill = still ?? reduced;
  const time = useClock(!isStill);
  const frac = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  const clipId = `wds-ai-stage-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className="wds-ai-stage-motion"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      data-stage={stage}
      style={{ display: "block", flex: "none" }}
    >
      {stage === "collect" && <Collect frac={frac} time={time} still={isStill} />}
      {stage === "analyze" && <Analyze frac={frac} time={time} still={isStill} marker={marker} clipId={clipId} />}
      {stage === "write" && <Write frac={frac} time={time} still={isStill} />}
    </svg>
  );
}
