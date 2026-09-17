import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip, ListRow } from "@whatap/design-system";

/**
 * Stories for [[ListRow]] — 목록의 «한 건» 이 서는 카드 줄.
 */
const meta: Meta<typeof ListRow> = {
  title: "Primitives/ListRow",
  component: ListRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**레코드 하나를 한 줄에 담는다.** 왼쪽이 이름(+ 성격 뱃지)과 보조 한 줄, 오른쪽이 " +
          "메타(시각 · 상태)다. 열을 세로로 비교할 일이 없는 목록 — 건마다 길이가 제각각이고 " +
          "보조 줄이 있다 없다 하는 목록 — 을 위한 자리다. 값을 견주는 목록은 [[DataTable]] 이고, " +
          "그걸 줄로 그리면 빈 칸이 열마다 생겨 사람이 「값이 없음」으로 읽는다. " +
          "**상태를 제목에 섞지 않는다** — 그건 `meta` 의 [[Chip]] 이 진다. " +
          "`onClick` 이 없으면 hover 표식도 커서도 주지 않는다.",
      },
    },
  },
  argTypes: {
    title: { description: "그 건의 이름. 상태를 섞지 않는다.", control: "text" },
    description: { description: "보조 한 줄 — 기간 · 대상. 넘치면 말줄임.", control: "text" },
    selected: { description: "지금 열려 있는 건.", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof ListRow>;

const META = (
  <>
    <span className="text-sm text-tertiary font-numeric tabular-nums">2026-06-01 09:00</span>
    <Chip tone="success" variant="soft" size="md">생성 완료</Chip>
  </>
);

/** 기본 — 유형 뱃지가 이름 옆, 시각과 상태가 반대쪽 끝. */
export const Default: Story = {
  args: {
    title: "주간 통합 운영 보고서 (5/26–6/1)",
    badge: <Chip tone="primary" variant="soft" size="sm">AI</Chip>,
    description: "2026-05-26 ~ 2026-06-01 · 대상 api-gateway, payment-core, prod-db",
    meta: META,
    onClick: () => {},
  },
};

/** 선택된 건 — 목록과 상세가 같은 화면에 있을 때만 쓴다. */
export const Selected: Story = {
  args: { ...Default.args, selected: true },
};

/** 누를 수 없는 줄 — 커서도 hover 표식도 없다. 반응하는 것처럼 보이는데 아무 일도 안 나는 줄이 가장 나쁘다. */
export const NotClickable: Story = {
  args: {
    title: "월간 경영 보고서 (6월)",
    badge: <Chip tone="neutral" variant="soft" size="sm">정기</Chip>,
    description: "2026-06-01 ~ 2026-06-30 · 대상 전체 프로젝트",
    meta: <Chip tone="warning" variant="soft" size="md">예약</Chip>,
  },
};

/** 목록으로 쌓은 모양 — 제목 길이가 제각각이어도 줄이 무너지지 않는다. */
export const Stacked: Story = {
  render: () => (
    <div className="flex flex-col gap-8px">
      <ListRow
        title="주간 통합 운영 보고서 (5/26–6/1)"
        badge={<Chip tone="primary" variant="soft" size="sm">AI</Chip>}
        description="2026-05-26 ~ 2026-06-01 · 대상 api-gateway, payment-core, prod-db"
        meta={META}
        onClick={() => {}}
      />
      <ListRow
        title="결제플랫폼 경고 급증 원인 분석"
        badge={<Chip tone="primary" variant="soft" size="sm">AI</Chip>}
        description="2026-06-03 14:00 ~ 18:00 · 대상 payment-core, k8s-cluster"
        meta={<Chip tone="primary" variant="soft" size="md">생성 중</Chip>}
        onClick={() => {}}
      />
      <ListRow
        title="인프라 점검 보고서 (수동 작성)"
        badge={<Chip tone="neutral" variant="soft" size="sm">정기</Chip>}
        description="2026-05-30 · 대상 infra-nodes"
        meta={<Chip tone="success" variant="soft" size="md">작성 완료</Chip>}
        onClick={() => {}}
      />
    </div>
  ),
};
