'use client';

import Sidebar from "../../components/sidebar";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ready = useAuthGuard(true); // redirect to /login if not authenticated

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-richcerulean border-t-transparent animate-spin" />
          <p className="text-[11px] font-mono text-foreground/40">Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </>
  );
}
