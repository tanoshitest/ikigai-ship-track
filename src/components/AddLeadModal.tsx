import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import { LeadSource, ItemType, calcShippingFee, formatVND } from '@/data/mockData';

const SOURCES: LeadSource[] = ['Facebook', 'Zalo', 'TikTok', 'Website', 'Khác'];
const ITEM_TYPES: ItemType[] = ['Thực phẩm', 'Quần áo', 'Mỹ phẩm', 'Đồ điện tử', 'Khác'];

export default function AddLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addLead = useStore((s) => s.addLead);
  const settings = useStore((s) => s.settings);
  const [form, setForm] = useState({
    senderName: '', senderPhone: '', source: 'Facebook' as LeadSource,
    receiverName: '', receiverAddress: '', receiverPhone: '',
    itemType: 'Thực phẩm' as ItemType, weightKg: 0, dimL: 0, dimW: 0, dimH: 0,
  });

  const fee = useMemo(() => {
    if (form.weightKg > 0 && form.dimL > 0 && form.dimW > 0 && form.dimH > 0) {
      return calcShippingFee(form.weightKg, form.dimL, form.dimW, form.dimH, settings.priceMain, settings.priceSub, settings.surchargePerPkg, settings.maxKgPerPkg);
    }
    return null;
  }, [form.weightKg, form.dimL, form.dimW, form.dimH, settings]);

  const handleSubmit = () => {
    if (!form.senderName || !form.senderPhone) return;
    addLead(form);
    setForm({ senderName: '', senderPhone: '', source: 'Facebook', receiverName: '', receiverAddress: '', receiverPhone: '', itemType: 'Thực phẩm', weightKg: 0, dimL: 0, dimW: 0, dimH: 0 });
    onClose();
  };

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-5">
        <DialogHeader><DialogTitle>Thêm Lead mới</DialogTitle></DialogHeader>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {/* Col 1: Sender */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Thông tin người gửi</h3>
            <div><Label className="text-xs">Tên người gửi *</Label><Input className="h-8 text-sm" value={form.senderName} onChange={(e) => set('senderName', e.target.value)} /></div>
            <div><Label className="text-xs">Số điện thoại *</Label><Input className="h-8 text-sm" value={form.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} /></div>
            <div>
              <Label className="text-xs">Nguồn lead</Label>
              <Select value={form.source} onValueChange={(v) => set('source', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Col 2: Receiver */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Người nhận (Nhật Bản)</h3>
            <div><Label className="text-xs">Tên người nhận</Label><Input className="h-8 text-sm" value={form.receiverName} onChange={(e) => set('receiverName', e.target.value)} /></div>
            <div><Label className="text-xs">SĐT người nhận</Label><Input className="h-8 text-sm" value={form.receiverPhone} onChange={(e) => set('receiverPhone', e.target.value)} /></div>
            <div><Label className="text-xs">Địa chỉ nhận</Label><Textarea className="text-sm h-[68px] resize-none" value={form.receiverAddress} onChange={(e) => set('receiverAddress', e.target.value)} /></div>
          </div>

          {/* Col 3: Item */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Thông tin hàng hóa</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Loại hàng</Label>
                <Select value={form.itemType} onValueChange={(v) => set('itemType', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Cân nặng (kg)</Label><Input className="h-8 text-sm" type="number" min={0} value={form.weightKg || ''} onChange={(e) => set('weightKg', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Dài (cm)</Label><Input className="h-8 text-sm" type="number" min={0} value={form.dimL || ''} onChange={(e) => set('dimL', parseFloat(e.target.value) || 0)} /></div>
              <div><Label className="text-xs">Rộng (cm)</Label><Input className="h-8 text-sm" type="number" min={0} value={form.dimW || ''} onChange={(e) => set('dimW', parseFloat(e.target.value) || 0)} /></div>
              <div><Label className="text-xs">Cao (cm)</Label><Input className="h-8 text-sm" type="number" min={0} value={form.dimH || ''} onChange={(e) => set('dimH', parseFloat(e.target.value) || 0)} /></div>
            </div>
            {fee && (
              <div className="rounded bg-secondary p-2 text-xs space-y-0.5">
                <p>Cân tính phí: <strong>{fee.chargeWeight} kg</strong> {fee.isVolumetric && <span className="text-accent">(thể tích)</span>}</p>
                <p className="font-bold">Tổng phí: {formatVND(fee.total)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
          <Button size="sm" onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">Tạo Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
