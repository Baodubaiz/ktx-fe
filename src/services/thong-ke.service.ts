import { api } from '@/lib/axios'
import type { Student } from '@/types/student'
import type { Room } from '@/types/room'

export interface ThongKeTheoCoSo {
  co_so: string
  tong_toa_nha: number
  tong_tang: number
  tong_phong: number
  tong_hoc_vien: number
}

export interface TongQuanThongKeResponse {
  tong_co_so_unique: number
  tong_toa_nha: number
  tong_phong: number
  tong_hoc_vien: number
  thong_ke_theo_co_so: ThongKeTheoCoSo[]
}

// T3.1: Statistics interfaces
export interface ThongKeTrungDoi {
  trung_doi: string
  so_luong: number
}

export interface ThongKeTieuDoi {
  tieu_doi: string
  so_luong: number
}

export interface ThongKeTrungDoiTheoCoSo {
  co_so: string
  tong_trung_doi: number
  tong_hoc_vien: number
  danh_sach_trung_doi?: Array<{
    don_vi_doi_id: number
    trung_doi: string
    so_luong_hoc_vien: number
    hoc_vien: Array<{
      id: number
      ho_ten: string | null
      ngay_sinh: string | null
      ma_giuong: string | null
      ma_phong: string | null
    }>
  }>
}

export interface ThongKeHocVienResponse {
  tong_hoc_vien: number
  tong_trung_doi_toan_ktx?: number
  thong_ke_trung_doi_theo_co_so?: ThongKeTrungDoiTheoCoSo[]
  thong_ke_theo_trung_doi: ThongKeTrungDoi[]
  thong_ke_theo_tieu_doi?: ThongKeTieuDoi[]
}

export interface ThongKeGiuong {
  tong: number
  dang_su_dung: number
  trong: number
}

export interface ThongKeTrangThaiPhong {
  trang_thai: string
  so_luong: number
}

export interface ThongKeKTXResponse {
  tong_phong: number
  tong_giuong: number
  thong_ke_trang_thai_phong: ThongKeTrangThaiPhong[]
  thong_ke_giuong: ThongKeGiuong
  thong_ke_theo_toa_nha?: Array<{
    toa_nha: string
    so_phong: number
    tong_giuong: number
  }>
}

export const thongKeService = {
  async getTongQuan(): Promise<TongQuanThongKeResponse> {
    const res = await api.get('/thong-ke/tong-quan')
    return res.data?.data ?? res.data
  },

  // T3.1: Get học viên statistics (client-side computation if BE endpoint not available)
  async getThongKeHocVien(students: Student[]): Promise<ThongKeHocVienResponse> {
    // Try BE endpoint first
    try {
      const res = await api.get('/hoc-vien/thong-ke')
      return res.data?.data ?? res.data
    } catch {
      // Fallback: compute from client-side data
      const trungDoiMap = new Map<string, number>()
      const tieuDoiMap = new Map<string, number>()

      students.forEach(s => {
        // Count by trung_doi (don_vi_doi)
        if (s.don_vi_doi_id) {
          const key = (s as any).donViDoi?.ten_don_vi || `Trung đội ${s.don_vi_doi_id}`
          trungDoiMap.set(key, (trungDoiMap.get(key) ?? 0) + 1)
        }

        // Count by tieu_doi (lop_hoc)
        if (s.lop_hoc_id) {
          const key = s.lopHoc?.ten_lop || `Lớp ${s.lop_hoc_id}`
          tieuDoiMap.set(key, (tieuDoiMap.get(key) ?? 0) + 1)
        }
      })

      return {
        tong_hoc_vien: students.length,
        tong_trung_doi_toan_ktx: trungDoiMap.size,
        thong_ke_trung_doi_theo_co_so: [],
        thong_ke_theo_trung_doi: Array.from(trungDoiMap.entries()).map(([name, count]) => ({
          trung_doi: name,
          so_luong: count,
        })),
        thong_ke_theo_tieu_doi: Array.from(tieuDoiMap.entries()).map(([name, count]) => ({
          tieu_doi: name,
          so_luong: count,
        })),
      }
    }
  },

  // T3.1: Get KTX statistics
  async getThongKeKTX(rooms: Room[]): Promise<ThongKeKTXResponse> {
    // Try BE endpoint first
    try {
      const res = await api.get('/phong/thong-ke')
      return res.data?.data ?? res.data
    } catch {
      // Fallback: compute from client-side data
      const trangThaiMap = new Map<string, number>()
      const toaNhaMap = new Map<string, { phong: number; giuong: number }>()

      let totalBeds = 0
      let bedsUsed = 0
      let bedsEmpty = 0

      rooms.forEach(room => {
        const trangThai = room.loai_phong || 'UNKNOWN'
        trangThaiMap.set(trangThai, (trangThaiMap.get(trangThai) ?? 0) + 1)

        const numerOfBeds = room.so_giuong || 0
        totalBeds += numerOfBeds

        // Count real occupied slots from active room assignments in payload.
        const occupied = (room as any).lichSuBoTriPhong?.length ?? 0
        const usedInRoom = Math.min(Math.max(occupied, 0), numerOfBeds)
        bedsUsed += usedInRoom
        bedsEmpty += Math.max(numerOfBeds - usedInRoom, 0)

        // Group by toa_nha
        if ((room as any).tang?.toaNha?.ten_toa) {
          const toaNhaName = (room as any).tang.toaNha.ten_toa
          const current = toaNhaMap.get(toaNhaName) || { phong: 0, giuong: 0 }
          toaNhaMap.set(toaNhaName, {
            phong: current.phong + 1,
            giuong: current.giuong + numerOfBeds,
          })
        }
      })

      return {
        tong_phong: rooms.length,
        tong_giuong: totalBeds,
        thong_ke_trang_thai_phong: Array.from(trangThaiMap.entries()).map(([key, count]) => ({
          trang_thai: key,
          so_luong: count,
        })),
        thong_ke_giuong: {
          tong: totalBeds,
          dang_su_dung: bedsUsed,
          trong: bedsEmpty,
        },
        thong_ke_theo_toa_nha: Array.from(toaNhaMap.entries()).map(([name, stats]) => ({
          toa_nha: name,
          so_phong: stats.phong,
          tong_giuong: stats.giuong,
        })),
      }
    }
  },
}
