/**
 * TimeChip — Composite. 화면에 나가는 **시간값**의 단일 표기.
 *
 * ## Purpose
 * 날짜 · 시각 · 구간 · 판정 기준 시각처럼 «읽어야 하는 시간값» 을 한 가지 모양으로 세운다.
 * [[Chip]] `md` soft 위에 자형 규칙(숫자 numeric / 한글 korean)만 얹은 얇은 조합이다.
 *
 * 한 화면에는 시간값이 여럿 흩어진다(지금 시각 · 분석 구간 · 판정 기준 · 차트 축). 그중 하나만
 * 맨 텍스트로 두거나 크기가 다른 칩으로 두면 **같은 종류의 사실이 두 가지 모양**으로 나타나고,
 * 사람은 그 둘을 다른 성격의 값으로 읽는다. 그래서 표기를 컴포넌트 하나로 고정한다.
 *
 * ## When to use
 * - 문장 **밖**에 서는 시간값 — 헤더 옆 날짜, 분석 구간 칩, 스냅샷 기준 시각, 차트 축 끝점.
 * - 값이 낡을 수 있는 시각 → `tone="warning"` 으로 칩 자체가 색으로 알린다(예: 스냅샷 5분 경과).
 *
 * ## When NOT to use
 * - **문장 안에서** 말하는 시각(「03:20 부터 진행 중입니다」) → 칩으로 싸지 않는다. 글줄이 끊긴다.
 * - **시간을 고르는 컨트롤** → [[TimeRangeSelector]] · [[DateTimeBlock]] · [[LiveTimerCompact]].
 * - **시간값이 아닌 구획 표시**(챕터 라벨 · 섹션 표지) → 값과 같은 모양을 쓰지 않는다.
 *   밝은 회색 알약 = 읽을 값, 채운 사각 = 구획.
 * - 상태·심각도 라벨 → [[Chip]] 을 tone 과 함께 직접.
 *
 * ## Composition rules
 * - 크기는 **`Chip` md 고정**(20px · text-sm). size prop 을 열지 않는다 — 화면마다 크기가 갈리면
 *   이 컴포넌트가 존재하는 이유가 없어진다.
 * - 자형: `value` 는 `--font-family-numeric` + medium(자릿수 세로 정렬), `label`·`note` 는
 *   `--font-family-korean` regular. 숫자만 자형을 가르는 이유는 시각을 훑을 때 자리가 맞아야 해서다.
 * - 색은 [[Chip]] 의 soft/neutral 토큰 그대로. 인라인 hex 금지.
 * - `leadingIcon` 은 값의 **성격**을 말할 때만(예: 스냅샷 셔터). 장식으로 붙이지 않는다.
 *
 * @example
 * ```tsx
 * <TimeChip value="8월 11일" note="(화)" />
 * <TimeChip label="구간" value="8월 9일 18:00 ~ 10:08" />
 * <TimeChip label="판정 기준" value="10:08" note="· 방금" leadingIcon={<IcSnapshot size={12} />} />
 * <TimeChip value="02:10" />
 * ```
 */
import type { ReactNode } from "react";
import Chip from "./Chip";

export type TimeChipProps = {
  /** 한글 접두 라벨 — 「구간」 · 「판정 기준」. 값만 세울 때는 생략한다. */
  label?: string;
  /** 시간값 본체 — numeric 자형으로 나간다. */
  value: string;
  /** 꼬리말 — 「(화)」 · 「· 방금」. 값 뒤에 붙는다. */
  note?: string;
  /** 낡은 값·주의가 필요한 시각은 warning. 기본 neutral. */
  tone?: "neutral" | "warning";
  /** 값의 성격을 말하는 아이콘(예: 스냅샷 셔터). 장식 금지. */
  leadingIcon?: ReactNode;
  className?: string;
};

export default function TimeChip({ label, value, note, tone = "neutral", leadingIcon, className }: TimeChipProps) {
  return (
    <Chip size="md" variant="soft" tone={tone} leadingIcon={leadingIcon} className={className} noTruncate>
      {label && <span style={{ fontFamily: "var(--font-family-korean)" }}>{label}{" "}</span>}
      <span style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>
        {value}
      </span>
      {note && <span style={{ fontFamily: "var(--font-family-korean)" }}>{note}</span>}
    </Chip>
  );
}
