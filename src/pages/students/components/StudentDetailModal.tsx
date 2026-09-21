import { useState, useEffect } from 'react'
import { Modal, Tabs, Descriptions, Tag, Table, Typography, Empty, Spin } from 'antd'
import { format } from 'date-fns'
import { studentService } from '@/services/student.service'

const { Text } = Typography

interface Props {
  student: any
  onClose: () => void
}

export default function StudentDetailModal({ student: shallowStudent, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('personal')
  const [fullData, setFullData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (shallowStudent?.id) {
      fetchFullInfo()
    }
  }, [shallowStudent])

  const fetchFullInfo = async () => {
    try {
      setLoading(true)
      const data = await studentService.getDetails(shallowStudent.id)
      setFullData(data)
    } catch (e) {
      console.error('Lỗi fetch chi tiết học viên', e)
    } finally {
      setLoading(false)
    }
  }

  if (!shallowStudent) return null

  const tabItems = [
    { key: 'personal', label: 'Thông tin cá nhân', children: <PersonalTab student={fullData} /> },
    { key: 'unit', label: 'Đơn vị đội', children: <UnitTab student={fullData} /> },
    { key: 'ktx', label: 'Chỗ ở KTX', children: <KTXTab student={fullData} /> },
    { key: 'discipline', label: 'Vi phạm - kỷ luật', children: <DisciplineTab student={fullData} /> },
    { key: 'items', label: 'Quản lý đồ dùng', children: <ItemsTab student={fullData} /> },
  ]

  return (
    <Modal
      open={!!shallowStudent}
      onCancel={onClose}
      footer={null}
      width={1000}
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Chi tiết học viên</div>
          <div style={{ fontSize: 14, color: '#3F4F2F', fontWeight: 600, fontStyle: 'italic' }}>
            {loading ? 'Đang tải...' : fullData?.ho_ten}
          </div>
        </div>
      }
      styles={{ body: { padding: 16, maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading || !fullData ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      )}
    </Modal>
  )
}

// ======================== TABS ========================

function PersonalTab({ student }: any) {
  if (!student) return null
  return (
    <Descriptions column={2} bordered size="small">
      <Descriptions.Item label="Họ tên">{student.ho_ten || '---'}</Descriptions.Item>
      <Descriptions.Item label="Mã Học Viên">
        <Text strong style={{ color: '#3F4F2F' }}>{student.ma_hoc_vien || '---'}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Ngày sinh">
        {student.ngay_sinh ? format(new Date(student.ngay_sinh), 'dd/MM/yyyy') : '---'}
      </Descriptions.Item>
      <Descriptions.Item label="Quê quán">{student.que_quan || '---'}</Descriptions.Item>
      <Descriptions.Item label="Dân tộc">{student.dan_toc || '---'}</Descriptions.Item>
      <Descriptions.Item label="Tình trạng hôn nhân">
        {student.tinh_trang_hon_nhan?.replace(/_/g, ' ') || '---'}
      </Descriptions.Item>
      <Descriptions.Item label="Số con">{student.so_con ?? '---'}</Descriptions.Item>
      <Descriptions.Item label="Ngày vào Đảng">
        {student.ngay_vao_dang ? format(new Date(student.ngay_vao_dang), 'dd/MM/yyyy') : 'Chưa vào Đảng'}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày vào Đoàn">
        {student.ngay_vao_doan ? format(new Date(student.ngay_vao_doan), 'dd/MM/yyyy') : 'Chưa vào Đoàn'}
      </Descriptions.Item>
    </Descriptions>
  )
}

function UnitTab({ student }: any) {
  if (!student) return null
  return (
    <Descriptions column={2} bordered size="small">
      <Descriptions.Item label="Tiểu đội / Trung đội">
        <Text strong>{student.donViDoi?.ten_don_vi || '---'}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Chủ nhiệm trung đội">
        {student.donViDoi?.chuNhiem?.hoTen || '---'}
      </Descriptions.Item>
      <Descriptions.Item label="Đơn vị cử đi học">
        {student.don_vi_tuyen || '---'}
      </Descriptions.Item>
      <Descriptions.Item label="Lớp học">{student.lopHoc?.ten_lop || '---'}</Descriptions.Item>
      <Descriptions.Item label="Khóa học">{student.lopHoc?.khoaHoc?.ten_khoa || '---'}</Descriptions.Item>
      <Descriptions.Item label="Chức vụ hiện tại">{student.chuc_vu || '---'}</Descriptions.Item>
    </Descriptions>
  )
}

function KTXTab({ student }: any) {
  if (!student) return null

  const currentStay = student.lichSuBoTriPhong?.find((x: any) => x.dang_o)

  const columns = [
    {
      title: 'Thời gian',
      align: 'center' as const,
      render: (_: any, h: any) =>
        `${h.tu_ngay ? format(new Date(h.tu_ngay), 'dd/MM/yy') : '?'} - ${h.den_ngay ? format(new Date(h.den_ngay), 'dd/MM/yy') : 'Nay'
        }`,
    },
    {
      title: 'Vị trí',
      align: 'center' as const,
      render: (_: any, h: any) => `Giường ${h.giuong?.ma_giuong}, Phòng ${h.phong?.ma_phong}`,
    },
    {
      title: 'Lý do / Hình thức',
      align: 'center' as const,
      render: (_: any, h: any) => h.hinh_thuc_xu_ly || h.ly_do || '---',
    },
  ]

  return (
    <>
      <Descriptions column={4} bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Mã giường">{currentStay?.giuong?.ma_giuong || '---'}</Descriptions.Item>
        <Descriptions.Item label="Phòng">{currentStay?.phong?.ma_phong || '---'}</Descriptions.Item>
        <Descriptions.Item label="Tầng">{currentStay?.phong?.tang?.so_tang || '---'}</Descriptions.Item>
        <Descriptions.Item label="Tòa nhà">{currentStay?.phong?.tang?.toaNha?.ten_toa || '---'}</Descriptions.Item>
      </Descriptions>

      <Table
        columns={columns}
        dataSource={student.lichSuBoTriPhong || []}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
      />
    </>
  )
}

function DisciplineTab({ student }: any) {
  if (!student?.viPham?.length) {
    return <Empty description="Học viên chưa có tiền sự vi phạm." />
  }

  return (
    <>
      {student.viPham.map((vp: any) => {
        const isDaXuLy = vp.trang_thai === 'DA_XU_LY'
        return (
          <div 
            key={vp.id} 
            style={{ 
              border: `1px solid ${isDaXuLy ? '#b7eb8f' : '#ffccc7'}`, 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 16,
              background: isDaXuLy ? '#f6ffed' : '#fff2f0'
            }}
          >
            <Tag color={isDaXuLy ? 'success' : 'error'} style={{ fontWeight: 600 }}>
              {isDaXuLy ? '✓ Đã xử lý' : '✗ Chưa xử lý'}
            </Tag>
            <div style={{ marginTop: 8 }}>
              <Text strong>{vp.noi_dung}</Text>
            </div>

            {vp.kyLuat?.map((kl: any) => (
              <div key={kl.id} style={{ marginTop: 8 }}>
                <Text>SỐ QĐ: {kl.so_quyet_dinh}</Text> —{' '}
                <Text type="secondary">
                  {kl.ngay_quyet_dinh ? format(new Date(kl.ngay_quyet_dinh), 'dd/MM/yyyy') : '---'}
                </Text>
              </div>
            ))}
          </div>
        )
      })}
    </>
  )
}

function ItemsTab({ student }: any) {
  const columns = [
    { title: 'Tên đồ dùng', dataIndex: 'ten_do_dung', align: 'center' as const, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Phân loại', dataIndex: 'loai_do_dung', align: 'center' as const, render: (v: string) => v?.replace(/_/g, ' ') },
    { title: 'Số lượng', dataIndex: 'so_luong', align: 'center' as const },
    { title: 'Mục đích', dataIndex: 'muc_dich', align: 'center' as const, render: (v: string) => v?.replace(/_/g, ' ') },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', align: 'center' as const },
  ]

  return <Table dataSource={student?.doDungHocVien || []} columns={columns} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }} />
}
