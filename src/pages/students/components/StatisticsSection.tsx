import { useMemo, useState } from 'react'
import { Row, Col, Card, Statistic, Progress, Table, Button, Space, Drawer, Typography } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  ClusterOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Student } from '@/types/student'
import { systemTheme } from '@/theme/system-theme'
import type { ThongKeHocVienResponse } from '@/services/thong-ke.service'

interface Props {
  students: Student[]
  filteredCount: number
  statsApi?: ThongKeHocVienResponse | null
  onNavigateFacility?: (facilityName: string) => void
  allFacilities?: string[]
}

interface UnitStats {
  key: string
  label: string
  so_luong: number
}

interface SquadStudentRow {
  id: number
  ho_ten: string | null
  ngay_sinh: string | null
  ma_giuong: string | null
  ma_phong: string | null
}

interface SquadStatsRow {
  don_vi_doi_id: number
  trung_doi: string
  so_luong_hoc_vien: number
  hoc_vien: SquadStudentRow[]
}

interface FacilityStatsRow {
  co_so: string
  tong_trung_doi: number
  tong_hoc_vien: number
  danh_sach_trung_doi: SquadStatsRow[]
}

function buildUnitStats(
  students: Student[],
  getKey: (s: Student) => string | number | null | undefined,
  getLabel: (s: Student) => string,
): UnitStats[] {
  const map = new Map<string, number>()
  students.forEach((student) => {
    const key = getKey(student)
    if (!key) return

    const label = getLabel(student)
    map.set(label, (map.get(label) ?? 0) + 1)
  })

  return Array.from(map.entries()).map(([label, so_luong], idx) => ({
    key: `${idx}`,
    label,
    so_luong,
  }))
}

function getPartyFlag(student: Student): boolean {
  const raw = (student as any).cam_tinh_dang ?? (student as any).dang_vien
  return raw === true
}

export default function StatisticsSection({
  students,
  filteredCount,
  statsApi,
  onNavigateFacility,
  allFacilities = [],
}: Props) {
  const totalStudents = students.length
  const partyMemberCount = students.filter((s) => getPartyFlag(s)).length
  const partyPercentage = totalStudents > 0 ? Math.round((partyMemberCount / totalStudents) * 100) : 0

  const trungDoiStats = buildUnitStats(
    students,
    (s) => (s as any).don_vi_doi_id ?? (s as any).trung_doi,
    (s) => (s as any).donViDoi?.ten_don_vi || (s as any).trung_doi || `Trung đội ${(s as any).don_vi_doi_id}`,
  )

  const tongTrungDoiToanKtx = statsApi?.tong_trung_doi_toan_ktx ?? trungDoiStats.length

  const fallbackFacilityStats: FacilityStatsRow[] = useMemo(() => {
    const facilityMap = new Map<string, {
      squadMap: Map<number, {
        trung_doi: string
        hoc_vien: Array<{
          id: number
          ho_ten: string | null
          ngay_sinh: string | null
          ma_giuong: string | null
          ma_phong: string | null
        }>
      }>
      hocVienIds: Set<number>
    }>()

    students.forEach((student: any) => {
      const stay = student.lichSuBoTriPhong?.[0]
      const coSo = stay?.phong?.tang?.toaNha?.co_so?.trim()
      const squadId = student.don_vi_doi_id
      if (!coSo || !squadId) return

      if (!facilityMap.has(coSo)) {
        facilityMap.set(coSo, {
          squadMap: new Map(),
          hocVienIds: new Set(),
        })
      }

      const facility = facilityMap.get(coSo)!
      facility.hocVienIds.add(student.id)

      if (!facility.squadMap.has(squadId)) {
        facility.squadMap.set(squadId, {
          trung_doi: student.donViDoi?.ten_don_vi || student.trung_doi || `Đơn vị ${squadId}`,
          hoc_vien: [],
        })
      }

      const squad = facility.squadMap.get(squadId)!
      if (!squad.hoc_vien.some((item) => item.id === student.id)) {
        squad.hoc_vien.push({
          id: student.id,
          ho_ten: student.ho_ten ?? null,
          ngay_sinh: student.ngay_sinh ?? null,
          ma_giuong: stay?.giuong?.ma_giuong ?? null,
          ma_phong: stay?.phong?.ma_phong ?? null,
        })
      }
    })

    return Array.from(facilityMap.entries())
      .map(([co_so, value]) => ({
        co_so,
        tong_trung_doi: value.squadMap.size,
        tong_hoc_vien: value.hocVienIds.size,
        danh_sach_trung_doi: Array.from(value.squadMap.entries())
          .map(([don_vi_doi_id, squad]) => ({
            don_vi_doi_id,
            trung_doi: squad.trung_doi,
            so_luong_hoc_vien: squad.hoc_vien.length,
            hoc_vien: squad.hoc_vien,
          }))
          .sort((a, b) => a.trung_doi.localeCompare(b.trung_doi, 'vi')),
      }))
      .sort((a, b) => a.co_so.localeCompare(b.co_so, 'vi'))
  }, [students])

  const facilityStats: FacilityStatsRow[] =
    statsApi?.thong_ke_trung_doi_theo_co_so && statsApi.thong_ke_trung_doi_theo_co_so.length > 0
      ? (statsApi.thong_ke_trung_doi_theo_co_so as FacilityStatsRow[])
      : fallbackFacilityStats

  const mergedFacilityStats = useMemo(() => {
    const map = new Map<string, FacilityStatsRow>()

    facilityStats.forEach((facility) => {
      map.set(facility.co_so, {
        co_so: facility.co_so,
        tong_trung_doi: facility.tong_trung_doi ?? 0,
        tong_hoc_vien: facility.tong_hoc_vien ?? 0,
        danh_sach_trung_doi: facility.danh_sach_trung_doi ?? [],
      })
    })

    allFacilities.forEach((facilityName) => {
      const key = facilityName.trim()
      if (!key) return

      if (!map.has(key)) {
        map.set(key, {
          co_so: key,
          tong_trung_doi: 0,
          tong_hoc_vien: 0,
          danh_sach_trung_doi: [],
        })
      }
    })

    return Array.from(map.values()).sort((a, b) => a.co_so.localeCompare(b.co_so, 'vi'))
  }, [allFacilities, facilityStats])

  const [activeFacilityName, setActiveFacilityName] = useState<string | null>(null)
  const [activeSquadId, setActiveSquadId] = useState<number | null>(null)
  const isDetailMode = !!activeFacilityName

  const activeFacility = mergedFacilityStats.find((item) => item.co_so === activeFacilityName)
  const activeSquad = activeFacility?.danh_sach_trung_doi?.find((item) => item.don_vi_doi_id === activeSquadId)

  const squadRows = activeFacility?.danh_sach_trung_doi ?? []
  const squadStudentRows = activeSquad?.hoc_vien ?? []

  const tieuDoiStats = buildUnitStats(
    students,
    (s) => (s as any).lop_hoc_id ?? (s as any).tieu_doi,
    (s) => s.lopHoc?.ten_lop || (s as any).tieu_doi || `Tiểu đội ${(s as any).lop_hoc_id}`,
  )

  const statCardStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    borderRadius: 8,
    background: '#fff',
    border: `1px solid ${systemTheme.border.subtle}`,
  }

  const unitColumns: ColumnsType<UnitStats> = [
    {
      title: 'Đơn vị',
      dataIndex: 'label',
      key: 'label',
      align: 'left',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'so_luong',
      key: 'so_luong',
      align: 'center',
      width: 100,
      render: (v) => <span style={{ fontWeight: 700, color: systemTheme.brand.primary }}>{v}</span>,
    },
  ]

  return (
    <div style={{ marginBottom: 20 }} className="animate-fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.primary}` }}>
            <Statistic
              title="Tổng học viên"
              value={totalStudents}
              prefix={<TeamOutlined style={{ color: systemTheme.brand.primary }} />}
              valueStyle={{ color: systemTheme.brand.primary, fontWeight: 700 }}
            />
            {filteredCount < totalStudents && (
              <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginTop: 8 }}>
                Đang hiển thị: {filteredCount}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.status.success}` }}>
            <Statistic
              title="Tổng số trung đội"
              value={tongTrungDoiToanKtx}
              prefix={<ApartmentOutlined style={{ color: systemTheme.status.success }} />}
              valueStyle={{ color: systemTheme.status.success, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.secondary}` }}>
            <Statistic
              title="Tổng số tiểu đội"
              value={tieuDoiStats.length}
              prefix={<ClusterOutlined style={{ color: systemTheme.brand.secondary }} />}
              valueStyle={{ color: systemTheme.brand.secondary, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.accent}` }}>
            <Statistic
              title="Đảng viên"
              value={partyMemberCount}
              prefix={<UserOutlined style={{ color: systemTheme.brand.accent }} />}
              valueStyle={{ color: systemTheme.brand.accent, fontWeight: 700 }}
            />
            <Progress
              percent={partyPercentage}
              strokeColor={systemTheme.brand.accent}
              showInfo={true}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {mergedFacilityStats.map((facility) => (
          <Col xs={24} sm={12} lg={8} key={facility.co_so}>
            <Card
              hoverable
              onClick={() => onNavigateFacility?.(facility.co_so)}
              style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.primary}` }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Statistic
                  title={`Tổng số trung đội tại ${facility.co_so}`}
                  value={facility.tong_trung_doi}
                  prefix={<ApartmentOutlined style={{ color: systemTheme.brand.primary }} />}
                  valueStyle={{ color: systemTheme.brand.primary, fontWeight: 700 }}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation()
                    setActiveFacilityName(facility.co_so)
                    setActiveSquadId(null)
                  }}
                >
                  Xem chi tiết
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title={`Chi tiết ${activeFacility?.co_so ?? ''}`}
        placement="right"
        width={840}
        open={isDetailMode}
        onClose={() => {
          setActiveFacilityName(null)
          setActiveSquadId(null)
        }}
      >
        {activeFacility && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text strong>
              Tổng số các trung đội tại {activeFacility.co_so}: {activeFacility.tong_trung_doi}
            </Typography.Text>

            <Table<SquadStatsRow>
              rowKey={(row) => row.don_vi_doi_id}
              columns={[
                { title: 'STT', key: 'stt', width: 70, render: (_: unknown, __: unknown, index: number) => index + 1 },
                { title: 'Trung đội', dataIndex: 'trung_doi', key: 'trung_doi' },
                { title: 'Số học viên', dataIndex: 'so_luong_hoc_vien', key: 'so_luong_hoc_vien', width: 140 },
                {
                  title: 'Xem học viên',
                  key: 'view',
                  width: 150,
                  render: (_: unknown, row: SquadStatsRow) => (
                    <Button type="link" onClick={() => setActiveSquadId(row.don_vi_doi_id)}>
                      Mở danh sách
                    </Button>
                  ),
                },
              ]}
              dataSource={squadRows}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="small"
            />

            {activeSquad && (
              <Card
                size="small"
                title={`Danh sách học viên - ${activeSquad.trung_doi}`}
              >
                <Table<SquadStudentRow>
                  rowKey={(row) => row.id}
                  columns={[
                    { title: 'STT', key: 'stt', width: 70, render: (_: unknown, __: unknown, index: number) => index + 1 },
                    { title: 'Họ và tên', dataIndex: 'ho_ten', key: 'ho_ten' },
                    {
                      title: 'Ngày sinh',
                      dataIndex: 'ngay_sinh',
                      key: 'ngay_sinh',
                      width: 140,
                      render: (value: string | null) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
                    },
                    { title: 'Số giường', dataIndex: 'ma_giuong', key: 'ma_giuong', width: 120 },
                    { title: 'Số phòng ở', dataIndex: 'ma_phong', key: 'ma_phong', width: 130 },
                  ]}
                  dataSource={squadStudentRows}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  size="small"
                />
              </Card>
            )}
          </Space>
        )}
      </Drawer>

      {!isDetailMode && trungDoiStats.length > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title="Thống kê theo Trung đội"
              size="small"
              style={{ background: systemTheme.background.subtle, borderColor: systemTheme.border.subtle }}
            >
              <Table
                columns={unitColumns}
                dataSource={trungDoiStats}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="small"
                bordered={false}
              />
            </Card>
          </Col>
        </Row>
      )}

      {!isDetailMode && tieuDoiStats.length > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title="Thống kê theo Tiểu đội"
              size="small"
              style={{ background: systemTheme.background.subtle, borderColor: systemTheme.border.subtle }}
            >
              <Table
                columns={unitColumns}
                dataSource={tieuDoiStats}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="small"
                bordered={false}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
