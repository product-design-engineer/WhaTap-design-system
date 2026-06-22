import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "@whatap/design-system";

/**
 * Stories for [[Toast]] — 시스템 수준 알림 (상단 중앙 fixed, 자동 dismiss).
 */
const meta: Meta<typeof Toast> = {
  title: "Primitives/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**시스템 수준 알림.** 화면 상단 중앙 fixed, slide-down 진입 애니메이션, 4.5s 후 자동 dismiss. " +
          "4 variant (success/info/warning/error) + 선택적 action 버튼 + 닫기 버튼. AI 위젯 안의 결과 메시지와 " +
          "정보 중복을 피하기 위해 짧은 한 줄만 표시.",
      },
    },
  },
  argTypes: {
    open: {
      description: "true 면 화면에 노출. false 면 unmount.",
      control: "boolean",
    },
    variant: {
      description: "톤 variant — success(녹색)/info(파랑)/warning(주황)/error(빨강).",
      control: { type: "radio" },
      options: ["success", "info", "warning", "error"],
    },
    message: {
      description: "한 줄 메시지 — 짧을수록 좋음.",
      control: "text",
    },
    actionLabel: {
      description: "action 버튼 라벨 (옵션). 미지정 시 버튼 안 보임.",
      control: "text",
    },
    durationMs: {
      description: "자동 dismiss 시간 (ms). 0이면 수동 닫기만.",
      control: { type: "number", min: 0, max: 30000, step: 500 },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

/** Success — 알림 규칙 등록 완료 등 성공 시나리오. */
export const Success: Story = {
  args: {
    open: true,
    variant: "success",
    message: "알림 규칙이 등록되었습니다.",
    actionLabel: "보기",
    durationMs: 0, // Storybook 에선 자동 dismiss 끔 (수동 검수)
  },
};

/** Info — 정보 안내. */
export const Info: Story = {
  args: {
    open: true,
    variant: "info",
    message: "새 메시지가 도착했습니다.",
    durationMs: 0,
  },
};

/** Warning — 주의 알림. */
export const Warning: Story = {
  args: {
    open: true,
    variant: "warning",
    message: "디스크 사용량 80% 초과 — 모니터링 권장.",
    actionLabel: "확인",
    durationMs: 0,
  },
};

/** Error — 실패/오류. */
export const Error: Story = {
  args: {
    open: true,
    variant: "error",
    message: "규칙 등록 실패 — 권한 부족.",
    actionLabel: "재시도",
    durationMs: 0,
  },
};

/** Action 없음 — 단순 알림. */
export const MessageOnly: Story = {
  args: {
    open: true,
    variant: "success",
    message: "변경사항이 저장되었습니다.",
    durationMs: 0,
  },
};

/** 인터랙티브 — 자동 dismiss 4.5s 시연. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "1px solid #296CF2",
              background: "#fff",
              color: "#296CF2",
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Toast 띄우기 (4.5s 자동 dismiss)
          </button>
          <Toast
            open={open}
            variant="success"
            message="알림 규칙이 등록되었습니다."
            actionLabel="보기"
            onAction={() => console.log("clicked action")}
            onClose={() => setOpen(false)}
            durationMs={4500}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
