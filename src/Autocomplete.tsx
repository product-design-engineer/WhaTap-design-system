/**
 * Autocomplete — 쳐서 좁히고 골라 넣는 단일 선택 입력. Composite layer.
 *
 * ## Purpose
 * 고를 것이 «미리 다 보여 줄 수 없을 만큼 많은» 목록에서 하나를 집는 컨트롤.
 * 사람이 이미 답을 알고 있고(이름 · 이메일 · 프로젝트 이름) 그것을 치기만 하면 되는 자리다.
 * [[Select]] · [[SelectPopover]] 는 목록을 «펼쳐서» 고르게 하는데, 후보가 수십을 넘으면
 * 펼치는 것이 곧 스크롤이라 고르는 일이 찾는 일로 바뀐다. 이 컴포넌트가 그 자리를 받는다.
 *
 * DS 에 없어서 소비자가 각자 「TextField + 아래 목록」 을 다시 짜던 패턴이다([[IcSearch]] 가
 * 올라온 것과 같은 사정). 두 번 짜면 좁히는 규칙 · 키보드 이동 · 빈 결과 문구가 곧 갈라진다.
 *
 * ## When to use
 * - 후보가 많고 사람이 값을 알고 있을 때 (계정 추가, 프로젝트 찾기, 태그 붙이기).
 * - 이름만으로는 안 갈리고 보조 값이 있어야 할 때 (`description` 에 이메일 · 조직 경로).
 * - 서버가 후보를 주는 검색 (`filter={false}` 로 내부 좁히기를 끄고 호출측이 준 대로 그린다).
 *
 * ## When NOT to use
 * - 후보가 열 안팎으로 적고 다 보여 줘도 될 때 → [[Select]]. 치게 만들 이유가 없다.
 * - 묶음 헤더 · 색 표식이 필요할 때 → [[SelectPopover]].
 * - 여럿 고르기 → [[FilterDropdown]].
 * - 목록을 «훑어보는» 것 자체가 목적일 때 → 목록을 그냥 편다. 검색창을 씌우면 훑을 수 없다.
 *
 * ## Composition rules
 * - 입력 표면은 [[TextField]] 를 그대로 쓴다. 같은 줄에 다른 폼 컨트롤과 섞여도 높이·테두리가
 *   어긋나지 않는다(sm 24 / md 28 / lg 32).
 * - 목록은 트리거 아래 `absolute` — 부모가 `overflow` 로 자르면 배치는 호출측 몫이다
 *   ([[SelectPopover]] · [[InstanceSelectPanel]] 과 같은 규칙).
 * - **고른 값을 컴포넌트가 기억하지 않는다.** `onSelect` 로 넘기고 끝이다. 고른 뒤 입력에
 *   무엇이 남을지(이름을 채울지 · 비울지)는 그 화면이 정한다. 계정 추가처럼 «고르면 목록이
 *   줄어드는» 자리에서는 비우는 것이 맞고, 값 하나를 확정하는 자리에서는 채우는 것이 맞다.
 * - 맞은 글자에 표식을 넣지 않는다. 왜 걸렸는지는 `description` 이 이미 말하고, 굵게 칠하면
 *   목록의 무게가 글자마다 달라져 훑는 눈이 걸린다.
 * - 빈 결과는 목록을 닫지 않고 «없다» 를 그 자리에 적는다. 닫아 버리면 사람은 자기가 잘못
 *   눌렀다고 읽는다.
 *
 * @example
 * ```tsx
 * <Autocomplete
 *   label="계정"
 *   value={q}
 *   onChange={setQ}
 *   options={accounts.map((a) => ({ value: a.userId, label: a.name, description: `${a.email} · ${a.orgPath}` }))}
 *   onSelect={(o) => add(o.value)}
 *   placeholder="이름 · 이메일로 찾기"
 *   emptyText="찾는 계정이 없습니다"
 * />
 * ```
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import TextField from "./TextField";
import { IcSearch } from "./icons/SearchIcon";

export type AutocompleteSize = "sm" | "md" | "lg";

export type AutocompleteOption = {
  /** 호출측이 되받을 식별자. 화면에 나가지 않는다. */
  value: string;
  /** 첫 줄. 사람이 치는 값과 같은 것을 둔다. */
  label: string;
  /** 둘째 줄 — 같은 이름을 가르는 보조 값(이메일 · 조직 경로). 좁히기에도 함께 걸린다. */
  description?: string;
  disabled?: boolean;
};

export type AutocompleteProps = {
  /** 상단 라벨. [[TextField]] 의 필드 라벨 규칙(11px 고정)을 그대로 받는다. */
  label?: ReactNode;
  /** 입력 문자열. controlled 만 받는다 — 좁히기 결과가 화면 다른 곳과 이어지는 경우가 많다. */
  value: string;
  onChange: (next: string) => void;
  /** 후보 전체. 좁히기는 이 컴포넌트가 한다(`filter={false}` 면 준 대로 그린다). */
  options: AutocompleteOption[];
  /** 하나를 골랐을 때. 입력을 어떻게 둘지는 호출측이 정한다(위 규칙 참고). */
  onSelect: (option: AutocompleteOption) => void;
  size?: AutocompleteSize;
  placeholder?: string;
  /** 좁힌 결과가 없을 때 목록 자리에 적을 문장. */
  emptyText?: string;
  /** 목록 최대 높이(px). 기본 268 — [[SelectPopover]] 와 같다. */
  maxListHeight?: number;
  /** 폭(px). 미지정 시 컨테이너를 채운다. */
  width?: number;
  /**
   * 좁히기 규칙. 기본은 label · description 에 대소문자 무시 부분 일치.
   * `false` 면 좁히지 않는다 — 서버가 이미 걸러 준 목록을 그대로 그릴 때.
   */
  filter?: false | ((option: AutocompleteOption, query: string) => boolean);
  /** 입력이 비어 있어도 후보를 펼칠지. 기본 true — 무엇을 고를 수 있는지 먼저 보여 준다. */
  openOnFocus?: boolean;
  disabled?: boolean;
  /** 외부 className — 바깥 wrapper. */
  className?: string;
};

const ROW_H: Record<AutocompleteSize, number> = { sm: 40, md: 44, lg: 48 };
const TRIGGER_H: Record<AutocompleteSize, number> = { sm: 24, md: 28, lg: 32 };

const defaultFilter = (o: AutocompleteOption, q: string) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return `${o.label} ${o.description ?? ""}`.toLowerCase().includes(needle);
};

export default function Autocomplete({
  label,
  value,
  onChange,
  options,
  onSelect,
  size = "lg",
  placeholder,
  emptyText = "결과가 없습니다",
  maxListHeight = 268,
  width,
  filter,
  openOnFocus = true,
  disabled = false,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  /* 키보드로 짚고 있는 자리. -1 은 「아무 것도 짚지 않음」 이라 Enter 가 아무 일도 하지 않는다.
     처음부터 0 을 짚어 두면 치자마자 Enter 를 눌렀을 때 보지도 않은 후보가 들어간다. */
  const [cursor, setCursor] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    if (filter === false) return options;
    const fn = filter ?? defaultFilter;
    return options.filter((o) => fn(o, value));
  }, [options, value, filter]);

  /* 바깥을 누르면 닫는다 — [[SelectPopover]] 와 같은 처리. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* 좁히면 짚던 자리가 사라진다. 그대로 두면 화면에 없는 후보가 Enter 로 들어간다. */
  useEffect(() => {
    setCursor(-1);
  }, [value]);

  /* 키보드로 목록 끝을 넘어갈 때 따라 스크롤한다. 짚은 것이 화면 밖이면 짚은 뜻이 없다. */
  useEffect(() => {
    if (cursor < 0) return;
    const row = listRef.current?.children[cursor] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const pick = (o: AutocompleteOption) => {
    if (o.disabled) return;
    onSelect(o);
    setCursor(-1);
  };

  const move = (step: number) => {
    if (!shown.length) return;
    setOpen(true);
    setCursor((c) => {
      let next = c;
      /* 비활성 후보는 건너뛴다. 짚혔는데 Enter 가 듣지 않으면 사람은 컨트롤이 멈춘 줄 안다. */
      for (let i = 0; i < shown.length; i += 1) {
        next = (next + step + shown.length + (next < 0 && step < 0 ? 1 : 0)) % shown.length;
        if (!shown[next].disabled) return next;
      }
      return c;
    });
  };

  return (
    <div className={`wds-field flex flex-col gap-1_5 ${className ?? ""}`} style={{ width }}>
      <div ref={rootRef} className="relative">
        <TextField
          label={label}
          size={size}
          value={value}
          onChange={(v) => {
            onChange(v);
            setOpen(true);
          }}
          onFocus={() => openOnFocus && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Enter") {
              if (open && cursor >= 0 && shown[cursor]) {
                e.preventDefault();
                pick(shown[cursor]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
              setCursor(-1);
            }
          }}
          placeholder={placeholder}
          leadingIcon={<IcSearch size={size === "sm" ? 12 : 16} />}
          clearable
          disabled={disabled}
          fullWidth
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />

        {open && !disabled && (
          <div
            className="absolute bg-card rounded-2px"
            style={{
              /* 라벨이 있으면 입력이 그만큼 내려가 있다. 목록은 «입력» 아래에 붙어야 하므로
                 트리거 높이가 아니라 컨테이너 아래를 기준으로 잡는다. */
              top: "100%",
              marginTop: 4,
              left: 0,
              width: "100%",
              maxHeight: maxListHeight,
              overflowY: "auto",
              zIndex: 50,
              paddingBlock: 4,
              border: "1px solid var(--color-border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {shown.length === 0 ? (
              /* 닫지 않고 여기서 말한다. 닫으면 「내가 잘못 눌렀나」 가 된다. */
              <div
                className="flex items-center text-base text-tertiary"
                style={{ height: TRIGGER_H[size], paddingInline: 10 }}
              >
                {emptyText}
              </div>
            ) : (
              <div ref={listRef} role="listbox">
                {shown.map((o, i) => {
                  const active = i === cursor;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={o.disabled}
                      /* mousedown 으로 받는다. click 은 blur 뒤에 오는데 그 사이에 목록이
                         닫히면 누른 것이 사라진다. */
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(o);
                      }}
                      onMouseEnter={() => setCursor(i)}
                      className="flex w-full flex-col items-start justify-center text-left cursor-pointer transition-colors hover-bg-surface-100"
                      style={{
                        minHeight: o.description ? ROW_H[size] : TRIGGER_H[size],
                        paddingInline: 10,
                        paddingBlock: 4,
                        gap: 2,
                        border: "none",
                        background: active ? "var(--color-status-info-soft)" : "transparent",
                        opacity: o.disabled ? 0.5 : 1,
                      }}
                    >
                      <span className="text-md text-primary truncate w-full">{o.label}</span>
                      {o.description && (
                        <span className="text-base text-tertiary truncate w-full">{o.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
