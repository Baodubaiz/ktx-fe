import { api } from '@/lib/axios'
import type { Floor, CreateFloorDto, UpdateFloorDto } from '@/types/floor'

type ApiResponse<T> = {
    success: boolean
    data: T
}

export const floorService = {

    // ✅ LẤY TẤT CẢ TẦNG
    getAll: async (): Promise<Floor[]> => {
        const res = await api.get<ApiResponse<Floor[]>>('/tang')
        return res.data.data
    },

    // Lấy tầng theo tòa nhà
    getByBuild: async (buildId: number): Promise<Floor[]> => {
        const res = await api.get<ApiResponse<Floor[]>>(
            `/tang/toa-nha/${buildId}`
        )
        return res.data.data
    },

    getById: async (floorId: number): Promise<Floor> => {
        const res = await api.get<ApiResponse<Floor>>(`/tang/${floorId}`)
        return res.data.data
    },

    create: async (payload: CreateFloorDto): Promise<Floor> => {
        const res = await api.post<ApiResponse<Floor>>(`/tang`, payload)
        return res.data.data
    },

    update: async (
        floorId: number,
        payload: UpdateFloorDto
    ): Promise<Floor> => {
        const res = await api.patch<ApiResponse<Floor>>(
            `/tang/${floorId}`,
            payload
        )
        return res.data.data
    },

    delete: async (floorId: number): Promise<void> => {
        await api.delete(`/tang/${floorId}`)
    },
}
