import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatVND } from '@/data/mockData';

const sourceData = [
  { source: 'Facebook', leads: 156, prospecting: 45, closed: 82, completed: 29, revenue: 245000000 },
  { source: 'Zalo', leads: 98, prospecting: 28, closed: 52, completed: 18, revenue: 156000000 },
  { source: 'TikTok', leads: 74, prospecting: 22, closed: 38, completed: 14, revenue: 112000000 },
  { source: 'Website', leads: 42, prospecting: 12, closed: 24, completed: 6, revenue: 68000000 },
  { source: 'Khác', leads: 25, prospecting: 5, closed: 15, completed: 5, revenue: 35000000 },
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
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              Phân tích Lead chi tiết theo nguồn
              <Badge variant="outline" className="text-[10px] font-mono">Bản cập nhật mới</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" fill="#1e293b" name="Tổng lead" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="prospecting" fill="#94a3b8" name="Đang chăm sóc" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="closed" fill="#f97316" name="Đã chốt đơn" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="completed" fill="#10b981" name="Đã hoàn thành" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-left text-muted-foreground uppercase tracking-wider font-bold">
                    <th className="p-4">Nguồn lead</th>
                    <th className="p-4 text-center">Tổng lead</th>
                    <th className="p-4 text-center">Đang chăm sóc</th>
                    <th className="p-4 text-center">Đã chốt đơn</th>
                    <th className="p-4 text-center">Đã hoàn thành</th>
                    <th className="p-4 text-right">Doanh thu dự kiến</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceData.map((s) => (
                    <tr key={s.source} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-slate-700 underline decoration-accent/30 underline-offset-4">{s.source}</td>
                      <td className="p-4 text-center font-semibold text-slate-600">{s.leads}</td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">{s.prospecting}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none font-bold">{s.closed}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none font-bold">{s.completed}</Badge>
                      </td>
                      <td className="p-4 text-right font-bold text-accent">{formatVND(s.revenue)}</td>
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
