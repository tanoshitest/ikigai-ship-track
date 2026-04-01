import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatVND } from '@/data/mockData';
import { useState } from 'react';

const sourceDataAll = [
  { source: 'Facebook', leads: 156, prospecting: 45, closed: 82, completed: 29, revenue: 245000000 },
  { source: 'Zalo', leads: 98, prospecting: 28, closed: 52, completed: 18, revenue: 156000000 },
  { source: 'TikTok', leads: 74, prospecting: 22, closed: 38, completed: 14, revenue: 112000000 },
  { source: 'Website', leads: 42, prospecting: 12, closed: 24, completed: 6, revenue: 68000000 },
  { source: 'Khác', leads: 25, prospecting: 5, closed: 15, completed: 5, revenue: 35000000 },
];

const sourceDataThisMonth = [
  { source: 'Facebook', leads: 85, prospecting: 25, closed: 45, completed: 15, revenue: 135000000 },
  { source: 'Zalo', leads: 55, prospecting: 15, closed: 30, completed: 10, revenue: 85000000 },
  { source: 'TikTok', leads: 40, prospecting: 12, closed: 20, completed: 8, revenue: 58000000 },
  { source: 'Website', leads: 22, prospecting: 8, closed: 10, completed: 4, revenue: 32000000 },
  { source: 'Khác', leads: 15, prospecting: 3, closed: 10, completed: 2, revenue: 18000000 },
];

const sourceDataLastMonth = [
  { source: 'Facebook', leads: 71, prospecting: 20, closed: 37, completed: 14, revenue: 110000000 },
  { source: 'Zalo', leads: 43, prospecting: 13, closed: 22, completed: 8, revenue: 71000000 },
  { source: 'TikTok', leads: 34, prospecting: 10, closed: 18, completed: 6, revenue: 54000000 },
  { source: 'Website', leads: 20, prospecting: 4, closed: 14, completed: 2, revenue: 36000000 },
  { source: 'Khác', leads: 10, prospecting: 2, closed: 5, completed: 3, revenue: 17000000 },
];

const monthlyData = [
  { month: 'T04/25', orders: 45, cost: 98000000, revenue: 125000000, kpi: 50, change: 0 },
  { month: 'T05/25', orders: 52, cost: 112000000, revenue: 145000000, kpi: 58, change: 16 },
  { month: 'T06/25', orders: 48, cost: 105000000, revenue: 135000000, kpi: 54, change: -7 },
  { month: 'T07/25', orders: 60, cost: 132000000, revenue: 168000000, kpi: 67, change: 24 },
  { month: 'T08/25', orders: 55, cost: 121000000, revenue: 155000000, kpi: 62, change: -8 },
  { month: 'T09/25', orders: 65, cost: 142000000, revenue: 182000000, kpi: 73, change: 17 },
  { month: 'T10/25', orders: 58, cost: 125000000, revenue: 162000000, kpi: 65, change: -11 },
  { month: 'T11/25', orders: 72, cost: 158000000, revenue: 205000000, kpi: 82, change: 27 },
  { month: 'T12/25', orders: 68, cost: 151000000, revenue: 195000000, kpi: 78, change: -5 },
  { month: 'T01/26', orders: 75, cost: 168000000, revenue: 220000000, kpi: 88, change: 13 },
  { month: 'T02/26', orders: 80, cost: 182000000, revenue: 235000000, kpi: 94, change: 7 },
  { month: 'T03/26', orders: 85, cost: 188000000, revenue: 245000000, kpi: 98, change: 4 },
];

export default function ReportsPage() {
  const [sourceMonth, setSourceMonth] = useState('all');
  
  const currentSourceData = sourceMonth === 'this_month' ? sourceDataThisMonth : 
                            sourceMonth === 'last_month' ? sourceDataLastMonth : 
                            sourceDataAll;

  return (
    <Tabs defaultValue="source" className="space-y-4">
      <TabsList>
        <TabsTrigger value="source">Lead theo nguồn</TabsTrigger>
        <TabsTrigger value="monthly">Doanh số theo tháng</TabsTrigger>
      </TabsList>

      <TabsContent value="source" className="space-y-4">
        {/* ... existing source content ... */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                Phân tích Lead chi tiết theo nguồn
                <Badge variant="outline" className="text-[10px] font-mono">Bản cập nhật mới</Badge>
              </div>
              <div className="w-[180px]">
                <Select value={sourceMonth} onValueChange={setSourceMonth}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="this_month">Tháng này</SelectItem>
                    <SelectItem value="last_month">Tháng trước</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={currentSourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  {currentSourceData.map((s) => (
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
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Doanh số & Chi tiêu 12 tháng gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} name="Doanh thu" />
                <Line type="monotone" dataKey="cost" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Chi tiêu" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-left text-muted-foreground uppercase tracking-wider font-bold">
                    <th className="p-4">Tháng</th>
                    <th className="p-4 text-center">Số đơn</th>
                    <th className="p-4 text-center">% Đạt KPI</th>
                    <th className="p-4 text-right">Tổng chi tiêu</th>
                    <th className="p-4 text-right">Doanh thu</th>
                    <th className="p-4 text-center">So tháng trước</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.month} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{m.month}</td>
                      <td className="p-4 text-center font-medium">{m.orders}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${m.kpi >= 90 ? 'bg-emerald-500' : m.kpi >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                              style={{ width: `${Math.min(100, m.kpi)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-600">{m.kpi}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-500">{formatVND(m.cost)}</td>
                      <td className="p-4 text-right font-bold text-slate-800">{formatVND(m.revenue)}</td>
                      <td className="p-4 text-center">
                        {m.change > 0 ? (
                          <span className="text-emerald-600 font-bold">+{m.change}%</span>
                        ) : m.change < 0 ? (
                          <span className="text-red-500 font-bold">{m.change}%</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
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
