import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { formatVND } from '@/data/mockData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const mockExpenses = [
  { id: '1', date: '2026-03-25', category: 'Lương nhân viên', amount: 45000000, description: 'Lương tháng 3/2026', status: 'Đã thanh toán' },
  { id: '2', date: '2026-03-22', category: 'Vận chuyển nội địa', amount: 12500000, description: 'Phí vận chuyển từ kho đến sân bay', status: 'Đã thanh toán' },
  { id: '3', date: '2026-03-15', category: 'Marketing', amount: 8000000, description: 'Chạy quảng cáo Facebook Ads', status: 'Chờ duyệt' },
  { id: '4', date: '2026-03-10', category: 'Văn phòng phẩm', amount: 1500000, description: 'Mua giấy in và băng dính', status: 'Đã thanh toán' },
  { id: '5', date: '2026-03-05', category: 'Cước phí đối tác', amount: 56000000, description: 'Phí gửi EMS đợt 1 tháng 3', status: 'Chờ thanh toán' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('2026');
  
  // States for new expense form
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Văn phòng phẩm',
    amount: '',
    description: '',
    status: 'Chờ thanh toán'
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      ...newExpense,
      amount: parseInt(newExpense.amount)
    };

    setExpenses([newEntry, ...expenses]);
    setIsDialogOpen(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Văn phòng phẩm',
      amount: '',
      description: '',
      status: 'Chờ thanh toán'
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
                    <SelectItem value="Lương nhân viên">Lương nhân viên</SelectItem>
                    <SelectItem value="Vận chuyển nội địa">Vận chuyển nội địa</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Văn phòng phẩm">Văn phòng phẩm</SelectItem>
                    <SelectItem value="Cước phí đối tác">Cước phí đối tác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
             <Button variant="outline" size="sm">Lọc theo trạng thái</Button>
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
                  <th className="p-4 font-medium text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="p-4">{expense.date}</td>
                    <td className="p-4 font-medium">{expense.category}</td>
                    <td className="p-4 text-slate-500">{expense.description}</td>
                    <td className="p-4 text-right font-bold tracking-tight text-slate-700">
                      {expense.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant="secondary" 
                        className={
                          expense.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' :
                          expense.status === 'Chờ thanh toán' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }
                      >
                        {expense.status}
                      </Badge>
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
