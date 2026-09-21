import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Select,
  Button,
  message,
  Typography,
  Divider,
  Tag,
  Space,
} from 'antd'
import { HomeOutlined, UserOutlined } from '@ant-design/icons'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { lichSuBoTriPhongService } from '@/services/room-assignment.service'
import { api } from '@/lib/axios'

const { Text } = Typography

interface Props {
  open: boolean
  onClose: () => void
  student: any
  onSuccess: () => void
}

export default function AssignRoomModal({ open, onClose, student, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const [buildings, setBuildings] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [beds, setBeds] = useState<any[]>([])

  const [loadingFloors, setLoadingFloors] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingBeds, setLoadingBeds] = useState(false)

  // Load buildings on mount
  useEffect(() => {
    if (open) {
      buildService.getAll().then(setBuildings).catch(() => {})
    }
  }, [open])

  const handleBuildingChange = async (buildingId: number) => {
    form.setFieldsValue({ floor_id: undefined, phong_id: undefined, giuong_id: undefined })
    setFloors([])
    setRooms([])
    setBeds([])

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
    form.setFieldsValue({ phong_id: undefined, giuong_id: undefined })
    setRooms([])
    setBeds([])

    if (!floorId) return
    setLoadingRooms(true)
    try {
      const all = await roomService.getAll()
      const filtered = Array.isArray(all) ? all.filter((r: any) => r.tang_id === floorId) : []
      setRooms(filtered)
    } catch {
      message.error('Không thể tải danh sách phòng')
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleRoomChange = async (roomId: number) => {
    form.setFieldsValue({ giuong_id: undefined })
    setBeds([])

    if (!roomId) return
    setLoadingBeds(true)
    try {
      // Load all beds for this room, then filter out occupied ones
      const res = await api.get('/giuong')
      const allBeds = res.data?.data ?? res.data ?? []
      const roomBeds = allBeds.filter((b: any) => b.phong_id === roomId)

      // Load occupied bed IDs
      const assignments = await lichSuBoTriPhongService.getAll()
      const occupiedBedIds = new Set(
        (Array.isArray(assignments) ? assignments : [])
          .filter((a: any) => a.dang_o === true)
          .map((a: any) => a.giuong_id)
      )

      const available = roomBeds.filter((b: any) => !occupiedBedIds.has(b.id))
      setBeds(available)
    } catch {
      message.error('Không thể tải danh sách giường trống')
    } finally {
      setLoadingBeds(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await lichSuBoTriPhongService.ganHocVien({
        hoc_vien_id: student.id,
        giuong_id: values.giuong_id,
        phong_id: values.phong_id,
        toa_nha_id: values.building_id,
        dang_o: true,
      })

      message.success(`Đã gán phòng cho học viên ${student.ho_ten} thành công!`)
      form.resetFields()
      setFloors([])
      setRooms([])
      setBeds([])
      onSuccess()
      onClose()
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Gán phòng thất bại'
      message.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setFloors([])
    setRooms([])
    setBeds([])
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <Space>
          <HomeOutlined style={{ color: '#1890ff' }} />
          <span>Gán phòng ở</span>
        </Space>
      }
      width={520}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<HomeOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Xác nhận gán phòng
        </Button>,
      ]}
    >
      {/* Student info */}
      <div
        style={{
          background: '#f0f5ff',
          border: '1px solid #d6e4ff',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
        }}
      >
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ color: '#1d4ed8' }}>
            {student?.ho_ten || 'N/A'}
          </Text>
          {student?.ma_hoc_vien && (
            <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {student.ma_hoc_vien}
            </Tag>
          )}
        </Space>
      </div>

      <Divider style={{ margin: '0 0 16px' }} />

      <Form form={form} layout="vertical">
        <Form.Item
          label="Tòa nhà"
          name="building_id"
          rules={[{ required: true, message: 'Vui lòng chọn tòa nhà' }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Chọn tòa nhà..."
            optionFilterProp="label"
            onChange={handleBuildingChange}
            options={buildings.map((b: any) => ({
              value: b.id,
              label: b.ten_toa ?? b.ma_toa ?? `Tòa nhà #${b.id}`,
            }))}
          />
        </Form.Item>

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

        <Form.Item
          label="Phòng"
          name="phong_id"
          rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Chọn phòng..."
            optionFilterProp="label"
            disabled={rooms.length === 0}
            loading={loadingRooms}
            onChange={handleRoomChange}
            options={rooms.map((r: any) => ({
              value: r.id,
              label: r.ma_phong,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Giường trống"
          name="giuong_id"
          rules={[{ required: true, message: 'Vui lòng chọn giường' }]}
        >
          <Select
            showSearch
            allowClear
            placeholder={loadingBeds ? 'Đang tải...' : beds.length === 0 ? 'Không có giường trống' : 'Chọn giường...'}
            optionFilterProp="label"
            disabled={beds.length === 0 && !loadingBeds}
            loading={loadingBeds}
            options={beds.map((b: any) => ({
              value: b.id,
              label: b.ma_giuong ?? `Giường #${b.id}`,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
