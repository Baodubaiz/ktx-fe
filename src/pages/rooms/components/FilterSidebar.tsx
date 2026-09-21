import { Card, Input, Select, Button, Space, Divider, Badge, AutoComplete } from 'antd'
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { Room } from '@/types/room'

interface RoomFilters {
  search: string
  toaNha: string
  tang: number | undefined
  loaiPhong: string
  gioiTinh: string
}

interface Props {
  currentFilters: RoomFilters
  onFilterChange: (fields: Partial<RoomFilters>) => void
  allRooms?: Room[]
  buildings?: any[]
  floors?: number[]
}

export default function FilterSidebar({ 
  currentFilters, 
  onFilterChange, 
  allRooms = [],
  buildings = [],
  floors = []
}: Props) {
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([])

  // Count active filters
  const activeFilterCount = Object.values(currentFilters).filter(v => v !== '' && v !== undefined).length

  // Generate autocomplete options
  const handleSearchChange = (value: string) => {
    if (!value || value.length < 1) {
      setSearchOptions([])
      onFilterChange({ search: value })
      return
    }

    const filtered = allRooms
      .filter(r => 
        r.ma_phong?.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 10)
      .map(r => ({
        value: r.ma_phong,
        label: `${r.ma_phong} - Tòa ${r.tang?.toaNha?.ten_toa ?? r.tang?.toaNha?.ma_toa ?? '?'}`,
      }))

    setSearchOptions(filtered)
    onFilterChange({ search: value })
  }

  const handleReset = () => {
    setSearchOptions([])
    onFilterChange({
      search: '',
      toaNha: '',
      tang: undefined,
      loaiPhong: '',
      gioiTinh: ''
    })
  }

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <Badge count={activeFilterCount} style={{ backgroundColor: '#52c41a' }} />
          )}
        </Space>
      }
      style={{ 
        width: 280, 
        flexShrink: 0,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease',
      }} 
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tìm kiếm
          </div>
          <AutoComplete
            style={{ width: '100%' }}
            options={searchOptions}
            value={currentFilters.search || ''}
            onChange={handleSearchChange}
            onSelect={handleSearchChange}
            placeholder="Mã phòng..."
          >
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </AutoComplete>
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tòa nhà
          </div>
          <Select
            placeholder="Tất cả"
            value={currentFilters.toaNha || undefined}
            onChange={(v) => onFilterChange({ toaNha: v || '', tang: undefined })}
            allowClear 
            style={{ width: '100%', borderRadius: 6 }}
            options={buildings.map(b => ({
              value: b.id.toString(),
              label: b.ten_toa ?? b.ma_toa ?? `Tòa ${b.id}`
            }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tầng
          </div>
          <Select
            placeholder="Tất cả"
            value={currentFilters.tang}
            onChange={(v) => onFilterChange({ tang: v })}
            allowClear 
            style={{ width: '100%', borderRadius: 6 }}
            options={floors.map(f => ({
              value: f,
              label: `Tầng ${f}`
            }))}
            disabled={!currentFilters.toaNha}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Loại phòng
          </div>
          <Select
            placeholder="Tất cả"
            value={currentFilters.loaiPhong || undefined}
            onChange={(v) => onFilterChange({ loaiPhong: v || '' })}
            allowClear 
            style={{ width: '100%', borderRadius: 6 }}
            options={[
              { value: 'HOC_VIEN', label: 'Học Viên' },
              { value: 'CAN_BO', label: 'Cán Bộ' },
            ]}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Giới tính
          </div>
          <Select
            placeholder="Tất cả"
            value={currentFilters.gioiTinh || undefined}
            onChange={(v) => onFilterChange({ gioiTinh: v || '' })}
            allowClear 
            style={{ width: '100%', borderRadius: 6 }}
            options={[
              { value: 'NAM', label: 'Nam' },
              { value: 'NU', label: 'Nữ' },
            ]}
          />
        </div>

        <Divider style={{ margin: 0 }} />

        <Button 
          block 
          icon={<ClearOutlined />}
          onClick={handleReset}
          style={{ borderRadius: 6 }}
        >
          Đặt lại bộ lọc
        </Button>
      </Space>
    </Card>
  )
}
