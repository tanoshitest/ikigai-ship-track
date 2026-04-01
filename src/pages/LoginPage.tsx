import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserCircle2, GraduationCap as Ship } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (role: 'admin' | 'staff') => {
    setLoading(role);
    setTimeout(() => {
      login(role);
      toast.success(`Đăng nhập thành công với quyền ${role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}`);
      navigate('/leads');
      setLoading(null);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-sm z-10">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <Ship className="text-primary-foreground" size={24} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">IKIGAI TRACKING</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Hệ thống quản lý vận đơn Logistics chuyên nghiệp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline"
              size="lg"
              className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden"
              onClick={() => handleLogin('admin')}
              disabled={!!loading}
            >
              {loading === 'admin' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : (
                <>
                  <ShieldCheck size={28} className="text-primary group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-800">Đăng nhập Admin</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-1">Toàn quyền hệ thống</span>
                  </div>
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              size="lg"
              className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-accent hover:bg-accent/5 transition-all group relative overflow-hidden"
              onClick={() => handleLogin('staff')}
              disabled={!!loading}
            >
              {loading === 'staff' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
              ) : (
                <>
                  <UserCircle2 size={28} className="text-accent group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-800">Đăng nhập Nhân viên</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-1">Quản lý Lead & Bưu kiện</span>
                  </div>
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-slate-400">© 2026 IKIGAI Logistics. Developed by Tanoshi Vietnam.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
