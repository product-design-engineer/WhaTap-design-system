/**
 * CardHead — 카드 머리 한 줄 (이름 + 탭 + 우측 메타). Composite layer.
 *
 * ## Purpose
 * 탭을 가진 카드의 머리를 **한 줄**로 세운다. 이름은 이 영역이 무엇인지를, 탭은 무엇으로
 * 나뉘는지를, 우측 슬롯은 지금 무엇을 보고 있는지를 말한다. 셋 다 필요한데 서로 다른 기준이라,
 * 한 줄에 왼쪽에서 오른쪽으로 세우면 「무엇 → 어떻게 나뉨 → 지금 어느 것」이 한 번에 읽힌다.
 *
 * ## When to use
 * - 탭으로 내용이 갈리는 카드의 머리 (지표군 탭 · 목록 종류 탭).
 * - 이름만 있고 탭이 없는 카드 머리에도 쓸 수 있다(`tabs` 생략).
 *
 * ## When NOT to use
 * - 페이지 전체의 머리 → [[PageHeader]] · [[SubHeaderBar]].
 * - 조건 입력이 늘어선 줄 → [[OptionbarPage]] 또는 `.wds-field-row` 를 붙인 컨테이너.
 * - 카드 안 본문의 소제목 → `text-base font-medium text-primary`(body.label) 한 줄이면 충분하다.
 *
 * ## Composition rules
 * - 이름은 타이포 역할 `heading.subsection`(`text-md font-bold`, 13px)이다. 카드 헤더의 정본 역할이다(patterns §10).
 *   12px 에 bold 를 얹지 않는다 — 12px 은 medium 자리라 같은 크기에서 굵기만 바뀌면 위계가 흐려진다.
 * - **이름과 탭을 위아래로 나누지 않는다.** 나누면 두 줄 다 가로를 15% 안팎만 쓰면서 세로만
 *   34px 더 먹는다. 위계는 줄 구분이 아니라 굵기(이름 bold / 탭 regular)가 진다.
 * - `meta` 는 **우측 끝**. 카드마다 달아야 하는 값(보고 있는 구간 등)을 넣는다. 여러 카드가
 *   같은 값을 볼 때 첫 카드에만 달면 그 카드에만 걸린 값처럼 읽힌다.
 * - 이름과 `meta` 는 `whitespace-nowrap` — 줄바꿈으로 머리가 두 줄이 되면 한 줄로 세운 뜻이 사라진다.
 * - 탭은 **`segmented` 기본**. `large` 의 밑줄은 컨테이너 폭을 가로질러 「이 선 아래 전부가
 *   바뀐다」를 말하는 장치인데, 제목을 왼쪽에 붙이면 밑줄이 줄 가운데 토막으로 남아 끝나다 만
 *   구분선처럼 읽힌다. `segmented` 는 트랙이 닫혀 있어 한 줄 안에서도 컨트롤로 읽힌다.
 * - 카드 **안**의 뷰 전환은 페이지 섹션 전환이 아니다 — [[Tabs]] 문서의 갈래에서 `segmented` 쪽이다.
 *   `large` 가 필요하면 `tabs.variant` 로 바꾸되, 그때는 탭을 머리 아래 **자기 줄**로 내려
 *   밑줄이 카드를 가로지르게 한다. 한 줄과 `large` 는 같이 가기 어렵다.
 *
 * @example
 * ```tsx
 * <CardHead
 *   title="구간 지표"
 *   tabs={{ items: METRIC_TABS, value: tab, onChange: setTab }}
 *   meta={<span className="text-base text-secondary">2026년 8월 19일 · 평균</span>}
 * />
 * ```
 */
import type { ReactNode } from "react";
import Tabs, { type TabsItem, type TabsVariant } from "./Tabs";

export type CardHeadTabs = {
  items: TabsItem[];
  value: string;
  onChange: (next: string) => void;
  /**
   * 기본 `segmented` — 한 줄 머리에서 밑줄이 토막 나지 않는다.
   * `large` 는 탭을 자기 줄로 내릴 때만 쓴다(밑줄이 카드를 가로지를 수 있을 때).
   */
  variant?: TabsVariant;
};

export type CardHeadProps = {
  /** 영역 이름 — 탭은 무엇으로 나뉘는지만 말하고 영역이 무엇인지는 말하지 않는다. */
  title: string;
  /** 탭. 없으면 이름만 그린다. */
  tabs?: CardHeadTabs;
  /** 우측 끝 슬롯 — 지금 보고 있는 대상·범위 같은 메타. */
  meta?: ReactNode;
};

export default function CardHead({ title, tabs, meta }: CardHeadProps) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 16 }}>
      <span className="flex items-center" style={{ gap: 16 }}>
        <span className="text-md font-bold text-primary whitespace-nowrap">{title}</span>
        {tabs && (
          <Tabs
            variant={tabs.variant ?? "segmented"}
            size="lg"
            items={tabs.items}
            value={tabs.value}
            onChange={tabs.onChange}
          />
        )}
      </span>

      {/* meta 안에 필드가 오면 늘 인라인 — 머리는 계약상 한 줄이라 라벨이 위로 쌓이면 성립하지 않는다. */}
      {meta && <span className="wds-field-row-inline flex items-center whitespace-nowrap">{meta}</span>}
    </div>
  );
}
