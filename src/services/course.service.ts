import { api } from '@/lib/axios'

export interface KhoaHoc {
  id: number
  ma_khoa: string
  ten_khoa: string
}

export const courseService = {
  getAll: async (): Promise<KhoaHoc[]> => {
    const res = await api.get('/khoa-hoc')
    const data = res.data?.data
    return Array.isArray(data) ? data : (data?.data ?? [])
  },
}
