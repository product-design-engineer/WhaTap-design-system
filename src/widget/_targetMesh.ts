/**
 * widget/_targetMesh — [[TargetMesh]] · [[TargetMeshCluster]] 가 함께 쓰는 타입 · 상수 · 점 배치 계산(순수 함수).
 * 카탈로그 밖 내부 모듈. 공개 이름은 TargetMesh 가 다시 내보낸다(호환 유지).
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
export const BLOB_H = 96;

export const TONE_FILL: Record<MeshTone, string> = {
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
export const dotsFor = (n: number, scale: number) => (n > 0 ? Math.max(1, Math.round(n / scale)) : 0);

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

