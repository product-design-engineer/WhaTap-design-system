import type { ProjectContext } from "./Sidebar";

/**
 * SidebarProjectSwitcher — Chrome / Foundation. [[Sidebar]] 상단 44px 프로젝트 스위처 행.
 *
 * ## Purpose
 * 사이드바 상단(조직 스위처 아래)의 44px 프로젝트 컨텍스트 스위처를 렌더.
 * 제품 아이콘(24px) + 그룹 라벨(12px regular) + 프로젝트 라벨(13px bold) + chevron(16px).
 * 클릭 시 프로젝트 목록/전환 UI 진입 — 현재는 외형만 담당(동작은 호출자 onClick).
 *
 * ## When to use
 * - [[Sidebar]] 가 `project` prop 으로 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 프로젝트 스위처 외형**이 필요한 경우 (예: 모바일 드로어 헤더, 설정 페이지 프로젝트 컨텍스트 표시).
 * - 프로젝트 컨텍스트가 **있는** 화면에서만 노출 — 컨텍스트 없는 화면은 `hideProjectSwitcher` 로 숨김.
 *
 * ## When NOT to use
 * - **조직(테넌트) 스위처** → [[SidebarOrgSwitcher]] (40px, 뱃지 지원).
 * - **collapsed(40px) 사이드바에서 숨기고 싶을 때** — `collapsed=true` 전달하면 40px 정사각 제품 아이콘만 표시. `productIcon` 없으면 null 렌더.
 * - **프로젝트 컨텍스트가 없는 화면** (엔터프라이즈 활성화 전, 계정/관리 영역) — 빈 라벨/기본값 노출 금지 정책. `hideProjectSwitcher=true`.
 * - **프로젝트 목록 드롭다운 본체** — 이 컴포넌트는 트리거(행)만 담당. 드롭다운 패널은 별도.
 * - **본문 메뉴 항목** → [[SidebarMenuItem]].
 *
 * ## Composition rules
 * - 데이터(`ProjectContext`)만 주입 — 행 외형(높이 44px · 보더 · 배경 · 타이포)은 이 컴포넌트가 책임.
 * - 색은 토큰 (`text-secondary` · `bg-card` · `border-color-var-color-border-default`) — 인라인 hex 금지.
 * - `productIcon` 생략 시 좌측은 **12px 스페이서** (빈 40px 박스 금지 — 빈 아이콘 영역 방지 정책).
 * - 그룹 라벨은 `text-base`(12px) regular, 프로젝트 라벨은 `text-md`(13px) bold — 위계 차이로 구분.
 * - 긴 라벨은 `text-ellipsis` + `overflow-hidden` 으로 잘림 처리 (240px 폭 제약).
 *
 * @example
 * ```tsx
 * <SidebarProjectSwitcher project={{ productIcon: "product-gpu.svg", groupLabel: "[그룹] 운영", projectLabel: "[프로젝트] K8s-GPU" }} />
 * ```
 */

const icon = (name: string) => `/icons/${name}`;
const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";

export default function SidebarProjectSwitcher({
  project,
  collapsed = false,
}: {
  project: ProjectContext;
  /** true면 40px 정사각 — 제품 아이콘만 표시. */
  collapsed?: boolean;
}) {
  if (collapsed) {
    return project.productIcon ? (
      <button className="flex items-center justify-center shrink-0 size-40px cursor-pointer bg-card border-r border-b border-color-var-color-border-default">
        <img alt="" className="size-24px" src={icon(project.productIcon)} />
      </button>
    ) : null;
  }

  return (
    <button className="flex items-start shrink-0 cursor-pointer">
      <div className="flex h-44px items-center justify-between pr-8px w-240px bg-card border-b border-r border-color-var-color-border-default">
        {project.productIcon ? (
          <div className="flex items-center justify-center shrink-0 size-40px">
            <img alt="" className="size-24px" src={icon(project.productIcon)} />
          </div>
        ) : (
          <div className="w-12px shrink-0" />
        )}
        <div className="flex flex-1 flex-col gap-4px items-start justify-center min-w-0 leading-none text-left whitespace-nowrap">
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
        <div className="flex items-center justify-between shrink-0 size-16px">
          <img alt="" className="size-16px" src={icon("chevron-right.svg")} />
        </div>
      </div>
    </button>
  );
}
