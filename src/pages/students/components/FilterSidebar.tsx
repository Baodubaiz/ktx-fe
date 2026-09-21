import { Input, Select, Button, Space, DatePicker, Divider, Badge, Tag, AutoComplete, Checkbox } from 'antd'
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { classService, type LopHoc } from '@/services/class.service'
import { courseService, type KhoaHoc } from '@/services/course.service'
import type { StudentFilters, Student } from '@/types/student'
import { FilterPanel, FilterLabel } from '@/components'
import { systemTheme } from '@/theme/system-theme'

const { RangePicker } = DatePicker

interface Props {
  currentFilters: StudentFilters
  onFilterChange: (fields: Partial<StudentFilters>) => void
  allStudents?: Student[]
  squads?: { id: number; label: string }[]
}

export default function FilterSidebar({ currentFilters, onFilterChange, allStudents = [], squads = [] }: Props) {
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([])
  const [searchInput, setSearchInput] = useState(currentFilters.search || '')
  const [classes, setClasses] = useState<LopHoc[]>([])
  const [courses, setCourses] = useState<KhoaHoc[]>([])

  // Load classes and courses
  useEffect(() => {
    const loadData = async () => {
      try {
        const [classData, courseData] = await Promise.all([
          classService.getAll(),
          courseService.getAll()
        ])
        setClasses(classData)
        setCourses(courseData)
      } catch (err) {
        console.error('Failed to load filter data:', err)
      }
    }
    loadData()
  }, [])

  // Count active filters
  const activeFilterCount = Object.values(currentFilters).filter(v => v !== '' && v !== undefined).length

  // Generate autocomplete options
  const handleSearchChange = (value: string) => {
    setSearchInput(value) // giữ nguyên nội dung gõ để hiển thị
    const trimmed = value.trim()

    if (!trimmed || trimmed.length < 2) {
      setSearchOptions([])
      onFilterChange({ search: trimmed })
      return
    }

    const keyword = trimmed.toLowerCase()

    const filtered = allStudents
      .filter(s => {
        const stay = (s as any).lichSuBoTriPhong?.[0];
        const phongMatch = stay?.phong?.ma_phong?.toLowerCase().includes(keyword) ||
          stay?.phong?.ten_phong?.toLowerCase().includes(keyword);
        const tangMatch = stay?.phong?.tang?.ma_tang?.toLowerCase().includes(keyword) ||
          stay?.phong?.tang?.so_tang?.toString().includes(keyword);
        const giuongMatch = stay?.giuong?.ma_giuong?.toLowerCase().includes(keyword) ||
          stay?.giuong?.ten_giuong?.toLowerCase().includes(keyword);

        return s.ho_ten?.toLowerCase().includes(keyword) ||
          s.ma_hoc_vien?.toLowerCase().includes(keyword) ||
          phongMatch || tangMatch || giuongMatch;
      })
      .slice(0, 10)
      .map(s => {
        const stay = (s as any).lichSuBoTriPhong?.[0];
        const phong = stay?.phong?.ma_phong || '';
        const extra = phong ? ` - ${phong}` : '';
        return {
          value: s.ma_hoc_vien,
          label: `${s.ho_ten} (${s.ma_hoc_vien})${extra}`,
        };
      })

    setSearchOptions(filtered)
    onFilterChange({ search: trimmed })
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchOptions([])
    onFilterChange({
      search: '', ho_rieng: '', ten_rieng: '', don_vi_doi_id: '', lop_hoc_id: '', khoa_hoc_id: '', cam_tinh_dang: '',
      ngay_sinh_from: '', ngay_sinh_to: ''
    })
  }

  return (
    <FilterPanel
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <Badge count={activeFilterCount} style={{ backgroundColor: systemTheme.brand.primary }} />
          )}
        </Space>
      }
      width={280}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <FilterLabel>Tìm kiếm</FilterLabel>
          <AutoComplete
            style={{ width: '100%' }}
            options={searchOptions}
            value={searchInput}
            onChange={handleSearchChange}
            onSelect={handleSearchChange}
            placeholder="Họ tên, mã học viên..."
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
          <FilterLabel>Họ riêng</FilterLabel>
          <Input
            allowClear
            placeholder="Ví dụ: Nguyễn"
            value={currentFilters.ho_rieng || ''}
            onChange={(e) => onFilterChange({ ho_rieng: e.target.value })}
            style={{ borderRadius: 6 }}
          />
        </div>

        <div>
          <FilterLabel>Tên riêng</FilterLabel>
          <Input
            allowClear
            placeholder="Ví dụ: An"
            value={currentFilters.ten_rieng || ''}
            onChange={(e) => onFilterChange({ ten_rieng: e.target.value })}
            style={{ borderRadius: 6 }}
          />
        </div>

        <div>
          <FilterLabel>Khóa học</FilterLabel>
          <Select
            placeholder="Tất cả khóa học"
            value={currentFilters.khoa_hoc_id || undefined}
            onChange={(v) => onFilterChange({ khoa_hoc_id: v })}
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: '100%', borderRadius: 6 }}
            options={courses.map(c => ({
              value: c.id,
              label: `${c.ten_khoa} (${c.ma_khoa})`
            }))}
          />
        </div>

        <div>
          <FilterLabel>Tiểu đội</FilterLabel>
          <Select
            placeholder="Tất cả tiểu đội"
            value={currentFilters.lop_hoc_id || undefined}
            onChange={(v) => onFilterChange({ lop_hoc_id: v })}
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: '100%', borderRadius: 6 }}
            options={classes.map(c => ({
              value: c.id,
              label: c.ten_lop || c.ma_lop
            }))}
          />
        </div>

        <div>
          <Checkbox
            checked={currentFilters.cam_tinh_dang === true}
            onChange={(e) => onFilterChange({ cam_tinh_dang: e.target.checked ? true : '' })}
            style={{
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span style={{ color: systemTheme.text.secondary }}>Đảng viên</span>
          </Checkbox>
        </div>

        <div>
          <FilterLabel>Trung đội</FilterLabel>
          <Select
            placeholder="Tất cả"
            value={currentFilters.don_vi_doi_id ? Number(currentFilters.don_vi_doi_id) : undefined}
            onChange={(v) => onFilterChange({ don_vi_doi_id: v ?? '' })}
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: '100%', borderRadius: 6 }}
            options={squads.map(s => ({ value: s.id, label: s.label }))}
          />
        </div>

        <div>
          <FilterLabel>Ngày sinh</FilterLabel>
          <RangePicker
            style={{ width: '100%', borderRadius: 6 }}
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            value={
              currentFilters.ngay_sinh_from && currentFilters.ngay_sinh_to
                ? [dayjs(currentFilters.ngay_sinh_from), dayjs(currentFilters.ngay_sinh_to)]
                : null
            }
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onFilterChange({
                  ngay_sinh_from: dates[0].format('YYYY-MM-DD'),
                  ngay_sinh_to: dates[1].format('YYYY-MM-DD')
                })
              } else {
                onFilterChange({ ngay_sinh_from: '', ngay_sinh_to: '' })
              }
            }}
          />
        </div>

        <Divider style={{ margin: 0 }} />

        <Button
          block
          icon={<ClearOutlined />}
          onClick={handleReset}
          disabled={activeFilterCount === 0}
          style={{ borderRadius: 6 }}
          className="transition-all"
        >
          Đặt lại bộ lọc
        </Button>

        {activeFilterCount > 0 && (
          <div style={{ fontSize: 12, color: systemTheme.status.success, textAlign: 'center' }} className="animate-fade-in">
            <Tag color="success">{activeFilterCount} bộ lọc đang áp dụng</Tag>
          </div>
        )}
      </Space>
    </FilterPanel>
  )
}