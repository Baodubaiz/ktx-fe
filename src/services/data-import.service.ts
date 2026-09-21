import { api } from '@/lib/axios'

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

// ==================== TYPES ====================
export type TrangThaiImport = 'DA_DUYET' | 'DANG_DUYET' | 'TU_CHOI'

export interface PhienNhapDuLieu {
  id: number
  loai_du_lieu_id?: number
  file_name?: string
  nguoi_import_id?: number
  nguoi_duyet_id?: number
  thoi_diem_import?: string
  thoi_diem_duyet?: string
  trang_thai?: TrangThaiImport
  ghi_chu?: string
  loaiDuLieu?: { id: number; ten_loai?: string } | null
  nguoiImport?: { id: number; hoTen?: string } | null
  nguoiDuyet?: { id: number; hoTen?: string } | null
}

export interface CreatePhienNhapDuLieuDto {
  loai_du_lieu_id?: number
  file_name?: string
  nguoi_import_id?: number
  thoi_diem_import?: string
  trang_thai?: TrangThaiImport
  ghi_chu?: string
}

export type UpdatePhienNhapDuLieuDto = Partial<CreatePhienNhapDuLieuDto>

// ==================== SERVICE ====================
export const phienNhapDuLieuService = {
  getAll: async (): Promise<PhienNhapDuLieu[]> => {
    const res = await api.get('/phien-nhap-du-lieu')
    return unwrap(res)
  },
  getById: async (id: number): Promise<PhienNhapDuLieu> => {
    const res = await api.get(`/phien-nhap-du-lieu/${id}`)
    return unwrap(res)
  },
  create: async (data: CreatePhienNhapDuLieuDto): Promise<PhienNhapDuLieu> => {
    const res = await api.post('/phien-nhap-du-lieu', data)
    return unwrap(res)
  },
  update: async (id: number, data: UpdatePhienNhapDuLieuDto): Promise<PhienNhapDuLieu> => {
    const res = await api.patch(`/phien-nhap-du-lieu/${id}`, data)
    return unwrap(res)
  },
  approve: async (id: number): Promise<PhienNhapDuLieu> => {
    const res = await api.post(`/hoc-vien/import/${id}/approve`)
    return unwrap(res)
  },
  reject: async (id: number): Promise<PhienNhapDuLieu> => {
    const res = await api.post(`/hoc-vien/import/${id}/reject`)
    return unwrap(res)
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/phien-nhap-du-lieu/${id}`)
  },
}
