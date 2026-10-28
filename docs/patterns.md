# Patterns & Policies — 인터랙션 패턴 + 구현 정책

WhaTap AI Assistant 화면을 만들면서 누적된 **반복되는 규칙**들입니다. 코드 리뷰에서 같은 지적이 나오는 항목을 모았으니, 디자인 시스템 사용 전에 한 번씩 읽어 두세요.

각 항목은 **Why / How** 형식으로 — 규칙만 외우지 말고 근거를 함께 이해해야 엣지 케이스에서 올바른 판단을 할 수 있습니다.

**두 부분으로 나뉩니다. 성격이 다르므로 찾는 방법도 다릅니다.**

| | 무엇 | 언제 찾나 | 번호 |
|---|---|---|---|
| **Part 1 — 인터랙션 패턴** | 컴포넌트 **여럿을 잇는 시퀀스**와 그 의무. 어느 한 컴포넌트의 문서에도 담기지 않는다 | "삭제 버튼을 만들려는데 무엇을 거쳐야 하나" | `P1` `P2` … |
| **Part 2 — 구현 정책** | 개별 컴포넌트·토큰·계층의 **금지와 근거** | "이 컴포넌트를 이렇게 써도 되나" | `1` `2` … (기존 번호 유지) |

> 패턴 이름은 **컴포넌트가 아니라 의도**로 짓습니다 — 토큰 명명 규칙(`--shadow-md` ⭕ / `--shadow-0-8-24` ❌)과 같은 이유입니다. "Modal 확인 패턴"이라 부르면 **위젯 안에서는 Modal 을 쓸 수 없는**(P1 경계) 경우에 이름 자체가 거짓이 됩니다.

---

# Part 1 — 인터랙션 패턴

컴포넌트 횡단 시퀀스입니다. 개별 컴포넌트 문서(`get_component`)에는 자기 역할만 쓰여 있어서, **조각을 다 읽어야 조립되는 규칙**은 실질적으로 없는 규칙입니다. 그래서 여기 한 곳에 세웁니다.

## P1. 위험한 실행 확인 — 확인을 거치지 않는 삭제는 없다
<!-- @policy id=destructive-confirm | @severity must | @applies process -->

**규칙.** 되돌릴 수 없는 실행은 **[[Button]] `tone="critical"` → [[ConfirmDialog]] 확인 → [[Toast]] 완료** 세 단계를 거친다. 한 단계도 생략하지 않는다. 확인은 [[Modal]] 을 손으로 짜지 않고 [[ConfirmDialog]] 를 쓴다 — 아래 규칙(동작 라벨 · 대상 · footer 배치)을 구조가 지킨다.

**When to use.** 되돌릴 수 없는 것을 사람이 실행하는 자리 전부 — 삭제 · 해지 · 초기화 · 되돌릴 수 없는 전송. 「목록에서 행을 지운다」가 가장 흔하다.

**When NOT to use.**
- **되돌릴 수 있는 실행** — 필터 해제 · 정렬 변경 · 탭 이동 · 위젯 닫기. 확인을 붙이면 마찰만 남고 진짜 확인이 필요한 곳의 신호가 무뎌진다("또 그 모달"). 되돌릴 수 있으면 확인 대신 **되돌리기**(P2 의 `actionLabel`)다.
- **AI 위젯 안** — [[Modal]] 은 페이지 컨텍스트 한정이다(`feedback_widget_readonly_policy`). 위젯은 제안·미리보기까지이고 실행과 확인은 페이지로 이관한다.

**Why.** 위험한 실행의 비용은 **비대칭**이다 — 오클릭 한 번의 대가가 복구 불가다. 확인 모달은 마찰을 위한 마찰이 아니라, 사용자가 **무엇이** 사라지는지 대상을 재확인하는 지점이다. 그래서 모달 본문은 실행 이름을 반복하는 자리가 아니라 **대상과 결과를 적는 자리**다.

**How.**

```tsx
<Button tone="critical" size="sm" onClick={() => setConfirm(true)}>삭제</Button>

<ConfirmDialog
  open={confirm}
  title="알림 규칙 삭제"
  target="「CPU 90% 초과」 규칙을 삭제합니다."
  outcomes={[{ text: "삭제하면 되돌릴 수 없습니다.", tone: "critical" }]}
  confirmLabel="삭제"
  onConfirm={remove}
  onClose={() => setConfirm(false)}
/>
```

- **확인 버튼 라벨은 동작(`삭제`)** — "확인" 이 아니다. 버튼만 읽고 누르는 사용자가 있고, 그 사람이 틀리지 않아야 한다.
- **대상을 본문에 적는다.** 목록에서 골라 지우는 흐름에서 "정말 삭제하시겠습니까?" 만으로는 **어느 행이 선택됐는지** 확인할 수 없다.
- **`disableBackdropClose` · `disableEscClose` 를 켜지 않는다.** 되돌릴 수 없는 것은 *확인*이고 *취소*는 언제나 쉬워야 한다. 실수로 닫히는 것은 안전한 결과다.
- 완료는 P2 를 따른다 — 목록에서 행이 사라지는 것이 눈에 보이면 [[Toast]] 를 생략해도 된다.

위젯 안에서 확인 모달을 흉내 내지 말 것 — 제안은 [[AiAlertRulePreview]] 등으로 하고 실행은 페이지가 받는다.

✅ 확인 버튼 라벨은 **동작**(`삭제`) — 버튼만 읽고 누르는 사용자가 있고, 그 사람이 틀리지 않아야 한다
✅ 모달 본문에 **대상**을 적는다 — 어느 행이 선택됐는지 재확인하는 지점이다
✅ `disableBackdropClose`·`disableEscClose` 를 켜지 않는다 — 실수로 닫히는 것은 안전한 결과다

❌ `<Button tone="critical" onClick={remove}>` — 확인 없이 즉시 실행
❌ 확인 버튼에 `tone="primary"` — 파랑은 «권장 진행»으로 읽힌다
❌ [[Toast]] 로 확인받기 — 4.5s 뒤 사라지므로 **못 본 사용자가 생긴다.** 차단이 필요하면 [[Modal]]
❌ 본문에 "정말 삭제하시겠습니까?" 만 — 대상이 없다

---

## P2. 완료 통보 — 어디에 알릴지는 «변화가 보이는가» 로 정한다
<!-- @policy id=completion-notice | @severity must | @applies process -->

**When to use.** 실행이 끝났음을 사람에게 알려야 할 때. 무엇을 쓸지가 아니라 **알릴 것인가부터** 이 규칙이 정한다.

**When NOT to use.** 결과가 **화면에서 이미 보일 때** — 행이 사라지거나 값이 바뀌는 것이 눈에 들어오면 알리지 않는다. 그것이 이 규칙의 첫 갈래다.

**규칙.** 실행이 끝났음을 알리는 자리는 세 곳뿐이고, 다음 순서로 고른다.

| 조건 | 어디에 | 컴포넌트 |
|---|---|---|
| 결과가 **화면에서 이미 보인다**(행이 사라짐 · 값이 바뀜) | 알리지 않는다 | — |
| 변화가 **화면 밖**이거나 눈에 안 띈다 | 가벼운 한 줄 | [[Toast]] |
| 사용자의 **다음 선택**이 필요하다(충돌·부분 실패) | 차단 | [[Modal]] |
| AI 가 수행한 결과의 **상세** | 위젯 본문 | [[AiCard]] 계열 |

**Why.** 통보는 «사용자가 모를 변화»를 메우는 장치다. 이미 보이는 변화를 또 알리면 정보가 중복되고, 중복된 통보는 곧 읽히지 않는다 — 그러면 정말 알려야 할 때도 묻힌다. 반대로 화면 밖 변화(저장·등록·전송)는 통보가 유일한 근거다.

**How.**

- [[Toast]] 는 **한 줄**이다. 상세·목록·수치는 담지 않는다 — 4.5s 뒤 사라지는 자리에 읽을 시간이 필요한 것을 두지 않는다.
- 되돌릴 수 있는 실행은 `actionLabel="되돌리기"` 로 **확인을 사후로 옮긴다.** 단 창이 4.5s(`durationMs`)이므로, 되돌리기 창이 그보다 길어야 하는 실행이라면 이 방법을 쓰지 말고 P1 의 사전 확인을 쓴다.
- AI 위젯이 한 일은 **위젯 본문이 정본**이고, 위젯 밖에서 한 번 더 확인이 필요할 때만 [[Toast]] 를 겹친다(같은 내용을 두 곳에 길게 쓰지 않는다).

✅ [[Toast]] 는 **한 줄** — 4.5s 뒤 사라지는 자리에 읽을 시간이 필요한 것을 두지 않는다
✅ 되돌릴 수 있으면 `actionLabel="되돌리기"` 로 확인을 사후로 옮긴다
✅ AI 가 한 일은 **위젯 본문이 정본** — 밖에서 한 번 더 필요할 때만 [[Toast]] 를 겹친다

❌ 저장 성공을 [[Modal]] 로 — 다음 선택이 없는데 흐름을 끊는다
❌ 실패 사유를 [[Toast]] 한 줄로 뭉개기 — 사용자가 조치할 수 없다
❌ 목록에서 행이 사라지는 것을 보면서 "삭제되었습니다" 토스트까지 — 중복

---

## P3. 즉시 반영 vs 폼 제출 — 같은 «켬/끔» 도 의도로 갈린다
<!-- @policy id=instant-vs-submit | @severity must | @applies process -->

**When to use.** 켬/끔 컨트롤을 놓을 때. 모양이 같은 둘 중 무엇을 고를지 **반영 시점**으로 정한다.

**When NOT to use.** 일시적 누름 상태(텍스트 Bold 등)는 이 갈래가 아니다 — 설정이 아니라 서식 조작이다. DS 에 해당 컴포넌트가 없어 필요하면 `Toggle` 을 신설한다.

**규칙.** 토글 모양이 같아도 **반영 시점**으로 컴포넌트를 고른다.

| 의도 | 컴포넌트 | 특징 |
|---|---|---|
| **즉시 반영 설정** (다크모드 · 알림 on/off) | [[Switch]] / [[ThemeToggle]] | 1-step, 토글 즉시 적용 |
| **폼 제출 시 함께 보냄** (약관 동의 · 다중 선택) | [[Checkbox]] | form 일부, submit 필요 |
| 일시적 누름 상태 (텍스트 Bold 등) | *(미보유 — 필요 시 `Toggle` 신설)* | press/unpress |

**Why.** 두 컨트롤의 차이는 모양이 아니라 **되돌리는 방법**이다. [[Switch]] 는 켠 순간이 곧 적용이라 되돌리기도 한 번의 토글이다. [[Checkbox]] 는 submit 까지 아무 일도 일어나지 않아서 **취소로 되돌릴 수 있다**. 의도와 어긋나게 고르면 사용자가 "저장을 눌러야 하나"를 매번 추측하게 된다 — 약관 동의에 [[Switch]] 를 쓰면 이미 동의된 것처럼 읽히고, 즉시 적용 설정에 [[Checkbox]] 를 쓰면 없는 저장 버튼을 찾는다.

**How.** 즉시 반영이면 **저장 버튼을 두지 않는다**(있으면 즉시성이 거짓말이 된다). 즉시 반영이 실패할 수 있는 설정(서버 왕복)이면 실패를 P2 로 알리고 토글을 원위치로 되돌린다 — 실패했는데 켜진 채로 남는 것이 가장 나쁘다.

✅ 즉시 반영이면 **저장 버튼을 두지 않는다** — 있으면 즉시성이 거짓말이 된다
✅ 즉시 반영이 실패할 수 있으면(서버 왕복) 실패를 P2 로 알리고 **토글을 원위치로 되돌린다**

❌ 약관 동의에 [[Switch]] — 이미 동의된 것처럼 읽힌다
❌ 즉시 적용 설정에 [[Checkbox]] — 없는 저장 버튼을 찾게 된다
❌ [[Switch]] 옆에 "저장" 버튼

> 이 표는 `CLAUDE.md` 「컴포넌트 선택 가이드」와 같은 규칙입니다. 근거·경계는 이쪽이 정본입니다.

---

## P4. 기본 항목 · 선택 항목 — 추천은 미리 고르고, 확장은 하나씩 고르게 한다
<!-- @policy id=default-vs-optional-picks | @severity must | @applies process -->

**When to use.** 여러 항목을 골라 **한 번에 제출**하는 폼에서, 항목이 «대부분 필요한 것»과 «필요할 때만 더하는 것»으로 나뉠 때 — 계정 추가의 권한 · 알림 대상 · 초대 범위 등.

**When NOT to use.**
- 고를 수 없는 항목(항상 포함) → 체크박스로 그리지 않는다. **목록으로만** 보여 준다 — 누를 수 없는 체크박스는 고장 난 것처럼 읽히고, 선택지가 아닌 것이 선택지 수를 부풀린다.
- 체크 즉시 반영되는 설정 → P3 에 따라 [[Switch]]. 이 패턴은 **저장 버튼을 눌러야 반영되는** 폼이다.
- 항목이 하나만 고를 수 있는 양자택일 → `Radio`.

**규칙.** 두 그룹으로 나누고, **처음 상태와 일괄 선택 여부**를 다르게 둔다. 컴포넌트는 둘 다 [[Checkbox]].

| | 처음 상태 | 그룹 머리 «전체» 체크박스 | 사용자가 해제 |
|---|---|---|---|
| **기본 항목** | 모두 체크 | 둔다 — 전부 켜짐 ☑ · 일부 ▣(`indeterminate`) · 없음 ☐ | 가능 |
| **선택 항목** | 모두 해제 | **두지 않는다** | — |

```
☑ 기본 항목              ← 그룹 머리. 일부만 남으면 ▣
   ☑ 프로젝트 조회
   ☑ 대시보드 조회
   ☑ 알림 수신

선택 항목                ← 머리 체크박스 없음
   ☐ 이벤트 설정 변경
   ☐ 멤버 초대
                                   [취소] [저장]
```

**Why.** 두 그룹은 기본값이 아니라 **책임의 방향**이 다르다. 기본 항목은 «대부분 필요하다»는 판단을 DS 가 대신 해 둔 것이라 미리 켜 두고, 빼는 것을 사용자의 선택으로 남긴다. 선택 항목은 권한 · 노출 범위를 **넓히는** 쪽이라, 미리 켜 두면 사용자가 모르는 채 범위가 넓어진다 — 그래서 하나씩, 의식적으로 켜게 한다. 선택 항목에 «전체 선택»을 두면 한 번의 클릭이 «개별 선택»이라는 의도를 무너뜨린다.

**How.** 그룹 머리의 상태는 저장하지 않고 **자식에서 계산**한다 — 따로 두면 자식과 어긋난다.

```tsx
const allOn  = defaults.every((k) => picked[k]);
const someOn = defaults.some((k) => picked[k]);

<Checkbox checked={allOn} indeterminate={someOn && !allOn} onChange={(next) => setMany(defaults, next)}>
  기본 항목
</Checkbox>
{defaults.map((k) => <Checkbox key={k} checked={picked[k]} onChange={(v) => set(k, v)}>{LABEL[k]}</Checkbox>)}
{optionals.map((k) => <Checkbox key={k} checked={picked[k]} onChange={(v) => set(k, v)}>{LABEL[k]}</Checkbox>)}
// picked 의 처음 값 — 기본 항목만 true, 선택 항목은 false
```

✅ 기본 항목은 **처음에 모두 체크**하고, 해제할 수 있게 둔다
✅ 기본 그룹 머리는 자식에서 계산한다 — 일부만 남으면 `indeterminate`
✅ 반영은 저장 버튼으로 — 체크만으로 적용하지 않는다(P3)

❌ 선택 항목을 미리 체크 — 사용자가 모르는 채 범위가 넓어진다
❌ 선택 항목에 «전체 선택» 머리 — 개별 선택이라는 의도를 한 번에 무너뜨린다
❌ 해제할 수 없는 항목을 `checked disabled` 체크박스로 — 고장 난 컨트롤처럼 읽힌다. 목록으로 보여 준다
❌ 그룹 머리 상태를 따로 저장 — 자식과 어긋난다

---

# Part 2 — 구현 정책

개별 컴포넌트·토큰·계층의 금지와 근거입니다. 번호는 기존 참조(`patterns#4-1` 등)를 깨지 않도록 유지합니다.

## 1. Page Header Invariant
<!-- @policy id=header-invariant | @severity must | @applies chrome -->

**When to use.** 제품 화면의 48px 헤더를 놓는 모든 자리 — `PageHeader` · `PageHeaderAiInline` 호출부 전부.

**When NOT to use.**
- **본문 자체가 대화인 AI 모드 화면** → `hideAi` 로 AI 진입점만 숨긴다(아래 예외 절).
- **문서 체계가 아예 없는 제품의 셸**(별도 랜딩을 가진 URL 모니터링 등) → `hideDocs` · `hideSupport`. 기본값은 꺼져 있고, **제품 화면에서는 끄지 않는다** — 「이 화면엔 지금 문서가 없으니 잠깐」은 이 스위치의 쓰임이 아니다. 그렇게 쓰면 같은 제품 안에서 헤더가 화면마다 달라진다.
- **헤더가 유일한 AI 진입점인 제품** → `aiPrompt` 로 [[AiInlinePrompt]] 를 헤더에 직접 얹는다. 토글 pill(`onAiToggle`)과 함께 켜지 않는다 — 진입점이 둘로 보이면 지금 하는 말이 어디로 가는지 모호해진다.

**규칙.** AI 위젯이 열려도 48px 페이지 헤더(`PageHeader`)의 어떤 요소도 사라지지 않는다 — title, AI 버튼, Docs, 고객지원, bell, avatar 모두 그대로 표시.

**Why.** 사용자가 위젯과 본문을 오가며 작업할 때, 헤더는 "어디로 돌아갈 수 있는지"의 닻이다. 위젯이 열렸을 때 일부 요소를 hide하면 헤더 자체가 컨텍스트에 따라 모양이 바뀌는 컴포넌트가 되어, 다른 페이지로 이동했을 때 무엇이 사라졌는지 사용자가 추적해야 한다. 사이드바는 240→80px로 축소되어 공간을 양보하지만, **헤더는 invariant**.

**How.** 헤더의 가시성을 제어하는 prop은 아래 `hideAi` 하나뿐이고, 그것도 위젯 상태(`aiActive`)로는 절대 토글하지 않는다. 그 밖의 헤더 변경이 필요하면 디자인 리뷰부터.

❌ `aiActive` 일 때 `<PageHeader>` 내부 요소를 조건부로 hide
✅ `aiActive` 일 때 사이드바만 축소 (`DashboardLayout`의 `widgetOpen`)

### 예외 — AI 모드 화면의 `hideAi`

**규칙.** 화면 **본문 자체가 대화**인 AI 모드 화면(예: 전체 개요 `/global-overview`)에서는 `hideAi` 로 헤더의 AI 진입점만 숨긴다.

**Why.** 이미 AI 안에 들어와 있는 화면이라 「AI 를 연다」는 버튼이 뜻을 잃는다. 남겨 두면 (a) 누를 것이 없는 버튼이 헤더에 남고 (b) 진입점이 둘로 보여 지금 하는 대화가 어느 쪽인지 모호해진다. 이 화면들은 위젯을 열지 않으므로 헤더가 «돌아갈 닻» 역할을 할 대상도 없다.

**When NOT to use — 이 예외 자체의 경계.** `hideAi` 는 **페이지 성격**(대화가 본문인가)으로 정하는 정적 값이다. 위젯을 여는 일반 제품 화면에서는 켜지 않으며, `aiActive` 에 따라 켜고 끄는 것은 위 ❌ 규칙 그대로 금지다.

---

## 2. Sidebar Collapse on Widget Open
<!-- @policy id=sidebar-collapse-on-widget | @severity must | @applies chrome -->

**When to use.** AI 위젯을 여는 제품 화면 전부. [[DashboardLayout]] 에 `widgetOpen` 을 넘기는 것으로 끝난다.

**When NOT to use.** 위젯을 열지 않는 화면 — 접힘/펼침을 사람이 직접 고르는 것은 이 규칙이 아니라 [[Sidebar]] 의 `collapsed`/`defaultCollapsed` 다. 그 둘을 섞어 쓰면 위젯을 닫았을 때 사이드바가 어느 상태로 돌아갈지 알 수 없다.

**규칙.** AI 위젯이 열리면 사이드바는 240px → **80px**(40px 제품 레일 + 40px 아이콘 전용 메뉴 열)로 축소된다.

**Why.** 위젯이 480px를 차지하므로 기본 사이드바(240)와 합치면 720px가 가로를 잡아먹어 본문이 너무 좁아진다. 사이드바를 완전히 숨기면 다른 제품으로의 이동 경로가 사라지므로, **제품 레일 + 아이콘 메뉴만 남기는 80px 절충**. (렌더 실측: 접힘 루트 80px · 내부 레일 40px. 40px 은 «레일 폭»이지 사이드바 폭이 아니다 — 문서 4곳이 이 둘을 혼동해 40px 이라고 적고 있었다.)

**How.** `DashboardLayout`에 `widgetOpen={aiActive}`만 넘기면 내부에서 `Sidebar`의 `collapsed`를 자동 처리한다. 페이지 별로 따로 `Sidebar`를 import해서 collapsed를 수동 관리하지 말 것.

```tsx
<DashboardLayout widgetOpen={aiActive} ...>
  <WhaTapAiWidget open={aiActive} ... />
</DashboardLayout>
```

✅ [[DashboardLayout]] 에 `widgetOpen` 만 넘긴다 — 내부에서 [[Sidebar]] 의 `collapsed` 를 처리한다
✅ 접힘 폭은 **80px** 이다 — 40px 은 «레일 폭»이지 사이드바 폭이 아니다(문서 4곳이 이 둘을 혼동하고 있었다)

❌ 페이지별로 [[Sidebar]] 를 따로 import 해 `collapsed` 를 수동 관리 — 위젯을 닫았을 때 어느 상태로 돌아갈지 알 수 없어진다
❌ 위젯이 열렸을 때 사이드바를 **완전히** 숨기기 — 다른 제품으로의 이동 경로가 사라진다

---

## 3. SVG Text Must Include Units
<!-- @policy id=svg-text-units | @severity must | @applies chart -->

**When to use.** SVG 안에 글자를 쓰는 모든 자리 — 차트 축·라벨·peak 수치·범례.

**When NOT to use.** 예외가 없다. `viewBox` 가 없는 SVG 라 해도 단위를 붙인다 — 나중에 `viewBox` 가 붙는 순간 조용히 깨지고, 그때는 원인이 이 줄이라는 것을 아무도 모른다.

**규칙.** SVG 내부 `<text fontSize>`는 항상 `"9px"` (또는 `"9pt"`)처럼 단위를 명시. 단위 없는 숫자(`fontSize={9}`)는 금지.

**Why.** SVG에서 단위 없는 fontSize는 viewBox의 user-space units으로 해석된다. viewBox가 `0 0 100 60`인 차트와 `0 0 400 240`인 차트에서 같은 `fontSize={9}`가 화면상 전혀 다른 크기로 렌더된다. 단위(`px`)를 명시하면 사용자 좌표가 아니라 CSS pixel로 고정되어 일관성 확보.

**How.**

```tsx
// ❌
<text fontSize="9">100%</text>
<text fontSize={9}>100%</text>

// ✅
<text fontSize="9px">100%</text>
```

`MiniLineChart`, `AiUsageChart` 등 차트 컴포넌트 안에서 이 규칙을 위반하면 dashboard 카드 크기에 따라 텍스트가 거대해지거나 사라진다.

✅ `fontSize="9px"` — 단위를 문자열로 붙인다

❌ `fontSize="9"` — 문자열이어도 단위가 없으면 user-space units 다
❌ `fontSize={9}` — 숫자 리터럴. 같은 값이 viewBox 마다 다른 크기로 렌더된다

---

## 4. Data Table 종합 정책
<!-- @policy id=datatable-policy | @severity must | @applies table -->

**When to use.** [[DataTable]] 을 놓는 모든 자리. 아래 다섯 절(density · 정렬 · 너비 · 셀 폰트 · 셀 컴포넌트)이 한 묶음이다 — 하나만 따르면 표가 어긋난다.

**When NOT to use.**
- **열을 세로로 비교하지 않는 목록** → [[ListRow]]. 건마다 길이가 다르고 보조 줄이 있다 없다 하는 목록을 표에 넣으면 빈 칸이 열마다 생기고, 사람은 그 빈 칸을 「값이 없음」으로 읽는다.
- **보여 줄 것이 0행일 때** → 그 자리는 [[EmptyState]] 다. 빈 표를 세워 두지 않는다.

DataTable 은 본 디자인 시스템에서 가장 자주 쓰이는 chrome 컴포넌트. 사용 정책이 누적되어 있으니 모두 함께 준수.

### 4-1. Density — 기본 `default`

**규칙.** 새 페이지의 DataTable 은 무조건 `density="default"` 시작. `compact` 채택은 별도 근거 필요.

| density | header | row | padding |
|---|---|---|---|
| `default` (기본) | `text-base` 12px bold | `text-md` 13px regular | px-12 py-10 |
| `compact` (제한 사용) | `text-xs` 10px bold | `text-sm` 11px regular | px-8 py-6 |

**Why.** default 가 한글 가독성 + 일반 모니터링 페이지 정보 밀도의 균형점. compact 는 11px 한글 가독성을 희생하므로 100+ 행 raw log 같은 극단 dense 데이터 전용.

### 4-2. 정렬 (alignment)

**규칙.**
- 문자 → **left**
- 숫자 (`numeric: true`) → **right** (자릿수 세로 정렬)
- header `"No"` 컬럼 → **center** (별도 align 없이 자동)
- 명시 `align` prop 이 최우선 override

**Why.** 숫자 우측 정렬 = 자릿수 비교 (1,234 vs 12,345). 문자 좌측 정렬 = 자연어 읽기 흐름. No(순번) 은 좁은 정형 컬럼이라 가운데 자연스러움.

```tsx
{ key: "name", header: "인스턴스", flex: 2 }                                 // 텍스트 — 기본 left
{ key: "tps",  header: "TPS", width: 96, align: "right", numeric: true }    // 숫자
{ key: "no",   header: "No", width: 52, numeric: true }                     // No → 자동 center
```

### 4-3. 너비 (width)

**규칙.**
- 정형 컬럼 (No 52 · 시각 150 · 상태 96 · 실행) → **`width`(px 고정)**
- 가변 컬럼 (이름 · 메시지) → **`flex`(fr)**, 정보량 많은 쪽에 더 큰 비율
- `width` 지정 시 `flex` 무시

**Why.** 정형 폭이 흔들리면 가변 컬럼이 늘어날 때 시각 안정성이 깨짐.

### 4-4. 셀 내 inline 폰트 — DataTable tokens 와 정합

DataTable wrapping span 이 `tokens.rowText` (default density 면 `text-md text-primary`) 자동 적용. 셀 안 `<span>` 의 inline 폰트 override 시 다음 가이드:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** (자동 `text-md text-primary`) |
| 메인 식별자 강조 | `text-md font-medium` 또는 `font-bold` |
| 보조/부 텍스트 (이메일·라벨) | `text-base text-tertiary` (한 단계 작게) |
| 수치 | `text-md font-numeric tabular-nums` |
| 비활성 수치 (0/null) | `text-md text-disabled font-numeric tabular-nums` |

**금지:** default density 셀 본문에 `text-sm`/`text-xs` — compact 시절 잔재.

### 4-5. 셀 내 컴포넌트 사이즈

row height ≈ 33-36px (default density) 기준:

| 컴포넌트 | size | height |
|---|---|---|
| `<Chip>` | `md` | 20px |
| `<FilterChip>` | `md` | 24px |
| `<Button>` | `sm` | ~24px |
| inline pill (span) | `text-sm h-[20-24px] px-[8px]` | 20-24px |
| status dot | — | 6-8px |
| `<Checkbox>` | `sm` | 14-16px |

**금지:** lg(28-32px) — row 를 압도.

위젯 내 메시지 카드(`AiClassificationTable`, `AiCostBreakdown` 등)도 동일한 정렬·너비 정책을 따른다.

✅ 새 표는 `density="default"` 로 시작한다 — `compact` 는 채택에 별도 근거가 필요하다
✅ 숫자 컬럼에 `numeric: true` — 우측 정렬 + 자형이 함께 따라온다
✅ 정형 컬럼은 `width`(px 고정) · 가변 컬럼은 `flex`(fr)
✅ 셀 안 주 텍스트는 **override 하지 않는다** — 표가 이미 `text-md text-primary` 를 준다

❌ `compact` 를 일반 모니터링 표에 — 11px 한글 가독성을 희생하는 값이라 100+ 행 raw log 전용이다
❌ default density 셀 안에 `text-sm`·`text-xs` — compact 시절 잔재다. 한 단계 작은 부 텍스트는 `text-base` 다
❌ 셀 안에 `lg`(28-32px) 컴포넌트 — row(33-36px)를 압도한다
❌ `width` 와 `flex` 를 같은 컬럼에 — `width` 가 이기므로 `flex` 는 거짓말이 된다

---

## 5. Chart Peak Alignment
<!-- @policy id=chart-peak-alignment | @severity must | @applies chart -->

**When to use.** SVG 로 그린 선 위에 **HTML 로** 라벨·마커를 얹는 모든 차트. 두 좌표계가 만나는 자리가 이 규칙의 대상이다.

**When NOT to use.** 라벨까지 SVG 안에서 그리는 경우 — 좌표계가 하나이므로 어긋날 곳이 없다. 다만 그때는 3번(SVG 텍스트 단위)이 걸린다.

**규칙.** 라인 차트의 peak 라벨(▼ 또는 값 표시)은 line max의 픽셀 좌표와 1:1 정렬한다.

**Why.** SVG로 라인을 그리고 HTML로 라벨을 띄울 때, 두 좌표계가 어긋나면 "peak" 표시가 실제 최고점에서 몇 px 옆에 박힌다. 사용자는 즉시 어색함을 느끼지만 원인을 짚지 못한다.

**How.** SVG plot 영역을 absolute 배치하고 같은 컨테이너 안에서 HTML overlay도 absolute. **둘 다 같은 plot 좌표계(left/top)를 공유**해 peak의 픽셀 위치를 계산. `MiniLineChart`가 이 방식으로 구현되어 있다 — 새 차트를 만들 때 패턴을 따라가세요.

✅ SVG plot 과 HTML overlay 가 **같은 컨테이너·같은 좌표계**를 공유한다
✅ peak 라벨에 배경을 깐다 — 최고점이 Y축 눈금과 겹치면 두 수치가 한 덩어리로 읽힌다

❌ 두 좌표계를 따로 계산 — 몇 px 어긋나고, 사용자는 어색함을 느끼지만 원인을 짚지 못한다
❌ 겹침을 색만 바꿔 해결 — 겹친 자리에서 어느 글자가 어느 수치인지 여전히 구분되지 않는다

---

## 6. Card 외형은 AiCard에 위임
<!-- @policy id=aicard-owns-chrome | @severity must | @applies widget -->

**When to use.** AI 위젯 **안**의 모든 카드형 메시지.

**When NOT to use.** 위젯 밖 제품 화면의 카드 — 거기는 `bg-card` + `--color-border-default` 를 쓰는 일반 표면이고, 상태를 말하는 카드라면 [[Notice]] 다. [[AiCard]] 를 제품 화면에 끌어오면 그 영역이 AI 응답처럼 읽힌다.

**규칙.** 위젯 안의 모든 카드형 메시지는 `<AiCard>` 또는 `<AiCard>`를 내부에서 쓰는 컴포넌트로 작성.

**Why.** 보더 색(`#eaeaea`), 라운드(8px), 패딩(12px), 진입 애니메이션(`.ai-anim-in`), gap(8px) — 다섯 가지가 모든 카드에서 일치해야 위젯이 단정해 보인다. 한 번이라도 직접 `<div className="bg-white border ...">`를 작성하면 1px 어긋남이 시각적으로 잡힌다.

**How.** [`primitives.md`](./primitives.md#aicard) 참조. 새 카드 컴포넌트를 만들 때 첫 줄이 `<AiCard delay={delay}>` 가 아니라면 멈추고 다시 생각하세요.

✅ 새 위젯 카드의 첫 줄은 `<AiCard delay={delay}>` 다
✅ 외형(보더·라운드 8px·패딩 12px·진입 애니메이션·gap 8px)은 전부 [[AiCard]] 에 맡긴다

❌ 위젯 안에서 `<div className="bg-card border …">` 로 카드를 직접 짜기 — 한 번이라도 하면 1px 어긋남이 눈에 잡힌다
❌ 위젯 카드에 자체 패딩·라운드를 덧붙이기 — 값이 두 곳에서 정해지면 다음 조정 때 한쪽만 바뀐다

---

## 7. 색은 토큰에서만
<!-- @policy id=color-from-tokens | @severity must | @applies token -->

**When to use.** 색을 정하는 모든 자리 — `src/` · `stories/` · `.storybook/` 전 범위. 카탈로그도 예외가 아니다.

**When NOT to use — 허용 예외는 둘뿐.**
- **컬러 배경 위 고정 흰색 전경** — contained 버튼 · solid chip · 그라데이션 헤더/아바타 · 원형 배지 안 체크 · switch knob. 테마와 무관하게 흰색이어야 한다.
- **`mask` 의 알파 지정** — 색이 아니라 불투명/투명을 뜻한다.

예외는 **두 채널에 동시에** 표기한다(`data-ds-policy-ok` + 줄 바로 위 `// raw-color-ok:`). 하나만 달면 다른 게이트가 잡는다. 사유 주석은 **리터럴 줄 바로 위**여야 한다 — 사이에 다른 속성을 끼우면 면제가 깨진다.

**규칙.** 컴포넌트 내부에 `#E53935` 같은 색상 리터럴 금지. [`tokens.md`](./tokens.md)의 `TONE_*`를 import해 사용.

**Why.** 디자인 결정이 코드 전반에 흩어지면, 톤을 한 번 조정하기 위해 grep으로 hex를 찾아 다녀야 한다. 토큰으로 중앙화하면 `_tokens.ts` 한 파일 수정으로 위젯 전체가 따라온다.

**How.** 새 색이 필요하다면 — 토큰에 먼저 추가하고 컴포넌트에서 import. 5단계 `Tone`을 늘리는 것보다 토큰 외 색상(예: 차트 전용 색)을 별도 named export로 두는 게 보통 옳다.

✅ 새 색은 **토큰을 먼저 추가**한 뒤 참조한다 — 토큰 부재는 리터럴의 근거가 아니라 토큰 추가의 근거다
✅ TS 토큰을 인라인 주입할 때는 `.cssVar` — `.dark` 는 CSS 변수만 재매핑한다
✅ 값이 아니라 **역할**로 명명한다 (`--shadow-md` ⭕ / `--shadow-0-8-24` ❌)

❌ `#E53935` · `rgba(0,0,0,.5)` 같은 리터럴
❌ `bg-white` · `text-black` 처럼 **값이 박힌 유틸 클래스**
❌ `bg-ce5484d` 처럼 **값이 이름에 들어간 유틸** — 이름만 다를 뿐 같은 위반이다
❌ `.value`(hex)를 인라인 주입 — 라이트 값이 박혀 다크가 따라오지 않는다
❌ 색 리터럴을 prop 기본값으로 굳히기(`bodyBg = "#fff"`) — 호출부로 위반이 번식한다

---

## 8. Stagger Delay로 시각적 흐름
<!-- @policy id=stagger-delay | @severity should | @applies widget -->

**When to use.** 한 AI 응답 안에 카드가 **둘 이상** 쌓일 때.

**When NOT to use.**
- 카드가 하나면 지연이 곧 «느림»이다 — `delay={0}`.
- [[DataTable]] 의 행 · 목록 항목처럼 **같은 종류가 반복되는 것**에는 쓰지 않는다. stagger 는 「읽는 순서」를 말하는 장치이고, 동종 반복에는 순서가 없다.
- `prefers-reduced-motion` 을 켠 사용자 — 애니메이션을 끈다.

**규칙.** 메시지 스택 안의 카드들은 `delay`를 단계적으로 증가시켜 순차 진입.

**Why.** 모든 카드가 동시에 페이드 인하면 정보량이 한꺼번에 쏟아져 사용자가 어디부터 봐야 할지 길을 잃는다. 120ms씩 stagger하면 자연스러운 읽기 흐름이 생긴다.

**How.** 위젯 메시지 컴포넌트는 대부분 `delay` prop을 받는다. 한 응답 안에서 `0 → 120 → 240 → 360 …` 식으로 증가.

```tsx
<AiReasoning  delay={0}   />
<AiClassificationTable delay={120} />
<AiCostTable  delay={240} />
<AiChoiceButtons delay={360} />
```

데모/녹화용이 아닌 일반 응답에서도 적용 — 사용자 인지 부담을 낮춘다.

✅ 한 응답 안에서 `0 → 120 → 240 → 360 …` 으로 증가시킨다
✅ `prefers-reduced-motion` 에서는 애니메이션을 끈다

❌ 모든 카드에 `delay={0}` — 정보량이 한꺼번에 쏟아져 어디부터 볼지 길을 잃는다
❌ 카드가 하나인데 지연을 주기 — 그건 흐름이 아니라 그냥 느린 것이다
❌ 표의 행·목록 항목에 stagger — 동종 반복에는 읽는 순서가 없다

---

## 9. 새 컴포넌트를 만들기 전 체크리스트
<!-- @policy id=before-new-component | @severity must | @applies process -->

**When to use.** 「이건 DS 에 없으니 만들어야 한다」는 생각이 든 순간. 만들기 **전에** 거친다.

**When NOT to use.** 반복되는 구조를 **페이지 안 인라인으로** 두려 할 때는 이 체크리스트가 아니라 반대 결론이다 — 목록 행 · 카드 · 셀 · 항목처럼 의미 단위가 분명한 구조는 **추출이 기본**이다. 인라인 허용은 재사용 없는 1회성 레이아웃 래퍼(flex 컨테이너 등)에 한한다.

**규칙.** 새 컴포넌트를 추가하려는 충동이 들 때 — 추가하기 **전에** 다음을 확인:

1. **[`primitives.md`](./primitives.md)의 5개**로 조립 가능한가? → 가능하면 컴포넌트 만들지 말고 페이지에서 직접 조립
2. **기존 widget 컴포넌트의 prop 확장**으로 해결되는가? → 같은 외형/다른 데이터인 경우 매우 흔함
3. 위 둘이 다 안 되는 진짜 새 패턴인가? → 그러면 `widget/Ai<Name>.tsx`를 만들되, **반드시 `AiCard` + 토큰 + primitive 조합**으로

추가한 컴포넌트는 **세 정본에 함께** 들어간다 — 코드(docstring · export) · Storybook(스토리) · Figma 정본(세트 · 변수 연결 · 문서 프레임 · 게시)과 카탈로그 문서(`*-components.md` · 필요하면 `patterns.md` · `SKILL.md` · `llms.txt`). AI 는 카탈로그를 읽고 그대로 실행하므로 한쪽에만 있는 컴포넌트는 다른 쪽에서 다시 만들어진다. Figma 에 없는 하위 의존(컴포넌트 · 텍스트 스타일 · 아이콘)은 근사하지 말고 먼저 세 정본에 넣는다.

✅ 기존 컴포넌트의 **prop 확장**으로 되는지 먼저 본다 — 같은 외형·다른 데이터인 경우가 매우 흔하다
✅ 반복되거나 의미 단위가 분명한 구조(목록 행·카드·셀·항목)는 **컴포넌트로 추출**한다 — 추출이 기본이다
✅ 새 컴포넌트는 계층 명시 + docstring 4섹션 + 스토리 + `index.ts` export 를 **같은 PR 에서** 갖춘다
✅ 같은 흐름에서 **Figma 정본**(세트 · WDS 변수 연결 · 문서 프레임)과 **카탈로그 문서**까지 맞춘다 — 셋 중 하나라도 빠지면 추가가 끝난 것이 아니다

❌ 프리미티브로 조립되는 것을 새 컴포넌트로 — 페이지에서 직접 조립하면 된다
❌ 스토리 없이 추가 — 계층 판정이 story title prefix 라서 **게이트 5곳에서 동시에 빠진다**
❌ 코드만 병합하고 Figma 는 나중에 — AI 와 디자이너가 서로 다른 정본을 보고 같은 것을 두 번 만든다
❌ Figma 에 없는 하위 의존을 근사값으로 그리기 — 근사는 다음 조정 때 정본 밖에 남는다
❌ `map` 안에 구조를 인라인으로 펼치기 — 인라인 허용은 재사용 없는 1회성 레이아웃 래퍼뿐이다

---

## 10. 타이포그래피 위계 — `font-weight` 평탄화 금지
<!-- @policy id=type-hierarchy | @severity must | @applies type -->

**When to use.** 글자 크기·굵기를 정하는 모든 자리.

**When NOT to use.** 본문(running text)은 regular 하나로 둔다 — 문단 안에서 굵기가 오르내리면 그건 위계가 아니라 잡음이다.

**규칙.** 사이즈 + weight 둘 다로 위계 표현. 같은 사이즈에 weight 만 다르게 평탄화하지 말 것.

| 사이즈 | weight 기준 | 용도 |
|---|---|---|
| `text-lg+` (14px+) | `font-bold` | 페이지 타이틀 · 섹션 헤더 |
| `text-md` (13px) | `font-bold` 또는 medium (강조 시) | 카드 헤더 · 테이블 row 강조 |
| `text-base` (12px) | `font-medium` | 라벨 · 메타 · dropdown 항목 |
| `text-sm` (11px) | `font-medium` 또는 regular | 보조 메타 · 캡션 |
| `text-xs` (10px) | regular | 마이크로 캡션 · 인디케이터 |
| running text | regular | 본문 |

**Why.** 한국어는 영문보다 가독성 향상이 weight 보다 size 에 더 의존. 같은 사이즈에서 medium ↔ bold 만 바꾸는 것은 위계가 흐릿. 사이즈 + weight 둘 다 조합 시 정보 우선순위가 분명해짐.

**How.** 토큰 utility 클래스 (`text-md font-bold`, whatap-ds.css 제공) 만 사용. 직접 `style={{ fontSize: 13, fontWeight: 700 }}` 금지 — 토큰 외 값은 차후 토큰 변경 시 누락됨.

✅ **사이즈 + weight 를 함께** 조합해 위계를 만든다
✅ 크기를 직접 고르지 말고 **역할**로 고른다 — `heading.section` · `body.label` · `numeric.metric` 등 Role Catalog
✅ 유틸 클래스만 쓴다 (`text-md font-bold`)

❌ 같은 사이즈에서 weight 만 바꿔 위계를 만들기 — 한국어는 가독성이 weight 보다 size 에 더 의존한다
❌ `style={{ fontSize: 13, fontWeight: 700 }}` — 토큰 밖 값은 다음 토큰 변경에서 누락된다
❌ 본문(running text)에서 굵기를 오르내리기 — 그건 위계가 아니라 잡음이다

---

## 11. AI 카테고리 vs 일반 Primitive 분리
<!-- @policy id=ai-vs-plain-split | @severity must | @applies widget -->

**When to use.** 화면에 AI 진입점이나 AI 응답 UI 를 놓을 때.

**When NOT to use.** 일반 폼·검색·저장·삭제 — 거기는 [[TextField]] · [[Button]] 이다. `Ai*` 를 일반 실행에 쓰면 사용자가 자연어 분석과 폼 실행을 혼동한다. 반대로 AI 진입에 [[Button]] 을 쓰면 시각이 모호해진다.

**규칙.**
- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (`AiInlinePrompt` / `AiSendButton` / `AiAssistantButton`)
- 일반 폼/검색은 `TextField` / `Button`
- 페이지의 AI 진입점은 **버튼 대신 `AiInlinePrompt` 직접 주입** (2-step UX → 1-step UX)

**Why.** AI 와 일반 UI 의 시각 톤 (그라데이션 · 핀휠 심볼 · 송신 ⬆) 이 명확히 다르며, 페이지 안에서 "어디가 AI 이고 어디가 일반 실행인가" 즉시 구분되어야 사용자가 자연어 입력의 결과(분석/추론) 와 일반 폼 실행(저장/삭제) 을 혼동하지 않음.

inline prompt 직접 주입(1-step) 이 토글 버튼 → 위젯 열기 → input focus → 입력(4-step) 보다 훨씬 빠른 자연어 진입.

**How.**
- 페이지 헤더의 AI 진입 → [`PageHeaderAiInline`](./chrome-components.md#pageheaderaiinline) (내부 `AiInlinePrompt`)
- 위젯이 페이지 컨텍스트와 무관하게 토글되는 페이지만 → [`PageHeader`](./chrome-components.md#pageheader) (내부 `AiAssistantButton`)
- AI 카테고리는 패키지 `@whatap/design-system/widget` subpath 로도 import 가능 — 카테고리 분리가 코드 레벨에서도 가시화

❌ AI 진입에 `<Button>` (일반 primitive) — 시각 모호
✅ AI 진입에 `<AiInlinePrompt>` 또는 `<AiAssistantButton>`

---

## 12. 시간 정보 표기 — `TimeChip` 하나로
<!-- @policy id=timechip-only | @severity must | @applies type -->

**When to use.** 문장 **밖**에 서는 시간값 — 날짜 · 시각 · 구간 · 판정 기준 시각 · 차트 축 끝점.

**When NOT to use.**
- **문장 안**의 시각(「03:20 부터 진행 중입니다」) — 칩으로 싸면 글줄이 끊긴다.
- **시제 표지**(지금 · 오늘 · 지난 밤) — 그건 시간값이 아니라 구획 표시다. 채운 칩(검은 면 · 흰 글자)으로 구분한다. 밝은 회색 = 읽을 값, 검은 면 = 구획.
- 시간을 **고르는** 컨트롤 — [[TimeRangeSelector]] · [[DateTimeBlock]] · [[LiveTimerCompact]].

**규칙.** 화면에 나가는 시간값은 맨 텍스트로 두지 않고 [[TimeChip]] 으로 세운다.** 날짜 · 시각 · 구간 · 판정 기준 시각 · 차트 축 끝점이 모두 해당한다.

### Do

| 상황 | 이렇게 |
|---|---|
| 헤더/인사 옆 날짜 | `<TimeChip value="8월 11일" note="(화)" />` |
| 분석 구간 | `<TimeChip label="구간" value="8월 9일 18:00 ~ 10:08" />` |
| 스냅샷 기준 시각 | `<TimeChip label="판정 기준" value="10:08" note="· 방금" leadingIcon={<IcSnapshot size={12} />} />` |
| 낡은 값(예: 5분 경과) | 같은 칩에 `tone="warning"` — 칩 자체가 색으로 알린다 |
| 차트 가로축 끝점 | `<TimeChip value="02:10" />` — 축이라고 다른 표기를 쓰지 않는다 |

- 숫자는 `--font-family-numeric` + medium(자릿수 세로 정렬), 한글 라벨·꼬리말은 `--font-family-korean`. **컴포넌트가 이미 그렇게 한다** — 호출부에서 자형을 다시 지정하지 않는다.
- 크기는 `Chip` md(20px) 고정. `size` prop 이 없는 것이 요점이다.

### Don't

| 하지 말 것 | 왜 |
|---|---|
| 같은 화면의 시간값을 어떤 건 회색 글자, 어떤 건 칩으로 | **같은 종류의 사실이 두 가지 모양**이 되고, 사람은 그 둘을 다른 성격의 값으로 읽는다 |
| 화면마다 다른 칩 크기(lg / md 혼용) | 크기 차이는 위계 신호다. 같은 값에 다른 위계를 주면 어느 시각이 기준인지 흐려진다 |
| 문장 **안**의 시각을 칩으로 싸기 (「<TimeChip/> 부터 진행 중입니다」) | 글줄이 끊긴다. 칩은 문장 **밖**에 서는 값에만 |
| 구획 표시(챕터 라벨 · 섹션 표지)에 같은 모양 쓰기 | 밝은 회색 알약 = **읽을 값**, 채운 사각 = **구획**. 둘이 같아지면 표지가 값으로 읽힌다 |
| 인라인 `<span>` 으로 칩 흉내 | `Chip` 정책(#7 색은 토큰에서만)과 어긋나고, 규칙이 바뀔 때 한 곳만 고쳐지지 않는다 |
| 장식용 `leadingIcon` | 아이콘은 값의 **성격**을 말할 때만(셔터 = 언제 찍힌 것). 시계 아이콘은 「지금 몇 시」로 읽히므로 스냅샷에 쓰지 않는다 |

**왜 컴포넌트까지 만들었나** — 한 화면에 시간값이 여럿 흩어진다(지금 시각 · 분석 구간 · 판정 기준 · 차트 축). 표기 규칙을 문서로만 두면 화면마다 조금씩 어긋나고, 어긋난 표기는 «이 값들은 서로 다른 것» 이라는 잘못된 신호가 된다. 규칙을 컴포넌트에 넣으면 어긋날 자리가 없다.

시간을 **고르는** 컨트롤은 이 규칙 밖이다 — `TimeRangeSelector` · `DateTimeBlock` · `LiveTimerCompact`.

---

## 13. 의사결정 우선순위 — 부작용 없음 > 재사용성 > 정확한 디자인
<!-- @policy id=decision-priority | @severity context | @applies process -->

**When to use.** 위 정책들이 서로 부딪히거나, 어느 것도 답을 주지 않아 **판단해야 할 때**. 이 항목은 금지가 아니라 **판단 순서**다.

**When NOT to use.** `severity: must` 인 정책과 부딪힐 때는 이 우선순위가 그것을 뒤집지 못한다 — 색 리터럴 0 처럼 불변으로 선언된 것은 「정확한 디자인」을 이유로 깨지 않는다.

Product-SaaS 안에서 어떤 구현을 선택할지 갈릴 때, 다음 순서를 따른다.

1. **Side-effect-free**: 라이브 라우트(`/db/*`, `/k8s/*` 등 실제 SaaS 페이지를 복제한 라우트)의 동작을 깨지 않는다. 새 파일/라우트/prop 추가 (additive) 가 라이브 라우트 본문 수정보다 우선.
2. **Reusable**: 추가한 것은 다른 페이지에서도 재사용 가능해야 한다. 한 페이지 전용 hack은 곧 다른 페이지로 누수된다.
3. **Exact design**: 디자인 명세에 정확히 부합해야 한다. 픽셀/색/폰트를 임의로 근사하지 않는다 — 토큰/Figma 노드를 확인.

세 가지 모두 동시에 만족하지 않는 변경은 **머지하지 말고 디자인/엔지니어링 리뷰**.

✅ 라이브 라우트 본문을 고치기보다 **더하는(additive) 쪽**을 먼저 찾는다
✅ 한 페이지 전용으로 보이는 것도 **다른 페이지에서 쓸 수 있는 모양**으로 만든다
✅ 픽셀·색·폰트는 토큰이나 Figma 노드를 **확인**한다

❌ 한 페이지 전용 hack — 곧 다른 페이지로 누수된다
❌ 「거의 같으니」로 값을 근사하기 — 근사값은 토큰 체계 밖에 남아 다음 조정에서 빠진다
❌ 이 우선순위로 `severity: must` 를 뒤집기 — 불변으로 선언된 것은 「정확한 디자인」을 이유로 깨지 않는다

---

## 14. 그룹 구분 — 페이지에서는 카드를 나누고, 카드 안에서만 선을 긋는다
<!-- @policy id=group-separation | @severity must | @applies token -->

**When to use.** 성격이 다른 내용 묶음을 한 화면에 나란히 둘 때 — 결제 화면의 «플랜 정보 · 결제 · 요금», 설정 화면의 구획 등.

**When NOT to use.**
- 목록 **행 사이** 구분 → `--color-border-divider`(정의된 용도: 목록 행 사이 · 차트 축선). 이 정책은 행이 아니라 **구획**이다.
- 여러 구획 중 하나만 보여야 할 때 → [[Tabs]]. 접어 두어도 될 보조 구획 → [[Disclosure]].

**규칙.** 묶음이 **어디에 놓이느냐**로 구분 방법을 고른다.

| 놓이는 곳 | 구분 방법 | 이유 |
|---|---|---|
| **페이지 본문** | 묶음마다 `bg-card` 카드로 나누고 사이를 띄운다 — **선을 긋지 않는다** | Base surface 2단 레이어 — 회색 바닥(`--color-bg`) 위 카드 사이 간격이 이미 경계다. 선을 더하면 구분이 이중이 된다 |
| **카드 · 패널 · 모달 하나 안** | 묶음 **사이**에 1px `--color-border-default` + 위아래 여백 | 같은 표면 위라 층으로 나눌 수 없다. `--color-border-default` 의 정의된 용도가 «카드·테이블·헤더 구분선» |

```
┌ 구독 관리 ─────────────────┐   ← 카드 하나
│ 플랜 정보                  │   ← text-lg font-bold (heading.section)
│ …                          │
├────────────────────────────┤   ← border-t border-default  (사이에만)
│ 결제                       │
├────────────────────────────┤
│ 요금                       │
└────────────────────────────┘
```

**Why.** 경계는 하나만 말해야 한다. 페이지에서는 **층**(바닥 위의 카드)이 이미 «여기서 다른 것이 시작된다»를 말하므로 선은 소음이 된다. 카드 안에서는 층을 더 쌓을 수 없으니 선이 그 역할을 맡는데, 선의 진하기는 **구분의 크기**를 뜻한다 — 행 사이용 `--color-border-divider`(#ADADAD)로 구획을 나누면 구획이 행보다 약하게, 혹은 같은 급으로 읽혀 위계가 뒤집힌다.

**How.** DS 유틸만으로 된다 — 새 CSS 불필요.

```tsx
<div className="bg-card border border-default rounded-8px px-16px">
  {groups.map((g, i) => (
    <section key={g.id} className={`py-24px${i > 0 ? " border-t border-default" : ""}`}>
      <h3 className="text-lg font-bold text-primary">{g.title}</h3>
      <div className="mt-16px">{g.body}</div>
    </section>
  ))}
</div>
```

- 선을 카드 폭 전체에 그으려면 `px-16px` 를 카드가 아니라 각 `section` 에 준다 — 둘 중 하나로 통일한다.
- 색은 토큰 유틸(`border-default`)로만 — 다크에서 자동으로 따라온다(#7 색은 토큰에서만).

✅ 페이지 본문의 묶음은 **카드로 나눈다** — 선을 긋지 않는다
✅ 카드 안 묶음 사이에는 `--color-border-default` 1px 와 **위아래 여백**을 함께 둔다
✅ 묶음마다 제목을 `heading.section`(`text-lg font-bold`)으로 세운다

❌ 페이지 바닥 위 카드 사이에 선을 더 긋기 — 구분이 이중이 된다
❌ 구획 사이에 `--color-border-divider` — 행 사이용이라 구획이 행처럼 읽힌다
❌ 첫 묶음 위나 마지막 묶음 아래에 선 — 카드 테두리와 겹친다
❌ 선만 있고 여백이 없는 구획 — 묶음이 아니라 행처럼 읽힌다

---

## 15. 대시보드 위젯 — 껍데기는 WidgetFrame 하나
<!-- @policy id=dashboard-widget-frame | @severity must | @applies chart -->

**When to use.** 대시보드 · Flex 보드처럼 지표 위젯이 격자로 놓이는 제품 화면. 차트 · 표 · 수치를 한 칸에 담는 모든 자리.

**When NOT to use.**
- AI 위젯 **안**의 카드 → [[AiCard]] (§6). 두 껍데기는 «화면의 조각» 과 «AI 의 답» 을 가르는 표지라 서로 빌려 쓰지 않는다.
- 폼 · 설정의 구획 → 카드 + 구획 사이 선 (§14).
- 껍데기나 바깥 여백을 가진 차트(MiniLineChart · MiniMultiLineChart · MiniBarChart · ApdexChart · ForecastLineChart · BarList · MiniDonutChart · KpiCard · HexGrid · ActiveTransactionArc · ScatterHeatmap)는 `frame={false}` 로 끄고 WidgetFrame 에 넣는다. 켠 채 넣으면 카드가 두 겹이 된다. 단독 카드(`frame` 기본값)로 격자에 세우는 것은 대시보드가 아닌 자리(AI 답 · 히어로 에셋)에서만.

**규칙.** 위젯 한 칸은 [[WidgetFrame]] 이 **헤더 · 본문 · 푸터** 로 세운다. 그 위에 다섯 가지를 지킨다.

| 기준 | 규칙 |
|---|---|
| 껍데기 | 표면 · 테두리 · 반경 · 안쪽 여백 · 제목 줄은 WidgetFrame 만 정한다. 높이는 격자 행이 정한다 |
| 제목 · 메뉴 | **헤더는 제목 · 메뉴만.** 제목은 지표 이름만. 값 · 건수 · 대상 수 · 단위 · 시간 범위를 헤더에 두지 않는다(2026-10-08 사용자 결정). 칸에 꼭 필요한 값은 본문 첫 줄 왼쪽 `summary`(오른쪽은 범례), 시간 범위는 옵션바가 한 번 말한다. 헤더 오른쪽 아이콘 메뉴는 **⛶ 전체 화면 + ⋮ 더보기 둘로 고정**(순서 고정), 나머지 행동은 더보기 안으로 |
| 본문 간격 | 토큰 넷이 정한다: 좌우 `--wds-widget-body-px`(12) · 아래 `--wds-widget-body-pb`(12) · 줄 간격 `--wds-widget-row-gap`(4) · Y축 눈금 칸 `--wds-widget-axis-gutter`(28). 칸 안 차트는 **모두** `frame={false}` 로 자기 바깥 여백을 0 으로 둔다. 그래서 한 줄의 본문 시작선 · Y축 선 · X축 선이 같다. 세로 순서는 범례 → 통계값 → 그래프, 그래프가 남는 높이를 다 써서 X축이 본문 바닥에 닿는다 |
| 축 글자 | 모든 그래프의 X · Y축 글자는 `text-chart`(9px) · 숫자 서체 · `text-tertiary` 하나. 범주축(TOP-N 서버 막대)도 같다 · MiniBarChart `categories` 가 이름을 막대 바로 아래 가운데에 두고 칸 폭에서 말줄임한다. 막대 위 값(`valueLabels`)도 같은 글자에, 가장 큰 값만 굵게 · primary |
| 지금 값 | 계열 하나는 `summary`, 둘 ~ 넷은 범례 이름 뒤 `value`, 강조 계열이 여럿이면 선 끝 배지(§25). 한 칸에 한 방식 |
| 범례 | **본문 오른쪽 위 한 줄**(`legend`) · **모든 차트 칸에, 계열이 하나여도**. 이름은 계열 이름(제목 아님). 예외는 이름표가 본문 안에 있는 BarList · 도넛 · Apdex · 숫자 칸. 속도 구분은 `SPEED_LEGEND`. 상태 맵(HexGrid)에 칸 수를 붙일 때는 `hexGridLegend(items)`(`Critical 3`) · 수는 칠해진 색을 센다. 헤더 · 푸터 · 본문 아래 · 왼쪽에 두지 않는다 |
| 색 | 선 · 막대는 `--color-chart-series-N`. 상태색(`--color-status-*` · `--color-indicator-critical`)은 **상태를 말하는 위젯에만** 쓰고, 한 위젯 안에서 둘을 섞지 않는다 |
| 빈 상태 | 데이터 없음(`no-data`)과 수집 끊김(`collect-gap`)을 가른다. 둘 다 선을 0 으로 그리지 않는다 |
| AI 진입점 | 위젯이 아니라 **페이지 성격**이 정한다. 레거시 차트 모드 · 전체 격자 화면에서는 두지 않는다. AI 위젯을 여는 제품 화면에서는 `onAsk` 하나로 **더보기 첫 줄**(「AI 에게 묻기」, 늘 닿는 길)과 **헤더 맨 앞 호버 지름길** 아이콘을 함께 둔다. 지름길은 호버 · 포커스 때만 보이고 자리는 늘 잡혀 있다. 상시 노출 아이콘은 두지 않는다 |
| 끌기 | `draggable` 은 칸을 사람이 배치하는 보드(Flex 보드)에만. 헤더가 손잡이, 메뉴 묶음은 제외, 이동은 격자가 맡는다. 배치가 정해진 대시보드에서는 켜지 않는다 |

**Why.** 격자는 «같은 것이 나란히 있다» 로 읽히는 형식이다. 칸마다 여백이 1~4px 다르고 제목 굵기가 다르면 사람은 그 차이를 종류의 차이로 읽는다. 껍데기를 차트마다 따로 두면 그 차이는 반드시 생긴다(2026-10 통합 대시보드 실측: 여백 12 · 12/8 · 8/6px, 제목 bold · medium 이 한 화면에 섞였다).
색이 섞이면 같은 빨강이 «위험» 인지 «시리즈 8» 인지 알 수 없다. 끊긴 수집을 0 으로 그리면 «조용하다» 로 읽혀 장애가 정상으로 감춰진다. 위젯마다 AI 아이콘을 다는 것은 판단을 문장 대신 부스러기로 흩는 일이라, 붙일지 말지를 칸 단위가 아니라 화면 단위로 정한다.

**How.**

```tsx
<div className="grid grid-cols-4 gap-12px" style={{ height: 232 }}>
  <WidgetFrame title="액티브 트랜잭션" legend={SPEED_LEGEND}>
    <ActiveTransactionArc frame={false} agents={agents} maxTx={maxTx} agent={agent} />
  </WidgetFrame>
  <WidgetFrame title="히트맵" summary="수행 시간(초)">
    <ScatterHeatmap dots={dots} />
  </WidgetFrame>
  <WidgetFrame title="DB 액티브 세션" state="collect-gap" stateDescription="2대 · 18분째 끊김" />
</div>
```

✅ 위젯 한 칸은 `WidgetFrame` 으로 세우고, 높이는 격자 행에 준다
✅ 표 · 히트맵 · 아크처럼 본문이 가장자리를 가지면 `bleed`
✅ 끊긴 수집은 `state="collect-gap"` + 끊긴 범위 한 줄
✅ 헤더 메뉴는 `onFullscreen` · `menu` 로만 — 아이콘 자리를 직접 짜지 않는다
✅ 칸 안 차트는 아크 · 히트맵까지 모두 `frame={false}` — `bleed` 는 표에만

❌ 페이지에서 `bg-card border …` 로 위젯 껍데기를 직접 짜기 — 칸마다 여백이 달라진다
❌ 껍데기를 가진 차트를 `frame` 을 켠 채 WidgetFrame 에 넣기 — 카드가 두 겹이 된다. 늘 `frame={false}`
❌ 수집이 끊긴 구간을 0 선 · 빈 막대로 그리기 — 정상으로 읽힌다
❌ 레거시 격자 화면의 차트마다 `onAiTrigger` — AI 진입점은 화면 단위로 정한다
❌ AI 지름길 아이콘만 두고 ⋮ 첫 줄을 빼기 — 터치 · 키보드에서 진입점이 사라진다. `onAsk` 가 둘을 함께 세운다
❌ 헤더에 값 · 건수 · 단위 · 시간 범위(「에이전트 8」 「최근 5분」) — 헤더는 제목 · 메뉴만. 값은 `summary`
❌ 배치가 정해진 대시보드에 `draggable` — 제목 · 메뉴를 누르려다 칸이 밀린다
❌ 위젯마다 헤더 아이콘을 다르게 늘어놓기(설정 · 복사 · 이동 …) — 칸이 좁을 때 제목이 칸마다 다른 자리에서 잘린다. ⛶ + ⋮ 둘로
❌ 범례를 헤더 오른쪽이나 푸터에 — 헤더는 메뉴 자리, 범례는 차트에 붙어 읽혀야 한다
❌ 계열이 하나라고 범례를 빼기 · 차트가 자기 안쪽(왼쪽 아래 등)에 범례를 그리기 — 칸마다 범례 자리가 달라진다
❌ 칸 안 차트가 자기 여백을 또 두기(`frame` 켠 채) · 차트마다 다른 축 글자 크기 — 한 줄의 Y축 선과 글자가 칸마다 어긋난다

---

## 16. 툴팁 트리거 — 밑줄 말고 ⓘ InfoTip
<!-- @policy id=tooltip-trigger-infotip | @severity must | @applies chrome -->

**When to use.** 글자(라벨 · 값 · 문장 · 「외 N」)에 보조 설명을 다는 모든 자리.

**When NOT to use.** 아이콘만 있는 버튼의 이름표 — 그 버튼에 [[Tooltip]] 을 직접 씌운다([[ToolbarIconButton]] 은 내장).

**규칙.** 툴팁 트리거를 **밑줄(점선 · 실선)로 표현하지 않는다.** 설명이 붙는 글자는 밑줄 없이 그대로 두고, 바로 뒤에 [[InfoTip]](원 안에 영문 i 가 든 16px 버튼)을 둔다. 글자와 사이 4px, 같은 줄 가운데 정렬.

### Do

| 상황 | 이렇게 |
|---|---|
| 값 문장에 설명 | `한계 금액 200,000원 <InfoTip content="…" />` |
| 「외 N」 으로 접은 목록 | `외 8 <InfoTip label="나머지 프로젝트" content="주문 API · 정산 배치 · …" />` |
| 문단에 덧붙이는 한 문장 | 문단 끝에 InfoTip 하나 |

### Don't

| 하지 말 것 | 왜 |
|---|---|
| `<Tooltip><span className="underline decoration-dotted">…</span></Tooltip>` | 밑줄은 링크로 읽히고 트리거 경계가 흐리다 |
| 문단 전체를 Tooltip 트리거로 감싸기 | 설명이 있다는 표지가 없어 아무도 열지 않는다 |
| 글자 앞에 ⓘ 를 두기 | 읽는 순서가 «설명 → 대상» 으로 뒤집힌다. ⓘ 는 설명을 다는 글자 바로 뒤 |

**왜.** 밑줄은 링크로 읽힌다. 누르면 어디로 갈 것 같은데 아무 일도 없다. 점선 밑줄은 트리거가 어디서 어디까지인지 경계가 흐리고, 글자 길이가 바뀌면 트리거 크기도 따라 바뀐다. ⓘ 는 «여기에 설명이 있다» 는 뜻이 하나로 굳어 있고 크기가 늘 같다(2026-10-12 사용자 결정).

---

## 17. 차트 색 — «무엇을 말하나» 로 역할을 고른다
<!-- @policy id=chart-color-role | @severity must | @applies chart -->

**When to use.** 차트 마크(선 · 막대 · 점 · 칸 · 조각)에 색을 칠하는 모든 자리. 새 차트를 만들 때, 기존 차트에 계열을 더할 때, 범례 색을 정할 때.

**When NOT to use.**
- 차트 안 축 · 라벨 · 값 글자 → text 토큰과 `text-chart`. 색은 마크가 맡는다.
- 차트가 아닌 상태 표시(배지 · 도트 · 토스트) → `--color-status-*` · tone (§7).
- 위젯 껍데기 · 범례 자리 → §15.

**규칙.** 색을 먼저 고르지 않는다. 그 색이 **무엇을 말하는지**를 먼저 정하고, 그 역할의 토큰 묶음 안에서만 고른다.

| 색이 말하는 것 | 토큰 | 지금 쓰는 곳 |
|---|---|---|
| **정체성** — 어느 계열인가 | `--color-chart-series-1..8` | [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]] · [[MiniDonutChart]] · [[BarList]] · [[GpuStatusBar]] · [[HexGrid]] · [[ApdexChart]] · [[ForecastLineChart]] |
| **크기** — 얼마나 큰가 (단계) | `--color-chart-seq-1..4` | [[UsageChart]] |
| **강도** — 얼마나 큰가 (연속) | `--color-heatmap-0..100` · `--gradient-heatmap-scale` | [[HeatmapCell]] · [[HeatmapLegend]] |
| **판정 등급** — 도메인이 정한 구간 | `--color-chart-apdex-*` · `--color-chart-speed-*` | [[ApdexChart]] · [[ActiveTransactionArc]] · [[ScatterHeatmap]] |
| **판정 밖** — 대조군 · 평탄 계열 | `--color-chart-neutral` | [[ForecastLineChart]] |
| **상태** — 정상 · 경고 · 위험 | `--color-status-*` · `--color-indicator-critical` | 상태를 말하는 위젯에만 (§15) |

트랙 · 값 없음 · 남은 몫처럼 데이터 색이 아닌 자리는 **바탕** 이다. `--color-surface-*` 로 깔고 위 여섯 역할의 토큰을 쓰지 않는다.

차트마다 무엇을 어느 역할로 칠하는지는 그 차트 docstring 의 `## Colors` 가 정본이다(`- 역할 — 무엇에 · 토큰`, 역할 낱말은 이 표 + 바탕). MCP `get_component` 와 Storybook Docs 가 같은 값을 보이고, `lint:docstrings` 가 소스가 칠하는 색 묶음과 어긋나면 막는다. 위 표의 «지금 쓰는 곳» 은 예시다.

series 는 네 가지를 지킨다.
- **1번부터 순서대로** 배정하고 **순환하지 않는다.** 순서 자체가 색각 이상(CVD) 안전 장치다.
- 9번째 계열은 새 색을 만들지 않고 «기타» 로 접거나 small multiples 로 나눈다.
- **색은 엔티티를 따라간다.** 필터로 계열 수가 바뀌어도 남은 계열의 색은 그대로다. 순위로 다시 칠하지 않는다.
- 한 위젯 안에서 series 와 상태색을 섞지 않는다.

크기 · 강도 스케일은 한 방향으로만 진해진다. seq 는 **다크에서 anchor 가 뒤집힌다**(어두움=작음 → 밝음=큼). 자동 반전이 아니라 고른 값이다.

**Why.** 무엇을 말하는지 정하지 않고 색을 고르면 같은 빨강이 «위험» 인지 «계열 8» 인지 «가장 큼» 인지 알 수 없다. 구 `--color-palette-{hex}` 36색이 그 실패였다. 값이 이름이라 «계열 색을 무엇으로 고르나» 에 답이 없었고, 실제로 참조되던 4색에도 차트가 아닌 색(토스트 도트 · 아바타 그라데이션)이 섞여 있었다.
순환을 막는 것은 9번째가 1번과 같은 색이 되면 범례가 두 계열을 같은 것으로 말하기 때문이다. 엔티티를 따라가게 하는 것은 필터를 바꿀 때마다 색이 바뀌면 사람이 색으로 계열을 기억할 수 없기 때문이다.

**How.**

```tsx
<MiniMultiLineChart
  series={[
    { label: "app-1", values: a, color: "var(--color-chart-series-1)" },
    { label: "app-2", values: b, color: "var(--color-chart-series-2)" },
  ]}
/>
```

✅ 색보다 먼저 «이 색이 무엇을 말하나» 를 정하고 그 역할의 토큰 묶음에서 고른다
✅ 계열이 9개 이상이면 «기타» 로 접거나 small multiples 로 나눈다
✅ 필터를 바꿔도 계열 색을 유지한다 — 색은 엔티티의 것이다
✅ 축 · 라벨 · 값 글자는 text 토큰

❌ 계열 색 순환(9번째 = 1번) — 범례가 두 계열을 같은 것으로 말한다
❌ 상태색을 «series 9» 로 재사용 — 상태색은 예약된 의미다
❌ 라벨 · 값 텍스트에 series 색 — 텍스트는 text 토큰, 색은 마크가 맡는다
❌ 순서 없는 항목(서버 이름 등)에 seq · heatmap 스케일 — 없는 순서를 읽게 한다
❌ 값이 이름인 색(`--color-palette-*` 류)을 다시 만들기 — 역할로 이름 짓는다 (§7)

---

## 18. 맞닿는 마크는 3계열까지 — 넘으면 facet 으로 나눈다
<!-- @policy id=chart-all-pairs-cap | @severity must | @applies chart -->

**When to use.** 아무 두 계열이나 화면 어디서든 맞닿을 수 있는 차트 — scatter · bubble · choropleth(지도) · small multiples. 계열 색의 **모든 쌍**이 구별돼야 하는 자리.

**When NOT to use.**
- 계열이 정해진 순서로 이웃하는 차트(선 · 누적 막대 · 도넛). 이웃한 쌍만 구별되면 되므로 8계열까지 쓴다 (§17).
- [[ScatterHeatmap]] 처럼 계열이 아니라 판정 등급(`speed-*` 3단)을 칠하는 차트 — §17 의 등급 행을 따른다.

**규칙.** 맞닿는 차트는 `--color-chart-series-1..3` 까지만 쓴다. 4계열 이상이면 색을 더하지 않고 **facet**(계열마다 작은 차트 하나)으로 나눈다.

**Why.** 측정한 값이다. series 1~3 의 모든 쌍은 최소 색차가 라이트 ΔE 24.5 · 다크 17.4 로 충분하다. 4번째(gold)를 넣으면 2번(amber)과 정상시야에서도 ΔE 11.0 · 11.6 으로 무너진다. 선 · 막대처럼 이웃한 쌍만 보는 차트에서는 문제가 없던 색이 맞닿는 차트에서는 구별되지 않는다.
**팔레트를 고쳐서는 해결되지 않는다.** 8색을 모든 쌍에서 떼어 놓으면서 대비와 색각 이상 조건까지 함께 만족하는 팔레트는 없다. 그래서 상한은 색이 아니라 레이아웃으로 지킨다.

✅ scatter · bubble · 지도는 series 1~3 까지
✅ 4계열 이상이면 계열마다 한 칸씩 small multiples

❌ 맞닿는 차트에 4번째 계열 색 — orange 와 gold 가 같은 점으로 읽힌다
❌ 상한을 넘기려고 새 색 토큰 추가 — 팔레트로는 해결되지 않는다

---

## 19. 이중 축 금지 — 스케일이 다르면 차트를 나눈다
<!-- @policy id=chart-no-dual-axis | @severity must | @applies chart -->

**When to use.** 단위나 범위가 다른 두 지표를 한 화면에서 비교하고 싶을 때 — TPS 와 응답시간, 요청 수와 에러율.

**When NOT to use.**
- 같은 단위 · 같은 범위의 지표 여럿 → 한 차트의 여러 계열 (§17).
- 같은 지표의 관측과 예측 → [[ForecastLineChart]] 한 판. 축이 하나다.
- **기존 화면** — APM 액티브 스택 이력(막대 + 선 복합, 이중 Y축)은 이관 대상이다 (§21). 그 화면을 이 DS 로 옮길 때 [[PairedTimeChart]] 로 — 막대와 선을 두 칸으로 나누고 시간 범위 · 시점 고르기를 같게 둔다.

**규칙.** Y축을 두 개 두지 않는다. 스케일이 다른 두 지표는 차트를 둘로 나눈다. 대시보드에서는 [[WidgetFrame]] 두 칸이다.

**Why.** 이중 축에서는 두 선이 만나는 자리와 기울기 차이를 **축 범위를 어떻게 잡았느냐**가 정한다. 범위를 바꾸면 교차가 생기거나 사라진다. 데이터에 없는 관계를 그림이 만든다. 사람은 두 선의 높이를 같은 눈금으로 읽기 때문에 오른쪽 축을 따로 읽지 않는다.

✅ 스케일이 다른 두 지표는 차트 두 개 — 대시보드에서는 WidgetFrame 두 칸
✅ 같은 시점을 비교해야 하면 두 차트의 시간 범위를 같게 둔다

❌ 오른쪽 Y축을 하나 더 두기 — 축 범위가 교차와 기울기를 만든다
❌ 두 지표를 한 차트의 두 계열로 겹치고 범례로만 단위 설명 — 같은 눈금으로 읽힌다

---

## 20. 차트 팔레트를 바꿀 때는 검증기로 판정한다
<!-- @policy id=chart-palette-validate | @severity must | @applies chart -->

**When to use.** `--color-chart-series-*` · `--color-chart-seq-*` 의 값을 바꾸거나 단계를 더할 때. 라이트 · 다크 어느 쪽이든.

**When NOT to use.** 차트 토큰을 참조만 하는 컴포넌트 작업. 값이 바뀌지 않으면 다시 잴 것이 없다.

**규칙.** 눈으로 판정하지 않는다. `pnpm lint:chart-palette`(`pnpm test` 에 포함)가 런타임 값으로 대역 · 채도 · 대비 · 인접 · 1~3 전체 · 엔티티 순서 · Severity 변별 · 사본 일치를 자동으로 잰다. 새 후보를 고를 때는 dataviz 스킬의 `scripts/validate_palette.js` 로 다시 잰다 — 6개 체크, seq 는 `--ordinal`, 맞닿는 상한(§18)은 `--pairs all`. 결과 수치는 `whatap-ds.css` 선언 위 주석과 [`tokens.md`](./tokens.md) → Chart 의 검증 표에 남긴다. 값을 바꿨으면 차트 스냅샷(`test:visual`)을 라이트 · 다크로 확인한다.

**Why.** 지금 팔레트의 첫 후보는 실제로 FAIL 했다. gold 의 밝기가 밴드를 벗어났고(L 0.848) 4색 대비가 모자랐다. 화면에서는 괜찮아 보였다. 2026-10-14 재조정에서는 계산으로 고른 후보조차 hex 로 반올림된 뒤 밝기 대역 · 채도 하한을 벗어나 FAIL 했다 — 계산으로 고른 값도 검증기로 다시 잰다. 색각 이상 ΔE 와 대비는 눈으로 판정할 수 없는 값이다. 수치를 남기는 것은 다음 사람이 «왜 이 색인가» 를 다시 재지 않고 읽게 하기 위해서다.

✅ 값을 바꾸면 검증기를 라이트 · 다크 둘 다 돌린다
✅ 최악 인접 CVD ΔE · 정상시야 최악 · 대비 수치를 tokens.md 검증 표에 갱신한다

❌ 화면을 보고 «구별된다» 로 통과 — 첫 후보가 그렇게 보였고 FAIL 했다
❌ 검증 없이 series 에 9번째 색 추가 — 인접 조건과 상한(§18)이 함께 바뀐다

---

## 21. 레거시 차트 규칙 흡수 — 의미는 받고, 값과 이름은 정본 것으로
<!-- @policy id=chart-legacy-absorb | @severity must | @applies chart -->

**When to use.** 제품 · 회사 토큰(Design Bible D-032 의 `--wds-chart-*`) · 레거시 renderer(whatap-react-chart · visualization · 보고서)에 이미 있는 차트 관행을 이 DS 로 가져올 때. 레거시 화면을 이 DS 차트로 옮길 때. Chart Art 에 «제품에서는 이렇게 부른다» 를 적을 때.

**When NOT to use.**
- 레거시에 없는 새 표현 → §17~20 을 바로 따른다.
- 레거시 저장소 자체를 고치는 일 → 이 DS 범위 밖이다(Chart Art 범위는 이 DS 의 차트 언어, 2026-10-14 결정).

**규칙.** 레거시 항목 하나마다 네 처분 중 하나를 고른다. 레거시의 **의미**(무엇을 구별하려 했나)는 받고, **값과 이름**은 이 DS 정본의 것을 쓴다.

| 처분 | 뜻 | 할 일 |
|---|---|---|
| **대응** | 같은 역할이 이미 있다 | 대응표에 한 줄. 토큰을 새로 만들지 않는다 |
| **흡수** | 역할은 있고, 레거시가 고정 배정을 더 가지고 있다 | 정본 토큰 위에 배정을 얹는다(값 복제 금지) · 검증기로 잰다 (§20) |
| **공백** | 이 DS 에 그 역할이 없다 | 근사하지 않는다. 토큰 추가 근거로 기록하고 따로 결정한다 |
| **이관 대상** | 이 DS 정책과 충돌한다 | 기존 화면에서만 유지한다. 새 화면은 따르지 않고, 옮길 때 정책대로 바꾼다 |

**대응표** (D-032 · 2026-10-14 제품 차트 탐색 기준)

| 레거시 | 처분 | 이 DS |
|---|---|---|
| 계열 `method` · `sql` · `httpc` · `dbc` · `socket` · `resultset` | **흡수** | series 슬롯 **1 · 3 · 7 · 2 · 5 · 6** 에 고정. 이 순서로 이웃해도 라이트 · 다크 검증 통과(Why) |
| `common-axis` · `common-grid` | 대응 | 축 글자 `text-tertiary` + `text-chart` · 격자 `border-soft` (§15) |
| `common-compared-*` · `common-inactive` | 대응 | `--color-chart-neutral` — 판정 밖 · 대조군 |
| `common-active-fill` · `common-active-line` (선택 영역) | 공백 | 차트 안 선택 영역 역할이 없다 |
| `tooltip-background` · `tooltip-border` | 대응 | [[Tooltip]] 표면 |
| `hitmap-warning-2` · `hitmap-warning-3` | 대응 | `--color-chart-speed-slow` · `--color-chart-speed-very-slow` ([[ScatterHeatmap]]) |
| `hitmap-normal-1..3`(밀도 단계) · `hitmap-warning-1` | 공백 | 판정 안의 «밀도» 기준, 정상과 느림 사이 한 단계가 없다 |
| `containermap-warning` · `containermap-critical` | 대응 | `--color-status-warning` · `--color-status-error` ([[HexGrid]]) |
| `containermap-normal` | 대응 · 정리 필요 | [[HexGrid]] 는 지금 정상을 `series-1` 로 칠한다 — 상태 맵에서 계열색과 상태색을 섞는 것이라 §17 과 어긋난다 |
| `containermap-dead` · `-wait` · `-pause` · `*-agent` | 공백 | 비활성 상태 3종과 «에이전트» 명도 변형이 없다 |
| 이중 Y축 (APM 액티브 스택 이력) | 이관 대상 | §19 |
| 이름 «Hitmap» · «Cube» | 대응 | [[ScatterHeatmap]] · [[Heatmap]] (`day` 5분 칸 · `month`) |

**유형 대응표** (차트 유형 카탈로그 · service.whatap.io 데모 캡처 2026-10-15 기준 · 2026-10-21 26유형 판으로 재대조. 모든 유형이 함께 쓰는 축 · 격자 · 범례 · 빈 상태는 §26)

위 표가 토큰과 이름을 처분한다면, 이 표는 **차트 유형**을 처분한다. 레거시 화면을 옮길 때 유형을 먼저 여기서 찾는다. 처분 칸이 «대응» 이어도 «남는 공백» 이 있으면 그 부분은 근사하지 않는다.

| 레거시 유형 | 처분 | 이 DS | 남는 공백 · 비고 |
|---|---|---|---|
| 선 (단일 · 다중) | 대응 | [[MiniLineChart]] · [[MiniMultiLineChart]] | 지금 값(숫자 오버레이 · 선 끝 값 배지 · 카드 분리)은 §25 가 자리를 정한다. 계열 색 순환은 §17 위반, Top-N 순위 범례 · «1위 강조 · 나머지 흐림» 은 §22 강조 + 회색 다발로 옮긴다(색은 순위가 아니라 개체) |
| 면 | 대응 | [[MiniLineChart]] · [[MiniMultiLineChart]] `showArea` | 없음 |
| 누적면 (GPU Power 8계열) | 대응 | [[StackedAreaChart]] | **정해짐(2026-10-23, 추천안)** — 범례는 별도 패널이 아니라 다른 차트와 같은 자리(플롯 위 오른쪽 · WidgetFrame `legend`) · 면은 불투명 + 층 사이 카드색 1px · 크고 안정적인 계열을 바닥에(얇은 층은 위로) · 합계 최고점 ▼. 9계열 이상이면 §22 |
| 차트 타입 전환 토글 (선 · 스무딩 · 막대) | 이관 대상 | §15 헤더 메뉴 | 헤더 오른쪽은 ⛶ + ⋮ 고정이다. 옮길 때 ⋮ 안으로 넣는다. 헤더에 상시로 둬야 한다면 §15 개정을 따로 결정한다 |
| 세로 막대 · 범주(TOP-N) 막대 | 대응 | [[MiniBarChart]] `categories` · `valueLabels` · 누적 | 스트라이프 텍스처 · 막대 안 값 라벨은 받지 않는다(§15 값 글자는 막대 위 · 막대 안 라벨은 막대가 짧아지면 넘친다). 지표 고르기(칩 · 드롭다운 · 토글 셋이 섞여 있다)는 **공백**. 값 없는 계열까지 범례에 싣는 문제는 §26 |
| 가로 막대 (액티브 스테이터스 · CPU TOP-N) | 대응 | [[BarList]] | METHOD · SQL · HTTPC · DBC · SOCKET 색은 위 표의 엔티티 슬롯(흡수). **0 값 줄은 막대가 사라지고 값 · 이름만 남는다** — DS 도 같다(`ratio` 0 → 폭 0, 2026-10-21 코드 확인). 0 표현 규칙은 결정 필요. 값이 평탄한 TOP-N(84% 하나 · 83% 일곱)은 막대 길이로 순위가 읽히지 않는다 — 분모를 화면이 정하므로(`ratio`) 평탄할 때의 표현은 결정 필요 |
| 단일 누적 바 (페이지 로드 타임라인 · 심각도 분포 · 활용 현황) | 대응 | [[SegmentBar]] | **정해짐(2026-10-23, 추천안)** — 남는 몫(대기 시간 등)은 `restLabel` 이름 구간으로 범례에도 넣는다 · 범례는 바 아래 한 줄(넘치면 줄바꿈, 1행 · 2×2 로 바꾸지 않음) · 견본 사각(막대 마크, §26) · 값/비율은 `legendValue` |
| 산점도 · 버블 (SQL Elapse Map) | 대응 | [[ScatterChart]] | [[ScatterHeatmap]] 은 응답시간 판정 전용이라 근사하지 않는다. §18 — 계열 3개까지(타입이 막는다), 넘으면 facet. **밀도는 반투명(0.6)으로 정해짐(2026-10-23 사용자 결정)** — 겹친 곳이 짙어진다. 칸 집계는 판정 분포와 섞이고 흩뿌림은 값을 바꿔 쓰지 않는다. 마커는 원 6px(레거시 십자 · 사각 대신), 버블은 면적 비례 반지름 3~12px |
| 구역 분할 산점도 (GPU Resource Map) | 대응 | [[ZoneScatterChart]] | **정해짐(2026-10-23, 추천안)** — 구역 = 무채색 면(`surface-50`) + 카드색 경계 · 점 = 계열색 · 축은 선형이고 구역 경계를 실제 값 자리에(좁은 열의 이름 · 개수는 플롯 아래 한 줄) · 구역 이름과 개수는 한 줄 · 열 머리는 한 줄 범례 · 액션은 WidgetFrame `menu`. 원 기록: 구역 배경과 점이 같은 색 계열이라 점이 묻힌다. 만들 때 둘을 다른 역할(§17)로. 불균등 눈금(0 · 1 · 50 · 100)이라 점 위치가 비율을 말하지 않고, 구역 이름과 개수가 칸의 대각선 양 끝에 떨어져 짝이 읽히지 않는다 |
| 박스플롯 | 대응 | [[BoxPlotChart]] | 캡처 없음 — 문서 요소로 만들었다. **마크는 모두 백분위(2026-10-23 사용자 결정 «B안»)** — 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99. 통계 표준(사분위 · Tukey · 개별 이상치)은 처음 만들었다가 걷어냈다: 운영자의 언어(p95 · SLO)가 아니고 이상치가 축을 늘려 상자가 눌렸다. Y 는 p95 기준(넘는 p99 는 ▲ + 값) · p50 숫자는 가운데 선 옆 · 범례 문장 `BOX_PLOT_LEGEND` 늘 표시 |
| 파이 · 도넛 | 대응 | [[MiniDonutChart]] `centerLabel` | «기타» 묶음(§17 9번째부터)은 **공백**. **DS 도 표시된 조각 합을 100% 로 그린다**(2026-10-21 코드 확인) — 전체 3.2% 인 값이 링을 꽉 채운다. 100% 의 기준을 표기할지 결정 필요. 조각이 하나면 원형 진행 막대처럼 보인다 — 숫자 칸으로 대체할지 결정 필요 |
| 복합 · 이중 축 (액티브 스택) | 대응(대체 표현) | [[PairedTimeChart]] | **정해짐(2026-10-23, 추천안)** — 이중 축 대신 시간축 공유 두 칸(§19) · 축 제목 대신 칸 이름(단위는 눈금 접미사, §26) · 미래 구간은 빈칸(`count`), 수집 없음은 «모름» 칸 · 선 끊김 · 두 칸 시점 고르기 공유 |
| 큰 숫자 · KPI 카드 | 대응 | [[KpiCard]] · [[StatCard]] `trend` | 델타 수치(▲▼ + 값) · 비교 시점 캡션 · 비교 기준 고르기는 **공백**. 테두리 색만으로 상태를 말하는 카드는 §23(아이콘 + 라벨)과 맞춰서 옮긴다. 레거시 KPI 카드는 주값 · 퍼센트 · 보조 · 하위 분해 네 겹이 한 카드에 있어 읽는 순서가 없다 — 겹 수 상한은 결정 필요. 숫자 그리드는 셋째 열부터 잘리고 열 제목이 두 줄로 꺾인다 — 열 수 상한 · 축약 규칙 결정 필요 **정해짐(2026-10-23, 추천안)** — 숫자 그리드는 [[MetricGrid]]: 한 줄 4칸까지 · 넘으면 줄바꿈(가로 스크롤 금지) · 칸 이름 한 줄 말줄임 · 칸은 세 겹까지(하위 분해는 [[SegmentBar]] · [[BarList]]). 델타는 [[TrendTile]] |
| 오늘 · 어제 비교 추이 (GPU 전력 소비) | 대응 | [[MiniMultiLineChart]] — 어제는 `--color-chart-neutral`(대조군, §17) | 상단 숫자 세 칸(최근 1시간 · 오늘 누적 · 어제 동시각)은 숫자 칸으로 나눈다. 어제 값이 0 일 때 «0» 과 «수집 없음» 을 가르지 않으면 비교 계열이 빈 선으로 보인다(§15 빈 상태) |
| 범위 바 (min · 현재 · Max, ▼ 마커) | 공백 | 없음 | [[UsageGauge]] 는 «한계 대비 쓴 양» 이라 근사하지 않는다. 리소스보드 KPI 와 인벤토리 표에 구현이 둘이다(▼ 마커 + 임계 분절 / 검은 막대 마커 + 단색). K8S Request CPU 는 채움 없는 트랙 옆에 라벨 없는 숫자 셋과 잘린 캡션(`R.. A..`)만 있어 해석되지 않는다 — 범위 숫자마다 이름을 붙이는 것이 함께 필요하다 |
| 호 게이지 | 대응 | [[ArcGauge]] · [[ChartArc]] | 캡처 없음 — **[[RangeGauge]] 와 같은 계약으로 만들었다(2026-10-23, 추천안)**: 채움 색 = 값이 든 임계 구간 · 임계는 바깥 띠 · 숫자 쉼표 · 양 끝 이름 + 값. 240°(아래 열림). [[ActiveTransactionArc]] 는 APM 액티브 트랜잭션 전용 |
| 스피드 차트 | 대응 | [[ActiveTransactionSpeedWidget]] | 없음 |
| 컴파운드아이 | 대응(보존) | [[CompoundEye]] | 셀 하나 안에서 두 스케일(부채꼴 · 외곽 링)을 쓰고 값 눈금이 없었다 — 보존(2026-10-22)하고 고쳤다(2026-10-23, 추천안): 안쪽 기준 원 50% · 100% · 링은 틈으로 떼고 색 하나(수신 오른쪽 · 송신 왼쪽) · 링 스케일은 범례 «링 끝 = …» · 다섯 값은 툴팁 · 상태는 바탕만 |
| 세로 이퀄라이저 · 리소스 이퀄라이저 | 대응 | [[EqualizerChart]] | **정해짐(2026-10-23, 추천안)** — 칸 하나 = 축 최대 ÷ `levels`(기본 10, [[ChartRadialBars]] 와 같은 계산 `_stripes`) · 색은 구간 누적(`segments`) 또는 임계 2색(`value` + `threshold`) 중 하나, 한 차트에 섞지 않는다 · 임계 슬라이더는 차트 계약에 넣지 않고 화면이 조합(`threshold` prop) |
| 허니컴 | 대응 | [[HexGrid]] · `hexGridLegend` | 0개 상태는 범례에 넣지 않는다(칠해진 색을 센다). 개수에 따른 배치는 [[HexGrid]] 가 정한다 — 칸 비율에 맞춰 `columns` ±2 안에서 칸이 가장 크게 나오는 열 수를 고른다(2026-10-21 코드 확인) |
| 블록 (서버 인벤토리 맵) · 상태 요약 행 | 대응(블록) · 공백(요약 행) | [[BlockGrid]] · [[BlockCell]] | **정해짐(2026-10-23, 추천안)** — 허니컴과 **용도로 나눈다**: 분포는 [[HexGrid]], 이름으로 찾기는 [[BlockGrid]]. 상태 어휘 · 색 · 범례(개수 · 0 도 남김)는 공유. 3D 블록은 평면 칸으로(장식이 이름 자리를 먹었다). 상태 요약 행(아이콘 + 큰 숫자 KPI)은 2.1 숫자와 함께 정한다 |
| 상태 타임라인 (이벤트) | 대응 | [[StatusTimeline]] | **정해짐(2026-10-23, 추천안)** — 높이 = 건수(값축 단위 `건` 이 읽게 한다) · 색 = 심각도 셋(critical · warning · info, 상태 토큰 · 범례 이름과 함께, §23) · 반전 시간 바는 쓰지 않고 공통 [[ChartTimeAxis]](§26) |
| Hitmap | 대응 | [[ScatterHeatmap]] | 4단계 색 중 한 단계는 위 표의 `hitmap-warning-1` 공백. 레거시에는 4단계 경계값 범례가 없다 — DS 는 `SPEED_LEGEND` 를 범례로 둔다(§15). 소형에서 버릴 것(눈금 · 집계 수치 · 컨트롤)은 §26 결정 필요. 레거시 «Hitmap»(응답 판정)과 «히트맵»(강도)이 이름만 비슷하고 색의 뜻이 다르다 — DS 는 [[ScatterHeatmap]] · [[Heatmap]] 으로 이름을 갈랐다 |
| 일반 히트맵 · 시간 셀 Cube | 대응 | [[Heatmap]] · [[HeatmapLegend]] | 라이브 Cube 는 6열(10분 칸), 이 DS `day` 는 12열(5분 칸)이다. **미래 칸과 데이터 없음 칸이 같은 회색이다 — DS 도 구별하지 못한다**(칸 값이 0~1 또는 `null`=«데이터 없음» 뿐, 2026-10-21 코드 확인). §26 결정 필요 |
| 추세 타일 | 대응 | [[TrendTile]] | 캡처 없음 — 문서 1-3 의 요소(지표명 · 현재값 · 추세 방향 · 소형 추이)로 만들었다. **변화 색은 지표의 좋은 방향(`better`)이 정한다(2026-10-23, 추천안)** — [[StatCard]] `trend` 처럼 오름을 늘 같은 색으로 칠하지 않는다. 비교 기준은 글자로 |
| 트리맵 · 지도 | 대응 | [[Treemap]] · [[GeoMap]] | 트리맵은 배치된 화면을 찾지 못했다(캡처 없음) — 문서 요소로 만들었다(2026-10-23, 추천안): squarified · 묶음 1단계 · 묶음 색 = 계열 슬롯(8 넘으면 «기타», §22) · 56 × 28 미만 칸은 라벨 없이 툴팁. 지도는 값 레이어 없이 모든 국가가 같은 회색이라 «데이터 없음» 과 «값이 고르다» 가 구별되지 않았다 — [[GeoMap]](2026-10-23): 값 없는 국가 = 바탕 회색 · 값 = 순차 4단계 · 전체가 비면 «데이터 없음» · 개수는 버블. 줌 컨트롤은 [[TopologyZoomControl]] 을 `limits` 로 함께 쓴다(§26). 시·도(한국 · 일본)는 줌이 아니라 국가를 눌러 들어간다(2026-10-26) — 줌 배율로 단위를 바꾸면 나눌 나라 · 범례 단계가 정해지지 않는다 |
| 토폴로지 | 대응 | [[TopologyCanvas]] · [[TopologyNode]] · [[TopologyEdge]] · [[TopologyZoomControl]] | DS 는 **좌→우 계층 배치 · 카드 노드** 전용이다(힘 기반 배치는 다른 엔진이라 범위 밖, `layoutTopology` 명시). 같은 변의 엣지는 슬롯으로 나누고 라벨은 가장 긴 구간 가운데에 둔다 — 나란한 엣지 라벨 겹침은 회귀 테스트가 막는다(2026-10-21 코드 확인). NPM 형(원형 노드 · 크기 = 트래픽 · 힘 배치 · 고립 노드 18개가 세로 일렬로 캔버스 절반을 씀)은 **공백**. 엣지는 `tone`(기본 · 경보) 둘뿐이라 임계 기준 실선 / 점선도 **공백** |
| Flame · Waterfall | 대응 | [[FlameChart]] · [[WaterfallChart]] | Waterfall 리소스 타입 11종은 색을 늘리지 않는다(§22 · §18) — 레거시에서도 fetch · xhr, media · image 가 구별되지 않는다. Flame 은 162초를 한 폭에 넣어 앞 2초의 바가 폭의 3% 로 눌리고 바 라벨이 거의 전부 말줄임이다 — 확대 없이는 색 띠로만 읽힌다. 에러 세로선이 촘촘해 배경 무늬처럼 보인다. — 만들면서 정했다(2026-10-23, 추천안): 시간축 줄을 끌어 확대([[ChartBrush]]) · 폭 40px 미만 막대는 이름 없이([[ChartSpanBar]]) · Flame 색 = 상태 · Waterfall 색 = 단계(타입은 글자) · 에러 시각은 [[StatusTimeline]] 을 위에 |
| 표 안 비율 막대 | 대응 | [[MetricBarCell]] | **정해짐(2026-10-23, 추천안)** — 0 보다 큰 구간은 최소 2px. 0.01% 대 값이 1px 아래로 사라져 0 으로 읽히던 결함 |
| 표 안 스파크라인 · 행 색 인덱스 · 범위 바 | 대응 | [[SparklineCell]] · [[Sparkline]] | **정해짐(2026-10-23, 추천안)** — 스파크라인 높이 20(최소 16) + 바닥선, 행 색 인덱스는 짝 차트 계열 토큰일 때만(`indexColor`), 값이 없는 행도 `-` + 빈 자리로 열 정렬 유지. 원 기록: | 행 색 인덱스는 같은 칸 차트의 계열 색과 이어질 때만 뜻이 있다. 스파크라인(GPU 프로세스)은 셀 위 1~2px 선이라 추이가 안 보이고 0% 가 직선과 구별되지 않는다 — 셀 안 최소 높이가 함께 필요하다. 범위 바(서버 인벤토리 Metrics)는 단위가 % 가 아닌 행(Mbps)에서 바가 빠져 열 정렬이 깨진다 — 바를 못 그리는 행도 자리를 비워 둔다 |
| 범례: 오른쪽 세로 목록 · 플롯 위 오버레이 · 분리 패널 | 이관 대상 | §15 범례 | 본문 오른쪽 위 한 줄로 옮긴다 |
| 헤더: 소스 칩 · 필터 아이콘 · 비교 드롭다운 · 툴바 1~5종 | 이관 대상 | §15 · [[WidgetFrame]] | 헤더는 제목 · 메뉴만. 대상 · 필터는 옵션바, 나머지 행동은 ⋮ 안으로 |
| 빈 상태: 축만 남은 플롯 | 이관 대상 | [[WidgetFrame]] `no-data` · `collect-gap` | «에이전트 없음» · 로딩은 **공백** |

**Composite 계획표** (2026-10-22 사용자 확정) — 26유형은 모두 `Composite/Chart/*` 에 차트로 있어야 한다. 차트는 Primitives 요소(§26)를 조합하고, 새 유형에 필요한 요소는 먼저 Primitives 로 만든다. 완성 차트가 Primitives 에 있으면 요소로 분해해 Composite 로 옮긴다.

| # | 유형 | Composite 차트 | 상태 |
|---|---|---|---|
| 1 | 선 | [[MiniLineChart]] · [[MiniMultiLineChart]] | 있음 |
| 2 | 면 / 누적면 | 면 = `showArea` · 누적면 = [[StackedAreaChart]]([[ChartGrid]] · [[ChartValueAxis]] · [[ChartTimeAxis]] · [[ChartPeakMarker]] 조합) | 있음 (누적면 2026-10-23) |
| 3 | 세로 막대 | [[MiniBarChart]] | 있음 |
| 4 | 가로 막대 | [[BarList]] = [[BarListItem]] 줄 조합 | 있음 (2026-10-22 Composite 로) |
| 5 | 누적 막대 / 단일 누적 바 | [[MiniBarChart]] 누적 · 단계별 누적 막대 = [[GpuStatusBar]]([[ChartStackedColumn]] 조합) · 단일 누적 바(페이지 로드 타임라인 · 심각도 분포) = [[SegmentBar]] | 있음 (단일 누적 바 2026-10-23) |
| 6 | 산점도 / 버블 | [[ScatterChart]] = [[ChartGrid]] · [[ChartValueAxis]] · [[ChartTimeAxis]] 조합 · 버블은 `size` | 있음 (2026-10-23) |
| 7 | 박스플롯 | [[BoxPlotChart]] = [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 조합 · 백분위(p5 · p25 · p50 · p75 · p95 · p99) · `boxPlotStats` | 있음 (2026-10-23) |
| 8 | 파이 / 도넛 | [[MiniDonutChart]] | 있음 |
| 9 | 복합 / 이중 축 | 이중 축은 금지(§19) — [[PairedTimeChart]](시간축 공유 두 칸 · [[ChartCrosshair]] `index` 공유) | 있음 (대체 표현 2026-10-23) |
| 10 | 구역 분할 산점도 | [[ZoneScatterChart]] = [[ChartValueAxis]](`ticks` = 경계) · [[ChartTimeAxis]](`positions` = 경계) 조합 | 있음 (2026-10-23) |
| 11 | 숫자 / 집계값 | 숫자 줄 [[MetricGrid]](Composite = [[MetricStat]] 칸) · 값 + 변화 + 추이 [[TrendTile]] · 칸 하나 [[KpiCard]] · [[StatCard]] | 있음 (Composite 2026-10-23) |
| 12 | 막대 게이지 | [[RangeGauge]] = [[UsageGauge]](채움) + [[ChartPeakMarker]](▼) 조합 · min · 현재 · Max · 임계 띠 | 있음 (2026-10-23) |
| 13 | 호 게이지 / 속도계 | 속도계 [[ActiveTransactionArc]] · [[ActiveTransactionSpeedWidget]] · 호 게이지 [[ArcGauge]] = [[ChartArc]] 조합([[RangeGauge]] 와 같은 계약) | 있음 (호 게이지 2026-10-23) |
| 14 | 이퀄라이저 | [[EqualizerChart]] = [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 조합 · 호 형태는 [[ChartRadialBars]](같은 칸 규칙) | 있음 (2026-10-23) |
| 15 | 블록 / 허니컴 / 그리드 | [[HexGrid]](분포) · [[BlockGrid]] = [[BlockCell]] 격자(이름으로 찾기) — 상태 어휘 · 색 · 범례 공유(내부 `_statusTone`) | 있음 (블록 2026-10-23) |
| 16 | 상태 타임라인 | [[StatusTimeline]] = [[ChartGrid]](`vertical`) · [[ChartValueAxis]](건수) · [[ChartTimeAxis]] 조합 | 있음 (2026-10-23) |
| 17 | Hitmap | [[ScatterHeatmap]] = [[ChartGrid]](`vertical`) · [[ChartValueAxis]] · [[ChartTimeAxis]] 조합 | 있음 (2026-10-22 Composite 로) |
| 18 · 19 | 일반 히트맵 · 시간 셀 Cube | [[Heatmap]] | 있음 |
| 20 | 추세 타일 | [[TrendTile]] = [[MetricStat]] + [[Sparkline]] 조합 · 변화 줄 | 있음 (2026-10-23) |
| 21 | 컴파운드아이 | [[CompoundEye]] = [[CompoundEyeCell]](부채꼴 + [[ChartArc]] 반 링 둘) · [[ChartLegendItem]] · [[ChartTooltip]] 조합 | 있음 (보존 2026-10-23) |
| 22 | 트리맵 | [[Treemap]] = squarified 배치(내부 `_treemapLayout`) · [[ChartLegendItem]] · [[ChartTooltip]] 조합 | 있음 (2026-10-23) |
| 23 | 지도 | [[GeoMap]] = Natural Earth 110m 국가 도형(내부 `_geoWorld`) · [[ChartLegendItem]] · [[ChartTooltip]] · [[TopologyZoomControl]] 조합 · 단계 구분 / 버블 | 있음 (2026-10-23) |
| 24 | 토폴로지 | [[TopologyCanvas]] | 있음 |
| 25 | Flame / Waterfall | [[FlameChart]] · [[WaterfallChart]] = [[ChartSpanBar]](구간 막대) · [[ChartBrush]](축 끌어 확대) · [[ChartTimeAxis]] · [[ChartLegendItem]] · [[ChartTooltip]] 조합 | 있음 (2026-10-23) |
| 26 | 표 안 미니 차트 | [[SparklineCell]] = [[Sparkline]](요소) 조합 · 비율 막대는 [[MetricBarCell]] · 범위 막대는 [[RangeGauge]] | 있음 (2026-10-23) |

순서: **A단계** 완성 차트를 Composite 로(BarList → GpuStatusBar → UsageChart → ScatterHeatmap). **B단계** 신규를 제품 빈도순으로 — 산점도 → 상태 타임라인 → 범위 게이지 → 스파크라인 → 누적면 → 이퀄라이저 → 블록 → 추세 타일 → 호 게이지 → 박스플롯 → 구역 분할 산점도 → 트리맵 → 지도 → Flame · Waterfall → 컴파운드아이. 새 이름은 범용 이름이고, 만들 때 세 정본(코드 · Storybook · Figma)에 함께 넣는다.

**Why.** 레거시를 그대로 옮기면 정본이 둘이 된다. 값을 옮기면 검증을 건너뛴다. D-032 라이트 계열 6색은 흰 배경 대비가 1.61~2.29:1 로 비텍스트 기준 3:1 에 못 미치고, 다크의 method · socket 은 상태색(info · critical)을 그대로 빌려 쓴다 — §17 이 막는 것이다. 그렇다고 의미를 버리면 제품에서 «SQL 은 청록» 을 익힌 사람이 이 DS 차트에서 다시 익혀야 한다. 그래서 의미만 받는다.
엔티티 슬롯은 레거시와 색조가 가까운 쪽으로 골랐지만 색조만으로 정하지 않았다. 색조만 맞춘 첫 후보(socket → 8 빨강)는 dbc(2 주황)와 이웃해 정상시야 ΔE 7.0(라이트) · 7.5(다크)로 검증기에서 FAIL 했다. socket 을 5(자홍)로 옮긴 배치가 통과했다. 2026-10-14 팔레트 재조정 뒤에도 이 순서로 다시 재서 통과한다 — 라이트 최악 CVD ΔE 9.5 · 정상시야 21.1, 다크 10.9 · 17.4, 대비 전부 3:1 이상.
공백을 근사하지 않는 것은 «가장 비슷한 토큰» 으로 채우는 순간 그 토큰의 의미가 둘이 되기 때문이다.

**How.**
- 엔티티 계열 차트는 **method → sql → httpc → dbc → socket → resultset** 순서로 쌓는다. 검증한 이웃 관계가 이 순서다.
- 엔티티 고정 배정과 순서 배정(§17)을 한 차트에 섞지 않는다. 엔티티 차트에 «기타» 가 필요하면 `--color-chart-neutral`.
- 엔티티 이름의 별칭 토큰(`--color-chart-entity-sql` → `var(--color-chart-series-3)`)은 세 정본(코드 · Storybook · Figma)에 함께 넣는 후속 작업이다. 그 전까지는 대응표의 슬롯 번호를 쓴다.
- 공백을 채우려면 [`tokens.md`](./tokens.md) → Chart 에 역할을 먼저 추가하고 §20 검증을 거친다.
- 팔레트를 바꾸면 엔티티 순서도 함께 잰다 — `pnpm lint:chart-palette` 가 이 순서를 검사한다.

✅ 레거시 항목은 대응 · 흡수 · 공백 · 이관 대상 중 하나로 처분하고 대응표에 남긴다
✅ 엔티티 계열은 고정 슬롯 · 고정 순서로
✅ 레거시 이름은 «제품 이름 → DS 이름» 으로 함께 적는다
✅ 레거시 화면을 옮길 때 유형 대응표에서 처분을 먼저 찾는다. «대응» 이어도 «남는 공백» 칸은 따로 결정한다

❌ 레거시 hex 를 이 DS 토큰 값으로 복사 — 검증을 건너뛰고 대비 미달 값이 들어온다
❌ `--wds-chart-*` 를 이 DS 에서 참조 — 접두어가 같아도 다른 정본의 토큰이다
❌ 공백을 가장 비슷한 토큰으로 채우기 — 그 토큰의 의미가 둘이 된다
❌ 엔티티 계열을 다른 순서로 쌓기 — 검증하지 않은 이웃이 생긴다 (색조만 맞춘 배치는 dbc 옆 socket 에서 FAIL 이었다)
❌ 공백 유형을 가장 비슷한 차트로 근사하기 (일반 산점도를 ScatterHeatmap 으로, 범위 바를 UsageGauge 로). 판정 색과 «한계 대비» 의 뜻이 따라 들어온다

---

## 22. 계열이 많을 때 — 색을 늘리지 않고 구조로 나눈다
<!-- @policy id=chart-many-series | @severity must | @applies chart -->

**When to use.** 한 차트에 계열이 9개 이상 올라갈 수 있는 자리 — 에이전트 · 서버 · 컨테이너 · URL 별 지표, Top-N 선, 전체 개체의 추이. 개체 수가 데이터에 따라 늘어나는 모든 차트. 한 지표에 개체가 100개 · 1000개까지 붙는 극단도 여기서 정한다(아래 «극단»).

**When NOT to use.**
- 계열이 8개 이하로 정해진 차트 → §17 순서 배정.
- 엔티티가 고정된 계열(method · sql …) → §21.

**규칙.** 색으로 구별하는 계열은 **이웃 차트 최대 8개, 맞닿는 차트 최대 3개**(§18)다. 그보다 많으면 색을 더하지 않고 아래 셋 중 하나로 나눈다.

| 상황 | 방법 | 색 |
|---|---|---|
| 많은 개체 중 **몇 개가 중요**하다 (Top-N · 이상 개체) | **강조 + 회색 다발.** 강조할 개체만 series 색, 나머지는 한 덩어리 배경으로 | 강조 ≤ 8(권장 ≤ 5) · 나머지 `--color-chart-neutral` |
| **모든 개체를 비교**해야 한다 (100대의 추이) | **행렬로 바꾼다.** 행 = 개체, 열 = 시간, 색 = 값 | 크기 · 강도 스케일 (seq · heatmap) — [[Heatmap]] |
| 지금 **상태만** 보면 된다 | **칸으로 깐다.** 개체 하나 = 칸 하나 | 상태색 — [[HexGrid]] |
| 개체가 9~20 개이고 각자의 모양이 중요하다 | **small multiples.** 개체마다 작은 차트, 축 범위는 같게 | 칸마다 같은 한 색 |
| 개체가 100 개를 넘는다 (극단) | **묶어서 단순화한다.** 비슷한 개체를 묶음 하나로 그리고 벗어난 개체만 따로 — 아래 «극단» | 묶음 · 이탈 개체만 series 색(≤ 8) |

#### 극단 — 개체 수에 따라 범례와 그리기가 바뀐다

| 개체 수 | 차트에 그리는 것 | 범례 |
|---|---|---|
| 1 ~ 8 | 개체마다 series 색(§17) | 차트 위 한 줄 |
| 9 ~ 20 | small multiples 또는 강조 + 회색 다발 | 칸마다 이름 |
| 21 ~ 100 | 강조 ≤ 8 + 회색 다발 | **선택 목록** — 스크롤 · 검색 · 켜고 끄기. 색은 선택된 ≤ 8 만 |
| 100 초과 | **개별 선을 기본으로 그리지 않는다.** 묶음(아래 순서) + 이탈 개체 강조 ≤ 8 | **선택 패널** — 검색 · 정렬(현재값 · 최댓값) · 보이는 줄만 그리는 목록 · «1,000개 중 5개 표시» |

#### 극단 — 묶는 방법은 이 순서로 고른다

| 순서 | 방법 | 묶는 기준 | 그리는 모습 | 쓰는 자리 |
|---|---|---|---|---|
| ① | **속성으로 묶기** | 이미 있는 속성 — 서버 그룹 · 서비스 · 리전 · 클러스터 | 묶음마다 선 하나(합 · 평균 · p95 중 지표에 맞는 것), 누르면 펼친다 | 먼저 쓴다. 묶은 이유를 설명할 수 있다 |
| ② | **분포 띠 + 이탈 개체** | 전체를 통계로 | 최소~최대(또는 p5~p95) 띠 + 평균 · p95 선, 띠를 벗어난 개체만 series 색 | 묶을 속성이 없을 때 · «전체가 정상 범위인가» |
| ③ | **모양으로 묶기(군집)** | 시계열이 비슷하게 움직이는 것끼리 | 군집마다 대표선(중앙값) + 띠, 이름 «패턴 A · 412개» | ①이 없고 패턴이 몇 갈래로 갈릴 때. 군집에는 사람이 읽는 이름을 붙인다 |
| ④ | **상위 N + 기타** | 값 순위 | 상위 5~7 + «기타 993개» 한 덩어리 | **크기 비교 차트만** — 도넛 · 트리맵 · 막대 · 목록([[Treemap]] 은 «7 + 기타») |
| ⑤ | **상태로 세기** | 임계 판정 | «Critical 3 · Warning 15 · 정상 982» | 지금 상태만 볼 때 — [[HexGrid]] 범례 |

묶음은 개수를 함께 적고(«기타 993개» · «패턴 A · 412개») 눌러서 펼칠 수 있어야 한다. 범례에는 개체가 아니라 **묶음**이 선다. 평균 · 대표선은 튀는 개체 하나를 지우므로, 묶음 밖으로 벗어난 개체는 **항상** 따로 강조한다 — 모니터링에서는 그 하나가 가장 중요할 수 있다.
전체를 하나씩 비교해야 하면 묶지 않고 행렬([[Heatmap]] — 행 = 개체, 열 = 시간)로 바꾼다. 라이브에서 상위 N · 이탈 구성원은 몇 번 연속 밀려났을 때만 교체한다(매 수집마다 바꾸면 화면이 깜빡인다). 색은 순위가 아니라 개체를 따른다.
지금 DS 차트는 분포 띠 · 묶음 펼치기 · 선택 패널 범례를 아직 갖지 않는다 — 각 차트의 «극단 · 100개» 스토리가 현재 모습이다.

강조 색도 §17 을 지킨다. **색은 순위가 아니라 개체를 따라간다.** Top-N 의 구성원이 바뀌어도 이미 강조된 개체의 색은 바꾸지 않는다. 새로 들어온 개체는 비어 있는 다음 슬롯을 받는다. 회색 다발 안의 개체는 호버 · 포커스로 이름과 값을 보여 준다(색이 아니라 상호작용으로 식별).

**Why.** 사람이 색만으로 구별할 수 있는 계열 수에는 상한이 있다. 이 DS 의 8색도 이웃한 쌍만 검증을 통과한다(라이트 최악 CVD ΔE 9.5 · 정상시야 18.8). 아무 두 계열이나 맞닿으면 3색이 상한이고 4번째부터는 정상시야에서도 ΔE 11.0 으로 무너진다(§18). 100개를 서로 다른 색으로 칠하면 색이 «다르다» 는 것만 말하고 «어느 것» 인지는 말하지 못한다. 범례에서 같은 색을 찾을 수 없으니 색이 식별 수단의 역할을 잃는다.
팔레트를 늘리는 쪽은 이미 실패했다. 구 `--color-palette-{hex}` 36색은 선택 규칙이 없어 실제로 4색만 쓰였다. 해시로 색을 만들거나 순환시키면 같은 색이 서로 다른 개체를 가리킨다.

**How.**

```tsx
// 100개 중 이상 개체 3개만 강조 — 나머지는 회색 다발
<MiniMultiLineChart
  series={agents.map((a) => ({
    label: highlighted.has(a.id) ? a.name : "",          // 빈 라벨은 범례에서 숨는다
    values: a.values,
    color: highlighted.has(a.id) ? slotOf(a.id) : "var(--color-chart-neutral)",
  }))}
/>
```

`slotOf` 는 개체 id → 슬롯을 **처음 강조된 순서로 한 번 정하고 유지**한다. 순위로 매번 다시 계산하지 않는다.

✅ 9개 이상이면 강조 + 회색 다발 · 행렬(Heatmap) · 칸(HexGrid) · small multiples 중 하나
✅ 강조는 8개 이하, 가능하면 5개 이하
✅ 강조 개체의 색은 구성원이 바뀌어도 유지
✅ 회색 다발 안의 개체는 호버 · 포커스로 식별
✅ 100개를 넘으면 개별 선 대신 묶는다 — ① 속성 묶기 → ② 분포 띠 + 이탈 개체 → ③ 모양 군집(이름 필수) 순으로 고르고, ④ 상위 N + 기타는 크기 비교 차트에만
✅ 묶음에는 개수를 적고(«기타 993개») 눌러서 펼칠 수 있게 한다 · 범례에는 개체가 아니라 묶음이 선다
✅ 묶음 밖으로 벗어난 개체는 항상 따로 강조한다(≤ 8)
✅ 21~100 개는 범례를 선택 목록(검색 · 켜고 끄기)으로, 100 초과는 선택 패널(검색 · 정렬 · «N개 중 k개 표시»)로

❌ 100개 지표에 서로 다른 색 100개 — 범례에서 같은 색을 찾을 수 없고, 색각 이상에서는 대부분이 같은 색이다
❌ 팔레트 확장 · 해시로 색 생성 · 색 순환 — 같은 색이 다른 개체를 가리킨다
❌ Top-N 순위로 색 배정 — 순위가 바뀔 때마다 같은 개체가 다른 색이 된다
❌ 회색 다발 계열을 범례에 하나씩 나열 — 범례가 식별을 못 하는 목록이 된다
❌ 1000개를 선 1000개로 그리기 — 한 덩어리 면이 되고 렌더도 버티지 못한다
❌ 묶음 평균만 그리고 이탈 개체를 숨기기 — 가장 중요한 개체 하나가 지워진다
❌ 이름 없는 군집(«클러스터 3») — 왜 묶였는지 모르면 묶음을 믿지 못한다
❌ 시계열 선 차트에 «상위 N + 기타» — 기타 선은 의미 없는 합이 된다. 크기 비교 차트에만

---

## 23. 계열 색은 Severity 색과 구별돼야 한다
<!-- @policy id=chart-series-vs-severity | @severity must | @applies chart -->

**When to use.** 계열 색(`--color-chart-series-*`)을 정하거나 바꿀 때. 계열 차트가 상태 위젯 · 알림 · 임계 표시와 한 화면에 놓일 때. 레거시 엔티티 색을 슬롯에 배정할 때(§21).

**When NOT to use.** 상태를 말하는 위젯 안의 색 — 그 위젯은 처음부터 상태색만 쓴다(§15 · §17).

**규칙.** 두 겹으로 지킨다.
1. **측정** — 모든 계열 슬롯은 모든 Severity 색(`--color-status-success` · `-warning` · `-error` · `--color-indicator-critical` · `-warning`)과 `--color-status-info` 에 대해 **정상시야 ΔE 15 이상**(OKLab ×100, 라이트 · 다크 각각)이어야 한다. info 는 Severity 가 아니지만 같은 문턱을 건다 — 첫 계열과 «정보» 배지가 같은 말을 하지 않게.
2. **구조** — 색각 이상까지는 색으로 보장할 수 없다(Severity 자체가 빨강 · 초록이다). 그래서 계열 색과 Severity 색을 **한 위젯에 섞지 않고**, Severity 는 언제나 **아이콘 + 라벨**과 함께 쓴다. 색만으로 상태를 말하지 않는다.

**2026-10-14 재조정 후 측정 스냅샷 — 8 / 8 통과** (현재값의 정본은 `docs/tokens.json` 의 `distinctFrom` 과 `pnpm lint:chart-palette` 출력)

| 슬롯 | 라이트 · 다크 값 | 가장 가까운 Severity · info — 정상시야 ΔE (라이트 / 다크) |
|---|---|---|
| 1 navy | `#1E4E9E` · `#406CAA` | info 15.0 / 15.0 |
| 2 amber | `#985521` · `#9F6620` | indicator-critical 15.2 / 15.1 |
| 3 teal | `#06A3A5` · `#12A7A8` | success 15.4 / 15.1 |
| 4 gold | `#9A7D0B` · `#A9912B` | success 17.8 / warning 15.0 |
| 5 magenta | `#B3329D` · `#D249B8` | indicator-critical 18.7 / error 17.5 |
| 6 green | `#037C58` · `#04896A` | success 18.1 / 15.2 |
| 7 violet | `#7130CB` · `#B264FB` | info 15.0 / 15.1 |
| 8 raspberry | `#9F2D48` · `#AA618D` | indicator-critical 15.1 / 15.0 |

여유가 얇다(대부분 15.0~15.4). 원래 색에서 최소한만 움직이도록 계산해 고른 결과다. Severity · info 값이 조금만 바뀌어도 넘어갈 수 있으므로 `pnpm lint:chart-palette` 가 매 PR 마다 다시 잰다.

재조정 전에는 8슬롯 중 6개가 미달이었다(series-8 ↔ error ΔE 4.7 · series-1 = status-info 같은 값). 2번은 주황 → amber, 8번은 빨강 → raspberry 로 옮겼다 — 주황 · 빨강 · 초록의 밝은 영역은 Severity 몫이다. 다크에서 대비 3:1 을 지키는 빨강은 error · critical 과 ΔE 15 이상 떨어질 수 없다는 것이 탐색으로 확인됐다.

**Why.** 운영 화면에서 빨강은 계열 이름이 아니라 «장애» 로 먼저 읽힌다. 재조정 전처럼 계열 8이 error 와 ΔE 4.7 이면, 평소 계열 하나가 위험 신호로 읽히고 정작 위험 신호는 계열 하나로 묻힌다. 둘 다 사람이 틀리게 반응하는 오독이다. series-1 과 info 가 같은 값이면 «정보» 배지와 첫 계열이 같은 것을 말하는 것처럼 보인다.
측정만으로는 부족하다. 정상시야에서 떼어 놓아도 색각 이상에서는 붙는다. 그래서 Severity 는 아이콘 · 라벨로 색 없이도 읽히게 하고, 같은 위젯에서 두 의미를 섞지 않는다.

**How.**
- **기계 판독:** 계열 토큰 선언 위 주석의 `@distinct severity` 가 이 정책을 선언한다. `pnpm build:design` 이 실제 라이트 · 다크 값으로 ΔE 를 재서 `docs/tokens.json` 의 `distinctFrom`(가장 가까운 Severity · 판정 · 전체 쌍의 정상시야 / protan / deutan)으로 싣는다 — MCP `get_tokens` 가 읽는 그 파일이다. 숫자는 손으로 적지 않는다.
- 계열 값을 바꾸면 재생성된 `distinctFrom` 과 §20 검증기 결과로 위 표를 갱신한다.
- 계열 값을 바꾸는 작업은 팔레트 전체 재검증(인접 · all-pairs · 엔티티 순서 · Severity 쌍)과 세 정본(코드 · Storybook · Figma) 갱신이 함께 간다.

✅ 계열 슬롯 ↔ Severity · info 색을 라이트 · 다크 모두 정상시야 ΔE 15 이상으로
✅ Severity 는 아이콘 + 라벨과 함께 — 색만으로 상태를 말하지 않는다
✅ Severity · info 값을 바꾸는 PR 도 `pnpm lint:chart-palette` 를 통과해야 한다 — 계열 쪽 여유가 얇다

❌ 계열 색과 `status-info` 를 같은 값으로 — 정보 배지와 첫 계열이 같은 말을 한다
❌ 빨강 계열(8)로 평범한 지표를 칠하고 같은 화면에 error 경보 — 어느 쪽이 장애인지 색으로 갈리지 않는다
❌ «정상시야에서 구별되니 됐다» 로 끝내기 — 색각 이상에서는 같은 색이다. 구조 규칙까지 지킨다

---

## 24. AI 대기 표현 — 10초 넘는 연산은 진행 카드 하나
<!-- @policy id=ai-wait-progress | @severity must | @applies widget -->

**When to use.** WhaTap AI 응답이 단계 둘 이상을 거치고 10초를 넘길 수 있을 때(원인 진단 · 통합 분석 · 보고서 작성). 서버가 단계 전환 · 처리 수 · 중간 발견을 이벤트로 보내 줄 때.

**When NOT to use.** 2초 안에 끝나는 응답 — [[LoadingMessage]] 한 줄로 충분하다. 단계 이벤트가 없는 응답 — 시간에 맞춘 연출밖에 할 수 없으므로 [[LoadingMessage]] + [[AnswerSkeleton]] 으로 둔다. 진행 카드는 실제 진행을 말한다는 약속이다.

**규칙.** 기다리는 동안 보일 것은 [[AiProgress]] 하나에 모은다. 기존 대기 표현 넷(`LoadingMessage` · `Reasoning` · `StepsTimeline` · 회전 `AiSymbol`)을 긴 대기에 겹쳐 쓰지 않는다. 경과 시간대별로 카드가 바뀐다.

| 시간 | 카드가 보이는 것 |
|---|---|
| 0~2초 | «질문을 확인하고 있어요» + 단계 이름 한 줄(«데이터 수집 → 데이터 분석 → 분석 정보 작성»). 막대 · 단계 목록은 첫 단계가 시작될 때 선다 |
| 단계 진행 | 서버 이벤트로 단계가 넘어간다. 진행 단계에 실제 처리 수(에이전트 8 / 12). 머리 그림([[AiStageMotion]])은 단계 성격대로 |
| 10초~ | 하단 줄: 예상 시간(«보통 20초 안팎») · 「완료되면 알림」 · 「중단」. 중간 발견은 답보다 먼저 단계 아래에 |
| 30초~ | 하단 줄이 경고 면으로. 평소보다 오래 걸린다는 것과 그 이유 |
| 완료 | «3단계 완료 · 23초» 윗줄로 접히고(펼치기 · 접기는 늘 그 윗줄 오른쪽 끝, 아래에 따로 두지 않는다), 답은 `.wds-ai-reveal` 로 제목 → 본문 → 근거 순서로 한 번 |
| 중단 | 끝난 단계와 중간 발견은 남기고, 진행 중이던 단계만 «여기서 멈췄어요» |

**간편 버전 `AiProgressCompact`.** 대상 하나짜리 짧은 대기 · 이어 묻는 질문 · 좁은 자리에서는 카드 대신 실행 내용 한 줄을 쓴다. 진행 중에는 문장에 글로우(`.wds-ai-shimmer`)가 흐르는 것이 유일한 움직임이고, 문장을 누르면 같은 상세 연산 정보(단계 막대 · 처리 수 · 중간 발견)를 조회한다. 기다림 자체를 보여야 하는 대표 연산은 카드. 한 대기에 둘을 함께 두지 않는다.

- **제목은 상황에 맞게.** «{지금 처리하는 대상}을/를 {동작}하고 있어요». 대상은 이번 질문이 다루는 데이터 이름(트랜잭션 · 로그 · 성능 지표 · 쿼리), 동작은 단계 종류(수집하고 · 분석하고 · 정리하고). 단계 이름(`label`)은 고정이고 바뀌는 것은 제목과 처리 단위(`count.unit`)뿐이며 둘은 같은 대상을 가리킨다.
- **분모가 있을 때만 양을 보인다.** 막대는 % 가 아니라 단계 수로 나눈 칸이다. 진행 칸만 실제 처리 수의 비율로 채운다.
- **움직이는 곳은 하나.** 진행 카드 머리 그림만 움직인다. 단계 목록 · 막대 · 답변 자리 표시는 멈춰 있다. [[AnswerSkeleton]] 은 `still` 로 반짝임을 끄고, 마지막 단계(작성)에서만 깐다.
- **입력창은 막지 않는다.** 진행 중에는 [[WhaTapAiWidget]] `onStop` 으로 송신 버튼 자리가 중단 버튼(■)이 된다.
- **10초 기준.** 사람이 한 작업에 주의를 붙잡아 둘 수 있는 한계로 알려진 값이다(Nielsen 응답 시간 기준). 그 전에는 진행만, 넘어가면 예상 시간과 다른 일을 할 수 있는 선택권.
- 동작 줄이기 설정에서는 움직임 없이 글자와 숫자로 진행을 알린다(컴포넌트가 `prefers-reduced-motion` 을 따른다).

**Why.** 대기 표현이 넷으로 나뉘어 서로 겹쳤다. `Reasoning` 과 `StepsTimeline` 은 같은 일을 다른 모양으로 했고, 어느 것도 «얼마나 남았나» 와 «기다리는 동안 무엇을 할 수 있나» 를 말하지 않았다. 95% 에서 감속하는 가짜 막대는 10초를 넘기면 멈춘 화면이 된다. 처리 수는 계속 오르므로 멈추지 않았다는 증거가 되고, 중간 발견은 기다리는 동안 읽을거리이자 답의 일부다(2026-10-16 「WhaTap AI 대기 표현 V2」 기획).

**How.**
- 서버 이벤트(단계 · 처리 수 · 발견)를 받아 `steps` 를 만들고 `phase` · `elapsed` 와 함께 넘긴다. 진행률을 시간으로 계산하지 않는다.
- 예상 시간 근거(질문 유형별 소요 시간 중앙값)가 없으면 `expected` 를 비운다. 경과 시간만 보인다.
- 「완료되면 알림」 은 위젯을 닫아도 작업이 이어지고 알림 경로가 있을 때만 `onNotifyChange` 를 넘긴다.
- 지연 사유는 사용자에게 말할 수 있는 것만(데이터 소스 응답 지연 · 조회 범위 과다). 내부 오류 문구를 그대로 옮기지 않는다.
- 서버가 보내지 못하는 값은 지어내지 않고 프롭을 비운다. 분모 없는 단계는 `count` 없이, 백그라운드 실행이 없으면 `onNotifyChange` 없이. 항목별 난이도는 [[AiProgress]] 개발 스펙의 「서버 구현 조건」 표.

✅ 10초 넘는 단계 연산은 `AiProgress` 하나 + 작성 단계에서만 `AnswerSkeleton still`
✅ 진행 칸은 서버가 보낸 처리 수 ÷ 전체로 채운다
✅ 진행 중 송신 버튼은 중단 버튼으로, 입력창은 열어 둔다
✅ 이어 묻는 질문 같은 짧은 대기는 `AiProgressCompact` 한 줄(누르면 상세 조회)
✅ 중간 발견은 관측 사실 한 줄(«15:02 응답시간 평소의 4.8배»)
✅ 제목 대상과 처리 단위가 같은 것을 가리킨다(«로그를 분석하고 있어요» · 로그 812 / 2,400)

❌ `Reasoning` + `StepsTimeline` + `LoadingMessage` 를 한 대기에 겹쳐 쓰기 — 같은 말을 세 번 하고 진행은 말하지 않는다
❌ 시간으로 계산한 % 막대 · 95% 에서 감속하는 막대 — 10초를 넘기면 멈춘 화면이 된다
❌ 반짝이는 스켈레톤과 움직이는 진행 그림을 함께 — 움직이는 곳이 둘이면 어디를 봐야 할지 흐려진다
❌ 기다리는 동안 일반 기능 팁 롤링 — 이번 질문과 상관없는 읽을거리다
❌ 2초 안에 끝나는 응답에 진행 카드 — 깜빡임만 남는다
❌ 한 대기에 `AiProgress` 카드와 `AiProgressCompact` 한 줄을 함께 — 같은 진행을 두 번 말한다
❌ 예시 제목(«트랜잭션을 분석하고 있어요»)을 모든 화면에 그대로 — 로그를 보는 질문에도 트랜잭션이라고 말한다

---

## 25. 지금 값: 계열 수로 자리를 고른다
<!-- @policy id=chart-current-value | @severity must | @applies chart -->

**When to use.** 추이 차트 칸에 «지금 얼마인가» 를 함께 적을 때. 선 · 면 차트에서 계열마다 마지막 값을 보이고 싶을 때. 레거시의 숫자 오버레이 · 선 끝 값 배지 · 카드 위아래 분리를 이 DS 로 옮길 때(§21 유형 대응표).

**When NOT to use.**
- 최고값 → peak ▼ (§5). 지금 값과 최고값은 다른 말이다.
- 막대 차트의 막대마다 값 → [[MiniBarChart]] `valueLabels` (§15).
- 이름표가 본문 안에 있는 칸([[BarList]] · 도넛 · 숫자 칸) → 그 컴포넌트가 값을 적는다.

**규칙.** 지금 값은 **계열 수**로 자리를 고르고, 한 칸에 한 방식만 쓴다.

| 계열 | 자리 | 어떻게 |
|---|---|---|
| 하나 | 본문 첫 줄 왼쪽 | [[WidgetFrame]] `summary` |
| 둘 ~ 넷 | 범례 이름 뒤 | [[WidgetFrame]] `legend[].value` · 굵게(primary) |
| 강조 계열 다섯까지 (§22 회색 다발 위) | 선 끝 오른쪽 배지 | [[MiniMultiLineChart]] `series[].endLabel` |
| 판정 띠가 깔린 계열 하나 (Apdex) | 플롯 가운데 큰 숫자 | [[ApdexChart]] `value` (이 컴포넌트에만) |

선 끝 배지는 네 가지를 지킨다.
- **플롯 밖에 선다.** 배지가 있으면 플롯 오른쪽에 배지 칸(`--wds-widget-end-gutter`)을 비운다. 배지가 선 · 눈금을 가리지 않는다.
- **글자는 text 토큰이다.** 카드 바탕 위 `text-primary` 굵게, 계열 색은 테두리와 선 끝 점만(§17).
- **이름 있는 계열에만, 다섯까지.** 회색 다발(이름 빈 계열)에는 달지 않는다. 다섯을 넘는 배지는 그리지 않는다.
- **겹치면 밀어 띄운다.** 점은 선 끝 제자리, 배지만 위아래로 움직인다.

**Why.** 라이브 제품은 같은 목적에 세 답(숫자 오버레이 · 선 끝 배지 · 카드 분리)을 화면마다 따로 썼다(2026-10-15 캡처). 오버레이는 선의 가운데 구간을 가려 그 자리의 스파이크를 숨긴다. Apdex 만 예외인 것은 배경 띠가 판정을 먼저 말해 주기 때문이다.
선 끝 배지는 계열이 많을 때 범례와 선을 오가지 않게 해 주지만, 라이브에서는 조건 없이 써서 세 군데가 무너졌다. Y축 눈금 위에 배지가 올라앉아 `100%` · `50%` 가 잘렸고, 최고점 `87%` 와 지금 `86%` 가 한 플롯에 떠 어느 쪽이 지금인지 다시 읽어야 했으며, 수십 계열에서는 배지가 색 띠로 뭉개졌다. 플롯 밖 칸 · 이름 있는 계열 · 다섯 상한이 그 셋을 막는다.
계열이 넷 이하면 범례 한 줄에 값이 들어가므로 플롯을 좁힐 이유가 없다. 넷을 넘으면 범례가 잘리므로(§15) 배지로 넘긴다.

✅ 계열 하나는 `summary`, 둘 ~ 넷은 범례 값, 강조 계열이 여럿이면 선 끝 배지
✅ 배지는 회색 다발 위 강조 계열에만 · 다섯까지
✅ 배지 · 범례 값 글자는 `text-primary` 굵게 · 숫자 서체

❌ 범례 값과 선 끝 배지를 한 칸에 함께. 같은 값을 두 번 말한다
❌ 일반 지표 플롯 가운데에 큰 숫자. 선을 가린다. 오버레이는 [[ApdexChart]] 에만
❌ 회색 다발 계열마다 배지. 배지가 색 띠로 뭉개져 아무 값도 읽히지 않는다
❌ 배지 글자에 계열 색 · 계열 색 바탕에 흰 글자. 글자는 text 토큰, 대비가 검증되지 않았다
❌ 최고점 ▼ 와 선 끝 배지를 한 플롯에. 최고값과 지금 값이 나란히 떠 어느 쪽이 지금인지 흐려진다

---

## 26. 차트 공통 에셋 — 위젯이 공유하는 요소는 주인이 하나다
<!-- @policy id=chart-shared-assets | @severity must | @applies chart -->

**When to use.** 차트 · 위젯을 새로 만들거나 고칠 때 축 · 격자 · 범례 · 값 라벨 · 빈 상태 · 헤더 행동을 그려야 하는 모든 자리. 레거시 위젯을 옮기면서 «이 요소는 DS 에서 누가 그리나» 를 찾을 때. Chart Art 공통 에셋 작업의 작업 목록.

**When NOT to use.**
- 차트 유형 하나에만 있는 요소(컴파운드아이 외곽 링 · 구역 분할 산점도 구역 블록 등) → §21 유형 대응표.
- 마크 색 고르기 → §17 · §22 · §23.
- 위젯 껍데기의 세부 규칙(헤더 · 범례 자리 · 본문 간격) → §15. 이 절은 «누가 소유하나» 만 정한다.

**규칙.** 모든 위젯이 공유하는 요소는 **주인이 하나**다. 차트 컴포넌트는 그 주인을 쓰고, 같은 요소를 자기 안에 다시 그리지 않는다. 아래 표가 요소마다 주인과 지금 상태를 정한다(2026-10-21 제품 차트 유형 조사 26유형 · 공통 요소 9영역 대조).

| 상태 | 뜻 |
|---|---|
| **있음** | 주인이 있고 차트들이 그것을 쓴다 |
| **차트마다 따로** | 같은 요소를 차트가 각자 그린다. 공통 부품으로 뽑을 대상 |
| **공백** | DS 에 없다. 근사하지 않는다 (§21) |
| **이관** | 레거시에는 있지만 DS 정책이 다른 자리로 보낸다 |

| 영역 | 요소 | 주인 | 상태 |
|---|---|---|---|
| 프레임 | 카드 · 배경 · 테두리 · 모서리 · 안쪽 여백 | [[WidgetFrame]] · `--wds-widget-body-px` · `-pb` · `-row-gap` | 있음 |
| 헤더 | 제목 | [[WidgetFrame]] `title` | 있음 |
| 헤더 | 설명 ⓘ | 없음 — `title` 뒤 [[InfoTip]] 자리가 WidgetFrame 에 없다 | 공백 |
| 헤더 | 소스 칩 · 필터 아이콘 · 비교 기준 드롭다운 | 옵션바 (§15 헤더는 제목 · 메뉴만) | 이관 |
| 툴바 | 전체 화면 · 더보기 | [[WidgetFrame]] `onFullscreen` · `menu` | 있음 |
| 툴바 | 설정 · 이미지 저장 · CSV · 복제 · 상세 이동 | ⋮ `menu` 의 줄 | 이관 |
| 툴바 | 차트 타입 전환 토글 | ⋮ 안 (§21) | 이관 |
| 플롯 | 그리기 영역 · 플롯 여백 | 각 차트 `frame={false}` · `--wds-widget-axis-gutter` · `--wds-widget-end-gutter` | 있음 (토큰) · 영역 계산은 차트마다 따로 |
| 축 | 값축(Y) — 눈금 셋(최대 · 절반 · 0) · 깔끔한 최대값 계산 · 단위 접미사 · 축선(X 바닥 · Y 세로) | [[ChartValueAxis]] (Primitives) — [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]] · [[ForecastLineChart]] 가 조합한다(Composite) | 있음 (2026-10-22 4벌 → 1) |
| 축 | 시간축(X) 글자 | [[ChartTimeAxis]] (Primitives) — 양 끝 안쪽 정렬 · 사이 가운데 · 바닥 2px. [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]] · [[ForecastLineChart]](`positions`) · [[ApdexChart]] 가 조합한다. [[ScatterHeatmap]] 도 2026-10-22 이 규칙으로 통일(눈금 꼭지 · 양쪽 16px 균등 배치 폐지) | 있음 (2026-10-22 6벌 → 1) |
| 축 | 축 글자 | `text-chart` · 숫자 서체 · `text-tertiary` (§15) | 있음 |
| 축 | 보조 Y축 | — | 금지 (§19) |
| 축 | 축 제목 | — 쓰지 않는다. 단위는 눈금 접미사 | 정해짐 (아래) |
| 격자 | 가로 점선 | [[ChartGrid]] (Primitives) — `--color-border-soft` 점선 하나, 불투명도로 색을 흉내 내지 않는다 · [[ScatterHeatmap]] 도 `ticks` 10 간격으로 | 있음 (5벌 → 1) |
| 격자 | 세로 점선 | [[ChartGrid]] `vertical`(칸 수) — 분포 차트에만([[ScatterHeatmap]] 22칸) | 있음 (2026-10-22) |
| 격자 | 임계 기준선 | [[ForecastLineChart]] `threshold` 만 | 차트마다 따로 |
| 막대 | 범주 · 단계 세로 막대(몫 + 나머지, 구간 글자) | [[ChartStackedColumn]] (Primitives) — [[GpuStatusBar]] 가 조합 | 있음 (2026-10-22) |
| 막대 | 고리형 막대(칸 = 대상, 안쪽→바깥 줄무늬 쌓기) | [[ChartRadialBars]] (Primitives) — [[ActiveTransactionArc]] 가 조합. 바탕 `--color-chart-radial-track` · 구분선 `--color-chart-radial-divider` · 회전 장식 `sweep` | 있음 (2026-10-22. 그 전엔 정적 이미지 — 데이터와 무관했다) |
| 막대 | 칸 막대 하나(값 · 0 · 모름) | [[ChartBar]] (Primitives) — [[UsageChart]] 가 조합. 0 은 바닥 2px, 모름은 칸 전체 `surface-100` | 있음 (2026-10-22) |
| 축 | 범주축 이름(칸 등분 · 가운데 · 말줄임) | [[ChartCategoryAxis]] (Primitives) — [[GpuStatusBar]]. [[MiniBarChart]] `categories` 는 아직 자기 글자 | 있음 · MiniBar 는 차트마다 따로 |
| 범례 | 스와치 + 이름 + 지금 값 | [[WidgetFrame]] `legend` · `SPEED_LEGEND` · `hexGridLegend` | 있음 |
| 범례 | 스와치 모양 · 항목 | 견본 [[ChartSwatch]] · 항목 [[ChartLegendItem]] (둘 다 Primitives, 같은 견본 그림 = 내부 `_swatch`) — 견본은 마크 모양을 따른다: 선 = `line`(8×2), 면 · 막대 · 조각 · 칸 = `square`(8×8), 점 · 버블 = `dot`(8px 원, 2026-10-23 [[ScatterChart]]). 항목은 견본 · 이름 · 값 사이 4px, 이름 secondary · 값 semibold primary, 세로 목록은 `fill`. [[WidgetFrame]] `legend` · [[MiniMultiLineChart]] · [[MiniDonutChart]] · [[ActiveTransactionArc]] · [[HexGrid]] 가 조합한다 | 있음 (2026-10-22 견본 네 모양 → 하나 · 항목 다섯 벌 → 하나) |
| 범례 | 색 범례 바 (순차 · 강도) | [[HeatmapLegend]] | 있음 |
| 범례 | 오른쪽 세로 목록 · 플롯 위 오버레이 · 분리 패널 | 본문 오른쪽 위 한 줄 (§15) | 이관 |
| 범례 | 순위 번호(①②③) | — 색은 순위가 아니라 개체 (§22) | 공백 |
| 값 라벨 | 최고점 ▼ + 값 | [[ChartPeakMarker]] (Primitives) — [[MiniLineChart]] 가 조합한다 (§5) | 있음 (2026-10-22. 그 전에도 MiniLineChart 1벌이었다 — 10/21 «3벌» 은 `peak` 단어로 센 오기) |
| 값 라벨 | 선 끝 값 배지 | [[MiniMultiLineChart]] `endLabel` (§25) | 있음 |
| 값 라벨 | 막대 값 · 최댓값 강조 | [[MiniBarChart]] `valueLabels` (§15) | 있음 |
| 값 표시 | 마크 hover 값 상자(툴팁) | [[ChartTooltip]] (Primitives) — 상자 · 줄 모양만, 위치는 차트가(§5). 제목 · 값 줄(견본 · 이름 · 값 굵게) · 보조 줄(합계 · 기준). 브라우저 `title` 은 쓰지 않는다(늦게 뜨고 다크를 따르지 않는다). [[ScatterChart]] · [[ZoneScatterChart]] · [[BoxPlotChart]] · [[StatusTimeline]] · [[EqualizerChart]] · [[StackedAreaChart]](세로 안내선) · [[HexGrid]] · [[BarList]] · [[MiniDonutChart]] · [[GpuStatusBar]] · [[ChartRadialBars]]([[ActiveTransactionArc]]) · [[UsageChart]] 가 조합한다. 원형 차트는 조각 바깥쪽으로 편다. [[Heatmap]] 은 [[Tooltip]](80ms)을 이미 쓰고, [[ScatterHeatmap]] 은 점에 실제 값이 없는 계약(`[left%, top%, tone]`)이라 보류 — 계약을 넓힌 뒤 단다 | 있음 (2026-10-23 · HexGrid 자체 상자 → 이것) |
| 상호작용 | 시간축 시점 고르기 | [[ChartCrosshair]] (Primitives · [[ChartTooltip]] 조합) — 포인터 x → 가장 가까운 시점 · 세로 안내선 · 계열마다 점 · 값 툴팁. `band`(막대 칸) · `positions`(고르지 않은 x) · `min`(50 부터인 축). [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]] · [[ForecastLineChart]] · [[ApdexChart]] 가 조합한다 | 있음 (2026-10-23) |
| 상호작용 | 가리킨 마크 강조 | 내부 `_emphasis` + CSS `.wds-chart-mark` — **가리킨 마크는 불투명 + 카드색 2px 고리(선은 굵게 · 시간축 차트는 세로 안내선 + 층마다 점), 나머지는 0.32. 색은 바꾸지 않는다**(색은 계열 · 상태의 것, §17). 범례 항목([[ChartLegendItem]] `onHover` · `dimmed`)을 가리키면 그 계열만 남긴다. 전환 120ms · 동작 줄이기면 없음. [[HexGrid]] 의 흐림 값(0.32)을 모두가 쓴다 | 있음 (2026-10-23 사용자 결정 · 툴팁과 함께) |
| 값 표시 | 큰 숫자 + 단위 | [[KpiCard]] · [[StatCard]] | 있음 |
| 값 표시 | 델타(▲▼ + 변화값) · 비교 시점 캡션 | [[TrendTile]] — 색은 좋은 방향(`better`) | 있음 (2026-10-23) |
| 게이지 | 트랙 + 채움 | [[UsageGauge]] · [[MetricBarCell]] | 있음 |
| 게이지 | 범위 라벨(min · Max) · 현재 위치 마커(▼) · 임계 구간 분절 | [[RangeGauge]] — 양 끝은 이름 + 값(`Min 0mi` · `Allocatable 2,200mi`), ▼ 는 [[ChartPeakMarker]], 임계 구간은 트랙 아래 2px 띠, 채움 색은 값이 든 구간 | 있음 (2026-10-23) |
| 상태 | 데이터 없음 · 수집 끊김 | [[WidgetFrame]] `state` (`no-data` · `collect-gap`) | 있음 |
| 상태 | 에이전트 없음 · 로딩 | — | 공백 |
| 상태 | 축만 남은 빈 플롯 | `state` 로 대체 | 이관 |
| 컨트롤 | 줌(+ / −) | [[TopologyZoomControl]] — 토폴로지 전용. 지도와 함께 쓸 후보 | 있음 (한 곳) |
| 컨트롤 | 임계 슬라이더 | [[Slider]] | 있음 · 차트 연동은 공백 |
| 컨트롤 | 셀 선택 | [[Heatmap]] `onSelect` · [[HexGrid]] `onSelect` | 차트마다 따로 |
| 컨트롤 | Y축 자동 토글 · 에러 필터 · 시간 범위 드래그 선택 | — | 공백 (선택 영역은 §21 `common-active-fill`) |
| 색 스케일 | 계열 · 상태 · 순차 | §17 역할 토큰 | 있음 |

**공통 부품으로 먼저 뽑을 것** (차트마다 따로인 것 중 벌 수가 많은 순서). 뽑을 때 동작을 바꾸지 않는다 — 지금 차트들이 그리는 결과가 기준이다.

1. ~~**값축 + 가로 격자**~~ — **완료(2026-10-22).** 공개 Primitives [[ChartGrid]](격자 · 마크 아래) · [[ChartValueAxis]](축선 + 눈금 글자 · 마크 위) — 카탈로그 · Storybook(`Primitives/Chart/*`)에 보인다. 이것을 조합하는 값축 차트 4종은 3계층 규칙대로 **Composite**(`Composite/Chart/*`)로 옮겼다. DS 안에서 네 차트를 import 하는 컴포넌트가 없어 연쇄 승격이 없다. 숫자 계산(`niceMax` · `formatAxisValue` · `axisTicks` · `plotY`)은 그리는 부품이 아니라 내부 `src/chart/_axisScale.ts`. 격자 색은 `border-soft` 하나로 정했다. 렌더 비교(24스토리 × 라이트 · 다크): 격자 색 차이는 감지 문턱 아래, [[MiniLineChart]] X 바닥선이 다른 셋과 같은 자리로 1px 올라갔고, 선 차트의 축선이 면 채움 위에 그려져 선명해졌다(막대 · 예측과 같은 «바닥선이 마크에 묻히지 않게»). 다음 공통 부품도 같은 방식이다 — 부품은 Primitives, 조합하는 차트는 Composite.
2. ~~**최고점 ▼ 라벨**~~ — **완료(2026-10-22).** [[ChartPeakMarker]] — 받은 점에 ▼ 끝을 맞추고 말풍선에 카드 바탕(§5). 복제는 없었지만(MiniLineChart 1벌) 선 · 면 · 누적면이 함께 쓸 요소라 먼저 부품으로 세웠다. [[MiniBarChart]] `peak` 는 ▼ 없는 막대 위 값 글자라 «막대 값 라벨» 이다.
3. ~~**범례 스와치**~~ — **완료(2026-10-22).** [[ChartSwatch]] 하나로 맞췄다. 도넛 견본 원 → 사각(조각), 아크 10px → 8px. 선 차트 칸의 WidgetFrame 범례는 `shape: "line"`. 견본을 그리게 된 도넛 · 아크 · 헥사는 Composite 로 옮겼다(DS 안 import 0 — 연쇄 없음).
4. ~~**X축 시간 글자**~~ — **완료(2026-10-22).** [[ChartTimeAxis]] — 5벌이 같은 규칙이라 그대로 모았다(렌더 차이 0 목표). 이것을 조합하게 된 [[ApdexChart]] 는 Composite 로 옮겼다. [[ScatterHeatmap]] 의 X축도 2026-10-22 Composite 이동 때 이 규칙으로 통일했다(사용자 «Composite 로 이동» 지시).

**판단 지점 처분** — 조사 문서가 «규칙이 필요하다» 고 적은 공통 요소 판단.

| 판단 지점 | 처분 |
|---|---|
| 선 끝 값 배지가 Y축 눈금을 가린다 · 오버레이 범례가 플롯을 덮는다 | 정해짐 — 배지는 플롯 밖 칸(§25), 범례는 본문 오른쪽 위 한 줄(§15) |
| 데이터가 없으면 축과 격자만 남고 안내가 없다 | 정해짐 — `state`(§15). 선을 0 으로 그리지 않는다 |
| 같은 화면에서 칸마다 시간축 범위가 어긋난다 | 정해짐 — 시간 범위는 옵션바 하나가 정한다(§15) |
| 범주 라벨이 말줄임 없이 잘린다 | 정해짐 — [[MiniBarChart]] `categories` 가 칸 폭에서 말줄임한다. 잘린 전체 이름을 어디서 보일지는 결정 필요 |
| 같은 유형인데 카드마다 범례 배치가 다르다(1행 · 2×2) | 정해짐 — 한 줄(§15). 단일 누적 바도 한 줄 · 줄바꿈([[SegmentBar]], 2026-10-23). 이름표가 본문 안에 있는 칸(BarList · 도넛)은 그 자리 그대로 |
| 순차 색을 쓰는 차트 중 Cube 에만 색 범례가 있다 | 정해짐 — 모든 차트 칸에 범례(§15). 강도 스케일은 [[HeatmapLegend]], 판정 등급은 `SPEED_LEGEND` |
| 축 제목을 언제 쓰나 (이중 축에서만 쓰였다) | 정해짐(2026-10-21 사용자 결정) — **쓰지 않는다.** 이중 축이 금지(§19)라 쓸 자리가 없고, 단위는 눈금 접미사가 맡는다 |
| 범례 스와치 모양이 셋(사각 · 원 · 세로 막대) | 정해짐(2026-10-21 사용자 결정) — **마크 모양을 따른다.** 선 = 선, 면 · 막대 · 조각 · 칸 = 사각. 스와치가 «어떤 마크인가» 까지 말해 범례와 플롯을 오갈 때 짝이 바로 읽힌다. DS 안 네 모양은 공통 부품 3순위에서 맞춘다 |
| 값이 있는 계열만 범례에 둘까 (10종 중 값 있는 것 1종) | **결정 필요.** 범례는 «무엇이 그려졌나» 를 말한다. 0 인 계열을 빼면 색 배정은 그대로(§17 색은 개체를 따른다) |
| 미래 구간을 비워 둘까 잘라낼까 · 미래 칸과 데이터 없음 칸이 같은 회색이다 | **결정 필요.** [[HeatmapCell]] 은 «모름» 을 `surface-200` 으로 칠한다. 미래는 «아직» 이라 다른 말이다 |
| 소형 칸에서 밀도 차트가 뭉개진다 — 최소 크기 · 버릴 요소 | **결정 필요.** 칸 크기에 따라 눈금 수 · 집계 수치 · 컨트롤 중 무엇을 먼저 버릴지 |

**Why.** 26유형을 펼쳐 보면 차트가 다른 것보다 같은 것이 많다. 제목 · 메뉴 · 축 · 격자 · 범례 · 값 라벨 · 빈 상태는 모든 위젯이 쓴다. 이것을 차트마다 그리면 같은 화면에서 축 글자 · 범례 모양 · 빈 상태 문구가 칸마다 달라지고, 사람은 그 차이를 종류의 차이로 읽는다(§15 Why). 라이브 제품에서 범례 스와치가 사각 · 원 · 세로 막대 셋으로 갈린 것, 값 배지가 눈금을 가린 것, 빈 플롯에 안내가 없던 것이 모두 주인 없이 각자 그린 결과다.
DS 도 예외가 아니다. 값축 계산은 4벌, 점선 격자는 5벌이고 격자 색은 벌써 둘로 갈렸다. 범례 스와치는 네 모양으로 갈려 있다. 벌이 여럿이면 한 벌을 고칠 때 나머지와 어긋난다 — 격자 색이 그렇게 갈렸다. 그래서 유형을 늘리기 전에 공통 요소의 주인부터 정한다.

**How.**
- 새 차트는 먼저 이 표에서 요소마다 주인을 찾는다. «있음» 이면 그것을 쓴다. «차트마다 따로» 면 새 차트에서 또 그리지 말고 공통 부품 작업을 먼저 하거나 그 작업에 묶는다.
- 공통 부품을 뽑으면 이 표의 상태를 «있음» 으로 바꾸고 주인 칸에 그 부품을 적는다. 쓰던 차트를 모두 그 부품으로 옮긴 뒤에 바꾼다.
- «공백» 은 근사하지 않는다(§21). «결정 필요» 는 결정이 나면 처분 칸을 «정해짐» 으로 바꾸고 근거 절을 적는다.
- 부품을 새로 만들면 세 정본(코드 · Storybook · Figma)에 함께 넣는다.

✅ 축 · 격자 · 범례 · 값 라벨 · 빈 상태는 이 표의 주인을 쓴다
✅ 같은 요소를 세 번째로 그리게 되면 공통 부품으로 뽑는다
✅ 판단 지점은 «정해짐(근거 절)» 또는 «결정 필요» 로 처분하고 표에 남긴다

❌ 새 차트 안에서 값축 · 점선 격자를 또 그리기 — [[ChartGrid]] · [[ChartValueAxis]] 를 조합한다. 최고점은 [[ChartPeakMarker]]
❌ 차트가 자기 범례 항목 · 견본을 그리기 — [[ChartLegendItem]](견본만이면 [[ChartSwatch]])을 쓴다. 선 차트 칸 범례에 사각 견본(`shape` 빠뜨림)
❌ 데이터가 없을 때 축과 격자만 남긴 플롯 — `state` 로 문장을 세운다
❌ «결정 필요» 항목을 가장 가까운 기존 규칙으로 근사해 정하기 — 결정을 따로 남긴다

---

## 부록 — 빠른 결정 표

| 상황 | 무엇을 할까 |
|---|---|
| 새 페이지 만들기 | `DashboardLayout` slot 패턴 + `PageHeader` + `OptionbarPage` |
| AI 응답에 새 카드 한 종류 추가 | [`widget-components.md`](./widget-components.md)에서 가장 가까운 것 찾아 prop 확장 / 안되면 새 `widget/Ai*.tsx` |
| 새 색상이 필요 | [`tokens.md`](./tokens.md)에 토큰 추가 → 컴포넌트에서 import |
| 새 카드 외형이 필요 | 거의 항상 `AiCard`로 충분. 정말 다르다면 디자인 리뷰 후 primitive 추가 |
| 차트가 필요 | `MiniLineChart` / `AiUsageChart` 확장 — SVG 단위 규칙(#3) 준수 |
| 차트 색 고르기 | 색이 무엇을 말하나(정체성 · 크기 · 강도 · 등급 · 상태) → 그 역할의 토큰 (#17) · 맞닿는 차트는 3계열까지 (#18) · 이중 축 금지 (#19) |
| 레거시 차트 · 제품 토큰(`--wds-chart-*`)을 옮기기 | 대응 · 흡수 · 공백 · 이관 대상으로 처분 · 값은 가져오지 않는다 (#21) |
| 계열이 9개 이상 (서버 100대 · Top-N) | 색을 늘리지 않는다 — 강조 + 회색 다발 · Heatmap 행렬 · HexGrid 칸 · small multiples (#22) |
| 계열 차트 옆에 상태 · 경보 | 계열 색과 Severity 색을 한 위젯에 섞지 않는다 · Severity 는 아이콘 + 라벨 (#23) |
| 대시보드 위젯 한 칸 | `WidgetFrame`(헤더 · 본문 · 푸터) + 본문 컴포넌트 · 빈 상태는 `state` (#15) |
| 차트에 축 · 격자 · 범례 · 값 라벨 · 빈 상태를 그리기 | 요소마다 주인을 표에서 찾는다 · 차트 안에서 또 그리지 않는다 · 공백은 근사하지 않는다 (#26) |
| 글자에 보조 설명 | 밑줄 금지 · 글자 뒤에 `InfoTip` (#16) |
| AI 응답이 10초를 넘길 수 있다 | `AiProgress` 하나(단계 칸 · 처리 수 · 중간 발견 · 10초/30초 하단 줄) · 작성 단계에서만 `AnswerSkeleton still` · 송신 버튼은 `onStop` (#24) |
| 테이블이 필요 | `DataTable` (chrome) / `AiClassificationTable` `AiCostTable` (widget) |
| 한 화면의 여러 구획 구분 | 페이지 본문이면 카드로 나눔 · 카드 안이면 `border-t border-default` + 여백 (#14) |
| 위젯 토글 | `useWhaTapAi()` 한 곳에서 `aiActive` 공유. `DashboardLayout`에 `widgetOpen` 전달 |
