export type Gender = 'NAM' | 'NU'

export type RoomKind = 'HOC_VIEN' | 'CAN_BO'

export interface Room {
    id: number
    ma_phong: string
    tang_id?: number | null
    so_giuong?: number | null
    gioi_tinh_phong?: Gender | null
    loai_phong?: RoomKind | null

    // optional relation snapshot from Prisma `Tang`
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

    giuong?: Array<{
        id: number
        ma_giuong: string
        lichSuBoTriPhong?: Array<{
            id: number
            hocVien?: {
                id: number
                ma_hoc_vien?: string | null
                ho_ten?: string | null
            } | null
        }>
    }>
    lichSuBoTriPhong?: Array<{ id: number }>
}

export type CreateRoomDto = Omit<Room, 'id' | 'tang'>

export type UpdateRoomDto = Partial<CreateRoomDto>
