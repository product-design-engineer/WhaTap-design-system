/**
 * devPolicyGuard — DS 정책 위반 런타임 가드 (개발 전용).
 *
 * ## Purpose
 * `scripts/check-no-raw-colors.mjs` 는 CI 시점에만 동작한다. 사람이 화면을 보며
 * 작업하는 동안에는 정책 위반 신호가 전혀 없어서, "회색 바닥에 카드 없이 놓인
 * 테이블" 같은 위반이 눈에 띄지 않는다. 이 가드는 살아있는 DOM 을 스캔해
 * 위반 요소에 **빨간 점선 outline + 배지**를 씌우고 console 에 규칙을 남긴다.
 *
 * ## When to use
 * - Storybook — `.storybook/preview.tsx` 에서 자동 적용 (별도 조치 불필요).
 * - 소비 앱(프로토타입 등) 개발 모드 — 진입점에서 한 줄:
 *   ```ts
 *   if (import.meta.env.DEV) import("@whatap/design-system")
 *     .then((m) => m.enableDsPolicyGuard());
 *   ```
 *
 * ## When NOT to use
 * - **프로덕션 빌드** — `enableDsPolicyGuard()` 를 호출하지 않으면 그만이다.
 *   호출해도 스캔만 하고 앱 동작은 바꾸지 않지만, 굳이 켤 이유가 없다.
 * - CI 게이트 대용 — 이건 *인지*용이고, *차단*은 `npm run lint:tokens` 가 한다.
 *
 * ## Composition rules
 * - DOM 을 읽기만 한다. 위반 요소에 `data-ds-violation` 속성과 outline 만 추가하고,
 *   레이아웃에 영향 주는 노드는 삽입하지 않는다(배지는 `::after`).
 * - 정당한 예외는 요소에 `data-ds-policy-ok="<이유>"` — 소스의 `// raw-color-ok:` 와 같은 역할.
 * - 반환값은 해제 함수. 다시 호출하면 이전 인스턴스를 정리한다.
 *
 * @example
 * ```ts
 * const stop = enableDsPolicyGuard();
 * // ... 개발 중 ...
 * stop(); // outline 제거 + 관찰 중단
 * ```
 */

/** 위반 유형 — 화면 배지와 console 메시지에 그대로 노출된다. */
export type DsPolicyRule =
  | "raw-color"
  | "uncarded-content"
  | "surface-collapse"
  | "card-depth";

type Violation = { el: Element; rule: DsPolicyRule; detail: string; fix: string };

export type DsPolicyGuardOptions = {
  /** 검사할 규칙. 기본은 전부. */
  rules?: DsPolicyRule[];
  /** console 출력 여부 (기본 true). */
  log?: boolean;
  /** 스캔 루트 (기본 document.body). */
  root?: ParentNode;
};

const ALL_RULES: DsPolicyRule[] = [
  "raw-color",
  "uncarded-content",
  "surface-collapse",
  "card-depth",
];

const RULE_LABEL: Record<DsPolicyRule, string> = {
  "raw-color": "인라인 색 리터럴",
  "uncarded-content": "카드 없는 본문 블록",
  "surface-collapse": "page·card 동일색",
  "card-depth": "3층 이상 중첩 카드",
};

const STYLE_ID = "ds-policy-guard-style";
const BANNER_ID = "ds-policy-guard-banner";

/* 경보 색 — 개발 전용 오버레이. 테마와 무관하게 항상 같은 빨강이어야 눈에 띄므로
   의도적으로 토큰을 쓰지 않는다. 이 두 줄이 DS 안에서 유일하게 허용된 예외. */
// raw-color-ok: 정책 위반 경보색 — 테마 무관 고정. 토큰화하면 다크에서 묻힌다.
const ALARM = "#FF0033";
// raw-color-ok: 경보 배경 위 전경 텍스트 — 테마 무관 고정.
const ALARM_FG = "#fff";

/* ── 탐지 ──────────────────────────────────────────────────────────────── */

// var(--...) 안에 들어간 hex 는 토큰 정의부이므로 제외하고, 남은 리터럴만 본다.
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const RGB = /\brgba?\(\s*[\d.]/;
const COLOR_UTIL = /\b(?:bg|text|border|fill|stroke)-(?:white|black)\b/;

function stripVars(s: string): string {
  return s.replace(/var\([^)]*\)/g, "");
}

function isExempt(el: Element): boolean {
  return el.closest("[data-ds-policy-ok]") !== null;
}

function checkRawColor(root: ParentNode, out: Violation[]): void {
  for (const el of root.querySelectorAll<HTMLElement>("[style], [class]")) {
    if (isExempt(el)) continue;

    const style = stripVars(el.getAttribute("style") ?? "");
    if (HEX.test(style) || RGB.test(style)) {
      out.push({
        el,
        rule: "raw-color",
        detail: `인라인 style 에 색 리터럴 — ${style.match(HEX)?.[0] ?? style.match(RGB)?.[0]}`,
        fix: "토큰으로: var(--color-card) · var(--color-border-strong) · var(--color-text-tertiary) 등",
      });
      continue;
    }

    // SVG 의 fill/stroke 속성도 같은 규칙
    for (const attr of ["fill", "stroke"] as const) {
      const v = stripVars(el.getAttribute(attr) ?? "");
      if (HEX.test(v) || RGB.test(v)) {
        out.push({
          el,
          rule: "raw-color",
          detail: `${attr}="${el.getAttribute(attr)}" — SVG 색 리터럴`,
          fix: '무채색 아이콘은 var(--color-text-tertiary). 컬러 위 고정 흰색이면 data-ds-policy-ok="이유"',
        });
        break;
      }
    }

    const cls = typeof el.className === "string" ? el.className : "";
    const hit = cls.match(COLOR_UTIL);
    if (hit) {
      out.push({
        el,
        rule: "raw-color",
        detail: `${hit[0]} — 테마 무관 고정색 유틸`,
        fix: "표면이면 bg-card / 텍스트면 색 위계 토큰. 컬러 위 전경이면 data-ds-policy-ok",
      });
    }
  }
}

/** 요소가 "떠 있는 표면"(카드)으로 보이는가 — 배경이 card 색이거나 보더가 있으면 카드로 친다. */
function looksLikeCard(el: Element, cardColor: string): boolean {
  const cs = getComputedStyle(el);
  if (cs.backgroundColor === cardColor) return true;
  const bw = parseFloat(cs.borderTopWidth) || 0;
  return bw > 0 && cs.borderTopStyle !== "none";
}

function checkUncardedContent(root: ParentNode, cardColor: string, out: Violation[]): void {
  for (const page of root.querySelectorAll(".wds-page-content")) {
    for (const child of Array.from(page.children)) {
      if (isExempt(child)) continue;
      // 레이아웃 전용 래퍼(자식이 전부 카드)는 통과시킨다.
      const kids = Array.from(child.children);
      const wrapperOfCards =
        kids.length > 0 && kids.every((k) => looksLikeCard(k, cardColor));
      if (looksLikeCard(child, cardColor) || wrapperOfCards) continue;

      out.push({
        el: child,
        rule: "uncarded-content",
        detail: "회색 바닥(--color-bg) 위에 카드 없이 놓인 본문 블록",
        fix: "의미 단위(테이블·차트·폼 섹션)는 bg-card 블록으로 감쌀 것",
      });
    }
  }
}

/**
 * 요소가 **명시적으로** card 표면을 선언했는가.
 *
 * 계산된 배경색으로 판정하면 흰 배경을 물려받은 `<li>`·`<a>` 같은 평범한 요소가
 * 전부 카드로 잡혀 오탐이 폭증한다. 선언 의도(`bg-card` 클래스 / `var(--color-card)`
 * 인라인)가 있는 것만 카드로 센다.
 */
function declaresCard(el: Element): boolean {
  const cls = typeof el.className === "string" ? el.className : "";
  if (/\bbg-card\b/.test(cls)) return true;
  const style = el.getAttribute("style") ?? "";
  return /background(-color)?\s*:\s*var\(--color-card\)/.test(style);
}

/**
 * 본문 콘텐츠 영역 안에서만 검사한다. 사이드바·헤더 같은 chrome 은 card 표면을
 * 정상적으로 중첩하므로(레이아웃 → 패널 → 카드) 깊이 규칙의 대상이 아니다.
 */
function checkCardDepth(root: ParentNode, out: Violation[]): void {
  for (const page of root.querySelectorAll(".wds-page-content")) {
    for (const el of page.querySelectorAll("*")) {
      if (isExempt(el) || !declaresCard(el)) continue;

      let depth = 0;
      for (let p = el.parentElement; p && p !== page; p = p.parentElement) {
        if (declaresCard(p)) depth++;
      }
      if (depth >= 2) {
        out.push({
          el,
          rule: "card-depth",
          detail: `card 표면이 ${depth + 1}층으로 중첩됨`,
          fix: "층은 page → card 2단까지. 더 필요하면 surface-50/100/200 으로 표현",
        });
      }
    }
  }
}

function readSurfaceTokens(): { bg: string; card: string } {
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: cs.getPropertyValue("--color-bg").trim().toLowerCase(),
    card: cs.getPropertyValue("--color-card").trim().toLowerCase(),
  };
}

/* ── 표시 ──────────────────────────────────────────────────────────────── */

function injectStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
[data-ds-violation] {
  outline: 2px dashed ${ALARM} !important;
  outline-offset: -2px !important;
  position: relative !important;
}
[data-ds-violation]::after {
  content: "⚠ " attr(data-ds-violation);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2147483646;
  background: ${ALARM};
  color: ${ALARM_FG};
  font: 700 10px/1.4 ui-monospace, monospace;
  padding: 2px 6px;
  border-radius: 0 0 3px 0;
  pointer-events: none;
  white-space: nowrap;
}
#${BANNER_ID} {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 2147483647;
  background: ${ALARM};
  color: ${ALARM_FG};
  font: 700 13px/1.5 ui-monospace, monospace;
  padding: 10px 16px;
  text-align: center;
}
`;
  document.head.appendChild(s);
}

function clearMarks(root: ParentNode): void {
  for (const el of root.querySelectorAll("[data-ds-violation]")) {
    el.removeAttribute("data-ds-violation");
  }
  document.getElementById(BANNER_ID)?.remove();
}

/* ── 진입점 ────────────────────────────────────────────────────────────── */

let activeStop: (() => void) | null = null;

/**
 * DS 정책 위반 런타임 가드를 켠다. 반환값은 해제 함수.
 * 재호출 시 이전 인스턴스를 정리하고 새로 시작한다.
 */
export function enableDsPolicyGuard(options: DsPolicyGuardOptions = {}): () => void {
  if (typeof document === "undefined") return () => {};
  activeStop?.();

  const rules = new Set(options.rules ?? ALL_RULES);
  const shouldLog = options.log ?? true;
  const root = options.root ?? document.body;

  injectStyle();

  let queued = false;
  const scan = (): void => {
    queued = false;
    clearMarks(root);

    const { bg, card } = readSurfaceTokens();
    const violations: Violation[] = [];

    if (rules.has("surface-collapse") && bg && bg === card) {
      const banner = document.createElement("div");
      banner.id = BANNER_ID;
      banner.textContent =
        "⚠ DS 정책 위반 — --color-bg 와 --color-card 가 같은 값입니다. 카드가 보더만 남아 층이 사라집니다.";
      document.body.appendChild(banner);
      if (shouldLog) {
        console.error(
          `[DS 정책] surface-collapse — --color-bg(${bg}) === --color-card(${card}).\n` +
            "  → 페이지는 회색, 카드는 흰색이어야 합니다. docs/tokens.md → Base Surface"
        );
      }
    }

    // 카드 판정에 쓰는 실제 계산색 (토큰 문자열이 아니라 rgb() 형태여야 비교 가능)
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--color-card)";
    probe.style.display = "none";
    document.body.appendChild(probe);
    const cardColor = getComputedStyle(probe).backgroundColor;
    probe.remove();

    if (rules.has("raw-color")) checkRawColor(root, violations);
    if (rules.has("uncarded-content")) checkUncardedContent(root, cardColor, violations);
    if (rules.has("card-depth")) checkCardDepth(root, violations);

    for (const v of violations) {
      v.el.setAttribute("data-ds-violation", `${v.rule} — ${RULE_LABEL[v.rule]}`);
    }

    if (shouldLog && violations.length) {
      console.group(`%c[DS 정책] 위반 ${violations.length}건`, `color:${ALARM};font-weight:700`);
      for (const v of violations) {
        console.error(`${v.rule} — ${v.detail}\n  → ${v.fix}`, v.el);
      }
      console.info("정책 전문: docs/tokens.md → Base Surface — 페이지 vs 카드");
      console.groupEnd();
    }
  };

  const schedule = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  };

  const observer = new MutationObserver((records) => {
    // 가드 자신이 만든 변경(마크·배너)으로 재귀 스캔하지 않는다.
    const selfOnly = records.every(
      (r) =>
        r.attributeName === "data-ds-violation" ||
        (r.target as Element)?.id === BANNER_ID
    );
    if (!selfOnly) schedule();
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "class", "fill", "stroke", "data-ds-policy-ok"],
  });

  schedule();

  const stop = (): void => {
    observer.disconnect();
    clearMarks(root);
    document.getElementById(STYLE_ID)?.remove();
    if (activeStop === stop) activeStop = null;
  };
  activeStop = stop;
  return stop;
}
