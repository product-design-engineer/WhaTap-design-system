import { ReactNode } from "react";
import Sidebar, { MenuItem, ProjectContext, OrgContext } from "./Sidebar";

/**
 * Dashboard chrome — WhaTap 좌측 240px Sidebar + 우측 컨텐츠.
 *
 * Sidebar는 자체 헤더(로고/검색/접기)를 가지므로 grid에서 별도 header row를
 * 두지 않습니다. 컨텐츠는 `children` 또는 `main` prop으로 주입합니다.
 *
 * Sidebar의 모든 가변 데이터(activeProduct, project, menu)는 prop으로 통과만
 * 시키고 기본값은 Sidebar 쪽에 위임 — 빈 호출이면 K8s-GPU 컨텍스트가 default.
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
