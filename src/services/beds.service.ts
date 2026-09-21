import { api } from '@/lib/axios'
import type { Bed, CreateBedDto, UpdateBedDto } from '@/types/beds'

export const bedService = {
    getAll: async (): Promise<Bed[]> => {
        const res = await api.get('/giuong')
        return res.data.data ?? res.data
    },
    getById: async (id: number): Promise<Bed> => {
        const res = await api.get(`/giuong/${id}`)
        return res.data.data ?? res.data
    },
    create: async (data: CreateBedDto): Promise<Bed> => {
        const res = await api.post('/giuong', data)
        return res.data.data ?? res.data
    },
    update: async (id: number, data: UpdateBedDto): Promise<Bed> => {
        const res = await api.patch(`/giuong/${id}`, data)
        return res.data.data ?? res.data
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/giuong/${id}`)
    },
    getByRoomId: async (roomId: number): Promise<Bed[]> => {
        const res = await api.get(`/giuong/phong/${roomId}`)
        return res.data.data ?? res.data
    },
}

export default bedService
