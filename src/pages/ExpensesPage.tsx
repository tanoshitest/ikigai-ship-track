import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { formatVND } from '@/data/mockData';

const mockExpenses = [
  { id: '1', date: '2026-03-25', category: 'Lương nhân viên', amount: 45000000, description: 'Lương tháng 3/2026', status: 'Đã thanh toán' },
  { id: '2', date: '2026-03-22', category: 'Vận chuyển nội địa', amount: 12500000, description: 'Phí vận chuyển từ kho đến sân bay', status: 'Đã thanh toán' },
  { id: '3', date: '2026-03-15', category: 'Marketing', amount: 8000000, description: 'Chạy quảng cáo Facebook Ads', status: 'Chờ duyệt' },
  { id: '4', date: '2026-03-10', category: 'Văn phòng phẩm', amount: 1500000, description: 'Mua giấy in và băng dính', status: 'Đã thanh toán' },
  { id: '5', date: '2026-03-05', category: 'Cước phí đối tác', amount: 56000000, description: 'Phí gửi EMS đợt 1 tháng 3', status: 'Chờ thanh toán' },
];

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Cập nhật chi tiêu</h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus size={16} className="mr-2" /> Thêm khoản chi mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng chi tiêu tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatVND(123000000)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatVND(59000000)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatVND(64000000)}</div>
          </CardContent>
        </Card>
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
                {mockExpenses.map((expense) => (
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
