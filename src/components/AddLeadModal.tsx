import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Thêm Lead mới</DialogTitle></DialogHeader>

        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Thông tin người gửi</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Tên người gửi *</Label><Input value={form.senderName} onChange={(e) => set('senderName', e.target.value)} /></div>
              <div><Label>Số điện thoại *</Label><Input value={form.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} /></div>
            </div>
            <div className="mt-3">
              <Label>Nguồn lead</Label>
              <Select value={form.source} onValueChange={(v) => set('source', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Thông tin người nhận (Nhật Bản)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Tên người nhận</Label><Input value={form.receiverName} onChange={(e) => set('receiverName', e.target.value)} /></div>
              <div><Label>SĐT người nhận</Label><Input value={form.receiverPhone} onChange={(e) => set('receiverPhone', e.target.value)} /></div>
            </div>
            <div className="mt-3"><Label>Địa chỉ nhận</Label><Textarea value={form.receiverAddress} onChange={(e) => set('receiverAddress', e.target.value)} /></div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Thông tin hàng hóa</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Loại hàng</Label>
                <Select value={form.itemType} onValueChange={(v) => set('itemType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cân nặng dự kiến (kg)</Label><Input type="number" min={0} value={form.weightKg || ''} onChange={(e) => set('weightKg', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div><Label>Dài (cm)</Label><Input type="number" min={0} value={form.dimL || ''} onChange={(e) => set('dimL', parseFloat(e.target.value) || 0)} /></div>
              <div><Label>Rộng (cm)</Label><Input type="number" min={0} value={form.dimW || ''} onChange={(e) => set('dimW', parseFloat(e.target.value) || 0)} /></div>
              <div><Label>Cao (cm)</Label><Input type="number" min={0} value={form.dimH || ''} onChange={(e) => set('dimH', parseFloat(e.target.value) || 0)} /></div>
            </div>
          </div>

          {fee && (
            <div className="rounded-lg bg-secondary p-4 text-sm space-y-1">
              <p>Cân nặng thực: <strong>{fee.weightKg} kg</strong></p>
              <p>Cân quy đổi thể tích: <strong>{fee.volWeight} kg</strong> ({form.dimL}×{form.dimW}×{form.dimH}/5000)</p>
              <p>→ Cân tính phí: <strong>{fee.chargeWeight} kg</strong> {fee.isVolumetric && <span className="text-accent">(Tính theo thể tích)</span>}</p>
              <hr className="my-2 border-border" />
              {!fee.needsSplit ? (
                <>
                  <p>Đơn giá: {formatVND(settings.priceMain)}/kg</p>
                  <p>Phí thùng: {formatVND(fee.boxFee)}</p>
                  <p className="text-base font-bold">Tổng phí vận chuyển: {formatVND(fee.total)}</p>
                </>
              ) : (
                <>
                  <p className="text-accent font-medium">⚠️ Cần tách kiện (tối đa {settings.maxKgPerPkg}kg/kiện)</p>
                  <p>Kiện 1: {fee.breakdown!.pkg1}kg × {formatVND(settings.priceMain)} = {formatVND(fee.breakdown!.pkg1Fee)}</p>
                  <p>Kiện 2: {fee.breakdown!.pkg2}kg × {formatVND(settings.priceSub)} = {formatVND(fee.breakdown!.pkg2Fee)}</p>
                  <p>Phí ship phát sinh: {formatVND(fee.breakdown!.surcharge)} ({formatVND(settings.surchargePerPkg)}/kiện × 2)</p>
                  <p>Phí thùng: {formatVND(fee.breakdown!.boxFee)}</p>
                  <p className="text-base font-bold">TỔNG CỘNG: {formatVND(fee.total)}</p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">Tạo Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
