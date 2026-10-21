import { ReactNode, useState } from "react";
import Sidebar, { MenuItem, ProjectContext, OrgContext } from "./Sidebar";

/**
 * DashboardLayout — Chrome layer. 좌측 240px [[Sidebar]] + 우측 컨텐츠 컬럼의 전체 셸.
 *
 * ## Purpose
 * WhaTap SaaS 화면의 최상위 골격. 좌측은 [[Sidebar]], 우측은 세로 스택으로
 * `header`(48px [[PageHeader]] 자리) → 그 아래 `main` + `children`(우측 위젯/패널)
 * 행으로 구성. AI 위젯(`children`, 예: [[WhaTapAiWidget]])은 `main` 과 같은 행에
 * 자리잡아 자체 width 애니메이션으로 밀고 들어옴.
 * Sidebar 의 모든 가변 데이터(`activeProduct`/`project`/`menu`/`org` 등)는 통과만
 * 시키고 기본값은 [[Sidebar]] 에 위임 — 빈 호출이면 K8s-GPU 컨텍스트가 default.
 *
 * ## When to use
 * - 사이드바 + 헤더 + 본문 + (선택) AI 위젯을 한 화면에 조합하는 모든 대시보드 라우트.
 * - AI 위젯 개폐에 따라 Sidebar 가 collapse 되어야 하는 화면.
 *
 * ## When NOT to use
 * - 사이드바·헤더가 없는 단독 페이지/모달 → 셸 없이 컴포넌트를 직접 배치.
 * - 좌측 네비만 필요 → [[Sidebar]] 단독 사용.
 *
 * ## Composition rules
 * - 공통 정책(feedback-widget-sidebar-collapse): 사이드바 접힘 = `widgetOpen || (사용자 chevron 접힘)`.
 *   위젯이 열리면 정책상 항상 80px(Min, 레일+아이콘 메뉴)로 강제 최소화하고, 위젯이 닫혔을
 *   땐 로고 헤더 chevron 으로 사용자가 자유롭게 접기/펴기(`defaultCollapsed`/`onCollapsedChange`).
 * - 공통 정책(feedback-page-header-invariant): `header` 는 위젯 행과 분리된 위쪽
 *   행이라 위젯 개폐와 무관하게 우측 컬럼 전폭을 유지 — 헤더는 절대 좁아지지 않음.
 * - `header`/`main`/`children` 슬롯만 주입. 레이아웃 구조(`flex` 골격)는 재구현 금지.
 * - 우측 위젯(`children`)은 자체 width 트랜지션을 가진 컴포넌트를 넣음([[WhaTapAiWidget]]).
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   widgetOpen={aiActive}
 *   activeProduct="gpu"
 *   header={<PageHeader title="K8s-GPU / GPU 트렌드" aiActive={aiActive} onAiToggle={toggle} />}
 *   main={<GpuTrendPage />}
 * >
 *   <WhaTapAiWidget open={aiActive} onClose={() => setAiActive(false)} />
 * </DashboardLayout>
 * ```
 */
export default function DashboardLayout({
  children,
  header,
  main,
  widgetOpen = false,
  defaultCollapsed = false,
  onCollapsedChange,
  activeProduct,
  project,
  menu,
  hideProjectSwitcher = false,
  org,
  onOrgClick,
  hideProductRail = false,
  hideUtilityBar = false,
  onProjectClick,
  footerText,
  onLogoClick,
}: {
  /** main 오른쪽(헤더 아래 같은 행)에 붙는 위젯 · 패널 — 예: [[WhaTapAiWidget]]. 폭 애니메이션은 자식이 소유. */
  children?: ReactNode;
  /** 우측 컬럼 최상단(48px PageHeader 자리). 위젯과 같은 행이 아니라 그 위 →
   *  widget이 열려도 헤더는 폭 변화 없이 우측 컬럼 전체를 차지(공통 정책:
   *  feedback-page-header-invariant). */
  header?: ReactNode;
  /** 헤더 아래, widget과 같은 행. widget이 열리면 width로 밀려 좁아짐. */
  main?: ReactNode;
  /** 우측 위젯이 열려 있는지 (기본 false). true 면 사용자 접힘 상태와 무관하게 Sidebar 를 강제로 접는다. */
  widgetOpen?: boolean;
  /**
   * 사용자 접힘 초기값(uncontrolled) — 로고 헤더 chevron 으로 스스로 min/max 전환.
   * 위젯이 열려 있으면(`widgetOpen`) 이 값과 무관하게 정책상 강제 collapse. 기본 false(펼침).
   */
  defaultCollapsed?: boolean;
  /** chevron 토글 시 사용자 접힘 의도(다음 상태)를 알림 — 소비자가 접힘 상태를 추적하고 싶을 때. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** [[Sidebar]] 로 그대로 넘긴다 — 제품 레일에서 강조할 제품 키 (예: "gpu" · "app"). 미지정 시 "gpu". */
  activeProduct?: string;
  /** [[Sidebar]] 로 그대로 넘긴다 — 상단 프로젝트 스위처에 보일 프로젝트 컨텍스트. 미지정 시 Sidebar 의 DEFAULT_PROJECT(예시 값) — 실제 화면은 반드시 넘긴다. */
  project?: ProjectContext;
  /** [[Sidebar]] 로 그대로 넘긴다 — 사이드 메뉴 항목 트리. 미지정 시 K8S_GPU_MENU. */
  menu?: MenuItem[];
  /**
   * Sidebar 상단 프로젝트 스위처 숨김 — Sidebar 로 passthrough.
   * 프로젝트 컨텍스트가 없는 화면(엔터프라이즈 설정 전, 계정/관리 영역)용. 기본 false.
   */
  hideProjectSwitcher?: boolean;
  /** Sidebar 상단 조직 스위처 — Sidebar 로 passthrough. `null`이면 숨김, 미지정이면 기본값. */
  org?: OrgContext | null;
  /** 조직 스위처 클릭 핸들러 — Sidebar 로 passthrough. */
  onOrgClick?: () => void;
  /** 좌측 제품 레일 숨김 — Sidebar 로 passthrough. 관리 콘솔 등 제품 네비 불필요 화면용. */
  hideProductRail?: boolean;
  /** [[Sidebar]] 로 그대로 넘긴다 — 레일 하단 유틸(테마·전체화면·홈)만 숨김. */
  hideUtilityBar?: boolean;
  /** [[Sidebar]] 로 그대로 넘긴다 — 프로젝트 스위처 클릭(앵커 계산은 화면의 몫). */
  onProjectClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** [[Sidebar]] 로 그대로 넘긴다 — 하단 저작권 문구 override. */
  footerText?: ReactNode;
  /** [[Sidebar]] 로 그대로 넘긴다 — 로고 클릭(랜딩이 따로 있는 제품에서만). */
  onLogoClick?: () => void;
}) {
  // 공통 정책 (feedback-widget-sidebar-collapse): 사이드바 접힘 = 위젯 강제 || 사용자 chevron 의도.
  //   위젯이 열리면 항상 collapse, 닫혔을 땐 chevron 이 소유하는 사용자 상태를 따름.
  // 공통 정책 (feedback-page-header-invariant): 헤더는 widget 행과 분리 → 영향 없음
  const [userCollapsed, setUserCollapsed] = useState(defaultCollapsed);
  const collapsed = widgetOpen || userCollapsed;
  const handleCollapsedChange = (next: boolean) => {
    setUserCollapsed(next);
    onCollapsedChange?.(next);
  };
  return (
    <div className="flex h-full w-full bg-bg">
      <Sidebar
        activeProduct={activeProduct}
        project={project}
        hideProjectSwitcher={hideProjectSwitcher}
        org={org}
        onOrgClick={onOrgClick}
        hideProductRail={hideProductRail}
        hideUtilityBar={hideUtilityBar}
        onProjectClick={onProjectClick}
        footerText={footerText}
        onLogoClick={onLogoClick}
        menu={menu}
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {header}
        <div className="flex flex-1 min-h-0">
          <main
            className="flex-1 min-w-0 overflow-auto"
            style={{ background: "var(--color-bg)" }}
          >
            {main}
          </main>
          {/* children은 우측에 자리잡는 위젯/패널(예: WhaTapAiWidget). 자체 width 애니메이션. */}
          {children}
        </div>
      </div>
    </div>
  );
}
