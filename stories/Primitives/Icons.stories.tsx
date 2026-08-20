import type { Meta, StoryObj } from "@storybook/react-vite";
import { IcDocs, IcSupport, IcSnapshot, SettingsIcon } from "@whatap/design-system";

/**
 * Primitives/Icons — DS 가 소유한 공용 SVG 아이콘 묶음.
 *
 * 아이콘은 prop 표면이 `size` 정도라 항목마다 스토리를 두면 카탈로그만 길어진다.
 * 대신 **한 장에 모아** 이름·크기·의미를 나란히 보여준다. 개별 이름으로도 검색되도록
 * 설명에 이름을 모두 적어 둔다(`IcDocs` · `IcSupport` · `IcSnapshot` · `SettingsIcon`).
 */

/* 셀에 테두리·배경을 두지 않는다 — 아이콘 카탈로그에서 격자가 보이면 «아이콘의 일부»로
   읽힐 여지가 있다. 구분은 여백(gap·padding)만으로 한다. */
const CELL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: 12,
  minWidth: 120,
};

const meta: Meta = {
  title: "Primitives/Icons",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**공용 SVG 아이콘 4종** — `IcDocs`(문서) · `IcSupport`(고객지원) · `IcSnapshot`(스냅샷·셔터) · `SettingsIcon`(설정·톱니바퀴).\n\n" +
          "에셋을 DS 가 소유하는 이유: 아이콘이 없으면 소비자가 각자 인라인 SVG 를 그리고, 같은 아이콘의 굵기·크기·색이 화면마다 갈라진다. " +
          "색은 `currentColor` 또는 텍스트 토큰을 쓰므로 감싸는 컨트롤의 전경색을 그대로 따른다.\n\n" +
          "**크기 정책:** 아이콘 크기는 4단(24/20/16/12)만 쓴다. `IcSnapshot`·`SettingsIcon` 은 `size` 를 받고, `IcDocs`·`IcSupport` 는 헤더 전용이라 16px 고정이다.\n\n" +
          "✅ **Do** — 설정은 `SettingsIcon` 하나로 통일 · 스냅샷(찍힌 시점)에는 `IcSnapshot` · 크기는 4단 스케일에서 고르기 · 의미 라벨은 감싸는 버튼에 (`aria-label`)\n\n" +
          "❌ **Don't** — 같은 아이콘을 인라인 SVG 로 다시 그리기 · 4단 밖 임의 크기(`size={18}`) · 아이콘에 색 리터럴 지정(토큰·`currentColor` 사용) · " +
          "현재 시각을 뜻하는 자리에 `IcSnapshot` 쓰기(셔터는 *언제 찍힌 값*, 시계는 *지금 몇 시*)\n\n" +
          "## When to use\n" +
          "- 헤더·툴바·칩 안에 들어가는 공용 표식이 필요할 때 — 문서·고객지원·설정·스냅샷.\n" +
          "- `TimeChip` 의 `leadingIcon` 처럼 값의 **성격**을 알리는 아이콘이 필요할 때(`IcSnapshot`).\n\n" +
          "## When NOT to use\n" +
          "- AI 기능 표식 → `AiSymbol`(보라 그라데이션 pinwheel).\n" +
          "- 브랜드 마크 → `Primitives/WhaTap Symbol`.\n" +
          "- 여기 없는 의미의 아이콘을 비슷한 것으로 대체하기 — 새로 필요하면 `src/icons/` 에 추가하고 이 카탈로그에 등록한다.\n\n" +
          // 이 한 장이 대신 등재하는 이름들 — catalog-coverage 게이트가 이 선언을 읽는다.
          "@covers IcDocs · IcSupport · IcSnapshot · SettingsIcon",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/** 전체 — 이름과 함께. */
export const All: Story = {
  render: () => (
    <div className="flex items-center gap-8px" style={{ flexWrap: "wrap" }}>
      {[
        { name: "IcDocs", el: <IcDocs /> },
        { name: "IcSupport", el: <IcSupport /> },
        { name: "IcSnapshot", el: <IcSnapshot /> },
        { name: "SettingsIcon", el: <SettingsIcon /> },
      ].map((i) => (
        <div key={i.name} style={CELL}>
          {i.el}
          <span className="text-sm text-tertiary">{i.name}</span>
        </div>
      ))}
    </div>
  ),
};

/** 크기 4단 — `size` 를 받는 아이콘만. 4단 밖 값은 쓰지 않는다. */
export const SizeScale: Story = {
  render: () => (
    <div className="flex items-center gap-8px" style={{ flexWrap: "wrap" }}>
      {([24, 20, 16, 12] as const).map((s) => (
        <div key={s} style={CELL}>
          <div className="flex items-center gap-8px">
            <IcSnapshot size={s} />
            <SettingsIcon size={s} />
          </div>
          <span className="text-sm text-tertiary">{s}px</span>
        </div>
      ))}
    </div>
  ),
};

/** 전경색 상속 — 감싸는 요소의 색을 따른다(칩·버튼 안에서 톤을 함께 탄다). */
export const InheritsColor: Story = {
  render: () => (
    <div className="flex items-center gap-8px">
      <span className="flex items-center gap-6px text-status-error">
        <IcSnapshot size={16} /> <span className="text-base">critical 톤 안</span>
      </span>
      <span className="flex items-center gap-6px text-tertiary">
        <IcSnapshot size={16} /> <span className="text-base">기본 톤</span>
      </span>
    </div>
  ),
};
