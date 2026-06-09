/**
 * AI 위젯 — 사용자 질문 / AI 응답 한 쌍 + 선택적 첨부 (Figma 27110:53407).
 *
 * 구조:
 *   • 사용자 메시지: 우측 정렬 그레이 버블 (AiUserBubble, Figma 27110:53409) + 복사/재시도 아이콘
 *   • AI 응답: full-width 라이트 그레이 라운드 버블 + 복사/재시도 아이콘
 *   • 첨부(선택): 파일 카드 / 이미지 썸네일을 우측 정렬로 추가
 */
import AiUserBubble from "./AiUserBubble";

export type AiChatAttachment =
  | { kind: "file"; name: string; mime?: string }
  | { kind: "image"; src: string; alt?: string };

export type AiChatExchangeProps = {
  /** 사용자가 던진 질문 */
  question: string;
  /** AI 응답 본문 (단일 문단; 줄바꿈은 \n). 비우면 사용자 메시지만 렌더. */
  answer?: string;
  /** 응답 아래 우측에 노출할 첨부 (파일/이미지) */
  attachments?: AiChatAttachment[];
};

export default function AiChatExchange({
  question,
  answer,
  attachments,
}: AiChatExchangeProps) {
  const hasAnswer = answer && answer.trim().length > 0;
  return (
    <div className="flex flex-col gap-[12px] w-full">
      {/* 사용자 질문 — 우측 정렬 그레이 버블 (Figma 27110:53409) */}
      <div className="flex flex-col items-end gap-[4px] w-full">
        <AiUserBubble>{question}</AiUserBubble>
        <MessageTools />
      </div>

      {/* AI 응답 (full-width 그레이 버블) — answer가 있을 때만 렌더 */}
      {hasAnswer && (
        <div className="flex flex-col items-start gap-[4px] w-full">
          <div
            className="w-full rounded-[8px] px-[12px] py-[12px]"
            style={{ background: "var(--color-surface-50)" }}
          >
            <p
              className="text-md text-primary tracking-default leading-normal whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {answer}
            </p>
          </div>
          <MessageTools />
        </div>
      )}

      {/* 첨부 (선택) — 우측 정렬 스택 */}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-col items-end gap-[8px] w-full">
          {attachments.map((a, i) =>
            a.kind === "file" ? (
              <FileCard key={i} name={a.name} mime={a.mime ?? "FILE"} />
            ) : (
              <ImagePreview key={i} src={a.src} alt={a.alt} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function MessageTools() {
  return (
    <div className="flex items-center gap-[6px]">
      <ToolBtn ariaLabel="복사">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.2" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
          <path d="M5.5 1.5h7c.55 0 1 .45 1 1v7" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </ToolBtn>
      <ToolBtn ariaLabel="다시 시도">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7a5 5 0 1 0 1.5-3.55" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 2v3h3" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolBtn>
    </div>
  );
}

function ToolBtn({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex items-center justify-center size-[20px] rounded-[4px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] transition-colors"
    >
      {children}
    </button>
  );
}

function FileCard({ name, mime }: { name: string; mime: string }) {
  return (
    <div
      className="flex flex-col gap-[6px] bg-white border border-[#d3d3d3] rounded-[8px] p-[10px]"
      style={{ width: 140 }}
    >
      <p
        className="text-md font-bold text-primary tracking-default leading-normal truncate"
        style={{ fontFamily: "var(--font-family-korean)" }}
        title={name}
      >
        {name}
      </p>
      <span
        className="self-start text-sm text-tertiary bg-[rgba(0,0,0,0.05)] rounded-[4px] px-[6px] py-[2px] uppercase"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {mime}
      </span>
    </div>
  );
}

function ImagePreview({ src, alt }: { src: string; alt?: string }) {
  return (
    <div
      className="rounded-[8px] overflow-hidden border border-[#d3d3d3]"
      style={{ width: 140, height: 140 }}
    >
      <img src={src} alt={alt ?? ""} className="w-full h-full object-cover" />
    </div>
  );
}
