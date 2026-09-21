// ==================== TÀI SẢN PHÒNG ====================
export interface TaiSanPhong {
    id: number
    phong_id: number
    so_luong: number
    so_luong_tot: number
    so_luong_hu: number
    ghi_chu: string | null
    created_at: string
    updated_at: string
    phong?: {
        id: number
        ma_phong: string
        tang_id?: number | null
        tang?: {
            id: number
            so_tang?: number | null
            toa_nha_id?: number | null
            toaNha?: {
                id: number
                ma_toa?: string | null
                ten_toa?: string | null
                co_so?: string | null
            } | null
        } | null
    } | null
}

export interface CreateTaiSanPhongDto {
    phong_id: number
    so_luong?: number
    so_luong_tot?: number
    so_luong_hu?: number
    ghi_chu?: string
}

export type UpdateTaiSanPhongDto = Partial<CreateTaiSanPhongDto>

// ==================== LỊCH SỬ SỬA CHỮA ====================
export type TrangThaiSuaChua = 'DA_SUA' | 'CHUA_SUA'

export interface LichSuSuaChuaTaiSan {
    id: number
    tai_san_phong_id: number
    ngay_phat_hien: string
    so_luong_hu: number
    mo_ta_hu_hong: string | null
    nguyen_nhan: string | null
    trang_thai: TrangThaiSuaChua
    ngay_sua: string | null
    chi_phi_sua: number | null
    created_at: string
    taiSanPhong?: TaiSanPhong | null
}

export interface CreateLichSuSuaChuaDto {
    tai_san_phong_id: number
    ngay_phat_hien?: string
    so_luong_hu?: number
    mo_ta_hu_hong?: string
    nguyen_nhan?: string
    trang_thai?: TrangThaiSuaChua
    ngay_sua?: string
    chi_phi_sua?: number
}

export type UpdateLichSuSuaChuaDto = Partial<CreateLichSuSuaChuaDto>

// ==================== BỒI THƯỜNG TÀI SẢN ====================
export type HinhThucBoiThuong = 'CHUYEN_KHOAN' | 'TIEN_MAT'

export interface QuanLyBoiThuongTaiSan {
    id: number
    hoc_vien_id: number
    tai_san_hu_hong: number
    so_tien: number
    hinh_thuc: HinhThucBoiThuong
    ngay_boi_thuong: string
    ghi_chu: string | null
    hocVien?: {
        id: number
        ho_ten: string
    } | null
    taiSan?: (LichSuSuaChuaTaiSan & {
        taiSanPhong?: TaiSanPhong | null
    }) | null
}

export interface CreateBoiThuongDto {
    hoc_vien_id: number
    tai_san_hu_hong: number
    so_tien?: number
    hinh_thuc?: HinhThucBoiThuong
    ngay_boi_thuong?: string
    ghi_chu?: string
}

export type UpdateBoiThuongDto = Partial<CreateBoiThuongDto>
