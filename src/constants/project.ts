export const PROJECT_SHORT_NAME = 'PHẦN MỀM QUẢN LÝ KÝ TÚC XÁ HỌC VIÊN'
export const PROJECT_SYSTEM_TITLE = 'TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN'
export const PROJECT_OPERATION_TITLE = 'TRUNG TÂM ĐIỀU HÀNH KÝ TÚC XÁ'

// T6.1: Action map for module-based header filtering
export const MODULE_ACTION_MAP = {
  '/hoc-vien': {
    label: 'Quản lý học viên',
    visibleActions: ['add', 'edit', 'delete', 'export', 'import', 'stats'],
  },
  '/phong': {
    label: 'Quản lý phòng',
    visibleActions: ['add', 'edit', 'delete', 'stats'],
  },
  '/vi-pham-ky-luat': {
    label: 'Vi phạm & Kỷ luật',
    visibleActions: ['add', 'edit', 'delete', 'export'],
  },
  '/tai-san': {
    label: 'Quản lý tài sản',
    visibleActions: ['add', 'edit', 'delete', 'export'],
  },
  '/phan-cong-ve-sinh': {
    label: 'Phân công vệ sinh',
    visibleActions: ['add', 'edit', 'delete'],
  },
  '/lich-su-thay-phong': {
    label: 'Lịch sử chuyên công phòng',
    visibleActions: ['view', 'export'],
  },
  '/nhat-ky-he-thong': {
    label: 'Nhật ký hệ thống',
    visibleActions: ['export', 'filter'],
  },
  '/default': {
    label: 'Default',
    visibleActions: [],
  },
}

// Common action metadata
export const ACTION_METADATA = {
  add: { label: 'Thêm mới', icon: 'PlusOutlined', color: 'primary' },
  edit: { label: 'Sửa', icon: 'EditOutlined', color: 'default' },
  delete: { label: 'Xóa', icon: 'DeleteOutlined', color: 'danger' },
  export: { label: 'Xuất Excel', icon: 'DownloadOutlined', color: 'default' },
  import: { label: 'Nhập dữ liệu', icon: 'UploadOutlined', color: 'default' },
  stats: { label: 'Thống kê', icon: 'BarChartOutlined', color: 'default' },
  view: { label: 'Xem', icon: 'EyeOutlined', color: 'default' },
  filter: { label: 'Lọc', icon: 'FilterOutlined', color: 'default' },
}
