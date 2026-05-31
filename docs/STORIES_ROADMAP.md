# Stories Roadmap — 카탈로그 보강

> Storybook 카탈로그의 미흡 영역과 다음 라운드에 추가할 컴포넌트 목록.

## 1차 라운드 — 부족 Primitives + Chrome (완료 ✅)

시나리오 도메인(`WhaTap_Scenarios/events*/`)의 page/widget 이 조립용으로 호출할 building block 10종.

| # | 컴포넌트 | 카테고리 | 상태 |
|---|---|---|---|
| 1 | Checkbox | Primitives | ✅ 완료 |
| 2 | Tooltip | Primitives | ✅ 완료 |
| 3 | Chip | Primitives | ✅ 완료 |
| 4 | TextField | Primitives | ✅ 완료 (clearable 보강 포함) |
| 5 | Select | Primitives | ✅ 완료 |
| 6 | Tabs | Primitives | ✅ 완료 |
| 7 | FilterChip | Primitives | ✅ 완료 |
| 8 | Modal | Primitives | ✅ 완료 |
| 9 | FilterDropdown | Primitives | ✅ 완료 |
| 10 | FilterBar | Chrome | ✅ 완료 |

---

## 2차 라운드 — dogfooding 에서 발견된 gap

`events/catalog.tsx`, `events/settings.tsx`, `events/operation.tsx` 등 페이지 dogfooding 결과 누락 컴포넌트.

| # | 컴포넌트 | 카테고리 | 우선도 | 상태 | 비고 |
|---|---|---|---|---|---|
| 1 | **Switch** | Primitives | 1 | ⏳ | ON/OFF 토글 (Checkbox 와 구분 — 즉시 적용 의도). settings 의 ChannelDot, catalog 의 enabled 컬럼 후보 |
| 2 | **Drawer** | Chrome | 1 | ⏳ | 우측 슬라이드 detail panel. 현재 catalog 의 row 상세 = `Modal` stub |
| 3 | `DataTable.selectable` | DataTable boost | 2 | ⏳ | catalog 의 수동 `_select` 컬럼을 prop 으로 흡수 |
| 4 | `DataTable.rowKey` / `emptyText` | DataTable boost | 3 | ⏳ | 현재 외부 `{rows.length === 0 && ...}` 로 처리 — 내장화 |
| 5 | **DatePicker** / **TimePicker** | Primitives | 3 | ⏳ | event-rules · 임계 룰 시간 윈도우. native input vs 커스텀 결정 필요 |
| 6 | **Accordion** / **Collapsible** | Primitives | 4 | ⏳ | event-rules · 그룹별 룰 접기/펼치기 |

---

## 3차 라운드 — 시나리오 dogfooding 미개척

`WhaTap_Scenarios/` 43 시나리오 중 페이지 미구현 도메인.

| 도메인 | 시나리오 수 | 신규 페이지 후보 |
|---|---|---|
| **event-rules** | 12 | `/events/rules` (CRUD · 시간 윈도우 매트릭스) |
| **event-incidents** | 10 | `/events/incidents` (수신 후 대응 흐름) |

해당 페이지 dogfooding 진행 시 위 2차 라운드의 Accordion · DatePicker 가 자연스럽게 필요해질 것.

---

## 작업 컨벤션 (모든 카드 공통)

1. **파일 위치**: `packages/design-system/src/<Component>.tsx` (평면)
2. **Story 위치**: `packages/design-system/stories/3-Primitives/<Component>.stories.tsx` (Chrome 은 `4-Chrome/`)
3. **Barrel export**: `packages/design-system/src/index.ts` 에 `export { default as <Component> } from "./<Component>";` + 타입 named export
4. **토큰만 사용**: Tailwind 4 토큰 utility (`text-base`, `text-primary`, `bg-brand-blue`). 직접 hex 금지
5. **default export = 컴포넌트** / named export = 타입 (Props / Variant)
6. **`tags: ['autodocs']`**: 모든 story 에 추가 → Storybook 자동 prop 문서
7. **a11y**: ARIA role + 키보드 지원 (Tab/Enter/Escape) 기본
8. **size variants**: `size?: "sm" | "md" | "lg"` 가능한 곳은 일관 — md 가 default
9. **4 섹션 docstring**: Purpose / When to use / When NOT to use / Composition rules
10. **카탈로그 동기 갱신**: 같은 PR 에서 `packages/design-system/docs/<해당 .md>` 표 + 예시 추가

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-05-31 | 1차 라운드 10개 완료. 2차 라운드 (Switch · Drawer · DataTable boost · DatePicker · Accordion) + 3차 (시나리오 미개척 도메인) 추가. |
| 2026-05-31 | 초안 — 10개 컴포넌트 분류 + 우선순위 + 작업 컨벤션 |
