/**
 * _useTokens — 토큰 카탈로그가 **CSS 를 직접 읽도록** 하는 훅 모음.
 *
 * ## Purpose
 * 카탈로그가 `<Swatch color="#296CF2" hex="#296CF2" />` 처럼 값을 손으로 적으면
 * `tokens.css` 와 **두 벌**이 된다. 실제로 그 상태에서 (a) 설명이 낡고
 * (b) 새로 추가한 토큰이 카탈로그에 누락되고 (c) 값이 드리프트해도 아무도 모른다.
 *
 * 그래서 값을 적지 않는다 — `:root` 에 선언된 커스텀 프로퍼티를 **런타임에 열거**하고,
 * 계산값은 `document.documentElement` 에서 읽는다. 결과:
 *
 * - 토큰을 추가하면 카탈로그에 **자동으로 나타난다** (손으로 등록할 필요 없음).
 * - 값을 바꾸면 카탈로그가 **자동으로 따라간다** (드리프트 불가).
 * - `.dark` 를 켜면 다크 값이 그대로 보인다 (계산값을 읽으므로).
 *
 * ## When NOT to use
 * - 컴포넌트 런타임 스타일 → 그냥 `var(--token)` 을 쓴다. 이건 **카탈로그 전용**이다.
 * - 토큰의 *의미*(용도 설명) → CSS 에서 읽을 수 없다. 설명은 카탈로그가 소유한다.
 */
import { useEffect, useState } from "react";

/** `:root`/`:host` 규칙에 선언된 커스텀 프로퍼티 이름을 전부 모은다 (선언 순서 보존). */
function collectTokenNames(): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // 크로스 오리진 스타일시트는 접근 불가 → 조용히 건너뜀
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      // `:root`, `:root, :host`, `.dark` … 커스텀 프로퍼티를 선언하는 규칙 전부
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style[i];
        if (prop.startsWith("--") && !seen.has(prop)) {
          seen.add(prop);
          names.push(prop);
        }
      }
    }
  }
  return names;
}

/** 현재 테마 기준 계산값. */
function readValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export type TokenEntry = { name: string; value: string };

/**
 * `prefix` 로 시작하는 토큰을 이름·계산값 쌍으로 반환.
 *
 * `.dark` 토글을 감지해 값을 다시 읽으므로, 다크로 전환하면 표시값도 함께 바뀐다.
 *
 * @param prefix 예: `"--color-status-"` · `"--shadow-"`
 * @param exclude 부분일치로 제외할 조각 (예: 팔레트 hex-suffix 토큰 걸러내기)
 */
export function useTokens(prefix: string, exclude: string[] = []): TokenEntry[] {
  const [entries, setEntries] = useState<TokenEntry[]>([]);

  useEffect(() => {
    const sync = () => {
      const names = collectTokenNames().filter(
        (n) => n.startsWith(prefix) && !exclude.some((x) => n.includes(x))
      );
      setEntries(names.map((name) => ({ name, value: readValue(name) })));
    };
    sync();

    // 테마 토글 = documentElement 의 class/data-theme 변경 → 계산값 재읽기
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
    // prefix/exclude 는 호출처에서 모듈 상수로 넘긴다 (배열 identity 변동 방지)
  }, [prefix, exclude]);

  return entries;
}

/** 토큰 이름에서 표시용 라벨 — `--color-brand-blue` → `color-brand-blue`. */
export function tokenLabel(name: string): string {
  return name.replace(/^--/, "");
}
