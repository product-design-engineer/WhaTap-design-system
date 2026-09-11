import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstanceSelectPanel, type InstanceSelectScope } from "@whatap/design-system";

/**
 * Stories for [[InstanceSelectPanel]] — 인스턴스 선택 드롭다운 패널.
 */
const meta: Meta<typeof InstanceSelectPanel> = {
  title: "Composite/InstanceSelectPanel",
  component: InstanceSelectPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**찾기 → 고르기 순서를 위에서 아래로 세운 패널.** 범위 탭 · 검색 · 전체 개수 · 비활성 포함 · 목록. " +
          "`items` 는 원본을 준다 — 검색어와 비활성 판정은 패널이 하고, 그래야 「전체 N」 과 목록이 어긋나지 않는다. " +
          "위치는 정하지 않는다(absolute 배치는 호출측). [[OptionbarInstanceSelector]] 가 여는 내용물이다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InstanceSelectPanel>;

const ITEMS = [
  { name: "dmx-3-11" },
  { name: "DMX-centos7-2-39" },
  { name: "DMX-OEL92-1", status: "idle" as const },
  { name: "dmx-rac19-1", cluster: true },
  { name: "dmx-rac19-2", cluster: true },
];

/** 기본 — 비활성은 숨긴 상태. */
export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState("dmx-rac19-1");
    const [scope, setScope] = useState<InstanceSelectScope>("all");
    const [query, setQuery] = useState("");
    const [showIdle, setShowIdle] = useState(false);
    return (
      <InstanceSelectPanel
        items={ITEMS}
        selected={selected}
        onSelect={setSelected}
        scope={scope}
        onScopeChange={setScope}
        query={query}
        onQueryChange={setQuery}
        showIdle={showIdle}
        onShowIdleChange={setShowIdle}
      />
    );
  },
};

/** 클러스터 범위 — 클러스터 소속만 남는다. */
export const ClusterScope: Story = {
  render: () => {
    const [selected, setSelected] = useState("dmx-rac19-1");
    return (
      <InstanceSelectPanel items={ITEMS} selected={selected} onSelect={setSelected} scope="cluster" />
    );
  },
};

/** 검색 결과 없음. */
export const NoMatch: Story = {
  render: () => <InstanceSelectPanel items={ITEMS} query="oracle-none" />,
};
