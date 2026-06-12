export const metadata = {
  title: "WhaTap DS — Hosted MCP",
  description: "WhaTap Design System 호스팅 MCP 서버",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "40px auto", padding: "0 16px", lineHeight: 1.6 }}>
        {children}
      </body>
    </html>
  );
}
