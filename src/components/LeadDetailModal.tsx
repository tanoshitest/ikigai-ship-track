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
    if (currentLead.status === 'van_chuyen_noi_dia' || currentLead.status === 'dang_bay') {
      updateLead(currentLead.id, { carrier, trackingCode, shipDate: shipDate?.toISOString().slice(0, 10) });
    }
    if (hasIssue) {
      updateLead(currentLead.id, { hasIssue, issueReason, issueDesc, issueSolution });
    }
    updateLeadStatus(currentLead.id, nextStatus);
  };

  const isShipping = currentLead.status === 'van_chuyen_noi_dia' || currentLead.status === 'dang_bay';
  const isWarehouse = currentLead.status === 'lead_moi';

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className={cn("p-5", isShipping ? "max-w-5xl" : "max-w-4xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{currentLead.code}</span>
            <Badge className={`${STATUS_COLORS[currentLead.status]} text-primary-foreground text-xs`}>{STATUS_LABELS[currentLead.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">
          {/* Top info row */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-xs text-muted-foreground">Người gửi</span>
              <p className="font-medium">{currentLead.senderName}</p>
              <p className="text-xs text-muted-foreground">{currentLead.senderPhone}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Người nhận</span>
              <p className="font-medium">{currentLead.receiverName}</p>
              <p className="text-xs text-muted-foreground">{currentLead.receiverAddress}</p>
              <p className="text-xs text-muted-foreground">{currentLead.receiverPhone}</p>
            </div>
          </div>

          <div className="flex gap-6 text-xs mb-3">
            <span><span className="text-muted-foreground">Loại hàng:</span> {currentLead.itemType}</span>
            <span><span className="text-muted-foreground">Cân nặng:</span> {currentLead.weightKg} kg</span>
            <span><span className="text-muted-foreground">Thành tiền:</span> {formatVND(currentLead.totalFee)}</span>
          </div>

          {/* Main content - horizontal layout */}
          <div className={cn("grid gap-4", isShipping ? "grid-cols-3" : isWarehouse ? "grid-cols-2" : "grid-cols-1")}>
            {/* Warehouse update */}
            {isWarehouse && (
              <div className="rounded-lg border p-3 space-y-2">
                <h3 className="font-semibold text-xs">Cập nhật thực tế</h3>
                <div><Label className="text-xs">Cân nặng thực tế (kg)</Label><Input className="h-8 text-sm" type="number" value={actualWeight} onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Dài (cm)</Label><Input className="h-8 text-sm" type="number" value={actualL} onChange={(e) => setActualL(parseFloat(e.target.value) || 0)} /></div>
                  <div><Label className="text-xs">Rộng (cm)</Label><Input className="h-8 text-sm" type="number" value={actualW} onChange={(e) => setActualW(parseFloat(e.target.value) || 0)} /></div>
                  <div><Label className="text-xs">Cao (cm)</Label><Input className="h-8 text-sm" type="number" value={actualH} onChange={(e) => setActualH(parseFloat(e.target.value) || 0)} /></div>
                </div>
                <div className="rounded bg-secondary p-2 text-xs space-y-0.5">
                  <p>Cân tính phí: <strong>{actualFee.chargeWeight} kg</strong> {actualFee.isVolumetric && '(thể tích)'}</p>
                  <p className="font-bold">Tổng phí: {formatVND(actualFee.total)}</p>
                </div>
                <Button size="sm" className="w-full" onClick={handleWarehouseUpdate}>Xác nhận cập nhật</Button>
              </div>
            )}

            {/* Tracking */}
            {isShipping && (
              <div className="rounded-lg border p-3 space-y-2">
                <h3 className="font-semibold text-xs">Tracking</h3>
                <div>
                  <Label className="text-xs">Hãng vận chuyển</Label>
                  <Select value={carrier} onValueChange={(v) => setCarrier(v as Carrier)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMS">EMS</SelectItem>
                      <SelectItem value="DHL">DHL</SelectItem>
                      <SelectItem value="Sagawa">Sagawa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Mã tracking</Label><Input className="h-8 text-sm" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} /></div>
                <div>
                  <Label className="text-xs">Ngày xuất hàng</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-8 justify-start text-left text-sm", !shipDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {shipDate ? format(shipDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={shipDate} onSelect={setShipDate} className="p-3 pointer-events-auto" /></PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Issues */}
            {isShipping && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs">Xử lý phát sinh</h3>
                  <Switch checked={hasIssue} onCheckedChange={setHasIssue} />
                </div>
                {hasIssue && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Nguyên nhân</Label>
                      <Select value={issueReason} onValueChange={setIssueReason}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lỗi từ khách">Lỗi từ khách</SelectItem>
                          <SelectItem value="Lỗi nội bộ">Lỗi nội bộ</SelectItem>
                          <SelectItem value="Lỗi vận chuyển">Lỗi vận chuyển</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Mô tả</Label><Textarea className="text-sm h-14 resize-none" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                    <div><Label className="text-xs">Cách xử lý</Label><Textarea className="text-sm h-14 resize-none" value={issueSolution} onChange={(e) => setIssueSolution(e.target.value)} /></div>
                    <Button size="sm" className="w-full" onClick={() => updateLead(currentLead.id, { hasIssue, issueReason, issueDesc, issueSolution })}>Lưu phát sinh</Button>
                  </div>
                )}
              </div>
            )}

            {/* Status history */}
            <div className={cn(isShipping ? "" : "")}>
              <h3 className="font-semibold text-xs mb-1">Lịch sử trạng thái</h3>
              <div className="space-y-0.5">
                {currentLead.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{h.date}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{STATUS_LABELS[h.status]}</Badge>
                    {h.note && <span className="text-muted-foreground">— {h.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {nextStatus && (
            <Button onClick={handleAdvanceStatus} className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90">
              Chuyển sang "{STATUS_LABELS[nextStatus]}"
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
