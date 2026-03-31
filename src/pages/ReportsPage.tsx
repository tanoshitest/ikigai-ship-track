import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatVND } from '@/data/mockData';

const sourceData = [
  { source: 'Facebook', leads: 65, closed: 38, rate: 58, revenue: 98500000 },
  { source: 'Zalo', leads: 42, closed: 22, rate: 52, revenue: 62000000 },
  { source: 'TikTok', leads: 28, closed: 12, rate: 43, revenue: 35000000 },
  { source: 'Website', leads: 18, closed: 14, rate: 78, revenue: 42000000 },
  { source: 'Khác', leads: 12, closed: 5, rate: 42, revenue: 15000000 },
];

const monthlyData = [
  { month: 'T04/25', orders: 45, kg: 320, revenue: 125000000, change: 0 },
  { month: 'T05/25', orders: 52, kg: 380, revenue: 145000000, change: 16 },
  { month: 'T06/25', orders: 48, kg: 340, revenue: 135000000, change: -7 },
  { month: 'T07/25', orders: 60, kg: 420, revenue: 168000000, change: 24 },
  { month: 'T08/25', orders: 55, kg: 400, revenue: 155000000, change: -8 },
  { month: 'T09/25', orders: 65, kg: 460, revenue: 182000000, change: 17 },
  { month: 'T10/25', orders: 58, kg: 410, revenue: 162000000, change: -11 },
  { month: 'T11/25', orders: 72, kg: 510, revenue: 205000000, change: 27 },
  { month: 'T12/25', orders: 68, kg: 480, revenue: 195000000, change: -5 },
  { month: 'T01/26', orders: 75, kg: 530, revenue: 220000000, change: 13 },
  { month: 'T02/26', orders: 80, kg: 560, revenue: 235000000, change: 7 },
  { month: 'T03/26', orders: 85, kg: 600, revenue: 245000000, change: 4 },
];

export default function ReportsPage() {
  return (
    <Tabs defaultValue="source" className="space-y-4">
      <TabsList>
        <TabsTrigger value="source">Lead theo nguồn</TabsTrigger>
        <TabsTrigger value="monthly">Doanh số theo tháng</TabsTrigger>
      </TabsList>

      <TabsContent value="source" className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">So sánh lead theo nguồn</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(210, 53%, 24%)" name="Tổng lead" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" fill="hsl(25, 95%, 53%)" name="Đã chốt" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-3">Nguồn</th><th className="p-3">Số lead</th><th className="p-3">Đã chốt</th>
                  <th className="p-3">Tỷ lệ chuyển đổi</th><th className="p-3">Doanh thu</th>
                </tr></thead>
                <tbody>
                  {sourceData.map((s) => (
                    <tr key={s.source} className="border-b">
                      <td className="p-3 font-medium">{s.source}</td>
                      <td className="p-3">{s.leads}</td>
                      <td className="p-3">{s.closed}</td>
                      <td className="p-3">{s.rate}%</td>
                      <td className="p-3">{formatVND(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthly" className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh số 12 tháng gần nhất</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={{ r: 4 }} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-3">Tháng</th><th className="p-3">Số đơn</th><th className="p-3">Tổng kg</th>
                  <th className="p-3">Doanh thu</th><th className="p-3">So tháng trước</th>
                </tr></thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.month} className="border-b">
                      <td className="p-3 font-medium">{m.month}</td>
                      <td className="p-3">{m.orders}</td>
                      <td className="p-3">{m.kg}</td>
                      <td className="p-3">{formatVND(m.revenue)}</td>
                      <td className="p-3">
                        {m.change > 0 ? <span className="text-status-shipping">+{m.change}%</span> : m.change < 0 ? <span className="text-destructive">{m.change}%</span> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
