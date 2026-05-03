'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import "@/app/globals.css";
import { HeartPulse, MessageCircleMore, FileText, CircleUserRound } from 'lucide-react';

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
  
  return (
    <nav className="fixed top-1/2 -translate-y-1/2 left-5 z-1000">
      {navList.map((item, index) => {
        const isActive = pathname === item.href;
        const isLast = index === navList.length - 1;

        return (
          <div key={item.href} className="flex flex-col items-center">
            <Link
              key={item.href}
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
            {!isLast && (
              <span className="w-7 h-7 rotate-45 -my-3.25 bg-background scoop-65-35 -z-1"/>
            )}
          </div>
        );
      })}
    </nav>
  )
}