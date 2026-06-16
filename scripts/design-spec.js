#!/usr/bin/env node
/**
 * design-spec — DESIGN.md 사양 자체를 출력.
 *
 * 에이전트 프롬프트에 사양 맥락을 주입하는 용도.
 *
 * Usage:
 *   node scripts/design-spec.js                → 전체 사양 출력
 *   node scripts/design-spec.js yaml           → YAML 토큰만 출력
 *   node scripts/design-spec.js prose          → 산문(rationale)만 출력
 *   node scripts/design-spec.js summary        → 토큰 요약 (compact)
 *   node scripts/design-spec.js section <name> → 특정 섹션만 출력
 */

import { readFileSync } from "node:fs";
import { extractYaml, extractProse, loadDesignTokens, flattenTokens, findReferences, DESIGN_PATH } from "./parse-design.js";

const filePath = process.argv[2] === "yaml" || process.argv[2] === "prose" || process.argv[2] === "summary" || process.argv[2] === "section"
  ? DESIGN_PATH : (process.argv[3] || DESIGN_PATH);
const mode = process.argv[2] || "full";

switch (mode) {
  case "yaml": {
    console.log(extractYaml(filePath));
    break;
  }

  case "prose": {
    console.log(extractProse(filePath));
    break;
  }

  case "summary": {
    const tokens = loadDesignTokens(filePath);
    const flat = flattenTokens(tokens);
    const refs = findReferences(flat);

    const colorCount = Object.keys(flat).filter((k) => k.startsWith("colors.")).length;
    const typoCount = Object.keys(flat).filter((k) => k.startsWith("typography.")).length;
    const layoutCount = Object.keys(flat).filter((k) => k.startsWith("layout.")).length;
    const shapeCount = Object.keys(flat).filter((k) => k.startsWith("shapes.")).length;
    const compCount = Object.keys(flat).filter((k) => k.startsWith("components.")).length;

    console.log(`@whatap/design-system — Token Summary`);
    console.log(`${"─".repeat(40)}`);
    console.log(`  총 토큰:      ${Object.keys(flat).length}`);
    console.log(`  참조:         ${refs.length}`);
    console.log(`  ─ Colors:     ${colorCount}`);
    console.log(`  ─ Typography: ${typoCount}`);
    console.log(`  ─ Layout:     ${layoutCount}`);
    console.log(`  ─ Shapes:     ${shapeCount}`);
    console.log(`  ─ Components: ${compCount}`);
    console.log(`  섹션:         ${Object.keys(tokens).join(", ")}`);

    // Typography patterns
    if (tokens.typography) {
      const patterns = Object.keys(tokens.typography).filter((k) => k.startsWith("pattern-"));
      if (patterns.length) {
        console.log(`  ─ Patterns:   ${patterns.map((p) => p.replace("pattern-", "")).join(", ")}`);
      }
    }

    // Tone types
    if (tokens.colors?.["tone-types"]) {
      console.log(`  ─ Tones:      ${tokens.colors["tone-types"].join(", ")}`);
    }

    break;
  }

  case "section": {
    const sectionName = process.argv[3];
    if (!sectionName) {
      console.error("사용법: node scripts/design-spec.js section <section-name>");
      console.error("섹션: overview, colors, typography, layout, shapes, components");
      process.exit(1);
    }

    const tokens = loadDesignTokens(filePath);
    if (tokens[sectionName]) {
      console.log(JSON.stringify(tokens[sectionName], null, 2));
    } else {
      console.error(`❌ 섹션 '${sectionName}' 을(를) 찾을 수 없습니다.`);
      console.error(`   사용 가능: ${Object.keys(tokens).join(", ")}`);
      process.exit(1);
    }

    // 해당 섹션의 산문도 출력
    const prose = extractProse(filePath);
    const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    const regex = new RegExp(`^## ${sectionTitle}[\\s\\S]*?(?=^## |$)`, "gm");
    const match = prose.match(regex);
    if (match) {
      console.log(`\n${"─".repeat(40)}\n`);
      console.log(match[0].trim());
    }
    break;
  }

  case "full":
  default: {
    const src = readFileSync(DESIGN_PATH, "utf-8");
    console.log(src);
    break;
  }
}
