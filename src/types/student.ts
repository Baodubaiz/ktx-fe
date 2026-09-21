// GioiTinh
export const GIOI_TINH = {
  NAM: 'NAM',
  NU: 'NU',
} as const;

export type GioiTinh = typeof GIOI_TINH[keyof typeof GIOI_TINH];

// Tình trạng hôn nhân
export const TINH_TRANG_HON_NHAN = {
  CHUA_CO_GIA_DINH: 'CHUA_CO_GIA_DINH',
  DA_CO_GIA_DINH: 'DA_CO_GIA_DINH',
  LY_HON: 'LY_HON',
} as const;

export type TinhTrangHonNhan =
  typeof TINH_TRANG_HON_NHAN[keyof typeof TINH_TRANG_HON_NHAN];

// Interface Học Viên (Chỉ lấy các trường hiển thị và lọc)
export interface Student {
  id: number;
  ma_hoc_vien: string;
  ho_ten: string | null;
  ngay_sinh: string | null; // ISO string từ API
  gioi_tinh: GioiTinh | null;
  que_quan: string | null;
  dan_toc: string | null;
  tinh_trang_hon_nhan: TinhTrangHonNhan | null;
  cam_tinh_dang: boolean | null;
  don_vi_doi_id: number | null;
  lop_hoc_id: number | null;
  lopHoc?: {
    id: number;
    ma_lop: string;
    ten_lop: string | null;
    khoa_hoc_id: number | null;
  } | null;
}

// Interface Bộ lọc (Mọi trường đều là Optional)
export interface StudentFilters {
  search?: string;
  ho_rieng?: string;
  ten_rieng?: string;
  gioi_tinh?: GioiTinh | '';
  lop_hoc_id?: number | '';
  khoa_hoc_id?: number | '';
  don_vi_doi_id?: number | '';
  tinh_trang_hon_nhan?: TinhTrangHonNhan | '';
  cam_tinh_dang?: boolean | '';
  ngay_sinh_from?: string | '';
  ngay_sinh_to?: string | '';
  ma_phong?: string | '';
  ma_giuong?: string | '';
  ma_tang?: string | '';
}