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

**규칙.** 되돌릴 수 없는 실행은 **[[Button]] `tone="critical"` → [[Modal]] 확인 → [[Toast]] 완료** 세 단계를 거친다. 한 단계도 생략하지 않는다.

**When to use.** 되돌릴 수 없는 것을 사람이 실행하는 자리 전부 — 삭제 · 해지 · 초기화 · 되돌릴 수 없는 전송. 「목록에서 행을 지운다」가 가장 흔하다.

**When NOT to use.**
- **되돌릴 수 있는 실행** — 필터 해제 · 정렬 변경 · 탭 이동 · 위젯 닫기. 확인을 붙이면 마찰만 남고 진짜 확인이 필요한 곳의 신호가 무뎌진다("또 그 모달"). 되돌릴 수 있으면 확인 대신 **되돌리기**(P2 의 `actionLabel`)다.
- **AI 위젯 안** — [[Modal]] 은 페이지 컨텍스트 한정이다(`feedback_widget_readonly_policy`). 위젯은 제안·미리보기까지이고 실행과 확인은 페이지로 이관한다.

**Why.** 위험한 실행의 비용은 **비대칭**이다 — 오클릭 한 번의 대가가 복구 불가다. 확인 모달은 마찰을 위한 마찰이 아니라, 사용자가 **무엇이** 사라지는지 대상을 재확인하는 지점이다. 그래서 모달 본문은 실행 이름을 반복하는 자리가 아니라 **대상과 결과를 적는 자리**다.

**How.**

```tsx
<Button tone="critical" size="sm" onClick={() => setConfirm(true)}>삭제</Button>

<Modal open={confirm} onClose={() => setConfirm(false)} size="sm" title="알림 규칙 삭제"
  footer={<>
    <Button variant="basic" onClick={() => setConfirm(false)}>취소</Button>
    <Button variant="contained" tone="critical" onClick={remove}>삭제</Button>
  </>}>
  「CPU 90% 초과」 규칙을 삭제합니다. 되돌릴 수 없습니다.
</Modal>
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

추가한 컴포넌트는 같은 PR에서 [`widget-components.md`](./widget-components.md)에 등록.

✅ 기존 컴포넌트의 **prop 확장**으로 되는지 먼저 본다 — 같은 외형·다른 데이터인 경우가 매우 흔하다
✅ 반복되거나 의미 단위가 분명한 구조(목록 행·카드·셀·항목)는 **컴포넌트로 추출**한다 — 추출이 기본이다
✅ 새 컴포넌트는 계층 명시 + docstring 4섹션 + 스토리 + `index.ts` export 를 **같은 PR 에서** 갖춘다

❌ 프리미티브로 조립되는 것을 새 컴포넌트로 — 페이지에서 직접 조립하면 된다
❌ 스토리 없이 추가 — 계층 판정이 story title prefix 라서 **게이트 5곳에서 동시에 빠진다**
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

## 부록 — 빠른 결정 표

| 상황 | 무엇을 할까 |
|---|---|
| 새 페이지 만들기 | `DashboardLayout` slot 패턴 + `PageHeader` + `OptionbarPage` |
| AI 응답에 새 카드 한 종류 추가 | [`widget-components.md`](./widget-components.md)에서 가장 가까운 것 찾아 prop 확장 / 안되면 새 `widget/Ai*.tsx` |
| 새 색상이 필요 | [`tokens.md`](./tokens.md)에 토큰 추가 → 컴포넌트에서 import |
| 새 카드 외형이 필요 | 거의 항상 `AiCard`로 충분. 정말 다르다면 디자인 리뷰 후 primitive 추가 |
| 차트가 필요 | `MiniLineChart` / `AiUsageChart` 확장 — SVG 단위 규칙(#3) 준수 |
| 테이블이 필요 | `DataTable` (chrome) / `AiClassificationTable` `AiCostTable` (widget) |
| 위젯 토글 | `useWhaTapAi()` 한 곳에서 `aiActive` 공유. `DashboardLayout`에 `widgetOpen` 전달 |
