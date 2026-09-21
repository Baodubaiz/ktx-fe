export interface PhanCongVeSinh {
    id: number
    vi_tri_id: number | null
    trung_doi_phu_trach: number | null
    thoi_gian: string | null
    viTri?: {
        id: number
        toa_nha_id: number | null
        tang_id: number | null
        ten_vi_tri: string | null
        toaNha?: { id: number; ma_toa: string; ten_toa: string | null }
        tang?: { id: number; ma_tang: string; ten_tang: string | null }
    }
    trungDoi?: {
        id: number
        ma_don_vi: string
        ten_don_vi: string | null
    }
}

export interface CreatePhanCongVeSinhDto {
    vi_tri_id?: number
    trung_doi_phu_trach?: number
    thoi_gian?: string
}

export type UpdatePhanCongVeSinhDto = Partial<CreatePhanCongVeSinhDto>

// ==================== SƠ ĐỒ ====================

export interface SoDo {
    id: number
    toa_nha_id: number | null
    loai: string | null
    ten_van_ban: string | null
    ngay_cap_nhat: string | null
    file_path: string | null
    toaNha?: {
        id: number
        ma_toa: string
        ten_toa: string | null
    }
}

export interface CreateSoDoDto {
    toa_nha_id?: number
    loai: string
    ten_van_ban: string
    ngay_cap_nhat?: string
    file_path: string
}

export type UpdateSoDoDto = Partial<CreateSoDoDto>
