import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { withSpec } from "../_spec";

/** 개발 스펙을 꺼낼 컴포넌트 이름(설명 문자열과 섞이지 않게 식별자로 둔다 — 카탈로그 생성기가 문자열 리터럴을 이어 붙인다). */
const SPEC_OF = "AiStageMotion";
import { AiStageMotion } from "@whatap/design-system/widget";

const meta: Meta<typeof AiStageMotion> = {
  title: "Primitives/AiStageMotion",
  component: AiStageMotion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: withSpec(
          SPEC_OF,
          "**AI 연산 단계 그림.** 수집 · 분석 · 작성 세 종류. 반복 재생이 아니라 `progress`(0~1, 처리 수 ÷ 전체)를 받아 그린다. " +
          "[[AiProgress]] 머리 32px 자리에서 단계가 바뀔 때 그림만 바뀐다. 동작 줄이기 설정이면 움직임 없이 진행 상태만 그린다.",
        ),
      },
    },
  },
  argTypes: {
    stage: { control: "inline-radio", options: ["collect", "analyze", "write"] },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: { type: "number" } },
    still: { control: "boolean" },
    marker: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
};
export default meta;
type Story = StoryObj<typeof AiStageMotion>;

/** ① 데이터 수집 — 모인 점 수 = 수집이 끝난 에이전트 비율(12개 중). */
export const Collect: Story = { args: { stage: "collect", progress: 0.4, size: 96 } };

/** ② 데이터 분석 — 스캔 위치 = 분석한 트랜잭션 비율. `marker` 를 넘으면 이상 구간이 경고 색으로 남는다. */
export const Analyze: Story = { args: { stage: "analyze", progress: 0.55, marker: 0.3, size: 96 } };

/** ③ 분석 정보 작성 — 그어진 줄 = 작성이 끝난 답변 항목 비율. */
export const Write: Story = { args: { stage: "write", progress: 0.6, size: 96 } };

/** 진행 카드 머리 자리의 실제 크기(32px). */
export const ActualSize: Story = { args: { stage: "analyze", progress: 0.55, marker: 0.3 } };

/** 멈춤 — 동작 줄이기 설정 또는 중단된 작업. 진행 상태만 그린다. */
export const Still: Story = { args: { stage: "collect", progress: 0.5, size: 96, still: true } };

/** 세 종류를 진행률 0 → 1 로 돌려 본다(설명용 순환. 실제 화면은 서버 처리 수를 넣는다). */
export const AllStages: Story = {
  render: () => {
    const Demo = () => {
      const [p, setP] = useState(0);
      useEffect(() => {
        let id = 0;
        const t0 = performance.now();
        const loop = (now: number) => {
          setP((((now - t0) / 1000) % 5) / 4.4);
          id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
      }, []);
      const frac = Math.min(1, p);
      return (
        <div className="flex gap-24px items-end">
          {(["collect", "analyze", "write"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-8px">
              <div className="bg-surface-50 rounded-8px" style={{ padding: 12 }}>
                <AiStageMotion stage={s} progress={frac} marker={s === "analyze" ? 0.3 : undefined} size={96} />
              </div>
              <span className="text-base text-tertiary">{s}</span>
            </div>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};

/* ── 비교용 — 2026-10-16 단순화 이전 모양(그대로 옮김). 결정이 끝나면 이 블록과 `Compare` 스토리를 지운다. ── */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const f2 = (n: number) => Number(n.toFixed(2));
/* ── ① 데이터 수집 ─────────────────────────────────────────────────── */
function OldCollect({ frac, time, still }: { frac: number; time: number; still: boolean }) {
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
const OLD_PTS: [number, number][] = [
  [3, 22], [5.4, 21], [7.8, 22.5], [10.2, 20.5], [12.6, 21.5], [15, 20],
  [17.4, 9], [19.8, 11], [22.2, 19], [24.6, 20.5], [27, 19.5], [29, 21],
];
const OLD_POLY = OLD_PTS.map((p) => p.join(",")).join(" ");
function OldyAt(x: number) {
  for (let i = 0; i < OLD_PTS.length - 1; i++) {
    const [ax, ay] = OLD_PTS[i];
    const [bx, by] = OLD_PTS[i + 1];
    if (x >= ax && x <= bx) return ay + (by - ay) * ((x - ax) / (bx - ax));
  }
  return OLD_PTS[OLD_PTS.length - 1][1];
}
function OldAnalyze({ frac, time, still, marker, clipId }: { frac: number; time: number; still: boolean; marker?: number; clipId: string }) {
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
      <polyline points={OLD_POLY} fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={OLD_POLY} fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`} />
      {frac < 1 && (
        <>
          <line x1={f2(x)} y1="4" x2={f2(x)} y2="27" stroke="var(--color-brand-blue)" strokeWidth="1" strokeOpacity=".55" />
          <circle cx={f2(x)} cy={f2(OldyAt(x))} r={f2(pr)} fill="var(--color-brand-blue)" />
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
const OLD_ROWS: [number, number][] = [[10.5, 12], [15, 12], [19.5, 12], [24, 7.5]];
function OldWrite({ frac, time, still }: { frac: number; time: number; still: boolean }) {
  let cx = 10;
  let cy = 10.5;
  const lines = OLD_ROWS.map(([y, w], i) => {
    const p = clamp(frac * 4 - i, 0, 1);
    if (p > 0 && p < 1) {
      cx = 10 + w * p + 1.2;
      cy = y;
    }
    if (p >= 1 && i < OLD_ROWS.length - 1) {
      cx = 10;
      cy = OLD_ROWS[i + 1][0];
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

function LegacyStageMotion({ stage, progress, size }: { stage: "collect" | "analyze" | "write"; progress: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ display: "block" }}>
      {stage === "collect" && <OldCollect frac={progress} time={0} still />}
      {stage === "analyze" && <OldAnalyze frac={progress} time={0} still marker={0.3} clipId="legacy-clip" />}
      {stage === "write" && <OldWrite frac={progress} time={0} still />}
    </svg>
  );
}

/** 비교 — 위 줄 이전 모양 · 아래 줄 단순화한 지금 모양. 진행 0 · 50% · 100%, 96px 와 실제 32px · 16px. */
export const Compare: Story = {
  render: () => (
    <div className="flex flex-col gap-16px">
      {(["before", "after"] as const).map((row) => (
        <div key={row} className="flex items-center gap-24px">
          <span className="text-base text-tertiary" style={{ width: 40 }}>{row === "before" ? "이전" : "지금"}</span>
          {(["collect", "analyze", "write"] as const).map((st) => (
            <div key={st} className="flex items-end gap-8px bg-surface-50 rounded-8px" style={{ padding: 8 }}>
              {[0, 0.5, 1].map((p) =>
                row === "before" ? <LegacyStageMotion key={p} stage={st} progress={p} size={64} /> : <AiStageMotion key={p} stage={st} progress={p} marker={st === "analyze" ? 0.3 : undefined} size={64} still />,
              )}
              {row === "before" ? <LegacyStageMotion stage={st} progress={0.5} size={32} /> : <AiStageMotion stage={st} progress={0.5} marker={st === "analyze" ? 0.3 : undefined} still />}
              {row === "before" ? <LegacyStageMotion stage={st} progress={0.5} size={16} /> : <AiStageMotion stage={st} progress={0.5} marker={st === "analyze" ? 0.3 : undefined} size={16} still />}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
