import React from 'react';
import { Lead, formatVND, getTierPrice, getBoxFee } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface LeadReceiptProps {
  lead: Lead;
}

export const LeadReceipt = React.forwardRef<HTMLDivElement, LeadReceiptProps>(({ lead }, ref) => {
  const totalWeight = lead.packages?.reduce((sum, p) => sum + p.chargeWeight, 0) || 0;
  
  return (
    <div ref={ref} className="bg-white p-[10mm] w-[210mm] min-h-[297mm] mx-auto text-slate-900 font-sans text-sm" id="printable-receipt">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">IKIGAI LOGISTICS</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-4">Professional Japan - Vietnam Logistics</p>
          <div className="space-y-1 text-xs">
            <p className="flex items-center gap-2"><span className="font-bold w-12">Hotline:</span> 090.xxxx.xxxx</p>
            <p className="flex items-center gap-2"><span className="font-bold w-12">Website:</span> www.ikigai.vn</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-slate-900 text-white px-6 py-2 font-black text-xl mb-4 tracking-wider">
            BÁO GIÁ
          </div>
          <div className="text-right space-y-1 font-medium">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mã vận đơn nội bộ</p>
            <p className="text-base font-bold font-mono uppercase">{lead.code}</p>
            <div className="h-px bg-slate-200 w-32 ml-auto my-2" />
            <p className="text-sm">Ngày lập: <span className="font-bold">{new Date().toLocaleDateString('vi-VN')}</span></p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="relative pl-4 border-l-2 border-slate-200">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Thông tin người gửi</h3>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-900">{lead.senderName}</p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">{lead.senderAddress || '—'}</p>
            <p className="text-xs font-bold text-slate-900 mt-2">SĐT: {lead.senderPhone}</p>
          </div>
        </div>
        <div className="relative pl-4 border-l-2 border-slate-200">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Thông tin người nhận</h3>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-900">{lead.receiverName}</p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">{lead.receiverAddress}</p>
            <p className="text-xs font-bold text-slate-900 mt-2">SĐT: {lead.receiverPhone}</p>
          </div>
        </div>
      </div>

      {/* Main Breakdown Area */}
      <div className="mb-10 min-h-[300px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
              <th className="p-3 text-center text-[10px] font-black uppercase tracking-wider w-12">STT</th>
              <th className="p-3 text-left text-[10px] font-black uppercase tracking-wider">Nội dung chi tiết</th>
              <th className="p-3 text-center text-[10px] font-black uppercase tracking-wider w-32">Trọng lượng</th>
              <th className="p-3 text-right text-[10px] font-black uppercase tracking-wider w-32">Đơn giá</th>
              <th className="p-3 text-right text-[10px] font-black uppercase tracking-wider w-40">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {lead.packages?.map((pkg, idx) => {
              const price = getTierPrice(pkg.chargeWeight);
              const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
              const formattedShipping = new Intl.NumberFormat('vi-VN').format(pkg.shippingFee);
              
              return (
                <React.Fragment key={idx}>
                  <tr className="border-b border-slate-100 group">
                    <td className="p-4 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="p-4">
                      <span className="font-black text-slate-800">Phí vận chuyển kiện #{idx + 1}</span>
                      {pkg.dimL > 0 && (
                        <div className="text-[9px] text-slate-400 font-mono mt-1 flex gap-2">
                          <span>KÍCH THƯỚC: {pkg.dimL}x{pkg.dimW}x{pkg.dimH} CM</span>
                          <span>|</span>
                          <span>QUY ĐỔI: {pkg.volWeight} KG</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center font-black tabular-nums">{pkg.chargeWeight} kg</td>
                    <td className="p-4 text-right font-medium tabular-nums text-slate-500">{formattedPrice}</td>
                    <td className="p-4 text-right font-black tabular-nums">{formattedShipping}</td>
                  </tr>
                  
                  {pkg.hasPackingFee && (
                    <tr className="bg-slate-50 border-b border-white text-[11px] text-slate-600">
                      <td />
                      <td className="p-2 px-4 italic" colSpan={3}>+ Phí đóng gói tiêu chuẩn (Thùng carton, vật dụng bảo quản)</td>
                      <td className="p-2 px-4 text-right font-bold tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(getBoxFee(pkg.chargeWeight))}
                      </td>
                    </tr>
                  )}
                  
                  {pkg.surcharge > 0 && (
                    <tr className="bg-slate-50 border-b border-white text-[11px] text-slate-600">
                      <td />
                      <td className="p-2 px-4 italic" colSpan={3}>+ Surcharge / Phí tách thùng, xử lý phát sinh</td>
                      <td className="p-2 px-4 text-right font-bold tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(pkg.surcharge)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer Section */}
      <div className="grid grid-cols-[1fr_2fr] gap-10 mt-auto border-t-4 border-slate-900 pt-8">
        <div>
          <div className="bg-slate-100 p-4 rounded border-l-4 border-slate-400">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ghi chú vận phẩm</h4>
            <p className="text-xs italic leading-relaxed text-slate-600 font-medium font-serif">
              "{lead.itemType} {lead.notes ? `| ${lead.notes}` : ''}"
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-baseline px-4 text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Tổng trọng lượng thực tế</span>
            <span className="text-xl font-bold tabular-nums">{totalWeight} <span className="text-xs">KG</span></span>
          </div>
          <div className="flex justify-between items-center p-6 border-t-2 border-slate-900">
            <span className="text-lg font-black tracking-[0.1em] uppercase text-slate-900">Thanh toán:</span>
            <div className="text-right">
              <span className="text-3xl font-black tabular-nums text-rose-600">{formatVND(lead.totalFee)}</span>
              <p className="text-[10px] text-slate-400 italic mt-1">(Đã bao gồm tất cả các phí dịch vụ)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formal Signature Area */}
      <div className="grid grid-cols-2 gap-20 text-center mt-20 mb-24">
        <div className="flex flex-col items-center">
          <p className="font-black text-xs uppercase tracking-[0.25em] mb-24 text-slate-400">Xác nhận của khách hàng</p>
          <div className="w-48 h-px bg-slate-200 border-dashed border-t" />
          <p className="text-[10px] text-slate-400 mt-3 italic italic">(Ký và ghi rõ họ tên)</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-black text-xs uppercase tracking-[0.25em] mb-24 text-slate-900">Đại diện Ikigai Logistics</p>
          <div className="w-48 h-px bg-slate-200 border-dashed border-t" />
          <p className="text-[10px] text-slate-400 mt-3 italic">(Ký, đóng dấu & ghi ngày)</p>
        </div>
      </div>

      {/* Legal/Footer */}
      <div className="border-t border-slate-100 pt-8 text-center text-slate-400 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest leading-loose">
          IKIGAI LOGISTICS • Chuyên nghiệp - Tận tâm - Tốc độ
        </p>
        <p className="text-[9px] max-w-2xl mx-auto leading-relaxed">
          Quý khách vui lòng kiểm tra kỹ số lượng kiện hàng và tình trạng niêm phong khi nhận. Mọi khiếu nại về sau liên quan đến việc thiếu hụt hàng hóa sẽ khó được giải quyết nếu không có biên bản đồng kiểm tại chỗ. Trân trọng cảm ơn!
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #printable-receipt, #printable-receipt * { visibility: visible !important; }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
});

LeadReceipt.displayName = 'LeadReceipt';
