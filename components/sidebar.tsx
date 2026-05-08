'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import "@/app/globals.css";
import { HeartPulse, MessageCircleMore, FileText, CircleUserRound, LogOut } from 'lucide-react';
import { clearAuth } from '@/lib/api';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navList: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <HeartPulse size={20} /> },
  { name: "Documents", href: "/documents", icon: <FileText size={20} /> },
  { name: "Chatbot", href: "/chatbot", icon: <MessageCircleMore size={20} /> },
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
      {navList.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <div key={item.href} className="flex flex-col items-center">
            <Link
              href={item.href}
              className={[
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 border-3 border-background',
                isActive
                  ? 'bg-richcerulean text-background'
                  : 'bg-gray-300 text-foreground/70 hover:text-foreground',
              ].join(' ')}
            >
              {item.icon}
            </Link>
            <span className="w-7 h-7 rotate-45 -my-3.25 bg-background scoop-70-30 -z-1" />
          </div>
        );
      })}

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Sign out"
        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 border-3 border-background bg-gray-300 text-foreground/70 hover:bg-red-500 hover:text-white"
      >
        <LogOut size={20} />
      </button>
    </nav>
  );
}