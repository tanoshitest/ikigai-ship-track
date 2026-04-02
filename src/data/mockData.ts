export type LeadSource = 'Facebook' | 'Zalo' | 'TikTok' | 'Website' | 'Khác';
export type LeadStatus = 'cho_xac_nhan' | 'lead_moi' | 'van_chuyen_noi_dia' | 'dang_bay' | 'su_co' | 'hoan_thanh';
export type ItemType = 'Thực phẩm' | 'Quần áo' | 'Mỹ phẩm' | 'Đồ điện tử' | 'Khác';
export type Carrier = 'EMS' | 'DHL' | 'Sagawa';
export type EmployeeRole = 'Admin' | 'Sale' | 'Kho';

export interface PackageDetail {
  weight: number; // Actual weight
  dimL: number;
  dimW: number;
  dimH: number;
  volWeight: number;
  chargeWeight: number;
  hasPackingFee: boolean;
  boxFee: number;
  shippingFee: number;
  surcharge: number;
  total: number;
  images?: string[];
}

export interface Lead {
  id: string;
  code: string;
  status: LeadStatus;
  source: LeadSource;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
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
  packages?: PackageDetail[];
  isPaid?: boolean;
  hasIssue?: boolean;
  issueReason?: string;
  issueDesc?: string;
  issueSolution?: string;
  incidentPlan?: 'den_tien' | 'ho_tro_don' | 'noi_bo' | 'khac';
  incidentCost?: number;
  shipperFee?: number;
  createdAt: string;
  notes?: string;
  assignedTo?: string;
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

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  leadSource?: LeadSource;
}

export interface StoreState {
  leads: Lead[];
  customers: Customer[];
  employees: Employee[];
  expenses: Expense[];
  leadCounter: number;
  addLead: (lead: Omit<Lead, 'id' | 'code' | 'createdAt' | 'statusHistory'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addEmployee: (emp: Omit<Employee, 'id' | 'ordersHandled'>) => void;
  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  cho_xac_nhan: 'Lead mới - đang chăm sóc',
  lead_moi: 'Đã chốt đơn',
  van_chuyen_noi_dia: 'Vận chuyển nội địa',
  dang_bay: 'Đang bay',
  su_co: 'Sự cố',
  hoan_thanh: 'Hoàn thành',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  cho_xac_nhan: 'bg-orange-500',
  lead_moi: 'bg-blue-500',
  van_chuyen_noi_dia: 'bg-emerald-500',
  dang_bay: 'bg-sky-500',
  su_co: 'bg-red-500',
  hoan_thanh: 'bg-slate-400',
};

export const SOURCE_ABBR: Record<LeadSource, string> = {
  Facebook: 'FB',
  Zalo: 'ZL',
  TikTok: 'TT',
  Website: 'WEB',
  Khác: 'K',
};

export const INCIDENT_PLANS = [
  { value: 'den_tien', label: 'Đền tiền cho khách' },
  { value: 'ho_tro_don', label: 'Hỗ trợ lại đơn' },
  { value: 'noi_bo', label: 'Xử lý nội bộ' },
  { value: 'khac', label: 'Khác' },
];

export const EXPENSE_CATEGORIES = [
  'Nhân viên part-time',
  'Phí shipper',
  'Chi phí phát sinh (lỗi đơn)',
  'Vận chuyển nội địa',
  'Marketing',
  'Cước phí đối tác',
  'Văn phòng phẩm',
  'Khác'
];

const nextStatus: Record<LeadStatus, LeadStatus | null> = {
  cho_xac_nhan: 'lead_moi',
  lead_moi: 'van_chuyen_noi_dia',
  van_chuyen_noi_dia: 'dang_bay',
  dang_bay: 'hoan_thanh',
  su_co: 'hoan_thanh',
  hoan_thanh: null,
};

export function getNextStatus(s: LeadStatus): LeadStatus | null {
  return nextStatus[s];
}

export function formatVND(n: number): string {
  return n.toLocaleString('vi-VN') + ' VNĐ';
}

/**
 * Splitting logic:
 * - Max 30kg per package.
 * - If remainder < 5kg, adjust previous package to ensure last is 5kg.
 */
export function splitWeights(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 30) return [total];
  
  const pkgs: number[] = [];
  let remaining = total;
  
  while (remaining > 30) {
    let next = 30;
    let afterNext = remaining - 30;
    
    if (afterNext > 0 && afterNext < 5) {
      // Adjust to ensure last is 5
      next = remaining - 5;
    }
    
    pkgs.push(Math.round(next * 100) / 100);
    remaining -= next;
  }
  
  if (remaining > 0) {
    pkgs.push(Math.round(remaining * 100) / 100);
  }
  
  return pkgs;
}

export function getBoxFee(kg: number): number {
  if (kg <= 0) return 0;
  if (kg < 5) return 0; 
  if (kg <= 14) return 15000;
  if (kg <= 24) return 20000;
  return 30000;
}

export function getTierPrice(kg: number): number {
  if (kg <= 10) return 130000;
  if (kg <= 20) return 124000;
  return 120000;
}

export function calcShippingFee(
  weightKg: number, 
  dimL: number, 
  dimW: number, 
  dimH: number, 
  priceMainHint = 0, 
  priceSubHint = 0,
  surchargePerPkg = 40000, 
  maxKgPerPkg = 30
) {
  const volWeight = Math.ceil((dimL * dimW * dimH) / 6000); // Rounded up to next integer
  const chargeWeight = Math.max(weightKg, volWeight);
  const isVolumetric = volWeight > weightKg;

  const weightList = splitWeights(chargeWeight);
  
  const packages: PackageDetail[] = weightList.map((w, idx) => {
    const price = getTierPrice(w);
    const shippingFee = Math.round(w * price);
    const boxFee = getBoxFee(w);
    const surcharge = surchargePerPkg; // Always apply 40k
    
    return {
      weight: w,
      dimL: 0,
      dimW: 0,
      dimH: 0,
      volWeight: 0,
      chargeWeight: w,
      hasPackingFee: true,
      boxFee,
      shippingFee,
      surcharge,
      total: shippingFee + boxFee + surcharge
    };
  });

  const total = packages.reduce((sum, p) => sum + p.total, 0);

  return {
    weightKg,
    volWeight: volWeight,
    chargeWeight: Math.round(chargeWeight * 100) / 100,
    isVolumetric,
    packages,
    total
  };
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
  { id: '4', code: 'IKG-WEB-260320-004', status: 'cho_xac_nhan', source: 'Website', senderName: 'Phạm Đức Dũng', senderPhone: '0934567890', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Nakamura Hana', receiverAddress: 'Fukuoka, Hakata-ku, 2-3-4', receiverPhone: '080-3333-4444', itemType: 'Đồ điện tử', weightKg: 8, dimL: 60, dimW: 40, dimH: 30, totalFee: 935000, createdAt: '2026-03-20', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-22' }] },
  { id: '5', code: 'IKG-FB-260321-005', status: 'cho_xac_nhan', source: 'Facebook', senderName: 'Hoàng Thị Em', senderPhone: '0945678901', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Suzuki Ren', receiverAddress: 'Sapporo, Chuo-ku, 5-6-7', receiverPhone: '090-5555-6666', itemType: 'Thực phẩm', weightKg: 12, dimL: 50, dimW: 40, dimH: 35, totalFee: 1395000, createdAt: '2026-03-21', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-23' }] },
  { id: '6', code: 'IKG-ZL-260322-006', status: 'cho_xac_nhan', source: 'Zalo', senderName: 'Vũ Quốc Phong', senderPhone: '0956789012', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Watanabe Mei', receiverAddress: 'Kobe, Nada-ku, 8-9-10', receiverPhone: '070-7777-8888', itemType: 'Khác', weightKg: 6, dimL: 45, dimW: 35, dimH: 25, totalFee: 705000, createdAt: '2026-03-22', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'cho_xac_nhan', date: '2026-03-24' }] },
  
  // Lead mới
  { id: '1', code: 'IKG-FB-260325-001', status: 'lead_moi', source: 'Facebook', senderName: 'Nguyễn Văn An', senderPhone: '0901234567', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Tanaka Yuki', receiverAddress: 'Tokyo, Shinjuku-ku, 1-2-3', receiverPhone: '080-1234-5678', itemType: 'Thực phẩm', weightKg: 5, dimL: 40, dimW: 30, dimH: 20, totalFee: 590000, createdAt: '2026-03-25', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'lead_moi', date: '2026-03-25' }] },
  { id: '2', code: 'IKG-ZL-260326-002', status: 'lead_moi', source: 'Zalo', senderName: 'Trần Thị Bình', senderPhone: '0912345678', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Sato Kenji', receiverAddress: 'Osaka, Namba, 4-5-6', receiverPhone: '090-8765-4321', itemType: 'Quần áo', weightKg: 3, dimL: 50, dimW: 40, dimH: 30, totalFee: 345000, createdAt: '2026-03-26', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'lead_moi', date: '2026-03-26' }] },
  { id: '3', code: 'IKG-TT-260327-003', status: 'lead_moi', source: 'TikTok', senderName: 'Lê Minh Châu', senderPhone: '0923456789', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Yamamoto Aoi', receiverAddress: 'Nagoya, Chikusa-ku, 7-8-9', receiverPhone: '070-1111-2222', itemType: 'Mỹ phẩm', weightKg: 2, dimL: 30, dimW: 20, dimH: 15, totalFee: 230000, createdAt: '2026-03-27', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'lead_moi', date: '2026-03-27' }] },
  
  // Vận chuyển nội địa
  { id: '7', code: 'IKG-TT-260315-007', status: 'van_chuyen_noi_dia', source: 'TikTok', senderName: 'Đặng Văn Giang', senderPhone: '0967890123', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Ito Sota', receiverAddress: 'Yokohama, Nishi-ku, 1-1-1', receiverPhone: '080-9999-0000', itemType: 'Quần áo', weightKg: 10, dimL: 55, dimW: 45, dimH: 30, totalFee: 1165000, createdAt: '2026-03-15', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-19' }] },
  { id: '8', code: 'IKG-K-260316-008', status: 'van_chuyen_noi_dia', source: 'Khác', senderName: 'Bùi Thị Hoa', senderPhone: '0978901234', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Takahashi Yui', receiverAddress: 'Kyoto, Higashiyama-ku, 3-3-3', receiverPhone: '090-1212-3434', itemType: 'Mỹ phẩm', weightKg: 4, dimL: 35, dimW: 25, dimH: 20, totalFee: 460000, createdAt: '2026-03-16', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-20' }] },
  { id: '9', code: 'IKG-FB-260317-009', status: 'van_chuyen_noi_dia', source: 'Facebook', senderName: 'Ngô Thanh Inh', senderPhone: '0989012345', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Kobayashi Riku', receiverAddress: 'Sendai, Aoba-ku, 5-5-5', receiverPhone: '070-5656-7878', itemType: 'Thực phẩm', weightKg: 15, dimL: 60, dimW: 50, dimH: 40, totalFee: 1750000, createdAt: '2026-03-17', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-21' }] },
  
  // Đang bay
  { id: '10', code: 'IKG-WEB-260310-010', status: 'dang_bay', source: 'Website', senderName: 'Lý Văn Khôi', senderPhone: '0990123456', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Yoshida Sakura', receiverAddress: 'Hiroshima, Minami-ku, 7-7-7', receiverPhone: '080-3434-5656', itemType: 'Đồ điện tử', weightKg: 7, dimL: 50, dimW: 35, dimH: 25, totalFee: 820000, carrier: 'EMS', trackingCode: 'EMS9988776655', shipDate: '2026-03-25', createdAt: '2026-03-10', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-12' }, { status: 'dang_bay', date: '2026-03-25' }] },
  { id: '11', code: 'IKG-ZL-260311-011', status: 'dang_bay', source: 'Zalo', senderName: 'Mai Thị Lan', senderPhone: '0901234568', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Kato Haruto', receiverAddress: 'Niigata, Chuo-ku, 2-2-2', receiverPhone: '090-7878-9090', itemType: 'Quần áo', weightKg: 9, dimL: 55, dimW: 40, dimH: 30, totalFee: 1050000, carrier: 'DHL', trackingCode: 'DHL5544332211', shipDate: '2026-03-26', hasIssue: true, issueReason: 'Lỗi vận chuyển', issueDesc: 'Thời tiết xấu, bay chậm 1 ngày', issueSolution: 'Thông báo khách hàng thông cảm', createdAt: '2026-03-11', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-13' }, { status: 'dang_bay', date: '2026-03-26' }] },
  { id: '12', code: 'IKG-FB-260312-012', status: 'dang_bay', source: 'Facebook', senderName: 'Phan Quốc Minh', senderPhone: '0912345679', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Morita Aiko', receiverAddress: 'Okayama, Kita-ku, 4-4-4', receiverPhone: '070-2323-4545', itemType: 'Khác', weightKg: 20, dimL: 70, dimW: 50, dimH: 40, totalFee: 2330000, carrier: 'Sagawa', trackingCode: 'SGW1122334455', shipDate: '2026-03-27', createdAt: '2026-03-12', assignedTo: 'Trần Thị Mai', statusHistory: [{ status: 'van_chuyen_noi_dia', date: '2026-03-14' }, { status: 'dang_bay', date: '2026-03-27' }] },
  
  // Hoàn thành
  { id: '13', code: 'IKG-TT-260301-013', status: 'hoan_thanh', source: 'TikTok', senderName: 'Đỗ Thị Ngọc', senderPhone: '0923456780', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Kimura Daiki', receiverAddress: 'Tokyo, Shibuya-ku, 9-9-9', receiverPhone: '080-6767-8989', itemType: 'Thực phẩm', weightKg: 6, dimL: 40, dimW: 30, dimH: 25, totalFee: 705000, carrier: 'EMS', trackingCode: 'EMS1111222233', shipDate: '2026-03-03', createdAt: '2026-03-01', assignedTo: 'Trần Thị Mai', 
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-01', note: 'Tiếp nhận yêu cầu từ TikTok' },
      { status: 'lead_moi', date: '2026-03-02', note: 'Khách xác nhận chốt đơn' },
      { status: 'lead_moi', date: '2026-03-02', note: 'LỖI: Thiếu ảnh CMND mặt sau. XỬ LÝ: Đã gọi khách bổ sung qua Zalo' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-03', note: 'Đã nhận hàng tại kho Nhật' },
      { status: 'dang_bay', date: '2026-03-05', note: 'Chuyến bay bay số hiệu NH832' },
      { status: 'hoan_thanh', date: '2026-03-08', note: 'Giao hàng thành công' }
    ] 
  },
  { id: '14', code: 'IKG-WEB-260302-014', status: 'hoan_thanh', source: 'Website', senderName: 'Trịnh Văn Phú', senderPhone: '0934567891', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Shimizu Yuna', receiverAddress: 'Osaka, Tennoji-ku, 6-6-6', receiverPhone: '090-4545-6767', itemType: 'Mỹ phẩm', weightKg: 3, dimL: 30, dimW: 20, dimH: 15, totalFee: 345000, carrier: 'DHL', trackingCode: 'DHL4444555566', shipDate: '2026-03-04', createdAt: '2026-03-02', assignedTo: 'Trần Thị Mai', 
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-02', note: 'Đơn từ landing page' },
      { status: 'lead_moi', date: '2026-03-03', note: 'Khách thanh toán qua Vietcombank' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-04', note: 'Đang gom hàng nội địa' },
      { status: 'dang_bay', date: '2026-03-06' },
      { status: 'hoan_thanh', date: '2026-03-09' }
    ] 
  },
  { id: '15', code: 'IKG-K-260303-015', status: 'hoan_thanh', source: 'Khác', senderName: 'Cao Thị Quỳnh', senderPhone: '0945678902', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Honda Taro', receiverAddress: 'Nagoya, Nakamura-ku, 8-8-8', receiverPhone: '070-8989-0101', itemType: 'Quần áo', weightKg: 11, dimL: 55, dimW: 45, dimH: 35, totalFee: 1280000, carrier: 'Sagawa', trackingCode: 'SGW7777888899', shipDate: '2026-03-05', createdAt: '2026-03-03', assignedTo: 'Trần Thị Mai', 
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-03', note: 'Khách quen giới thiệu' },
      { status: 'lead_moi', date: '2026-03-04' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-05' },
      { status: 'dang_bay', date: '2026-03-07' },
      { status: 'hoan_thanh', date: '2026-03-10' }
    ] 
  },
  { id: '16', code: 'IKG-FB-260304-016', status: 'hoan_thanh', source: 'Facebook', senderName: 'Lê Thị Ry', senderPhone: '0956789013', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Matsuda Ken', receiverAddress: 'Sapporo, Toyohira-ku, 1-3-5', receiverPhone: '080-0202-0303', itemType: 'Đồ điện tử', weightKg: 5, dimL: 45, dimW: 30, dimH: 20, totalFee: 590000, carrier: 'EMS', trackingCode: 'EMS3333444455', shipDate: '2026-03-06', createdAt: '2026-03-04', assignedTo: 'Trần Thị Mai', 
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-04', note: 'Inbox từ Fanpage' },
      { status: 'lead_moi', date: '2026-03-05' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-06' },
      { status: 'dang_bay', date: '2026-03-08' },
      { status: 'hoan_thanh', date: '2026-03-11' }
    ] 
  },
  // Sự cố
  { id: '17', code: 'IKG-ZL-260308-017', status: 'su_co', source: 'Zalo', senderName: 'Đinh Hoàng Nam', senderPhone: '0909123456', senderAddress: 'Hồ Chí Minh, Việt Nam', receiverName: 'Fujita Kana', receiverAddress: 'Tokyo, Koto-ku, 3-5-8', receiverPhone: '080-1122-3344', itemType: 'Thực phẩm', weightKg: 8, dimL: 45, dimW: 35, dimH: 30, totalFee: 935000, carrier: 'EMS', trackingCode: 'EMS7766554433', shipDate: '2026-03-20', createdAt: '2026-03-08', assignedTo: 'Trần Thị Mai',
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-08', note: 'Tiếp nhận từ Zalo' },
      { status: 'lead_moi', date: '2026-03-09', note: 'Khách xác nhận chốt đơn' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-10', note: 'Đã giao hàng cho xe nội địa' },
      { status: 'dang_bay', date: '2026-03-20', note: 'Chuyến bay EMS HAN-NRT' },
      { status: 'su_co', date: '2026-03-22', note: 'LỖI: Hải quan Nhật tạm giữ kiện hàng vì thiếu hoá đơn thực phẩm (FSSC). XỬ LÝ: Đã yêu cầu khách bổ sung chứng từ qua email, dự kiến giải quyết trong 3 ngày làm việc' }
    ]
  },
  { id: '18', code: 'IKG-FB-260309-018', status: 'su_co', source: 'Facebook', senderName: 'Trương Thị Vân', senderPhone: '0918234567', senderAddress: 'Hà Nội, Việt Nam', receiverName: 'Okamoto Ryo', receiverAddress: 'Osaka, Sumiyoshi-ku, 2-4-6', receiverPhone: '090-5566-7788', itemType: 'Mỹ phẩm', weightKg: 5, dimL: 35, dimW: 25, dimH: 20, totalFee: 655000, carrier: 'DHL', trackingCode: 'DHL8899001122', shipDate: '2026-03-18', createdAt: '2026-03-09', assignedTo: 'Trần Thị Mai',
    statusHistory: [
      { status: 'cho_xac_nhan', date: '2026-03-09', note: 'Inbox từ Fanpage Facebook' },
      { status: 'lead_moi', date: '2026-03-10', note: 'Thanh toán qua MoMo' },
      { status: 'van_chuyen_noi_dia', date: '2026-03-12' },
      { status: 'dang_bay', date: '2026-03-18', note: 'DHL chuyến HAN-KIX' },
      { status: 'su_co', date: '2026-03-21', note: 'LỖI: Mỹ phẩm bị trả về do thừa thể tích cho phép của DHL Japan (quy định max 3kg mỹ phẩm). XỬ LÝ: Liên hệ DHL xin miễn ngoại lệ, song song chuẩn bị phương án gửi lại bằng EMS tách 2 kiện' }
    ]
  },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Nguyễn Văn An', phone: '0901234567', source: 'Facebook', orderCount: 5, totalSpent: 4200000, lastOrder: '2026-03-25' },
  { id: 'c2', name: 'Trần Thị Bình', phone: '0912345678', source: 'Zalo', orderCount: 3, totalSpent: 2100000, lastOrder: '2026-03-26' },
  { id: 'c3', name: 'Lê Minh Châu', phone: '0923456789', source: 'TikTok', orderCount: 2, totalSpent: 1500000, lastOrder: '2026-03-27' },
];

export const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Nguyễn Thanh Tùng', role: 'Admin', phone: '0901111111', email: 'tung@ikigai.vn', ordersHandled: 245, active: true },
  { id: 'e2', name: 'Trần Thị Mai', role: 'Sale', phone: '0902222222', email: 'mai@ikigai.vn', ordersHandled: 189, active: true },
];

export const initialExpenses: Expense[] = [
  { id: '2', date: '2026-03-22', category: 'Vận chuyển nội địa', amount: 12500000, description: 'Phí vận chuyển từ kho đến sân bay' },
  { id: '3', date: '2026-03-15', category: 'Marketing', amount: 8000000, description: 'Chạy quảng cáo Facebook Ads', leadSource: 'Facebook' },
  { id: '4', date: '2026-03-10', category: 'Marketing', amount: 4500000, description: 'Quảng cáo TikTok tháng 3', leadSource: 'TikTok' },
  { id: '5', date: '2026-03-05', category: 'Marketing', amount: 3200000, description: 'Tìm lead Zalo', leadSource: 'Zalo' },
  { id: '6', date: '2026-03-01', category: 'Cước phí đối tác', amount: 56000000, description: 'Phí gửi EMS đợt 1 tháng 3' },
];
