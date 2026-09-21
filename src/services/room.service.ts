import { api } from '@/lib/axios'
import type { Room, CreateRoomDto, UpdateRoomDto } from '@/types/room'

export const roomService = {
    getAll: async (): Promise<Room[]> => {
        const res = await api.get('/phong')
        return res.data.data ?? res.data
    },
    getById: async (id: number): Promise<Room> => {
        const res = await api.get(`/phong/${id}`)
        return res.data.data ?? res.data
    },
    create: async (data: CreateRoomDto): Promise<Room> => {
        const res = await api.post('/phong', data)
        return res.data.data ?? res.data
    },
    update: async (id: number, data: UpdateRoomDto): Promise<Room> => {
        const res = await api.patch(`/phong/${id}`, data)
        return res.data.data ?? res.data
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/phong/${id}`)
    },
    exportExcel: async (): Promise<ArrayBuffer> => {
        const res = await api.get('/phong/export', {
            responseType: 'arraybuffer',
        })
        return res.data
    },
    downloadTemplate: async (): Promise<ArrayBuffer> => {
        const res = await api.get('/phong/template', {
            responseType: 'arraybuffer',
        })
        return res.data
    },
    importExcel: async (formData: FormData): Promise<any> => {
        const res = await api.post('/phong/import', formData)
        return res.data?.data ?? res.data
    },
}

export default roomService

