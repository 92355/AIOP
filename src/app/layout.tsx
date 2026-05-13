import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIOP",
  description: "개인 운영 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
