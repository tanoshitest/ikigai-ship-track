import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatVND } from '@/data/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const [priceMain, setPriceMain] = useState(settings.priceMain);
  const [priceSub, setPriceSub] = useState(settings.priceSub);
  const [surcharge, setSurcharge] = useState(settings.surchargePerPkg);
  const [maxKg, setMaxKg] = useState(settings.maxKgPerPkg);
  const [boxFees, setBoxFees] = useState(settings.boxFees);

  const handleSave = () => {
    toast.success('Đã lưu thay đổi thành công!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Bảng giá vận chuyển</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Giá/kg kiện chính (VNĐ)</Label>
              <Input type="number" value={priceMain} onChange={(e) => setPriceMain(Number(e.target.value))} />
            </div>
            <div>
              <Label>Giá/kg kiện phụ (VNĐ)</Label>
              <Input type="number" value={priceSub} onChange={(e) => setPriceSub(Number(e.target.value))} />
            </div>
            <div>
              <Label>Phí ship phát sinh/kiện (VNĐ)</Label>
              <Input type="number" value={surcharge} onChange={(e) => setSurcharge(Number(e.target.value))} />
            </div>
            <div>
              <Label>Cân nặng tối đa/kiện (kg)</Label>
              <Input type="number" value={maxKg} onChange={(e) => setMaxKg(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Phí thùng theo mức cân</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {boxFees.map((bf, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-24">{bf.min}–{bf.max} kg:</span>
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

      <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
        Lưu thay đổi
      </Button>
    </div>
  );
}
