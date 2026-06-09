import { ReactNode } from "react";
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
 * - 공통 정책(feedback-widget-sidebar-collapse): `widgetOpen` 을 [[Sidebar]] 의
 *   `collapsed` 로 그대로 전달 — 위젯이 열리면 사이드바가 40px 로 최소화.
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
  activeProduct,
  project,
  menu,
  hideProjectSwitcher = false,
  org,
  onOrgClick,
  hideProductRail = false,
}: {
  children?: ReactNode;
  /** 우측 컬럼 최상단(48px PageHeader 자리). 위젯과 같은 행이 아니라 그 위 →
   *  widget이 열려도 헤더는 폭 변화 없이 우측 컬럼 전체를 차지(공통 정책:
   *  feedback-page-header-invariant). */
  header?: ReactNode;
  /** 헤더 아래, widget과 같은 행. widget이 열리면 width로 밀려 좁아짐. */
  main?: ReactNode;
  widgetOpen?: boolean;
  activeProduct?: string;
  project?: ProjectContext;
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
}) {
  // 공통 정책 (feedback-widget-sidebar-collapse): 위젯이 열리면 사이드바 최소화
  // 공통 정책 (feedback-page-header-invariant): 헤더는 widget 행과 분리 → 영향 없음
  return (
    <div className="flex h-full w-full bg-white">
      <Sidebar
        activeProduct={activeProduct}
        project={project}
        hideProjectSwitcher={hideProjectSwitcher}
        org={org}
        onOrgClick={onOrgClick}
        hideProductRail={hideProductRail}
        menu={menu}
        collapsed={widgetOpen}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {header}
        <div className="flex flex-1 min-h-0">
          <main
            className="flex-1 min-w-0 overflow-auto"
            style={{ background: "#fff" }}
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
