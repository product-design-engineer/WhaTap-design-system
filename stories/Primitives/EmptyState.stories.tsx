import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, EmptyState } from "@whatap/design-system";

/**
 * Stories for [[EmptyState]] — 목록 · 표가 보여 줄 것이 없을 때 그 자리에 서는 덩어리.
 *
 * 두 갈래를 갈라 쓰는 것이 이 컴포넌트의 전부다. «아직 없다» 와 «좁혀서 없다» 는 사람이 할
 * 일이 다르므로 문장도 버튼도 갈린다.
 */
const meta: Meta<typeof EmptyState> = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**빈 상태 primitive.** 가운데 정렬 · 테두리 없음 · 아이콘 없음이 기본. " +
          "`title` 은 무엇이 없는지까지 적고, `description` 은 그래서 무엇을 하면 되는지를 적는다. " +
          "불러오다 실패한 것은 빈 상태가 아니라 오류이므로 `Notice tone=\"critical\"` 을 쓴다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

/** 좁혀서 없다 — 조건을 푸는 버튼이 선다. */
export const Filtered: Story = {
  args: {
    title: "필터 조건에 맞는 계정이 없습니다",
    description: "조건을 넓히면 다시 나타납니다.",
    action: (
      <Button variant="outline" size="md">
        필터 해제
      </Button>
    ),
  },
};

/** 아직 없다 — 만드는 버튼이 선다. */
export const Empty: Story = {
  args: {
    title: "추가된 계정이 없습니다",
    description: "조직 · 그룹을 이으면 그 안의 계정이 한 번에 들어옵니다.",
    action: (
      <Button variant="outline" size="md">
        계정 추가
      </Button>
    ),
  },
};

/** 문장만. 행동이 없는 자리(읽기 전용 표)에서는 버튼을 세우지 않는다. */
export const TitleOnly: Story = {
  args: { title: "이번 주기에 쓴 기록이 없습니다" },
};

/** 좁은 칸 — 모달 · 패널에서는 세로 여백을 줄인다. */
export const Small: Story = {
  args: {
    size: "sm",
    title: "추가할 수 있는 조직이 없습니다",
    description: "모든 조직이 이미 이어져 있습니다.",
  },
};
