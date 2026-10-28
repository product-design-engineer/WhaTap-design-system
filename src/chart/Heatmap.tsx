/**
 * Heatmap — 시간 격자 위에 지표 강도를 펴 보이는 히트맵. Composite layer.
 *
 * ## Purpose
 * 축 라벨 + [[HeatmapCell]] 격자. 같은 컴포넌트가 두 축척을 진다 —
 * `month`(7열 요일 × 주 행, 한 칸 = 하루) 와 `day`(12열 5분 × 24행 시각, 한 칸 = 5분).
 * 축척이 바뀌면 라벨과 칸의 뜻이 함께 바뀐다. 색 스케일은 두 축척이 공유한다.
 *
 * ## When to use
 * - 사후 분석 진입 — 어느 날/어느 시간대가 튀었는지 먼저 짚고 상세로 내려갈 때.
 *
 * ## When NOT to use
 * - ON/OFF 설정 격자 → [[EventWeekTimeMatrix]].
 * - 값 하나의 추이 → [[MiniLineChart]].
 * - 대상별(인스턴스별) 강도 비교 → 히트맵이 아니라 정렬 가능한 표.
 *
 * ## Metrics
 * - ✅ 칸(하루 · 5분)마다의 강도 — 일별 에러 수 · 시간대별 TPS · 5분 칸 평균 응답시간 · 사용량
 * - ❌ 부호가 있는 지표(증감률 ±) — 순차 색은 0 기준을 말하지 못한다
 * - ❌ 정확한 값 비교 → 막대 · 표. 색 단계는 대략의 크기만 말한다
 *
 * ## Composition rules
 * - `cells` 는 **정규화된 0~1 또는 null** 의 평평한 배열. 원 단위 → 0~1 변환은 호출측 몫.
 * - `month` 는 첫 칸 앞에 `offset` 만큼 빈 자리를 두어 요일을 맞춘다. 라벨은 일~토.
 * - `day` 는 열 라벨을 10분 간격(0·10·20·30·40·50분), 행 라벨을 2시간 간격으로만 찍는다 —
 *   전부 찍으면 라벨이 격자를 이긴다.
 * - 선택은 한 칸만(`selectedIndex`). 격자 자체가 필터라서 다중 선택은 뜻이 흐려진다.
 * - 접근성 이름: 루트는 `ariaLabel`(기본 «월간/일간 히트맵») 을 단 `role="group"`.
 *   클릭 가능한 칸은 `cellTitle` 이 없어도 축 라벨로 이름을 만든다(«19일 · 강도 24%», «9시 35분 · 데이터 없음»).
 *   읽기 전용 격자는 칸을 보조기술에서 숨기므로, 무엇을 보여 주는지는 `ariaLabel` 에 쓴다.
 * - 범례는 포함하지 않는다 — 폭을 맞춰 [[HeatmapLegend]] 를 바로 아래 둔다.
 * - `onHoverChange` 를 [[HeatmapLegend]] `marker` 에 이으면, 커서가 놓인 칸의 색이 스케일
 *   어디에 앉는지 범례가 짚어 준다. 색만 있고 수치가 없는 격자에서 값을 읽는 유일한 길이다.
 *
 * @example
 * ```tsx
 * <Heatmap mode="month" cells={days} offset={5} labels={dayNumbers}
 *          selectedIndex={18} onSelect={setDay} />
 * <Heatmap mode="day" cells={slots} selectedIndex={sel} onSelect={setSlot} />
 * ```
 */
import HeatmapCell from "./HeatmapCell";

export type HeatmapMode = "month" | "day";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
/** day 모드 — 1시간을 5분 12칸으로 자른다. */
const DAY_COLS = 12;
/** day 모드 — 0시부터 23시까지 24행. */
const DAY_ROWS = 24;

export type HeatmapProps = {
  mode: HeatmapMode;
  /** 정규화 값 0~1 (또는 데이터 없음 null) 의 평평한 배열. */
  cells: (number | null)[];
  /** month 모드 — 1일이 앉을 요일(0=일). 그만큼 앞을 비운다. */
  offset?: number;
  /** 칸 안 마이크로 라벨(일자 등). 인덱스는 `cells` 와 같다. */
  labels?: string[];
  /** 선택된 칸 인덱스. */
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  /** 격자 전체의 스크린리더 이름 — 무엇의 강도인지 적는다. 기본 «월간 히트맵»/«일간 히트맵». */
  ariaLabel?: string;
  /** hover tooltip 문구 생성기. 스크린리더 이름도 이걸 쓴다. */
  cellTitle?: (index: number, value: number | null) => string;
  /**
   * 커서(또는 focus)가 놓인 칸의 값. 벗어나면 `null`.
   * [[HeatmapLegend]] `marker` 로 그대로 넘기면 색이 스케일 어디에 앉는지 보인다.
   */
  onHoverChange?: (value: number | null) => void;
  /** month 칸 높이(px). 기본 49 — 라이브 격자 치수. */
  monthCellHeight?: number;
  /** day 칸 높이(px). 기본 13. */
  dayCellHeight?: number;
};

export default function Heatmap({
  mode,
  cells,
  offset = 0,
  labels,
  selectedIndex,
  onSelect,
  cellTitle,
  ariaLabel,
  onHoverChange,
  monthCellHeight = 49,
  dayCellHeight = 13,
}: HeatmapProps) {
  const cols = mode === "month" ? 7 : DAY_COLS;
  const height = mode === "month" ? monthCellHeight : dayCellHeight;
  const lead = mode === "month" ? offset : 0;
  // cellTitle 이 없을 때의 칸 이름 — 클릭 가능한 칸이 이름 없는 버튼이 되지 않게 축 라벨로 만든다.
  const cellName = (i: number, v: number | null) => {
    const where =
      mode === "month"
        ? `${labels?.[i] ?? i + 1}일`
        : `${Math.floor(i / DAY_COLS)}시 ${(i % DAY_COLS) * 5}분`;
    return `${where} · ${v === null ? "데이터 없음" : `강도 ${Math.round(v * 100)}%`}`;
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? (mode === "month" ? "월간 히트맵" : "일간 히트맵")}
      className="flex flex-col"
      style={{ gap: 4 }}
    >
      {/* 열 라벨 */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `${mode === "day" ? "28px " : ""}repeat(${cols}, 1fr)`,
          gap: 4,
        }}
      >
        {mode === "day" && <span />}
        {Array.from({ length: cols }, (_, c) => (
          <span key={c} className="text-sm text-tertiary text-center whitespace-nowrap">
            {mode === "month"
              ? WEEKDAY_LABELS[c]
              : c % 2 === 0
                ? `${c * 5}분`
                : ""}
          </span>
        ))}
      </div>

      {/* 격자 */}
      {mode === "month" ? (
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}
        >
          {Array.from({ length: lead }, (_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {cells.map((v, i) => (
            <HeatmapCell
              key={i}
              value={v}
              label={labels?.[i]}
              height={height}
              selected={selectedIndex === i}
              onClick={onSelect ? () => onSelect(i) : undefined}
              title={cellTitle?.(i, v)}
              ariaLabel={cellTitle ? undefined : cellName(i, v)}
              onHoverChange={onHoverChange}
            />
          ))}
        </div>
      ) : (
        Array.from({ length: DAY_ROWS }, (_, row) => (
          <div
            key={row}
            className="grid items-center"
            style={{ gridTemplateColumns: `28px repeat(${cols}, 1fr)`, gap: 4 }}
          >
            {/* 라벨 칸 높이 = 칸 높이. 글자 줄 높이(15.7)가 칸(13)보다 커서 라벨 있는 짝수 행만 늘어나 행 간격이 들쭉날쭉했다. */}
            <span className="flex items-center text-sm text-tertiary tabular-nums" style={{ height }}>
              {row % 2 === 0 ? `${row}시` : ""}
            </span>
            {Array.from({ length: cols }, (_, c) => {
              const i = row * cols + c;
              return (
                <HeatmapCell
                  key={c}
                  value={cells[i] ?? null}
                  height={height}
                  selected={selectedIndex === i}
                  onClick={onSelect ? () => onSelect(i) : undefined}
                  title={cellTitle?.(i, cells[i] ?? null)}
                  ariaLabel={cellTitle ? undefined : cellName(i, cells[i] ?? null)}
                  onHoverChange={onHoverChange}
                />
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
