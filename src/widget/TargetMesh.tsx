import type { ReactNode } from "react";

/**
 * AiTargetMesh — 모니터링 대상 군집 메시. **점 하나 = 대상 하나.**
 *
 * ## Purpose
 * 대상 종류(APM · 서버 · 컨테이너 · DB …)마다 군집 하나를 그려, 전체 모수와 그 안의
 * 이상(위험·경고) 비중을 **한 그림으로** 보여준다. 군집 반지름을 `√개수` 에 비례시켜
 * 점 간격을 종류와 무관하게 일정하게 두므로 **면적이 곧 개수**가 된다 — 눈대중으로
 * 비교해도 거짓말이 되지 않는다(반지름을 개수에 비례시키면 면적이 개수의 제곱이 되어
 * 큰 종류가 과장된다).
 *
 * 이상 점은 군집 **가운데**부터 채운다: 「덩어리 중심이 붉다」로 읽히게 하려는 것.
 * 바깥 테두리에 두면 주변부 = 덜 중요로 읽힌다. 수집이 끊겨 판정하지 못한 대상은
 * **바깥 테두리부터 빈 점**으로 그려 «덜 찍혔다»가 한눈에 보이게 한다 — 판정 결과가
 * 모인 안쪽을 비우면 결과가 지워진 것처럼 보인다.
 *
 * 배치는 해바라기 배열(황금각 137.5°)이라 난수가 없다 — 렌더마다 자리가 같고, 원 안에
 * 균일하게 깔려 덩어리가 얼룩지지 않는다.
 *
 * ## When to use
 * - AI 가 전체 대상을 판정한 결과를 문장 뒤 **근거 오브제**로 붙일 때.
 * - 판정이 진행되는 동안 **로딩 오브제**를 겸할 때 — `revealedCount` 를 올리면 종류
 *   하나가 끝날 때마다 그 군집이 켜진다. 진행률이 곧 데이터라서 스피너처럼 의미 없이
 *   도는 물체가 아니다.
 *
 * ## When NOT to use
 * - 시계열 추이 → [[UsageChart]] 또는 지표 차트 화면.
 * - 값을 정확히 읽어야 하는 경우 → 표([[ClassificationTable]]). 이 메시는 «모양»을
 *   보는 그림이지 눈금을 읽는 그림이 아니다.
 *
 * ## Composition rules
 * - 열 폭은 군집 지름이 아니라 **1/N 등폭**이다. 지름에 맞추면 132개 열이 6개 열보다
 *   두 배 넓어져 라벨·수치가 들쭉날쭉 놓이고 «어느 종류가 더 중요한가»로 잘못 읽힌다.
 *   개수는 이미 덩어리 면적이 말하므로 열은 균등하게 둔다.
 * - 분모는 등록 수가 아니라 **판정된 수**(`total - missing`) — 못 본 대상을 분모에 넣으면
 *   비율이 낙관적으로 왜곡된다.
 * - 색은 토큰만 사용(`--color-indicator-critical` · `--color-status-warning` ·
 *   `--color-status-success` · `--color-text-disabled`). 인라인 hex 금지.
 * - `legend` 를 끄지 말 것 — 색과 자리가 무슨 뜻인지 한 줄이 없으면 색이 장식으로 읽힌다.
 * - `prefers-reduced-motion: reduce` 에서는 점 호흡·군집 점등이 모두 멈춘다(CSS 처리).
 * - **군집이 누를 수 있다는 신호는 hover/focus 에만 준다** (`.wds-mesh-cluster-btn`,
 *   whatap-ds.css). 정지 상태에서 카드 표면·쉐도우를 상시로 얹지 않는 이유: 군집 6개가
 *   표면을 얻으면 stat-tile row(대시보드 어법)가 되고, AI 위젯 문맥에서 «카드 표면»은
 *   이미 [[AiCard]] = 답변의 근거라는 뜻을 갖고 있어 군집이 답변으로 읽힌다. 그래서
 *   평상시엔 문장 뒤의 그림으로 남고, 손이 닿으면 도구가 된다.
 *   `interactive={false}`(판정 중)에는 hover 표면도 뜨지 않는다 — `disabled` 라 아직 누를
 *   것이 아니고, 그때 표면이 뜨면 «준비됐다»는 거짓 신호가 된다.
 *
 * @example
 * ```tsx
 * <AiTargetMesh
 *   items={[
 *     { short: "APM", label: "APM 애플리케이션", total: 24, warning: 3, critical: 2 },
 *     { short: "서버", label: "서버", total: 46, warning: 5, critical: 1, missing: 12 },
 *   ]}
 *   revealedCount={judged}
 *   interactive={done}
 *   onSelect={(t) => ask(`${t.label} 상세`)}
 * />
 * ```
 */
export type TargetMeshItem = {
  /** 열 라벨 — 6개가 나란히 서므로 짧게(문장용 이름은 `label`). */
  short: string;
  /** 문장·툴팁용 이름. */
  label: string;
  total: number;
  warning: number;
  critical: number;
  /** 수집이 끊겨 판정하지 못한 대상 수. 바깥 점부터 빈 점으로 그린다. */
  missing?: number;
  /** 툴팁 끝에 덧붙일 한 줄(추이 등). */
  hint?: string;
  /**
   * 제품 아이콘 경로(16px). **종류 식별은 점 모양이 아니라 이 아이콘이 맡는다** —
   * 점을 종류마다 다른 도형으로 바꾸면 같은 개수가 다른 크기로 읽혀 «면적 = 개수» 가
   * 깨지고, 4px 크기에서 도형은 어차피 구별되지 않는다. 덩어리가 전부 같은 모양인 것은
   * 의도다: 그래야 크기 차이가 오로지 개수 차이로 읽힌다.
   */
  iconSrc?: string;
};

export type MeshTone = "critical" | "warning" | "normal";
export type MeshDot = { x: number; y: number; depth: number; tone: MeshTone };

const GOLDEN_ANGLE = 2.399963229728653;
/** 점 반지름(px). */
export const MESH_DOT_R = 2.1;
/** 군집 반지름 계수 — 점 간격 ≈ 1.9 × 이 값(≈6.8px). 키우면 메시 전체가 헐거워진다. */
export const MESH_CLUSTER_K = 3.6;
const BLOB_H = 96;

const TONE_FILL: Record<MeshTone, string> = {
  critical: "var(--color-indicator-critical)",
  warning: "var(--color-status-warning)",
  normal: "var(--color-status-success)",
};

/* ─── 축척 ───────────────────────────────────────────────────────────────────
 * 점 하나 = 대상 하나는 **무한히 성립하지 않는다.** 반지름이 √개수 라서 군집 크기는
 * `7.2√N + 4.2`px 이고, 96px 박스 안에서 N ≈ 162 를 넘으면 잘린다. 잘린 그림은 면적이
 * 개수라는 이 오브제의 유일한 약속을 깨면서 **아무 말도 하지 않는다** — 화면이 조용히
 * 거짓말하는 상태다. 그래서 상한을 넘으면 점 하나가 여러 대상을 뜻하도록 축척을 바꾸고,
 * 바뀐 단위를 **범례가 말한다**.
 *
 * 축척은 **전 종류 공통**이다. 종류마다 다르게 잡으면 면적끼리 비교가 깨져서, 덩어리가
 * 큰 쪽이 실제로 많은 쪽이라는 보장이 사라진다.
 * 이상·수집 실패 점은 0으로 반내림하지 않는다(최소 1점) — 「위험 5건」이 축척 때문에
 * 그림에서 사라지면 그림과 문장이 어긋난다. */
const DOT_CAP = 150;
const SCALE_LADDER = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

/** 전 종류 공통 축척 — 점 하나가 몇 개를 뜻하는지. */
export function meshScaleOf(items: TargetMeshItem[]): number {
  const maxTotal = Math.max(0, ...items.map((t) => t.total));
  return SCALE_LADDER.find((k) => maxTotal / k <= DOT_CAP) ?? SCALE_LADDER[SCALE_LADDER.length - 1];
}

/** 실제 개수 → 찍을 점 수. 0이 아닌 값은 최소 1점으로 남긴다. */
const dotsFor = (n: number, scale: number) => (n > 0 ? Math.max(1, Math.round(n / scale)) : 0);

/**
 * 대상 종류 1개 → 점 좌표 목록. 소비 측에서 같은 점 데이터를 다른 크기로 재사용할 때
 * (예: 배경 오브제) 쓰라고 함께 내보낸다. 렌더마다 부르지 말고 모듈 로드 시 1회 계산할 것.
 *
 * `scale` 은 [[meshScaleOf]] 로 **여러 종류를 함께 놓고** 구한 값을 넘긴다. 종류 하나만
 * 보고 축척을 정하면 종류마다 단위가 달라져 면적 비교가 깨진다.
 */
export function targetMeshDots(item: TargetMeshItem, scale = 1): { dots: MeshDot[]; radius: number } {
  const n = dotsFor(item.total, scale);
  const critN = dotsFor(item.critical, scale);
  const warnN = Math.min(dotsFor(item.warning, scale), Math.max(0, n - critN));
  const radius = MESH_CLUSTER_K * Math.sqrt(n);
  const dots: MeshDot[] = [];
  for (let i = 0; i < n; i++) {
    const depth = Math.sqrt((i + 0.5) / n); // 0=중심 · 1=바깥
    const rr = radius * depth;
    const th = i * GOLDEN_ANGLE;
    const tone: MeshTone = i < critN ? "critical" : i < critN + warnN ? "warning" : "normal";
    dots.push({ x: rr * Math.cos(th), y: rr * Math.sin(th), depth, tone });
  }
  // 정상 점을 먼저 그려 이상 점이 위에 오게 — 이상 점은 r 이 커지므로 가려지면 안 된다.
  dots.sort((a, b) => (a.tone === "normal" ? 0 : 1) - (b.tone === "normal" ? 0 : 1));
  return { dots, radius };
}

/** 축척이 1이 아니면 범례가 «점 하나가 대상 N개» 로 바뀐다 — 조용히 바꾸면 거짓말이 된다. */
function defaultLegend(scale: number, anyMissing: boolean) {
  return (
    <>
      점 하나가 대상 {scale > 1 ? `${scale}개` : "하나"} · 덩어리 크기는 대상 수 · 가운데로 모인 색이 위험·경고
      {anyMissing && " · 빈 점은 수집이 끊겨 판정하지 못한 대상"}
    </>
  );
}

export default function AiTargetMesh({
  items,
  revealedCount,
  interactive = true,
  onSelect,
  legend,
}: {
  /** 대상 종류 하나 = 점 군집 하나 (`short` · `label` · `total` · `warning` · `critical` · `missing` …). 등폭 열로 나란히 서고(6개 기준), 점 하나가 뜻하는 개수(축척)는 전 종류의 최대 `total` 로 함께 정한다. `label` 이 React key 라 겹치지 않게. */
  items: TargetMeshItem[];
  /** 앞에서부터 몇 개 군집을 켤지. 미지정이면 전부 켠다(판정 완료 상태). */
  revealedCount?: number;
  /** false 면 클릭 불가(판정 중). */
  interactive?: boolean;
  /** 군집 클릭 — 보통 그 종류를 묻는 질문을 보낸다. */
  onSelect?: (item: TargetMeshItem) => void;
  /** 범례 한 줄. 미지정이면 기본 문구. `null` 로 끌 수 있으나 권장하지 않는다. */
  legend?: ReactNode;
}) {
  const shown = revealedCount ?? items.length;
  const anyMissing = items.some((t) => (t.missing ?? 0) > 0);
  // 축척은 전 종류 공통 — 종류마다 다르면 면적끼리 비교가 깨진다.
  const scale = meshScaleOf(items);

  return (
    <div className="flex flex-col gap-10px">
      <div className="flex items-start" style={{ gap: 20 }}>
        {items.map((item, i) => (
          <MeshCluster
            key={item.label}
            item={item}
            scale={scale}
            revealed={i < shown}
            interactive={interactive}
            onSelect={onSelect}
          />
        ))}
      </div>
      {legend !== null && (
        <span className="text-sm" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-family-korean)" }}>
          {legend ?? defaultLegend(scale, anyMissing)}
        </span>
      )}
    </div>
  );
}

/** 군집 하나 — SVG 점 덩어리 + 라벨 + 이상/판정 수치. 열은 1/N 등폭. */
function MeshCluster({
  item,
  scale,
  revealed,
  interactive,
  onSelect,
}: {
  item: TargetMeshItem;
  scale: number;
  revealed: boolean;
  interactive: boolean;
  onSelect?: (item: TargetMeshItem) => void;
}) {
  const missing = item.missing ?? 0;
  const missingDots = dotsFor(missing, scale);
  const { dots, radius } = targetMeshDots(item, scale);
  /* 빠진 점은 바깥 테두리부터 비운다 — 덩어리가 가장자리부터 헐어 보이므로 «덜 찍혔다» 가
     한눈에 읽힌다. */
  const gapIdx = new Set(
    dots
      .map((d, i) => ({ i, depth: d.depth, tone: d.tone }))
      .filter((d) => d.tone === "normal")
      .sort((a, b) => b.depth - a.depth)
      .slice(0, missingDots)
      .map((d) => d.i),
  );
  const w = Math.ceil(radius * 2) + 10;
  const abn = item.warning + item.critical;
  const alertColor = TONE_FILL[item.critical > 0 ? "critical" : "warning"];

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onSelect?.(item)}
      className="wds-mesh-cluster-btn flex flex-col items-center gap-6px bg-transparent border-0"
      style={{ flex: "1 1 0", minWidth: 0, cursor: interactive && onSelect ? "pointer" : "default" }}
      title={`${item.label} ${item.total}개 · 위험 ${item.critical} · 경고 ${item.warning}${item.hint ? ` · ${item.hint}` : ""}`}
    >
      <svg
        width={w}
        height={BLOB_H}
        className="wds-mesh-cluster"
        style={{ opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(6px)" }}
        aria-hidden
      >
        <g transform={`translate(${w / 2} ${BLOB_H / 2})`}>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={MESH_DOT_R}
              fill={gapIdx.has(i) ? "none" : TONE_FILL[d.tone]}
              stroke={gapIdx.has(i) ? "var(--color-text-disabled)" : undefined}
              strokeWidth={gapIdx.has(i) ? 1 : undefined}
              className={d.tone === "normal" ? "wds-mesh-dot" : "wds-mesh-dot-alert"}
              style={
                {
                  // 중심에서 멀수록 옅게 → 덩어리 테두리가 흐려져 원반이 아니라 구름으로 읽힌다.
                  "--dot-o": (0.95 - d.depth * 0.4).toFixed(2),
                  "--dot-r": `${MESH_DOT_R}px`,
                  // 지연을 중심 거리로 주면 물결이 안에서 바깥으로 한 방향으로 지나간다.
                  animationDelay: `${(d.depth * 1.1).toFixed(2)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>
      </svg>

      <span className="flex items-center gap-4px min-w-0">
        {item.iconSrc && <img src={item.iconSrc} alt="" width={16} height={16} className="block shrink-0" />}
        <span
          className="text-sm truncate"
          style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-family-korean)" }}
        >
          {item.short}
        </span>
      </span>
      <span className="text-sm whitespace-nowrap" style={{ fontFamily: "var(--font-family-numeric)" }}>
        {abn > 0 && <strong style={{ color: alertColor }}>{abn}</strong>}
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {abn > 0 ? "/" : ""}
          {/* 분모는 등록 수가 아니라 판정된 수. */}
          {item.total - missing}
        </span>
      </span>
      {missing > 0 && (
        <span className="text-sm whitespace-nowrap" style={{ color: "var(--color-status-warning)", fontFamily: "var(--font-family-korean)" }}>
          수집 없음 <span style={{ fontFamily: "var(--font-family-numeric)" }}>{missing}</span>
        </span>
      )}
    </button>
  );
}
