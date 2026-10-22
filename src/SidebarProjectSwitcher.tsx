import type { ProjectContext } from "./Sidebar";

/**
 * SidebarProjectSwitcher — Chrome / Foundation. [[Sidebar]] 상단 40px 프로젝트 스위처 행.
 *
 * ## Purpose
 * 사이드바 상단(조직 스위처 아래)의 40px 프로젝트 컨텍스트 스위처를 렌더.
 * 제품 아이콘(24px) + 그룹 라인("그룹" 칩 + 그룹명 12px regular) + 프로젝트 라인("프로젝트" 칩 + 프로젝트명 13px bold) + chevron(16px).
 * 클릭 시 프로젝트 목록/전환 UI 진입 — 현재는 외형만 담당(동작은 호출자 onClick).
 *
 * ## When to use
 * - [[Sidebar]] 가 `project` prop 으로 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 프로젝트 스위처 외형**이 필요한 경우 (예: 모바일 드로어 헤더, 설정 페이지 프로젝트 컨텍스트 표시).
 * - 프로젝트 컨텍스트가 **있는** 화면에서만 노출 — 컨텍스트 없는 화면은 `hideProjectSwitcher` 로 숨김.
 *
 * ## When NOT to use
 * - **조직(테넌트) 스위처** → [[SidebarOrgSwitcher]] (40px, 뱃지 지원).
 * - **Min(collapsed) 사이드바에서 숨기고 싶을 때** — `collapsed=true` 전달하면 부모 폭 40px 높이 행에 제품 아이콘만 중앙 표시. `productIcon` 없으면 null 렌더.
 * - **프로젝트 컨텍스트가 없는 화면** (엔터프라이즈 활성화 전, 계정/관리 영역) — 빈 라벨/기본값 노출 금지 정책. `hideProjectSwitcher=true`.
 * - **프로젝트 목록 드롭다운 본체** — 이 컴포넌트는 트리거(행)만 담당. 드롭다운 패널은 별도.
 * - **본문 메뉴 항목** → [[SidebarMenuItem]].
 *
 * ## Composition rules
 * - 데이터(`ProjectContext`)만 주입 — 행 외형(높이 40px · 보더 · 배경 · 타이포)은 이 컴포넌트가 책임.
 * - 색은 토큰 (`text-secondary` · `bg-card` · `border-color-var-color-border-default`) — 인라인 hex 금지.
 * - `productIcon` 생략 시 좌측은 **12px 스페이서** (빈 40px 박스 금지 — 빈 아이콘 영역 방지 정책).
 * - 그룹/프로젝트 두 라인 모두 "타입 칩(`groupBadge`/`projectBadge`, 조직 스위처 badge 와 동일 토큰) + 이름" 규칙.
 *   그룹명은 `text-base`(12px) regular, 프로젝트명은 `text-md`(13px) bold — 위계 차이로 구분.
 *   "[그룹]"·"[프로젝트]" 접두사는 라벨에 넣지 말고 칩으로 분리.
 * - 긴 라벨은 `text-ellipsis` + `overflow-hidden` 으로 잘림 처리 (240px 폭 제약).
 *
 * @example
 * ```tsx
 * <SidebarProjectSwitcher project={{ productIcon: "product-gpu.svg", groupBadge: "그룹", groupLabel: "그룹명", projectBadge: "프로젝트", projectLabel: "프로젝트명" }} />
 * ```
 */

const icon = (name: string) => `/icons/${name}`;
const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";

export default function SidebarProjectSwitcher({
  project,
  collapsed = false,
  onClick,
}: {
  project: ProjectContext;
  /** true면 부모 폭 40px 높이 행 — 제품 아이콘만 중앙 표시. */
  collapsed?: boolean;
  /**
   * 스위처를 눌렀을 때. 이벤트를 그대로 넘긴다 — 호출측이 `currentTarget` 의 위치를 재서
   * 목록 패널을 그 자리에 띄우는 일이 흔하다(앵커 계산은 DS 가 아니라 화면의 몫이다).
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  if (collapsed) {
    return project.productIcon ? (
      <button type="button" onClick={onClick} title={project.projectLabel} className="flex items-center justify-center shrink-0 h-40px w-full cursor-pointer bg-card border-r border-b border-color-var-color-border-default">
        <img alt={project.projectLabel} className="size-24px" src={icon(project.productIcon)} />
      </button>
    ) : null;
  }

  return (
    <button type="button" onClick={onClick} className="flex items-center shrink-0 cursor-pointer">
      <div className="flex h-40px items-center justify-between pr-8px w-240px bg-card border-b border-r border-color-var-color-border-default">
        {project.productIcon ? (
          <div className="flex items-center justify-center shrink-0 size-40px">
            <img alt="" className="size-24px" src={icon(project.productIcon)} />
          </div>
        ) : (
          <div className="w-12px shrink-0" />
        )}
        {/* 2줄(그룹명/프로젝트명) 세로 gap 0 — 행 높이 40px 안에서 두 줄을 붙여 배치 */}
        <div className="flex flex-1 flex-col gap-0 items-start justify-center min-w-0 leading-none text-left whitespace-nowrap">
          {/* 그룹 계층이 없는 제품은 이 줄을 아예 그리지 않는다 — 빈 회색 줄은 「이름이 비었다」로 읽힌다. */}
          {(project.groupLabel || project.groupBadge) && (
            <div className="flex items-center gap-4px w-full min-w-0">
              {project.groupBadge && (
                <span
                  className="shrink-0 inline-flex items-center h-16px px-4px rounded-4px text-xs font-bold whitespace-nowrap bg-var-color-brand-blue-bg text-color-var-color-brand-blue"
                  style={{ fontFamily: NOTO_SANS }}
                >
                  {project.groupBadge}
                </span>
              )}
              <p
                className="text-base text-secondary overflow-hidden text-ellipsis min-w-0 tracking-normal"
                /* 줄 높이 1 (Figma 정본 100%). `.text-base` 가 `.leading-none` 보다 뒤에 선언돼 클래스로는 이기지 못한다. */
                style={{ fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)", lineHeight: "var(--leading-none)" }}
              >
                {project.groupLabel}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4px w-full min-w-0">
            {project.projectBadge && (
              <span
                className="shrink-0 inline-flex items-center h-16px px-4px rounded-4px text-xs font-bold whitespace-nowrap bg-var-color-brand-blue-bg text-color-var-color-brand-blue"
                style={{ fontFamily: NOTO_SANS }}
              >
                {project.projectBadge}
              </span>
            )}
            <p
              className="text-md font-bold text-secondary overflow-hidden text-ellipsis min-w-0 tracking-default"
              style={{ fontFamily: NOTO_SANS }}
            >
              {project.projectLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between shrink-0 size-16px">
          <img alt="" className="size-16px" src={icon("chevron-right.svg")} />
        </div>
      </div>
    </button>
  );
}
