import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { formatVND, EXPENSE_CATEGORIES, LeadSource } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const expenses = useStore((s) => s.expenses);
  const addExpense = useStore((s) => s.addExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('2026');
  
  // States for new expense form
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    description: '',
    leadSource: undefined as LeadSource | undefined,
    hours: '',
    rate: ''
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = newExpense.category === 'Nhân viên part-time' 
      ? Number(newExpense.hours) * Number(newExpense.rate)
      : parseInt(newExpense.amount);

    addExpense({
      date: newExpense.date,
      category: newExpense.category,
      amount: finalAmount,
      description: newExpense.description,
      leadSource: newExpense.leadSource
    });

    setIsDialogOpen(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: EXPENSE_CATEGORIES[0],
      amount: '',
      description: '',
      leadSource: undefined,
      hours: '',
      rate: ''
    });
    toast.success("Đã thêm khoản chi mới");
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesMonth = filterMonth === 'all' ? true : exp.date.split('-')[1] === filterMonth.padStart(2, '0');
    const matchesYear = filterYear === 'all' ? true : exp.date.startsWith(filterYear);
    return matchesMonth && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Cập nhật chi tiêu</h1>
          <div className="flex items-center gap-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                {[...Array(12)].map((_, i) => (
                   <SelectItem key={i+1} value={(i+1).toString()}>Tháng {i+1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">Năm 2026</SelectItem>
                <SelectItem value="2025">Năm 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus size={16} className="mr-2" /> Thêm khoản chi mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm khoản chi mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Ngày lập</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newExpense.date} 
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(val) => setNewExpense({...newExpense, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newExpense.category === 'Nhân viên part-time' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Số giờ làm</Label>
                    <Input 
                      type="number" 
                      placeholder="VD: 40" 
                      value={newExpense.hours} 
                      onChange={(e) => setNewExpense({...newExpense, hours: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Lương/giờ (VNĐ)</Label>
                    <Input 
                      type="number" 
                      placeholder="VD: 25000" 
                      value={newExpense.rate} 
                      onChange={(e) => setNewExpense({...newExpense, rate: e.target.value})} 
                    />
                  </div>
                  <div className="col-span-2 text-xs font-bold text-primary">
                    Thành tiền: {formatVND(Number(newExpense.hours) * Number(newExpense.rate))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Ví dụ: 500000" 
                    value={newExpense.amount} 
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} 
                  />
                </div>
              )}
              {newExpense.category === 'Marketing' && (
                <div className="grid gap-2">
                  <Label htmlFor="leadSource">Nguồn Lead (Chỉ cho Marketing)</Label>
                  <Select 
                    value={newExpense.leadSource} 
                    onValueChange={(val) => setNewExpense({...newExpense, leadSource: val as LeadSource})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Zalo">Zalo</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Input 
                  id="description" 
                  placeholder="Nhập lý do chi..." 
                  value={newExpense.description} 
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} 
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu khoản chi</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <Input placeholder="Tìm kiếm khoản chi..." className="max-w-xs" />
          <div className="flex gap-2">
             <Button variant="outline" size="sm">Lọc theo danh mục</Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Ngày lập</th>
                  <th className="p-4 font-medium">Danh mục</th>
                  <th className="p-4 font-medium">Mô tả chi tiết</th>
                  <th className="p-4 font-medium text-right">Số tiền (VNĐ)</th>
                  <th className="p-4 font-medium text-right w-10">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="p-4">{expense.date}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{expense.category}</span>
                        {expense.leadSource && (
                          <Badge variant="outline" className="w-fit text-[10px] py-0 h-4 bg-primary/5 text-primary border-primary/20">
                            {expense.leadSource}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{expense.description}</td>
                    <td className="p-4 text-right font-bold tracking-tight text-slate-700">
                      {expense.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          if (confirm('Xác nhận xoá khoản chi này?')) deleteExpense(expense.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
