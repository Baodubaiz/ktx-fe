import { Modal, Form, Select, DatePicker, message } from 'antd'
import { useEffect, useState } from 'react'
import { phanCongVeSinhService } from '@/services/cleaning-assignment.service'
import { api } from '@/lib/axios'
import { getApiError } from '@/lib/utils'
import type { CreatePhanCongVeSinhDto } from '@/types/cleaning-document'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

export default function AddAssignmentModal({ isOpen, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [viTriList, setViTriList] = useState<any[]>([])
  const [donViDoiList, setDonViDoiList] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      form.resetFields()
      fetchLookups()
    }
  }, [isOpen])

  const fetchLookups = async () => {
    try {
      const [viTriRes, donViRes] = await Promise.all([
        api.get('/vi-tri'),
        api.get('/don-vi-doi'),
      ])
      setViTriList(Array.isArray(unwrap(viTriRes)) ? unwrap(viTriRes) : [])
      setDonViDoiList(Array.isArray(unwrap(donViRes)) ? unwrap(donViRes) : [])
    } catch (err) {
      console.error('Error fetching lookups:', err)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const dto: CreatePhanCongVeSinhDto = {
        vi_tri_id: values.vi_tri_id,
        trung_doi_phu_trach: values.trung_doi_phu_trach,
        thoi_gian: values.thoi_gian ? values.thoi_gian.toISOString() : undefined,
      }

      await phanCongVeSinhService.create(dto)
      message.success('Thêm phân công thành công')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err?.errorFields) return // validation error
      message.error(getApiError(err, 'Thêm phân công thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Thêm phân công vệ sinh mới"
      open={isOpen}
      onCancel={() => {
        onClose()
        form.resetFields()
      }}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okButtonProps={{ disabled: submitting }}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
      width={600}
    >
      <Form 
        form={form} 
        layout="vertical" 
        style={{ marginTop: 16 }}
      >
        <Form.Item 
          name="vi_tri_id" 
          label="Vị trí" 
          rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
        >
          <Select
            placeholder="Chọn vị trí cần vệ sinh"
            showSearch
            optionFilterProp="label"
            size="large"
            options={viTriList
              .reduce((acc: any[], v: any) => {
                const label = `${v.ten_vi_tri ?? `Vị trí ${v.id}`} - ${v.toaNha?.ten_toa ?? ''}`
                if (!acc.find((o: any) => o.label === label)) {
                  acc.push({ value: v.id, label })
                }
                return acc
              }, [])}
          />
        </Form.Item>

        <Form.Item 
          name="trung_doi_phu_trach" 
          label="Trung đội phụ trách"
          rules={[{ required: true, message: 'Vui lòng chọn trung đội' }]}
        >
          <Select
            placeholder="Chọn trung đội"
            showSearch
            optionFilterProp="label"
            size="large"
            options={donViDoiList.map((d: any) => ({
              value: d.id,
              label: d.ten_don_vi ?? d.ma_don_vi ?? `Đơn vị ${d.id}`,
            }))}
          />
        </Form.Item>

        <Form.Item 
          name="thoi_gian" 
          label="Thời gian"
          tooltip="Thời gian bắt đầu phân công"
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY"
            size="large"
            placeholder="Chọn ngày"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
