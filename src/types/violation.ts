// ==================== VI PHẠM ====================
export type TrangThaiXuLyViPham = 'DA_XU_LY' | 'CHUA_XU_LY'

export interface ViPham {
    id: number
    hoc_vien_id: number
    noi_dung: string
    ngay_vi_pham: string
    hinh_thuc: string
    nguoi_lap: number
    trang_thai: TrangThaiXuLyViPham
    ghi_chu: string | null
    hocVien?: {
        id: number
        ho_ten: string
    }
}

export interface CreateViPhamDto {
    hoc_vien_id: number
    noi_dung?: string
    ngay_vi_pham?: string
    hinh_thuc?: string
    nguoi_lap?: number
    trang_thai?: TrangThaiXuLyViPham
    ghi_chu?: string
}

export type UpdateViPhamDto = Partial<CreateViPhamDto>

// ==================== KỶ LUẬT ====================
export interface HinhThucKyLuat {
    id: number
    ma_hinh_thuc: string
    ten_hinh_thuc_ky_luat: string
    muc_do: string
    mo_ta: string | null
}

export interface KyLuat {
    id: number
    hinh_thuc: number
    vi_pham_id: number
    so_quyet_dinh: string
    ngay_quyet_dinh: string
    viPham?: ViPham
    hinhThucKyLuat?: HinhThucKyLuat
}

export interface CreateKyLuatDto {
    hinh_thuc: number
    vi_pham_id: number
    so_quyet_dinh?: string
    ngay_quyet_dinh?: string
}

export type UpdateKyLuatDto = Partial<CreateKyLuatDto>
