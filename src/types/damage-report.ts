export interface BaoCaoHuHong {
    id: number
    trung_doi_id: number | null
    phong_id: number | null
    noi_dung: string | null
    ngay_bao: string | null
    so_lan_bao: number | null
    phong?: {
        id: number
        ma_phong: string
    } | null
    trungDoi?: {
        id: number
        ma_don_vi: string
        ten_don_vi: string | null
    } | null
}

export interface CreateBaoCaoHuHongDto {
    phong_id: number
    trung_doi_id?: number
    noi_dung: string
    ngay_bao?: string
    so_lan_bao?: number
}

export type UpdateBaoCaoHuHongDto = Partial<CreateBaoCaoHuHongDto>
