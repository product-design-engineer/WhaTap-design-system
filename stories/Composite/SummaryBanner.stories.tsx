import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiSummaryBanner, Chip } from "@whatap/design-system";
import { AiAssistantButton } from "@whatap/design-system/widget";

/**
 * Stories for [[AiSummaryBanner]] — 화면 상단 40px AI 요약 배너(슬롯 구조).
 *
 * 화면 진입 직후 AI 가 스스로 돌린 점검 결과를 알리고 심층 분석(위젯 전환)으로 유도한다.
 * 내용은 전부 슬롯(symbol · children · summary · tags · actions)으로 주입한다.
 */

const meta: Meta<typeof AiSummaryBanner> = {
  title: "Composite/SummaryBanner",
  component: AiSummaryBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**화면 상단 40px AI 요약 배너.** 진입 후 `revealDelayMs`(기본 1000ms) 뒤 슬라이드-인 — " +
          "화면이 먼저 그려지고 나서 AI 가 결과를 내놓은 것처럼 시간차를 만든다.\n\n" +
          "**슬롯**\n" +
          "- `symbol` — 좌측 심볼. 기본 회전 AI 심볼(16px). `null` 로 제거\n" +
          "- `children` — 주 문장(한 줄)\n" +
          "- `summary` — 보조 카운트 (예: `주의 2 · 관찰 1 · 정상 3`)\n" +
          "- `tags` — [[Chip]] 판정 칩 나열\n" +
          "- `actions` — 주 실행. [[AiAssistantButton]] `size=\"sm\"`(24px) 권장 — 40px 안에 여유를 남긴다\n" +
          "- `onClose` — 지정 시 우측 × 노출\n\n" +
          "**규격:** 높이 40px 고정(패딩이 아니라 height). 슬롯 내용이 커져도 늘어나지 않는다. " +
          "높이를 0 → 40 으로 트랜지션하므로 아래 콘텐츠를 밀어내며 등장하고 덮지 않는다.\n\n" +
          "**tone:** `info`(기본, 정보성 표면 토큰) / `neutral`(무채색 표면 토큰).\n\n" +
          "**언제 쓰지 않는가:** 실행 완료 확인은 [[Toast]], AI 사용 불가 안내는 [[AiUnavailableNotice]].",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

const WARN_TAGS = (
  <>
    <Chip variant="soft" tone="warning" size="sm">응답시간 21.7s 스파이크</Chip>
    <Chip variant="soft" tone="warning" size="sm">Apdex 70.74 Fair</Chip>
    <Chip variant="soft" tone="neutral" size="sm">히트맵 경고 21건</Chip>
  </>
);

/** 기본 — APM 헬스체크. 1초 뒤 등장(스토리 진입 후 잠시 대기). */
export const Default: Story = {
  args: {
    children: "최근 1시간 헬스체크를 WhaTap AI가 분석했습니다",
    summary: "주의 2 · 관찰 1 · 정상 3",
    tags: WARN_TAGS,
    actions: <AiAssistantButton size="sm">심층 분석하기</AiAssistantButton>,
  },
};

/** 지연 없이 즉시 노출 — 스크린샷/시각 회귀 테스트용. */
export const NoDelay: Story = {
  args: { ...Default.args, revealDelayMs: 0 },
};

/** 정상만 — 판정 칩이 없을 때. 실행은 유지해 심층 분석 진입을 남긴다. */
export const AllNormal: Story = {
  args: {
    revealDelayMs: 0,
    children: "최근 1시간 헬스체크를 WhaTap AI가 분석했습니다",
    summary: "정상 6",
    actions: <AiAssistantButton size="sm">자세히 보기</AiAssistantButton>,
  },
};

/** 칩이 많은 경우 — 좁은 폭에서 tags 슬롯이 잘린다(주 문장·실행은 보존). */
export const ManyTags: Story = {
  args: {
    revealDelayMs: 0,
    children: "최근 1시간 헬스체크를 WhaTap AI가 분석했습니다",
    summary: "주의 5 · 관찰 3",
    tags: (
      <>
        <Chip variant="soft" tone="critical" size="sm">에러율 2.49%</Chip>
        <Chip variant="soft" tone="warning" size="sm">응답시간 21.7s</Chip>
        <Chip variant="soft" tone="warning" size="sm">Apdex 70.74</Chip>
        <Chip variant="soft" tone="warning" size="sm">CPU 69.6%</Chip>
        <Chip variant="soft" tone="neutral" size="sm">힙 230MiB</Chip>
        <Chip variant="soft" tone="neutral" size="sm">TPS 206.5</Chip>
      </>
    ),
    actions: <AiAssistantButton size="sm">심층 분석하기</AiAssistantButton>,
  },
};

/** 무채색 톤 — 정보성 강조가 과한 화면에서. */
export const NeutralTone: Story = {
  args: { ...Default.args, revealDelayMs: 0, tone: "neutral" },
};

/** 심볼 제거 — 이미 화면에 AI 브랜딩이 강한 경우. */
export const NoSymbol: Story = {
  args: { ...Default.args, revealDelayMs: 0, symbol: null },
};

/** 닫기 동작 — × 클릭 시 소비 측이 언마운트한다(배너는 상태를 갖지 않음). */
export const Closable: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col">
        {open && (
          <AiSummaryBanner
            revealDelayMs={0}
            summary="주의 2 · 관찰 1 · 정상 3"
            tags={WARN_TAGS}
            actions={<AiAssistantButton size="sm">심층 분석하기</AiAssistantButton>}
            onClose={() => setOpen(false)}
          >
            최근 1시간 헬스체크를 WhaTap AI가 분석했습니다
          </AiSummaryBanner>
        )}
        <div className="p-12px">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-base text-brand-blue cursor-pointer"
            style={{ background: "transparent", border: 0 }}
          >
            배너 다시 표시
          </button>
        </div>
      </div>
    );
  },
};
