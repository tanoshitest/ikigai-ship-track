import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, ArrowUpDown, X, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { initialParcels, Parcel, ParcelStatus, PARCEL_STATUS_LABELS, PARCEL_STATUS_COLORS } from '@/data/parcelData';
import { initialEmployees } from '@/data/mockData';

type SortKey = keyof Parcel | 'volWeight';
type SortDir = 'asc' | 'desc';

export default function ParcelManagementPage() {
  const [parcels, setParcels] = useState<Parcel[]>(initialParcels);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const perPage = 10;

  const activeEmployees = initialEmployees.filter(e => e.active);

  const volWeight = (p: Parcel) => Math.round((p.dimL * p.dimW * p.dimH) / 5000 * 100) / 100;

  const filtered = useMemo(() => {
    let data = [...parcels];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(p => p.customerName.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
    }
    if (statusFilter !== 'all') data = data.filter(p => p.status === statusFilter);
    if (employeeFilter !== 'all') data = data.filter(p => p.employeeName === employeeFilter);
    if (dateFrom) data = data.filter(p => p.createdAt >= format(dateFrom, 'yyyy-MM-dd'));
    if (dateTo) data = data.filter(p => p.createdAt <= format(dateTo, 'yyyy-MM-dd'));
    return data;
  }, [parcels, search, statusFilter, employeeFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      let va: any, vb: any;
      if (sortKey === 'volWeight') {
        va = volWeight(a); vb = volWeight(b);
      } else {
        va = a[sortKey]; vb = b[sortKey];
      }
      if (va == null) va = '';
      if (vb == null) vb = '';
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setEmployeeFilter('all'); setDateFrom(undefined); setDateTo(undefined); setPage(1);
  };

  const openDrawer = (p: Parcel) => {
    setSelectedParcel(p);
    setNewStatus(p.status);
    setNewNote('');
    setDrawerOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedParcel || newStatus === selectedParcel.status) return;
    const updated = parcels.map(p => {
      if (p.id !== selectedParcel.id) return p;
      const change = {
        date: new Date().toISOString().slice(0, 10),
        fromStatus: p.status,
        toStatus: newStatus as ParcelStatus,
        employee: 'Admin',
      };
      return { ...p, status: newStatus as ParcelStatus, statusHistory: [...p.statusHistory, change] };
    });
    setParcels(updated);
    const np = updated.find(p => p.id === selectedParcel.id)!;
    setSelectedParcel(np);
  };

  const handleSaveNote = () => {
    if (!selectedParcel) return;
    const updated = parcels.map(p => p.id === selectedParcel.id ? { ...p, note: newNote || p.note } : p);
    setParcels(updated);
    setSelectedParcel(updated.find(p => p.id === selectedParcel.id)!);
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="cursor-pointer select-none whitespace-nowrap px-2 py-2 text-xs" onClick={() => toggleSort(sortKeyName)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className="text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý bưu kiện</h2>
          <p className="text-sm text-muted-foreground">Tổng: {filtered.length} bưu kiện</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => alert('Đang xuất file...')}>
          <FileSpreadsheet size={16} className="mr-2" /> Xuất Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Tìm kiếm</label>
          <Input placeholder="Tìm theo tên khách, mã đơn..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="w-[180px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Tình trạng</label>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {(Object.keys(PARCEL_STATUS_LABELS) as ParcelStatus[]).map(s => (
                <SelectItem key={s} value={s}>{PARCEL_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[180px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Nhân viên</label>
          <Select value={employeeFilter} onValueChange={v => { setEmployeeFilter(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {activeEmployees.map(e => (
                <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[150px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Từ ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dateFrom && 'text-muted-foreground')}>
                <CalendarIcon size={14} className="mr-2" />
                {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Chọn'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={d => { setDateFrom(d); setPage(1); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-[150px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Đến ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dateTo && 'text-muted-foreground')}>
                <CalendarIcon size={14} className="mr-2" />
                {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Chọn'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={d => { setDateTo(d); setPage(1); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          <X size={14} className="mr-1" /> Xóa bộ lọc
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <SortHeader label="Mã đơn" sortKeyName="code" />
              <SortHeader label="Tên khách hàng" sortKeyName="customerName" />
              <TableHead className="whitespace-nowrap px-2 py-2 text-xs">SĐT</TableHead>
              <SortHeader label="NV chăm sóc" sortKeyName="employeeName" />
              <SortHeader label="Loại hàng" sortKeyName="itemType" />
              <SortHeader label="KL (kg)" sortKeyName="weightKg" />
              <TableHead className="px-2 py-2 text-xs">Dài</TableHead>
              <TableHead className="px-2 py-2 text-xs">Rộng</TableHead>
              <TableHead className="px-2 py-2 text-xs">Cao</TableHead>
              <SortHeader label="CL quy đổi" sortKeyName="volWeight" />
              <SortHeader label="Tình trạng" sortKeyName="status" />
              <SortHeader label="Hãng VC" sortKeyName="carrier" />
              <TableHead className="px-2 py-2 text-xs">Tracking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow><TableCell colSpan={13} className="py-8 text-center text-muted-foreground">Không có bưu kiện nào</TableCell></TableRow>
            ) : pageData.map(p => {
              const vw = volWeight(p);
              const showVol = vw > p.weightKg;
              return (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDrawer(p)}>
                  <TableCell className="whitespace-nowrap px-2 py-2 font-mono text-xs">{p.code}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{p.customerName}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{p.customerPhone}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{p.employeeName}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{p.itemType}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{p.weightKg} kg</TableCell>
                  <TableCell className="px-2 py-2">{p.dimL}</TableCell>
                  <TableCell className="px-2 py-2">{p.dimW}</TableCell>
                  <TableCell className="px-2 py-2">{p.dimH}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2">{showVol ? `${vw} kg` : '—'}</TableCell>
                  <TableCell className="px-2 py-2">
                    <Badge className={cn('text-white text-[10px] whitespace-nowrap px-1.5 py-0.5', PARCEL_STATUS_COLORS[p.status])}>
                      {PARCEL_STATUS_LABELS[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-2">{p.carrier || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2 font-mono">{p.trackingCode || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page}/{totalPages} — {filtered.length} bưu kiện
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[450px] overflow-y-auto sm:max-w-[450px]">
          {selectedParcel && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">Chi tiết bưu kiện</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Info */}
                <div className="space-y-2 rounded-lg border p-3">
                  <InfoRow label="Mã đơn" value={selectedParcel.code} />
                  <InfoRow label="Khách hàng" value={selectedParcel.customerName} />
                  <InfoRow label="SĐT" value={selectedParcel.customerPhone} />
                  <InfoRow label="NV chăm sóc" value={selectedParcel.employeeName} />
                  <InfoRow label="Loại hàng" value={selectedParcel.itemType} />
                  <InfoRow label="Khối lượng" value={`${selectedParcel.weightKg} kg`} />
                  <InfoRow label="Kích thước" value={`${selectedParcel.dimL} × ${selectedParcel.dimW} × ${selectedParcel.dimH} cm`} />
                  <InfoRow label="CL quy đổi" value={`${volWeight(selectedParcel)} kg`} />
                  <InfoRow label="Tình trạng">
                    <Badge className={cn('text-white', PARCEL_STATUS_COLORS[selectedParcel.status])}>
                      {PARCEL_STATUS_LABELS[selectedParcel.status]}
                    </Badge>
                  </InfoRow>
                  <InfoRow label="Hãng VC" value={selectedParcel.carrier || 'Chưa gán'} />
                  <InfoRow label="Tracking" value={selectedParcel.trackingCode || '—'} />
                  <InfoRow label="Ngày tạo" value={formatDate(selectedParcel.createdAt)} />
                  {selectedParcel.note && <InfoRow label="Ghi chú" value={selectedParcel.note} />}
                </div>

                {/* Update status */}
                <div className="space-y-2 rounded-lg border p-3">
                  <h4 className="text-sm font-semibold">Cập nhật tình trạng</h4>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PARCEL_STATUS_LABELS) as ParcelStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{PARCEL_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleUpdateStatus}>
                    Cập nhật
                  </Button>
                </div>

                {/* Note */}
                <div className="space-y-2 rounded-lg border p-3">
                  <h4 className="text-sm font-semibold">Ghi chú</h4>
                  <Textarea placeholder="Thêm ghi chú..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} />
                  <Button size="sm" variant="outline" onClick={handleSaveNote}>Lưu ghi chú</Button>
                </div>

                {/* History */}
                <div className="space-y-2 rounded-lg border p-3">
                  <h4 className="text-sm font-semibold">Lịch sử thay đổi</h4>
                  <div className="space-y-3">
                    {selectedParcel.statusHistory.map((h, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                          {i < selectedParcel.statusHistory.length - 1 && <div className="w-px flex-1 bg-border" />}
                        </div>
                        <div className="pb-3 text-sm">
                          <p className="font-medium">{formatDate(h.date)}</p>
                          <p className="text-muted-foreground">
                            {h.fromStatus ? `${PARCEL_STATUS_LABELS[h.fromStatus]} → ` : ''}
                            {PARCEL_STATUS_LABELS[h.toStatus]}
                          </p>
                          <p className="text-xs text-muted-foreground">bởi {h.employee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children || <span className="font-medium text-right">{value}</span>}
    </div>
  );
}
