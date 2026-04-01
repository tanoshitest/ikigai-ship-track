import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Package, Users, Truck, UserCog, BarChart3, Settings, Menu, X, ChevronsLeft, ChevronsRight, Database, ChevronDown, ChevronRight, Wallet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

type MenuItemType = {
  label: string;
  icon: any;
  path?: string;
  subItems?: { label: string; icon: any; path: string; }[];
};

const menuItems: MenuItemType[] = [
  { label: 'Quản lý Lead', icon: ClipboardList, path: '/leads' },
  { label: 'Quản lý bưu kiện', icon: Package, path: '/parcels' },
  {
    label: 'Quản lý thông tin',
    icon: Database,
    subItems: [
      { label: 'Khách hàng', icon: Users, path: '/customers' },
      { label: 'Nhà vận chuyển', icon: Truck, path: '/carriers' },
      { label: 'Nhân viên', icon: UserCog, path: '/employees' },
      { label: 'Cập nhật chi tiêu', icon: Wallet, path: '/expenses' },
    ]
  },
  { label: 'Báo cáo', icon: BarChart3, path: '/reports' },
  { label: 'Cài đặt', icon: Settings, path: '/settings' },
];

const pageTitles: Record<string, string> = {
  '/leads': 'Quản lý Lead',
  '/parcels': 'Quản lý bưu kiện',
  '/customers': 'Khách hàng',
  '/carriers': 'Nhà vận chuyển',
  '/employees': 'Nhân viên',
  '/expenses': 'Cập nhật chi tiêu',
  '/reports': 'Báo cáo',
  '/settings': 'Cài đặt',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  
  const currentPath = location.pathname.startsWith('/leads/') ? '/leads' : location.pathname;
  const pageTitle = pageTitles[currentPath] || 'IKIGAI';

  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'staff') {
      return item.path !== '/reports' && item.path !== '/settings';
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi hệ thống");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-primary text-primary-foreground transition-all duration-300 lg:static lg:translate-x-0",
        collapsed ? "w-16" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className={cn("flex h-16 items-center px-4", collapsed ? "justify-center" : "justify-between px-6")}>
          {!collapsed && <span className="text-xl font-bold tracking-wider">IKIGAI TRACKING</span>}
          {collapsed && <span className="text-sm font-bold">IK</span>}
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {filteredMenuItems.map((item) => {
            if (item.subItems) {
              const isAnyActive = item.subItems.some(sub => currentPath === sub.path);
              const isExpanded = infoOpen || isAnyActive;
              
              const parentContent = (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false);
                      setInfoOpen(!infoOpen);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      isAnyActive && !isExpanded
                        ? "bg-accent/20 text-accent"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {!collapsed && (
                      <>
                         <span className="flex-1 text-left">{item.label}</span>
                         {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </>
                    )}
                  </button>
                  {(!collapsed && isExpanded) && (
                    <div className="pl-6 space-y-1">
                      {item.subItems.map(sub => {
                        const subActive = currentPath === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              subActive 
                                ? "bg-accent text-accent-foreground"
                                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                            )}
                          >
                            <sub.icon size={16} />
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {parentContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return parentContent;
            }

            const active = currentPath === item.path;
            const linkContent = (
              <Link
                key={item.path}
                to={item.path || '#'}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <item.icon size={18} />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.label || item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden border-t border-primary-foreground/10 lg:block">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex w-full items-center justify-center py-3 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="border-t border-primary-foreground/10 p-4">
            <p className="text-xs text-primary-foreground/50">© 2026 IKIGAI Logistics</p>
          </div>
        )}
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
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-700">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
