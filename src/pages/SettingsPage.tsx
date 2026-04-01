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

  const [priceMain, setPriceMain] = useState(storeSettings.priceMain);
  const [priceSub, setPriceSub] = useState(storeSettings.priceSub);
  const [surcharge, setSurcharge] = useState(storeSettings.surchargePerPkg);
  const [maxKg, setMaxKg] = useState(storeSettings.maxKgPerPkg);
  const [boxFees, setBoxFees] = useState(storeSettings.boxFees);
  const [salesKPI, setSalesKPI] = useState(storeSettings.monthlySalesKPI);

  const handleSave = () => {
    updateSettings({
      priceMain,
      priceSub,
      surchargePerPkg: surcharge,
      maxKgPerPkg: maxKg,
      boxFees,
      monthlySalesKPI: salesKPI,
    });
    toast.success('Đã lưu thay đổi thành công!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Bảng giá vận chuyển</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Giá/kg kiện chính (VNĐ)</Label>
              <Input type="number" value={priceMain} onChange={(e) => setPriceMain(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Giá/kg kiện phụ (VNĐ)</Label>
              <Input type="number" value={priceSub} onChange={(e) => setPriceSub(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phi phí ship phát sinh/kiện (VNĐ)</Label>
              <Input type="number" value={surcharge} onChange={(e) => setSurcharge(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cân nặng tối đa/kiện (kg)</Label>
              <Input type="number" value={maxKg} onChange={(e) => setMaxKg(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Phí thùng theo mức cân</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {boxFees.map((bf, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-24 font-medium">{bf.min}–{bf.max} kg:</span>
                <Input
                  type="number"
                  className="w-32"
                  value={bf.fee}
                  onChange={(e) => {
                    const updated = [...boxFees];
                    updated[i] = { ...bf, fee: Number(e.target.value) };
                    setBoxFees(updated);
                  }}
                />
                <span className="text-muted-foreground">VNĐ</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Thiết lập KPI doanh số</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mục tiêu doanh số tháng (VNĐ)</Label>
              <div className="flex items-center gap-3 text-sm">
                <Input
                  type="number"
                  className="max-w-[240px]"
                  value={salesKPI}
                  onChange={(e) => setSalesKPI(Number(e.target.value))}
                />
                <span className="text-muted-foreground font-medium">VNĐ</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gợi ý: {salesKPI.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
        Lưu thay đổi
      </Button>
    </div>
  );
}
