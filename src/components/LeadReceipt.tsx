import React from 'react';
import { Lead, formatVND, getTierPrice, getBoxFee } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface LeadReceiptProps {
  lead: Lead;
}

export const LeadReceipt = React.forwardRef<HTMLDivElement, LeadReceiptProps>(({ lead }, ref) => {
  const totalWeight = lead.packages?.reduce((sum, p) => sum + p.chargeWeight, 0) || 0;
  
  return (
    <div ref={ref} className="bg-white p-8 max-w-[800px] mx-auto text-slate-900 font-sans" id="printable-receipt">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">IKIGAI LOGISTICS</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mt-1">Dịch vụ vận chuyển Nhật - Việt chuyên nghiệp</p>
          <div className="mt-4 space-y-0.5 text-sm">
            <p><strong>Hotline:</strong> 090.xxxx.xxxx</p>
            <p><strong>Website:</strong> www.ikigai.vn</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold bg-slate-900 text-white px-4 py-1 inline-block mb-3">PHIẾU THU TIỀN</h2>
          <p className="text-sm font-mono"><strong>Mã đơn:</strong> {lead.code}</p>
          <p className="text-sm"><strong>Ngày lập:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b pb-1">NGƯỜI GỬI</h3>
          <p className="font-bold text-lg">{lead.senderName}</p>
          <p className="text-sm leading-relaxed">{lead.senderAddress || 'N/A'}</p>
          <p className="text-sm"><strong>SĐT:</strong> {lead.senderPhone}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b pb-1">NGƯỜI NHẬN</h3>
          <p className="font-bold text-lg">{lead.receiverName}</p>
          <p className="text-sm leading-relaxed">{lead.receiverAddress}</p>
          <p className="text-sm"><strong>SĐT:</strong> {lead.receiverPhone}</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="mb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y-2 border-slate-900">
              <th className="py-3 px-2 text-left text-xs font-black uppercase">STT</th>
              <th className="py-3 px-2 text-left text-xs font-black uppercase">CHI TIẾT KIỆN HÀNG</th>
              <th className="py-3 px-2 text-center text-xs font-black uppercase">TRỌNG LƯỢNG</th>
              <th className="py-3 px-2 text-right text-xs font-black uppercase">ĐƠN GIÁ</th>
              <th className="py-3 px-2 text-right text-xs font-black uppercase">THÀNH TIỀN</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b-2 border-slate-900">
            {lead.packages?.map((pkg, idx) => {
              const price = getTierPrice(pkg.chargeWeight);
              return (
                <React.Fragment key={idx}>
                  {/* Shipping line */}
                  <tr>
                    <td className="py-4 px-2 align-top font-bold">{idx + 1}</td>
                    <td className="py-4 px-2">
                      <p className="font-bold">Phí vận chuyển kiện #{idx + 1}</p>
                      {pkg.dimL > 0 && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                          Kích thước: {pkg.dimL}x{pkg.dimW}x{pkg.dimH} cm
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-2 text-center font-medium">{pkg.chargeWeight} kg</td>
                    <td className="py-4 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(price)}</td>
                    <td className="py-4 px-2 text-right font-bold">{new Intl.NumberFormat('vi-VN').format(pkg.shippingFee)}</td>
                  </tr>
                  {/* Fees lines */}
                  {pkg.hasPackingFee && (
                    <tr className="text-xs text-slate-600 bg-slate-50/50">
                      <td />
                      <td className="py-2 px-2" colSpan={3}>+ Phí đóng gói (vật dụng, thùng carton)</td>
                      <td className="py-2 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(getBoxFee(pkg.chargeWeight))}</td>
                    </tr>
                  )}
                  {pkg.surcharge > 0 && (
                    <tr className="text-xs text-slate-600 bg-slate-50/50">
                      <td />
                      <td className="py-2 px-2" colSpan={3}>+ Phí tách kiện / Surcharge</td>
                      <td className="py-2 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(pkg.surcharge)}</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50">
             <tr>
               <td className="py-4 px-2" colSpan={2}>
                 <p className="text-xs font-bold uppercase text-slate-400">Ghi chú vận phẩm</p>
                 <p className="text-sm italic">{lead.itemType} {lead.notes ? `- ${lead.notes}` : ''}</p>
               </td>
               <td className="py-4 px-2 text-center font-bold">{totalWeight} kg</td>
               <td className="py-4 px-2 text-right font-black uppercase text-xs" colSpan={1}>Tổng cộng</td>
               <td className="py-4 px-2 text-right text-xl font-black text-rose-600">{formatVND(lead.totalFee)}</td>
             </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-12 text-center mt-12 mb-20">
        <div>
          <p className="font-bold mb-20 uppercase text-xs tracking-widest">Khách hàng xác nhận</p>
          <div className="border-t border-dotted border-slate-300 w-48 mx-auto" />
          <p className="text-[10px] text-slate-400 mt-2 italic">(Ký và ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold mb-20 uppercase text-xs tracking-widest">Đại diện Ikigai Logistics</p>
          <div className="border-t border-dotted border-slate-300 w-48 mx-auto" />
          <p className="text-[10px] text-slate-400 mt-2 italic">(Ký và đóng dấu)</p>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center border-t border-slate-200 pt-6">
        <p className="text-sm font-medium">Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của Ikigai Logistics!</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">www.ikigai.vn • Chuyên nghiệp - Tận tâm - Tốc độ</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything first */
          body * { 
            visibility: hidden !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Show ONLY the receipt and its children */
          #printable-receipt, #printable-receipt * { 
            visibility: visible !important; 
          }
          
          /* Position receipt at the top-left */
          #printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            z-index: 9999999 !important;
          }

          /* Ensure proper page breaks and layout */
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
