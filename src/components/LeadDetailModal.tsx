import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead, STATUS_LABELS, STATUS_COLORS, formatVND, getNextStatus, calcShippingFee, Carrier, PackageDetail, getBoxFee } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, AlertCircle } from 'lucide-react';
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
  
  // Local packages state for editing
  const [localPackages, setLocalPackages] = useState<PackageDetail[]>(currentLead.packages || []);

  const [carrier, setCarrier] = useState<Carrier>(currentLead.carrier || 'EMS');
  const [trackingCode, setTrackingCode] = useState(currentLead.trackingCode || '');
  const [shipDate, setShipDate] = useState<Date | undefined>(currentLead.shipDate ? new Date(currentLead.shipDate) : undefined);
  const [hasIssue, setHasIssue] = useState(currentLead.hasIssue || false);
  const [issueReason, setIssueReason] = useState(currentLead.issueReason || '');
  const [issueDesc, setIssueDesc] = useState(currentLead.issueDesc || '');
  const [issueSolution, setIssueSolution] = useState(currentLead.issueSolution || '');

  const nextStatus = getNextStatus(currentLead.status);

  // Recalculate packages when weight/dims change
  const calcResult = useMemo(() => {
    return calcShippingFee(actualWeight, actualL, actualW, actualH, settings.priceMain, settings.priceSub, settings.surchargePerPkg, settings.maxKgPerPkg);
  }, [actualWeight, actualL, actualW, actualH, settings]);

  // Sync localPackages with calcResult when they change, but preserve user toggles if weights match
  useEffect(() => {
    if (!currentLead.packages) {
      setLocalPackages(calcResult.packages);
    }
  }, [calcResult.packages, currentLead.packages]);

  // Handle packing fee toggle
  const togglePackingFee = (idx: number) => {
    const newPkgs = [...calcResult.packages];
    // We need to use the split logic's packages but override the fee selection
    // Wait, it's easier to just maintain a list of toggles
  };

  // Re-calculate everything based on checkboxes
  const [packingFeeSelections, setPackingFeeSelections] = useState<boolean[]>([]);

  useEffect(() => {
    if (packingFeeSelections.length !== calcResult.packages.length) {
      setPackingFeeSelections(calcResult.packages.map(() => true));
    }
  }, [calcResult.packages.length]);

  const finalPackages = useMemo(() => {
    return calcResult.packages.map((p, idx) => {
      const hasFee = packingFeeSelections[idx] ?? true;
      const boxFee = hasFee ? getBoxFee(p.weight) : 0;
      return {
        ...p,
        hasPackingFee: hasFee,
        boxFee,
        total: p.shippingFee + boxFee + (calcResult.packages.length > 1 ? settings.surchargePerPkg : 0)
      };
    });
  }, [calcResult.packages, packingFeeSelections, settings.surchargePerPkg]);

  const totalFeeValue = useMemo(() => {
    return finalPackages.reduce((sum, p) => sum + p.total, 0);
  }, [finalPackages]);

  const handleWarehouseUpdate = () => {
    updateLead(currentLead.id, {
      actualWeightKg: actualWeight, 
      actualDimL: actualL, 
      actualDimW: actualW, 
      actualDimH: actualH,
      packages: finalPackages,
      totalFee: totalFeeValue,
    });
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (currentLead.status === 'dang_bay') {
      updateLead(currentLead.id, { carrier, trackingCode, shipDate: shipDate?.toISOString().slice(0, 10) });
    }
    if (hasIssue) {
      updateLead(currentLead.id, { hasIssue, issueReason, issueDesc, issueSolution });
    }
    updateLeadStatus(currentLead.id, nextStatus);
  };

  const isShipping = currentLead.status === 'dang_bay';
  const isWarehouse = currentLead.status === 'lead_moi';

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className={cn("p-8 overflow-y-auto max-h-[95vh]", "max-w-6xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{currentLead.code}</span>
            <Badge className={`${STATUS_COLORS[currentLead.status]} text-primary-foreground text-xs`}>{STATUS_LABELS[currentLead.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">
          {/* Top info row */}
          <div className="grid grid-cols-2 gap-4 mb-3 border-b pb-3">
            <div>
              <span className="text-xs text-muted-foreground">Người gửi</span>
              <p className="font-medium text-sm">{currentLead.senderName}</p>
              <p className="text-xs text-muted-foreground">{currentLead.senderPhone}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Người nhận</span>
              <p className="font-medium text-sm">{currentLead.receiverName}</p>
              <p className="text-xs text-muted-foreground">{currentLead.receiverAddress}</p>
              <p className="text-xs text-muted-foreground">{currentLead.receiverPhone}</p>
            </div>
          </div>

          <div className="flex gap-6 text-xs mb-3 bg-muted/30 p-2 rounded">
            <span><span className="text-muted-foreground">Loại hàng:</span> {currentLead.itemType}</span>
            <span><span className="text-muted-foreground">Cân nặng gốc:</span> {currentLead.weightKg} kg</span>
            <span><span className="text-muted-foreground">Kích thước gốc:</span> {currentLead.dimL}x{currentLead.dimW}x{currentLead.dimH} cm</span>
          </div>

          {/* Main content */}
          <div className={cn("grid gap-6", isShipping ? "grid-cols-3" : isWarehouse ? "grid-cols-[1.2fr_1fr]" : "grid-cols-1")}>
            
            {/* Warehouse update Form */}
            {isWarehouse && (
              <div className="space-y-3">
                <div className="rounded-lg border p-3 space-y-2 bg-card">
                  <h3 className="font-bold text-xs flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Nhập thông tin thực tế
                  </h3>
                  <div>
                    <Label className="text-xs mb-1.5 block">Cân nặng thực tế (kg)</Label>
                    <Input 
                      className="h-8 text-sm focus-visible:ring-primary" 
                      type="number" 
                      value={actualWeight} 
                      onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs mb-1.5 block">Dài (cm)</Label><Input className="h-8 text-sm" type="number" value={actualL} onChange={(e) => setActualL(parseFloat(e.target.value) || 0)} /></div>
                    <div><Label className="text-xs mb-1.5 block">Rộng (cm)</Label><Input className="h-8 text-sm" type="number" value={actualW} onChange={(e) => setActualW(parseFloat(e.target.value) || 0)} /></div>
                    <div><Label className="text-xs mb-1.5 block">Cao (cm)</Label><Input className="h-8 text-sm" type="number" value={actualH} onChange={(e) => setActualH(parseFloat(e.target.value) || 0)} /></div>
                  </div>
                  
                  {calcResult.isVolumetric && (
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-1 rounded border border-amber-100">
                      <AlertCircle className="w-3 h-3" />
                      Sử dụng cân nặng quy đổi thể tích: {calcResult.volWeight} kg
                    </div>
                  )}

                  <div className="pt-2">
                    <Button size="sm" className="w-full text-xs" onClick={handleWarehouseUpdate}>Xác nhận & Tính toán</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-primary/5 border-primary/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Tổng cộng dự kiến</p>
                  <p className="text-lg font-bold text-primary">{formatVND(totalFeeValue)}</p>
                  <p className="text-[10px] text-muted-foreground">Cho {finalPackages.length} kiện hàng</p>
                </div>
              </div>
            )}

            {/* Package Breakdown List */}
            {isWarehouse && (
              <div className="rounded-lg border p-3 space-y-2 bg-muted/10">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Chi tiết tách kiện ({finalPackages.length})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {finalPackages.map((pkg, idx) => (
                    <div key={idx} className="bg-card border rounded p-3 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-bold font-mono">KIỆN #{idx + 1}</p>
                          <p className="text-sm font-semibold">{pkg.weight} kg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-primary">{formatVND(pkg.total)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t text-[11px]">
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex justify-between">
                            <span>Vận chuyển:</span>
                            <span className="font-medium text-foreground">{formatVND(pkg.shippingFee)}</span>
                          </p>
                          <p className="text-muted-foreground flex justify-between">
                            <span>Phí tách kiện:</span>
                            <span className="font-medium text-foreground">{formatVND(finalPackages.length > 1 ? settings.surchargePerPkg : 0)}</span>
                          </p>
                        </div>
                        <div className="flex flex-col justify-end items-end space-y-1">
                          <div className="flex items-center space-x-2 bg-secondary/50 px-2 py-1 rounded">
                            <Checkbox 
                              id={`pack-fee-${idx}`} 
                              checked={packingFeeSelections[idx]} 
                              onCheckedChange={(checked) => {
                                const newSels = [...packingFeeSelections];
                                newSels[idx] = !!checked;
                                setPackingFeeSelections(newSels);
                              }}
                            />
                            <label 
                              htmlFor={`pack-fee-${idx}`}
                              className="text-[10px] font-medium leading-none cursor-pointer"
                            >
                              Phí đóng gói {pkg.boxFee > 0 && `(+${formatVND(pkg.boxFee)})`}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking & Issues (Moved to dang_bay in previous turns) */}
            {isShipping && (
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 font-semibold text-xs space-y-2">
                  <h3 className="font-bold flex items-center gap-2 border-b pb-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Thông tin Tracking
                  </h3>
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

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 border-b pb-1 justify-between">
                    <h3 className="font-bold text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Xử lý phát sinh
                    </h3>
                    <Switch checked={hasIssue} onCheckedChange={setHasIssue} />
                  </div>
                  {hasIssue && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-300">
                      <div>
                        <Label className="text-xs font-semibold">Nguyên nhân</Label>
                        <Select value={issueReason} onValueChange={setIssueReason}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lỗi từ khách">Lỗi từ khách</SelectItem>
                            <SelectItem value="Lỗi nội bộ">Lỗi nội bộ</SelectItem>
                            <SelectItem value="Lỗi vận chuyển">Lỗi vận chuyển</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs font-semibold">Mô tả</Label><Textarea className="text-xs h-12 resize-none" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                      <div><Label className="text-xs font-semibold">Cách xử lý</Label><Textarea className="text-xs h-12 resize-none" value={issueSolution} onChange={(e) => setIssueSolution(e.target.value)} /></div>
                      <Button size="sm" variant="secondary" className="w-full text-xs h-7" onClick={() => updateLead(currentLead.id, { hasIssue, issueReason, issueDesc, issueSolution })}>Lưu phát sinh</Button>
                    </div>
                  )}
                  {!hasIssue && <p className="text-xs text-muted-foreground italic text-center py-4">Chưa có phát sinh nào</p>}
                </div>
              </div>
            )}

            {/* Status history & Other info */}
            <div className={cn(!isShipping && !isWarehouse ? "col-span-1" : "")}>
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Lịch sử trạng thái</h3>
              <div className="space-y-1.5 border-l-2 border-muted pl-4 ml-1">
                {currentLead.statusHistory.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/30 border-2 border-background" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">{h.date}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{STATUS_LABELS[h.status]}</Badge>
                        {h.note && <span className="text-[10px] text-muted-foreground line-clamp-1">— {h.note}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentLead.packages && currentLead.packages.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Kết quả tách kiện</h3>
                  <div className="space-y-1">
                    {currentLead.packages.map((pkg, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0">
                        <span>Kiện {idx + 1}: {pkg.weight} kg</span>
                        <span className="font-semibold">{formatVND(pkg.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {nextStatus && (
            <Button onClick={handleAdvanceStatus} className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 shadow-lg">
              Chuyển sang "{STATUS_LABELS[nextStatus]}"
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
