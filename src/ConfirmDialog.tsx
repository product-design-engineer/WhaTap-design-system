/**
 * ConfirmDialog — 실행 직전에 «대상과 결과» 를 되읽어 주는 확인 모달. Composite layer.
 *
 * ## Purpose
 * `docs/patterns.md` P1 「위험한 실행 확인」 을 컴포넌트로 굳힌 것이다. 그동안 P1 은 문서와 예시 코드로만 있어서
 * 화면마다 [[Modal]] + [[Button]] 을 손으로 짰고, 그러다 보면 실행 버튼이 본문에 들어가거나 라벨이 「확인」 이
 * 되거나 대상을 적지 않는 식으로 규칙이 하나씩 빠졌다. 규칙을 문서가 아니라 구조가 지키게 한다.
 *
 * 모달 본문은 실행 이름을 반복하는 자리가 아니라 **무엇을(target) · 그래서 무엇이 바뀌나(outcomes)** 를 적는 자리다.
 *
 * ## When to use
 * - 되돌릴 수 없거나 다른 사람에게 영향이 가는 실행 직전 (삭제 · 해지 · 플랜에서 제외 · 초기화)
 * - 돈이 걸린 약정을 만드는 실행 직전 — 이때는 `tone="primary"` 로 쓰고 `children` 에 방금 정한 값을 되읽는다
 *
 * ## When NOT to use
 * - 되돌릴 수 있는 가벼운 실행(필터 해제 · 정렬 · 탭 이동) → 확인을 붙이지 않는다. 되돌리기는 [[Toast]] `actionLabel`
 * - 자주 반복하는 일에 매번 걸지 않는다 → 사람이 확인 창을 읽지 않고 닫는 습관이 생기고, 정말 중요한 확인까지 무뎌진다
 * - AI 위젯 안 → 위젯은 제안까지다. 실행과 확인은 페이지가 받는다
 * - 입력을 받는 폼 → [[Modal]] 을 직접 쓴다. 이 컴포넌트는 «되읽기와 실행» 만 한다
 *
 * ## Composition rules
 * - **확인 버튼 라벨은 동작 낱말이다**(`삭제` · `제외` · `플랜 만들기`). 「확인」 · 「예」 를 쓰지 않는다 — 버튼만 읽고
 *   누르는 사람이 틀리지 않아야 한다
 * - **`target` 에 대상을 적는다.** 목록에서 골라 실행하는 흐름에서 「정말 하시겠습니까?」 만으로는 어느 행인지 모른다
 * - `outcomes` 는 «그 결과» 한 줄씩. 되돌릴 수 없는 결과는 `tone: "critical"` 로 칠한다. 결과가 상황마다 갈리면
 *   부르는 쪽이 문장을 고른다(예: 다른 플랜에도 있으면 「계속 씁니다」, 없으면 「더 이상 쓸 수 없습니다」)
 * - 실행 버튼은 언제나 footer 오른쪽 끝, 물러나는 버튼은 그 왼쪽의 텍스트 버튼이다. 본문에 버튼을 두지 않는다
 * - 배경 클릭 · Esc 로 닫히는 것을 막지 않는다 — 실수로 닫히는 것은 안전한 결과다
 * - 완료는 [[Toast]] 로 알리고, 되돌릴 수 있으면 토스트에 「되돌리기」 를 싣는다(P2)
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={!!target}
 *   title="플랜에서 제외"
 *   target={<><strong>김서연</strong> kim@whatap.io 을 운영팀 플랜에서 제외합니다.</>}
 *   outcomes={[
 *     { text: "이 계정은 더 이상 AI 를 쓸 수 없습니다.", tone: "critical" },
 *     { text: "이번 주기에 쓴 4,960 크레딧은 이 플랜 청구서에 그대로 실립니다." },
 *   ]}
 *   confirmLabel="제외"
 *   onConfirm={remove}
 *   onClose={() => setTarget(null)}
 * />
 * ```
 */
import type { ReactNode } from "react";
import Modal, { type ModalSize } from "./Modal";
import Button from "./Button";

export type ConfirmDialogTone = "critical" | "primary";

export type ConfirmDialogOutcome = {
  text: ReactNode;
  /** `critical` 은 되돌릴 수 없는 결과. 기본은 보조 글자색이다. */
  tone?: "default" | "critical";
};

export type ConfirmDialogProps = {
  open: boolean;
  /** 실행 이름. 「알림 규칙 삭제」 · 「플랜에서 제외」 처럼 무엇을 하는 모달인지. */
  title: ReactNode;
  /** 무엇을 — 대상을 이름 그대로 적는 한 문장. */
  target?: ReactNode;
  /** 그래서 무엇이 바뀌나 — 한 줄씩. */
  outcomes?: ConfirmDialogOutcome[];
  /** 되읽기 값처럼 문장으로 담기 어려운 것. target · outcomes 사이에 선다. */
  children?: ReactNode;
  /** 실행 버튼 라벨. 동작 낱말이어야 한다(「확인」 금지). */
  confirmLabel: string;
  /** 물러나는 버튼 라벨. 기본 「취소」. 고치러 돌아가는 흐름이면 「돌아가서 고치기」. */
  cancelLabel?: string;
  /** `critical` = 되돌릴 수 없는 실행(기본), `primary` = 약정 · 생성처럼 무겁지만 파괴는 아닌 실행. */
  tone?: ConfirmDialogTone;
  /** 실행 중(비동기). 실행 버튼이 로딩으로 바뀐다. */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** 기본 `sm`. 되읽을 값이 많으면 `md`. */
  size?: ModalSize;
};

export default function ConfirmDialog({
  open,
  title,
  target,
  outcomes,
  children,
  confirmLabel,
  cancelLabel = "취소",
  tone = "critical",
  loading,
  onConfirm,
  onClose,
  size = "sm",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button variant="basic" tone="tertiary" size="lg" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="contained" tone={tone} size="lg" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-12px">
        {target && <p className="text-base text-primary">{target}</p>}
        {children}
        {outcomes && outcomes.length > 0 && (
          <ul className="flex flex-col gap-6px">
            {outcomes.map((o, i) => (
              <li key={i} className={`text-base ${o.tone === "critical" ? "text-status-error" : "text-secondary"}`}>
                {o.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
