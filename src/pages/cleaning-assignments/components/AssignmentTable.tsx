import { Table, Tag, Button, Space, Popconfirm, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { PhanCongVeSinh } from '@/types/cleaning-document'

interface Props {
  data: PhanCongVeSinh[]
  loading: boolean
  onRefresh: () => void
  onViewDetail: (item: PhanCongVeSinh) => void
  onEdit: (item: PhanCongVeSinh) => void
  onDelete: (id: number) => void
  selectedRowKeys?: React.Key[]
  onSelectChange?: (selectedRowKeys: React.Key[]) => void
}

export default function AssignmentTable({ 
  data, 
  loading, 
  onViewDetail, 
  onEdit, 
  onDelete,
  selectedRowKeys = [],
  onSelectChange
}: Props) {
  const rowSelection: TableRowSelection<PhanCongVeSinh> | undefined = onSelectChange ? {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  } : undefined

  const columns: ColumnsType<PhanCongVeSinh> = [
    {
      title: 'STT', 
      key: 'stt', 
      width: 60, 
      align: 'center',
      render: (_, __, index) => (
        <span style={{ 
          fontWeight: 600, 
          color: '#8c8c8c',
          fontSize: 12 
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Vị trí', 
      key: 'vi_tri',
      width: 200,
      align: 'center',
      render: (_, r) => (
        <span style={{ 
          fontWeight: 600,
          color: '#262626' 
        }}>
          {r.viTri?.ten_vi_tri ?? `Vị trí #${r.vi_tri_id}`}
        </span>
      )
    },
    { 
      title: 'Tòa nhà', 
      key: 'toa',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <Tag color="blue">
          {r.viTri?.toaNha?.ten_toa ?? r.viTri?.toaNha?.ma_toa ?? '-'}
        </Tag>
      )
    },
    { 
      title: 'Trung đội phụ trách', 
      key: 'trung_doi',
      width: 180,
      align: 'center',
      render: (_, r) => (
        <Tag color="purple">
          {r.trungDoi?.ten_don_vi ?? r.trungDoi?.ma_don_vi ?? 'Chưa phân công'}
        </Tag>
      )
    },
    { 
      title: 'Thời gian', 
      key: 'thoi_gian', 
      width: 130,
      align: 'center',
      render: (_, r) => (
        <span style={{ fontSize: 13, color: '#595959' }}>
          {r.thoi_gian ? new Date(r.thoi_gian).toLocaleDateString('vi-VN') : '-'}
        </span>
      )
    },
    {
      title: 'Hành động', 
      key: 'actions', 
      width: 140, 
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => onViewDetail(record)}
              type="default"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)} 
              type="primary"
            />
          </Tooltip>
          <Popconfirm 
            title="Xác nhận xóa phân công này?" 
            description="Hành động này không thể hoàn tác."
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={{ 
        pageSize: 10, 
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} phân công`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      size="middle"
      scroll={{ x: 'max-content' }}
      style={{ 
        background: '#fff',
      }}
    />
  )
}
