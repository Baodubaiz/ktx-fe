import { useState, useEffect, useMemo } from 'react'
import { Typography, Button, Card, message, Space, Segmented, Popconfirm, Badge, Breadcrumb, Select, Input, Divider, Row, Col } from 'antd'
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { saveAs } from 'file-saver'
import { useLocation } from 'react-router-dom'
import { PageHeader, PageContainer, ReportExportModal } from '@/components'
import type { ReportGroup, ReportModalFilters } from '@/components'
import useRoom from '@/hooks/useRoom'
import { useBuild } from '@/hooks/useBuild'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { reportService } from '@/services/report.service'
import { lichSuBoTriPhongService } from '@/services/room-assignment.service'
import { lichSuSuaChuaService } from '@/services/asset.service'
import { thongKeService } from '@/services/thong-ke.service'
import type { Room } from '@/types/room'
import RoomTable from './components/RoomTable'
import RoomGrid from './components/RoomGrid'
import StatisticsSection from './components/StatisticsSection'
import RoomDetailModal from './components/RoomDetailModal'
import AddRoomModal from './components/AddRoomModal'
import UpdateRoomModal from './components/UpdateRoomModal'
import ImportRoomModal from './components/ImportRoomModal'
import { systemTheme } from '@/theme/system-theme'
import './rooms.css'

const { Text } = Typography

type ViewMode = 'table' | 'grid'

interface RoomFilters {
  search: string
  coSo: string
  toaNha: string
  tang: number | undefined
  loaiPhong: string
  gioiTinh: string
  trangThai: '' | 'FULL' | 'AVAILABLE' | 'EMPTY' | 'UNDER_REPAIR'
}

type RoomStatus = 'FULL' | 'AVAILABLE' | 'EMPTY' | 'UNDER_REPAIR'

export default function Rooms() {
  const location = useLocation()
  const { rooms, loading, fetchAll } = useRoom()
  const { builds, getBuilds } = useBuild()

  // Floors fetched from API for the selected building filter
  const [filterFloors, setFilterFloors] = useState<any[]>([])

  // Modal states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // Filter states
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    coSo: '',
    toaNha: '',
    tang: undefined,
    loaiPhong: '',
    gioiTinh: '',
    trangThai: '',
  })

  const [occupiedByRoom, setOccupiedByRoom] = useState<Record<number, number>>({})
  const [repairingRoomIds, setRepairingRoomIds] = useState<Set<number>>(new Set())
  const [bedStatsFromDb, setBedStatsFromDb] = useState<{ tong: number; dang_su_dung: number; trong: number } | null>(null)

  // Auto-open add modal when navigated from dashboard Quick Actions
  useEffect(() => {
    if (location.state?.openAdd) {
      setIsAddModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Load initial data
  useEffect(() => {
    fetchAll()
    getBuilds()
  }, [])

  useEffect(() => {
    const loadKtxStats = async () => {
      try {
        const stats = await thongKeService.getThongKeKTX(rooms)
        setBedStatsFromDb(stats.thong_ke_giuong ?? null)
      } catch {
        setBedStatsFromDb(null)
      }
    }

    loadKtxStats()
  }, [rooms])

  // Fetch floors from API when building filter changes
  useEffect(() => {
    if (filters.toaNha) {
      floorService.getByBuild(Number(filters.toaNha))
        .then((data) => setFilterFloors(data))
        .catch(() => setFilterFloors([]))
    } else {
      setFilterFloors([])
    }
  }, [filters.toaNha])

  // Derived filter options - use builds data so newly added facilities/floors appear
  const tangOptions = useMemo(() => {
    return filterFloors
      .map((f) => f.so_tang)
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b)
  }, [filterFloors])

  const coSoOptions = useMemo(() => {
    const list = builds
      .map((b) => b.co_so?.trim())
      .filter((v): v is string => !!v)

    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'vi'))
  }, [builds])

  const drilldownBuilds = useMemo(() => {
    if (!filters.coSo) return builds
    return builds.filter((b) => (b.co_so?.trim() || 'Chưa xác định') === filters.coSo)
  }, [builds, filters.coSo])

  const selectedBuilding = useMemo(
    () => builds.find((b) => b.id.toString() === filters.toaNha),
    [builds, filters.toaNha],
  )

  // Static options - always show all possible values regardless of room data
  const loaiPhongOptions: ('HOC_VIEN' | 'CAN_BO')[] = ['HOC_VIEN', 'CAN_BO']

  const gioiTinhOptions: ('NAM' | 'NU')[] = ['NAM', 'NU']

  // Filtered rooms
  const getRoomStatus = (room: Room): RoomStatus => {
    if (repairingRoomIds.has(room.id)) return 'UNDER_REPAIR'
    const capacity = Number(room.so_giuong ?? 0)
    const occupied = occupiedByRoom[room.id] ?? 0
    if (occupied <= 0) return 'EMPTY'
    if (capacity > 0 && occupied >= capacity) return 'FULL'
    return 'AVAILABLE'
  }

  const statusLabelMap: Record<RoomStatus, string> = {
    FULL: 'Full',
    AVAILABLE: 'Còn chỗ',
    EMPTY: 'Trống',
    UNDER_REPAIR: 'Đang sửa chữa',
  }

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = !filters.search ||
        room.ma_phong?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesToaNha = !filters.toaNha ||
        room.tang?.toa_nha_id?.toString() === filters.toaNha

      const matchesCoSo = !filters.coSo ||
        (room.tang?.toaNha?.co_so?.trim() || 'Chưa xác định') === filters.coSo

      const matchesTang = filters.tang === undefined ||
        room.tang?.so_tang === filters.tang

      const matchesLoaiPhong = !filters.loaiPhong ||
        room.loai_phong === filters.loaiPhong

      const matchesGioiTinh = !filters.gioiTinh ||
        room.gioi_tinh_phong === filters.gioiTinh

      const matchesTrangThai = !filters.trangThai || getRoomStatus(room) === filters.trangThai

      return matchesSearch && matchesCoSo && matchesToaNha && matchesTang && matchesLoaiPhong && matchesGioiTinh && matchesTrangThai
    })
  }, [rooms, filters, occupiedByRoom, repairingRoomIds])

  const roomStatusSummary = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        const status = getRoomStatus(room)
        acc[status] += 1
        return acc
      },
      { FULL: 0, AVAILABLE: 0, EMPTY: 0, UNDER_REPAIR: 0 } as Record<RoomStatus, number>,
    )
  }, [rooms, occupiedByRoom, repairingRoomIds])

  // Report groups for the export modal
  const reportGroups = useMemo<ReportGroup[]>(() => [
    {
      title: 'Báo cáo theo Tòa nhà / Tầng',
      items: [
        { key: 'bc2', label: 'BC2 - Tổng hợp toàn bộ KTX', onExport: () => reportService.bc2ToanBo() },
        { key: 'bc1', label: 'BC1 - Theo tòa nhà', onExport: (f: ReportModalFilters) => reportService.bc1ToaNha(f.toaNhaId!), requires: ['toaNha'] },
        { key: 'bc3', label: 'BC3 - Theo tầng', onExport: (f: ReportModalFilters) => reportService.bc3TheoTang(f.toaNhaId!, f.tangId!), requires: ['toaNha', 'tang'] },
        { key: 'bc6', label: 'BC6 - Camera tòa nhà', onExport: (f: ReportModalFilters) => reportService.bc6CameraToaNha(f.toaNhaId!), requires: ['toaNha'] },
        { key: 'bc7', label: 'BC7 - PCCC tòa nhà', onExport: (f: ReportModalFilters) => reportService.bc7PcccToaNha(f.toaNhaId!), requires: ['toaNha'] },
      ],
    },
    {
      title: 'Tài sản phòng',
      items: [
        { key: 'bc30', label: 'BC30 - Thống kê tài sản phòng', onExport: (f: ReportModalFilters) => reportService.bc30ThongKeTaiSan(f.phongId!), requires: ['phong'] },
      ],
    },
  ], [])

  // Pre-populate modal filters from page filters
  const reportInitialValues = useMemo<ReportModalFilters>(() => {
    const result: ReportModalFilters = {}
    if (filters.toaNha) {
      const toa = builds.find(b => b.id.toString() === filters.toaNha)
      if (toa) {
        result.toaNhaId = toa.id
        if (filters.tang !== undefined) {
          const tangRoom = rooms.find(
            r => r.tang?.toa_nha_id?.toString() === filters.toaNha && r.tang?.so_tang === filters.tang
          )
          if (tangRoom?.tang?.id) result.tangId = tangRoom.tang.id
        }
      }
    }
    if (selectedRowKeys.length === 1) {
      result.phongId = Number(selectedRowKeys[0])
    }
    return result
  }, [filters.toaNha, filters.tang, builds, rooms, selectedRowKeys])

  // Handlers
  const handleEditClick = (room: Room) => {
    setEditingRoom(room)
    setIsEditModalOpen(true)
  }

  const handleExport = async () => {
    const hide = message.loading('Đang khởi tạo file Excel...', 0)
    try {
      const response = await roomService.exportExcel()
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, `Danh_Sach_Phong_${new Date().toLocaleDateString('vi-VN')}.xlsx`)
      message.success('Xuất file thành công')
    } catch (error) {
      console.error(error)
      message.error('Lỗi khi xuất file. Vui lòng thử lại.')
    } finally {
      hide()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await roomService.delete(id)
      fetchAll()
      message.success('Xóa phòng thành công')
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || ''
      // Catch 400 error which is usually "has beds" or "has assets"
      if (status === 400) {
        message.error('Phòng đang có giường, không thể xóa !!!')
      } else {
        message.error(msg || 'Không thể xóa phòng')
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn phòng cần xóa')
      return
    }

    try {
      await Promise.all(selectedRowKeys.map(id => roomService.delete(Number(id))))
      message.success(`Đã xóa ${selectedRowKeys.length} phòng`)
      setSelectedRowKeys([])
      fetchAll()
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || ''
      // Catch 400 error which is usually "has beds" or "has assets"
      if (status === 400) {
        message.error('Có phòng đang chọn vẫn còn giường, không thể xóa hàng loạt')
      } else {
        message.error('Lỗi khi xóa phòng: ' + (msg || err.message))
      }
    }
  }

  const handleFilterUpdate = (newFields: Partial<RoomFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFields }

      if (newFields.coSo !== undefined && newFields.coSo !== prev.coSo) {
        next.toaNha = ''
        next.tang = undefined
      }

      if (newFields.toaNha !== undefined && newFields.toaNha !== prev.toaNha) {
        next.tang = undefined

        if (newFields.toaNha) {
          const toa = builds.find((b) => b.id.toString() === newFields.toaNha)
          next.coSo = toa?.co_so?.trim() || 'Chưa xác định'
        }
      }

      return next
    })
  }

  const resetAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      coSo: '',
      toaNha: '',
      tang: undefined,
      loaiPhong: '',
      gioiTinh: '',
      trangThai: '',
    }))
  }

  const handleQuickExportByFilter = async () => {
    if (filteredRooms.length === 0) {
      message.warning('Không có phòng theo bộ lọc để xuất nhanh')
      return
    }

    const headers = ['STT', 'Mã phòng', 'Tòa nhà', 'Tầng', 'Số giường', 'Đang ở', 'Trạng thái']
    const rows = filteredRooms.map((room, index) => [
      index + 1,
      room.ma_phong,
      room.tang?.toaNha?.ten_toa ?? room.tang?.toaNha?.ma_toa ?? '',
      room.tang?.so_tang ?? '',
      room.so_giuong ?? 0,
      occupiedByRoom[room.id] ?? 0,
      statusLabelMap[getRoomStatus(room)],
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Danh_Sach_Phong_Loc_${new Date().toLocaleDateString('vi-VN')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success('Xuất nhanh thành công')
  }

  const loadData = () => {
    fetchAll()
  }

  useEffect(() => {
    const loadRoomStatusData = async () => {
      try {
        const [assignmentRes, repairRes] = await Promise.allSettled([
          lichSuBoTriPhongService.getAll(),
          lichSuSuaChuaService.getAll(),
        ])

        if (assignmentRes.status === 'fulfilled') {
          const map: Record<number, number> = {}
          assignmentRes.value.forEach((item) => {
            if (item.dang_o && item.phong_id) {
              map[item.phong_id] = (map[item.phong_id] ?? 0) + 1
            }
          })
          setOccupiedByRoom(map)
        }

        if (repairRes.status === 'fulfilled') {
          const pendingRepairRoomIds = new Set<number>()
          repairRes.value.forEach((item: any) => {
            if (item.trang_thai === 'CHUA_SUA') {
              const roomId = item.taiSanPhong?.phong_id
              if (roomId) pendingRepairRoomIds.add(roomId)
            }
          })
          setRepairingRoomIds(pendingRepairRoomIds)
        }
      } catch {
        setOccupiedByRoom({})
        setRepairingRoomIds(new Set())
      }
    }

    loadRoomStatusData()
  }, [rooms.length])

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý phòng"
        subtitle="Danh sách và thông tin chi tiết các phòng ký túc xá"
        breadcrumbs={[{ label: 'Quản lý phòng' }]}
        extra={
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Thêm phòng
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setIsReportModalOpen(true)}
            >
              Xuất báo cáo
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleQuickExportByFilter}>
              Xuất nhanh theo lọc
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Nhập dữ liệu
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      />

      <StatisticsSection
        rooms={rooms}
        filteredCount={filteredRooms.length}
        roomStatusSummary={roomStatusSummary}
        bedStatsFromDb={bedStatsFromDb}
      />

      <Card
        title="Điều hướng dữ liệu phòng"
        size="small"
        style={{ marginBottom: 16, borderColor: systemTheme.border.subtle }}
        styles={{ header: { background: systemTheme.background.subtle } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Cơ sở</div>
            <Select
              placeholder="Chọn cơ sở"
              allowClear
              style={{ width: '100%' }}
              value={filters.coSo || undefined}
              options={coSoOptions.map((coSo) => ({ value: coSo, label: coSo }))}
              onChange={(value) => handleFilterUpdate({ coSo: value || '' })}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Tòa nhà</div>
            <Select
              placeholder="Chọn tòa nhà"
              allowClear
              style={{ width: '100%' }}
              value={filters.toaNha || undefined}
              options={drilldownBuilds.map((b) => ({
                value: b.id.toString(),
                label: b.ten_toa ?? b.ma_toa ?? `Tòa ${b.id}`,
              }))}
              onChange={(value) => handleFilterUpdate({ toaNha: value || '' })}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Tầng</div>
            <Select
              placeholder="Chọn tầng"
              allowClear
              style={{ width: '100%' }}
              disabled={!filters.toaNha}
              value={filters.tang}
              options={tangOptions.map((f) => ({ value: f, label: `Tầng ${f}` }))}
              onChange={(value) => handleFilterUpdate({ tang: value })}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={8}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Tìm theo mã phòng</div>
            <Input
              allowClear
              placeholder="Ví dụ: A1-101"
              value={filters.search}
              onChange={(e) => handleFilterUpdate({ search: e.target.value })}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Loại phòng</div>
            <Select
              placeholder="Tất cả"
              allowClear
              style={{ width: '100%' }}
              value={filters.loaiPhong || undefined}
              options={loaiPhongOptions.map((value) => ({
                value,
                label: value === 'HOC_VIEN' ? 'Học viên' : 'Cán bộ',
              }))}
              onChange={(value) => handleFilterUpdate({ loaiPhong: value || '' })}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Giới tính phòng</div>
            <Select
              placeholder="Tất cả"
              allowClear
              style={{ width: '100%' }}
              value={filters.gioiTinh || undefined}
              options={gioiTinhOptions.map((value) => ({
                value,
                label: value === 'NAM' ? 'Nam' : 'Nữ',
              }))}
              onChange={(value) => handleFilterUpdate({ gioiTinh: value || '' })}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Trạng thái phòng</div>
            <Select
              placeholder="Tất cả"
              allowClear
              style={{ width: '100%' }}
              value={filters.trangThai || undefined}
              options={[
                { value: 'FULL', label: 'Full' },
                { value: 'AVAILABLE', label: 'Còn chỗ' },
                { value: 'EMPTY', label: 'Trống' },
                { value: 'UNDER_REPAIR', label: 'Đang sửa chữa' },
              ]}
              onChange={(value) => handleFilterUpdate({ trangThai: (value || '') as RoomFilters['trangThai'] })}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={4}>
            <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginBottom: 6, fontWeight: 700 }}>Tác vụ</div>
            <Button block onClick={resetAllFilters}>Đặt lại tất cả</Button>
          </Col>
        </Row>

        <Divider style={{ margin: '14px 0 10px' }} />

        <Breadcrumb
          items={[
            {
              title: (
                <span onClick={resetAllFilters} style={{ cursor: 'pointer' }}>
                  Cơ sở
                </span>
              ),
            },
            ...(filters.coSo
              ? [
                {
                  title: (
                    <span
                      onClick={() => handleFilterUpdate({ coSo: filters.coSo, toaNha: '', tang: undefined })}
                      style={{ cursor: 'pointer' }}
                    >
                      {filters.coSo}
                    </span>
                  ),
                },
              ]
              : []),
            ...(selectedBuilding
              ? [
                {
                  title: (
                    <span
                      onClick={() => handleFilterUpdate({ toaNha: filters.toaNha, tang: undefined })}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectedBuilding.ten_toa ?? selectedBuilding.ma_toa}
                    </span>
                  ),
                },
              ]
              : []),
            ...(filters.tang !== undefined ? [{ title: `Tầng ${filters.tang}` }] : []),
            { title: `Phòng (${filteredRooms.length})` },
          ]}
          style={{
            background: systemTheme.background.subtle,
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${systemTheme.border.subtle}`,
          }}
        />
      </Card>

      <div>
        <div style={{ minWidth: 0 }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Danh sách phòng</span>
                <Space>
                  {selectedRowKeys.length > 0 && (
                    <Popconfirm
                      title={`Xác nhận xóa ${selectedRowKeys.length} phòng?`}
                      description="Hành động này không thể hoàn tác."
                      onConfirm={handleBatchDelete}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        Xóa ({selectedRowKeys.length})
                      </Button>
                    </Popconfirm>
                  )}
                  <Segmented
                    value={viewMode}
                    onChange={(value) => {
                      setViewMode(value as ViewMode)
                      setSelectedRowKeys([]) // Clear selection when switching views
                    }}
                    options={[
                      { label: 'Bảng', value: 'table', icon: <TableOutlined /> },
                      { label: 'Lưới', value: 'grid', icon: <AppstoreOutlined /> },
                    ]}
                  />
                </Space>
              </div>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedRowKeys.length > 0 ? (
                  <Badge count={selectedRowKeys.length} style={{ backgroundColor: systemTheme.brand.primary }}>
                    <span style={{ marginRight: 20 }}>
                      Hiển thị {filteredRooms.length} / {rooms.length} phòng
                    </span>
                  </Badge>
                ) : (
                  `Hiển thị ${filteredRooms.length} / ${rooms.length} phòng`
                )}
              </Text>
            }
            styles={{
              body: { padding: viewMode === 'grid' ? 0 : 0 },
              header: {
                background: systemTheme.background.subtle,
                borderBottom: `1px solid ${systemTheme.border.subtle}`
              }
            }}
            style={{
              borderRadius: 8,
              border: `1px solid ${systemTheme.border.subtle}`,
            }}
          >
            {viewMode === 'table' ? (
              <RoomTable
                data={filteredRooms}
                loading={loading}
                onRefresh={loadData}
                onViewDetail={(item: Room) => setSelectedRoom(item)}
                onEdit={handleEditClick}
                onDelete={(id: number) => handleDelete(id)}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={setSelectedRowKeys}
                getRoomStatus={getRoomStatus}
                occupiedByRoom={occupiedByRoom}
              />
            ) : (
              <RoomGrid
                data={filteredRooms}
                loading={loading}
                onViewDetail={(item: Room) => setSelectedRoom(item)}
                onEdit={handleEditClick}
                onDelete={(id: number) => handleDelete(id)}
                getRoomStatus={getRoomStatus}
                occupiedByRoom={occupiedByRoom}
              />
            )}
          </Card>
        </div>
      </div>

      <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      <UpdateRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        room={editingRoom}
        onSuccess={loadData}
      />
      <AddRoomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />
      <ImportRoomModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />
      <ReportExportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        groups={reportGroups}
        selectors={['toaNha', 'tang', 'phong']}
        initialValues={reportInitialValues}
        title="Xuất báo cáo phòng"
      />
    </PageContainer>
  )
}
