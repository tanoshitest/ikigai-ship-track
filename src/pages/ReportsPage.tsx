import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatVND, initialLeads, initialExpenses, LeadSource } from '@/data/mockData';
import { useState } from 'react';

const sources: LeadSource[] = ['Facebook', 'Zalo', 'TikTok', 'Website', 'Khác'];

const monthlyData = [
  { month: 'T04/25', orders: 45, incidentRate: 12, cost: 98000000, revenue: 125000000, kpi: 50, change: 0 },
  { month: 'T05/25', orders: 52, incidentRate: 8, cost: 112000000, revenue: 145000000, kpi: 58, change: 16 },
  { month: 'T06/25', orders: 48, incidentRate: 15, cost: 105000000, revenue: 135000000, kpi: 54, change: -7 },
  { month: 'T07/25', orders: 60, incidentRate: 5, cost: 132000000, revenue: 168000000, kpi: 67, change: 24 },
  { month: 'T08/25', orders: 55, incidentRate: 10, cost: 121000000, revenue: 155000000, kpi: 62, change: -8 },
  { month: 'T09/25', orders: 65, incidentRate: 7, cost: 142000000, revenue: 182000000, kpi: 73, change: 17 },
  { month: 'T10/25', orders: 58, incidentRate: 14, cost: 125000000, revenue: 162000000, kpi: 65, change: -11 },
  { month: 'T11/25', orders: 72, incidentRate: 6, cost: 158000000, revenue: 205000000, kpi: 82, change: 27 },
  { month: 'T12/25', orders: 68, incidentRate: 9, cost: 151000000, revenue: 195000000, kpi: 78, change: -5 },
  { month: 'T01/26', orders: 75, incidentRate: 4, cost: 168000000, revenue: 220000000, kpi: 88, change: 13 },
  { month: 'T02/26', orders: 80, incidentRate: 3, cost: 182000000, revenue: 235000000, kpi: 94, change: 7 },
  { month: 'T03/26', orders: 85, incidentRate: 5, cost: 188000000, revenue: 245000000, kpi: 98, change: 4 },
];

export default function ReportsPage() {
  const [sourceMonth, setSourceMonth] = useState('all');
  const [sourceYear, setSourceYear] = useState('2026');
  
  const [salesYear, setSalesYear] = useState('2026');
  
  const cplData = sources.map(src => {
    const leadsCount = initialLeads.filter(l => l.source === src).length;
    const adsSpend = initialExpenses
      .filter(e => e.category === 'Marketing' && e.leadSource === src)
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
       source: src,
       leads: leadsCount,
       spend: adsSpend,
       cpl: leadsCount > 0 ? adsSpend / leadsCount : 0
    };
  });

  const sourceData = sources.map(src => {
    const leads = initialLeads.filter(l => l.source === src);
    return {
      source: src,
      leads: leads.length,
      prospecting: leads.filter(l => l.status === 'cho_xac_nhan').length,
      closed: leads.filter(l => l.status === 'lead_moi').length,
      incident: leads.filter(l => l.status === 'su_co').length,
      completed: leads.filter(l => l.status === 'hoan_thanh').length,
      revenue: leads.reduce((sum, l) => sum + l.totalFee, 0)
    };
  });

  const currentMonthlyData = monthlyData.filter(m => {
    const yearStr = salesYear === 'all' ? null : `/${salesYear.slice(-2)}`;
    return yearStr ? m.month.endsWith(yearStr) : true;
  });

  return (
    <Tabs defaultValue="source" className="space-y-4">
      <TabsList>
        <TabsTrigger value="source">Lead theo nguồn</TabsTrigger>
        <TabsTrigger value="cpl">Báo cáo CPL</TabsTrigger>
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
              <div className="flex items-center gap-2">
                <Select value={sourceMonth} onValueChange={setSourceMonth}>
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
                <Select value={sourceYear} onValueChange={setSourceYear}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="Chọn năm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">Năm 2026</SelectItem>
                    <SelectItem value="2025">Năm 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Bar dataKey="incident" fill="#ef4444" name="Sự cố" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="completed" fill="#10b981" name="Đã hoàn thành" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cpl" className="space-y-4">
        <Card className="border-none shadow-md overflow-hidden mt-2">
          <CardHeader className="bg-slate-900 text-white p-4">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               Phân tích chỉ số CPL chi tiết
               <Badge className="bg-orange-500 hover:bg-orange-600 border-none text-[10px]">Real-time</Badge>
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-left text-muted-foreground uppercase tracking-widest text-[10px] font-black">
                    <th className="p-4">Nguồn Lead</th>
                    <th className="p-4 text-center">Số lượng Lead</th>
                    <th className="p-4 text-right">Tổng chi phí Ads</th>
                    <th className="p-4 text-right">CPL thực tế</th>
                    <th className="p-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {cplData.map((item) => (
                    <tr key={item.source} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{item.source}</td>
                      <td className="p-4 text-center font-black">{item.leads}</td>
                      <td className="p-4 text-right font-medium text-slate-500">{formatVND(item.spend)}</td>
                      <td className="p-4 text-right text-base font-black text-primary">{formatVND(Math.round(item.cpl))}</td>
                      <td className="p-4 text-center">
                        {item.cpl === 0 ? (
                           <Badge variant="secondary" className="text-[10px]">N/A</Badge>
                        ) : item.cpl < 100000 ? (
                           <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">HIỆU QUẢ CAO</Badge>
                        ) : item.cpl < 250000 ? (
                           <Badge className="bg-orange-500 text-white border-none text-[10px] font-bold">TRUNG BÌNH</Badge>
                        ) : (
                           <Badge className="bg-red-500 text-white border-none text-[10px] font-bold">CẦN TỐI ƯU</Badge>
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

      <TabsContent value="monthly" className="space-y-4">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span>Doanh số và chi tiêu của năm {salesYear}</span>
              <div className="flex items-center gap-2">
                <Select value={salesYear} onValueChange={setSalesYear}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Chọn năm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">Năm 2026</SelectItem>
                    <SelectItem value="2025">Năm 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} tick={{ fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => formatVND(v)}
                />
                <Bar dataKey="revenue" fill="#f97316" name="Doanh thu" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="cost" fill="#94a3b8" name="Chi tiêu" radius={[4, 4, 0, 0]} barSize={20} />
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
                    <th className="p-4">Tháng</th>
                    <th className="p-4 text-center">Số đơn</th>
                    <th className="p-4 text-center">% Sự cố</th>
                    <th className="p-4 text-center">% Đạt KPI</th>
                    <th className="p-4 text-right">Tổng chi tiêu</th>
                    <th className="p-4 text-right">Doanh thu</th>
                    <th className="p-4 text-center">So tháng trước</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthlyData.map((m) => (
                    <tr key={m.month} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{m.month}</td>
                      <td className="p-4 text-center font-medium">{m.orders}</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none font-bold bg-opacity-10">
                          {m.incidentRate}%
                        </Badge>
                      </td>
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
