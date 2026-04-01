export type LeadSource = 'Facebook' | 'Zalo' | 'TikTok' | 'Website' | 'Khác';
export type LeadStatus = 'cho_xac_nhan' | 'lead_moi' | 'van_chuyen_noi_dia' | 'dang_bay' | 'hoan_thanh';
export type ItemType = 'Thực phẩm' | 'Quần áo' | 'Mỹ phẩm' | 'Đồ điện tử' | 'Khác';
export type Carrier = 'EMS' | 'DHL' | 'Sagawa';
export type EmployeeRole = 'Admin' | 'Sale' | 'Kho';

export interface Lead {
  id: string;
  code: string;
  status: LeadStatus;
  source: LeadSource;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  itemType: ItemType;
  weightKg: number;
  dimL: number;
  dimW: number;
  dimH: number;
  actualWeightKg?: number;
  actualDimL?: number;
  actualDimW?: number;
  actualDimH?: number;
  carrier?: Carrier;
  trackingCode?: string;
  shipDate?: string;
  totalFee: number;
  hasIssue?: boolean;
  issueReason?: string;
  issueDesc?: string;
  issueSolution?: string;
  createdAt: string;
  statusHistory: { status: LeadStatus; date: string; note?: string }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  ordersHandled: number;
  active: boolean;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  cho_xac_nhan: 'Đang chăm sóc',
  lead_moi: 'Lead mới',
  van_chuyen_noi_dia: 'Vận chuyển nội địa',
  dang_bay: 'Đang bay',
  hoan_thanh: 'Hoàn thành',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  cho_xac_nhan: 'bg-status-pending',
  lead_moi: 'bg-status-new',
  van_chuyen_noi_dia: 'bg-status-domestic',
  dang_bay: 'bg-status-inflight',
  hoan_thanh: 'bg-status-done',
};

export const SOURCE_ABBR: Record<LeadSource, string> = {
  Facebook: 'FB',
  Zalo: 'ZL',
  TikTok: 'TT',
  Website: 'WEB',
  Khác: 'K',
};

const nextStatus: Record<LeadStatus, LeadStatus | null> = {
  cho_xac_nhan: 'lead_moi',
  lead_moi: 'van_chuyen_noi_dia',
  van_chuyen_noi_dia: 'dang_bay',
  dang_bay: 'hoan_thanh',
  hoan_thanh: null,
};

export function getNextStatus(s: LeadStatus): LeadStatus | null {
  return nextStatus[s];
}

export function formatVND(n: number): string {
  return n.toLocaleString('vi-VN') + ' VNĐ';
}

export function calcShippingFee(weightKg: number, dimL: number, dimW: number, dimH: number, priceMain = 115000, priceSub = 125000, surchargePerPkg = 40000, maxKgPerPkg = 30) {
  const volWeight = (dimL * dimW * dimH) / 5000;
  const chargeWeight = Math.max(weightKg, volWeight);
  const isVolumetric = volWeight > weightKg;

  if (chargeWeight <= maxKgPerPkg) {
    const boxFee = getBoxFee(chargeWeight);
    const shipping = Math.round(chargeWeight * priceMain);
    return { weightKg, volWeight: Math.round(volWeight * 100) / 100, chargeWeight: Math.round(chargeWeight * 100) / 100, isVolumetric, needsSplit: false, total: shipping + boxFee, breakdown: null, boxFee, shipping };
  }

  const pkg1 = maxKgPerPkg;
  const pkg2 = Math.round((chargeWeight - maxKgPerPkg) * 100) / 100;
  const pkg1Fee = pkg1 * priceMain;
  const pkg2Fee = pkg2 * priceSub;
  const surcharge = surchargePerPkg * 2;
  const boxFee = getBoxFee(pkg1) + getBoxFee(pkg2);
  const total = pkg1Fee + pkg2Fee + surcharge + boxFee;

  return {
    weightKg, volWeight: Math.round(volWeight * 100) / 100, chargeWeight: Math.round(chargeWeight * 100) / 100, isVolumetric,
    needsSplit: true,
    breakdown: { pkg1, pkg2, pkg1Fee, pkg2Fee, surcharge, boxFee },
    total, boxFee, shipping: pkg1Fee + pkg2Fee,
  };
}

function getBoxFee(kg: number): number {
  if (kg <= 0) return 0;
  if (kg < 5) return 0;
  if (kg < 15) return 15000;
  if (kg < 25) return 20000;
  return 30000;
}

export function generateCode(source: LeadSource, index: number): string {
  const abbr = SOURCE_ABBR[source];
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `IKG-${abbr}-${yy}${mm}${dd}-${String(index).padStart(3, '0')}`;
}

// Mock leads
export const initialLeads: Lead[] = [
  // Đang chăm sóc
  { id: '4', code: 'IKG-WEB-260320-004', status: 'cho_xac_nhan', source: 'Website', senderName: 'Phạm Đức Dũng', senderPhone: '0934567890', receiverName: 'Nakamura Hana', receiverAddress: 'Fukuoka, Hakata-ku, 2-3-4', receiverPhone: '080-3333-4444', itemType: 'Đồ điện tử', weightKg: 8, dimL: 60, dimW: 40, dimH: 30, totalFee: 935000, createdAt: '2026-03-20', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-22' }] },
  { id: '5', code: 'IKG-FB-260321-005', status: 'cho_xac_nhan', source: 'Facebook', senderName: 'Hoàng Thị Em', senderPhone: '0945678901', receiverName: 'Suzuki Ren', receiverAddress: 'Sapporo, Chuo-ku, 5-6-7', receiverPhone: '090-5555-6666', itemType: 'Thực phẩm', weightKg: 12, dimL: 50, dimW: 40, dimH: 35, totalFee: 1395000, createdAt: '2026-03-21', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-23' }] },
  { id: '6', code: 'IKG-ZL-260322-006', status: 'cho_xac_nhan', source: 'Zalo', senderName: 'Vũ Quốc Phong', senderPhone: '0956789012', receiverName: 'Watanabe Mei', receiverAddress: 'Kobe, Nada-ku, 8-9-10', receiverPhone: '070-7777-8888', itemType: 'Khác', weightKg: 6, dimL: 45, dimW: 35, dimH: 25, totalFee: 705000, createdAt: '2026-03-22', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-24' }] },
  
  // Lead mới
  { id: '1', code: 'IKG-FB-260325-001', status: 'lead_moi', source: 'Facebook', senderName: 'Nguyễn Văn An', senderPhone: '0901234567', receiverName: 'Tanaka Yuki', receiverAddress: 'Tokyo, Shinjuku-ku, 1-2-3', receiverPhone: '080-1234-5678', itemType: 'Thực phẩm', weightKg: 5, dimL: 40, dimW: 30, dimH: 20, totalFee: 590000, createdAt: '2026-03-25', statusHistory: [{ status: 'lead_moi', date: '2026-03-25' }] },
  { id: '2', code: 'IKG-ZL-260326-002', status: 'lead_moi', source: 'Zalo', senderName: 'Trần Thị Bình', senderPhone: '0912345678', receiverName: 'Sato Kenji', receiverAddress: 'Osaka, Namba, 4-5-6', receiverPhone: '090-8765-4321', itemType: 'Quần áo', weightKg: 3, dimL: 50, dimW: 40, dimH: 30, totalFee: 345000, createdAt: '2026-03-26', statusHistory: [{ status: 'lead_moi', date: '2026-03-26' }] },
  { id: '3', code: 'IKG-TT-260327-003', status: 'lead_moi', source: 'TikTok', senderName: 'Lê Minh Châu', senderPhone: '0923456789', receiverName: 'Yamamoto Aoi', receiverAddress: 'Nagoya, Chikusa-ku, 7-8-9', receiverPhone: '070-1111-2222', itemType: 'Mỹ phẩm', weightKg: 2, dimL: 30, dimW: 20, dimH: 15, totalFee: 230000, createdAt: '2026-03-27', statusHistory: [{ status: 'lead_moi', date: '2026-03-27' }] },
  
  // Vận chuyển nội địa (Không tracking, không issue)
  { id: '7', code: 'IKG-TT-260315-007', status: 'van_chuyen_noi_dia', source: 'TikTok', senderName: 'Đặng Văn Giang', senderPhone: '0967890123', receiverName: 'Ito Sota', receiverAddress: 'Yokohama, Nishi-ku, 1-1-1', receiverPhone: '080-9999-0000', itemType: 'Quần áo', weightKg: 10, dimL: 55, dimW: 45, dimH: 30, totalFee: 1165000, createdAt: '2026-03-15', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-19' }] },
  { id: '8', code: 'IKG-K-260316-008', status: 'van_chuyen_noi_dia', source: 'Khác', senderName: 'Bùi Thị Hoa', senderPhone: '0978901234', receiverName: 'Takahashi Yui', receiverAddress: 'Kyoto, Higashiyama-ku, 3-3-3', receiverPhone: '090-1212-3434', itemType: 'Mỹ phẩm', weightKg: 4, dimL: 35, dimW: 25, dimH: 20, totalFee: 460000, createdAt: '2026-03-16', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-20' }] },
  { id: '9', code: 'IKG-FB-260317-009', status: 'van_chuyen_noi_dia', source: 'Facebook', senderName: 'Ngô Thanh Inh', senderPhone: '0989012345', receiverName: 'Kobayashi Riku', receiverAddress: 'Sendai, Aoba-ku, 5-5-5', receiverPhone: '070-5656-7878', itemType: 'Thực phẩm', weightKg: 15, dimL: 60, dimW: 50, dimH: 40, totalFee: 1750000, createdAt: '2026-03-17', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-21' }] },
  
  // Đang bay (Có tracking, có phát sinh xử lý)
  { id: '10', code: 'IKG-WEB-260310-010', status: 'dang_bay', source: 'Website', senderName: 'Lý Văn Khôi', senderPhone: '0990123456', receiverName: 'Yoshida Sakura', receiverAddress: 'Hiroshima, Minami-ku, 7-7-7', receiverPhone: '080-3434-5656', itemType: 'Đồ điện tử', weightKg: 7, dimL: 50, dimW: 35, dimH: 25, totalFee: 820000, carrier: 'EMS', trackingCode: 'EMS9988776655', shipDate: '2026-03-25', createdAt: '2026-03-10', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-12' }, { status: 'dang_bay', date: '2026-03-25' }] },
  { id: '11', code: 'IKG-ZL-260311-011', status: 'dang_bay', source: 'Zalo', senderName: 'Mai Thị Lan', senderPhone: '0901234568', receiverName: 'Kato Haruto', receiverAddress: 'Niigata, Chuo-ku, 2-2-2', receiverPhone: '090-7878-9090', itemType: 'Quần áo', weightKg: 9, dimL: 55, dimW: 40, dimH: 30, totalFee: 1050000, carrier: 'DHL', trackingCode: 'DHL5544332211', shipDate: '2026-03-26', hasIssue: true, issueReason: 'Lỗi vận chuyển', issueDesc: 'Thời tiết xấu, bay chậm 1 ngày', issueSolution: 'Thông báo khách hàng thông cảm', createdAt: '2026-03-11', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-13' }, { status: 'dang_bay', date: '2026-03-26' }] },
  { id: '12', code: 'IKG-FB-260312-012', status: 'dang_bay', source: 'Facebook', senderName: 'Phan Quốc Minh', senderPhone: '0912345679', receiverName: 'Morita Aiko', receiverAddress: 'Okayama, Kita-ku, 4-4-4', receiverPhone: '070-2323-4545', itemType: 'Khác', weightKg: 20, dimL: 70, dimW: 50, dimH: 40, totalFee: 2330000, carrier: 'Sagawa', trackingCode: 'SGW1122334455', shipDate: '2026-03-27', createdAt: '2026-03-12', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-14' }, { status: 'dang_bay', date: '2026-03-27' }] },
  
  // Hoàn thành
  { id: '13', code: 'IKG-TT-260301-013', status: 'hoan_thanh', source: 'TikTok', senderName: 'Đỗ Thị Ngọc', senderPhone: '0923456780', receiverName: 'Kimura Daiki', receiverAddress: 'Tokyo, Shibuya-ku, 9-9-9', receiverPhone: '080-6767-8989', itemType: 'Thực phẩm', weightKg: 6, dimL: 40, dimW: 30, dimH: 25, totalFee: 705000, carrier: 'EMS', trackingCode: 'EMS1111222233', shipDate: '2026-03-03', createdAt: '2026-03-01', statusHistory: [{ status: 'hoan_thanh', date: '2026-03-08' }] },
  { id: '14', code: 'IKG-WEB-260302-014', status: 'hoan_thanh', source: 'Website', senderName: 'Trịnh Văn Phú', senderPhone: '0934567891', receiverName: 'Shimizu Yuna', receiverAddress: 'Osaka, Tennoji-ku, 6-6-6', receiverPhone: '090-4545-6767', itemType: 'Mỹ phẩm', weightKg: 3, dimL: 30, dimW: 20, dimH: 15, totalFee: 345000, carrier: 'DHL', trackingCode: 'DHL4444555566', shipDate: '2026-03-04', createdAt: '2026-03-02', statusHistory: [{ status: 'hoan_thanh', date: '2026-03-09' }] },
  { id: '15', code: 'IKG-K-260303-015', status: 'hoan_thanh', source: 'Khác', senderName: 'Cao Thị Quỳnh', senderPhone: '0945678902', receiverName: 'Honda Taro', receiverAddress: 'Nagoya, Nakamura-ku, 8-8-8', receiverPhone: '070-8989-0101', itemType: 'Quần áo', weightKg: 11, dimL: 55, dimW: 45, dimH: 35, totalFee: 1280000, carrier: 'Sagawa', trackingCode: 'SGW7777888899', shipDate: '2026-03-05', createdAt: '2026-03-03', statusHistory: [{ status: 'hoan_thanh', date: '2026-03-10' }] },
  { id: '16', code: 'IKG-FB-260304-016', status: 'hoan_thanh', source: 'Facebook', senderName: 'Lê Thị Ry', senderPhone: '0956789013', receiverName: 'Matsuda Ken', receiverAddress: 'Sapporo, Toyohira-ku, 1-3-5', receiverPhone: '080-0202-0303', itemType: 'Đồ điện tử', weightKg: 5, dimL: 45, dimW: 30, dimH: 20, totalFee: 590000, carrier: 'EMS', trackingCode: 'EMS3333444455', shipDate: '2026-03-06', createdAt: '2026-03-04', statusHistory: [{ status: 'hoan_thanh', date: '2026-03-11' }] },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Nguyễn Văn An', phone: '0901234567', source: 'Facebook', orderCount: 5, totalSpent: 4200000, lastOrder: '2026-03-25' },
  { id: 'c2', name: 'Trần Thị Bình', phone: '0912345678', source: 'Zalo', orderCount: 3, totalSpent: 2100000, lastOrder: '2026-03-26' },
  { id: 'c3', name: 'Lê Minh Châu', phone: '0923456789', source: 'TikTok', orderCount: 2, totalSpent: 1500000, lastOrder: '2026-03-27' },
  { id: 'c4', name: 'Phạm Đức Dũng', phone: '0934567890', source: 'Website', orderCount: 7, totalSpent: 8500000, lastOrder: '2026-03-20' },
  { id: 'c5', name: 'Hoàng Thị Em', phone: '0945678901', source: 'Facebook', orderCount: 4, totalSpent: 3800000, lastOrder: '2026-03-21' },
  { id: 'c6', name: 'Vũ Quốc Phong', phone: '0956789012', source: 'Zalo', orderCount: 1, totalSpent: 705000, lastOrder: '2026-03-22' },
  { id: 'c7', name: 'Đặng Văn Giang', phone: '0967890123', source: 'TikTok', orderCount: 6, totalSpent: 5600000, lastOrder: '2026-03-15' },
  { id: 'c8', name: 'Bùi Thị Hoa', phone: '0978901234', source: 'Khác', orderCount: 2, totalSpent: 1200000, lastOrder: '2026-03-16' },
  { id: 'c9', name: 'Ngô Thanh Inh', phone: '0989012345', source: 'Facebook', orderCount: 8, totalSpent: 12000000, lastOrder: '2026-03-17' },
  { id: 'c10', name: 'Lý Văn Khôi', phone: '0990123456', source: 'Website', orderCount: 3, totalSpent: 2500000, lastOrder: '2026-03-10' },
  { id: 'c11', name: 'Mai Thị Lan', phone: '0901234568', source: 'Zalo', orderCount: 5, totalSpent: 4100000, lastOrder: '2026-03-11' },
  { id: 'c12', name: 'Phan Quốc Minh', phone: '0912345679', source: 'Facebook', orderCount: 2, totalSpent: 3200000, lastOrder: '2026-03-12' },
];

export const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Nguyễn Thanh Tùng', role: 'Admin', phone: '0901111111', email: 'tung@ikigai.vn', ordersHandled: 245, active: true },
  { id: 'e2', name: 'Trần Thị Mai', role: 'Sale', phone: '0902222222', email: 'mai@ikigai.vn', ordersHandled: 189, active: true },
  { id: 'e3', name: 'Lê Văn Hùng', role: 'Kho', phone: '0903333333', email: 'hung@ikigai.vn', ordersHandled: 156, active: true },
  { id: 'e4', name: 'Phạm Thị Linh', role: 'Sale', phone: '0904444444', email: 'linh@ikigai.vn', ordersHandled: 132, active: true },
  { id: 'e5', name: 'Hoàng Đức Nam', role: 'Kho', phone: '0905555555', email: 'nam@ikigai.vn', ordersHandled: 98, active: false },
  { id: 'e6', name: 'Vũ Thị Oanh', role: 'Sale', phone: '0906666666', email: 'oanh@ikigai.vn', ordersHandled: 67, active: true },
];
