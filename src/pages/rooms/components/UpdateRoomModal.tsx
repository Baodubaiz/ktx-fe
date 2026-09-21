import { Modal, Form, Input, Select, Row, Col, message, Button, Table, Space, Popconfirm, Divider, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useBuild } from '@/hooks/useBuild'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { bedService } from '@/services/beds.service'
import type { Room, UpdateRoomDto } from '@/types/room'
import { systemTheme } from '@/theme/system-theme'

interface BedDraft {
  _key: string          // unique key for table rendering
  id?: number           // undefined = newly added, not yet in DB
  ma_giuong: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  room: Room | null
  onSuccess: () => void
}

let _keyCounter = 0
const nextKey = () => `bed-${++_keyCounter}`

export default function UpdateRoomModal({ isOpen, onClose, room, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [submitting, setSubmitting] = useState(false)
  const { builds, getBuilds } = useBuild()
  const [formFloors, setFormFloors] = useState<any[]>([])

  // ─── Bed local state ───────────────────────────────────────────────
  const [beds, setBeds] = useState<BedDraft[]>([])
  const [deletedBedIds, setDeletedBedIds] = useState<number[]>([])

  // inline edit
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // add bed mini-modal
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addValue, setAddValue] = useState('')

  // ─── Init on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && room) {
      getBuilds()
      const toaId = room.tang?.toa_nha_id?.toString() ?? room.tang?.toaNha?.id?.toString()

      form.setFieldsValue({
        ma_phong: room.ma_phong,
        toa_nha_id: toaId ? Number(toaId) : undefined,
        tang_id: room.tang_id ?? room.tang?.id,
        loai_phong: room.loai_phong,
        gioi_tinh_phong: room.gioi_tinh_phong,
      })

      if (toaId) {
        floorService.getByBuild(Number(toaId))
          .then((data) => setFormFloors(data))
          .catch(() => setFormFloors([]))
      }

      // Use beds from room.giuong already returned by getAll
      setBeds((room.giuong ?? []).map(g => ({ _key: nextKey(), id: g.id, ma_giuong: g.ma_giuong })))
      setDeletedBedIds([])
      setEditingKey(null)
    }
  }, [isOpen, room])

  // ─── Bed operations (local state only) ────────────────────────────
  const handleAddBed = () => {
    const trimmed = addValue.trim()
    if (!trimmed) { messageApi.warning('Vui lòng nhập mã giường'); return }
    if (beds.some(b => b.ma_giuong === trimmed)) { messageApi.warning('Mã giường đã tồn tại'); return }
    setBeds(prev => [...prev, { _key: nextKey(), ma_giuong: trimmed }])
    setAddValue('')
    setIsAddOpen(false)
  }

  const handleDeleteBed = (draft: BedDraft) => {
    if (draft.id) setDeletedBedIds(prev => [...prev, draft.id!])
    setBeds(prev => prev.filter(b => b._key !== draft._key))
  }

  const handleStartEdit = (draft: BedDraft) => {
    setEditingKey(draft._key)
    setEditValue(draft.ma_giuong)
  }

  const handleConfirmEdit = (draft: BedDraft) => {
    const trimmed = editValue.trim()
    if (!trimmed) { setEditingKey(null); return }
    if (beds.some(b => b._key !== draft._key && b.ma_giuong === trimmed)) {
      messageApi.warning('Mã giường đã tồn tại'); return
    }
    setBeds(prev => prev.map(b => b._key === draft._key ? { ...b, ma_giuong: trimmed } : b))
    setEditingKey(null)
  }

  // ─── Save – call all APIs once ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!room) return
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      // 1. Update room info
      const payload: UpdateRoomDto = {
        ma_phong: values.ma_phong,
        tang_id: values.tang_id,
        loai_phong: values.loai_phong ?? undefined,
        gioi_tinh_phong: values.gioi_tinh_phong ?? undefined,
      }
      await roomService.update(room.id, payload)

      // 2. Delete removed beds
      if (deletedBedIds.length > 0) {
        for (const id of deletedBedIds) {
          try {
            await bedService.delete(id)
          } catch (err) {
            console.error(`Lỗi xóa giường ${id}:`, err)
          }
        }
      }

      // 3. Create new beds (no id)
      const newBeds = beds.filter(b => !b.id)
      for (const b of newBeds) {
        try {
          await bedService.create({ ma_giuong: b.ma_giuong, phong_id: room.id })
        } catch (err) {
          console.error(`Lỗi tạo giường ${b.ma_giuong}:`, err)
        }
      }

      // 4. Update renamed beds (have id but ma_giuong changed)
      const originalMap = new Map((room.giuong ?? []).map(g => [g.id, g.ma_giuong]))
      const updatedBeds = beds.filter(b => b.id && originalMap.get(b.id) !== b.ma_giuong)
      for (const b of updatedBeds) {
        try {
          await bedService.update(b.id!, { ma_giuong: b.ma_giuong })
        } catch (err: any) {
          console.error(`Lỗi cập nhật giường ${b.ma_giuong}:`, err)
          // Nếu lỗi do trùng mã, ta bỏ qua hoặc thông báo
        }
      }

      messageApi.success('Cập nhật phòng thành công')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err?.errorFields) return
      messageApi.error(err?.response?.data?.message || 'Cập nhật phòng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Table columns ─────────────────────────────────────────────────
  const columns = [
    {
      title: '#',
      key: 'stt',
      width: 48,
      align: 'center' as const,
      render: (_: any, __: any, i: number) => (
        <span style={{ color: systemTheme.text.secondary, fontSize: 12 }}>{i + 1}</span>
      ),
    },
    {
      title: 'Mã giường',
      dataIndex: 'ma_giuong',
      key: 'ma_giuong',
      render: (_: string, record: BedDraft) =>
        editingKey === record._key ? (
          <Input
            autoFocus
            size="small"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onPressEnter={() => handleConfirmEdit(record)}
            style={{ width: '100%' }}
          />
        ) : (
          <span style={{ fontWeight: 600, fontFamily: 'monospace', color: systemTheme.brand.primary }}>
            {record.ma_giuong}
            {!record.id && (
              <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>Mới</Tag>
            )}
          </span>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center' as const,
      width: 100,
      render: (_: any, record: BedDraft) =>
        editingKey === record._key ? (
          <Space size={4}>
            <Button
              size="small" type="text"
              icon={<CheckOutlined />}
              style={{ color: systemTheme.status.success }}
              onClick={() => handleConfirmEdit(record)}
            />
            <Button
              size="small" type="text"
              icon={<CloseOutlined />}
              onClick={() => setEditingKey(null)}
            />
          </Space>
        ) : (
          <Space size={4}>
            <Button
              size="small" type="text"
              icon={<EditOutlined />}
              style={{ color: systemTheme.status.success }}
              onClick={() => handleStartEdit(record)}
            />
            <Popconfirm
              title="Xóa giường này?"
              description="Giường sẽ được xóa khi bạn nhấn Lưu."
              okText="Xóa" cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteBed(record)}
            >
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
    },
  ]

  return (
    <>
      {contextHolder}
      {/* ─── Main modal ─────────────────────────────────────────────── */}
      <Modal
        title={`Chỉnh sửa phòng: ${room?.ma_phong}`}
        open={isOpen}
        onCancel={() => { onClose(); form.resetFields() }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okButtonProps={{ disabled: submitting }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        width={680}
      >
        {/* Room info - mã phòng, tòa nhà, tầng disabled */}
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="ma_phong" label="Mã phòng" rules={[{ required: true }]}>
            <Input disabled size="large" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="toa_nha_id" label="Tòa nhà" rules={[{ required: true }]}>
                <Select disabled size="large" onChange={() => {}}>
                  {builds.map(b => (
                    <Select.Option key={b.id} value={b.id}>{b.ten_toa ?? b.ma_toa}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tang_id" label="Tầng" rules={[{ required: true }]}>
                <Select disabled size="large">
                  {formFloors.map((f: any) => (
                    <Select.Option key={f.id} value={f.id}>Tầng {f.so_tang}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="loai_phong" label="Loại phòng">
                <Select placeholder="Chọn loại phòng" allowClear size="large">
                  <Select.Option value="HOC_VIEN">Học Viên</Select.Option>
                  <Select.Option value="CAN_BO">Cán Bộ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gioi_tinh_phong" label="Giới tính">
                <Select placeholder="Chọn giới tính" allowClear size="large">
                  <Select.Option value="NAM">Nam</Select.Option>
                  <Select.Option value="NU">Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Bed section header */}
        <Divider plain style={{ marginTop: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            Danh sách giường&nbsp;
            <Tag color={beds.length > 0 ? 'green' : 'default'}>{beds.length} giường</Tag>
          </span>
        </Divider>

        {/* Add button - icon only, top-right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="small"
            title="Thêm giường"
            style={{ background: systemTheme.brand.primary, border: 'none' }}
            onClick={() => { setAddValue(''); setIsAddOpen(true) }}
          />
        </div>

        <Table
          dataSource={beds}
          rowKey="_key"
          pagination={false}
          size="small"
          locale={{ emptyText: 'Chưa có giường nào trong phòng này' }}
          style={{ marginBottom: 4 }}
          columns={columns}
        />

        <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginTop: 6 }}>
          * Các thay đổi giường sẽ được lưu khi bạn nhấn <strong>Lưu</strong>
        </div>
      </Modal>

      {/* ─── Add bed mini-modal ─────────────────────────────────────── */}
      <Modal
        title="Thêm giường mới"
        open={isAddOpen}
        onCancel={() => { setIsAddOpen(false); setAddValue('') }}
        onOk={handleAddBed}
        okText="Thêm"
        cancelText="Hủy"
        width={360}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <Input
            autoFocus
            size="large"
            placeholder="Mã giường (VD: G01, G02...)"
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onPressEnter={handleAddBed}
          />
        </div>
      </Modal>
    </>
  )
}
