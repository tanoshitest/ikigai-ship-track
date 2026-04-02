import { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead, STATUS_LABELS, STATUS_COLORS, formatVND, getNextStatus, calcShippingFee, Carrier, PackageDetail, getBoxFee, getTierPrice, INCIDENT_PLANS } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, AlertCircle, CreditCard, ChevronRight, Camera, X, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeadReceipt } from './LeadReceipt';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

export default function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const leads = useStore((s) => s.leads);
  const updateLeadStatus = useStore((s) => s.updateLeadStatus);
  const updateLead = useStore((s) => s.updateLead);
  const settings = useStore((s) => s.settings);

  const currentLead = leads.find((l) => l.id === lead.id) || lead;

  const [isPaidLocal, setIsPaidLocal] = useState(currentLead.isPaid || false);
  const [shipperFeeLocal, setShipperFeeLocal] = useState(currentLead.shipperFee || 0);
  const [actualWeight, setActualWeight] = useState(currentLead.actualWeightKg || currentLead.weightKg);
  
  // Local packages state for granular editing
  const [localPackages, setLocalPackages] = useState<PackageDetail[]>(currentLead.packages || []);

  const [carrier, setCarrier] = useState<Carrier>(currentLead.carrier || 'EMS');
  const [trackingCode, setTrackingCode] = useState(currentLead.trackingCode || '');
  const [shipDate, setShipDate] = useState<Date | undefined>(currentLead.shipDate ? new Date(currentLead.shipDate) : undefined);
  const [hasIssue, setHasIssue] = useState(currentLead.hasIssue || false);
  const [issueReason, setIssueReason] = useState(currentLead.issueReason || '');
  const [issueDesc, setIssueDesc] = useState(currentLead.issueDesc || '');
  const [issueSolution, setIssueSolution] = useState(currentLead.issueSolution || '');
  const [incidentPlan, setIncidentPlan] = useState<Lead['incidentPlan']>(currentLead.incidentPlan);
  const [incidentCost, setIncidentCost] = useState<number>(currentLead.incidentCost || 0);
  
  // History editing states
  const [editingHistoryIdx, setEditingHistoryIdx] = useState<number | null>(null);
  const [tempIncidentError, setTempIncidentError] = useState('');
  const [tempIncidentSolution, setTempIncidentSolution] = useState('');

  const nextStatus = getNextStatus(currentLead.status);
  const isShipping = currentLead.status === 'dang_bay';
  const isWarehouse = currentLead.status === 'lead_moi' || currentLead.status === 'cho_xac_nhan';

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempInfo, setTempInfo] = useState({
    senderName: currentLead.senderName,
    senderPhone: currentLead.senderPhone,
    senderAddress: currentLead.senderAddress || '',
    receiverName: currentLead.receiverName,
    receiverAddress: currentLead.receiverAddress,
    receiverPhone: currentLead.receiverPhone,
    source: currentLead.source || 'Facebook',
    notes: currentLead.notes || '',
    assignedTo: currentLead.assignedTo || '',
    itemType: currentLead.itemType,
  });

  const targetRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDF(targetRef, {
        filename: `Hoadon_Ikigai_${currentLead.code}.pdf`,
        resolution: Resolution.HIGH,
        page: {
          margin: Margin.MEDIUM,
        },
        canvas: {
          mimeType: 'image/jpeg',
          qualityRatio: 1
        }
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
    const volWeight = Math.ceil((pkg.dimL * pkg.dimW * pkg.dimH) / 6000);
    pkg.volWeight = volWeight;
    pkg.chargeWeight = Math.max(pkg.weight, pkg.volWeight);
    
    // Recalculate fees
    const price = getTierPrice(pkg.chargeWeight);
    pkg.shippingFee = Math.round(pkg.chargeWeight * price);
    pkg.boxFee = pkg.hasPackingFee ? getBoxFee(pkg.chargeWeight) : 0;
    pkg.total = pkg.shippingFee + pkg.boxFee + pkg.surcharge;
    
    updated[idx] = pkg;
    setLocalPackages(updated);
  };

  const handleImageUpload = (pkgIdx: number, file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updated = [...localPackages];
        const pkg = { ...updated[pkgIdx] };
        const imgs = pkg.images || [];
        if (imgs.length < 3) {
          pkg.images = [...imgs, base64];
          updated[pkgIdx] = pkg;
          setLocalPackages(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (pkgIdx: number, imgIdx: number) => {
    const updated = [...localPackages];
    const pkg = { ...updated[pkgIdx] };
    const imgs = pkg.images || [];
    pkg.images = imgs.filter((_, i) => i !== imgIdx);
    updated[pkgIdx] = pkg;
    setLocalPackages(updated);
  };

  const totalFeeValue = useMemo(() => {
    return localPackages.reduce((sum, p) => sum + p.total, 0);
  }, [localPackages]);

  const addNewPackage = () => {
    const defaultPackage: PackageDetail = {
      weight: 0,
      dimL: 0,
      dimW: 0,
      dimH: 0,
      volWeight: 0,
      chargeWeight: 0,
      hasPackingFee: true,
      boxFee: 0,
      shippingFee: 0,
      surcharge: settings.surchargePerPkg,
      total: settings.surchargePerPkg,
      images: [],
    };
    setLocalPackages([...localPackages, defaultPackage]);
  };

  const removePackage = (idx: number) => {
    if (confirm('Bạn có chắc chắn muốn xoá kiện hàng này?')) {
      setLocalPackages(localPackages.filter((_, i) => i !== idx));
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (isWarehouse) {
      updateLead(currentLead.id, {
        actualWeightKg: actualWeight, 
        packages: localPackages,
        totalFee: totalFeeValue,
        shipperFee: shipperFeeLocal,
      });
    }
  }, [actualWeight, localPackages, totalFeeValue, shipperFeeLocal, currentLead.id, isWarehouse, updateLead]);

  const handlePayment = () => {
    const newVal = !isPaidLocal;
    setIsPaidLocal(newVal);
    updateLead(currentLead.id, { isPaid: newVal });
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (currentLead.status === 'lead_moi' && !isPaidLocal) return; // Payment check

    if (currentLead.status === 'dang_bay') {
      updateLead(currentLead.id, { carrier, trackingCode, shipDate: shipDate?.toISOString().slice(0, 10) });
    }
    if (hasIssue) {
      updateLead(currentLead.id, { 
        hasIssue, 
        issueReason, 
        issueDesc, 
        issueSolution,
        incidentPlan,
        incidentCost: Number(incidentCost)
      });
    }
    updateLeadStatus(currentLead.id, nextStatus);
  };


  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className={cn("p-8 overflow-y-auto max-h-[95vh]", "max-w-6xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{currentLead.code}</span>
            <Badge className={`${STATUS_COLORS[currentLead.status]} text-primary-foreground text-xs`}>{STATUS_LABELS[currentLead.status]}</Badge>
            {(currentLead.status === 'lead_moi' || currentLead.status === 'van_chuyen_noi_dia') && (
              <Badge variant={isPaidLocal ? "default" : "outline"} className={cn(isPaidLocal ? "bg-green-500" : "text-amber-600 border-amber-600")}>
                {isPaidLocal ? "Đã thanh toán" : "Chưa thanh toán"}
              </Badge>
            )}
            <div className="flex-1" />
            <Button 
              variant={isEditingInfo ? "default" : "outline"} 
              size="sm" 
              className="h-8 text-xs gap-2"
              onClick={() => {
                if (isEditingInfo) {
                  updateLead(currentLead.id, tempInfo);
                }
                setIsEditingInfo(!isEditingInfo);
              }}
            >
              {isEditingInfo ? "Lưu thay đổi" : "Cập nhật thông tin"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">
          {/* Top info row */}
          <div className="grid grid-cols-2 gap-4 mb-3 border-b pb-3">
            <div>
              <span className="text-xs text-muted-foreground">Người gửi</span>
              {isEditingInfo ? (
                <div className="space-y-2 mt-1">
                  <Input className="h-7 text-xs" value={tempInfo.senderName} onChange={(e) => setTempInfo({...tempInfo, senderName: e.target.value})} placeholder="Tên người gửi" />
                  <Input className="h-7 text-xs" value={tempInfo.senderPhone} onChange={(e) => setTempInfo({...tempInfo, senderPhone: e.target.value})} placeholder="SĐT người gửi" />
                  <Input className="h-7 text-xs" value={tempInfo.senderAddress} onChange={(e) => setTempInfo({...tempInfo, senderAddress: e.target.value})} placeholder="Địa chỉ gửi" />
                </div>
              ) : (
                <div className="mt-1">
                  <p className="font-bold text-slate-900">{currentLead.senderName}</p>
                  <p className="text-xs text-muted-foreground">{currentLead.senderPhone} | {currentLead.senderAddress || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Người nhận</span>
              {isEditingInfo ? (
                <div className="space-y-2 mt-1">
                  <Input className="h-7 text-xs" value={tempInfo.receiverName} onChange={(e) => setTempInfo({...tempInfo, receiverName: e.target.value})} placeholder="Tên người nhận" />
                  <Input className="h-7 text-xs" value={tempInfo.receiverPhone} onChange={(e) => setTempInfo({...tempInfo, receiverPhone: e.target.value})} placeholder="SĐT người nhận" />
                  <Input className="h-7 text-xs" value={tempInfo.receiverAddress} onChange={(e) => setTempInfo({...tempInfo, receiverAddress: e.target.value})} placeholder="Địa chỉ nhận" />
                </div>
              ) : (
                <div className="mt-1">
                  <p className="font-bold text-slate-900">{currentLead.receiverName}</p>
                  <p className="text-xs text-muted-foreground">{currentLead.receiverPhone} | {currentLead.receiverAddress}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-b mb-6 bg-slate-50/50 p-3 rounded-lg">
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Nguồn Lead:</span> 
                {isEditingInfo ? (
                  <Select 
                    value={tempInfo.source} 
                    onValueChange={(val) => setTempInfo({...tempInfo, source: val as any})}
                  >
                    <SelectTrigger className="h-7 w-32 border-none bg-background shadow-sm text-xs px-2">
                      <SelectValue placeholder="Chọn nguồn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Zalo">Zalo</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">{currentLead.source}</Badge>
                )}
              </span>
              <span className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-semibold">Sale chăm sóc:</span>
                {isEditingInfo ? (
                  <Select 
                    value={tempInfo.assignedTo} 
                    onValueChange={(val) => setTempInfo({...tempInfo, assignedTo: val})}
                  >
                    <SelectTrigger className="h-7 w-32 border-none bg-background shadow-sm text-xs px-2">
                      <SelectValue placeholder="Chọn sale" />
                    </SelectTrigger>
                    <SelectContent>
                      {useStore.getState().employees
                        .filter(e => e.role === 'Sale' || e.role === 'Admin')
                        .map(e => (
                          <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">{currentLead.assignedTo}</span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-semibold">Ghi chú:</span>
              {isEditingInfo ? (
                <Textarea 
                  className="text-xs min-h-[60px] bg-background border-none shadow-sm resize-none" 
                  value={tempInfo.notes} 
                  onChange={(e) => setTempInfo({...tempInfo, notes: e.target.value})} 
                  placeholder="Nhập ghi chú cho đơn hàng..."
                />
              ) : (
                <p className="text-xs text-muted-foreground/90 italic leading-relaxed">
                  {currentLead.notes || 'Không có ghi chú.'}
                </p>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className={cn("grid gap-6", isShipping ? "grid-cols-3" : isWarehouse ? "grid-cols-[1.2fr_1.8fr]" : "grid-cols-1")}>
            
            {/* Warehouse update Form */}
            {isWarehouse && (
              <div className="space-y-6">
                <div className="rounded-lg border p-4 bg-muted/20 space-y-4">
                  <h3 className="font-bold text-xs flex items-center gap-2 border-b pb-2 text-primary/70 uppercase tracking-widest">
                    <Package className="w-3.5 h-3.5" />
                    Kho cập nhật
                  </h3>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block">Cân nặng thực tế (kg)</Label>
                      <div className="flex gap-2">
                        <Input 
                          className="h-9 text-base font-bold focus-visible:ring-primary bg-background" 
                          type="number" 
                          value={actualWeight} 
                          onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} 
                        />
                        <Button 
                          onClick={() => {
                            const result = calcShippingFee(actualWeight, 0, 0, 0, 0, 0, settings.surchargePerPkg, settings.maxKgPerPkg);
                            setLocalPackages(result.packages);
                          }} 
                          variant="secondary"
                          className="h-9 text-[10px] font-bold"
                        >
                          TÁCH KIỆN LẠI
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block">Phí Shipper thực tế (VND)</Label>
                      <Input 
                        className="h-9 text-base font-bold text-amber-600 focus-visible:ring-amber-500 bg-amber-50/30" 
                        type="number" 
                        value={shipperFeeLocal || 0} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setShipperFeeLocal(val);
                        }} 
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-emerald-50/30 border-emerald-500/20 space-y-4">
                  <div>
                    <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1">Dự tính Lãi/Lỗ đơn hàng</p>
                    <div className="flex justify-between items-baseline">
                       <p className="text-2xl font-black text-emerald-700">
                         {formatVND(totalFeeValue - (shipperFeeLocal || 0) - (Number(incidentCost) || 0))}
                       </p>
                       <Badge className="bg-emerald-500 text-[10px] border-none font-bold">Lãi dự kiến</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-emerald-500/10">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">Doanh thu khách:</span>
                      <span className="text-emerald-700">{formatVND(totalFeeValue)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">Phí Shipper:</span>
                      <span className="text-rose-600">-{formatVND(shipperFeeLocal || 0)}</span>
                    </div>
                    {Number(incidentCost) > 0 && (
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-muted-foreground">Chi phí sự cố:</span>
                        <span className="text-rose-600">-{formatVND(Number(incidentCost))}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress actions */}
                <div className="space-y-3 pt-2">
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    isPaidLocal ? "bg-green-50 border-green-500 text-green-700" : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                  )} onClick={handlePayment}>
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

                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 border-primary/20 font-bold group hover:bg-primary hover:text-white transition-all gap-2"
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary group-hover:border-white" />
                    ) : (
                       <Download className="w-5 h-5 text-primary group-hover:text-white" />
                    )}
                    {isGenerating ? 'ĐANG XUẤT PDF...' : 'TẢI XUỐNG PDF HÓA ĐƠN'}
                  </Button>
                </div>
              </div>
            )}

            {/* Package Breakdown List */}
            {isWarehouse && (
              <div className="rounded-lg border p-4 space-y-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Chi tiết từng kiện ({localPackages.length})</h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2 text-primary hover:bg-primary/10 gap-1 font-bold text-[10px] uppercase"
                    onClick={addNewPackage}
                  >
                    <Plus className="w-3 h-3" />
                    Thêm kiện
                  </Button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {localPackages.map((pkg, idx) => (
                    <div key={idx} className="bg-card border rounded-lg p-4 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Kiện #{idx + 1}</p>
                          <div className="flex items-center gap-2">
                            <div className="relative group/w">
                              <Input 
                                type="number" 
                                value={pkg.weight} 
                                onChange={(e) => updatePackage(idx, { weight: parseFloat(e.target.value) || 0 })} 
                                className="w-20 font-black text-xl h-9 px-2 bg-muted/20 border-primary/20 focus-visible:ring-primary"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none group-focus-within/w:hidden">kg</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground italic">(Tính theo: {pkg.chargeWeight === pkg.weight ? 'Cân nặng' : 'Quy đổi'})</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                            onClick={() => removePackage(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <p className="text-lg font-black text-primary tracking-tight">{formatVND(pkg.total)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 border-y py-4 my-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Kích thước (Dài x Rộng x Cao)</Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <Input 
                              placeholder="D" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimL || 0} onChange={(e) => updatePackage(idx, { dimL: parseFloat(e.target.value) || 0 })} 
                            />
                            <Input 
                              placeholder="R" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimW || 0} onChange={(e) => updatePackage(idx, { dimW: parseFloat(e.target.value) || 0 })} 
                            />
                            <Input 
                              placeholder="C" className="h-8 p-1 text-center font-bold" type="number" 
                              value={pkg.dimH || 0} onChange={(e) => updatePackage(idx, { dimH: parseFloat(e.target.value) || 0 })} 
                            />
                          </div>
                          {pkg.volWeight > 0 && (
                            <p className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 mt-1 inline-block">
                              Quy đổi: {pkg.volWeight} kg (divisor: 6000)
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs items-center">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Vận chuyển:</span>
                              <span className="text-[9px] text-muted-foreground/70 font-mono">
                                ({new Intl.NumberFormat('vi-VN').format(getTierPrice(pkg.chargeWeight))} x {pkg.chargeWeight}kg)
                              </span>
                            </div>
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

                      {/* Image Upload Grid */}
                      <div className="pt-2 border-t mt-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Ảnh kiện hàng (Tối đa 3 ảnh)</Label>
                        <div className="flex gap-3">
                          {[0, 1, 2].map((slotIdx) => {
                            const img = pkg.images?.[slotIdx];
                            return (
                              <div key={slotIdx} className="relative w-16 h-16 rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30 overflow-hidden group">
                                {img ? (
                                  <>
                                    <img src={img} alt={`Package ${idx+1} slot ${slotIdx}`} className="w-full h-full object-cover" />
                                    <button 
                                      onClick={() => removeImage(idx, slotIdx)}
                                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-muted/50 transition-colors">
                                    <Plus className="w-4 h-4 text-muted-foreground/50" />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(idx, file);
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })}
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
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-semibold">Phương án xử lý</Label>
                          <Select value={incidentPlan} onValueChange={(v) => setIncidentPlan(v as any)}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn" /></SelectTrigger>
                            <SelectContent>
                              {INCIDENT_PLANS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Chi phí (VNĐ)</Label>
                          <Input 
                            type="number" 
                            className="h-8 text-sm" 
                            value={incidentCost} 
                            onChange={(e) => setIncidentCost(Number(e.target.value))} 
                          />
                        </div>
                      </div>
                      <div><Label className="text-xs font-semibold">Mô tả</Label><Textarea className="text-xs h-12 resize-none" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                      <div><Label className="text-xs font-semibold">Cách xử lý</Label><Textarea className="text-xs h-12 resize-none" value={issueSolution} onChange={(e) => setIssueSolution(e.target.value)} /></div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full text-xs h-7" 
                        onClick={() => {
                          const now = new Date().toISOString().slice(0, 10);
                          const isCurrentlyInFlight = currentLead.status === 'dang_bay';
                          const nextLeadStatus = isCurrentlyInFlight ? 'su_co' : currentLead.status;
                          
                          const planLabel = INCIDENT_PLANS.find(p => p.value === incidentPlan)?.label || 'Chưa chọn';
                          const newHistory = [
                            ...currentLead.statusHistory,
                            { 
                              status: nextLeadStatus, 
                              date: now, 
                              note: `LỖI: ${issueReason} (${issueDesc}). PHƯƠNG ÁN: ${planLabel}. CHI PHÍ: ${formatVND(incidentCost)}. XỬ LÝ: ${issueSolution}` 
                            }
                          ];
                          updateLead(currentLead.id, { 
                            status: nextLeadStatus,
                            hasIssue, 
                            issueReason, 
                            issueDesc, 
                            issueSolution,
                            incidentPlan,
                            incidentCost: Number(incidentCost),
                            statusHistory: newHistory
                          });
                        }}
                      >
                        Lưu phát sinh
                      </Button>
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
                  <div key={i} className="relative pb-6 last:pb-2">
                    {/* The bullet line */}
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/30 border-2 border-background z-10" />
                    
                    <div className="flex flex-col gap-1">
                      {/* Date Header */}
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">{h.date}</span>
                      
                      {/* Status & Regular Note line */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-bold whitespace-nowrap", STATUS_COLORS[h.status], "text-primary-foreground border-none")}>
                          {STATUS_LABELS[h.status]}
                        </Badge>
                        {h.note && !h.note.includes('LỖI:') && (
                          <span className="text-[11px] text-muted-foreground leading-none">— {h.note}</span>
                        )}
                      </div>

                      {/* Incident Details Section (Split into lines if it's an error) */}
                      {h.note && h.note.includes('LỖI:') && (
                        <div className="mt-2 bg-red-50/70 p-2.5 rounded-lg border border-red-100 shadow-sm text-[11px] space-y-2 relative group">
                          {editingHistoryIdx === i ? (
                            <div className="space-y-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-red-800 font-bold uppercase text-[9px] tracking-wider opacity-70">Phát sinh lỗi</span>
                                <Textarea 
                                  className="text-[11px] min-h-[60px] bg-white border-red-200 focus-visible:ring-red-400" 
                                  value={tempIncidentError} 
                                  onChange={(e) => setTempIncidentError(e.target.value)} 
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-blue-800 font-bold uppercase text-[9px] tracking-wider opacity-70">Hướng xử lý</span>
                                <Textarea 
                                  className="text-[11px] min-h-[60px] bg-white border-blue-200 focus-visible:ring-blue-400" 
                                  value={tempIncidentSolution} 
                                  onChange={(e) => setTempIncidentSolution(e.target.value)} 
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-[10px] uppercase font-bold" 
                                  onClick={() => setEditingHistoryIdx(null)}
                                >
                                  Hủy
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-7 text-[10px] uppercase font-bold bg-green-600 hover:bg-green-700" 
                                  onClick={() => {
                                    const newHistory = [...currentLead.statusHistory];
                                    newHistory[i] = { 
                                      ...h, 
                                      note: `LỖI: ${tempIncidentError}. XỬ LÝ: ${tempIncidentSolution}` 
                                    };
                                    updateLead(currentLead.id, { 
                                      statusHistory: newHistory,
                                      // If it's the latest incident, update the lead's main fields too
                                      issueDesc: i === currentLead.statusHistory.length - 1 ? tempIncidentError : currentLead.issueDesc,
                                      issueSolution: i === currentLead.statusHistory.length - 1 ? tempIncidentSolution : currentLead.issueSolution
                                    });
                                    setEditingHistoryIdx(null);
                                  }}
                                >
                                  Lưu
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md border text-[9px] font-bold uppercase text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setEditingHistoryIdx(i);
                                  setTempIncidentError(h.note!.split('XỬ LÝ:')[0].replace('LỖI:', '').trim());
                                  setTempIncidentSolution(h.note!.split('XỬ LÝ:')[1]?.trim() || 'Đang xử lý');
                                }}
                              >
                                Sửa
                              </button>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-red-800 font-bold uppercase text-[9px] tracking-wider opacity-70">Phát sinh lỗi</span>
                                <p className="text-red-700 leading-relaxed font-medium">
                                  {h.note.split('XỬ LÝ:')[0].replace('LỖI:', '').trim()}
                                </p>
                              </div>
                              <div className="flex flex-col gap-0.5 border-t border-red-200/50 pt-2">
                                <span className="text-blue-800 font-bold uppercase text-[9px] tracking-wider opacity-70">Hướng xử lý</span>
                                <p className="text-blue-700 leading-relaxed font-medium">
                                  {h.note.split('XỬ LÝ:')[1]?.trim() || 'Đang xử lý'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
        
        {/* Hidden receipt container but accessible to canvas */}
        <div style={{ position: 'absolute', opacity: 0, left: '-9999px', top: 0, zIndex: -1 }}>
           <LeadReceipt ref={targetRef} lead={currentLead} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
