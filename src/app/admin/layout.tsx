
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Bell,
  Gauge,
  LogOut,
  Megaphone,
  Settings,
  Users,
  Loader2,
  Camera,
  Brush,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminSession {
  email: string;
  role: 'superadmin' | 'admin';
}

const allNavItems = [
  { href: '/admin/dashboard', icon: Gauge, label: 'Dashboard', roles: ['superadmin', 'admin'] },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements', roles: ['superadmin'] },
  { href: '/admin/participants', icon: Users, label: 'Participants', roles: ['superadmin', 'admin'] },
  { href: '/admin/submissions', icon: Camera, label: 'Submissions', roles: ['superadmin', 'admin'] },
  { href: '/admin/branding', icon: Brush, label: 'Branding', roles: ['superadmin'] },
  { href: '/admin/settings', icon: Settings, label: 'Settings', roles: ['superadmin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('admin_session');
      if (sessionStr) {
        const sessionData: AdminSession = JSON.parse(sessionStr);
        setSession(sessionData);
      } else {
        setSession(null);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    } catch (error) {
        setSession(null);
        if (pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setSession(null);
    router.push('/admin/login');
  };

  const navItems = session ? allNavItems.filter(item => item.roles.includes(session.role)) : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!session && pathname !== '/admin/login') {
    return null;
  }

  if (!session) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex w-full items-center justify-end gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                      <AvatarFallback>{session.email ? session.email.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.role === 'superadmin' ? 'Super Admin' : 'Admin'}</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    {session.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                   {session.role === 'superadmin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                        Settings
                    </DropdownMenuItem>
                   )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
