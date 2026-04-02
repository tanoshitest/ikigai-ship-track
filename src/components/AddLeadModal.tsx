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
  const employees = useStore((s) => s.employees);
  
  const [form, setForm] = useState({
    senderName: '', 
    senderPhone: '', 
    senderAddress: '',
    source: 'Facebook' as LeadSource,
    notes: '',
    assignedTo: '',
  });

  const salesStaff = useMemo(() => 
    employees.filter(e => e.role === 'Sale' || e.role === 'Admin'),
    [employees]
  );

  const handleSubmit = () => {
    if (!form.senderName || !form.senderPhone) return;
    
    // Provide default empty/0 values for the rest of the Lead interface requirements
    const newLeadData = {
      ...form,
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      itemType: 'Khác' as ItemType,
      weightKg: 0,
      dimL: 0,
      dimW: 0,
      dimH: 0,
    };
    
    addLead(newLeadData as any);
    
    setForm({ 
      senderName: '', 
      senderPhone: '', 
      senderAddress: '',
      source: 'Facebook', 
      notes: '',
      assignedTo: '',
    });
    onClose();
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader><DialogTitle>Thêm Lead mới</DialogTitle></DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Sale chăm sóc</Label>
            <Select value={form.assignedTo} onValueChange={(v) => set('assignedTo', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
              <SelectContent>
                {salesStaff.map((e) => (
                  <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tên khách hàng *</Label>
            <Input className="h-9 text-sm" value={form.senderName} onChange={(e) => set('senderName', e.target.value)} placeholder="Nhập họ tên" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Số điện thoại *</Label>
            <Input className="h-9 text-sm" value={form.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} placeholder="090..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Địa chỉ</Label>
            <Input className="h-9 text-sm" value={form.senderAddress} onChange={(e) => set('senderAddress', e.target.value)} placeholder="Nhập địa chỉ" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ghi chú</Label>
            <Textarea className="text-sm min-h-[80px] resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ghi chú thêm về khách hàng..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90 px-6">Tạo Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
