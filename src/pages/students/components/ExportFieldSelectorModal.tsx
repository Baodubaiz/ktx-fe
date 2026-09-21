import { Modal, Checkbox, Button, Space, Divider, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { studentService } from '@/services/student.service'
import { saveAs } from 'file-saver'

interface Props {
  open: boolean
  onClose: () => void
}

// T5.3: Available export fields
const AVAILABLE_FIELDS = [
  { value: 'ma_hoc_vien', label: 'Mã HV' },
  { value: 'ho_ten', label: 'Họ & Tên' },
  { value: 'ngay_sinh', label: 'Ngày sinh' },
  { value: 'trung_doi', label: 'Trung đội' },
  { value: 'tieu_doi', label: 'Tiểu đội' },
  { value: 'khoa', label: 'Khóa' },
  { value: 'dang_vien', label: 'Đảng viên' },
  { value: 'chuc_vu', label: 'Chức vụ' },
  { value: 'que_quan', label: 'Quê quán' },
  { value: 'dan_toc', label: 'Dân tộc' },
  { value: 'so_dien_thoai', label: 'SĐT' },
  { value: 'don_vi_tuyen', label: 'Đơn vị tuyển' },
  { value: 'ngay_vao_dang', label: 'Ngày vào Đảng' },
  { value: 'ngay_vao_doan', label: 'Ngày vào Đoàn' },
  { value: 'toa_nha', label: 'Tòa nhà' },
  { value: 'so_tang', label: 'Số tầng' },
  { value: 'ma_phong', label: 'Mã phòng' },
  { value: 'ma_giuong', label: 'Mã giường' },
]

// Default fields (pre-selected)
const DEFAULT_FIELDS = ['ma_hoc_vien', 'ho_ten', 'trung_doi', 'tieu_doi', 'khoa', 'chuc_vu']

export default function ExportFieldSelectorModal({ open, onClose }: Props) {
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedFields(DEFAULT_FIELDS)
    }
  }, [open])

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.value))
  }

  const handleClearAll = () => {
    setSelectedFields([])
  }

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 cột')
      return
    }

    const hide = message.loading('Đang khởi tạo file Excel...', 0)
    try {
      setExporting(true)
      const response = await studentService.exportExcel(selectedFields)

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      saveAs(blob, `Danh_Sach_Hoc_Vien_${new Date().toLocaleDateString('vi-VN')}.xlsx`)
      message.success('Xuất file thành công')
      onClose()
    } catch (error) {
      console.error(error)
      message.error('Lỗi khi xuất file. Kiểm tra quyền VIEW-HOC-VIÊN.')
    } finally {
      setExporting(false)
      hide()
    }
  }

  return (
    <Modal
      title="Chọn cột xuất Excel"
      open={open}
      onCancel={onClose}
      width={500}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExport}
        >
          Xuất Excel
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button size="small" onClick={handleSelectAll} type="dashed">
            Chọn tất cả
          </Button>
          <Button size="small" onClick={handleClearAll} type="dashed" danger>
            Bỏ chọn tất cả
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: 300, overflowY: 'auto' }}>
        {AVAILABLE_FIELDS.map(field => (
          <Checkbox
            key={field.value}
            checked={selectedFields.includes(field.value)}
            onChange={() => handleFieldToggle(field.value)}
          >
            {field.label}
          </Checkbox>
        ))}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ fontSize: 12, color: '#666' }}>
        Đã chọn: <strong>{selectedFields.length}</strong> / {AVAILABLE_FIELDS.length} cột
      </div>
    </Modal>
  )
}
