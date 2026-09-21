import { useEffect, useState } from 'react'
import { Card, Form, Select, InputNumber, Input, Button, message } from 'antd'
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons'
import { PageHeader, PageContainer } from '@/components'
import { taiSanPhongService, lichSuSuaChuaService } from '@/services/asset.service'
import { reportService } from '@/services/report.service'
import type { TaiSanPhong } from '@/types/asset'

const { TextArea } = Input

// LEGACY CODE NOTE:
// Bản đầy đủ tính năng trang tài sản được giữ tại file backup:
// src/pages/assets.tsx.backup
// Hiện tại chỉ ẩn (không xoá vĩnh viễn) để phục vụ yêu cầu Sprint B15.

export default function TaiSan() {
  const [form] = Form.useForm()
  const [assets, setAssets] = useState<TaiSanPhong[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadAssets = async () => {
    setLoadingAssets(true)
    try {
      const list = await taiSanPhongService.getAll()
      setAssets(Array.isArray(list) ? list : [])
    } catch {
      message.error('Không thể tải danh sách tài sản phòng')
    } finally {
      setLoadingAssets(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      await lichSuSuaChuaService.create({
        tai_san_phong_id: values.tai_san_phong_id,
        so_luong_hu: values.so_luong_hu,
        mo_ta_hu_hong: values.mo_ta_hu_hong,
        nguyen_nhan: values.nguyen_nhan,
        trang_thai: 'CHUA_SUA',
        ngay_phat_hien: new Date().toISOString().slice(0, 10),
      })
      message.success('Gửi báo hư thành công')
      form.resetFields()
    } catch {
      message.error('Gửi báo hư thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý tài sản - Cơ sở vật chất"
        subtitle="Nhập báo hư hỏng tài sản và xuất BC27"
        breadcrumbs={[{ label: 'Tài sản' }]}
        extra={(
          <Button icon={<DownloadOutlined />} onClick={() => reportService.bc27HuHongKtx()}>
            Xuất BC27
          </Button>
        )}
      />

      <Card title="Form nhập hư hỏng tài sản" style={{ maxWidth: 760 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Phòng / tài sản"
            name="tai_san_phong_id"
            rules={[{ required: true, message: 'Chọn phòng/tài sản' }]}
          >
            <Select
              loading={loadingAssets}
              showSearch
              optionFilterProp="label"
              placeholder="Chọn phòng tài sản"
              options={assets.map((item) => ({
                value: item.id,
                label: `${item.phong?.ma_phong ?? `Phòng #${item.phong_id}`} - Hư: ${item.so_luong_hu ?? 0}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Số lượng hư"
            name="so_luong_hu"
            initialValue={1}
            rules={[{ required: true, message: 'Nhập số lượng hư' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Mô tả hư hỏng" name="mo_ta_hu_hong">
            <TextArea rows={3} placeholder="Mô tả chi tiết hư hỏng" />
          </Form.Item>

          <Form.Item label="Nguyên nhân" name="nguyen_nhan">
            <TextArea rows={3} placeholder="Nguyên nhân (nếu có)" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<WarningOutlined />}
            loading={submitting}
          >
            Gửi báo hư
          </Button>
        </Form>
      </Card>
    </PageContainer>
  )
}
