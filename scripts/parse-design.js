/**
 * parse-design.js — DESIGN.md YAML front matter 파서 (zero-dependency).
 *
 * YAML 의 모든 기능을 지원하지 않음 — DESIGN.md 에서 사용하는 서브셋만:
 *   scalar(string, number), mapping, sequence (inline [...]), comments (#).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DESIGN_PATH = resolve(import.meta.dirname, "..", "DESIGN.md");

/** DESIGN.md 에서 YAML front matter 텍스트만 추출. */
export function extractYaml(filePath = DESIGN_PATH) {
  const src = readFileSync(filePath, "utf-8");
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("DESIGN.md 에서 YAML front matter 를 찾을 수 없습니다.");
  return m[1];
}

/** DESIGN.md 에서 markdown 산문(front matter 이후)만 추출. */
export function extractProse(filePath = DESIGN_PATH) {
  const src = readFileSync(filePath, "utf-8");
  const idx = src.indexOf("\n---", 4); // skip opening ---
  if (idx === -1) return "";
  return src.slice(idx + 4).trim();
}

/* ── Minimal YAML parser ─────────────────────────────── */

function stripComment(line) {
  // 따옴표 밖의 # 만 제거
  let inQ = false, qc = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) { if (c === qc) inQ = false; continue; }
    if (c === '"' || c === "'") { inQ = true; qc = c; continue; }
    if (c === "#") return line.slice(0, i).trimEnd();
  }
  return line;
}

function parseValue(raw) {
  if (raw === "" || raw === "~" || raw === "null") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  // inline sequence [a, b, c]
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw.slice(1, -1).split(",").map((s) => parseValue(s.trim()));
  }
  // inline mapping { key: val, ... }
  if (raw.startsWith("{") && raw.endsWith("}")) {
    const obj = {};
    const inner = raw.slice(1, -1);
    // simple split — doesn't handle nested
    for (const pair of inner.split(",")) {
      const ci = pair.indexOf(":");
      if (ci === -1) continue;
      const k = pair.slice(0, ci).trim().replace(/^["']|["']$/g, "");
      const v = pair.slice(ci + 1).trim().replace(/^["']|["']$/g, "");
      obj[k] = parseValue(v);
    }
    return obj;
  }
  // quoted string
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  // number
  const n = Number(raw);
  if (!Number.isNaN(n) && raw !== "") return n;
  return raw;
}

/**
 * 최소 YAML 파서. indent 기반 nesting.
 * @param {string} yaml
 * @returns {object}
 */
export function parseYaml(yaml) {
  const lines = yaml.split("\n");
  const root = {};
  const stack = [{ indent: -1, obj: root }];

  for (const rawLine of lines) {
    const stripped = stripComment(rawLine);
    if (stripped.trim() === "") continue;

    const indent = stripped.search(/\S/);
    const content = stripped.trim();

    // pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    const colonIdx = content.indexOf(":");
    if (colonIdx === -1) continue;

    let key = content.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
    const rest = content.slice(colonIdx + 1).trim();

    if (rest === "" || rest === "|" || rest === ">") {
      // nested mapping
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = parseValue(rest);
    }
  }

  return root;
}

/** DESIGN.md 를 파싱하여 토큰 객체 반환. */
export function loadDesignTokens(filePath = DESIGN_PATH) {
  return parseYaml(extractYaml(filePath));
}

/** 토큰 객체를 flat key→value 맵으로 변환. */
export function flattenTokens(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      flattenTokens(v, path, out);
    } else {
      out[path] = v;
    }
  }
  return out;
}

/** {section.path} Reference 를 찾아 반환. */
export function findReferences(flat) {
  const refs = [];
  for (const [key, val] of Object.entries(flat)) {
    if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
      refs.push({ key, ref: val.slice(1, -1) });
    }
  }
  return refs;
}

export { DESIGN_PATH };
