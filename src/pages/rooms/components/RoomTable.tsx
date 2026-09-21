import { Table, Tag, Button, Space, Popconfirm, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { Room } from '@/types/room'
import { systemTheme } from '@/theme/system-theme'

interface Props {
  data: Room[]
  loading: boolean
  onRefresh: () => void
  onViewDetail: (item: Room) => void
  onEdit: (item: Room) => void
  onDelete: (id: number) => void
  selectedRowKeys?: React.Key[]
  onSelectChange?: (selectedRowKeys: React.Key[]) => void
  getRoomStatus?: (room: Room) => 'FULL' | 'AVAILABLE' | 'EMPTY' | 'UNDER_REPAIR'
  occupiedByRoom?: Record<number, number>
}

export default function RoomTable({
  data,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
  selectedRowKeys = [],
  onSelectChange,
  getRoomStatus,
  occupiedByRoom = {},
}: Props) {
  const rowSelection: TableRowSelection<Room> | undefined = onSelectChange ? {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  } : undefined

  const columns: ColumnsType<Room> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span style={{
          fontWeight: 600,
          color: systemTheme.text.secondary,
          fontSize: 12
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Mã phòng',
      dataIndex: 'ma_phong',
      key: 'ma_phong',
      width: 140,
      align: 'center',
      render: (v) => (
        <span style={{
          fontWeight: 700,
          color: systemTheme.brand.primary,
          fontFamily: 'monospace',
          fontSize: 13,
          background: systemTheme.background.subtle,
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Tòa nhà',
      key: 'toa',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <span style={{
          fontWeight: 600,
          color: systemTheme.text.primary
        }}>
          {r.tang?.toaNha?.ten_toa ?? r.tang?.toaNha?.ma_toa ?? (r.tang?.toa_nha_id ? `Tòa #${r.tang.toa_nha_id}` : '-')}
        </span>
      )
    },
    {
      title: 'Tầng',
      key: 'tang',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tag color="blue">
          {r.tang?.so_tang != null ? `Tầng ${r.tang.so_tang}` : '-'}
        </Tag>
      )
    },
    {
      title: 'Loại phòng',
      dataIndex: 'loai_phong',
      key: 'loai_phong',
      width: 130,
      align: 'center',
      render: (v) => {
        if (!v) return <Tag>Chưa xác định</Tag>
        return v === 'HOC_VIEN'
          ? <Tag color="purple">Học Viên</Tag>
          : <Tag color="orange">Cán Bộ</Tag>
      }
    },
    {
      title: 'Giới tính',
      dataIndex: 'gioi_tinh_phong',
      key: 'gioi_tinh',
      width: 110,
      align: 'center',
      render: (v) => {
        if (!v) return <Tag>Chưa xác định</Tag>
        return v === 'NAM'
          ? <Tag color="cyan">Nam</Tag>
          : <Tag color="pink">Nữ</Tag>
      }
    },
    {
      title: 'Số giường',
      key: 'so_giuong',
      width: 100,
      align: 'center',
      render: (_, r) => {
        const count = r.giuong?.length ?? 0
        return (
          <span style={{
            fontWeight: 600,
            color: count > 0 ? systemTheme.status.success : systemTheme.text.secondary,
            fontSize: 14
          }}>
            {count}
          </span>
        )
      }
    },
    {
      title: 'Đang ở',
      key: 'occupied',
      width: 90,
      align: 'center',
      render: (_, r) => <span style={{ fontWeight: 600 }}>{occupiedByRoom[r.id] ?? 0}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'trang_thai',
      width: 140,
      align: 'center',
      render: (_, r) => {
        const status = getRoomStatus?.(r)
        if (status === 'FULL') return <Tag color="red">Full</Tag>
        if (status === 'AVAILABLE') return <Tag color="gold">Còn chỗ</Tag>
        if (status === 'UNDER_REPAIR') return <Tag color="purple">Đang sửa chữa</Tag>
        return <Tag color="green">Trống</Tag>
      },
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
              type="text"
              style={{ color: systemTheme.brand.primary }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              type="text"
              style={{ color: systemTheme.status.success }}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa phòng này?"
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
                type="text"
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
        showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} phòng`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      size="middle"
      scroll={{ x: 'max-content' }}
      style={{
        background: systemTheme.background.container,
      }}
    />
  )
}
