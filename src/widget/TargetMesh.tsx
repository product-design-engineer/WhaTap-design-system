import type { ReactNode } from "react";
import TargetMeshCluster from "./TargetMeshCluster";
import { meshScaleOf, type TargetMeshItem } from "./_targetMesh";

export { targetMeshDots, meshScaleOf, MESH_DOT_R, MESH_CLUSTER_K } from "./_targetMesh";
export type { TargetMeshItem, MeshDot, MeshTone } from "./_targetMesh";

/**
 * AiTargetMesh — 모니터링 대상 군집 메시. **점 하나 = 대상 하나.** Composite layer.
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
 * - 군집(열)은 [[TargetMeshCluster]] 가 그린다 — 이 컴포넌트는 공통 축척 · 판정 진행 · 범례만 맡는다. 그래서 Composite 계층이다.
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
          <TargetMeshCluster
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

