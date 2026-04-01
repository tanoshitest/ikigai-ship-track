import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Plane, ShieldCheck, UserCircle2 } from 'lucide-react';
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
    <div className="min-h-screen w-full flex flex-col items-center justify-between py-12 px-4 relative overflow-hidden bg-[#0a2e26]">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Section */}
      <div className="z-10 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl animate-bounce-slow">
          <Plane className="text-emerald-400" size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">IKIGAI TRACKING</h1>
        <p className="text-emerald-200/60 font-medium tracking-wide uppercase text-xs">Hệ thống quản lý vận đơn Logistics chuyên nghiệp</p>
      </div>

      {/* Middle Section - Only 2 Login Buttons */}
      <div className="z-10 w-full max-w-sm space-y-4">
        <Button 
          variant="secondary"
          size="lg"
          className="w-full h-20 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md flex items-center justify-start px-8 gap-4 group transition-all duration-300 rounded-2xl"
          onClick={() => handleLogin('admin')}
          disabled={!!loading}
        >
          {loading === 'admin' ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto" />
          ) : (
            <>
              <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500 transition-colors duration-300">
                <ShieldCheck size={24} className="text-emerald-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">Quản trị viên</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Truy cập toàn hệ thống</div>
              </div>
            </>
          )}
        </Button>

        <Button 
          variant="secondary"
          size="lg"
          className="w-full h-20 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md flex items-center justify-start px-8 gap-4 group transition-all duration-300 rounded-2xl"
          onClick={() => handleLogin('staff')}
          disabled={!!loading}
        >
          {loading === 'staff' ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto" />
          ) : (
            <>
              <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500 transition-colors duration-300">
                <UserCircle2 size={24} className="text-emerald-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">Nhân viên</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Xử lý Lead & Bưu kiện</div>
              </div>
            </>
          )}
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="z-10 text-center">
        <p className="text-[11px] text-emerald-200/30 uppercase tracking-[0.2em] font-medium">
          © 2026 IKIGAI Logistics • Tanoshi Vietnam
        </p>
      </div>
    </div>
  );
}
