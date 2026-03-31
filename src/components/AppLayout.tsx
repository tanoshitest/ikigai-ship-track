import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Package, Users, Truck, UserCog, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Quản lý Lead', icon: ClipboardList, path: '/leads' },
  { label: 'Quản lý bưu kiện', icon: Package, path: '/parcels' },
  { label: 'Khách hàng', icon: Users, path: '/customers' },
  { label: 'Nhà vận chuyển', icon: Truck, path: '/carriers' },
  { label: 'Nhân viên', icon: UserCog, path: '/employees' },
  { label: 'Báo cáo', icon: BarChart3, path: '/reports' },
  { label: 'Cài đặt', icon: Settings, path: '/settings' },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Quản lý Lead',
  '/parcels': 'Quản lý bưu kiện',
  '/customers': 'Khách hàng',
  '/carriers': 'Nhà vận chuyển',
  '/employees': 'Nhân viên',
  '/reports': 'Báo cáo',
  '/settings': 'Cài đặt',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = location.pathname.startsWith('/leads/') ? '/leads' : location.pathname;
  const pageTitle = pageTitles[currentPath] || 'IKIGAI';

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-primary-foreground transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-xl font-bold tracking-wider">🌸 IKIGAI</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-primary-foreground/10 p-4">
          <p className="text-xs text-primary-foreground/50">© 2026 IKIGAI Logistics</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Admin</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
