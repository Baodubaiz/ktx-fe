import { useState } from 'react'
import { Modal, Upload, Button, Alert, Typography, Space, message, List } from 'antd'
import { UploadOutlined, InboxOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { saveAs } from 'file-saver'
import { studentService } from '@/services/student.service'
import { getApiError } from '@/lib/utils'

const { Dragger } = Upload
const { Text } = Typography

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportStudentModal({ isOpen, onClose, onSuccess }: Props) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file để tải lên')
      return
    }

    const file = (fileList[0].originFileObj || fileList[0]) as File

    setUploading(true)
    try {
      const res = await studentService.importExcel(file)
      const stats = res?.stats
      if (stats?.error > 0) {
        Modal.warning({
          title: 'Import hoàn tất nhưng có dòng lỗi',
          width: 600,
          content: (
            <div style={{ marginTop: 10 }}>
              <p>Thành công: <b style={{ color: 'green' }}>{stats.success}</b></p>
              <p>Thất bại: <b style={{ color: 'red' }}>{stats.error}</b></p>
              {stats.details?.length > 0 && (
                <div style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 10, borderRadius: 4, border: '1px solid #d9d9d9' }}>
                  {stats.details.map((err: string, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: '#f5222d', marginBottom: 4 }}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          ),
        })
      } else {
        message.success(res?.message || 'Nhập dữ liệu thành công!')
      }
      setFileList([])
      onSuccess()
      onClose()
    } catch (error: any) {
      message.error(getApiError(error, 'Lỗi khi nhập dữ liệu'))
    } finally {
      setUploading(false)
    }
  }

  const uploadProps: UploadProps = {
    fileList,
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      const isAccepted = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        || file.type === 'application/vnd.ms-excel'
        || file.type === 'text/csv'
        || file.name.endsWith('.csv')

      if (!isAccepted) {
        message.error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)')
        return false
      }

      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('File phải nhỏ hơn 5MB')
        return false
      }

      setFileList([file])
      return false
    },
    accept: '.xlsx,.xls,.csv',
    maxCount: 1,
  }

  const handleDownloadTemplate = async () => {
    const hide = message.loading('Đang tải file mẫu...', 0)
    try {
      const data = await studentService.downloadTemplate()
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, 'hoc_vien_template.xlsx')
    } catch {
      message.error('Tải file mẫu thất bại')
    } finally {
      hide()
    }
  }

  return (
    <Modal
      title="Nhập dữ liệu học viên từ Excel"
      open={isOpen}
      onCancel={() => {
        onClose()
        setFileList([])
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          onClose()
          setFileList([])
        }} disabled={uploading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0 || uploading}
          icon={<UploadOutlined />}
        >
          Tải lên và nhập
        </Button>,
      ]}
      width={650}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Alert
          message="Hướng dẫn nhập dữ liệu"
          description={
            <List
              size="small"
              dataSource={[
                'Tải file mẫu Excel và điền thông tin học viên theo đúng cấu trúc',
                'Mã học viên không được trùng lặp với dữ liệu hiện có',
                'Hệ thống sẽ ghi nhận lịch sử vào bảng Phiên nhập dữ liệu',
                'File phải có định dạng .xlsx, .xls hoặc .csv',
              ]}
              renderItem={item => (
                <List.Item style={{ padding: '4px 0', border: 'none' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <Text style={{ fontSize: 13 }}>{item}</Text>
                </List.Item>
              )}
            />
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            type="dashed"
          >
            Tải xuống file mẫu
          </Button>
        </div>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">
            Nhấp hoặc kéo file Excel vào đây để tải lên
          </p>
          <p className="ant-upload-hint">
            Hỗ trợ file .xlsx, .xls, .csv (tối đa 5MB)
          </p>
        </Dragger>

        {fileList.length > 0 && (
          <Alert
            message={`Đã chọn file: ${fileList[0].name}`}
            type="success"
            showIcon
          />
        )}
      </Space>
    </Modal>
  )
}