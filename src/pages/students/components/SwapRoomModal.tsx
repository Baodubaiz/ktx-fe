import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Select,
  Button,
  message,
  Typography,
  Divider,
  Space,
  Input,
  Tag,
  Row,
  Col,
} from 'antd'
import { SwapOutlined, HomeOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { lichSuBoTriPhongService } from '@/services/room-assignment.service'
import { systemTheme } from '@/theme/system-theme'

const { Text } = Typography
const { TextArea } = Input

interface Props {
  open: boolean
  onClose: () => void
  sourceRoom: { id: number; name: string; count: number } | null
  onSuccess: () => void
}

export default function SwapRoomModal({
  open,
  onClose,
  sourceRoom,
  onSuccess
}: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Data states
  const [allBuildings, setAllBuildings] = useState<any[]>([])
  const [facilities, setFacilities] = useState<string[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])

  // Loading states
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingFloors, setLoadingFloors] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)

  // Load initial data (Buildings & Facilities)
  useEffect(() => {
    if (open) {
      setLoadingInitial(true)
      buildService.getAll()
        .then((data) => {
          setAllBuildings(data)
          const uniqueCoSo = Array.from(new Set(data.map((b: any) => b.co_so).filter(Boolean))) as string[]
          setFacilities(uniqueCoSo)
        })
        .catch(() => message.error('Không thể tải danh sách cơ sở'))
        .finally(() => setLoadingInitial(false))
    }
  }, [open])

  const handleFacilityChange = (facility: string) => {
    form.setFieldsValue({ toa_nha_id: undefined, floor_id: undefined, phong_b_id: undefined })
    setBuildings([])
    setFloors([])
    setRooms([])

    if (!facility) return
    const filtered = allBuildings.filter((b: any) => b.co_so === facility)
    setBuildings(filtered)
  }

  const handleBuildingChange = async (buildingId: number) => {
    form.setFieldsValue({ floor_id: undefined, phong_b_id: undefined })
    setFloors([])
    setRooms([])

    if (!buildingId) return
    setLoadingFloors(true)
    try {
      const data = await floorService.getByBuild(buildingId)
      setFloors(Array.isArray(data) ? data : [])
    } catch {
      message.error('Không thể tải danh sách tầng')
    } finally {
      setLoadingFloors(false)
    }
  }

  const handleFloorChange = async (floorId: number) => {
    form.setFieldsValue({ phong_b_id: undefined })
    setRooms([])

    if (!floorId) return
    setLoadingRooms(true)
    try {
      const all = await roomService.getAll()
      const filtered = Array.isArray(all) ? all.filter((r: any) => r.tang_id === floorId) : []
      // Prevent choosing same room
      setRooms(sourceRoom ? filtered.filter(r => r.id !== sourceRoom.id) : filtered)
    } catch {
      message.error('Không thể tải danh sách phòng')
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleSubmit = async () => {
    if (!sourceRoom) return
    try {
      const values = await form.validateFields()
      setLoading(true)

      const targetRoomId = values.phong_b_id
      const targetRoom = rooms.find(r => r.id === targetRoomId)

      await lichSuBoTriPhongService.swapRooms({
        phong_a_id: sourceRoom.id,
        phong_b_id: targetRoomId,
        ly_do: values.ly_do,
      })

      message.success(`Đã hoán đổi học viên giữa phòng ${sourceRoom.name} và ${targetRoom?.ma_phong || 'mới'} thành công!`)
      handleCancel()
      onSuccess()
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Hoán đổi phòng thất bại'
      message.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setBuildings([])
    setFloors([])
    setRooms([])
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <Space>
          <SwapOutlined style={{ color: systemTheme.brand.primary }} />
          <span>Hoán đổi học viên giữa 2 phòng</span>
        </Space>
      }
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SwapOutlined />}
          loading={loading}
          onClick={handleSubmit}
          disabled={loadingInitial}
        >
          Xác nhận hoán đổi
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 24, 
          padding: '20px 0',
          background: systemTheme.background.subtle,
          borderRadius: 12,
          border: `1px solid ${systemTheme.border.subtle}`
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>PHÒNG NGUỒN</Text>
            <div style={{ margin: '8px 0' }}>
              <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>{sourceRoom?.name}</Tag>
            </div>
            <Text strong>{sourceRoom?.count} học viên</Text>
          </div>
          
          <ArrowRightOutlined style={{ fontSize: 24, color: systemTheme.text.muted }} />
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>PHÒNG ĐÍCH</Text>
            <div style={{ margin: '8px 0' }}>
              {form.getFieldValue('phong_b_id') ? (
                <Tag color="green" style={{ fontSize: 16, padding: '4px 12px' }}>
                  {rooms.find(r => r.id === form.getFieldValue('phong_b_id'))?.ma_phong}
                </Tag>
              ) : (
                <Tag style={{ fontSize: 16, padding: '4px 12px', borderStyle: 'dashed' }}>Chưa chọn</Tag>
              )}
            </div>
            <Text strong>
              {form.getFieldValue('phong_b_id') 
                ? `${rooms.find(r => r.id === form.getFieldValue('phong_b_id'))?.lichSuBoTriPhong?.length ?? 0} học viên`
                : '--'}
            </Text>
          </div>
        </div>
      </div>

      <div
        style={{
          background: systemTheme.brand.primarySoft,
          border: `1px solid ${systemTheme.brand.primary}`,
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
        }}
      >
        <Text style={{ color: systemTheme.brand.primary, fontWeight: 600 }}>
          <HomeOutlined /> Lưu ý:
        </Text>
        <br />
        <Text style={{ fontSize: 13 }}>
          Toàn bộ học viên của 2 phòng sẽ đổi chỗ cho nhau. 
          Vui lòng đảm bảo cả 2 phòng đều có đủ giường cho số lượng học viên mới.
        </Text>
      </div>

      <Divider style={{ margin: '0 0 16px' }}>Chọn phòng đích</Divider>

      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Cơ sở"
              name="co_so"
              rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
            >
              <Select
                placeholder="Chọn cơ sở..."
                loading={loadingInitial}
                onChange={handleFacilityChange}
                options={facilities.map((f) => ({ value: f, label: f }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tòa nhà"
              name="toa_nha_id"
              rules={[{ required: true, message: 'Vui lòng chọn tòa nhà' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Chọn tòa nhà..."
                optionFilterProp="label"
                disabled={buildings.length === 0}
                onChange={handleBuildingChange}
                options={buildings.map((b: any) => ({
                  value: b.id,
                  label: b.ten_toa ?? b.ma_toa ?? `Tòa nhà #${b.id}`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tầng"
              name="floor_id"
              rules={[{ required: true, message: 'Vui lòng chọn tầng' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Chọn tầng..."
                optionFilterProp="label"
                disabled={floors.length === 0}
                loading={loadingFloors}
                onChange={handleFloorChange}
                options={floors.map((f: any) => ({
                  value: f.id,
                  label: `Tầng ${f.so_tang ?? f.id}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phòng đích"
              name="phong_b_id"
              rules={[{ required: true, message: 'Vui lòng chọn phòng đích' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Chọn phòng..."
                optionFilterProp="label"
                disabled={rooms.length === 0}
                loading={loadingRooms}
                onChange={() => {
                  // Force re-render to update the summary box
                  setBuildings([...buildings])
                }}
                options={rooms.map((r: any) => ({
                  value: r.id,
                  label: r.ma_phong,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Lý do hoán đổi" name="ly_do">
          <TextArea rows={3} placeholder="Nhập lý do hoán đổi (tùy chọn)..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
