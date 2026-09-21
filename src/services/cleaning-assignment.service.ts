import { api } from '@/lib/axios'
import type {
    PhanCongVeSinh,
    CreatePhanCongVeSinhDto,
    UpdatePhanCongVeSinhDto,
} from '@/types/cleaning-document'

const unwrap = (res: any) => {
    const d = res.data?.data ?? res.data
    return d?.data ?? d
}

export const phanCongVeSinhService = {
    getAll: async (): Promise<PhanCongVeSinh[]> => {
        const res = await api.get('/phan-cong-ve-sinh')
        return unwrap(res)
    },
    getById: async (id: number): Promise<PhanCongVeSinh> => {
        const res = await api.get(`/phan-cong-ve-sinh/${id}`)
        return unwrap(res)
    },
    create: async (data: CreatePhanCongVeSinhDto): Promise<PhanCongVeSinh> => {
        const res = await api.post('/phan-cong-ve-sinh', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdatePhanCongVeSinhDto): Promise<PhanCongVeSinh> => {
        const res = await api.patch(`/phan-cong-ve-sinh/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/phan-cong-ve-sinh/${id}`)
    },
    exportExcel: async (): Promise<ArrayBuffer> => {
        const res = await api.get('/phan-cong-ve-sinh/export', {
            responseType: 'arraybuffer',
        })
        return res.data
    },
    downloadTemplate: async (): Promise<ArrayBuffer> => {
        const res = await api.get('/phan-cong-ve-sinh/template', {
            responseType: 'arraybuffer',
        })
        return res.data
    },
    importExcel: async (formData: FormData): Promise<any> => {
        const res = await api.post('/phan-cong-ve-sinh/import', formData)
        return res.data?.data ?? res.data
    },
}
