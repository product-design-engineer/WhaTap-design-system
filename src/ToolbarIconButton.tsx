import type { ButtonHTMLAttributes, ReactNode } from "react";
import Tooltip, { type TooltipPlacement } from "./Tooltip";

/**
 * ToolbarIconButton — Chrome / Foundation. 툴바 한 줄에 놓이는 **아이콘 전용** 정사각 버튼.
 *
 * ## Purpose
 * 라벨 없이 아이콘 하나만 담는 컨트롤(설정 ⚙ · 새로고침 ↻ · 전체화면 등)을 렌더한다.
 * 박스는 툴바 컨트롤 높이(32px)와 **같은 값의 정사각**, 아이콘은 툴바 아이콘 토큰(16px).
 *
 * ## When to use
 * - 툴바·옵션바 한 줄에서 라벨 없이 아이콘만 노출하는 컨트롤.
 * - 같은 줄의 다른 컨트롤(타이머·필터·셀렉트)과 높이를 맞춰야 하는 자리.
 *
 * ## When NOT to use
 * - 라벨이 함께 붙는 버튼 → [[Button]] / [[HeaderPillButton]].
 * - 48px 페이지 헤더 안의 아이콘 → 헤더 전용 spec([[PageHeader]] 내부).
 * - AI 진입점 → [[AiTriggerButton]] / [[AiAssistantButton]].
 *
 * ## Composition rules
 * - 박스는 `--wds-toolbar-control-h` 정사각. 폭을 따로 주지 않는다(정사각이 아니면 줄 안에서
 *   아이콘 버튼만 홀쭉해 보인다).
 * - 아이콘 크기는 `--wds-toolbar-icon`(16px) 고정. 개별 화면에서 px 을 직접 주지 않는다.
 * - `label` 은 필수 — 아이콘만 있는 버튼은 스크린리더에 이름이 없다. `aria-label` 로 들어가고,
 *   동시에 [[Tooltip]] 본문이 된다. 네이티브 `title` 은 쓰지 않는다 — 브라우저 기본 툴팁은
 *   등장까지 1초 이상 걸리고 위치·타이포가 제품과 다르다. 아이콘만 있는 버튼은 **무엇인지
 *   알 방법이 툴팁뿐**이라, 지연이 곧 기능 없음과 같다.
 * - `icon` 은 asset 이름(문자열, `/icons/*.svg`) 또는 인라인 SVG 노드. 문자열이면 토큰 크기의
 *   `<img>` 로 렌더된다.
 * - 이모지·텍스트 글리프(`⚙`)를 아이콘 대신 쓰지 않는다 — 폰트에 따라 크기·정렬·색이 전부
 *   달라지고 크기 토큰이 적용되지 않는다.
 *
 * @covers ToolbarIcon
 *
 * @example
 * ```tsx
 * <ToolbarIconButton icon="icon-settings.svg" label="표시 설정" onClick={openSettings} />
 * <ToolbarIconButton icon={<MyGlyph />} label="새로고침" active={live} />
 * ```
 */
export type ToolbarIconButtonProps = {
  /** asset 이름(`"icon-settings.svg"`) 또는 인라인 SVG. */
  icon: string | ReactNode;
  /** 접근성 이름 + 툴팁. 아이콘 전용 버튼이라 필수. */
  label: string;
  /** 눌린 상태(토글 컨트롤). `aria-pressed` 로도 노출된다. */
  active?: boolean;
  /** 툴팁 방향. 기본 `"top"`. 툴바가 화면 맨 위에 붙어 있으면 `"bottom"`. */
  tooltipPlacement?: TooltipPlacement;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "title" | "children">;

const ICON_SIZE = "var(--wds-toolbar-icon)";

/**
 * ToolbarIcon — 툴바 컨트롤 **안에** 놓이는 아이콘 하나(라벨 앞 leading 아이콘 · caret 등).
 *
 * 크기를 화면에서 px 로 쓰지 않게 하려고 둔 최소 래퍼다. `ToolbarIconButton` 은 버튼 전체를
 * 만들지만, 라벨이 붙는 컨트롤은 버튼 껍데기가 이미 있으므로 아이콘만 필요하다.
 *
 * `size`
 *  - `"default"`(기본) — `--wds-toolbar-icon`(16px). 라벨 앞 leading 아이콘.
 *  - `"xs"` — `--wds-icon-xs`(12px). caret·닫기 등 **보조 표식**. 라벨과 같은 무게로 읽히면
 *    안 되는 것들이라 한 단계 낮춘다.
 */
export function ToolbarIcon({
  name,
  size = "default",
  className,
}: {
  /** asset 이름 — `/icons/<name>`. */
  name: string;
  size?: "default" | "xs";
  className?: string;
}) {
  const px = size === "xs" ? "var(--wds-icon-xs)" : ICON_SIZE;
  return (
    <img
      src={`/icons/${name}`}
      alt=""
      aria-hidden
      className={`shrink-0 ${className ?? ""}`}
      /* 정사각 박스 안에 **비율 유지**로 그린다 — caret 처럼 8×5 같은 비정사각 에셋을
         width=height 로 늘리면 도형이 찌그러진다. */
      style={{ width: px, height: px, objectFit: "contain" }}
    />
  );
}

export default function ToolbarIconButton({
  icon,
  label,
  active,
  tooltipPlacement = "top",
  style,
  ...rest
}: ToolbarIconButtonProps) {
  return (
    <Tooltip content={label} placement={tooltipPlacement}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className="flex items-center justify-center shrink-0 rounded-4px border border-color-var-color-border-default cursor-pointer hover-bg-surface-100 transition-colors"
      style={{
        /* 정사각 — 폭과 높이 모두 툴바 컨트롤 높이 토큰에서 온다. */
        width: "var(--wds-toolbar-control-h)",
        height: "var(--wds-toolbar-control-h)",
        padding: 0,
        background: active ? "var(--color-brand-blue-bg)" : "var(--color-card)",
        ...style,
      }}
      {...rest}
    >
      {typeof icon === "string" ? (
        <img src={`/icons/${icon}`} alt="" aria-hidden style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: "contain" }} />
      ) : (
        <span
          aria-hidden
          className="flex items-center justify-center"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
        >
          {icon}
        </span>
      )}
    </button>
    </Tooltip>
  );
}
