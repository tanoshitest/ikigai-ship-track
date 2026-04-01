import { initialEmployees } from './mockData';

export type ParcelStatus = 'chua_nhan' | 'da_nhan' | 'noi_dia' | 'dang_bay' | 'su_co' | 'hoan_thanh';
export type Carrier = 'EMS' | 'DHL' | 'Sagawa';

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  chua_nhan: 'Chưa nhận hàng',
  da_nhan: 'Đã nhận hàng',
  noi_dia: 'Đang vận chuyển nội địa',
  dang_bay: 'Đang bay',
  su_co: 'Sự cố',
  hoan_thanh: 'Hoàn thành',
};

export const PARCEL_STATUS_COLORS: Record<ParcelStatus, string> = {
  chua_nhan: 'bg-slate-400',
  da_nhan: 'bg-blue-500',
  noi_dia: 'bg-emerald-500',
  dang_bay: 'bg-sky-500',
  su_co: 'bg-red-500',
  hoan_thanh: 'bg-purple-500',
};

export interface ParcelStatusChange {
  date: string;
  fromStatus: ParcelStatus | null;
  toStatus: ParcelStatus;
  employee: string;
}

export interface Parcel {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  employeeName: string;
  itemType: string;
  weightKg: number;
  dimL: number;
  dimW: number;
  dimH: number;
  status: ParcelStatus;
  carrier?: Carrier;
  trackingCode?: string;
  note?: string;
  createdAt: string;
  statusHistory: ParcelStatusChange[];
}

const employees = initialEmployees.filter(e => e.active).map(e => e.name);
const itemTypes = ['Thực phẩm', 'Quần áo', 'Mỹ phẩm', 'Đồ điện tử', 'Khác'];
const statuses: ParcelStatus[] = ['chua_nhan', 'da_nhan', 'noi_dia', 'dang_bay', 'su_co', 'hoan_thanh'];
const carriers: Carrier[] = ['EMS', 'DHL', 'Sagawa'];
const sources = ['FB', 'ZL', 'TT', 'WEB', 'K'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genHistory(status: ParcelStatus, emp: string, createdAt: string): ParcelStatusChange[] {
  const idx = statuses.indexOf(status);
  const history: ParcelStatusChange[] = [];
  const base = new Date(createdAt);
  for (let i = 0; i <= idx; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    history.push({
      date: d.toISOString().slice(0, 10),
      fromStatus: i === 0 ? null : statuses[i - 1],
      toStatus: statuses[i],
      employee: emp,
    });
  }
  return history;
}

const notes = [
  'Khách yêu cầu đóng gói cẩn thận',
  'Hàng dễ vỡ, cần bọc thêm',
  'Khách sẽ gửi thêm 1 kiện nữa',
  'Đã liên hệ khách xác nhận địa chỉ',
  '',
  '',
  '',
  '',
  '',
  '',
];

const customerNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Châu', 'Phạm Đức Dũng', 'Hoàng Thị Em',
  'Vũ Quốc Phong', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Ngô Thanh Inh', 'Lý Văn Khôi',
  'Mai Thị Lan', 'Phan Quốc Minh', 'Đỗ Thị Ngọc', 'Trịnh Văn Phú', 'Cao Thị Quỳnh',
  'Lê Thị Ry', 'Nguyễn Hoàng Sơn', 'Trần Đức Tâm', 'Phạm Thị Uyên', 'Hoàng Văn Vinh',
  'Vũ Thị Xuân', 'Đặng Minh Yên', 'Bùi Quốc Anh', 'Ngô Thị Bảo', 'Lý Hoàng Cường',
];

const phones = [
  '0901234567', '0912345678', '0923456789', '0934567890', '0945678901',
  '0956789012', '0967890123', '0978901234', '0989012345', '0990123456',
  '0901234568', '0912345679', '0923456780', '0934567891', '0945678902',
  '0956789013', '0967890124', '0978901235', '0989012346', '0990123457',
  '0901234569', '0912345670', '0923456781', '0934567892', '0945678903',
];

export const initialParcels: Parcel[] = Array.from({ length: 30 }, (_, i) => {
  const statusIdx = i % 6;
  const status = statuses[statusIdx];
  const emp = employees[i % employees.length];
  const day = String(rand(1, 28)).padStart(2, '0');
  const createdAt = `2026-03-${day}`;
  const src = sources[i % sources.length];
  const code = `IKG-${src}-2603${day}-${String(i + 1).padStart(3, '0')}`;
  const w = rand(5, 35);
  const l = rand(30, 80);
  const r = rand(30, 60);
  const h = rand(20, 50);
  const hasTracking = statusIdx >= 3;
  const isSuCo = status === 'su_co';
  const note = notes[i % notes.length];

  return {
    id: `p${i + 1}`,
    code,
    customerName: customerNames[i],
    customerPhone: phones[i],
    employeeName: emp,
    itemType: itemTypes[i % itemTypes.length],
    weightKg: w,
    dimL: l,
    dimW: r,
    dimH: h,
    status,
    carrier: statusIdx >= 3 ? carriers[i % carriers.length] : undefined,
    trackingCode: hasTracking ? `${carriers[i % carriers.length].toUpperCase()}${rand(1000000, 9999999)}` : undefined,
    note: isSuCo ? 'Kiện hàng bị giữ tại hải quan Nhật Bản. Đang liên hệ xử lý.' : (note || undefined),
    createdAt,
    statusHistory: genHistory(status, emp, createdAt),
  };
});
