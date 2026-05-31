import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal, Button, TextField, Select } from "@whatap/design-system";

/**
 * Stories for [[Modal]] — Primitives overlay dialog.
 *
 * 3 채널 닫기(× / ESC / backdrop), Portal, focus 이동, body scroll lock.
 */
const meta: Meta<typeof Modal> = {
  title: "Primitives/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**Overlay dialog primitive.** Portal 로 body 에 마운트, ARIA dialog 패턴, 3 채널 닫기. " +
          "위젯에서는 사용 금지 — 페이지 컨텍스트 한정 (`feedback_widget_readonly_policy`).",
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    title: { control: "text" },
    description: { control: "text" },
    hideCloseButton: { control: "boolean" },
    disableBackdropClose: { control: "boolean" },
    disableEscClose: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const TriggerWrap = ({ children: trigger }: { children: (open: () => void) => React.ReactNode }) => {
  return <>{trigger(() => {})}</>;
};

/** 기본 — md 사이즈 + title + 본문. */
export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>모달 열기</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="알림 규칙 적용">
            <p>이 룰을 등록하시겠습니까?</p>
            <p className="mt-2 text-sm text-secondary">
              디스크 사용률 95% 초과 시 Critical 알림이 발생합니다. 적용 후에도 룰 편집에서 수정
              가능합니다.
            </p>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 사이즈 비교 (sm 400 / md 560 / lg 720). */
export const Sizes: Story = {
  render: () => {
    const Demo = () => {
      const [which, setWhich] = useState<null | "sm" | "md" | "lg">(null);
      return (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setWhich("sm")}>sm (400px)</Button>
          <Button onClick={() => setWhich("md")}>md (560px)</Button>
          <Button onClick={() => setWhich("lg")}>lg (720px)</Button>
          {which && (
            <Modal
              open
              onClose={() => setWhich(null)}
              size={which}
              title={`사이즈 ${which}`}
              description={`width: ${which === "sm" ? 400 : which === "md" ? 560 : 720}px`}
            >
              <p>각 사이즈의 시각 비례를 확인하세요.</p>
            </Modal>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

/** title + description + footer 액션. */
export const Confirmation: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button tone="critical" onClick={() => setOpen(true)}>
            룰 삭제
          </Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            size="sm"
            title="룰을 삭제하시겠습니까?"
            description="이 작업은 되돌릴 수 없습니다. 룰에 묶인 변경 이력은 보존됩니다."
            footer={
              <>
                <Button variant="basic" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button
                  variant="contained"
                  tone="critical"
                  onClick={() => {
                    setOpen(false);
                    // 실제 삭제 호출
                  }}
                >
                  삭제
                </Button>
              </>
            }
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 입력 폼 + footer — 실제 사용 패턴. */
export const FormDialog: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      const [name, setName] = useState("disk-usage-95-prod-var-log");
      const [threshold, setThreshold] = useState("95");
      const [severity, setSeverity] = useState("critical");
      return (
        <div>
          <Button onClick={() => setOpen(true)}>룰 편집</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            size="md"
            title="룰 편집"
            description="메트릭·임계값·심각도를 조정합니다."
            footer={
              <>
                <Button variant="basic" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button variant="contained" onClick={() => setOpen(false)}>
                  저장
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-3">
              <TextField size="md" label="룰 이름" fullWidth value={name} onChange={setName} clearable />
              <TextField
                size="md"
                label="임계값"
                fullWidth
                type="number"
                value={threshold}
                onChange={setThreshold}
                trailingNode={<span className="text-sm">%</span>}
                helperText="이 값을 초과하면 알림 발생"
              />
              <Select
                label="심각도"
                fullWidth
                value={severity}
                onChange={setSeverity}
                options={[
                  { value: "critical", label: "Critical" },
                  { value: "warning", label: "Warning" },
                  { value: "info", label: "Info" },
                ]}
              />
            </div>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};

/** hideCloseButton — × 버튼 숨김 (footer 액션으로만 닫는 강제 confirmation). */
export const NoCloseButton: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>약관 동의 (필수)</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            size="sm"
            hideCloseButton
            disableBackdropClose
            disableEscClose
            title="필수 약관 동의"
            description="이 페이지를 사용하려면 약관에 동의해야 합니다."
            footer={
              <Button variant="contained" onClick={() => setOpen(false)}>
                동의하고 계속
              </Button>
            }
          >
            <p>×/ESC/backdrop 모두 비활성. footer 액션으로만 닫힘.</p>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 긴 본문 — 내부 스크롤 (maxHeight 100vh - 32px). */
export const LongContent: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>긴 본문 모달</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            size="md"
            title="변경 이력"
            description="이 룰의 30일 변경 audit log"
            footer={
              <Button variant="basic" onClick={() => setOpen(false)}>
                닫기
              </Button>
            }
          >
            <ul className="flex flex-col gap-2">
              {Array.from({ length: 40 }, (_, i) => (
                <li key={i} className="border-b border-[color:var(--color-border-soft)] pb-2 text-sm">
                  <strong>2026-05-{(i + 1).toString().padStart(2, "0")}</strong> · 박운영 — 임계값
                  변경 ({90 + (i % 10)}% → {91 + (i % 10)}%)
                </li>
              ))}
            </ul>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};

/** title 없는 단순 본문. */
export const Untitled: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>title 없는 모달</Button>
          <Modal open={open} onClose={() => setOpen(false)} size="sm">
            <p className="text-base">간단한 안내. 별도 헤더 없이 본문만.</p>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};
