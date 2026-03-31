import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatVND, LeadSource } from '@/data/mockData';
import { Search } from 'lucide-react';

const SOURCES: (LeadSource | 'all')[] = ['all', 'Facebook', 'Zalo', 'TikTok', 'Website', 'Khác'];

export default function CustomersPage() {
  const customers = useStore((s) => s.customers);
  const leads = useStore((s) => s.leads);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchSource = sourceFilter === 'all' || c.source === sourceFilter;
    return matchSearch && matchSource;
  });

  const selected = customers.find((c) => c.id === selectedId);
  const selectedOrders = selected ? leads.filter((l) => l.senderName === selected.name) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Tìm tên hoặc SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as LeadSource | 'all')}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SOURCES.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'Tất cả nguồn' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3">Tên</th><th className="p-3">SĐT</th><th className="p-3">Nguồn</th>
                  <th className="p-3">Số đơn</th><th className="p-3">Tổng chi tiêu</th><th className="p-3">Đơn gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedId(c.id)}>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.phone}</td>
                    <td className="p-3"><Badge variant="outline">{c.source}</Badge></td>
                    <td className="p-3">{c.orderCount}</td>
                    <td className="p-3">{formatVND(c.totalSpent)}</td>
                    <td className="p-3 text-muted-foreground">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader><SheetTitle>{selected.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="space-y-1">
                  <p><span className="text-muted-foreground">SĐT:</span> {selected.phone}</p>
                  <p><span className="text-muted-foreground">Nguồn:</span> {selected.source}</p>
                  <p><span className="text-muted-foreground">Tổng đơn:</span> {selected.orderCount}</p>
                  <p><span className="text-muted-foreground">Tổng chi tiêu:</span> {formatVND(selected.totalSpent)}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Đơn hàng</h4>
                  {selectedOrders.length === 0 ? (
                    <p className="text-muted-foreground">Không có đơn hàng</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrders.map((o) => (
                        <div key={o.id} className="rounded border p-2">
                          <p className="font-mono text-xs">{o.code}</p>
                          <p className="text-xs text-muted-foreground">{o.itemType} — {o.weightKg}kg — {formatVND(o.totalFee)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
