import { useEffect, useId, useState } from "react";

/**
 * AiStageMotion — AI 연산 단계(수집 · 분석 · 작성)를 진행률로 그리는 32px 애니메이션.
 *
 * ## Purpose
 * 10초 넘게 걸리는 AI 연산에서 «지금 무슨 일을 하는 중인가» 를 단계 성격에 맞는 그림으로 보인다.
 * 반복 재생 루프가 아니라 **`progress`(0~1) 를 받아 그린다.** 그림이 실제 진행과 함께 움직이므로
 * 진행이 멈추면 그림도 멈춘다. 세 종류다.
 * - `collect` 데이터 수집: 바깥 점 8개가 가운데 도착점으로 모인다. 모인 점 수 = 수집이 끝난 비율
 * - `analyze` 데이터 분석: 꺾은선 하나가 왼쪽부터 파랑으로 바뀐다. `marker` 를 넘으면 봉우리에 이상 점이 경고 색으로 남는다
 * - `write` 분석 정보 작성: 줄 셋이 한 줄씩 그어진다. 그어진 줄 = 작성이 끝난 항목 비율
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
 * - 모양은 단순하게: 색은 회색(남은 것 `--color-text-disabled`) · 파랑(진행 `--color-brand-blue`) 둘이고, 경고색(`--color-status-warning`)은 분석의 이상 점 하나에만. 선 굵기는 1.5 하나. 16px 로 줄여도 읽혀야 한다. 요소를 더하지 않는다(테두리 · 바닥선 · 장식 고리 금지).
 * - `prefers-reduced-motion` 이면 자동으로 멈춘다(점 이동 · 맥박 · 커서 깜빡임 없음, 진행 상태만 그린다).
 *   `still` 로 직접 멈출 수도 있다(중단된 작업 등).
 * - 장식 그림이다(`aria-hidden`). 진행을 말하는 글자는 [[AiProgress]] 제목 · [[AiProgressStep]] 처리 수가 맡는다.
 *
 * ## Spec
 * SVG `viewBox="0 0 32 32"` · 한 변 `size`(기본 32) · `aria-hidden`. 시계는 `requestAnimationFrame`(멈춤이면 돌지 않는다). `progress` 는 0~1 로 자른다.
 *
 * | 종류 | 그리는 것 | 진행 연결 | 시간 움직임(멈춤이면 없음) |
 * |---|---|---|---|
 * | `collect` | 가운데 도착점 r2 파랑 + 반지름 12 원 위 점 8개(r1.6) | 모인 점 수 = ⌊progress × 8⌋, 모인 점은 반지름 7 · 파랑(도착점과 떨어져 꽃 모양으로 뭉치지 않게). 다음 점은 소수부만큼 ease-in-out 으로 안쪽 이동(파랑) | 없음(진행 연결 이동만) |
 * | `analyze` | 꺾은선 점 10개 · 회색 선 1.5 | 머리 x = 3 + 26 × progress. 그 왼쪽만 파랑 선 1.5 + 머리 점. `progress ≥ marker` 면 봉우리 (17.5, 9) 에 이상 점 r2.2 `--color-status-warning` | 머리 점 반지름 1.8~2.6 · sin(6t) |
 * | `write` | 줄 셋 y 10 · 16 · 22, x 7 부터 길이 18 · 18 · 11 · 회색 45% 선 1.5(문서 테두리 없음) | i 번째 줄 채움 = clamp(progress × 3 − i, 0, 1) · 파랑 | 커서(높이 5 · 파랑 선 1.5) 2.2Hz 깜빡임(불투명 1 ↔ 0.15) |
 *
 * 색은 회색 · 파랑 둘(경고색은 이상 점 하나). 선 굵기 1.5 하나.
 * 멈춤(`still` 또는 `prefers-reduced-motion`)이면 진행 상태만 그린다: 이동 중인 점은 바깥에, 머리 점 r2, 커서 불투명 1.
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

/* 모양 규칙(2026-10-16): 색은 회색(남은 것) · 파랑(진행) 둘, 경고색은 분석의 이상 점 하나에만.
   선 굵기는 1.5 하나. 16px 로 줄여도 무엇인지 읽혀야 한다. 움직임은 진행 연결 + 한 곳의 맥박 · 깜빡임만. */
const STROKE = 1.5;
const GRAY = "var(--color-text-disabled)";
const BLUE = "var(--color-brand-blue)";

/* ── ① 데이터 수집 — 바깥 점 8개가 가운데 도착점으로 모인다 ─────────────── */
const N_DOTS = 8;
const R_OUT = 12;
const R_IN = 7;
function Collect({ frac, still }: { frac: number; still: boolean }) {
  const got = frac * N_DOTS;
  const dots = Array.from({ length: N_DOTS }, (_, k) => {
    const ang = (k / N_DOTS) * Math.PI * 2 - Math.PI / 2;
    let rad = R_OUT;
    let fill = GRAY;
    if (k < Math.floor(got)) {
      rad = R_IN;
      fill = BLUE;
    } else if (k === Math.floor(got) && frac < 1) {
      rad = R_OUT + (R_IN - R_OUT) * (still ? 0 : ease(got - k));
      fill = BLUE;
    }
    return <circle key={k} cx={f2(16 + Math.cos(ang) * rad)} cy={f2(16 + Math.sin(ang) * rad)} r={1.6} fill={fill} />;
  });
  return (
    <>
      <circle cx="16" cy="16" r="2" fill={BLUE} />
      {dots}
    </>
  );
}

/* ── ② 데이터 분석 — 꺾은선 하나. 지나간 부분이 파랑으로 바뀌는 것이 곧 스캔이다 ── */
const PTS: [number, number][] = [
  [3, 21], [6, 20], [9, 21.5], [12, 19.5], [15, 20.5], [17.5, 9], [20, 11], [23, 19], [26, 20], [29, 19],
];
const POLY = PTS.map((p) => p.join(",")).join(" ");
/** 이상 지점 — 꺾은선의 봉우리. */
const PEAK = PTS[5];
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
      <polyline points={POLY} fill="none" stroke={GRAY} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={POLY} fill="none" stroke={BLUE} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`} />
      {marker != null && frac >= marker && <circle cx={PEAK[0]} cy={PEAK[1]} r="2.2" fill="var(--color-status-warning)" />}
      {frac < 1 && <circle cx={f2(x)} cy={f2(yAt(x))} r={f2(pr)} fill={BLUE} />}
    </>
  );
}

/* ── ③ 분석 정보 작성 — 줄 셋이 차례로 그어진다(문서 테두리 없음) ────────── */
const ROWS: [number, number][] = [[10, 18], [16, 18], [22, 11]];
function Write({ frac, time, still }: { frac: number; time: number; still: boolean }) {
  let cx = 7;
  let cy = ROWS[0][0];
  const lines = ROWS.map(([y, w], i) => {
    const p = clamp(frac * ROWS.length - i, 0, 1);
    if (p > 0 && p < 1) {
      cx = 7 + w * p + 1.5;
      cy = y;
    }
    if (p >= 1 && i < ROWS.length - 1) {
      cx = 7;
      cy = ROWS[i + 1][0];
    }
    return (
      <g key={i}>
        <line x1="7" y1={y} x2={7 + w} y2={y} stroke={GRAY} strokeOpacity=".45" strokeWidth={STROKE} strokeLinecap="round" />
        {p > 0 && <line x1="7" y1={y} x2={f2(7 + w * p)} y2={y} stroke={BLUE} strokeWidth={STROKE} strokeLinecap="round" />}
      </g>
    );
  });
  const blink = still ? 1 : Math.floor(time * 2.2) % 2 ? 0.15 : 1;
  return (
    <>
      {lines}
      {frac < 1 && <line x1={f2(cx)} y1={f2(cy - 2.5)} x2={f2(cx)} y2={f2(cy + 2.5)} stroke={BLUE} strokeWidth={STROKE} strokeLinecap="round" opacity={blink} />}
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
      {stage === "collect" && <Collect frac={frac} still={isStill} />}
      {stage === "analyze" && <Analyze frac={frac} time={time} still={isStill} marker={marker} clipId={clipId} />}
      {stage === "write" && <Write frac={frac} time={time} still={isStill} />}
    </svg>
  );
}
