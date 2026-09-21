
import { useState } from 'react'
import { Table, Tag, Button, Space, Popconfirm, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import { formatDate } from '@/lib/utils'
import AssignRoomModal from './AssignRoomModal'

interface Props {
  data: any[]
  loading: boolean
  onRefresh: () => void
  onViewDetail: (item: any) => void
  onEdit: (item: any) => void
  onDelete: (id: number) => void
  selectedRowKeys?: React.Key[]
  onSelectChange?: (selectedRowKeys: React.Key[]) => void
  showTrungDoiColumn?: boolean
}

export default function StudentTable({
  data,
  loading,
  onRefresh,
  onViewDetail,
  onEdit,
  onDelete,
  selectedRowKeys = [],
  onSelectChange,
}: Props) {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [assignStudent, setAssignStudent] = useState<any>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)

  const rowSelection: TableRowSelection<any> | undefined = onSelectChange ? {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  } : undefined

  const columns: ColumnsType<any> = [
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
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Mã HV',
      dataIndex: 'ma_hoc_vien',
      key: 'ma_hoc_vien',
      width: 120,
      align: 'center',
      render: (v) => (
        <span style={{
          fontWeight: 700,
          color: '#1d4ed8',
          fontFamily: 'monospace',
          fontSize: 13,
          background: '#e6f7ff',
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      align: 'center',
      render: (v) => (
        <span style={{
          fontWeight: 600,
          color: '#262626'
        }}>
          {v || 'N/A'}
        </span>
      )
    },
    {
      title: 'Trung đội',
      dataIndex: 'trung_doi',
      key: 'trung_doi',
      width: 180,
      align: 'center',
      render: (v) => <span style={{ color: '#1f2937', fontWeight: 600 }}>{v || '---'}</span>,
    },
    // {
    //   title: 'Tiểu đội',
    //   dataIndex: 'tieu_doi',
    //   key: 'tieu_doi',
    //   width: 180,
    //   align: 'center',
    //   render: (v) => <span style={{ color: '#4b5563' }}>{v || '---'}</span>,
    // },
    {
      title: 'Ngày sinh',
      dataIndex: 'ngay_sinh',
      key: 'ngay_sinh',
      width: 120,
      align: 'center',
      render: (v) => (
        <span style={{ fontSize: 13, color: '#595959' }}>
          {formatDate(v)}
        </span>
      )
    },
    {
      title: 'Quê quán',
      dataIndex: 'que_quan',
      key: 'que_quan',
      align: 'center',
      ellipsis: { showTitle: false },
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 13, color: '#595959' }}>
            {v || '---'}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Dân tộc',
      dataIndex: 'dan_toc',
      key: 'dan_toc',
      width: 100,
      align: 'center',
      render: (v) => (
        <Tag color="default" style={{ fontSize: 12 }}>
          {v || '---'}
        </Tag>
      )
    },
    {
      title: 'Phòng',
      key: 'phong',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const stay = record.lichSuBoTriPhong?.[0]
        const phong = stay?.phong
        if (!phong) return <span style={{ color: '#000000ff' }}>-</span>

        const info = [
          phong.tang?.toaNha?.ten_toa,
          phong.tang?.so_tang ? `Tầng ${phong.tang.so_tang}` : null
        ].filter(Boolean).join(' - ')

        return (
          <Tooltip title={info || 'Chi tiết phòng'}>
            <Tag color="blue" style={{ fontWeight: 600, borderRadius: 4 }}>
              {phong.ma_phong}
            </Tag>
          </Tooltip>
        )
      },
    },
    {
      title: 'Giường',
      key: 'giuong',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const stay = record.lichSuBoTriPhong?.[0]
        const maGiuong = stay?.giuong?.ma_giuong
        if (!maGiuong) return <span style={{ color: '#000000ff' }}>-</span>

        return (
          <Tag color="purple" style={{ fontWeight: 600, borderRadius: 4 }}>
            {maGiuong}
          </Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space data-action size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail(record)
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onEdit(record)
              }}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Gán phòng ở">
            <Button
              size="small"
              type="text"
              icon={<HomeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                setAssignStudent(record)
                setAssignModalOpen(true)
              }}
              style={{ color: '#722ed1' }}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa học viên?"
            description="Hành động này không thể hoàn tác."
            onConfirm={(e) => {
              e?.stopPropagation()
              onDelete(record.id)
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
      if (!a.ngay_tao && !b.ngay_tao) return 0
      if (!a.ngay_tao) return 1   // null xuống cuối
      if (!b.ngay_tao) return -1  // null xuống cuối
      return new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()
    })
    : []

  return (
    <>
      <Table
        dataSource={sortedData}
        columns={columns}
        rowKey={(r) => r.id || r.ma_hoc_vien}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học viên`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
        size="middle"
        scroll={{ x: 'max-content' }}
        onRow={(record) => ({
          onClick: () => onViewDetail(record),
          style: {
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          },
          onMouseEnter: (e) => {
            (e.currentTarget as HTMLElement).style.background = '#fafafa'
          },
          onMouseLeave: (e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
          },
        })}
        style={{
          borderRadius: 8,
        }}
      />

      {assignStudent && (
        <AssignRoomModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setAssignStudent(null)
          }}
          student={assignStudent}
          onSuccess={() => {
            onRefresh()
          }}
        />
      )}
    </>
  )
}
