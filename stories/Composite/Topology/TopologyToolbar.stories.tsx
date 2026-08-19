import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyToolbar, type TopologyDirection } from "@whatap/design-system";

/**
 * Stories for [[TopologyToolbar]] — 토폴로지 화면의 조회 조건 행.
 *
 * 전부 **controlled** 다. 툴바가 자기 안에 상태 사본을 들면 캔버스와 다른 조건을 보여주게
 * 되므로, 상태는 페이지 한 곳(=`Shell/Page/TopologyOverview`)이 소유한다.
 * 편집 모드는 즉시 반영되는 설정이라 [[Switch]] 다(patterns P3).
 */
const meta: Meta<typeof TopologyToolbar> = {
  title: "Composite/Topology/TopologyToolbar",
  component: TopologyToolbar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof TopologyToolbar>;

const METRICS = [
  { value: "tps", label: "TPS" },
  { value: "rt", label: "응답시간" },
  { value: "err", label: "에러율" },
];

/** 기본 — 페이지가 상태를 들고 있는 형태 그대로. */
export const Default: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState(false);
    const [metric, setMetric] = useState("tps");
    const [direction, setDirection] = useState<TopologyDirection>("out");
    return (
      <TopologyToolbar
        query={query}
        onQueryChange={setQuery}
        editing={editing}
        onEditingChange={setEditing}
        metric={metric}
        onMetricChange={setMetric}
        metricOptions={METRICS}
        direction={direction}
        onDirectionChange={setDirection}
        onReset={() => {
          setQuery("");
          setMetric("tps");
          setDirection("out");
          setEditing(false);
        }}
      />
    );
  },
};

/** 검색어가 있고 편집 모드가 켜진 상태. */
export const Filtered: Story = {
  render: () => {
    const [query, setQuery] = useState("redis");
    const [editing, setEditing] = useState(true);
    const [metric, setMetric] = useState("rt");
    const [direction, setDirection] = useState<TopologyDirection>("in");
    return (
      <TopologyToolbar
        query={query}
        onQueryChange={setQuery}
        editing={editing}
        onEditingChange={setEditing}
        metric={metric}
        onMetricChange={setMetric}
        metricOptions={METRICS}
        direction={direction}
        onDirectionChange={setDirection}
        onReset={() => setQuery("")}
      />
    );
  },
};
