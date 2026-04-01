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
import { Lead, STATUS_LABELS, STATUS_COLORS, formatVND, getNextStatus, calcShippingFee, Carrier, PackageDetail, getBoxFee, getTierPrice } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const leads = useStore((s) => s.leads);
  const updateLeadStatus = useStore((s) => s.updateLeadStatus);
  const updateLead = useStore((s) => s.updateLead);
  const settings = useStore((s) => s.settings);

  const currentLead = leads.find((l) => l.id === lead.id) || lead;

  const [actualWeight, setActualWeight] = useState(currentLead.actualWeightKg || currentLead.weightKg);
  
  // Local packages state for granular editing
  const [localPackages, setLocalPackages] = useState<PackageDetail[]>(currentLead.packages || []);
  const [isPaidLocal, setIsPaidLocal] = useState(currentLead.isPaid || false);

  const [carrier, setCarrier] = useState<Carrier>(currentLead.carrier || 'EMS');
  const [trackingCode, setTrackingCode] = useState(currentLead.trackingCode || '');
  const [shipDate, setShipDate] = useState<Date | undefined>(currentLead.shipDate ? new Date(currentLead.shipDate) : undefined);
  const [hasIssue, setHasIssue] = useState(currentLead.hasIssue || false);
  const [issueReason, setIssueReason] = useState(currentLead.issueReason || '');
  const [issueDesc, setIssueDesc] = useState(currentLead.issueDesc || '');
  const [issueSolution, setIssueSolution] = useState(currentLead.issueSolution || '');

  const nextStatus = getNextStatus(currentLead.status);

  // Initial split logic (only if localPackages is empty)
  useEffect(() => {
    if (localPackages.length === 0) {
      const result = calcShippingFee(actualWeight, 0, 0, 0, 0, 0, settings.surchargePerPkg, settings.maxKgPerPkg);
      setLocalPackages(result.packages);
    }
  }, [actualWeight, settings]);

  // Function to recalculate a specific package
  const updatePackage = (idx: number, updates: Partial<PackageDetail>) => {
    const updated = [...localPackages];
    const pkg = { ...updated[idx], ...updates };
    
    // Recalculate dimensions and charge weight
    const volWeight = (pkg.dimL * pkg.dimW * pkg.dimH) / 6000;
    pkg.volWeight = Math.round(volWeight * 100) / 100;
    pkg.chargeWeight = Math.max(pkg.weight, pkg.volWeight);
    
    // Recalculate fees
    const price = getTierPrice(pkg.chargeWeight);
    pkg.shippingFee = Math.round(pkg.chargeWeight * price);
    pkg.boxFee = pkg.hasPackingFee ? getBoxFee(pkg.chargeWeight) : 0;
    pkg.total = pkg.shippingFee + pkg.boxFee + pkg.surcharge;
    
    updated[idx] = pkg;
    setLocalPackages(updated);
  };

  const totalFeeValue = useMemo(() => {
    return localPackages.reduce((sum, p) => sum + p.total, 0);
  }, [localPackages]);

  const handleWarehouseUpdate = () => {
    updateLead(currentLead.id, {
      actualWeightKg: actualWeight, 
      packages: localPackages,
      totalFee: totalFeeValue,
    });
  };

  const handlePayment = () => {
    setIsPaidLocal(true);
    updateLead(currentLead.id, { isPaid: true });
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (currentLead.status === 'lead_moi' && !isPaidLocal) return; // Payment check

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
            {currentLead.status === 'lead_moi' && (
              <Badge variant={isPaidLocal ? "default" : "outline"} className={cn(isPaidLocal ? "bg-green-500" : "text-amber-600 border-amber-600")}>
                {isPaidLocal ? "Đã thanh toán" : "Chưa thanh toán"}
              </Badge>
            )}
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
          </div>

          {/* Main content */}
          <div className={cn("grid gap-6", isShipping ? "grid-cols-3" : isWarehouse ? "grid-cols-[1.2fr_1.8fr]" : "grid-cols-1")}>
            
            {/* Warehouse update Form */}
            {isWarehouse && (
              <div className="space-y-3">
                <div className="rounded-lg border p-3 space-y-4 bg-card">
                  <h3 className="font-bold text-xs flex items-center gap-2 border-b pb-2">
                    <Package className="w-3.5 h-3.5" />
                    Cập nhật tổng trọng lượng
                  </h3>
                  <div>
                    <Label className="text-xs mb-1.5 block">Tổng cân nặng thực tế (kg)</Label>
                    <div className="flex gap-2">
                      <Input 
                        className="h-10 text-base font-bold focus-visible:ring-primary" 
                        type="number" 
                        value={actualWeight} 
                        onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} 
                      />
                      <Button onClick={() => {
                        const result = calcShippingFee(actualWeight, 0, 0, 0, 0, 0, settings.surchargePerPkg, settings.maxKgPerPkg);
                        setLocalPackages(result.packages);
                      }} variant="secondary">Reset & Split</Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button size="lg" className="w-full text-sm font-bold" onClick={handleWarehouseUpdate}>
                      Lưu thông tin & Tính toán
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-primary/5 border-primary/20 space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tổng cộng đơn hàng</p>
                  <p className="text-3xl font-black text-primary">{formatVND(totalFeeValue)}</p>
                  <p className="text-xs text-muted-foreground">Phí vận chuyển cho {localPackages.length} kiện hàng</p>
                  
                  <div className="pt-2">
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      isPaidLocal ? "bg-green-50 border-green-500 text-green-700" : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                    )} onClick={() => {
                      const newVal = !isPaidLocal;
                      setIsPaidLocal(newVal);
                      updateLead(currentLead.id, { isPaid: newVal });
                    }}>
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center border-2 transition-all",
                        isPaidLocal ? "bg-green-500 border-green-500" : "bg-white border-muted-foreground/30"
                      )}>
                        {isPaidLocal && <CreditCard className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold uppercase", isPaidLocal ? "text-green-700" : "text-muted-foreground")}>
                          Đã thanh toán
                        </p>
                        <p className="text-[10px] opacity-70">
                          {isPaidLocal ? "Đã xác nhận thanh toán thành công" : "Tick vào đây nếu đã nhận thanh toán"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Package Breakdown List */}
            {isWarehouse && (
              <div className="rounded-lg border p-4 space-y-4 bg-muted/10">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Chi tiết từng kiện ({localPackages.length})</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {localPackages.map((pkg, idx) => (
                    <div key={idx} className="bg-card border rounded-lg p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Kiện #{idx + 1}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black">{pkg.chargeWeight} kg</span>
                            <span className="text-[10px] text-muted-foreground italic">(Tính theo: {pkg.chargeWeight === pkg.weight ? 'Cân nặng' : 'Quy đổi'})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary tracking-tight">{formatVND(pkg.total)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 border-y py-4 my-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Kích thước (Dài x Rộng x Cao)</Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <Input 
                              placeholder="D" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimL || ''} onChange={(e) => updatePackage(idx, { dimL: parseFloat(e.target.value) || 0 })} 
                            />
                            <Input 
                              placeholder="R" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimW || ''} onChange={(e) => updatePackage(idx, { dimW: parseFloat(e.target.value) || 0 })} 
                            />
                            <Input 
                              placeholder="C" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimH || ''} onChange={(e) => updatePackage(idx, { dimH: parseFloat(e.target.value) || 0 })} 
                            />
                          </div>
                          {pkg.volWeight > 0 && (
                            <p className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 mt-1 inline-block">
                              Quy đổi: {pkg.volWeight} kg (divisor: 6000)
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Vận chuyển:</span>
                            <span className="font-bold">{formatVND(pkg.shippingFee)}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b pb-1 mb-1">
                            <span className="text-muted-foreground">Phí tách kiện:</span>
                            <span className="font-bold">{formatVND(pkg.surcharge)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`pack-fee-${idx}`} className="text-[10px] font-bold cursor-pointer">Phí đóng gói (+{formatVND(getBoxFee(pkg.chargeWeight))})</Label>
                            <Checkbox 
                              id={`pack-fee-${idx}`} 
                              checked={pkg.hasPackingFee} 
                              onCheckedChange={(checked) => updatePackage(idx, { hasPackingFee: !!checked })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking & Issues */}
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
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Kết quả tách kiện đã lưu</h3>
                  <div className="space-y-1">
                    {currentLead.packages.map((pkg, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0 items-center">
                        <div>
                          <span className="font-medium">Kiện {idx + 1}:</span> {pkg.chargeWeight} kg
                          {pkg.dimL > 0 && <span className="text-[10px] text-muted-foreground block">({pkg.dimL}x{pkg.dimW}x{pkg.dimH})</span>}
                        </div>
                        <span className="font-bold">{formatVND(pkg.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {nextStatus && (
            <Button 
              onClick={handleAdvanceStatus} 
              disabled={isWarehouse && !isPaidLocal}
              className={cn(
                "w-full mt-5 font-bold h-12 shadow-lg transition-all gap-2",
                isWarehouse && !isPaidLocal ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white"
              )}
            >
              {isWarehouse && !isPaidLocal && <AlertCircle className="w-4 h-4" />}
              Chuyển sang "{STATUS_LABELS[nextStatus]}"
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
