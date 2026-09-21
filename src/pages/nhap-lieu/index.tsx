import { useState } from 'react'
import { Card, Button, Row, Col, Space, Typography, message } from 'antd'
import { UploadOutlined, DownloadOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'
import { PageContainer, PageHeader } from '@/components'
import { studentService } from '@/services/student.service'
import { roomService } from '@/services/room.service'
import ImportStudentModal from '@/pages/students/components/ImportStudentModal'
import ImportRoomModal from '@/pages/rooms/components/ImportRoomModal'
import { PROJECT_OPERATION_TITLE } from '@/constants/project'

const { Text } = Typography

export default function NhapLieuPage() {
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [roomModalOpen, setRoomModalOpen] = useState(false)

  const downloadStudentTemplate = async () => {
    const hide = message.loading('Đang tải template học viên...', 0)
    try {
      const data = await studentService.downloadTemplate()
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, 'hoc_vien_template.xlsx')
      message.success('Đã tải template học viên')
    } catch {
      message.error('Không thể tải template học viên')
    } finally {
      hide()
    }
  }

  const downloadRoomTemplate = async () => {
    const hide = message.loading('Đang tải template phòng...', 0)
    try {
      const data = await roomService.downloadTemplate()
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, 'phong_template.xlsx')
      message.success('Đã tải template phòng')
    } catch {
      message.error('Không thể tải template phòng')
    } finally {
      hide()
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nhập liệu"
        subtitle={`${PROJECT_OPERATION_TITLE} - Thực hiện nhập dữ liệu bằng file mẫu hoặc import Excel/CSV`}
        breadcrumbs={[{ label: 'Nhập liệu' }]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title={<Space><TeamOutlined />Nhập học viên</Space>}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Text type="secondary">Tải template chuẩn và import danh sách học viên vào hệ thống.</Text>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={downloadStudentTemplate}>Template</Button>
                <Button type="primary" icon={<UploadOutlined />} onClick={() => setStudentModalOpen(true)}>Import</Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><BankOutlined />Nhập phòng</Space>}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Text type="secondary">Tải template chuẩn và import dữ liệu phòng/kết cấu phòng ở.</Text>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={downloadRoomTemplate}>Template</Button>
                <Button type="primary" icon={<UploadOutlined />} onClick={() => setRoomModalOpen(true)}>Import</Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <ImportStudentModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        onSuccess={() => {}}
      />

      <ImportRoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSuccess={() => {}}
      />
    </PageContainer>
  )
}
