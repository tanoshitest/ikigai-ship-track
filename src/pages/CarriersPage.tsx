import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatVND, STATUS_LABELS, STATUS_COLORS, Carrier } from '@/data/mockData';

const carriers: { name: Carrier; inTransit: number; completed: number; onTime: number; avgDays: number }[] = [
  { name: 'EMS', inTransit: 15, completed: 42, onTime: 94, avgDays: 8 },
  { name: 'DHL', inTransit: 12, completed: 35, onTime: 97, avgDays: 6 },
  { name: 'Sagawa', inTransit: 8, completed: 28, onTime: 91, avgDays: 10 },
];

export default function CarriersPage() {
  const leads = useStore((s) => s.leads);
  const [selected, setSelected] = useState<Carrier>('EMS');
  const carrierOrders = leads.filter((l) => l.carrier === selected && l.status === 'dang_van_chuyen');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {carriers.map((c) => (
          <Card
            key={c.name}
            className={`cursor-pointer transition-shadow hover:shadow-md ${selected === c.name ? 'ring-2 ring-accent' : ''}`}
            onClick={() => setSelected(c.name)}
          >
            <CardHeader className="pb-2"><CardTitle>{c.name}</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Đang vận chuyển: <strong>{c.inTransit}</strong></p>
              <p>Hoàn thành: <strong>{c.completed}</strong></p>
              <p>Giao đúng hạn: <strong className="text-status-shipping">{c.onTime}%</strong></p>
              <p>TB giao hàng: <strong>{c.avgDays} ngày</strong></p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Đơn đang vận chuyển qua {selected}</CardTitle></CardHeader>
        <CardContent>
          {carrierOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có đơn nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Mã đơn</th><th className="p-2">Khách hàng</th><th className="p-2">Tracking</th>
                  <th className="p-2">Ngày xuất</th><th className="p-2">Cân nặng</th><th className="p-2">Thành tiền</th>
                </tr></thead>
                <tbody>
                  {carrierOrders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="p-2 font-mono text-xs">{o.code}</td>
                      <td className="p-2">{o.senderName}</td>
                      <td className="p-2 font-mono text-xs">{o.trackingCode}</td>
                      <td className="p-2 text-muted-foreground">{o.shipDate}</td>
                      <td className="p-2">{o.weightKg} kg</td>
                      <td className="p-2">{formatVND(o.totalFee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
