/**
 * Sidebar — Chrome layer. WhaTap SaaS 좌측 240px 네비게이션 사이드바.
 *
 * ## Purpose
 * 화면 좌측의 전체 네비게이션 기둥. 위→아래로 다섯 영역이 쌓이며 모두 shrink-0,
 * 가운데 본문(메뉴) 영역만 flex-1 로 늘어남:
 *   1. 48px 로고 헤더 (WhaTap 로고 · 검색 · 접기) — [[PageHeader]](48px) 와 동일 높이
 *   2. 40px 조직 스위처 ([[SubHeaderBar]] 40px 과 정렬)
 *   3. 40px 프로젝트 스위처
 *   4. 본문 (flex-1) — 40px 제품 레일 + 우측 메뉴 목록(+ 즐겨찾기 바)
 *   5. 24px 저작권 푸터
 * 모든 가변 데이터(`activeProduct`/`project`/`menu`/`org`)는 prop 주입, 기본값은
 * K8s-GPU 컨텍스트라 빈 호출과도 호환. `collapsed`(Min, 80px) 면 40px 제품 레일 +
 * 40px 아이콘 전용 메뉴 열만 노출 (라벨·자식·즐겨찾기 바·푸터 숨김).
 *
 * ## When to use
 * - 보통 단독으로 두지 않고 [[DashboardLayout]] 의 좌측 컬럼으로 조합.
 * - 제품 레일 + 메뉴 트리 + 조직/프로젝트 스위처가 필요한 모든 모니터링 화면.
 *
 * ## When NOT to use
 * - 사이드바 외 헤더/본문/위젯까지 한 셸로 묶고 싶을 때 → [[DashboardLayout]].
 * - 제품 네비가 불필요한 관리 콘솔 → `hideProductRail`/`hideProjectSwitcher` 로 영역만 끔.
 *
 * ## Composition rules
 * - 폭은 접힘 상태가 결정 (240px ↔ 80px), `transition-all duration-400` 로 애니메이션.
 *   로고 헤더의 chevron 토글로 min/max 전환(내부 상태) — controlled(`collapsed`)/
 *   uncontrolled(`defaultCollapsed`) 둘 다 지원. AI 위젯 활성 시엔 controlled 로
 *   항상 동기화(feedback-widget-sidebar-collapse) — [[DashboardLayout]] 이 전달.
 * - 경계선·강조 배경은 토큰 binding (`--color-border-default` · `--color-brand-blue-bg`) — 인라인 hex 금지.
 * - 아이콘은 표준 경로(`/icons/*`) 참조 (Storybook/소비자 정적 서빙 동일).
 * - 메뉴는 `MenuItem[]` 트리로 주입 — `children` 유무로 단일/확장 항목이 갈림.
 * - 제품 레일은 프로젝트 스위처가 이미 노출한 제품(`project.productIcon`)을 **중복 렌더하지 않음** —
 *   현재 제품은 스위처가 대표하고 레일은 나머지 제품만 나열.
 * - 아이콘 전용 표면은 이름을 hover 시 [[Tooltip]](placement right, portal+fixed 라 루트
 *   `overflow-hidden` 에 안 잘림)으로 제공 — Min 메뉴 열 · 제품 레일 · 하단 유틸.
 *   collapsed 조직/프로젝트 스위처만 네이티브 `title` 유지.
 *
 * @example
 * ```tsx
 * <Sidebar activeProduct="gpu" collapsed={aiActive} />
 *
 * <Sidebar
 *   activeProduct="app"
 *   project={{ productIcon: "product-app.svg", groupBadge: "그룹", groupLabel: "그룹명", projectBadge: "프로젝트", projectLabel: "프로젝트명" }}
 *   menu={customMenu}
 *   org={{ label: "조직명", icon: "menu-workload.svg", badge: "조직" }}
 *   onOrgClick={openOrgPicker}
 * />
 * ```
 */
import { useState, type ReactNode } from "react";
import SidebarLogoHeader from "./SidebarLogoHeader";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarOrgSwitcher from "./SidebarOrgSwitcher";
import SidebarProjectSwitcher from "./SidebarProjectSwitcher";
import ProductRailItem from "./ProductRailItem";
import BottomRailItem from "./BottomRailItem";
import SidebarCopyright from "./SidebarCopyright";

/**
 * 아이콘은 표준 경로(`/icons/*`)를 그대로 참조합니다. 호스트별로 자산 제공 경로가 다름:
 *   - Storybook(이 패키지): `.storybook` 의 `staticDirs` 가 `static/icons` 를 `/icons` 로 번들.
 *   - 소비자(Product-SaaS 등): 자체 `public/icons/` 정적 서빙 + dev proxy.
 */
const icon = (name: string) => `/icons/${name}`;

const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";
const ROBOTO = "Roboto, sans-serif";

/** 제품 레일 항목 — label 은 아이콘 전용 레일의 hover 툴팁(title)으로 노출. */
const PRODUCT_RAIL = [
  { icon: "product-app.svg", label: "애플리케이션" },
  { icon: "product-server.svg", label: "서버" },
  { icon: "product-k8s.svg", label: "쿠버네티스" },
  { icon: "product-db.svg", label: "데이터베이스" },
  { icon: "product-log.svg", label: "로그" },
  { icon: "product-url.svg", label: "URL" },
  { icon: "product-cloud.svg", label: "클라우드" },
  { icon: "product-rum.svg", label: "브라우저" },
  { icon: "product-nms.svg", label: "네트워크" },
  { icon: "product-gpu.svg", label: "GPU" },
  { icon: "product-metrics.svg", label: "메트릭스" },
];

/** 레일 하단 유틸 항목 — label 은 hover 툴팁(title). */
const BOTTOM_RAIL = [
  { icon: "bottom-user-add.svg", label: "멤버 초대" },
  { icon: "bottom-theme.svg", label: "테마 전환" },
  { icon: "bottom-fullscreen.svg", label: "전체 화면" },
];

export type MenuItem = {
  icon: string;
  label: string;
  /** 펼침/접힘이 있는 항목. 비어 있으면 단일 항목. */
  children?: {
    label: string;
    active?: boolean;
    onClick?: () => void;
    /**
     * 이 항목이 하위 묶음의 **제목**임을 뜻한다 — 누를 수 없고, 뒤따르는 형제들이 그 묶음의
     * 구성원이라 한 단계 더 들여쓴다. 메뉴가 3단(제품 > 묶음 > 화면)인 제품(DB 분석 등)에서 쓴다.
     */
    group?: boolean;
  }[];
  /**
   * 펼침 여부. `onToggle` 이 없으면 «초기값» 이고 그 뒤로는 행을 눌러 사용자가 접고 편다.
   * `onToggle` 을 주면 제어 모드가 되어 이 값이 현재 펼침을 그대로 정한다.
   */
  expanded?: boolean;
  /**
   * 펼침 토글 요청. 주면 제어 모드 — 호출부가 `expanded` 를 갱신해야 화면이 바뀐다.
   * 「지금 보고 있는 화면의 부모는 늘 펼쳐 둔다」처럼 라우팅이 펼침을 정할 때만 필요하다.
   */
  onToggle?: (expanded: boolean) => void;
  /** 단일 항목(child 없음) 일 때 active 강조 (라이트 블루 배경 + bold). */
  active?: boolean;
  /** 단일 항목 클릭 핸들러(네비게이션). 미지정 시 정적. */
  onClick?: () => void;
};

export type ProjectContext = {
  /** 사이드바 상단 프로젝트 스위처에 표시할 아이콘 파일명. 생략 시 아이콘 미표시 + 라벨 좌측 여백. */
  productIcon?: string;
  /** 그룹 타입 칩(badge) 텍스트 — 예: "그룹". "[그룹]" 같은 타입 접두사는 라벨이 아니라 이 칩으로 분리. 생략 시 칩 없음. */
  groupBadge?: string;
  /**
   * 그룹명 (회색 라인) — 타입 접두사 없이 이름만. 접두사는 `groupBadge` 칩으로.
   *
   * **선택이다**(2026-09-17). 프로젝트가 최상위인 제품(URL 모니터링 등)에는 그룹 계층 자체가
   * 없다. 그런 곳에서 빈 문자열을 넣게 하면 회색 줄이 자리만 차지하고 사람은 「이름이
   * 비었나」로 읽는다. 생략하면 **그 줄을 그리지 않고** 프로젝트명 한 줄로 선다.
   */
  groupLabel?: string;
  /** 프로젝트 타입 칩(badge) 텍스트 — 예: "프로젝트". "[프로젝트]" 접두사는 라벨이 아니라 이 칩으로 분리. 생략 시 칩 없음. */
  projectBadge?: string;
  /** 프로젝트명 (굵은 라인) — 타입 접두사 없이 이름만. 접두사는 `projectBadge` 칩으로. */
  projectLabel: string;
};

/**
 * K8s-GPU 프로젝트의 기본 메뉴 구조 (스크린샷 기준).
 * GPU 노드만 펼친 상태이며 자식 중 "GPU 트렌드"가 active.
 * Sidebar의 default — prop으로 다른 메뉴 데이터를 주입해 재활용 가능.
 */
export const K8S_GPU_MENU: MenuItem[] = [
  { icon: "menu-dashboard.svg", label: "대시보드", children: [] },
  { icon: "menu-openmetrics.svg", label: "OpenMetrics", children: [] },
  { icon: "menu-cluster.svg", label: "클러스터", children: [] },
  { icon: "menu-node.svg", label: "노드", children: [] },
  {
    icon: "menu-gpu.svg",
    label: "GPU",
    expanded: true,
    children: [
      { label: "GPU 대시보드" },
      { label: "GPU 목록" },
      { label: "GPU 트렌드", active: true },
      { label: "GPU 워크로드" },
    ],
  },
  { icon: "menu-container.svg", label: "컨테이너", children: [] },
  { icon: "menu-workload.svg", label: "워크로드", children: [] },
  { icon: "menu-service.svg", label: "서비스 네트워킹", children: [] },
  { icon: "menu-storage.svg", label: "스토리지", children: [] },
  { icon: "menu-controlplane.svg", label: "컨트롤 플레인", children: [] },
  { icon: "menu-analysis.svg", label: "분석", children: [] },
  { icon: "menu-log.svg", label: "로그", children: [] },
  { icon: "menu-report.svg", label: "보고서" },
  { icon: "menu-application.svg", label: "애플리케이션", children: [] },
  { icon: "menu-alert.svg", label: "경고 알림", children: [] },
  { icon: "menu-settings.svg", label: "관리", children: [] },
];

const DEFAULT_PROJECT: ProjectContext = {
  productIcon: "product-gpu.svg",
  groupLabel: "그룹명",
  projectLabel: "프로젝트명",
};

/** 상단 조직 스위처 컨텍스트. `org={null}`이면 조직 스위처 숨김. `icon` 생략 시 심볼 미표시. */
export type OrgContext = { label: string; icon?: string; badge?: string };
// 조직 스위처 기본값: 좌측은 조직 표현 아이콘(브랜드 심볼 아님), "조직" 타입은 badge 칩으로,
// 슬롯 라벨은 조직명만. icon 은 로컬 세트 대체품(menu-workload) — 전용 org 아이콘 확보 시 교체.
const DEFAULT_ORG: OrgContext = { label: "조직명", icon: "menu-workload.svg" };

/**
 * 사이드바 컴포넌트.
 *
 * 모든 가변 데이터는 prop으로 주입:
 *   - `activeProduct` — 제품 레일 강조 (e.g. "gpu", "app")
 *   - `project`       — 프로젝트 스위처 컨텍스트(아이콘/그룹/프로젝트 라벨)
 *   - `menu`          — 메뉴 트리 데이터
 *   - `collapsed`     — (controlled) true면 Min(80px) — 제품 레일 + 아이콘 전용 메뉴 열.
 *                       AI 위젯 활성화 시 항상 동기화되어야 함(공통 정책,
 *                       feedback-widget-sidebar-collapse 참고).
 *   - `defaultCollapsed` — (uncontrolled) 초기 접힘 상태. 로고 헤더 chevron 토글로 스스로 min/max 전환.
 *   - `onCollapsedChange` — 토글 시 다음 접힘 상태 콜백(controlled 소비자용).
 *
 * 기본값은 현재 K8s-GPU 컨텍스트로 채워 기존 호출처와 호환.
 */
export default function Sidebar({
  activeProduct = "gpu",
  project = DEFAULT_PROJECT,
  menu = K8S_GPU_MENU,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  hideProjectSwitcher = false,
  org = DEFAULT_ORG,
  onOrgClick,
  hideProductRail = false,
  hideUtilityBar = false,
  onProjectClick,
  footerText,
  onLogoClick,
}: {
  /** 제품 레일에서 강조할 제품 키 — 아이콘 파일명에서 `product-`·`.svg` 를 뗀 값(예: "gpu", "app"). 기본 "gpu". */
  activeProduct?: string;
  /** 상단 프로젝트 스위처 컨텍스트. 기본 `DEFAULT_PROJECT`(「그룹명」·「프로젝트명」 예시 값 — 실제 화면은 반드시 넘긴다). 프로젝트 컨텍스트가 없는 화면은 넘기지 말고 `hideProjectSwitcher`. */
  project?: ProjectContext;
  /** 본문 메뉴 트리 — 항목마다 [[SidebarMenuItem]] 한 행. 기본 `K8S_GPU_MENU`(K8s-GPU 예시 값 — 실제 화면은 반드시 넘긴다). */
  menu?: MenuItem[];
  /**
   * 접힘 상태 — **controlled**. 지정하면 min(80px)/max(240px)를 부모가 소유(AI 위젯 동기화 등,
   * feedback-widget-sidebar-collapse). min 은 제품 레일(40px) + 아이콘 전용 메뉴 열(40px).
   * 미지정 시 컴포넌트 내부 상태로 동작(uncontrolled).
   */
  collapsed?: boolean;
  /** **uncontrolled** 초기 접힘 상태. `collapsed` 미지정일 때만 유효. 기본 false(펼침). */
  defaultCollapsed?: boolean;
  /** 로고 헤더 토글 버튼 클릭 시 다음 접힘 상태로 호출. controlled 소비자는 이걸로 `collapsed`를 갱신. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 상단 프로젝트 스위처(productIcon + groupLabel + projectLabel + chevron) 영역 숨김.
   * 프로젝트 컨텍스트가 없는 화면(엔터프라이즈 설정 전, 계정/관리 영역)에서 상단 스위처를 숨김.
   * 기본 false → 기존 호출처 동작 유지.
   */
  hideProjectSwitcher?: boolean;
  /** 상단 조직 스위처. `null`이면 숨김, `icon` 생략 시 심볼 미표시. 컨텍스트에 맞는 라벨로 교체. */
  org?: OrgContext | null;
  /** 조직 스위처 클릭 핸들러(조직 목록/관리 진입). 미지정 시 비활성(정적). */
  onOrgClick?: () => void;
  /** 좌측 40px 제품 레일(제품 아이콘 + 하단 유틸) 숨김. 모니터링 제품이 아닌 관리 콘솔 화면용. 기본 false. */
  hideProductRail?: boolean;
  /**
   * 레일 **하단 유틸**(테마·전체화면·홈)만 숨긴다. 제품 레일 자체는 남는다 —
   * 전체를 끄려면 `hideProductRail`. 셸이 그 기능을 다른 곳에서 제공하는 제품용. 기본 false.
   */
  hideUtilityBar?: boolean;
  /** 프로젝트 스위처 클릭 — 이벤트를 그대로 넘긴다(앵커 계산은 화면의 몫). */
  onProjectClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 하단 저작권 문구 override — [[SidebarCopyright]] 로 넘어간다. 저작권 주체가 다른 제품용. */
  footerText?: ReactNode;
  /**
   * 로고 클릭 — 주입 시에만 로고가 버튼이 된다([[SidebarLogoHeader]]).
   * 랜딩이 따로 있는 제품에서만 준다. 제품 화면의 로고는 표지이지 이동 수단이 아니다.
   */
  onLogoClick?: () => void;
}) {
  // controlled(`collapsed`) / uncontrolled(`defaultCollapsed`) 둘 다 지원 — Switch/Checkbox 패턴 동일.
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? internalCollapsed;
  const toggleCollapsed = () => {
    const next = !isCollapsed;
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  // Min = 40px 제품 레일 + 40px 아이콘 전용 메뉴 열
  const width = isCollapsed ? 80 : 240;
  return (
    <div
      className="flex flex-col items-start relative h-full shrink-0 transition-all duration-400 ease-in-out overflow-hidden"
      style={{ width }}
    >
      {/* 48px 로고 헤더 — onToggle 로 min/max 인터랙션 제공 */}
      <SidebarLogoHeader collapsed={isCollapsed} width={width} onToggle={toggleCollapsed} onLogoClick={onLogoClick} />

      {/* 40px 조직 스위처 — org=null이면 숨김, collapsed면 아이콘만 */}
      {org && (
        <SidebarOrgSwitcher org={org} onClick={onOrgClick} collapsed={isCollapsed} />
      )}

      {/* 40px 프로젝트 스위처 — hideProjectSwitcher면 숨김, collapsed면 아이콘만 */}
      {!hideProjectSwitcher && (
        <SidebarProjectSwitcher project={project} collapsed={isCollapsed} onClick={onProjectClick} />
      )}

      {/* 본문 (flex-1): 좌 40px 제품 레일 + (collapsed가 아닐 때만) 우 메뉴 목록 */}
      <div className="flex flex-1 items-start min-h-0 w-full">
        {/* 좌측 40px 제품 레일 — hideProductRail이면 숨김(관리 콘솔 등 제품 네비 불필요 화면) */}
        {!hideProductRail && (
        <div className="flex flex-col h-full items-start shrink-0 w-40px bg-card border-r border-color-var-color-border-default">
          <div className="flex flex-1 flex-col items-start min-h-0">
            {/* 프로젝트 스위처가 현재 제품 아이콘을 이미 노출하므로 레일에서 같은 제품은 제외(중복 금지) */}
            {PRODUCT_RAIL.filter(
              ({ icon: name }) => hideProjectSwitcher || name !== project.productIcon,
            ).map(({ icon: name, label }) => {
              const key = name.replace("product-", "").replace(".svg", "");
              const isActive = key === activeProduct;
              return <ProductRailItem key={name} name={name} label={label} active={isActive} />;
            })}
          </div>
          {!hideUtilityBar && (
            <div className="flex flex-col items-start shrink-0">
              {BOTTOM_RAIL.map(({ icon: name, label }) => (
                <BottomRailItem key={name} name={name} label={label} />
              ))}
            </div>
          )}
        </div>
        )}

        {/* 우측 메뉴 목록 — collapsed면 아이콘 전용(iconOnly) 40px 열로 축소 */}
        <div className="flex flex-1 flex-col h-full items-stretch min-w-0">
          <div className="flex flex-1 flex-col items-stretch min-h-0 pr-px w-full bg-card border-r border-color-var-color-border-default">
            {menu.map((item) => (
              <SidebarMenuItem key={item.label} item={item} iconOnly={isCollapsed} />
            ))}
          </div>

          {/* 메뉴 영역 하단의 즐겨찾기/홈/사이트맵 바 — collapsed면 숨김 */}
          {!isCollapsed && (
          <div className="flex h-32px items-center justify-between p-8px shrink-0 w-full bg-card border-r border-t border-color-var-color-border-default">
            <div className="flex gap-4px items-center w-73px">
              <img alt="" className="size-20px" src={icon("bar-home.svg")} />
              <img alt="" className="size-20px" src={icon("bar-star.svg")} />
              <img alt="" className="size-20px" src={icon("bar-sitemap.svg")} />
            </div>
            <div className="h-12px shrink-0 w-78px" />
          </div>
          )}
        </div>
      </div>

      {/* 24px 저작권 푸터 — collapsed면 숨김 */}
      {!isCollapsed && <SidebarCopyright text={footerText} />}
    </div>
  );
}
