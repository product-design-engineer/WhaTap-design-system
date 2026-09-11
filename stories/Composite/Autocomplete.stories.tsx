import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete } from "@whatap/design-system";
import type { AutocompleteOption } from "@whatap/design-system";

/**
 * Stories for [[Autocomplete]] — 쳐서 좁히고 골라 넣는 단일 선택 입력.
 */
const meta: Meta<typeof Autocomplete> = {
  title: "Composite/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**후보가 많은 목록에서 하나를 집는 입력.** 입력 표면은 [[TextField]] 를 그대로 쓰고, 목록은 " +
          "트리거 아래 팝오버다. 고른 값을 컴포넌트가 기억하지 않는다 — `onSelect` 로 넘기고 끝이며, 고른 뒤 " +
          "입력에 무엇이 남을지는 그 화면이 정한다. 후보가 열 안팎이면 [[Select]], 묶음 헤더가 필요하면 " +
          "[[SelectPopover]] 다.",
      },
    },
  },
  argTypes: {
    options: { description: "후보 전체. 좁히기는 이 컴포넌트가 한다.", control: false },
    filter: { description: "`false` 면 좁히지 않는다 — 서버가 이미 걸러 준 목록.", control: false },
    openOnFocus: { description: "입력이 비어 있어도 후보를 펼칠지.", control: "boolean" },
    emptyText: { description: "좁힌 결과가 없을 때 목록 자리에 적을 문장.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Autocomplete>;

const ACCOUNTS: AutocompleteOption[] = [
  { value: "u-oh", label: "오경호", description: "kyungho.oh@whatap.io · 와탭랩스 / 플랫폼개발팀" },
  { value: "u-shin", label: "신동하", description: "dongha.shin@whatap.io · 와탭랩스 / 플랫폼개발팀" },
  { value: "u-kim", label: "김서준", description: "seojun.kim@whatap.io · 와탭랩스 / SRE" },
  { value: "u-lee", label: "이하늘", description: "haneul.lee@whatap.io · 와탭랩스 / 데이터팀" },
  { value: "u-park", label: "박지우", description: "jiwoo.park@whatap.io · 와탭랩스 / 데이터팀" },
  { value: "u-jung", label: "정민재", description: "minjae.jung@whatap.io · 와탭랩스 / 영업" },
];

/** 기본 — 계정 찾아 추가. 고르면 입력을 비우고 이어서 다음 사람을 친다. */
export const Default: Story = {
  render: () => {
    const [q, setQ] = useState("");
    const [picked, setPicked] = useState<string[]>([]);
    return (
      <div style={{ width: 420 }}>
        <Autocomplete
          label="계정"
          value={q}
          onChange={setQ}
          options={ACCOUNTS.filter((o) => !picked.includes(o.value))}
          onSelect={(o) => {
            setPicked((prev) => [...prev, o.value]);
            setQ("");
          }}
          placeholder="이름 · 이메일로 찾기"
          emptyText="추가할 수 있는 계정이 없습니다"
        />
        <p className="text-base text-tertiary mt-8px">
          {picked.length ? `추가된 계정 ${picked.length}` : "아직 추가된 계정이 없습니다"}
        </p>
      </div>
    );
  },
};

/** 값 하나를 확정하는 자리 — 고른 라벨을 입력에 채워 둔다. */
export const FillsInput: Story = {
  render: () => {
    const [q, setQ] = useState("");
    return (
      <div style={{ width: 420 }}>
        <Autocomplete
          label="담당자"
          value={q}
          onChange={setQ}
          options={ACCOUNTS}
          onSelect={(o) => setQ(o.label)}
          placeholder="이름으로 찾기"
        />
      </div>
    );
  },
};

/** 보조 값 없이 — 라벨만으로 갈리는 짧은 후보. 행 높이가 한 줄로 줄어든다. */
export const LabelOnly: Story = {
  render: () => {
    const [q, setQ] = useState("");
    return (
      <div style={{ width: 320 }}>
        <Autocomplete
          value={q}
          onChange={setQ}
          options={["서울", "부산", "대전", "대구", "광주", "인천"].map((c) => ({ value: c, label: c }))}
          onSelect={(o) => setQ(o.label)}
          placeholder="도시"
        />
      </div>
    );
  },
};
