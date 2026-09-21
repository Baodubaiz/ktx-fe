import { useState, useEffect, useMemo } from 'react'
import { Typography, Button, Card, message, Space, Segmented, Popconfirm, Badge } from 'antd'
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { PageHeader, PageContainer, ReportExportModal } from '@/components'
import type { ReportGroup, ReportModalFilters } from '@/components'
import { phanCongVeSinhService } from '@/services/cleaning-assignment.service'
import { reportService } from '@/services/report.service'
import { api } from '@/lib/axios'
import type { PhanCongVeSinh } from '@/types/cleaning-document'
import FilterSidebar from './components/FilterSidebar'
import AssignmentTable from './components/AssignmentTable'
import AssignmentGrid from './components/AssignmentGrid'
import StatisticsSection from './components/StatisticsSection'
import AssignmentDetailModal from './components/AssignmentDetailModal'
import AddAssignmentModal from './components/AddAssignmentModal'
import UpdateAssignmentModal from './components/UpdateAssignmentModal'
import ImportAssignmentModal from './components/ImportAssignmentModal'
import './cleaning-assignments.css'

const { Text } = Typography

type ViewMode = 'table' | 'grid'

interface CleaningFilters {
  search: string
  toaNha: string
  trungDoi: string
  dateFrom: string
  dateTo: string
}

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

export default function CleaningAssignments() {
  const location = useLocation()

  // Data states
  const [allAssignments, setAllAssignments] = useState<PhanCongVeSinh[]>([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [selectedAssignment, setSelectedAssignment] = useState<PhanCongVeSinh | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<PhanCongVeSinh | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // Filter states
  const [filters, setFilters] = useState<CleaningFilters>({
    search: '',
    toaNha: '',
    trungDoi: '',
    dateFrom: '',
    dateTo: ''
  })

  // Lookup data
  const [buildings, setBuildings] = useState<any[]>([])
  const [squads, setSquads] = useState<any[]>([])

  // Auto-open add modal when navigated from dashboard Quick Actions
  useEffect(() => {
    if (location.state?.openAdd) {
      setIsAddModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Load initial data
  useEffect(() => {
    loadData()
    loadLookups()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await phanCongVeSinhService.getAll()
      setAllAssignments(Array.isArray(result) ? result : [])
    } catch (err: any) {
      if (err.response?.status === 403) message.error('Không có quyền truy cập.')
      else message.error('Lỗi tải danh sách phân công')
    } finally {
      setLoading(false)
    }
  }

  const loadLookups = async () => {
    try {
      const [buildingsRes, squadsRes] = await Promise.all([
        api.get('/toa-nha'),
        api.get('/don-vi-doi'),
      ])
      setBuildings(Array.isArray(unwrap(buildingsRes)) ? unwrap(buildingsRes) : [])
      setSquads(Array.isArray(unwrap(squadsRes)) ? unwrap(squadsRes) : [])
    } catch (err) {
      // Lookup data optional
    }
  }

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter(assignment => {
      const matchesSearch = !filters.search ||
        assignment.viTri?.ten_vi_tri?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesToaNha = !filters.toaNha ||
        assignment.viTri?.toaNha?.id?.toString() === filters.toaNha

      const matchesTrungDoi = !filters.trungDoi ||
        assignment.trung_doi_phu_trach?.toString() === filters.trungDoi

      const matchesDateRange = (() => {
        if (!filters.dateFrom || !filters.dateTo || !assignment.thoi_gian) return true
        const assignmentDate = new Date(assignment.thoi_gian).toISOString().slice(0, 10)
        return assignmentDate >= filters.dateFrom && assignmentDate <= filters.dateTo
      })()

      return matchesSearch && matchesToaNha && matchesTrungDoi && matchesDateRange
    })
  }, [allAssignments, filters])

  // Report groups for the export modal
  const reportGroups = useMemo<ReportGroup[]>(() => [
    {
      title: 'Phân công vệ sinh theo Tòa nhà',
      items: [
        { key: 'bc4', label: 'BC4 - PCVS tòa nhà', onExport: (f: ReportModalFilters) => reportService.bc4PcvsToaNha(f.toaNhaId!), requires: ['toaNha'] },
        { key: 'bc4b', label: 'BC4b - Sơ đồ PCVS', onExport: (f: ReportModalFilters) => reportService.bc4bSoDoPcvs(f.toaNhaId!), requires: ['toaNha'] },
      ],
    },
    {
      title: 'Phân công vệ sinh theo Tầng',
      items: [
        { key: 'bc5', label: 'BC5 - PCVS theo tầng', onExport: (f: ReportModalFilters) => reportService.bc5PcvsTheoTang(f.toaNhaId!, f.tangId!), requires: ['toaNha', 'tang'] },
        { key: 'bc5b', label: 'BC5b - Sơ đồ PCVS theo tầng', onExport: (f: ReportModalFilters) => reportService.bc5bSoDoPcvsTang(f.toaNhaId!, f.tangId!), requires: ['toaNha', 'tang'] },
      ],
    },
  ], [])

  // Pre-populate modal filters from page filters
  const reportInitialValues = useMemo<ReportModalFilters>(() => {
    const result: ReportModalFilters = {}
    if (filters.toaNha) {
      result.toaNhaId = Number(filters.toaNha)
    }
    return result
  }, [filters.toaNha])

  // Handlers
  const handleEditClick = (assignment: PhanCongVeSinh) => {
    setEditingAssignment(assignment)
    setIsEditModalOpen(true)
  }

  const handleExport = async () => {
    const hide = message.loading('Đang khởi tạo file Excel...', 0)
    try {
      const data = await phanCongVeSinhService.exportExcel()
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, `Phan_Cong_Ve_Sinh_${new Date().toLocaleDateString('vi-VN')}.xlsx`)
      message.success('Xuất file thành công')
    } catch {
      message.error('Lỗi khi xuất file. Vui lòng thử lại.')
    } finally {
      hide()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await phanCongVeSinhService.delete(id)
      loadData()
      message.success('Xóa phân công thành công')
    } catch (err: any) {
      message.error(err?.response?.data?.error?.message || err?.response?.data?.message || 'Không thể xóa phân công')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn phân công cần xóa')
      return
    }

    try {
      await Promise.all(selectedRowKeys.map(id => phanCongVeSinhService.delete(Number(id))))
      message.success(`Đã xóa ${selectedRowKeys.length} phân công`)
      setSelectedRowKeys([])
      loadData()
    } catch (err: any) {
      message.error('Lỗi khi xóa phân công: ' + (err?.response?.data?.error?.message || err?.response?.data?.message || err.message))
    }
  }

  const handleFilterUpdate = (newFields: Partial<CleaningFilters>) => {
    setFilters(prev => ({ ...prev, ...newFields }))
  }

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý phân công vệ sinh"
        subtitle="Chi tiết phân công vệ sinh các khu vực trong ký túc xá"
        breadcrumbs={[{ label: 'Phân công vệ sinh' }]}
        extra={
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #3e57c4db 0%, #2b1eb5c5 100%)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
              }}
            >
              Thêm phân công
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setIsReportModalOpen(true)}
            >
              Xuất báo cáo
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

      <StatisticsSection assignments={allAssignments} filteredCount={filteredAssignments.length} />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <FilterSidebar
            currentFilters={filters}
            onFilterChange={handleFilterUpdate}
            allAssignments={allAssignments}
            buildings={buildings}
            squads={squads}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Danh sách phân công</span>
                <Space>
                  {selectedRowKeys.length > 0 && (
                    <Popconfirm
                      title={`Xác nhận xóa ${selectedRowKeys.length} phân công?`}
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
                      setSelectedRowKeys([])
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
                  <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#52c41a' }}>
                    <span style={{ marginRight: 20 }}>
                      Hiển thị {filteredAssignments.length} / {allAssignments.length} phân công
                    </span>
                  </Badge>
                ) : (
                  `Hiển thị ${filteredAssignments.length} / ${allAssignments.length} phân công`
                )}
              </Text>
            }
            styles={{
              body: { padding: viewMode === 'grid' ? 0 : 0 },
              header: {
                background: 'linear-gradient(to right, #fafafa, #ffffff)',
                borderBottom: '2px solid #f0f0f0'
              }
            }}
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            {viewMode === 'table' ? (
              <AssignmentTable
                data={filteredAssignments}
                loading={loading}
                onRefresh={loadData}
                onViewDetail={(item: PhanCongVeSinh) => setSelectedAssignment(item)}
                onEdit={handleEditClick}
                onDelete={(id: number) => handleDelete(id)}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={setSelectedRowKeys}
              />
            ) : (
              <AssignmentGrid
                data={filteredAssignments}
                loading={loading}
                onViewDetail={(item: PhanCongVeSinh) => setSelectedAssignment(item)}
                onEdit={handleEditClick}
                onDelete={(id: number) => handleDelete(id)}
              />
            )}
          </Card>
        </div>
      </div>

      <AssignmentDetailModal assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} />
      <UpdateAssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        assignment={editingAssignment}
        onSuccess={loadData}
      />
      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />
      <ImportAssignmentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />
      <ReportExportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        groups={reportGroups}
        selectors={['toaNha', 'tang']}
        initialValues={reportInitialValues}
        title="Xuất báo cáo phân công vệ sinh"
      />
    </PageContainer>
  )
}
