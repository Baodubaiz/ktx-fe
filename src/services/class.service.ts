import { api } from '@/lib/axios'

export interface LopHoc {
  id: number
  ma_lop: string
  ten_lop?: string | null
  khoa_hoc_id?: number | null
}

export const classService = {
  getAll: async (): Promise<LopHoc[]> => {
    const res = await api.get('/lop-hoc')
    const data = res.data?.data
    return Array.isArray(data) ? data : (data?.data ?? [])
  },
}
