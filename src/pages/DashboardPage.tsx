import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS, formatVND } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';

const revenueData = [
  { month: 'T10', value: 180 },
  { month: 'T11', value: 210 },
  { month: 'T12', value: 195 },
  { month: 'T01', value: 220 },
  { month: 'T02', value: 235 },
  { month: 'T03', value: 245 },
];

const sourceData = [
  { name: 'Facebook', value: 45 },
  { name: 'Zalo', value: 28 },
  { name: 'TikTok', value: 22 },
  { name: 'Website', value: 18 },
  { name: 'Khác', value: 12 },
];

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f97316', '#8b5cf6'];

export default function DashboardPage() {
  const leads = useStore((s) => s.leads);
  const recentOrders = leads.slice(-5).reverse();

  const stats = [
    { label: 'Tổng Lead tháng này', value: '156', icon: Package, color: 'text-status-new' },
    { label: 'Vận chuyển nội địa', value: '42', icon: Truck, color: 'text-status-domestic' },
    { label: 'Hoàn thành', value: '98', icon: CheckCircle, color: 'text-status-done' },
    { label: 'Doanh thu tháng', value: '245.000.000 VNĐ', icon: DollarSign, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-secondary p-3 ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh số 6 tháng gần nhất (triệu VNĐ)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v} triệu`} />
                <Bar dataKey="value" fill="hsl(210, 53%, 24%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lead theo nguồn</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Đơn hàng gần đây</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Mã đơn</th>
                  <th className="pb-2 pr-4">Khách hàng</th>
                  <th className="pb-2 pr-4">Nguồn</th>
                  <th className="pb-2 pr-4">Trạng thái</th>
                  <th className="pb-2 pr-4">Cân nặng</th>
                  <th className="pb-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{o.code}</td>
                    <td className="py-3 pr-4">{o.senderName}</td>
                    <td className="py-3 pr-4">{o.source}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className={`${STATUS_COLORS[o.status]} text-primary-foreground text-xs`}>
                        {STATUS_LABELS[o.status]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{o.weightKg} kg</td>
                    <td className="py-3">{formatVND(o.totalFee)}</td>
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
