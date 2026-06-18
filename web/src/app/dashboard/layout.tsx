"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, isAuthenticated, logout } from "@/services/auth";
import type { AuthUser } from "@/types/auth";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileBarChart2,
    permission: "reports:read",
  },
];


export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth/login");
      return;
    }
    setUser(getCurrentUser());
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/auth/login");
  }

  if (!user) return null;

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.permission || user.permissions.includes(link.permission),
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-60 flex-col bg-primary text-white">
        <div className="px-6 py-6 text-xl font-bold tracking-wide">
          CondoGest
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}

        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mx-3 mb-6 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <p className="text-sm text-gray-500">Bem vindo,</p>
            <p className="text-lg font-bold text-accent">{user.nome}</p>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
