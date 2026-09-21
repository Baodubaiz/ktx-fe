import { api } from '@/lib/axios'
import type {
    TaiSanPhong, CreateTaiSanPhongDto, UpdateTaiSanPhongDto,
    LichSuSuaChuaTaiSan, CreateLichSuSuaChuaDto, UpdateLichSuSuaChuaDto,
    QuanLyBoiThuongTaiSan, CreateBoiThuongDto, UpdateBoiThuongDto,
} from '@/types/asset'

// ==================== TÀI SẢN PHÒNG ====================
// Helper: unwrap global ResponseInterceptor { success, data } wrapper
const unwrap = (res: any) => {
    const d = res.data?.data ?? res.data
    // Handle double-wrap: { message, data: [...] }
    return d?.data ?? d
}

export const taiSanPhongService = {
    getAll: async (): Promise<TaiSanPhong[]> => {
        const res = await api.get('/tai-san-phong')
        return unwrap(res)
    },
    getById: async (id: number): Promise<TaiSanPhong> => {
        const res = await api.get(`/tai-san-phong/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateTaiSanPhongDto): Promise<TaiSanPhong> => {
        const res = await api.post('/tai-san-phong', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateTaiSanPhongDto): Promise<TaiSanPhong> => {
        const res = await api.patch(`/tai-san-phong/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/tai-san-phong/${id}`)
    },
}

// ==================== LỊCH SỬ SỬA CHỮA ====================
export const lichSuSuaChuaService = {
    getAll: async (): Promise<LichSuSuaChuaTaiSan[]> => {
        const res = await api.get('/lich-su-sua-chua-tai-san')
        return unwrap(res)
    },
    getById: async (id: number): Promise<LichSuSuaChuaTaiSan> => {
        const res = await api.get(`/lich-su-sua-chua-tai-san/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateLichSuSuaChuaDto): Promise<LichSuSuaChuaTaiSan> => {
        const res = await api.post('/lich-su-sua-chua-tai-san', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateLichSuSuaChuaDto): Promise<LichSuSuaChuaTaiSan> => {
        const res = await api.patch(`/lich-su-sua-chua-tai-san/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/lich-su-sua-chua-tai-san/${id}`)
    },
}

// ==================== BỒI THƯỜNG TÀI SẢN ====================
export const boiThuongService = {
    getAll: async (): Promise<QuanLyBoiThuongTaiSan[]> => {
        const res = await api.get('/quan-ly-boi-thuong-tai-san')
        return unwrap(res)
    },
    getById: async (id: number): Promise<QuanLyBoiThuongTaiSan> => {
        const res = await api.get(`/quan-ly-boi-thuong-tai-san/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateBoiThuongDto): Promise<QuanLyBoiThuongTaiSan> => {
        const res = await api.post('/quan-ly-boi-thuong-tai-san', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateBoiThuongDto): Promise<QuanLyBoiThuongTaiSan> => {
        const res = await api.patch(`/quan-ly-boi-thuong-tai-san/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/quan-ly-boi-thuong-tai-san/${id}`)
    },
}
