import { ReactNode } from "react";

/**
 * 16:9 stage wrapper used by every prototype page.
 * Centers content on a dark page, renders a 1280×720 white stage.
 */
export default function Stage({
  badge,
  children,
}: {
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0a0a14" }}>
      {badge && (
        <div className="fixed top-4 right-4 z-[1000] px-3.5 py-2 rounded-full text-sm font-semibold tracking-wider border border-white/10 text-white" style={{ background: "rgba(26, 26, 46, 0.85)" }}>
          {badge}
        </div>
      )}
      <div
        className="w-full max-w-[1280px] bg-[#f5f6f8] rounded-lg overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ aspectRatio: "16 / 9" }}
      >
        {children}
      </div>
    </div>
  );
}
