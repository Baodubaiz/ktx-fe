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
} from 'antd'
import { SwapOutlined, HomeOutlined } from '@ant-design/icons'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { lichSuBoTriPhongService } from '@/services/room-assignment.service'

const { Text } = Typography
const { TextArea } = Input

interface Props {
  open: boolean
  onClose: () => void
  studentIds: number[]
  sourceRoomId?: number | null
  filters?: {
    lop_hoc_id?: number
    khoa_hoc_id?: number
  }
  onSuccess: () => void
}

export default function BulkTransferRoomModal({
  open,
  onClose,
  studentIds,
  sourceRoomId,
  filters,
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
    form.setFieldsValue({ toa_nha_id: undefined, floor_id: undefined, phong_dich_id: undefined })
    setBuildings([])
    setFloors([])
    setRooms([])

    if (!facility) return
    const filtered = allBuildings.filter((b: any) => b.co_so === facility)
    setBuildings(filtered)
  }

  const handleBuildingChange = async (buildingId: number) => {
    form.setFieldsValue({ floor_id: undefined, phong_dich_id: undefined })
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
    form.setFieldsValue({ phong_dich_id: undefined })
    setRooms([])

    if (!floorId) return
    setLoadingRooms(true)
    try {
      // Get all rooms and filter by floor locally since there is no specific getByFloor service method listed in requirements
      const all = await roomService.getAll()
      const filtered = Array.isArray(all) ? all.filter((r: any) => r.tang_id === floorId) : []
      setRooms(sourceRoomId ? filtered.filter(r => r.id !== sourceRoomId) : filtered) // Prevent choosing same room
    } catch {
      message.error('Không thể tải danh sách phòng')
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await lichSuBoTriPhongService.chuyenPhongHangLoat({
        phong_nguon_id: sourceRoomId || undefined,
        phong_dich_id: values.phong_dich_id,
        hoc_vien_ids: studentIds,
        lop_hoc_id: filters?.lop_hoc_id,
        khoa_hoc_id: filters?.khoa_hoc_id,
        ly_do: values.ly_do,
      })

      message.success(`Đã chuyển ${studentIds.length} học viên thành công!`)
      handleCancel()
      onSuccess()
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Chuyển phòng thất bại'
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
          <SwapOutlined style={{ color: '#faad14' }} />
          <span>Chuyển phòng cho {studentIds.length} học viên</span>
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
          icon={<SwapOutlined />}
          loading={loading}
          onClick={handleSubmit}
          disabled={loadingInitial}
        >
          Xác nhận chuyển
        </Button>,
      ]}
    >
      <div
        style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
        }}
      >
        <Text type="warning" strong>
          <HomeOutlined /> Lưu ý:
        </Text>
        <br />
        <Text style={{ fontSize: 13 }}>
          Toàn bộ {studentIds.length} học viên đã chọn sẽ được chuyển sang phòng mới.
          {sourceRoomId ? ' Những học viên này sẽ được đóng lịch sử phòng cũ.' : ' Học viên chưa có phòng sẽ được gán vào phòng mới.'}
          Vui lòng chọn phòng đích có đủ giường trống.
        </Text>
      </div>

      <Divider style={{ margin: '0 0 16px' }} />

      <Form form={form} layout="vertical">
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
          label="Phòng đích"
          name="phong_dich_id"
          rules={[{ required: true, message: 'Vui lòng chọn phòng đích' }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Chọn phòng..."
            optionFilterProp="label"
            disabled={rooms.length === 0}
            loading={loadingRooms}
            options={rooms.map((r: any) => ({
              value: r.id,
              label: r.ma_phong,
            }))}
          />
        </Form.Item>

        <Form.Item label="Lý do chuyển phòng" name="ly_do">
          <TextArea rows={3} placeholder="Nhập lý do chuyển phòng (tùy chọn)..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
