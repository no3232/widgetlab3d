import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WidgetLab 3D",
  description: "사이드 프로젝트로 만드는 어쩌구 저쩌구...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko-kr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
