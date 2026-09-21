import { api } from '../lib/axios';
import { saveAs } from 'file-saver';
import { message } from 'antd';

/**
 * Report service - Handles all PDF report downloads
 * Maps to backend /bao-cao/* endpoints
 */
export const reportService = {
  /**
   * Generic PDF download helper
   */
  _download: async (url: string, filename: string) => {
    const hide = message.loading('Đang tạo báo cáo PDF...', 0);
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      saveAs(blob, filename);
      message.success('Xuất báo cáo thành công');
    } catch (error: any) {
      console.error('Report download error:', error);
      const msg = error?.response?.status === 403
        ? 'Bạn không có quyền xuất báo cáo này'
        : 'Lỗi khi xuất báo cáo. Vui lòng thử lại.';
      message.error(msg);
    } finally {
      hide();
    }
  },

  // ===================================================================
  // BC1-3: Báo cáo tòa nhà / KTX / tầng
  // ===================================================================

  /** BC1: Báo cáo theo tòa nhà */
  bc1ToaNha: (toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc1/toa-nha/${toaNhaId}`,
      `BC1_Toa_Nha_${toaNhaId}.pdf`,
    ),

  /** BC2: Báo cáo toàn bộ KTX */
  bc2ToanBo: () =>
    reportService._download('/bao-cao/bc2/toan-bo', 'BC2_Toan_Bo_KTX.pdf'),

  /** BC3: Báo cáo theo tầng */
  bc3TheoTang: (toaNhaId: number, tangId: number) =>
    reportService._download(
      `/bao-cao/bc3/toa-nha/${toaNhaId}/tang/${tangId}`,
      `BC3_Tang_${tangId}.pdf`,
    ),

  // ===================================================================
  // BC4: Phân công vệ sinh
  // ===================================================================

  /** BC4: Bảng phân công vệ sinh theo tòa nhà */
  bc4PcvsToaNha: (toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc4/toa-nha/${toaNhaId}`,
      `BC4_PCVS_Toa_Nha_${toaNhaId}.pdf`,
    ),

  /** BC4b: Sơ đồ phân công vệ sinh tòa nhà */
  bc4bSoDoPcvs: (toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc4b/toa-nha/${toaNhaId}`,
      `BC4b_So_Do_PCVS_${toaNhaId}.pdf`,
    ),

  // ===================================================================
  // BC5: Phân công vệ sinh theo tầng
  // ===================================================================

  /** BC5: Phân công vệ sinh theo tầng (bảng) */
  bc5PcvsTheoTang: (toaNhaId: number, tangId: number) =>
    reportService._download(
      `/bao-cao/bc5/toa-nha/${toaNhaId}/tang/${tangId}`,
      `BC5_PCVS_Tang_${tangId}.pdf`,
    ),

  /** BC5b: Sơ đồ PCVS theo tầng (văn bản) */
  bc5bSoDoPcvsTang: (toaNhaId: number, tangId: number) =>
    reportService._download(
      `/bao-cao/bc5b/toa-nha/${toaNhaId}/tang/${tangId}`,
      `BC5b_So_Do_PCVS_Tang_${tangId}.pdf`,
    ),

  // ===================================================================
  // BC6-7: Camera & PCCC
  // ===================================================================

  /** BC6: Sơ đồ bố trí camera từng tòa nhà */
  bc6CameraToaNha: (toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc6/toa-nha/${toaNhaId}`,
      `BC6_Camera_Toa_Nha_${toaNhaId}.pdf`,
    ),

  /** BC7: Sơ đồ bố trí thiết bị PCCC từng tòa nhà */
  bc7PcccToaNha: (toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc7/toa-nha/${toaNhaId}`,
      `BC7_PCCC_Toa_Nha_${toaNhaId}.pdf`,
    ),

  // ===================================================================
  // BC8-22: Báo cáo theo CNTĐ (trung đội)
  // ===================================================================

  /** BC8: Báo cáo theo CNTĐ toàn bộ KTX (trích ngang) */
  bc8CntdToanBo: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc8/trung-doi/${donViId}`,
      `BC8_CNTD_Toan_Bo_${donViId}.pdf`,
    ),

  /** BC9: Báo cáo chi tiết 1 trung đội */
  bc9TrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc9/trung-doi/${donViId}`,
      `BC9_Trung_Doi_${donViId}.pdf`,
    ),

  /** BC10: Danh sách nam theo trung đội */
  bc10DsNam: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc10/trung-doi/${donViId}/ds-nam`,
      `BC10_DS_Nam_${donViId}.pdf`,
    ),

  /** BC11: Danh sách nữ theo trung đội */
  bc11DsNu: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc11/trung-doi/${donViId}/ds-nu`,
      `BC11_DS_Nu_${donViId}.pdf`,
    ),

  /** BC12: Theo tòa nhà theo CNTĐ (trích ngang) */
  bc12ToaNhaCntd: (donViId: number, toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc12/trung-doi/${donViId}/toa-nha/${toaNhaId}`,
      `BC12_Toa_Nha_CNTD_${donViId}_${toaNhaId}.pdf`,
    ),

  /** BC13: Theo tòa nhà theo CNTĐ chi tiết */
  bc13ToaNhaCntdChiTiet: (donViId: number, toaNhaId: number) =>
    reportService._download(
      `/bao-cao/bc13/trung-doi/${donViId}/toa-nha/${toaNhaId}`,
      `BC13_Toa_Nha_CNTD_CT_${donViId}_${toaNhaId}.pdf`,
    ),

  /** BC14: Theo tầng, CNTĐ chi tiết */
  bc14TangCntdChiTiet: (donViId: number, tangId: number) =>
    reportService._download(
      `/bao-cao/bc14/trung-doi/${donViId}/tang/${tangId}`,
      `BC14_Tang_CNTD_CT_${donViId}_${tangId}.pdf`,
    ),

  /** BC16: Trung đội theo quê quán */
  bc16TrungDoiQueQuan: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc16/trung-doi/${donViId}/que-quan`,
      `BC16_Trung_Doi_Que_Quan_${donViId}.pdf`,
    ),

  /** BC17: Trung đội theo đơn vị cử đi học */
  bc17TrungDoiDonViCu: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc17/trung-doi/${donViId}/don-vi-cu`,
      `BC17_Trung_Doi_Don_Vi_Cu_${donViId}.pdf`,
    ),

  /** BC18: Học viên nam trung đội */
  bc18HvNamTrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc18/trung-doi/${donViId}/hv-nam`,
      `BC18_HV_Nam_Trung_Doi_${donViId}.pdf`,
    ),

  /** BC19: Học viên nữ trung đội */
  bc19HvNuTrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc19/trung-doi/${donViId}/hv-nu`,
      `BC19_HV_Nu_Trung_Doi_${donViId}.pdf`,
    ),

  /** BC20: Học viên dân tộc thiểu số trung đội */
  bc20DanTocTrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc20/trung-doi/${donViId}/dan-toc`,
      `BC20_Dan_Toc_Trung_Doi_${donViId}.pdf`,
    ),

  /** BC21: Trích ngang trung đội (tổng hợp) */
  bc21TrichNgangTrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc21/trung-doi/${donViId}/trich-ngang`,
      `BC21_Trich_Ngang_Trung_Doi_${donViId}.pdf`,
    ),

  /** BC22: Danh sách đầy đủ học viên trung đội (landscape) */
  bc22DanhSachTrungDoi: (donViId: number) =>
    reportService._download(
      `/bao-cao/bc22/trung-doi/${donViId}/danh-sach`,
      `BC22_Danh_Sach_Trung_Doi_${donViId}.pdf`,
    ),

  // ===================================================================
  // BC23: Thông tin học viên (tìm kiếm)
  // ===================================================================

  /** BC23: Thông tin học viên (tìm theo họ tên đầy đủ) */
  bc23ThongTinHocVien: (hoTen: string) => {
    const params = new URLSearchParams({ hoTen });
    return reportService._download(
      `/bao-cao/bc23/hoc-vien?${params.toString()}`,
      'BC23_Thong_Tin_HV.pdf',
    );
  },

  /** BC23.1: Thông tin học viên (tìm theo từ khóa) */
  bc23_1TimHocVien: (keyword: string) => {
    const params = new URLSearchParams({ keyword });
    return reportService._download(
      `/bao-cao/bc23-1/hoc-vien?${params.toString()}`,
      'BC23_1_Tim_HV.pdf',
    );
  },

  // ===================================================================
  // BC24-25: Báo cáo tổng hợp học viên
  // ===================================================================

  /** BC24: Tình trạng hôn nhân tại KTX */
  bc24TinhTrangHonNhan: () =>
    reportService._download('/bao-cao/bc24/hon-nhan', 'BC24_Hon_Nhan.pdf'),

  /** BC25: Đảng viên tại KTX */
  bc25DangVien: () =>
    reportService._download('/bao-cao/bc25/dang-vien', 'BC25_Dang_Vien.pdf'),

  // ===================================================================
  // BC15: Vi phạm theo trung đội
  // ===================================================================

  /** BC15: Báo cáo vi phạm theo trung đội */
  bc15ViPham: (donViId: number, tuNgay?: string, denNgay?: string) => {
    const params = new URLSearchParams();
    if (tuNgay) params.set('tuNgay', tuNgay);
    if (denNgay) params.set('denNgay', denNgay);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return reportService._download(
      `/bao-cao/bc15/trung-doi/${donViId}/vi-pham${qs}`,
      `BC15_Vi_Pham_${donViId}.pdf`,
    );
  },

  // ===================================================================
  // BC27: Báo cáo hư hỏng KTX
  // ===================================================================

  /** BC27: Báo cáo hư hỏng KTX */
  bc27HuHongKtx: () =>
    reportService._download('/bao-cao/bc27/hu-hong', 'BC27_Hu_Hong_KTX.pdf'),

  // ===================================================================
  // BC30: Thống kê tài sản phòng
  // ===================================================================

  /** BC30: Thống kê tài sản bàn giao phòng ở */
  bc30ThongKeTaiSan: (phongId: number) =>
    reportService._download(
      `/bao-cao/bc30/phong/${phongId}/tai-san`,
      `BC30_Tai_San_Phong_${phongId}.pdf`,
    ),
};
