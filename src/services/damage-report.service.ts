import { api } from '@/lib/axios'
import type {
    BaoCaoHuHong,
    CreateBaoCaoHuHongDto,
    UpdateBaoCaoHuHongDto,
} from '@/types/damage-report'

// Helper: unwrap global ResponseInterceptor + service double-wrap
const unwrap = (res: any) => {
    const d = res.data?.data ?? res.data
    return d?.data ?? d
}

export const baoCaoHuHongService = {
    getAll: async (): Promise<BaoCaoHuHong[]> => {
        const res = await api.get('/bao-cao-hu-hong')
        return unwrap(res)
    },
    getById: async (id: number): Promise<BaoCaoHuHong> => {
        const res = await api.get(`/bao-cao-hu-hong/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateBaoCaoHuHongDto): Promise<BaoCaoHuHong> => {
        const res = await api.post('/bao-cao-hu-hong', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateBaoCaoHuHongDto): Promise<BaoCaoHuHong> => {
        const res = await api.patch(`/bao-cao-hu-hong/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/bao-cao-hu-hong/${id}`)
    },
}
