import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatVND } from '@/data/mockData';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

export default function SettingsPage() {
  const storeSettings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [shippingTiers, setShippingTiers] = useState(storeSettings.shippingTiers);
  const [surcharge, setSurcharge] = useState(storeSettings.surchargePerPkg);
  const [maxKg, setMaxKg] = useState(storeSettings.maxKgPerPkg);
  const [boxFees, setBoxFees] = useState(storeSettings.boxFees);
  const [salesKPI, setSalesKPI] = useState(storeSettings.monthlySalesKPI);
  const [consultStatuses, setConsultStatuses] = useState(storeSettings.consultStatuses || []);
  const [collectStatuses, setCollectStatuses] = useState(storeSettings.collectStatuses || []);
  const [newConsultStatus, setNewConsultStatus] = useState('');
  const [newCollectStatus, setNewCollectStatus] = useState('');

  const handleSave = () => {
    updateSettings({
      shippingTiers,
      surchargePerPkg: surcharge,
      maxKgPerPkg: maxKg,
      boxFees,
      monthlySalesKPI: salesKPI,
      consultStatuses,
      collectStatuses,
    });
    toast.success('Đã lưu thay đổi thành công!');
  };

  const addStatus = (type: 'consult' | 'collect') => {
    if (type === 'consult') {
      if (!newConsultStatus.trim()) return;
      setConsultStatuses([...consultStatuses, newConsultStatus.trim()]);
      setNewConsultStatus('');
    } else {
      if (!newCollectStatus.trim()) return;
      setCollectStatuses([...collectStatuses, newCollectStatus.trim()]);
      setNewCollectStatus('');
    }
  };

  const removeStatus = (type: 'consult' | 'collect', index: number) => {
    if (type === 'consult') {
      setConsultStatuses(consultStatuses.filter((_, i) => i !== index));
    } else {
      setCollectStatuses(collectStatuses.filter((_, i) => i !== index));
    }
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

        <div className="space-y-6">
          {/* Section 3: Sales KPI */}
          <Card>
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

          {/* Section 4: Consult Statuses */}
          <Card>
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Tình trạng Lead (Round 1)
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">Consult</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {consultStatuses.map((status, i) => (
                  <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 text-[11px] font-medium border-slate-200">
                    {status}
                    <button onClick={() => removeStatus('consult', i)} className="p-0.5 rounded-full hover:bg-slate-300 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Thêm tình trạng..." 
                  className="h-9 text-xs"
                  value={newConsultStatus}
                  onChange={(e) => setNewConsultStatus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStatus('consult')}
                />
                <Button onClick={() => addStatus('consult')} size="sm" variant="outline" className="h-9 w-9 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Collect Statuses */}
          <Card>
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Trạng thái vận hành (Round 2)
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">States</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {collectStatuses.map((status, i) => (
                  <Badge key={i} variant="outline" className="pl-3 pr-1 py-1 flex items-center gap-1 text-[11px] font-medium bg-slate-50">
                    {status}
                    <button onClick={() => removeStatus('collect', i)} className="p-0.5 rounded-full hover:bg-slate-300 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Thêm trạng thái..." 
                  className="h-9 text-xs"
                  value={newCollectStatus}
                  onChange={(e) => setNewCollectStatus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStatus('collect')}
                />
                <Button onClick={() => addStatus('collect')} size="sm" variant="outline" className="h-9 w-9 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 px-12 h-11 font-bold">
          Lưu tất cả thay đổi
        </Button>
      </div>
    </div>
  );
}
