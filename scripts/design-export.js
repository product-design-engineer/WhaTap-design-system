#!/usr/bin/env node
/**
 * design-export — DESIGN.md 토큰을 Tailwind theme config 또는 DTCG tokens.json 으로 변환.
 *
 * Usage:
 *   node scripts/design-export.js tailwind          → stdout JSON (Tailwind v4 theme)
 *   node scripts/design-export.js dtcg              → stdout JSON (W3C DTCG tokens.json)
 *   node scripts/design-export.js tailwind -o out.js → 파일 출력
 *   node scripts/design-export.js dtcg -o out.json  → 파일 출력
 */

import { writeFileSync } from "node:fs";
import { loadDesignTokens, flattenTokens } from "./parse-design.js";

const args = process.argv.slice(2);
const format = args[0] || "tailwind";
const outIdx = args.indexOf("-o");
const outFile = outIdx !== -1 ? args[outIdx + 1] : null;

const tokens = loadDesignTokens();

/* ── 유틸 ──────────────────────────────────────────────── */

function resolveRef(val, flat) {
  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    const path = val.slice(1, -1);
    return flat[path] !== undefined ? resolveRef(flat[path], flat) : val;
  }
  return val;
}

const flat = flattenTokens(tokens);

/* ── Tailwind v4 Theme ─────────────────────────────────── */

function exportTailwind() {
  const theme = { colors: {}, fontSize: {}, fontWeight: {}, fontFamily: {}, lineHeight: {}, letterSpacing: {} };

  // Colors
  if (tokens.colors) {
    for (const [k, v] of Object.entries(tokens.colors)) {
      if (typeof v !== "string") continue;
      const resolved = resolveRef(v, flat);
      if (typeof resolved === "string" && resolved.startsWith("#")) {
        theme.colors[k] = resolved;
      }
    }
  }

  // Typography
  if (tokens.typography) {
    const typo = tokens.typography;

    // font-family
    for (const [k, v] of Object.entries(typo)) {
      if (k.startsWith("family-") && typeof v === "string") {
        theme.fontFamily[k.replace("family-", "")] = v.split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
      }
    }

    // font-size
    for (const [k, v] of Object.entries(typo)) {
      if (k.startsWith("size-") && typeof v === "string") {
        theme.fontSize[k.replace("size-", "")] = v;
      }
    }

    // font-weight
    for (const [k, v] of Object.entries(typo)) {
      if (k.startsWith("weight-") && typeof v === "number") {
        theme.fontWeight[k.replace("weight-", "")] = String(v);
      }
    }

    // line-height
    for (const [k, v] of Object.entries(typo)) {
      if (k.startsWith("leading-") && !k.startsWith("leading-px-")) {
        theme.lineHeight[k.replace("leading-", "")] = String(v);
      }
    }

    // letter-spacing
    for (const [k, v] of Object.entries(typo)) {
      if (k.startsWith("tracking-") && typeof v === "string") {
        theme.letterSpacing[k.replace("tracking-", "")] = v;
      }
    }
  }

  // Clean empty
  for (const [k, v] of Object.entries(theme)) {
    if (typeof v === "object" && Object.keys(v).length === 0) delete theme[k];
  }

  return theme;
}

/* ── W3C DTCG tokens.json ──────────────────────────────── */

function classifyType(key, val) {
  if (typeof val === "string") {
    if (val.startsWith("#")) return "color";
    if (val.startsWith("{") && val.endsWith("}")) return "reference";
    if (/^-?\d+(\.\d+)?(px|em|rem|ms|pt|%)$/.test(val)) return "dimension";
    if (val.startsWith("linear-gradient")) return "color";  // gradient as color
  }
  if (typeof val === "number") {
    if (key.includes("weight")) return "fontWeight";
    if (key.includes("leading")) return "number";
    return "number";
  }
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    if (val.fontFamily || val.fontSize) return "typography";
  }
  return "string";
}

function toDtcgValue(val, key, allFlat) {
  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    // DTCG uses {path.to.token} — already in this format
    return val;
  }
  return val;
}

function exportDtcg() {
  const dtcg = {};

  function addGroup(groupName, source) {
    if (!source || typeof source !== "object") return;
    const group = {};
    for (const [k, v] of Object.entries(source)) {
      if (v === null || v === undefined) continue;

      if (typeof v === "object" && !Array.isArray(v)) {
        // Check if it's a typography pattern (has fontFamily/fontSize)
        if (v.fontFamily || v.fontSize) {
          group[k] = {
            $type: "typography",
            $value: {
              fontFamily: resolveRef(v.fontFamily || v.family, flat),
              fontSize: resolveRef(v.fontSize || v.size, flat),
              fontWeight: resolveRef(v.fontWeight || v.weight, flat),
              lineHeight: resolveRef(v.lineHeight, flat),
              letterSpacing: resolveRef(v.letterSpacing, flat),
            },
          };
        } else {
          // Nested group
          const sub = {};
          for (const [sk, sv] of Object.entries(v)) {
            if (sv === null || sv === undefined) continue;
            const fullKey = `${groupName}.${k}.${sk}`;
            sub[sk] = {
              $type: classifyType(fullKey, sv),
              $value: toDtcgValue(sv, fullKey, flat),
            };
          }
          group[k] = sub;
        }
      } else if (Array.isArray(v)) {
        group[k] = { $type: "array", $value: v };
      } else {
        const fullKey = `${groupName}.${k}`;
        group[k] = {
          $type: classifyType(fullKey, v),
          $value: toDtcgValue(v, fullKey, flat),
        };
      }
    }
    dtcg[groupName] = group;
  }

  addGroup("colors", tokens.colors);
  addGroup("typography", tokens.typography);
  if (tokens.layout) addGroup("layout", tokens.layout);
  if (tokens.shapes) addGroup("shapes", tokens.shapes);
  if (tokens.components) addGroup("components", tokens.components);

  return dtcg;
}

/* ── 실행 ──────────────────────────────────────────────── */

let result;

if (format === "tailwind") {
  result = exportTailwind();
} else if (format === "dtcg") {
  result = exportDtcg();
} else {
  console.error(`❌ 알 수 없는 포맷: '${format}'. 'tailwind' 또는 'dtcg' 를 사용하세요.`);
  process.exit(1);
}

const json = JSON.stringify(result, null, 2);

if (outFile) {
  writeFileSync(outFile, json + "\n", "utf-8");
  console.log(`✅ Exported ${format} → ${outFile} (${Object.keys(flattenTokens(result)).length} entries)`);
} else {
  console.log(json);
}
