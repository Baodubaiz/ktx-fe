import { api } from '@/lib/axios'

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

// ==================== TYPES ====================
export type HinhThucXuLy = 'TRA_PHONG' | 'CHUYEN_PHONG'

export interface LichSuBoTriPhong {
  id: number
  hoc_vien_id?: number
  giuong_id?: number
  phong_id?: number
  toa_nha_id?: number
  tu_ngay?: string
  den_ngay?: string
  dang_o?: boolean
  hinh_thuc_xu_ly?: HinhThucXuLy
  nguoi_thuc_hien_id?: number
  ly_do?: string
  hocVien?: { id: number; ho_ten: string; ma_hoc_vien?: string } | null
  giuong?: { id: number; ma_giuong?: string } | null
  phong?: { id: number; ma_phong: string } | null
  toaNha?: { id: number; ten_toa?: string; ma_toa?: string } | null
  nguoiThucHien?: { id: number; hoTen?: string } | null
}

export interface CreateLichSuBoTriPhongDto {
  hoc_vien_id?: number
  giuong_id?: number
  phong_id?: number
  toa_nha_id?: number
  tu_ngay?: string
  den_ngay?: string
  dang_o?: boolean
  hinh_thuc_xu_ly?: HinhThucXuLy
  nguoi_thuc_hien_id?: number
  ly_do?: string
}

export type UpdateLichSuBoTriPhongDto = Partial<CreateLichSuBoTriPhongDto>

export interface BulkTransferRoomDto {
  phong_nguon_id?: number
  phong_dich_id: number
  hoc_vien_ids?: number[]
  lop_hoc_id?: number
  khoa_hoc_id?: number
  ly_do?: string
}

export interface SwapRoomsDto {
  phong_a_id: number
  phong_b_id: number
  ly_do?: string
}

export interface BulkTransferRoomResult {
  message: string
  so_luong: number
  data: LichSuBoTriPhong[]
}

// ==================== SERVICE ====================
export const lichSuBoTriPhongService = {
  getAll: async (): Promise<LichSuBoTriPhong[]> => {
    const res = await api.get('/lich-su-bo-tri-phong')
    return unwrap(res)
  },
  getById: async (id: number): Promise<LichSuBoTriPhong> => {
    const res = await api.get(`/lich-su-bo-tri-phong/${id}`)
    return unwrap(res)
  },
  create: async (data: CreateLichSuBoTriPhongDto): Promise<LichSuBoTriPhong> => {
    const res = await api.post('/lich-su-bo-tri-phong', data)
    return unwrap(res)
  },
  ganHocVien: async (data: CreateLichSuBoTriPhongDto): Promise<LichSuBoTriPhong> => {
    const res = await api.post('/lich-su-bo-tri-phong/gan-hoc-vien', data)
    return unwrap(res)
  },
  chuyenPhongHangLoat: async (data: BulkTransferRoomDto): Promise<BulkTransferRoomResult> => {
    const res = await api.post('/lich-su-bo-tri-phong/chuyen-phong-hang-loat', data)
    return res.data
  },
  update: async (id: number, data: UpdateLichSuBoTriPhongDto): Promise<LichSuBoTriPhong> => {
    const res = await api.patch(`/lich-su-bo-tri-phong/${id}`, data)
    return unwrap(res)
  },
  swapRooms: async (data: SwapRoomsDto): Promise<any> => {
    const res = await api.post('/lich-su-bo-tri-phong/swap-rooms', data)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/lich-su-bo-tri-phong/${id}`)
  },
}