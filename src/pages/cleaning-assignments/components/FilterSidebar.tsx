import { Card, Input, Select, Button, Space, Divider, Badge, AutoComplete, DatePicker } from 'antd'
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import { useState } from 'react'
import dayjs from 'dayjs'
import type { PhanCongVeSinh } from '@/types/cleaning-document'

const { RangePicker } = DatePicker

interface CleaningFilters {
  search: string
  toaNha: string
  trungDoi: string
  dateFrom: string
  dateTo: string
}

interface Props {
  currentFilters: CleaningFilters
  onFilterChange: (fields: Partial<CleaningFilters>) => void
  allAssignments?: PhanCongVeSinh[]
  buildings?: any[]
  squads?: any[]
}

export default function FilterSidebar({ 
  currentFilters, 
  onFilterChange, 
  allAssignments = [],
  buildings = [],
  squads = []
}: Props) {
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([])

  const activeFilterCount = Object.values(currentFilters).filter(v => v !== '' && v !== undefined).length

  const handleSearchChange = (value: string) => {
    if (!value || value.length < 1) {
      setSearchOptions([])
      onFilterChange({ search: value })
      return
    }

    const filtered = allAssignments
      .filter(a => 
        a.viTri?.ten_vi_tri?.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 10)
      .map(a => ({
        value: a.viTri?.ten_vi_tri || '',
        label: `${a.viTri?.ten_vi_tri} - ${a.viTri?.toaNha?.ten_toa ?? ''}`,
      }))

    setSearchOptions(filtered)
    onFilterChange({ search: value })
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      onFilterChange({
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD')
      })
    } else {
      onFilterChange({ dateFrom: '', dateTo: '' })
    }
  }

  const handleReset = () => {
    setSearchOptions([])
    onFilterChange({
      search: '',
      toaNha: '',
      trungDoi: '',
      dateFrom: '',
      dateTo: ''
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
            Tìm kiếm vị trí
          </div>
          <AutoComplete
            style={{ width: '100%' }}
            options={searchOptions}
            value={currentFilters.search || ''}
            onChange={handleSearchChange}
            onSelect={handleSearchChange}
            placeholder="Tìm vị trí..."
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
            onChange={(v) => onFilterChange({ toaNha: v || '' })}
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
            Trung đội
          </div>
          <Select
            placeholder="Tất cả"
            value={currentFilters.trungDoi || undefined}
            onChange={(v) => onFilterChange({ trungDoi: v || '' })}
            allowClear 
            style={{ width: '100%', borderRadius: 6 }}
            options={squads.map(s => ({
              value: s.id.toString(),
              label: s.ten_don_vi ?? s.ma_don_vi ?? `Đơn vị ${s.id}`
            }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Thời gian
          </div>
          <RangePicker
            style={{ width: '100%', borderRadius: 6 }}
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            value={currentFilters.dateFrom && currentFilters.dateTo ? [
              dayjs(currentFilters.dateFrom),
              dayjs(currentFilters.dateTo)
            ] : null}
            onChange={handleDateRangeChange}
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
