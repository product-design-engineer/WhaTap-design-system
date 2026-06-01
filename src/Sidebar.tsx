/**
 * WhaTap SaaS 좌측 240px 사이드바.
 *
 * 구조(위→아래, 모두 shrink-0 — 가운데 본문(메뉴) 영역만 flex-1로 늘어남):
 *   1. 47px 로고 헤더 (WhaTap 로고 · 검색 · 접기)
 *   2. 40px 조직 스위처
 *   3. 44px 프로젝트 스위처
 *   4. 본문 (flex-1) — 40px 제품 레일 + 우측 메뉴 목록(+ 즐겨찾기 바)
 *   5. 24px 저작권 푸터
 *
 * 아이콘은 라이브 배포의 동일 경로에서 가져와 로컬에 아이콘 파일이 없어도
 * 그대로 렌더되도록 합니다. (절대 URL → no VPN 필요)
 */
/**
 * 아이콘은 표준 경로(`/icons/*`)를 그대로 참조합니다. 호스트별로 자산 제공 경로가 다름:
 *   - Storybook(이 패키지): `.storybook` 의 `staticDirs` 가 `static/icons` 를 `/icons` 로 번들.
 *   - 소비자(Product-SaaS 등): 자체 `public/icons/` 정적 서빙 + dev proxy.
 */
const icon = (name: string) => `/icons/${name}`;

const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";
const ROBOTO = "Roboto, sans-serif";

const PRODUCT_ICONS = [
  "product-app.svg",
  "product-server.svg",
  "product-k8s.svg",
  "product-db.svg",
  "product-log.svg",
  "product-url.svg",
  "product-cloud.svg",
  "product-rum.svg",
  "product-nms.svg",
  "product-gpu.svg",
  "product-metrics.svg",
];

const BOTTOM_RAIL_ICONS = [
  "bottom-user-add.svg",
  "bottom-theme.svg",
  "bottom-fullscreen.svg",
];

export type MenuItem = {
  icon: string;
  label: string;
  /** 펼침/접힘이 있는 항목. 비어 있으면 단일 항목. */
  children?: { label: string; active?: boolean }[];
  /** 기본 펼침 여부. false면 chevron-down(접힘) 상태로 렌더. */
  expanded?: boolean;
  /** 단일 항목(child 없음) 일 때 active 강조 (라이트 블루 배경 + bold). */
  active?: boolean;
};

export type ProjectContext = {
  /** 사이드바 상단 프로젝트 스위처에 표시할 아이콘 파일명 */
  productIcon: string;
  /** [그룹] 라벨 (회색 라인) */
  groupLabel: string;
  /** [프로젝트] 라벨 (굵은 라인) */
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
  groupLabel: "[그룹] 운영 ",
  projectLabel: "[프로젝트] K8s-GPU",
};

/** 상단 조직 스위처 컨텍스트. `org={null}`이면 조직 스위처 숨김. `icon` 생략 시 심볼 미표시. */
export type OrgContext = { label: string; icon?: string };
const DEFAULT_ORG: OrgContext = { label: "[조직] 와탭랩스 대관", icon: "whatap-symbol.svg" };

/**
 * 사이드바 컴포넌트.
 *
 * 모든 가변 데이터는 prop으로 주입:
 *   - `activeProduct` — 제품 레일 강조 (e.g. "gpu", "app")
 *   - `project`       — 프로젝트 스위처 컨텍스트(아이콘/그룹/프로젝트 라벨)
 *   - `menu`          — 메뉴 트리 데이터
 *   - `collapsed`     — true면 40px 제품 레일만 노출(컴팩트 로고 헤더 유지).
 *                       AI 위젯 활성화 시 항상 동기화되어야 함(공통 정책,
 *                       feedback-widget-sidebar-collapse 참고).
 *
 * 기본값은 현재 K8s-GPU 컨텍스트로 채워 기존 호출처와 호환.
 */
export default function Sidebar({
  activeProduct = "gpu",
  project = DEFAULT_PROJECT,
  menu = K8S_GPU_MENU,
  collapsed = false,
  hideProjectSwitcher = false,
  org = DEFAULT_ORG,
}: {
  activeProduct?: string;
  project?: ProjectContext;
  menu?: MenuItem[];
  collapsed?: boolean;
  /**
   * 상단 프로젝트 스위처(productIcon + groupLabel + projectLabel + chevron) 영역 숨김.
   * 프로젝트 컨텍스트가 없는 화면(엔터프라이즈 설정 전, 계정/관리 영역)에서 상단 스위처를 숨김.
   * 기본 false → 기존 호출처 동작 유지.
   */
  hideProjectSwitcher?: boolean;
  /** 상단 조직 스위처. `null`이면 숨김, `icon` 생략 시 심볼 미표시. 컨텍스트에 맞는 라벨로 교체. */
  org?: OrgContext | null;
}) {
  const width = collapsed ? 40 : 240;
  return (
    <div
      className="flex flex-col items-start relative h-full shrink-0 transition-all duration-400 ease-in-out overflow-hidden"
      style={{ width }}
    >
      {/* 48px 로고 헤더 — 페이지 헤더(48px) 표준과 정렬. collapsed면 심볼만, 아니면 풀 로고 + 검색/접기 */}
      <div
        className="flex items-center h-[48px] shrink-0 bg-white border-r border-[#eaeaea]"
        style={{
          width,
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : 8,
        }}
      >
        {collapsed ? (
          <img
            alt="WhaTap"
            src={icon("whatap-symbol.svg")}
            style={{ width: 24, height: 24 }}
          />
        ) : (
          <>
            <img
              alt="WhaTap"
              src={icon("whatap-logo.svg")}
              style={{ width: 126, height: 24 }}
            />
            <div className="flex gap-[4px] items-center justify-end shrink-0">
              <div className="shrink-0 size-[20px] flex items-center justify-center cursor-pointer">
                <img alt="" className="size-[20px]" src={icon("header-search.svg")} />
              </div>
              <div className="shrink-0 size-[16px] flex items-center justify-center cursor-pointer">
                <img
                  alt=""
                  className="size-[16px]"
                  src={icon("chevron-right.svg")}
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 40px 조직 스위처 — collapsed 또는 org=null이면 숨김. 라벨/심볼은 org prop으로 제어. */}
      {!collapsed && org && (
      <button className="flex h-[40px] items-start w-full shrink-0 cursor-pointer">
        <div className="flex flex-col h-full items-start justify-center pr-[8px] w-[240px] bg-white border-r border-t border-[#eaeaea]">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[10px] items-center justify-center shrink-0 size-[40px]">
              {org.icon && <img alt="" className="size-[24px]" src={icon(org.icon)} />}
            </div>
            <p
              className="flex-1 min-w-0 overflow-hidden text-md font-bold text-secondary text-left tracking-default whitespace-nowrap text-ellipsis leading-none"
              style={{ fontFamily: NOTO_SANS }}
            >
              {org.label}
            </p>
            <div className="shrink-0 size-[16px] flex items-center justify-center">
              <img alt="" className="size-[16px]" src={icon("chevron-right.svg")} />
            </div>
          </div>
        </div>
      </button>
      )}

      {/* 44px 프로젝트 스위처 — collapsed 또는 hideProjectSwitcher면 숨김 */}
      {!collapsed && !hideProjectSwitcher && (
      <button className="flex items-start shrink-0 cursor-pointer">
        <div className="flex h-[44px] items-center justify-between pr-[8px] w-[240px] bg-white border-b border-r border-t border-[#eaeaea]">
          <div className="flex items-center justify-center shrink-0 size-[40px]">
            <img alt="" className="size-[24px]" src={icon(project.productIcon)} />
          </div>
          <div className="flex flex-1 flex-col gap-[4px] items-start justify-center min-w-0 leading-none text-left whitespace-nowrap">
            <p
              className="text-base text-secondary overflow-hidden text-ellipsis w-full tracking-normal"
              style={{ fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)" }}
            >
              {project.groupLabel}
            </p>
            <p
              className="text-md font-bold text-secondary overflow-hidden text-ellipsis w-full tracking-default"
              style={{ fontFamily: NOTO_SANS }}
            >
              {project.projectLabel}
            </p>
          </div>
          <div className="flex items-center justify-between shrink-0 size-[16px]">
            <img alt="" className="size-[16px]" src={icon("chevron-right.svg")} />
          </div>
        </div>
      </button>
      )}

      {/* 본문 (flex-1): 좌 40px 제품 레일 + (collapsed가 아닐 때만) 우 메뉴 목록 */}
      <div className="flex flex-1 items-start min-h-0 w-full">
        {/* 좌측 40px 제품 레일 */}
        <div className="flex flex-col h-full items-start shrink-0 w-[40px] bg-white border-r border-[#eaeaea]">
          <div className="flex flex-1 flex-col items-start min-h-0">
            {PRODUCT_ICONS.map((name) => {
              const key = name.replace("product-", "").replace(".svg", "");
              const isActive = key === activeProduct;
              return (
                <div
                  key={name}
                  className="flex items-center justify-center shrink-0 size-[40px] cursor-pointer hover:bg-gray-50"
                  style={
                    isActive
                      ? { backgroundColor: "#D6E1FF" }
                      : undefined
                  }
                >
                  <img alt="" className="size-[24px]" src={icon(name)} />
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-start shrink-0">
            {BOTTOM_RAIL_ICONS.map((name) => (
              <div
                key={name}
                className="flex h-[32px] items-center justify-center shrink-0 w-[40px] cursor-pointer hover:bg-gray-50"
              >
                <img alt="" className="size-[20px]" src={icon(name)} />
              </div>
            ))}
          </div>
        </div>

        {/* 우측 메뉴 목록 — collapsed면 통째로 숨김 */}
        {!collapsed && (
        <div className="flex flex-1 flex-col h-full items-start min-w-0">
          <div className="flex flex-1 flex-col items-start min-h-0 pr-px w-full bg-white border-r border-[#eaeaea]">
            {menu.map((item) => {
              const hasChildren = Array.isArray(item.children);
              if (!hasChildren) {
                // 단일 항목 (펼침/접힘 chevron 없음, e.g. "보고서")
                return (
                  <div
                    key={item.label}
                    className="flex h-[32px] items-center overflow-clip p-[8px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    style={item.active ? { backgroundColor: "#D6E1FF" } : undefined}
                  >
                    <div className="flex items-center shrink-0 size-[20px] justify-center">
                      <img alt="" className="size-[16px]" src={icon(item.icon)} />
                    </div>
                    <div className="flex gap-[4px] items-center shrink-0">
                      <p
                        className={`text-md font-bold tracking-default whitespace-nowrap leading-none ${item.active ? "text-primary" : "text-secondary"}`}
                        style={{ fontFamily: NOTO_SANS }}
                      >
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              }
              // 확장 가능 항목 (chevron-down(접힘) / chevron-up(펼침))
              return (
                <div key={item.label} className="contents">
                  <button className="flex flex-col items-start shrink-0 w-full cursor-pointer">
                    <div className="flex h-[32px] items-center justify-between overflow-clip px-[8px] py-[6px] shrink-0 w-full hover:bg-gray-50">
                      <div className="flex gap-[4px] items-start shrink-0">
                        <div className="shrink-0 size-[16px] flex items-center justify-center">
                          <img alt="" className="size-[16px]" src={icon(item.icon)} />
                        </div>
                        <p
                          className="text-md font-bold text-secondary tracking-default whitespace-nowrap leading-none text-left"
                          style={{ fontFamily: NOTO_SANS }}
                        >
                          {item.label}
                        </p>
                      </div>
                      <div className="shrink-0 size-[16px] flex items-center justify-center">
                        <img
                          alt=""
                          src={icon("caret-down.svg")}
                          style={{
                            width: 8,
                            height: 5,
                            transform: item.expanded ? "rotate(180deg)" : undefined,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                  {item.expanded && (item.children?.length ?? 0) > 0 && (
                    <div className="flex flex-col items-start shrink-0 w-full">
                      {item.children!.map((c) => (
                        <div
                          key={c.label}
                          className={
                            c.active
                              ? "flex gap-[4px] h-[28px] items-center overflow-clip pl-[28px] pr-[8px] py-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                              : "flex h-[28px] items-center overflow-clip pl-[28px] pr-[8px] py-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                          }
                        >
                          {c.active ? (
                            <p
                              className="text-md font-bold text-primary tracking-default whitespace-pre leading-none"
                              style={{ fontFamily: NOTO_SANS }}
                            >
                              {c.label}
                            </p>
                          ) : (
                            <div className="flex gap-[4px] items-center shrink-0">
                              <p
                                className="text-md text-secondary tracking-default whitespace-nowrap leading-none"
                                style={{ fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)" }}
                              >
                                {c.label}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 메뉴 영역 하단의 즐겨찾기/홈/사이트맵 바 */}
          <div className="flex h-[32px] items-center justify-between p-[8px] shrink-0 w-full bg-white border-r border-t border-[#eaeaea]">
            <div className="flex gap-[4px] items-center w-[73px]">
              <img alt="" className="size-[20px]" src={icon("bar-home.svg")} />
              <img alt="" className="size-[20px]" src={icon("bar-star.svg")} />
              <img alt="" className="size-[20px]" src={icon("bar-sitemap.svg")} />
            </div>
            <div className="h-[12px] shrink-0 w-[78px]" />
          </div>
        </div>
        )}
      </div>

      {/* 24px 저작권 푸터 — collapsed면 숨김 */}
      {!collapsed && (
      <div className="flex h-[24px] items-center p-[8px] shrink-0 w-full bg-white border-r border-t border-[#eaeaea]">
        <p
          className="text-sm text-tertiary whitespace-nowrap leading-none"
          style={{ fontFamily: ROBOTO, fontWeight: "var(--font-weight-regular)" }}
        >
          Copyright 2024 WhaTap
        </p>
      </div>
      )}
    </div>
  );
}
