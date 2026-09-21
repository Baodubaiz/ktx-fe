export interface Bed {
    id: number
    ma_giuong: string
    phong_id: number
    
    // Relation snapshots
    phong?: {
        id: number
        ma_phong: string
    }
}

export type CreateBedDto = {
    ma_giuong: string
    phong_id: number
}

export type UpdateBedDto = Partial<Omit<CreateBedDto, 'phong_id'>>
