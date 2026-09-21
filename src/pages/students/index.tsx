import { useState, useEffect, useMemo } from 'react'
import { Typography, Button, Card, message, Space, Segmented, Popconfirm, Badge, Breadcrumb, Row, Col, Statistic, Checkbox } from 'antd'
import {
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { PageHeader, PageContainer, ReportExportModal, HeaderActions } from '@/components'
import type { ReportGroup, ReportModalFilters } from '@/components'
import { studentService } from '@/services/student.service'
import { reportService } from '@/services/report.service'
import { roomService } from '@/services/room.service'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import { thongKeService, type ThongKeHocVienResponse } from '@/services/thong-ke.service'
import { api } from '@/lib/axios'
import type { Student, StudentFilters } from '@/types/student'
import FilterSidebar from './components/FilterSidebar'
import StudentTable from './components/StudentTable'
import StudentGrid from './components/StudentGrid'
import StatisticsSection from './components/StatisticsSection'
import StudentDetailModal from './components/StudentDetailModal'
import AddStudentModal from './components/AddStudentModal'
import UpdateStudentModal from './components/UpdateStudentModal'
import ImportStudentModal from './components/ImportStudentModal'
import BulkTransferRoomModal from './components/BulkTransferRoomModal'
import SwapRoomModal from './components/SwapRoomModal'
import ExportFieldSelectorModal from './components/ExportFieldSelectorModal'
import { systemTheme } from '@/theme/system-theme'
import './students.css'

const { Text } = Typography

type ViewMode = 'table' | 'grid'

export default function Students() {
  const location = useLocation()
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [allBuildings, setAllBuildings] = useState<any[]>([])
  const [allFloors, setAllFloors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isBulkTransferModalOpen, setIsBulkTransferModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [roomToSwap, setRoomToSwap] = useState<{ id: number; name: string; count: number } | null>(null)
  const [squads, setSquads] = useState<{ id: number; label: string }[]>([])
  const [isExportFieldModalOpen, setIsExportFieldModalOpen] = useState(false)
  const [studentStats, setStudentStats] = useState<ThongKeHocVienResponse | null>(null)

  type ExplorerLevel = 'school' | 'facilities' | 'buildings' | 'floors' | 'rooms' | 'students';
  const [level, setLevel] = useState<ExplorerLevel>('school');
  type SchoolViewMode = 'hierarchy' | 'list';
  const [schoolViewMode, setSchoolViewMode] = useState<SchoolViewMode>('hierarchy');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{ id: number; name: string } | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<{ id: number; name: string } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (schoolViewMode === 'hierarchy' || level !== 'school') {
      setShowUnassignedOnly(false);
    }
  }, [schoolViewMode, level]);

  interface TreeData {
    facilities: Record<string, {
      count: number;
      buildings: Record<number, {
        name: string;
        count: number;
        floors: Record<number, {
          name: string;
          count: number;
          rooms: Record<number, {
            name: string;
            count: number;
          }>;
        }>;
      }>;
    }>;
    totalStats: number;
  }

  // Auto-open add modal when navigated from dashboard Quick Actions
  useEffect(() => {
    if (location.state?.openAdd) {
      setIsAddModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const [filters, setFilters] = useState<StudentFilters>({
    search: '', ho_rieng: '', ten_rieng: '', lop_hoc_id: '',
    don_vi_doi_id: '', cam_tinh_dang: '',
    ngay_sinh_from: '', ngay_sinh_to: ''
  })

  const [remoteLoading, setRemoteLoading] = useState(false)

  const handleEditClick = (student: any) => {
    setEditingStudent(student)
    setIsEditModalOpen(true)
  }

  const handleExport = async () => {
    // T5.3: Open export field selector modal
    setIsExportFieldModalOpen(true)
  };

  const handleDelete = async (id: number) => {
    try {
      await studentService.delete(id)
      loadData()
      message.success('Xóa học viên thành công')
    } catch (err: any) {
      message.error('Không thể xóa dữ liệu: ' + err.message)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn học viên cần xóa')
      return
    }

    try {
      // Delete each selected student
      await Promise.all(selectedRowKeys.map(id => studentService.delete(Number(id))))
      message.success(`Đã xóa ${selectedRowKeys.length} học viên`)
      setSelectedRowKeys([])
      loadData()
    } catch (err: any) {
      message.error('Lỗi khi xóa học viên: ' + err.message)
    }
  }

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const matchesSearch = !filters.search || (() => {
        const keyword = filters.search.toLowerCase();
        const stay = (student as any).lichSuBoTriPhong?.[0];
        const phongMatch = stay?.phong?.ma_phong?.toLowerCase().includes(keyword) ||
          stay?.phong?.ten_phong?.toLowerCase().includes(keyword);
        const tangMatch = stay?.phong?.tang?.ma_tang?.toLowerCase().includes(keyword) ||
          stay?.phong?.tang?.so_tang?.toString().includes(keyword);
        const giuongMatch = stay?.giuong?.ma_giuong?.toLowerCase().includes(keyword) ||
          stay?.giuong?.ten_giuong?.toLowerCase().includes(keyword);
        return student.ho_ten?.toLowerCase().includes(keyword) ||
          student.ma_hoc_vien?.toLowerCase().includes(keyword) ||
          phongMatch || tangMatch || giuongMatch;
      })();
      const fullName = (student.ho_ten ?? '').trim()
      const nameParts = fullName ? fullName.split(/\s+/).filter(Boolean) : []
      const lastName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : (nameParts[0] ?? '')
      const firstName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : ''
      const matchesLastName = !filters.ho_rieng || lastName.toLowerCase().includes(filters.ho_rieng.toLowerCase())
      const matchesFirstName = !filters.ten_rieng || firstName.toLowerCase().includes(filters.ten_rieng.toLowerCase())
      const matchesUnit = !filters.don_vi_doi_id || student.don_vi_doi_id === Number(filters.don_vi_doi_id)
      const matchesParty = filters.cam_tinh_dang === '' || student.cam_tinh_dang === filters.cam_tinh_dang

      // Class and Course filtering
      const matchesClass = !filters.lop_hoc_id || student.lop_hoc_id === Number(filters.lop_hoc_id)
      const matchesCourse = !filters.khoa_hoc_id || student.lopHoc?.khoa_hoc_id === Number(filters.khoa_hoc_id)

      // Date range filter
      const matchesDateRange = (() => {
        if (!filters.ngay_sinh_from || !filters.ngay_sinh_to) return true
        if (!student.ngay_sinh) return false // Exclude students without birth date when date filter is active
        const birthDate = dayjs(student.ngay_sinh)
        if (!birthDate.isValid()) return false
        const fromDate = dayjs(filters.ngay_sinh_from)
        const toDate = dayjs(filters.ngay_sinh_to)
        // Inclusive boundary: >= fromDate AND <= toDate
        return (birthDate.isSame(fromDate, 'day') || birthDate.isAfter(fromDate, 'day')) &&
               (birthDate.isSame(toDate, 'day') || birthDate.isBefore(toDate, 'day'))
      })()

      return matchesSearch && matchesLastName && matchesFirstName && matchesUnit && matchesParty && matchesClass && matchesCourse && matchesDateRange
    })
  }, [allStudents, filters])

  const hierarchyData = useMemo(() => {
    const tree: TreeData = { facilities: {}, totalStats: filteredStudents.length };

    // 1. Initialize Facilities and Buildings
    allBuildings.forEach((build: any) => {
      const facilityName = build.co_so || 'Khác';
      const buildingId = build.id;
      const buildingName = build.ten_toa || 'Toà nhà không tên';

      if (!tree.facilities[facilityName]) {
        tree.facilities[facilityName] = { count: 0, buildings: {} };
      }
      if (!tree.facilities[facilityName].buildings[buildingId]) {
        tree.facilities[facilityName].buildings[buildingId] = { name: buildingName, count: 0, floors: {} };
      }
    });

    // 2. Map all Floors to their respective Buildings
    allFloors.forEach((floor: any) => {
      const buildingId = floor.toa_nha_id;
      const floorId = floor.id;
      const floorName = floor.so_tang ? `Tầng ${floor.so_tang}` : 'Tầng không tên';

      // Find the facility that contains this building
      for (const facName in tree.facilities) {
        if (tree.facilities[facName].buildings[buildingId]) {
          if (!tree.facilities[facName].buildings[buildingId].floors[floorId]) {
            tree.facilities[facName].buildings[buildingId].floors[floorId] = { name: floorName, count: 0, rooms: {} };
          }
          break; // Stop searching once found
        }
      }
    });

    // 3. Map all Rooms to their respective Floors
    allRooms.forEach((room: any) => {
      const facilityName = room.tang?.toaNha?.co_so || 'Khác';
      const buildingId = room.tang?.toaNha?.id || -1;
      const buildingName = room.tang?.toaNha?.ten_toa || 'Toà nhà không tên';
      const floorId = room.tang?.id || -1;
      const floorName = room.tang?.so_tang ? `Tầng ${room.tang.so_tang}` : 'Tầng không tên';
      const roomId = room.id;
      const roomName = room.ma_phong || 'Phòng không tên';

      // Initialize any missing path to be safe
      if (!tree.facilities[facilityName]) {
        tree.facilities[facilityName] = { count: 0, buildings: {} };
      }
      if (!tree.facilities[facilityName].buildings[buildingId]) {
        tree.facilities[facilityName].buildings[buildingId] = { name: buildingName, count: 0, floors: {} };
      }
      if (!tree.facilities[facilityName].buildings[buildingId].floors[floorId]) {
        tree.facilities[facilityName].buildings[buildingId].floors[floorId] = { name: floorName, count: 0, rooms: {} };
      }
      if (!tree.facilities[facilityName].buildings[buildingId].floors[floorId].rooms[roomId]) {
        tree.facilities[facilityName].buildings[buildingId].floors[floorId].rooms[roomId] = { name: roomName, count: 0 };
      }
    });

    // Populate counts with filtered students
    filteredStudents.forEach((student: any) => {
      const stay = student.lichSuBoTriPhong?.[0];
      if (!stay || !stay.phong || !stay.phong.tang || !stay.phong.tang.toaNha) return;

      const facilityName = stay.phong.tang.toaNha.co_so || 'Khác';
      const buildingId = stay.phong.tang.toaNha.id;
      const floorId = stay.phong.tang.id;
      const roomId = stay.phong.id;

      if (tree.facilities[facilityName]) {
        tree.facilities[facilityName].count++;
        if (tree.facilities[facilityName].buildings[buildingId]) {
          tree.facilities[facilityName].buildings[buildingId].count++;
          if (tree.facilities[facilityName].buildings[buildingId].floors[floorId]) {
            tree.facilities[facilityName].buildings[buildingId].floors[floorId].count++;
            if (tree.facilities[facilityName].buildings[buildingId].floors[floorId].rooms[roomId]) {
              tree.facilities[facilityName].buildings[buildingId].floors[floorId].rooms[roomId].count++;
            }
          }
        }
      }
    });

    return tree;
  }, [allBuildings, allFloors, allRooms, filteredStudents]);

  const allFacilityNames = useMemo(() => {
    return Array.from(
      new Set(
        allBuildings
          .map((build: any) => (build.co_so ?? '').toString().trim())
          .filter((name: string) => name.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b, 'vi'))
  }, [allBuildings])

  const studentsToDisplay = useMemo(() => {
    if (level === 'students' && selectedRoom) {
      return filteredStudents.filter((student: any) => {
        const stay = student.lichSuBoTriPhong?.[0];
        return stay?.phong?.id === selectedRoom.id;
      });
    }
    if (level === 'school' && schoolViewMode === 'list') {
      if (showUnassignedOnly) {
        return filteredStudents.filter((student: any) => {
          const stay = student.lichSuBoTriPhong?.[0];
          return !stay?.phong;
        });
      }
    }
    return filteredStudents;
  }, [filteredStudents, level, selectedRoom, schoolViewMode, showUnassignedOnly]);

  const goToSchool = () => {
    setSelectedFacility(null); setSelectedBuilding(null); setSelectedFloor(null); setSelectedRoom(null);
    setLevel('school');
  };
  const goToFacility = () => {
    setSelectedBuilding(null); setSelectedFloor(null); setSelectedRoom(null);
    setLevel('buildings');
  };
  const goToBuilding = () => {
    setSelectedFloor(null); setSelectedRoom(null);
    setLevel('floors');
  };
  const goToFloor = () => {
    setSelectedRoom(null);
    setLevel('rooms');
  };

  const breadcrumbItems = [
    { title: <a onClick={goToSchool}>Toàn trường</a> }
  ];
  if (level !== 'school' && level !== 'facilities' && selectedFacility) {
    breadcrumbItems.push({ title: <a onClick={goToFacility}>{selectedFacility}</a> });
  }
  if (level === 'floors' || level === 'rooms' || level === 'students') {
    if (selectedBuilding) breadcrumbItems.push({ title: <a onClick={goToBuilding}>{selectedBuilding.name}</a> });
  }
  if (level === 'rooms' || level === 'students') {
    if (selectedFloor) breadcrumbItems.push({ title: <a onClick={goToFloor}>{selectedFloor.name}</a> });
  }
  if (level === 'students' && selectedRoom) {
    breadcrumbItems.push({ title: <span>{selectedRoom.name}</span> });
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsData, roomsData, buildsData, floorsData] = await Promise.all([
        studentService.getAll(filters),
        roomService.getAll(),
        buildService.getAll(),
        floorService.getAll()
      ])
      setAllStudents(studentsData)
      setAllRooms(roomsData)
      setAllBuildings(buildsData)
      setAllFloors(floorsData)

      const statsData = await thongKeService.getThongKeHocVien(studentsData)
      setStudentStats(statsData)
    } catch (err: any) {
      if (err.response?.status === 403) message.error('Không có quyền truy cập.')
      else message.error('Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setRemoteLoading(true)
        const studentsData = await studentService.getAll(filters)
        setAllStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch {
        // fallback local filtering with existing dataset
      } finally {
        setRemoteLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [filters])

  // Load squads for filter + reports
  useEffect(() => {
    const loadSquads = async () => {
      try {
        const res = await api.get('/don-vi-doi')
        const d = res.data?.data ?? res.data
        const list = d?.data ?? d
        setSquads(
          (Array.isArray(list) ? list : []).map((s: any) => ({
            id: s.id,
            label: s.ten_don_vi ?? `TĐ #${s.id}`,
          })),
        )
      } catch { /* optional */ }
    }
    loadSquads()
  }, [])

  // Report groups for ReportExportModal
  const reportGroups: ReportGroup[] = useMemo(() => [
    {
      title: 'Báo cáo theo Trung đội',
      items: [
        { key: 'bc8', label: 'BC8 - Trích ngang theo CNTĐ', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc8CntdToanBo(v.donViId!) },
        { key: 'bc9', label: 'BC9 - Chi tiết trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc9TrungDoi(v.donViId!) },
        { key: 'bc10', label: 'BC10 - DS Nam trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc10DsNam(v.donViId!) },
        { key: 'bc11', label: 'BC11 - DS Nữ trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc11DsNu(v.donViId!) },
        { key: 'bc16', label: 'BC16 - Theo quê quán', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc16TrungDoiQueQuan(v.donViId!) },
        { key: 'bc17', label: 'BC17 - Theo đơn vị cử đi học', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc17TrungDoiDonViCu(v.donViId!) },
        { key: 'bc18', label: 'BC18 - HV Nam trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc18HvNamTrungDoi(v.donViId!) },
        { key: 'bc19', label: 'BC19 - HV Nữ trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc19HvNuTrungDoi(v.donViId!) },
        { key: 'bc20', label: 'BC20 - Dân tộc thiểu số', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc20DanTocTrungDoi(v.donViId!) },
        { key: 'bc21', label: 'BC21 - Trích ngang TĐ (tổng hợp)', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc21TrichNgangTrungDoi(v.donViId!) },
        { key: 'bc22', label: 'BC22 - DS đầy đủ HV trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc22DanhSachTrungDoi(v.donViId!) },
      ],
    },
    {
      title: 'Tìm kiếm học viên',
      items: [
        { key: 'bc23', label: 'BC23 - Thông tin HV (họ tên)', requires: ['search'], onExport: (v: ReportModalFilters) => reportService.bc23ThongTinHocVien(v.search!) },
        { key: 'bc23_1', label: 'BC23.1 - Tìm HV (từ khóa)', requires: ['search'], onExport: (v: ReportModalFilters) => reportService.bc23_1TimHocVien(v.search!) },
      ],
    },
    {
      title: 'Tổng hợp',
      items: [
        { key: 'bc25', label: 'BC25 - Đảng viên', onExport: () => reportService.bc25DangVien() },
      ],
    },
  ], [])

  const handleFilterUpdate = (newFields: Partial<StudentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFields }))
  }

  // T4.1: Tạo tiêu đề module theo cơ sở
  const moduleTitle = selectedFacility 
    ? `Quản lý học viên tại cơ sở ${selectedFacility}`
    : 'Quản lý học viên'

  const resolveFacilityName = (facilityName: string): string => {
    const keys = Object.keys(hierarchyData.facilities)
    const byDirect = keys.find((name) => name.trim() === facilityName.trim())
    if (byDirect) return byDirect

    const numberMatch = facilityName.match(/\d+/)
    if (numberMatch) {
      const byPattern = keys.find((name) => new RegExp(`\\b${numberMatch[0]}\\b`).test(name))
      if (byPattern) return byPattern
    }

    return facilityName
  }

  const handleNavigateFacility = (facilityNameFromStats: string) => {
    const facilityName = resolveFacilityName(facilityNameFromStats)
    setSelectedFacility(facilityName)
    setSelectedBuilding(null)
    setSelectedFloor(null)
    setSelectedRoom(null)
    setLevel('buildings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageContainer>
      <PageHeader
        title={moduleTitle}
        subtitle="Danh sách quân số và thông tin chi tiết học viên"
        breadcrumbs={[{ label: 'Quản lý học viên' }]}
        extra={
          <HeaderActions
            onAddClick={() => setIsAddModalOpen(true)}
            onExportClick={handleExport}
            onImportClick={() => setIsImportModalOpen(true)}
          />
        }
      />

      <StatisticsSection
        students={allStudents}
        filteredCount={filteredStudents.length}
        statsApi={studentStats}
        onNavigateFacility={handleNavigateFacility}
        allFacilities={allFacilityNames}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <FilterSidebar
            currentFilters={filters}
            onFilterChange={handleFilterUpdate}
            allStudents={allStudents}
            squads={squads}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 24, padding: '0 4px' }}>
            <Breadcrumb
              items={breadcrumbItems}
              style={{
                fontSize: 15,
                fontWeight: 500,
                padding: '14px 18px',
                background: systemTheme.background.container,
                borderRadius: 12,
                border: `1px solid ${systemTheme.border.subtle}`,
              }}
            />
          </div>

          {level === 'school' && (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
              {schoolViewMode === 'list' && (
                <Checkbox
                  checked={showUnassignedOnly}
                  onChange={(e) => setShowUnassignedOnly(e.target.checked)}
                  style={{ fontWeight: 500 }}
                >
                  Học viên chưa có phòng
                </Checkbox>
              )}
              <Segmented
                value={schoolViewMode}
                onChange={(value) => {
                  setSchoolViewMode(value as SchoolViewMode);
                  if (value === 'hierarchy') {
                    setShowUnassignedOnly(false);
                  }
                }}
                options={[
                  { label: 'Phân cấp', value: 'hierarchy', icon: <AppstoreOutlined /> },
                  { label: 'Danh sách', value: 'list', icon: <TableOutlined /> },
                ]}
              />
            </div>
          )}

          {level === 'school' && schoolViewMode === 'hierarchy' && (
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card
                  hoverable
                  onClick={() => setLevel('facilities')}
                  style={{
                    borderRadius: 16,
                    textAlign: 'center',
                    padding: '32px 0',
                    background: systemTheme.background.subtle,
                    border: `1px solid ${systemTheme.border.subtle}`,
                    boxShadow: systemTheme.shadow.soft,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <AppstoreOutlined style={{ fontSize: 48, color: systemTheme.brand.primary, marginBottom: 16 }} />
                  <Typography.Title level={2} style={{ margin: 0, marginBottom: 8, color: systemTheme.text.primary }}>Toàn trường</Typography.Title>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 24px',
                    background: systemTheme.brand.primarySoft,
                    borderRadius: 24,
                    color: systemTheme.brand.primary,
                    fontWeight: 600,
                    fontSize: 18
                  }}>
                    {hierarchyData.totalStats} học viên
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {level === 'facilities' && (
            <Row gutter={[24, 24]}>
              {Object.entries(hierarchyData.facilities).map(([facilityName, facData]) => (
                <Col xs={24} sm={12} md={8} key={facilityName}>
                  <Card
                    hoverable
                    onClick={() => { setSelectedFacility(facilityName); setLevel('buildings'); }}
                    style={{
                      borderRadius: 16,
                      textAlign: 'center',
                      border: `1px solid ${systemTheme.border.subtle}`,
                      transition: 'all 0.3s'
                    }}
                  >
                    <Statistic
                      title={<span style={{ fontWeight: 600, fontSize: 18, color: systemTheme.text.primary }}>Quản lý {facilityName.toLowerCase()}</span>}
                      value={facData.count}
                      suffix={<span style={{ fontSize: 14 }}>học viên</span>}
                      valueStyle={{ color: systemTheme.brand.primary, fontSize: 28, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {level === 'buildings' && selectedFacility && hierarchyData.facilities[selectedFacility] && (
            <Row gutter={[24, 24]}>
              {Object.entries(hierarchyData.facilities[selectedFacility].buildings).map(([bId, bData]) => (
                <Col xs={24} sm={12} md={8} key={bId}>
                  <Card
                    hoverable
                    onClick={() => { setSelectedBuilding({ id: Number(bId), name: bData.name }); setLevel('floors'); }}
                    style={{
                      borderRadius: 16,
                      textAlign: 'center',
                      border: `1px solid ${systemTheme.border.subtle}`,
                      transition: 'all 0.3s'
                    }}
                  >
                    <Statistic
                      title={<span style={{ fontWeight: 600, fontSize: 18, color: systemTheme.text.primary }}>{bData.name}</span>}
                      value={bData.count}
                      suffix={<span style={{ fontSize: 14 }}>học viên</span>}
                      valueStyle={{ color: systemTheme.status.success, fontSize: 28, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {level === 'floors' && selectedFacility && selectedBuilding && hierarchyData.facilities[selectedFacility]?.buildings[selectedBuilding.id] && (
            <Row gutter={[24, 24]}>
              {Object.entries(hierarchyData.facilities[selectedFacility].buildings[selectedBuilding.id].floors).map(([fId, fData]) => (
                <Col xs={24} sm={12} md={8} lg={6} key={fId}>
                  <Card
                    hoverable
                    onClick={() => { setSelectedFloor({ id: Number(fId), name: fData.name }); setLevel('rooms'); }}
                    style={{
                      borderRadius: 16,
                      textAlign: 'center',
                      border: `1px solid ${systemTheme.border.subtle}`,
                      transition: 'all 0.3s'
                    }}
                  >
                    <Statistic
                      title={<span style={{ fontWeight: 600, fontSize: 18, color: systemTheme.text.primary }}>{fData.name}</span>}
                      value={fData.count}
                      suffix={<span style={{ fontSize: 14 }}>học viên</span>}
                      valueStyle={{ color: systemTheme.brand.accent, fontSize: 28, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {level === 'rooms' && selectedFacility && selectedBuilding && selectedFloor && hierarchyData.facilities[selectedFacility]?.buildings[selectedBuilding.id]?.floors[selectedFloor.id] && (
            <Row gutter={[24, 24]}>
              {Object.entries(hierarchyData.facilities[selectedFacility].buildings[selectedBuilding.id].floors[selectedFloor.id].rooms).map(([rId, rData]) => (
                <Col xs={24} sm={12} md={8} lg={6} key={rId}>
                  <Card
                    hoverable
                    onClick={() => { setSelectedRoom({ id: Number(rId), name: rData.name }); setLevel('students'); }}
                    style={{
                      borderRadius: 16,
                      textAlign: 'center',
                      border: `1px solid ${systemTheme.border.subtle}`,
                      background: rData.count > 0 ? systemTheme.background.container : systemTheme.background.subtle,
                      transition: 'all 0.3s'
                    }}
                  >
                    <Statistic
                      title={<span style={{ fontWeight: 600, fontSize: 18, color: systemTheme.text.primary }}>{rData.name}</span>}
                      value={rData.count}
                      suffix={<span style={{ fontSize: 14 }}>học viên</span>}
                      valueStyle={{ color: rData.count > 0 ? systemTheme.brand.secondary : systemTheme.text.muted, fontSize: 28, fontWeight: 700 }}
                    />
                    <Button
                      type="text"
                      icon={<SwapOutlined />}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: systemTheme.brand.primary,
                        zIndex: 2
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setRoomToSwap({ id: Number(rId), name: rData.name, count: rData.count })
                        setIsSwapModalOpen(true)
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {(level === 'students' || (level === 'school' && schoolViewMode === 'list')) && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Danh sách học viên {level === 'students' && selectedRoom ? `- ${selectedRoom.name}` : (level === 'school' ? 'Toàn trường' : '')}</span>
                  <Space>
                    {selectedRowKeys.length > 0 && (
                      <Popconfirm
                        title={`Xác nhận xóa ${selectedRowKeys.length} học viên?`}
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
                    {selectedRowKeys.length > 0 && (
                      <Button
                        type="primary"
                        icon={<SwapOutlined />}
                        size="small"
                        onClick={() => setIsBulkTransferModalOpen(true)}
                        style={{ background: '#faad14', borderColor: '#faad14' }}
                      >
                        Chuyển phòng ({selectedRowKeys.length})
                      </Button>
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
                        Hiển thị {studentsToDisplay.length} học viên theo thư mục gốc
                      </span>
                    </Badge>
                  ) : (
                    `Hiển thị ${studentsToDisplay.length} học viên theo thư mục gốc`
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
                <StudentTable
                  data={studentsToDisplay}
                  loading={loading || remoteLoading}
                  onRefresh={() => loadData()}
                  onViewDetail={(item: any) => setSelectedStudent(item)}
                  onEdit={handleEditClick}
                  onDelete={(id: number) => handleDelete(id)}
                  selectedRowKeys={selectedRowKeys}
                  onSelectChange={setSelectedRowKeys}
                  showTrungDoiColumn={!!filters.don_vi_doi_id}
                />
              ) : (
                <StudentGrid
                  data={studentsToDisplay}
                  loading={loading || remoteLoading}
                  onViewDetail={(item: any) => setSelectedStudent(item)}
                  onEdit={handleEditClick}
                  onDelete={(id: number) => handleDelete(id)}
                />
              )}
            </Card>
          )}
        </div>
      </div>

      <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <UpdateStudentModal
        isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        student={editingStudent} onSuccess={loadData}
      />
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={loadData} />
      <ImportStudentModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={loadData} />

      <BulkTransferRoomModal
        open={isBulkTransferModalOpen}
        onClose={() => setIsBulkTransferModalOpen(false)}
        studentIds={selectedRowKeys.map(Number)}
        sourceRoomId={selectedRoom?.id}
        filters={{
          lop_hoc_id: filters.lop_hoc_id ? Number(filters.lop_hoc_id) : undefined,
          khoa_hoc_id: filters.khoa_hoc_id ? Number(filters.khoa_hoc_id) : undefined
        }}
        onSuccess={() => {
          setSelectedRowKeys([])
          loadData()
        }}
      />

      <SwapRoomModal
        open={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        sourceRoom={roomToSwap}
        onSuccess={() => {
          loadData()
        }}
      />

      <ReportExportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        groups={reportGroups}
        title="Xuất báo cáo học viên"
        initialValues={{
          donViId: filters.don_vi_doi_id ? Number(filters.don_vi_doi_id) : undefined,
          search: filters.search || undefined,
        }}
      />

      <ExportFieldSelectorModal
        open={isExportFieldModalOpen}
        onClose={() => setIsExportFieldModalOpen(false)}
      />
    </PageContainer>
  )
}