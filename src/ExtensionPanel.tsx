/**
 * ExtensionPanel — Composite. AI 대화 옆에 여는 콘텐츠 미리보기 패널.
 *
 * ## Purpose
 * AI 모드 대화 영역 우측에 보고서 프리뷰·상세 정보 등 보조 콘텐츠를 보여 주는 슬라이드 패널.
 * [[WhaTapAiWidget]] 이 «일반 페이지 위에 AI 위젯이 열리는 것» 이라면, ExtensionPanel 은
 * «AI 대화 옆에 콘텐츠가 열리는 것» 이다. 같은 [[DashboardLayout]] children 슬롯에 들어가되
 * 역할이 다르다.
 *
 * ## When to use
 * - AI 모드(`/whatap-ai-mode/*`) 에서 보고서 프리뷰, 상세 데이터, 차트 확대 등
 *   대화와 나란히 볼 보조 콘텐츠가 있을 때.
 * - 대화 흐름을 끊지 않으면서 콘텐츠를 펼쳐 보여야 할 때.
 *
 * ## When NOT to use
 * - AI 위젯 자체 → [[WhaTapAiWidget]].
 * - 독립 모달/다이얼로그 → [[Modal]].
 * - 목록 행 상세(추후) → Drawer.
 *
 * ## Composition rules
 * - 헤더 높이 40px 고정 (WhaTapAiWidget 헤더와 정렬).
 * - 색·경계는 시맨틱 토큰만 사용. 인라인 hex 금지.
 * - 본문은 `children` 으로 받는다. 내부 레이아웃을 강제하지 않는다.
 *
 * ## Spec
 * 레이아웃
 * - 기본 폭: 480px. 좌측 핸들을 드래그하여 320px ~ 720px 범위에서 조절 가능.
 * - `open` 이 false 면 0 으로 접힌다. 열릴 때는 `transition: width 0.4s ease-in-out`.
 * - 드래그 중에는 transition 을 끄고 포인터를 따라간다. 놓으면 transition 을 복원한다.
 * - 헤더: 40px. 타이틀 + 닫기 버튼. AI 그라데이션이 아닌 surface 배경.
 * - 본문: 스크롤 가능한 콘텐츠 영역. `children` 으로 자유 구성.
 * - 좌측 border 로 main 영역과 시각적으로 분리.
 * - DashboardLayout 의 children 슬롯에 WhaTapAiWidget 과 나란히 또는 단독으로 배치.
 *
 * @example
 * ```tsx
 * <ExtensionPanel
 *   open={previewOpen}
 *   title="보고서 미리보기"
 *   onClose={() => setPreviewOpen(false)}
 * >
 *   <ReportPreview name={reportName} />
 * </ExtensionPanel>
 * ```
 */
import { useCallback, useRef, useState, type ReactNode } from "react";

const DEFAULT_WIDTH = 480;
const MIN_WIDTH = 320;
const MAX_WIDTH = 720;

export type ExtensionPanelProps = {
  /** 패널 열림 여부. false 면 width 0 으로 접힌다. */
  open: boolean;
  /** 헤더에 표시할 타이틀. */
  title?: string;
  /** 닫기 버튼 클릭 핸들러. */
  onClose?: () => void;
  /** 패널 본문 콘텐츠. */
  children?: ReactNode;
  /** 헤더 우측에 추가할 액션 버튼 등. 닫기 버튼 왼쪽에 배치된다. */
  headerActions?: ReactNode;
  /** 초기 폭(px). 기본 480. */
  defaultWidth?: number;
  /** 최소 폭(px). 기본 320. */
  minWidth?: number;
  /** 최대 폭(px). 기본 720. */
  maxWidth?: number;
};

export default function ExtensionPanel({
  open,
  title = "미리보기",
  onClose,
  children,
  headerActions,
  defaultWidth = DEFAULT_WIDTH,
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
}: ExtensionPanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);

  /** 드래그 시작 시점의 마우스 X 와 패널 폭을 기억한다. */
  const dragRef = useRef({ startX: 0, startWidth: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: width };
      setDragging(true);

      const onPointerMove = (ev: PointerEvent) => {
        /* 패널은 우측이므로 마우스를 왼쪽으로 끌면 폭이 넓어진다. */
        const delta = dragRef.current.startX - ev.clientX;
        const next = Math.min(maxWidth, Math.max(minWidth, dragRef.current.startWidth + delta));
        setWidth(next);
      };

      const onPointerUp = () => {
        setDragging(false);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [width, minWidth, maxWidth],
  );

  return (
    <div
      className="shrink-0 overflow-hidden relative"
      style={{
        width: open ? width : 0,
        transition: dragging ? "none" : "width 0.4s ease-in-out",
      }}
    >
      {/* 좌측 리사이즈 핸들 — 드래그로 폭 조절 */}
      <div
        onPointerDown={onPointerDown}
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center"
        style={{
          width: 6,
          cursor: "col-resize",
          /* 드래그 중 핸들 강조 */
          backgroundColor: dragging ? "var(--color-brand-blue-bg-2)" : "transparent",
          transition: "background-color 0.15s",
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 3,
            height: 32,
            backgroundColor: dragging ? "var(--color-brand-blue)" : "var(--color-border-divider)",
            transition: "background-color 0.15s",
          }}
        />
      </div>

      <div
        className="flex flex-col h-full bg-card border-l border-color-var-color-border-default"
        style={{ width }}
      >
        {/* 헤더 40px — surface 배경. AI 위젯과 높이 정렬, 톤은 콘텐츠 성격. */}
        <div
          className="flex h-40px items-center px-16px shrink-0 w-full"
          style={{
            borderBottom: "1px solid var(--color-border-default)",
            background: "var(--color-surface-50)",
          }}
        >
          <span
            className="flex-1 min-w-0 text-lg font-bold text-primary truncate"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {title}
          </span>
          <div className="flex gap-8px items-center shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="패널 닫기"
              className="shrink-0 size-20px cursor-pointer hover-opacity-70 transition-opacity flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 본문 — 스크롤 가능 콘텐츠 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ padding: "20px 16px 16px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
