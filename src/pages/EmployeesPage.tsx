import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { EmployeeRole } from '@/data/mockData';

export default function EmployeesPage() {
  const employees = useStore((s) => s.employees);
  const addEmployee = useStore((s) => s.addEmployee);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Sale' as EmployeeRole, phone: '', email: '', active: true });

  const handleAdd = () => {
    if (!form.name) return;
    addEmployee(form);
    setForm({ name: '', role: 'Sale', phone: '', email: '', active: true });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus size={16} className="mr-1" /> Thêm nhân viên
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Tên</th><th className="p-3">Vai trò</th><th className="p-3">SĐT</th>
                <th className="p-3">Email</th><th className="p-3">Số đơn xử lý</th><th className="p-3">Trạng thái</th>
              </tr></thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3 font-medium">{e.name}</td>
                    <td className="p-3"><Badge variant="outline">{e.role}</Badge></td>
                    <td className="p-3 text-muted-foreground">{e.phone}</td>
                    <td className="p-3 text-muted-foreground">{e.email}</td>
                    <td className="p-3">{e.ordersHandled}</td>
                    <td className="p-3">
                      <Badge className={e.active ? 'bg-status-shipping text-primary-foreground' : 'bg-status-done text-primary-foreground'}>
                        {e.active ? 'Đang hoạt động' : 'Nghỉ'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm nhân viên</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as EmployeeRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Kho">Kho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
