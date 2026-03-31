import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Lead, STATUS_LABELS, STATUS_COLORS, formatVND, getNextStatus, calcShippingFee, Carrier } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const leads = useStore((s) => s.leads);
  const updateLeadStatus = useStore((s) => s.updateLeadStatus);
  const updateLead = useStore((s) => s.updateLead);
  const settings = useStore((s) => s.settings);

  // Get fresh lead from store
  const currentLead = leads.find((l) => l.id === lead.id) || lead;

  const [actualWeight, setActualWeight] = useState(currentLead.actualWeightKg || currentLead.weightKg);
  const [actualL, setActualL] = useState(currentLead.actualDimL || currentLead.dimL);
  const [actualW, setActualW] = useState(currentLead.actualDimW || currentLead.dimW);
  const [actualH, setActualH] = useState(currentLead.actualDimH || currentLead.dimH);
  const [carrier, setCarrier] = useState<Carrier>(currentLead.carrier || 'EMS');
  const [trackingCode, setTrackingCode] = useState(currentLead.trackingCode || '');
  const [shipDate, setShipDate] = useState<Date | undefined>(currentLead.shipDate ? new Date(currentLead.shipDate) : undefined);
  const [hasIssue, setHasIssue] = useState(currentLead.hasIssue || false);
  const [issueReason, setIssueReason] = useState(currentLead.issueReason || '');
  const [issueDesc, setIssueDesc] = useState(currentLead.issueDesc || '');
  const [issueSolution, setIssueSolution] = useState(currentLead.issueSolution || '');

  const nextStatus = getNextStatus(currentLead.status);

  const actualFee = useMemo(() => {
    return calcShippingFee(actualWeight, actualL, actualW, actualH, settings.priceMain, settings.priceSub, settings.surchargePerPkg, settings.maxKgPerPkg);
  }, [actualWeight, actualL, actualW, actualH, settings]);

  const handleWarehouseUpdate = () => {
    updateLead(currentLead.id, {
      actualWeightKg: actualWeight, actualDimL: actualL, actualDimW: actualW, actualDimH: actualH,
      totalFee: actualFee.total,
    });
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (currentLead.status === 'dang_van_chuyen') {
      updateLead(currentLead.id, { carrier, trackingCode, shipDate: shipDate?.toISOString().slice(0, 10) });
    }
    if (hasIssue) {
      updateLead(currentLead.id, { hasIssue, issueReason, issueDesc, issueSolution });
    }
    updateLeadStatus(currentLead.id, nextStatus);
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono">{currentLead.code}</span>
            <Badge className={`${STATUS_COLORS[currentLead.status]} text-primary-foreground`}>{STATUS_LABELS[currentLead.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-muted-foreground mb-1">Người gửi</h3>
              <p>{currentLead.senderName}</p>
              <p className="text-muted-foreground">{currentLead.senderPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground mb-1">Người nhận</h3>
              <p>{currentLead.receiverName}</p>
              <p className="text-muted-foreground">{currentLead.receiverAddress}</p>
              <p className="text-muted-foreground">{currentLead.receiverPhone}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div><span className="text-muted-foreground">Loại hàng:</span> {currentLead.itemType}</div>
            <div><span className="text-muted-foreground">Cân nặng:</span> {currentLead.weightKg} kg</div>
            <div><span className="text-muted-foreground">Thành tiền:</span> {formatVND(currentLead.totalFee)}</div>
          </div>

          {/* Warehouse update - only cho_xac_nhan */}
          {currentLead.status === 'cho_xac_nhan' && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Cập nhật kho</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Cân nặng thực tế (kg)</Label><Input type="number" value={actualWeight} onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Dài (cm)</Label><Input type="number" value={actualL} onChange={(e) => setActualL(parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Rộng (cm)</Label><Input type="number" value={actualW} onChange={(e) => setActualW(parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Cao (cm)</Label><Input type="number" value={actualH} onChange={(e) => setActualH(parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div className="rounded bg-secondary p-3 text-xs space-y-1">
                <p>Cân tính phí: <strong>{actualFee.chargeWeight} kg</strong> {actualFee.isVolumetric && '(thể tích)'}</p>
                <p className="font-bold">Tổng phí: {formatVND(actualFee.total)}</p>
              </div>
              <Button size="sm" onClick={handleWarehouseUpdate}>Xác nhận cập nhật</Button>
            </div>
          )}

          {/* Tracking - only dang_van_chuyen */}
          {currentLead.status === 'dang_van_chuyen' && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Tracking</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Hãng vận chuyển</Label>
                  <Select value={carrier} onValueChange={(v) => setCarrier(v as Carrier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMS">EMS</SelectItem>
                      <SelectItem value="DHL">DHL</SelectItem>
                      <SelectItem value="Sagawa">Sagawa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Mã tracking</Label><Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} /></div>
              </div>
              <div>
                <Label>Ngày xuất hàng</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !shipDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {shipDate ? format(shipDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={shipDate} onSelect={setShipDate} className="p-3 pointer-events-auto" /></PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Issues - from da_chot onwards */}
          {['da_chot', 'dang_van_chuyen', 'hoan_thanh'].includes(currentLead.status) && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Xử lý phát sinh</h3>
                <Switch checked={hasIssue} onCheckedChange={setHasIssue} />
              </div>
              {hasIssue && (
                <div className="space-y-3">
                  <div>
                    <Label>Nguyên nhân</Label>
                    <Select value={issueReason} onValueChange={setIssueReason}>
                      <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lỗi từ khách">Lỗi từ khách</SelectItem>
                        <SelectItem value="Lỗi nội bộ">Lỗi nội bộ</SelectItem>
                        <SelectItem value="Lỗi vận chuyển">Lỗi vận chuyển</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Mô tả vấn đề</Label><Textarea value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                  <div><Label>Cách xử lý</Label><Textarea value={issueSolution} onChange={(e) => setIssueSolution(e.target.value)} /></div>
                </div>
              )}
            </div>
          )}

          {/* Status history */}
          <div>
            <h3 className="font-semibold mb-2">Lịch sử trạng thái</h3>
            <div className="space-y-1">
              {currentLead.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{h.date}</span>
                  <Badge variant="outline" className="text-xs">{STATUS_LABELS[h.status]}</Badge>
                  {h.note && <span className="text-muted-foreground">— {h.note}</span>}
                </div>
              ))}
            </div>
          </div>

          {nextStatus && (
            <Button onClick={handleAdvanceStatus} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Chuyển sang "{STATUS_LABELS[nextStatus]}"
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
