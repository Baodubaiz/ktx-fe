import { useEffect, useMemo, useState } from 'react'
import {
  Tabs,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  message,
  DatePicker,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { DownloadOutlined, PlusOutlined, FilePdfOutlined, InboxOutlined, EyeOutlined } from '@ant-design/icons'
import { PageHeader, PageContainer, ReportExportModal } from '@/components'
import type { ReportGroup, ReportModalFilters } from '@/components'
import { soDoService } from '@/services/diagram.service'
import { reportService } from '@/services/report.service'
import type { SoDo, CreateSoDoDto } from '@/types/cleaning-document'
import { api } from '@/lib/axios'

type BranchKey = 'van-ban' | 'so-do' | 'phan-cong-ve-sinh' | 'bao-cao'
type DocRecord = SoDo & { id: number | string; nguon?: string }

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN')
}

const normalize = (value?: string | null) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const detectBranch = (item: DocRecord): BranchKey => {
  const signature = `${normalize(item.loai)} ${normalize(item.ten_van_ban)}`

  if (
    signature.includes('pcvs')
    || signature.includes('phan cong ve sinh')
    || signature.includes('ve sinh')
    || signature.includes('bc4')
    || signature.includes('bc5')
  ) {
    return 'phan-cong-ve-sinh'
  }

  if (
    signature.includes('so do')
    || signature.includes('camera')
    || signature.includes('pccc')
    || signature.includes('bc6')
    || signature.includes('bc7')
  ) {
    return 'so-do'
  }

  return 'van-ban'
}

function DocumentListTab({
  branch,
  data,
  loading,
  onOpenFile,
  onDownloadFile,
}: {
  branch: BranchKey
  data: DocRecord[]
  loading: boolean
  onOpenFile: (url: string, docName?: string) => Promise<void>
  onDownloadFile: (url: string, docName?: string) => Promise<void>
}) {
  const [filterLoai, setFilterLoai] = useState<string | undefined>()
  const [filterToaNha, setFilterToaNha] = useState<number | undefined>()
  const [searchKeyword, setSearchKeyword] = useState('')

  const scopedData = useMemo(() => data.filter((item) => detectBranch(item) === branch), [data, branch])

  const loaiOptions = useMemo(() => {
    const list = new Set<string>()
    scopedData.forEach((item) => {
      if (item.loai?.trim()) list.add(item.loai.trim())
    })
    return Array.from(list).sort((a, b) => a.localeCompare(b, 'vi'))
  }, [scopedData])

  const toaNhaOptions = useMemo(() => {
    const map = new Map<number, string>()
    scopedData.forEach((item) => {
      if (item.toa_nha_id && item.toaNha) {
        map.set(item.toa_nha_id, item.toaNha.ten_toa ?? item.toaNha.ma_toa)
      }
    })
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
  }, [scopedData])

  const filtered = useMemo(() => {
    return scopedData.filter((item) => {
      const okLoai = !filterLoai || item.loai === filterLoai
      const okToa = !filterToaNha || item.toa_nha_id === filterToaNha
      const keyword = searchKeyword.trim().toLowerCase()
      const okSearch = !keyword
        || (item.ten_van_ban ?? '').toLowerCase().includes(keyword)
        || (item.loai ?? '').toLowerCase().includes(keyword)
      return okLoai && okToa && okSearch
    })
  }, [scopedData, filterLoai, filterToaNha, searchKeyword])

  const columns: ColumnsType<DocRecord> = [
    { title: 'STT', width: 60, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Loại', dataIndex: 'loai', align: 'center', ellipsis: true },
    {
      title: 'Tên tài liệu',
      dataIndex: 'ten_van_ban',
      ellipsis: true,
    },
    {
      title: 'Ngày cập nhật',
      align: 'center',
      width: 140,
      render: (_, r) => formatDate(r.ngay_cap_nhat),
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: 180,
      render: (_, r) => r.file_path ? (
        <Space size={8}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => onOpenFile(r.file_path!, r.ten_van_ban ?? undefined)}>Mở</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => onDownloadFile(r.file_path!, r.ten_van_ban ?? undefined)}>Tải về</Button>
        </Space>
      ) : <span style={{ color: '#999' }}>Chưa có file</span>,
    },
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Space wrap>
        <Input
          allowClear
          placeholder="Tìm theo tên tài liệu / loại"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 260 }}
        />
        <Select
          allowClear
          placeholder="Lọc theo loại"
          value={filterLoai}
          onChange={setFilterLoai}
          style={{ width: 240 }}
          options={loaiOptions.map((item) => ({ value: item, label: item }))}
        />
        <Select
          allowClear
          placeholder="Lọc theo tòa nhà"
          value={filterToaNha}
          onChange={setFilterToaNha}
          style={{ width: 240 }}
          options={toaNhaOptions}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
      />
    </Space>
  )
}

const reportCatalogGroups: ReportGroup[] = [
  {
    title: 'Phòng ở',
    items: [
      { key: 'bc1', label: 'BC1 - Báo cáo theo tòa nhà', requires: ['toaNha'], onExport: (v: ReportModalFilters) => reportService.bc1ToaNha(v.toaNhaId!) },
      { key: 'bc2', label: 'BC2 - Báo cáo toàn bộ KTX', onExport: () => reportService.bc2ToanBo() },
      { key: 'bc3', label: 'BC3 - Báo cáo theo tầng', requires: ['toaNha', 'tang'], onExport: (v: ReportModalFilters) => reportService.bc3TheoTang(v.toaNhaId!, v.tangId!) },
      { key: 'bc12', label: 'BC12 - Trích ngang theo tòa nhà và trung đội', requires: ['donVi', 'toaNha'], onExport: (v: ReportModalFilters) => reportService.bc12ToaNhaCntd(v.donViId!, v.toaNhaId!) },
      { key: 'bc13', label: 'BC13 - Chi tiết theo tòa nhà và trung đội', requires: ['donVi', 'toaNha'], onExport: (v: ReportModalFilters) => reportService.bc13ToaNhaCntdChiTiet(v.donViId!, v.toaNhaId!) },
      { key: 'bc14', label: 'BC14 - Chi tiết theo tầng và trung đội', requires: ['donVi', 'toaNha', 'tang'], onExport: (v: ReportModalFilters) => reportService.bc14TangCntdChiTiet(v.donViId!, v.tangId!) },
    ],
  },
  {
    title: 'Vệ sinh',
    items: [
      { key: 'bc4', label: 'BC4 - Bảng phân công vệ sinh tòa nhà', requires: ['toaNha'], onExport: (v: ReportModalFilters) => reportService.bc4PcvsToaNha(v.toaNhaId!) },
      { key: 'bc4b', label: 'BC4b - Sơ đồ phân công vệ sinh tòa nhà', requires: ['toaNha'], onExport: (v: ReportModalFilters) => reportService.bc4bSoDoPcvs(v.toaNhaId!) },
      { key: 'bc5', label: 'BC5 - Phân công vệ sinh theo tầng', requires: ['toaNha', 'tang'], onExport: (v: ReportModalFilters) => reportService.bc5PcvsTheoTang(v.toaNhaId!, v.tangId!) },
      { key: 'bc5b', label: 'BC5b - Sơ đồ phân công vệ sinh theo tầng', requires: ['toaNha', 'tang'], onExport: (v: ReportModalFilters) => reportService.bc5bSoDoPcvsTang(v.toaNhaId!, v.tangId!) },
    ],
  },
  {
    title: 'Camera - PCCC',
    items: [
      { key: 'bc6', label: 'BC6 - Sơ đồ bố trí camera tòa nhà', requires: ['toaNha'], onExport: (v: ReportModalFilters) => reportService.bc6CameraToaNha(v.toaNhaId!) },
      { key: 'bc7', label: 'BC7 - Sơ đồ bố trí thiết bị PCCC tòa nhà', requires: ['toaNha'], onExport: (v: ReportModalFilters) => reportService.bc7PcccToaNha(v.toaNhaId!) },
    ],
  },
  {
    title: 'Học viên',
    items: [
      { key: 'bc8', label: 'BC8 - Trích ngang trung đội toàn bộ KTX', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc8CntdToanBo(v.donViId!) },
      { key: 'bc9', label: 'BC9 - Báo cáo chi tiết 1 trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc9TrungDoi(v.donViId!) },
      { key: 'bc10', label: 'BC10 - Danh sách nam theo trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc10DsNam(v.donViId!) },
      { key: 'bc11', label: 'BC11 - Danh sách nữ theo trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc11DsNu(v.donViId!) },
      { key: 'bc15', label: 'BC15 - Báo cáo vi phạm theo trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc15ViPham(v.donViId!) },
      { key: 'bc16', label: 'BC16 - Trung đội theo quê quán', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc16TrungDoiQueQuan(v.donViId!) },
      { key: 'bc17', label: 'BC17 - Trung đội theo đơn vị cử đi học', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc17TrungDoiDonViCu(v.donViId!) },
      { key: 'bc18', label: 'BC18 - Học viên nam trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc18HvNamTrungDoi(v.donViId!) },
      { key: 'bc19', label: 'BC19 - Học viên nữ trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc19HvNuTrungDoi(v.donViId!) },
      { key: 'bc20', label: 'BC20 - Học viên dân tộc thiểu số trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc20DanTocTrungDoi(v.donViId!) },
      { key: 'bc21', label: 'BC21 - Trích ngang trung đội (tổng hợp)', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc21TrichNgangTrungDoi(v.donViId!) },
      { key: 'bc22', label: 'BC22 - Danh sách đầy đủ học viên trung đội', requires: ['donVi'], onExport: (v: ReportModalFilters) => reportService.bc22DanhSachTrungDoi(v.donViId!) },
      { key: 'bc23', label: 'BC23 - Thông tin học viên theo họ tên', requires: ['search'], onExport: (v: ReportModalFilters) => reportService.bc23ThongTinHocVien((v.search ?? '').trim()) },
      { key: 'bc23-1', label: 'BC23.1 - Tìm học viên theo từ khóa', requires: ['search'], onExport: (v: ReportModalFilters) => reportService.bc23_1TimHocVien((v.search ?? '').trim()) },
      { key: 'bc24', label: 'BC24 - Tình trạng hôn nhân', onExport: () => reportService.bc24TinhTrangHonNhan() },
      { key: 'bc25', label: 'BC25 - Đảng viên', onExport: () => reportService.bc25DangVien() },
    ],
  },
  {
    title: 'Tài sản',
    items: [
      { key: 'bc26', label: 'BC26 - Báo cáo tài sản (đang chờ API)', unavailableReason: 'Chưa khả dụng trên backend', onExport: () => undefined },
      { key: 'bc27', label: 'BC27 - Báo cáo hư hỏng KTX', onExport: () => reportService.bc27HuHongKtx() },
      { key: 'bc28', label: 'BC28 - Báo cáo tài sản (đang chờ API)', unavailableReason: 'Chưa khả dụng trên backend', onExport: () => undefined },
      { key: 'bc29', label: 'BC29 - Báo cáo tài sản (đang chờ API)', unavailableReason: 'Chưa khả dụng trên backend', onExport: () => undefined },
      { key: 'bc30', label: 'BC30 - Thống kê tài sản bàn giao phòng', requires: ['phong'], onExport: (v: ReportModalFilters) => reportService.bc30ThongKeTaiSan(v.phongId!) },
    ],
  },
]

export default function VanBanSoDoPage() {
  const [activeTab, setActiveTab] = useState<BranchKey>('van-ban')
  const [reloadToken, setReloadToken] = useState(0)
  const [allDocs, setAllDocs] = useState<DocRecord[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toaNhaList, setToaNhaList] = useState<any[]>([])
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const getDownloadName = (url: string, docName?: string) => {
    // Extract extension from URL  
    const urlPath = url.split('?')[0]
    const lastSegment = urlPath.split('/').pop() || ''
    const dotIdx = lastSegment.lastIndexOf('.')
    const ext = dotIdx > 0 ? lastSegment.substring(dotIdx) : ''

    // If we have a document name, use it + extension
    if (docName) {
      // Sanitize docName for filename use (replace special chars)
      const safeName = docName.replace(/[<>:"/\\|?*]/g, '_').trim()
      // If docName already has the extension, don't duplicate
      if (ext && !safeName.toLowerCase().endsWith(ext.toLowerCase())) {
        return `${safeName}${ext}`
      }
      return safeName || lastSegment || 'file'
    }

    // Library files use ?name=... format  
    const query = new URLSearchParams(url.split('?')[1] ?? '')
    const nameParam = query.get('name')
    if (nameParam) return decodeURIComponent(nameParam)

    // Fallback: extract filename from path
    return decodeURIComponent(lastSegment || 'file')
  }

  // Fix Cloudinary URLs with double extensions caused by old backend bug
  // e.g. .pdf.pdf → .pdf, .docx.docx → .docx
  const cleanCloudinaryUrl = (url: string): string => {
    return url.replace(/(\.[a-zA-Z0-9]{2,5})\1([\/?#]|$)/, '$1$2')
  }

  const openFileInNewTab = async (url: string, docName?: string) => {
    try {
      if (url.startsWith('http')) {
        // Clean double extensions from old uploads (e.g. .pdf.pdf → .pdf)
        const cleanUrl = cleanCloudinaryUrl(url)
        const urlPath = new URL(cleanUrl).pathname
        const ext = urlPath.split('.').pop()?.toLowerCase() || ''
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)
        const isPreviewableInGDocs = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext)

        if (isImage) {
          // Images: open directly — browsers render images natively
          window.open(cleanUrl, '_blank', 'noopener,noreferrer')
          return
        }

        if (isPreviewableInGDocs) {
          // PDF, Office docs, text: use Google Docs Viewer for inline preview
          // Works with any publicly accessible Cloudinary URL
          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(cleanUrl)}&embedded=true`
          window.open(viewerUrl, '_blank', 'noopener,noreferrer')
          return
        }

        // Other formats: trigger download
        await downloadFile(url, docName)
        message.info('Định dạng này không xem trực tiếp trên trình duyệt, hệ thống đã tải file về máy')
        return
      }

      // Local backend URL: fetch via api (with auth)
      const res = await api.get(url, { responseType: 'blob' })
      const contentType = String(res.headers?.['content-type'] ?? '').toLowerCase()
      const blob = new Blob([res.data], { type: contentType || 'application/octet-stream' })

      const isPreviewable =
        contentType.includes('application/pdf')
        || contentType.startsWith('image/')
        || contentType.startsWith('text/')

      if (!isPreviewable) {
        await downloadFile(url, docName)
        message.info('Định dạng này không xem trực tiếp trên trình duyệt, hệ thống đã tải file về máy')
        return
      }

      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
    } catch {
      message.error('Không thể mở file')
    }
  }

  const downloadFile = async (url: string, docName?: string) => {
    try {
      if (url.startsWith('http')) {
        // Clean double extensions from old uploads (e.g. .pdf.pdf → .pdf)
        const cleanUrl = cleanCloudinaryUrl(url)
        const fileName = getDownloadName(cleanUrl, docName)

        // Fetch file as blob then trigger download with proper filename
        // (opening URL directly just renders PDFs in browser instead of downloading)
        const res = await fetch(cleanUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
        return
      }

      const separator = url.includes('?') ? '&' : '?'
      const downloadUrl = `${url}${separator}download=1`
      const res = await api.get(downloadUrl, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = getDownloadName(url, docName)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      message.error('Không thể tải file')
    }
  }

  const loadDocs = async () => {
    setLoadingDocs(true)
    try {
      const [dbRes, libRes] = await Promise.allSettled([
        soDoService.getAll(),
        soDoService.getLibraryFiles(),
      ])

      const dbDocs = dbRes.status === 'fulfilled' && Array.isArray(dbRes.value) ? dbRes.value : []
      const libDocs = libRes.status === 'fulfilled' && Array.isArray(libRes.value) ? libRes.value : []

      setAllDocs([...(dbDocs as DocRecord[]), ...(libDocs as DocRecord[])])

      if (dbRes.status === 'rejected' && libRes.status === 'rejected') {
        message.error('Lỗi tải dữ liệu tài liệu')
      }
    } catch {
      message.error('Lỗi tải dữ liệu tài liệu')
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [reloadToken])

  useEffect(() => {
    api.get('/toa-nha')
      .then((res) => setToaNhaList(Array.isArray(unwrap(res)) ? unwrap(res) : []))
      .catch(() => setToaNhaList([]))
  }, [])

  const handleUploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const res = await api.post('/uploads/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const d = res.data?.data ?? res.data
      const url = d?.url ?? d?.data?.url
      if (!url) throw new Error('No URL returned')
      return url
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Lỗi upload file'
      message.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async () => {
    const values = await form.validateFields()

    // Upload file first if there's a file in the list
    let filePath = values.file_path
    if (uploadFileList.length > 0 && uploadFileList[0].originFileObj) {
      const uploadedUrl = await handleUploadFile(uploadFileList[0].originFileObj as File)
      if (!uploadedUrl) return // Upload failed, stop
      filePath = uploadedUrl
    }

    if (!filePath) {
      message.error('Vui lòng chọn file để upload')
      return
    }

    const dto: CreateSoDoDto = {
      toa_nha_id: values.toa_nha_id,
      loai: values.loai,
      ten_van_ban: values.ten_van_ban,
      ngay_cap_nhat: values.ngay_cap_nhat ? values.ngay_cap_nhat.toISOString() : undefined,
      file_path: filePath,
    }

    setSubmitting(true)
    try {
      await soDoService.create(dto)
      message.success('Thêm thành công')
      setCreateModalOpen(false)
      form.resetFields()
      setUploadFileList([])
      setReloadToken((v) => v + 1)
    } catch {
      message.error('Thao tác thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCsv = async () => {
    try {
      if (allDocs.length === 0) {
        message.warning('Không có dữ liệu để xuất')
        return
      }

      const headers = ['STT', 'Nhánh', 'Loại', 'Tên văn bản', 'Ngày cập nhật', 'Tòa nhà', 'File']
      const rows = allDocs.map((item, i) => [
        i + 1,
        detectBranch(item) === 'van-ban' ? 'Văn bản' : detectBranch(item) === 'so-do' ? 'Sơ đồ' : 'Phân công vệ sinh',
        item.loai ?? '',
        item.ten_van_ban ?? '',
        formatDate(item.ngay_cap_nhat),
        item.toaNha?.ten_toa ?? '',
        item.file_path ?? '',
      ])

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Danh_Muc_Tai_Lieu_${new Date().toLocaleDateString('vi-VN')}.csv`
      a.click()
      URL.revokeObjectURL(url)
      message.success('Xuất dữ liệu thành công')
    } catch {
      message.error('Lỗi khi xuất dữ liệu')
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Văn bản - Sơ đồ - Phân công vệ sinh"
        subtitle="Mở PDF trực tiếp từ danh sách và xuất catalog báo cáo"
        breadcrumbs={[{ label: 'Văn bản - Sơ đồ' }]}
        extra={(
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={() => setReportModalOpen(true)}>Catalog báo cáo</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>Xuất CSV</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>Thêm mới</Button>
          </Space>
        )}
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as BranchKey)}
          items={[
            {
              key: 'van-ban',
              label: 'Văn bản',
              children: (
                <DocumentListTab
                  branch="van-ban"
                  data={allDocs}
                  loading={loadingDocs}
                  onOpenFile={openFileInNewTab}
                  onDownloadFile={downloadFile}
                />
              ),
            },
            {
              key: 'so-do',
              label: 'Sơ đồ',
              children: (
                <DocumentListTab
                  branch="so-do"
                  data={allDocs}
                  loading={loadingDocs}
                  onOpenFile={openFileInNewTab}
                  onDownloadFile={downloadFile}
                />
              ),
            },
            {
              key: 'phan-cong-ve-sinh',
              label: 'Phân công vệ sinh',
              children: (
                <DocumentListTab
                  branch="phan-cong-ve-sinh"
                  data={allDocs}
                  loading={loadingDocs}
                  onOpenFile={openFileInNewTab}
                  onDownloadFile={downloadFile}
                />
              ),
            },
            {
              key: 'bao-cao',
              label: 'Báo cáo',
              children: (
                <Card size="small" title="Catalog báo cáo BC1 .. BC30">
                  <Space direction="vertical" size={12}>
                    <div>Danh mục báo cáo được phân nhóm và có tham số xuất theo từng biểu mẫu.</div>
                    <Button type="primary" icon={<FilePdfOutlined />} onClick={() => setReportModalOpen(true)}>
                      Mở catalog báo cáo
                    </Button>
                  </Space>
                </Card>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
          setUploadFileList([])
        }}
        title="Thêm tài liệu"
        onOk={handleCreate}
        confirmLoading={submitting || uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Loại" name="loai" rules={[{ required: true, message: 'Nhập loại' }]}>
            <Input placeholder="VD: Văn bản nội quy, Sơ đồ tầng 1, PCVS..." />
          </Form.Item>

          <Form.Item label="Tên văn bản" name="ten_van_ban" rules={[{ required: true, message: 'Nhập tên văn bản' }]}>
            <Input placeholder="VD: Nội quy sinh hoạt KTX" />
          </Form.Item>

          <Form.Item label="Ngày cập nhật" name="ngay_cap_nhat">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Tòa nhà" name="toa_nha_id">
            <Select
              placeholder="Chọn tòa nhà (nếu có)"
              allowClear
              showSearch
              optionFilterProp="label"
              options={toaNhaList.map((t: any) => ({
                value: t.id,
                label: t.ten_toa ?? t.ma_toa,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Tải lên file"
            name="file_path"
            rules={[
              {
                validator: () => {
                  if (uploadFileList.length > 0) return Promise.resolve()
                  return Promise.reject(new Error('Vui lòng chọn file để upload'))
                },
              },
            ]}
          >
            <Upload.Dragger
              fileList={uploadFileList}
              beforeUpload={(file) => {
                const isAllowed = /\.(pdf|docx?|xlsx?|jpe?g|png|gif|bmp|pptx?|txt|csv)$/i.test(file.name)
                if (!isAllowed) {
                  message.error('Loại file không được hỗ trợ')
                  return Upload.LIST_IGNORE
                }
                const isLt20M = file.size / 1024 / 1024 < 20
                if (!isLt20M) {
                  message.error('File phải nhỏ hơn 20MB')
                  return Upload.LIST_IGNORE
                }
                setUploadFileList([{ ...file, originFileObj: file } as any])
                form.setFieldValue('file_path', file.name)
                form.validateFields(['file_path'])
                return false // Prevent auto upload — we'll upload on form submit
              }}
              onRemove={() => {
                setUploadFileList([])
                form.setFieldValue('file_path', undefined)
              }}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.ppt,.pptx,.txt,.csv"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấn hoặc kéo thả file vào đây</p>
              <p className="ant-upload-hint">
                Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ... (tối đa 20MB)
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <ReportExportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        groups={reportCatalogGroups}
        selectors={['toaNha', 'tang', 'phong', 'donVi', 'search']}
        title="Catalog báo cáo BC1 .. BC30"
      />
    </PageContainer>
  )
}
