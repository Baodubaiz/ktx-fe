import { api } from '@/lib/axios'
import type { Build, CreateBuildDto, UpdateBuildDto, CreateFacilityDto } from '@/types/build'

type ApiResponse<T> = {
    success: boolean
    data: T
}

export const buildService = {
    getAll: async (): Promise<Build[]> => {
        const res = await api.get<ApiResponse<Build[]>>('/toa-nha')
        return res.data.data
    },

    getById: async (id: number): Promise<Build> => {
        const res = await api.get<ApiResponse<Build>>(`/toa-nha/${id}`)
        return res.data.data
    },

    create: async (payload: CreateBuildDto): Promise<Build> => {
        const res = await api.post<ApiResponse<Build>>('/toa-nha', payload)
        return res.data.data
    },

    update: async (id: number, payload: UpdateBuildDto): Promise<Build> => {
        const res = await api.patch<ApiResponse<Build>>(`/toa-nha/${id}`, payload)
        return res.data.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/toa-nha/${id}`)
    },

    getFacilities: async (): Promise<string[]> => {
        const res = await api.get('/toa-nha/co-so')
        const payload = res.data?.data ?? res.data
        if (Array.isArray(payload)) {
            return payload
        }

        if (Array.isArray(payload?.data)) {
            return payload.data
        }

        return []
    },

    createFacility: async (payload: CreateFacilityDto): Promise<Build> => {
        const res = await api.post<ApiResponse<Build>>('/toa-nha/co-so', payload)
        const data = (res as any).data?.data
        if (data?.data) {
            return data.data
        }

        return data
    },

    deleteFacility: async (name: string): Promise<void> => {
        await api.delete(`/toa-nha/co-so/${encodeURIComponent(name)}`)
    },
}
