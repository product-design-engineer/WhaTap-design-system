import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Foundation/WhaTap Symbol
 *
 * WhaTap 브랜드 심볼 (4 컬러 바) + Horizon (심볼 + 워드마크) 가로형 조합.
 *
 * `whatap-design-system-storybook.vercel.app` 의 동일 path 카탈로그를 AI Prototype Storybook 에
 * **그대로 옮긴 자산**입니다. 소스의 vanilla JS DOM-builder → React TSX 변환.
 *
 * 브랜드 색:
 * - Orange `--color-logo-orange`
 * - Yellow `--color-logo-yellow`
 * - Green  `--color-logo-green`
 * - Blue   `--color-logo-blue`
 *
 * 주의: 이 심볼은 AI Prototype 의 `<AiSymbol>` (보라 그라데이션 pinwheel, AI 응답 전용 마크) 과는
 * 별개입니다. WhaTap 회사·제품 브랜드를 식별할 때는 본 심볼, AI 기능 식별일 때는 `<AiSymbol>` 사용.
 */
const meta: Meta = {
  title: "Primitives/WhaTap Symbol",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**WhaTap 브랜드 심볼 + Horizon 워드마크.** 4 컬러 바 (Orange/Yellow/Green/Blue) 로 구성된 회사 브랜드 마크. " +
          "이 카탈로그는 [`whatap-design-system-storybook`](https://whatap-design-system-storybook.vercel.app/?path=/story/foundation-whatap-symbol--symbol) 의 동일 항목을 AI Prototype Storybook 에 미러링한 것입니다. " +
          "AI 기능 식별용 마크는 [Chrome/AiSymbol](?path=/story/chrome-aisymbol--default) — 별개의 보라 그라데이션 pinwheel.\n\n" +
          "✅ **Do** — 회사·제품 브랜드를 식별할 때만 사용(사이드바 로고 헤더 등) · 4 컬러 바 비율 그대로 스케일\n\n" +
          "❌ **Don't** — AI 기능 표식으로 사용(그건 `AiSymbol`) · 컬러 바 색을 바꾸거나 일부만 쓰기 · " +
          "심볼을 인라인 SVG 로 다시 그리기(브랜드 마크는 재구현 금지)\n\n" +
          // ↓ build-components-json 이 whenToUse/whenNotToUse 로 읽는 섹션(의도 검색 기준).
          "## When to use\n" +
          "- 회사·제품 브랜드를 식별하는 자리 — 사이드바 로고 헤더 · 로그인 화면 · 문서 표지.\n" +
          "- 워드마크가 함께 필요하면 Horizon(심볼 + 워드마크) 가로 조합.\n\n" +
          "## When NOT to use\n" +
          "- AI 기능 식별 → `AiSymbol`(보라 그라데이션 pinwheel). 두 마크를 섞지 않는다.\n" +
          "- 로딩·상태 인디케이터로 사용하지 말 것 — 브랜드 마크는 상태를 뜻하지 않는다.\n" +
          "- 색·비율을 바꿔 쓰지 말 것(브랜드 토큰 고정).",
      },
    },
  },
};
export default meta;

/* ─── Symbol — 4 컬러 바 (16x16 base, Figma 원본) ─────────────────── */

function WhaTapSymbol({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WhaTap Symbol"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M0 12.87H1.93V8.84H0V12.87Z" fill="var(--color-logo-orange)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M3.54 12.87H5.47V4.51H3.54V12.87Z" fill="var(--color-logo-yellow)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M7.09 12.87H9.02V0H7.09V12.87Z" fill="var(--color-logo-green)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12.56 0H15.46V1.93H12.56V12.87H10.63V0H12.56Z" fill="var(--color-logo-blue)" />
    </svg>
  );
}

/* ─── Horizon — 심볼 + 워드마크 가로형 (127x24 base, Figma 원본) ─── */

function WhaTapHorizon({ height = 24, color = "var(--color-text-secondary)" }: { height?: number; color?: string }) {
  const width = Math.round(height * (127 / 24));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 127 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WhaTap Horizon"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M114.212 11.94C114.212 13.387 114.694 14.593 115.659 15.679C116.624 16.643 117.83 17.246 119.156 17.246C120.483 17.246 121.689 16.764 122.654 15.799C123.619 14.834 124.101 13.628 124.101 12.181C124.101 10.734 123.619 9.528 122.654 8.442C121.689 7.477 120.483 6.995 119.036 6.995C117.709 6.995 116.624 7.477 115.659 8.442C114.694 9.407 114.212 10.613 114.212 11.94ZM114.332 17.488V24H111.679V4.704H114.332V6.513C115.056 5.789 115.78 5.307 116.624 4.945C117.468 4.583 118.312 4.462 119.277 4.462C121.448 4.462 123.257 5.186 124.704 6.633C126.151 8.08 126.875 9.89 126.875 12.06C126.875 13.025 126.634 13.99 126.272 14.955C125.91 15.92 125.428 16.643 124.704 17.367C123.981 18.091 123.136 18.694 122.292 19.055C121.448 19.417 120.483 19.658 119.277 19.658C118.312 19.658 117.347 19.538 116.503 19.176C115.78 18.814 115.056 18.211 114.332 17.488ZM96.242 11.94C96.242 13.387 96.724 14.593 97.689 15.679C98.654 16.643 99.86 17.126 101.307 17.126C102.634 17.126 103.719 16.643 104.684 15.679C105.649 14.714 106.131 13.508 106.131 12.181C106.131 10.734 105.649 9.528 104.684 8.563C103.719 7.357 102.634 6.874 101.307 6.874C99.98 6.874 98.774 7.357 97.81 8.322C96.724 9.287 96.242 10.493 96.242 11.94ZM106.011 19.297V17.488C105.287 18.211 104.563 18.694 103.719 19.055C102.875 19.417 102.031 19.538 101.066 19.538C98.895 19.538 97.086 18.814 95.639 17.367C94.192 15.92 93.468 14.111 93.468 11.819C93.468 10.734 93.709 9.769 94.071 8.925C94.433 7.96 94.915 7.236 95.639 6.513C96.362 5.789 97.207 5.186 98.051 4.824C98.895 4.462 99.86 4.221 101.066 4.221C102.031 4.221 102.996 4.342 103.84 4.704C104.684 5.065 105.408 5.548 106.131 6.271V4.704H108.785V19.297H106.011ZM90.332 19.297H87.558V2.653H82.614V0H95.277V2.653H90.332V19.297ZM70.794 11.94C70.794 13.387 71.277 14.593 72.242 15.679C73.207 16.643 74.413 17.126 75.86 17.126C77.186 17.126 78.272 16.643 79.237 15.679C80.202 14.714 80.684 13.508 80.684 12.181C80.684 10.734 80.202 9.528 79.237 8.563C78.272 7.598 77.066 6.995 75.739 6.995C74.413 6.995 73.207 7.477 72.242 8.442C71.277 9.287 70.794 10.493 70.794 11.94ZM80.563 19.297V17.488C79.84 18.211 79.116 18.694 78.272 19.055C77.428 19.417 76.583 19.538 75.619 19.538C73.448 19.538 71.639 18.814 70.191 17.367C68.744 15.92 68.021 14.111 68.021 11.819C68.021 10.734 68.262 9.769 68.624 8.925C68.985 7.96 69.468 7.236 70.191 6.513C70.915 5.789 71.759 5.186 72.603 4.824C73.448 4.462 74.413 4.221 75.619 4.221C76.583 4.221 77.548 4.342 78.392 4.704C79.237 5.065 79.96 5.548 80.684 6.271V4.704H83.217V19.297H80.563ZM56.201 19.297H53.548V0H56.201V6.392C56.684 5.789 57.166 5.307 57.89 4.945C58.613 4.583 59.337 4.462 60.302 4.462C62.111 4.462 63.438 5.065 64.402 6.151C65.367 7.236 65.85 8.925 65.85 10.854V19.297H63.196V11.819C63.196 10.251 62.955 9.045 62.352 8.201C61.749 7.357 61.026 6.995 59.819 6.995C59.096 6.995 58.493 7.116 58.01 7.477C57.528 7.839 57.046 8.201 56.684 8.804C56.443 9.166 56.322 9.648 56.322 10.131C56.201 10.613 56.201 11.457 56.201 12.663V19.297ZM49.568 0H52.463L46.674 19.297H44.141L40.523 4.945L37.025 19.297H34.493L28.704 0H31.598L35.819 14.834L39.558 0H41.608L45.347 14.834L49.568 0Z"
        fill={color}
      />
      <mask
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="127"
        height="24"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M0 24H126.875V0H0V24Z" fill="white" />
      </mask>
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M0 19.297H2.894V13.266H0V19.297Z" fill="var(--color-logo-orange)" />
        <path fillRule="evenodd" clipRule="evenodd" d="M5.307 19.297H8.201V6.754H5.307V19.297Z" fill="var(--color-logo-yellow)" />
        <path fillRule="evenodd" clipRule="evenodd" d="M10.613 19.297H13.508V0H10.613V19.297Z" fill="var(--color-logo-green)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.814 0H23.156V2.894H18.814V19.297H15.92V0H18.814Z"
          fill="var(--color-logo-blue)"
        />
      </g>
    </svg>
  );
}

/* ─── 공통 sub-section 헬퍼 ─────────────────────────────── */

const sectionStyle: React.CSSProperties = { marginBottom: 40 };
const titleStyle: React.CSSProperties = { fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" };
const descStyle: React.CSSProperties = { fontSize: 14, color: "var(--color-text-tertiary)", marginBottom: 20 };
const gridStyle: React.CSSProperties = { display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 0 };
const itemStyle: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 };
const boxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px dashed var(--color-border-default)",
  borderRadius: 4,
  padding: 12,
};
const labelStyle: React.CSSProperties = { fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "monospace" };
const darkStyle: React.CSSProperties = { background: "var(--color-text-primary)", padding: 24, borderRadius: 8 };

/* ─── Story (소스의 단일 `Symbol` named export 그대로) ─────── */

/**
 * 단일 종합 story — 소스(`foundation-whatap-symbol--symbol`)와 동일 구조:
 * Symbol 7 sizes / Horizon 5 heights / Dark background / Color spec.
 */
export const Symbol: StoryObj = {
  render: () => (
    <div style={{ padding: 32, fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif" }}>
      {/* ───── Symbol 크기 비교 ───── */}
      <div style={sectionStyle}>
        <div style={titleStyle}>WhaTap Symbol</div>
        <div style={descStyle}>
          4 개의 컬러 바로 구성된 WhaTap 심볼. logo-orange · logo-yellow · logo-green · logo-blue (테마 무관 고정 브랜드 색)
        </div>
        <div style={gridStyle}>
          {[12, 16, 20, 24, 32, 48, 64].map((s) => (
            <div key={s} style={itemStyle}>
              <div style={boxStyle}><WhaTapSymbol size={s} /></div>
              <span style={labelStyle}>{s}px</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───── Horizon (심볼 + 워드마크) ───── */}
      <div style={sectionStyle}>
        <div style={titleStyle}>WhaTap Horizon</div>
        <div style={descStyle}>심볼 + 워드마크 가로형 조합. 바-워드마크 간격 5.6px, 바 간격 2.4px (Figma 원본 기준).</div>
        <div style={gridStyle}>
          {[
            { h: 16, label: "h=16px" },
            { h: 20, label: "h=20px" },
            { h: 24, label: "h=24px (원본)" },
            { h: 32, label: "h=32px" },
            { h: 48, label: "h=48px" },
          ].map((v) => (
            <div key={v.label} style={itemStyle}>
              <div style={boxStyle}><WhaTapHorizon height={v.h} /></div>
              <span style={labelStyle}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───── 어두운 배경 위 ───── */}
      <div style={sectionStyle}>
        <div style={titleStyle}>On Dark Background</div>
        <div style={descStyle}>어두운 배경에서의 사용. 워드마크 텍스트를 white 로 전환.</div>
        <div style={darkStyle}>
          <div style={{ ...gridStyle, marginBottom: 0 }}>
            <div style={itemStyle}>
              <div style={{ ...boxStyle, borderColor: "var(--color-border-divider)" }}><WhaTapSymbol size={24} /></div>
              <span style={{ ...labelStyle, color: "var(--color-gray-mid)" }}>24px</span>
            </div>
            <div style={itemStyle}>
              <div style={{ ...boxStyle, borderColor: "var(--color-border-divider)" }}><WhaTapSymbol size={32} /></div>
              <span style={{ ...labelStyle, color: "var(--color-gray-mid)" }}>32px</span>
            </div>
            <div style={itemStyle}>
              <div style={{ ...boxStyle, borderColor: "var(--color-border-divider)" }}><WhaTapHorizon height={24} color="var(--color-text-inverse)" /></div>
              <span style={{ ...labelStyle, color: "var(--color-gray-mid)" }}>Horizon 24</span>
            </div>
            <div style={itemStyle}>
              <div style={{ ...boxStyle, borderColor: "var(--color-border-divider)" }}><WhaTapHorizon height={32} color="var(--color-text-inverse)" /></div>
              <span style={{ ...labelStyle, color: "var(--color-gray-mid)" }}>Horizon 32</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── 색 spec — 4 컬러 바 차트 ───── */}
      <div style={sectionStyle}>
        <div style={titleStyle}>Color Specification</div>
        <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
          <div style={itemStyle}>
            <div style={{ width: 12, height: 24, background: "var(--color-logo-orange)", borderRadius: 1 }} />
            <span style={labelStyle}>logo-orange</span>
          </div>
          <div style={itemStyle}>
            <div style={{ width: 12, height: 50, background: "var(--color-logo-yellow)", borderRadius: 1 }} />
            <span style={labelStyle}>logo-yellow</span>
          </div>
          <div style={itemStyle}>
            <div style={{ width: 12, height: 76, background: "var(--color-logo-green)", borderRadius: 1 }} />
            <span style={labelStyle}>logo-green</span>
          </div>
          <div style={itemStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ width: 20, height: 12, background: "var(--color-logo-blue)", borderRadius: 1 }} />
              <div style={{ width: 12, height: 64, background: "var(--color-logo-blue)", borderRadius: 1 }} />
            </div>
            <span style={labelStyle}>logo-blue</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
