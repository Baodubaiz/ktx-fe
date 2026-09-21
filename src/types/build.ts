export interface Build {
    id: number
    ma_toa: string
    ten_toa?: string | null
    co_so?: string | null
}
export interface CreateBuildDto {
    ma_toa: string
    ten_toa?: string | null
    co_so?: string | null
}
export interface UpdateBuildDto {
    ma_toa?: string
    ten_toa?: string | null
    co_so?: string | null
}

export interface CreateFacilityDto {
    co_so: string
    ma_toa: string
    ten_toa: string
}