import { Select, DatePicker, Row, Col, Button, Card } from 'antd'
import { FilterOutlined, ClearOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import type { TaiSanPhong } from '@/types/asset'
import { systemTheme } from '@/theme/system-theme'

const { RangePicker } = DatePicker

export interface RepairFilterValues {
  maPhong?: string
  ngayPhatHien?: [Dayjs, Dayjs] | null
  ngaySua?: [Dayjs, Dayjs] | null
  trangThai?: string
}

interface RepairFilterProps {
  taiSans: TaiSanPhong[]
  rooms?: any[]
  values: RepairFilterValues
  onChange: (values: RepairFilterValues) => void
  onReset: () => void
}

export function RepairFilter({ taiSans, rooms = [], values, onChange, onReset }: RepairFilterProps) {
  // Build unique room list from rooms API (fallback to taiSans if empty)
  let phongOptions = []
  if (rooms.length > 0) {
    phongOptions = rooms.map(r => ({ value: r.ma_phong, label: `Phòng ${r.ma_phong}` }))
  } else {
    phongOptions = Array.from(
      new Map(
        taiSans
          .filter((ts) => ts.phong?.ma_phong)
          .map((ts) => [ts.phong!.ma_phong, ts.phong!.ma_phong])
      ).entries()
    ).map(([value, label]) => ({ value, label: `Phòng ${label}` }))
  }

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        borderColor: systemTheme.border.subtle,
        borderRadius: systemTheme.radius.lg,
        background: systemTheme.background.container,
      }}
      styles={{
        body: { padding: '12px 16px' },
        header: { background: systemTheme.background.subtle },
      }}
    >
      <Row gutter={[12, 10]} align="middle">
        {/* Lọc theo phòng */}
        <Col xs={24} sm={12} md={6}>
          <Select
            allowClear
            showSearch
            placeholder="Lọc theo phòng"
            style={{ width: '100%' }}
            value={values.maPhong}
            options={phongOptions}
            optionFilterProp="label"
            suffixIcon={<FilterOutlined />}
            onChange={(val) => onChange({ ...values, maPhong: val })}
          />
        </Col>

        {/* Ngày phát hiện */}
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Phát hiện từ', 'đến ngày']}
            value={values.ngayPhatHien ?? null}
            onChange={(dates) =>
              onChange({ ...values, ngayPhatHien: dates as [Dayjs, Dayjs] | null })
            }
          />
        </Col>

        {/* Ngày sửa chữa */}
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Sửa chữa từ', 'đến ngày']}
            value={values.ngaySua ?? null}
            onChange={(dates) =>
              onChange({ ...values, ngaySua: dates as [Dayjs, Dayjs] | null })
            }
          />
        </Col>

        {/* Trạng thái */}
        <Col xs={24} sm={8} md={4}>
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: '100%' }}
            value={values.trangThai}
            onChange={(val) => onChange({ ...values, trangThai: val })}
            options={[
              { value: 'CHUA_SUA', label: 'Chưa sửa' },
              { value: 'DA_SUA', label: 'Đã sửa' },
            ]}
          />
        </Col>

        {/* Reset */}
        <Col xs={24} sm={4} md={2}>
          <Button
            icon={<ClearOutlined />}
            onClick={onReset}
            style={{ width: '100%' }}
          >
            Xoá lọc
          </Button>
        </Col>
      </Row>
    </Card>
  )
}
