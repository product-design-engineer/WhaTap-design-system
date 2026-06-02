# Enterprise 시나리오 — 디자인 시스템 신규 정책 (2026-06)

> 원본: `src/Sidebar.tsx` · `src/PageHeader.tsx` · `src/SubHeaderBar.tsx`
> 범위: WhaTap Platform **Enterprise(최상위 조직·계정 계층) UX/UI** 도입 중 추가된 chrome 컴포넌트 prop·정책. 기존 컴포넌트 카탈로그는 [`chrome-components.md`](./chrome-components.md), 토큰은 [`tokens.md`](./tokens.md), 패턴은 [`patterns.md`](./patterns.md).
> 용어: "테넌트"·"멀티테넌트" 표기 금지 — Enterprise = "최상위 조직·계정 계층(거버넌스)". 4계층 = 엔터프라이즈 › 조직 › 그룹 › 프로젝트.

---

## 1. Sidebar — 추가 prop·정책

### 1-1. `MenuItem.children[].onClick` (신규)
하위(접힘/펼침) 메뉴 항목이 **클릭·네비게이션 가능**해졌다.

```ts
export type MenuItem = {
  icon: string;
  label: string;
  children?: { label: string; active?: boolean; onClick?: () => void }[]; // ← onClick 신규
  expanded?: boolean;
  active?: boolean;       // 단일 항목 active 강조
  onClick?: () => void;   // 단일 항목 클릭
};
```
- **정책**: 그룹("관리 ▾") 하위 항목도 **네비게이션 진입점**이 될 수 있다. `expanded: true` + children 각 항목에 `onClick`.
- 렌더: 하위 항목 `<div onClick={c.onClick}>`.

### 1-2. `OrgContext.badge` (신규)
좌상단 조직 스위처 라벨 옆 **컨텍스트 뱃지 칩**.

```ts
export type OrgContext = { label: string; icon?: string; badge?: string }; // ← badge 신규
```
| Prop | Type | 설명 |
|---|---|---|
| `badge` | `string` | 라벨 우측 칩(예: `"엔터프라이즈"`). 미지정 시 없음 |

- 칩 스타일(**토큰 필수, 하드코딩 금지**): `bg-[var(--color-brand-blue-bg)] text-[color:var(--color-brand-blue)]`, `h-[18px] px-[6px] rounded-[4px] text-xs font-bold`.
- **정책**: 스위처는 **현재 계층 컨텍스트를 뱃지로 표시**(엔터프라이즈 vs 조직). 예: `디자인 주식회사 〔엔터프라이즈〕`.

### 1-3. 스위처 아이콘-없음 스페이싱 정책
`org.icon` 미지정 시 **빈 40px 박스 대신 12px 스페이서** 렌더(프로젝트 스위처와 동일 컨벤션). 좌측 라벨이 과도하게 들여쓰기 되지 않게.

```tsx
{org.icon ? (
  <div className="flex items-center justify-center shrink-0 size-[40px]"><img .../></div>
) : (
  <div className="w-[12px] shrink-0" />
)}
```

```tsx
<Sidebar
  org={{ label: "디자인 주식회사", badge: "엔터프라이즈" }}   // icon 없음 → 12px 스페이서
  onOrgClick={() => navigate("/account/enterprise/select")}
  menu={[ /* ... */ { icon: "menu-settings.svg", label: "관리", expanded: true, children: [
    { label: "엔터프라이즈 정보", onClick: () => navigate("/account/enterprise") },
  ] } ]}
/>
```

---

## 2. PageHeader — 추가 prop·정책

```ts
export type ProfileMenuItem = { label: string; onClick?: () => void };
export type NotificationItem = { label: string; onClick?: () => void };
```
| Prop | Type | 기본 | 설명 |
|---|---|---|---|
| `profileMenu` | `ProfileMenuItem[]` | — | 우상단 **아바타 클릭 드롭다운**. 미지정 시 정적 아바타 |
| `roleBadge` | `string` | — | **프로필 드롭다운 헤더**에 표시할 역할(예: `"OWNER"`). 미지정 시 헤더 숨김 |
| `notifications` | `NotificationItem[]` | — | **벨 아이콘 빨간 점 + 드롭다운**. 1건↑일 때만 인디케이터 |

### 2-1. `profileMenu` — 아바타 단일 사용자 메뉴
- 아바타(24px) 클릭 → 드롭다운(계정 정보 · 엔터프라이즈 관리 · 전환 · 로그아웃 등).

### 2-2. `roleBadge` — 역할은 "드롭다운 헤더"로 (정책 변경)
- **역할 칩을 아바타 옆에 독립 배치하지 않는다.** 대신 **아바타 드롭다운 맨 위 헤더**("OWNER · 내 계정")로 표시.
- **정책**: **사용자 메뉴는 하나(아바타), 역할은 신호(헤더).** 우상단에 클릭 트리거를 2개로 분산하지 않는다(발견성·관례).
- 헤더 칩도 토큰: `bg-[var(--color-brand-blue-bg)] text-[color:var(--color-brand-blue)]`.

### 2-3. `notifications` — 벨 인디케이터
- 알림 1건↑ → 벨에 빨간 점(`#e5484d`) + 클릭 시 드롭다운 목록(각 항목 onClick 라우팅).

```tsx
<PageHeader
  title="전체 프로젝트 / 프로젝트 목록"
  roleBadge="OWNER"                                   // 드롭다운 헤더 "OWNER · 내 계정"
  profileMenu={[
    { label: "계정 정보", onClick: openAccount },
    { label: "엔터프라이즈 관리", onClick: () => navigate("/account/enterprise") },
    { label: "로그아웃", onClick: () => navigate("/") },
  ]}
  notifications={[{ label: "OWNER 지정 — 수락 대기", onClick: () => navigate("/account/enterprise?stage=accept") }]}
/>
```

---

## 3. SubHeaderBar (컴포넌트)
40px 고정 서브헤더 바 — `PageHeader`(48px) 아래 브레드크럼/액션 줄.

```ts
export type SubHeaderBarProps = { children?: ReactNode; right?: ReactNode; className?: string };
```
- 셸: `flex items-center justify-between h-[40px] box-border px-[16px] gap-[8px] bg-white border-b border-[#e6e6e6] shrink-0`.

---

## 4. 횡단 정책 (컨벤션)

1. **색상은 디자인 토큰 기준** — 뱃지·역할·인디케이터 등에서 **하드코딩 hex 금지**. `--color-brand-blue` / `--color-brand-blue-bg` 등 토큰 참조(텍스트 색은 `text-[color:var(--...)]`). (cf. [`tokens.md`](./tokens.md))
2. **헤더 높이 48px 정합** — 사이드바 로고 헤더 = `PageHeader` = 48px 동일. 그 아래 `SubHeaderBar`·스위처·툴바는 **40px 라인**으로 정렬.
3. **수평 구분선 `border-b` 통일** — 헤더/스위처 경계의 중복 보더·1px 어긋남 방지.
4. **사용자 메뉴 일원화 + 역할 헤더** — 우상단 사용자 영역은 **아바타 드롭다운 1개**. 역할(OWNER 등)은 그 헤더에 표시(독립 칩·2번째 트리거 금지).
5. **상황(컨텍스트) 정합성** — 한 컴포넌트를 상태/계층/역할이 다른 시나리오에 재사용할 때, **스위처 라벨·뱃지·역할 헤더·메뉴·알림이 그 컨텍스트와 일치**해야 한다. (예: 엔터프라이즈 운영 vs 미수락/비조직은 스위처 뱃지·역할 표시를 분기.)

---

## 5. 변경 요약 (diff 관점)
- `Sidebar.tsx`: `MenuItem.children` 에 `onClick?` 추가 + 렌더 / `OrgContext` 에 `badge?` 추가 + 칩 렌더 / 아이콘-없음 시 12px 스페이서.
- `PageHeader.tsx`: `profileMenu`(드롭다운) / `roleBadge`(드롭다운 헤더로 이동, 독립 칩 제거) / `notifications`(벨 빨간 점+드롭다운).
- `SubHeaderBar.tsx`: 신규 40px 서브헤더 컴포넌트.
- `index.ts`: `ProfileMenuItem` · `NotificationItem` · `SubHeaderBarProps` 타입 export 확인 필요.
