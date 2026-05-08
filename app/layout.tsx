import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Health Tracker",
  description: "Health Tracker with RAG Pipelines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex">
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
