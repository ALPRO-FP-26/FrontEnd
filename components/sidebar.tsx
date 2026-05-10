'use client';

import { usePathname, useRouter } from 'next/navigation';
import "@/app/globals.css";
import { HeartPulse, MessageCircleMore, FileText, CircleUserRound, Book, LogOut } from 'lucide-react';
import { clearAuth } from '@/lib/api';
import Button from '@/components/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navList: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <HeartPulse size={20} /> },
  { name: "Documents", href: "/documents", icon: <FileText size={20} /> },
  { name: "Chatbot", href: "/chatbot", icon: <MessageCircleMore size={20} /> },
  { name: "Articles", href: "/article", icon: <Book size={20} /> },
  { name: "Profile", href: "/profile", icon: <CircleUserRound size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <nav className="fixed top-1/2 -translate-y-1/2 left-5 z-1000 flex flex-col items-center">
      {navList.map((item) => {
        const isActive = pathname === item.href;

        return (
          <div key={item.href} className="flex flex-col items-center">
            <Button
              href={item.href}
              icon={item.icon}
              title={item.name}
              bgClass={isActive ? "bg-richcerulean text-background" : undefined}
              hoverClass={isActive ? "hover:bg-richcerulean hover:text-background" : undefined}
            />
            <span className="w-7 h-7 rotate-45 -my-3.25 bg-background scoop-70-30 -z-1" />
          </div>
        );
      })}

      <Button
        onClick={handleLogout}
        title="Sign out"
        icon={<LogOut size={20} />}
        hoverClass="hover:bg-red-500 hover:text-white"
      />
    </nav>
  );
}