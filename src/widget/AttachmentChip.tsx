/**
 * AiAttachmentChip — [[WhaTapAiWidget]] 입력 영역의 단일 첨부 파일 칩.
 *
 * ## Purpose
 * 입력창 위 첨부 파일 한 건을 고정폭 칩으로 렌더 — 파일명(truncate) + MIME 배지.
 * `WhaTapAiWidget` 의 `attachments.map(...)` 안에 인라인되어 있던 칩 마크업을 그대로 추출한 것.
 *
 * ## When to use
 * - [[WhaTapAiWidget]] 가 `attachments.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 첨부 파일 칩 외형이 필요한 다른 입력 표면.
 *
 * ## When NOT to use
 * - 입력창 chrome / textarea / 전송 버튼 → 부모 [[WhaTapAiWidget]] 가 책임.
 * - 첨부가 아닌 일반 칩 → 해당 칩 컴포넌트 사용.
 *
 * ## Composition rules
 * - 파일명(`name`)·MIME(`mime`)만 주입 — 칩 외형/truncate/배지는 이 컴포넌트가 책임 (표현용).
 * - 색·배경은 토큰(`bg-card` · `border-strong` · `text-primary` · `text-tertiary` · `bg-surface-100`) — 인라인 hex 금지.
 * - MIME 미지정 시 `"CSV"` 로 폴백 (부모 인라인 동작 그대로).
 *
 * @example
 * ```tsx
 * {attachments.map((a, i) => (
 *   <AiAttachmentChip key={i} name={a.name} mime={a.mime} />
 * ))}
 * ```
 */
export default function AiAttachmentChip({
  name,
  mime,
}: {
  /** 첨부 파일명 (길면 truncate, title 로 전체 노출). */
  name: string;
  /** 파일 MIME/확장자 배지. 미지정 시 "CSV" 폴백. */
  mime?: string;
}) {
  return (
    <div
      className="flex flex-col gap-4px bg-card border border-strong rounded-6px px-8px py-6px shrink-0"
      style={{ width: 100 }}
    >
      <p
        className="text-base font-bold text-primary tracking-default leading-normal truncate"
        style={{ fontFamily: "var(--font-family-korean)" }}
        title={name}
      >
        {name}
      </p>
      <span
        className="self-start text-xs text-tertiary bg-surface-100 rounded-3px px-4px py-1px uppercase"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {mime ?? "CSV"}
      </span>
    </div>
  );
}
