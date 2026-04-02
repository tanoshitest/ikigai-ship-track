import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatVND, LeadSource, INCIDENT_PLANS, EXPENSE_CATEGORIES } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';

const sources: LeadSource[] = ['Facebook', 'Zalo', 'TikTok', 'Website', 'Khác'];

export default function ReportsPage() {
  const leads = useStore((s) => s.leads);
  const expenses = useStore((s) => s.expenses);
  
  const [sourceMonth, setSourceMonth] = useState('all');
  const [sourceYear, setSourceYear] = useState('2026');
  const [salesMonth, setSalesMonth] = useState('all');
  const [salesYear, setSalesYear] = useState('2026');
  
  const cplData = useMemo(() => sources.map(src => {
    const leadsCount = leads.filter(l => {
      const matchesMonth = sourceMonth === 'all' ? true : l.createdAt.split('-')[1] === sourceMonth.padStart(2, '0');
      const matchesYear = sourceYear === 'all' ? true : l.createdAt.startsWith(sourceYear);
      return l.source === src && matchesMonth && matchesYear;
    }).length;

    const adsSpend = expenses
      .filter(e => {
        const matchesMonth = sourceMonth === 'all' ? true : e.date.split('-')[1] === sourceMonth.padStart(2, '0');
        const matchesYear = sourceYear === 'all' ? true : e.date.startsWith(sourceYear);
        return e.category === 'Marketing' && e.leadSource === src && matchesMonth && matchesYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
       source: src,
       leads: leadsCount,
       spend: adsSpend,
       cpl: leadsCount > 0 ? adsSpend / leadsCount : 0
    };
  }), [leads, expenses, sourceMonth, sourceYear]);

  const cpaData = useMemo(() => sources.map(src => {
    const successfulLeadsCount = leads.filter(l => {
      const matchesMonth = sourceMonth === 'all' ? true : l.createdAt.split('-')[1] === sourceMonth.padStart(2, '0');
      const matchesYear = sourceYear === 'all' ? true : l.createdAt.startsWith(sourceYear);
      return l.source === src && l.status === 'hoan_thanh' && matchesMonth && matchesYear;
    }).length;

    const adsSpend = expenses
      .filter(e => {
        const matchesMonth = sourceMonth === 'all' ? true : e.date.split('-')[1] === sourceMonth.padStart(2, '0');
        const matchesYear = sourceYear === 'all' ? true : e.date.startsWith(sourceYear);
        return e.category === 'Marketing' && e.leadSource === src && matchesMonth && matchesYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
       source: src,
       successfulLeads: successfulLeadsCount,
       spend: adsSpend,
       cpa: successfulLeadsCount > 0 ? adsSpend / successfulLeadsCount : 0
    };
  }), [leads, expenses, sourceMonth, sourceYear]);

  const sourceData = useMemo(() => sources.map(src => {
    const srcLeads = leads.filter(l => l.source === src);
    return {
      source: src,
      leads: srcLeads.length,
      prospecting: srcLeads.filter(l => l.status === 'cho_xac_nhan').length,
      closed: srcLeads.filter(l => l.status === 'lead_moi').length,
      incident: srcLeads.filter(l => l.status === 'su_co').length,
      completed: srcLeads.filter(l => l.status === 'hoan_thanh').length,
      revenue: srcLeads.reduce((sum, l) => sum + l.totalFee, 0)
    };
  }), [leads]);

  const profitLossData = useMemo(() => {
    const months = [...Array(12)].map((_, i) => (i + 1).toString());
    const filteredMonths = salesMonth === 'all' ? months : [salesMonth];
    
    return filteredMonths.map(m => {
      const monthLeads = leads.filter(l => l.createdAt.split('-')[1] === m.padStart(2, '0') && l.createdAt.startsWith(salesYear));
      const monthExpenses = expenses.filter(e => e.date.split('-')[1] === m.padStart(2, '0') && e.date.startsWith(salesYear));
      
      const revenue = monthLeads.reduce((sum, l) => sum + l.totalFee, 0);
      const incidentCost = monthLeads.reduce((sum, l) => sum + (l.incidentCost || 0), 0);
      const shipperFees = monthLeads.reduce((sum, l) => sum + (l.shipperFee || 0), 0);
      const otherExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      const totalCost = otherExpenses + incidentCost + shipperFees;
      const profit = revenue - totalCost;
      
      return {
        month: `T${m.padStart(2, '0')}/${salesYear.slice(-2)}`,
        revenue,
        cost: totalCost,
        expenseAmount: otherExpenses + shipperFees,
        incidentAmount: incidentCost,
        profit,
        orders: monthLeads.length,
        incidentRate: monthLeads.length > 0 ? Math.round((monthLeads.filter(l => l.hasIssue).length / monthLeads.length) * 100) : 0
      };
    });
  }, [leads, expenses, salesYear, salesMonth]);

  return (
    <Tabs defaultValue="source" className="space-y-4">
      <TabsList>
        <TabsTrigger value="source">Lead theo nguồn</TabsTrigger>
        <TabsTrigger value="cpl">Báo cáo CPL</TabsTrigger>
        <TabsTrigger value="cpa">Báo cáo CPA</TabsTrigger>
        <TabsTrigger value="monthly">Lãi/Lỗ & KPI</TabsTrigger>
      </TabsList>

      <TabsContent value="source" className="space-y-4">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                Phân tích Lead chi tiết theo nguồn
                <Badge variant="outline" className="text-[10px] font-mono">Real-time</Badge>
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
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Phân tích chỉ số CPL chi tiết
                  <Badge className="bg-orange-500 hover:bg-orange-600 border-none text-[10px]">Real-time</Badge>
                </div>
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

      <TabsContent value="cpa" className="space-y-4">
        <Card className="border-none shadow-md overflow-hidden mt-2">
          <CardHeader className="bg-emerald-900 text-white p-4">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Phân tích chỉ số CPA (Chi phí / Đơn thành công)
                  <Badge className="bg-sky-500 hover:bg-sky-600 border-none text-[10px]">Conversion Focus</Badge>
                </div>
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-left text-muted-foreground uppercase tracking-widest text-[10px] font-black">
                    <th className="p-4">Nguồn Lead</th>
                    <th className="p-4 text-center">Số Lead Thành công</th>
                    <th className="p-4 text-right">Tổng chi phí Ads</th>
                    <th className="p-4 text-right">CPA thực tế</th>
                    <th className="p-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {cpaData.map((item) => (
                    <tr key={item.source} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{item.source}</td>
                      <td className="p-4 text-center font-black">{item.successfulLeads}</td>
                      <td className="p-4 text-right font-medium text-slate-500">{formatVND(item.spend)}</td>
                      <td className="p-4 text-right text-base font-black text-emerald-600">{formatVND(Math.round(item.cpa))}</td>
                      <td className="p-4 text-center">
                        {item.cpa === 0 ? (
                           <Badge variant="secondary" className="text-[10px]">N/A</Badge>
                        ) : item.cpa < 200000 ? (
                           <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">TỐI ƯU TỐT</Badge>
                        ) : item.cpa < 500000 ? (
                           <Badge className="bg-orange-500 text-white border-none text-[10px] font-bold">CHẤP NHẬN ĐC</Badge>
                        ) : (
                           <Badge className="bg-red-500 text-white border-none text-[10px] font-bold">CHI PHÍ CAO</Badge>
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
        <Card className="border-none shadow-md font-bold">
          <CardHeader>
            <CardTitle className="text-base font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Select value={salesMonth} onValueChange={setSalesMonth}>
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
                <Select value={salesYear} onValueChange={setSalesYear}>
                  <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitLossData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => formatVND(v)}
                />
                <Bar dataKey="revenue" fill="#f97316" name="Doanh thu" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenseAmount" fill="#94a3b8" name="Chi tiêu" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="incidentAmount" fill="#ef4444" name="Chi phí lỗi" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" fill="#10b981" name="Lợi nhuận" radius={[4, 4, 0, 0]} barSize={20} />
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
                    <th className="p-4 text-right">Chi tiêu</th>
                    <th className="p-4 text-right">Chi phí lỗi</th>
                    <th className="p-4 text-right">Doanh thu</th>
                    <th className="p-4 text-right">Lợi nhuận thực</th>
                  </tr>
                </thead>
                <tbody>
                  {profitLossData.map((m) => (
                    <tr key={m.month} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{m.month}</td>
                      <td className="p-4 text-center font-medium">{m.orders}</td>
                      <td className="p-4 text-center">
                        <Badge className={`${m.incidentRate > 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} border-none font-bold bg-opacity-10`}>
                          {m.incidentRate}%
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-500">{formatVND(m.expenseAmount)}</td>
                      <td className="p-4 text-right font-medium text-red-500">{formatVND(m.incidentAmount)}</td>
                      <td className="p-4 text-right font-bold text-slate-800">{formatVND(m.revenue)}</td>
                      <td className="p-4 text-right font-black text-primary">{formatVND(m.profit)}</td>
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
