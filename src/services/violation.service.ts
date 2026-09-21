import { api } from '@/lib/axios'
import type {
    ViPham, CreateViPhamDto, UpdateViPhamDto,
    KyLuat, CreateKyLuatDto, UpdateKyLuatDto,
} from '@/types/violation'

// Helper: unwrap global ResponseInterceptor + service double-wrap
const unwrap = (res: any) => {
    const d = res.data?.data ?? res.data
    return d?.data ?? d
}

// ==================== VI PHẠM ====================
export const viPhamService = {
    getAll: async (): Promise<ViPham[]> => {
        const res = await api.get('/vi-pham')
        return unwrap(res)
    },
    getById: async (id: number): Promise<ViPham> => {
        const res = await api.get(`/vi-pham/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateViPhamDto): Promise<ViPham> => {
        const res = await api.post('/vi-pham', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateViPhamDto): Promise<ViPham> => {
        const res = await api.patch(`/vi-pham/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/vi-pham/${id}`)
    },
}

// ==================== KỶ LUẬT ====================
export const kyLuatService = {
    getAll: async (): Promise<KyLuat[]> => {
        const res = await api.get('/ky-luat')
        return unwrap(res)
    },
    getById: async (id: number): Promise<KyLuat> => {
        const res = await api.get(`/ky-luat/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateKyLuatDto): Promise<KyLuat> => {
        const res = await api.post('/ky-luat', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateKyLuatDto): Promise<KyLuat> => {
        const res = await api.patch(`/ky-luat/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/ky-luat/${id}`)
    },
}
