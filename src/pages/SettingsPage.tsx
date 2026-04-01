import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatVND } from '@/data/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const storeSettings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [shippingTiers, setShippingTiers] = useState(storeSettings.shippingTiers);
  const [surcharge, setSurcharge] = useState(storeSettings.surchargePerPkg);
  const [maxKg, setMaxKg] = useState(storeSettings.maxKgPerPkg);
  const [boxFees, setBoxFees] = useState(storeSettings.boxFees);
  const [salesKPI, setSalesKPI] = useState(storeSettings.monthlySalesKPI);

  const handleSave = () => {
    updateSettings({
      shippingTiers,
      surchargePerPkg: surcharge,
      maxKgPerPkg: maxKg,
      boxFees,
      monthlySalesKPI: salesKPI,
    });
    toast.success('Đã lưu thay đổi thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Section 1: Shipping Price Tiers */}
        <Card className="h-full">
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              Bảng giá vận chuyển
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">Theo mốc cân</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {shippingTiers.map((tier, i) => (
                <div key={i} className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">{tier.min}–{tier.max} KG</Label>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">VND/KG</span>
                  </div>
                  <Input 
                    type="number" 
                    className="h-9 font-bold"
                    value={tier.price} 
                    onChange={(e) => {
                      const updated = [...shippingTiers];
                      updated[i] = { ...tier, price: Number(e.target.value) };
                      setShippingTiers(updated);
                    }} 
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Phụ phí ship / kiện</Label>
                <div className="relative">
                  <Input type="number" className="h-9 pr-10" value={surcharge} onChange={(e) => setSurcharge(Number(e.target.value))} />
                  <span className="absolute right-3 top-2 text-[10px] text-muted-foreground">VND</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Cân nặng tối đa / kiện</Label>
                <div className="relative">
                  <Input type="number" className="h-9 pr-10" value={maxKg} onChange={(e) => setMaxKg(Number(e.target.value))} />
                  <span className="absolute right-3 top-2 text-[10px] text-muted-foreground">Kg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Box Fees */}
        <Card className="h-full">
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              Phí thùng theo mức cân
              <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Phí cố định</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {boxFees.map((bf, i) => (
              <div key={i} className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/20">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">{bf.min}–{bf.max} KG</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="h-9 pr-10 font-bold"
                    value={bf.fee}
                    onChange={(e) => {
                      const updated = [...boxFees];
                      updated[i] = { ...bf, fee: Number(e.target.value) };
                      setBoxFees(updated);
                    }}
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-muted-foreground">VND</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 3: Sales KPI */}
        <Card className="h-full">
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              Thiết lập KPI doanh số
              <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Mục tiêu</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Mục tiêu doanh số tháng</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="h-10 pr-12 text-lg font-bold text-green-600"
                    value={salesKPI}
                    onChange={(e) => setSalesKPI(Number(e.target.value))}
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground font-bold">VND</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100 flex items-center justify-between">
                  <span className="text-[10px] text-green-700 font-bold uppercase">Định dạng hiển thị:</span>
                  <span className="text-sm font-bold text-green-700">{salesKPI.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 px-12 h-11 font-bold">
          Lưu tất cả thay đổi
        </Button>
      </div>
    </div>
  );
}
