import { useState, useEffect, useMemo } from 'react'
import { Modal, Select, Space, Button, Typography, Divider, Input, Tag } from 'antd'
import {
  FilePdfOutlined,
  DownloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { api } from '@/lib/axios'

const { Text } = Typography

/* ─── Types ─── */
export interface ReportModalFilters {
  toaNhaId?: number
  tangId?: number
  phongId?: number
  donViId?: number
  search?: string
}

interface LookupItem {
  id: number
  label: string
}

/* ─── unwrap helper (matches backend response patterns) ─── */
const unwrap = (res: any): any[] => {
  const d = res.data?.data ?? res.data
  const list = d?.data ?? d
  return Array.isArray(list) ? list : []
}

/* ─── Report item definition ─── */
export interface ReportItem {
  key: string
  label: string
  unavailableReason?: string
  /** Which selectors are required to be filled before exporting */
  requires?: ('toaNha' | 'tang' | 'phong' | 'donVi' | 'search')[]
  /** The export function — receives currently-selected values */
  onExport: (vals: ReportModalFilters) => void
}

export interface ReportGroup {
  title: string
  items: ReportItem[]
}

interface Props {
  open: boolean
  onClose: () => void
  /** Report groups to show in this modal */
  groups: ReportGroup[]
  /** Which selector types are used across all groups (auto-determined if omitted) */
  selectors?: ('toaNha' | 'tang' | 'phong' | 'donVi' | 'search')[]
  /** Pre-populated values from current page filters */
  initialValues?: ReportModalFilters
  title?: string
}

export default function ReportExportModal({
  open,
  onClose,
  groups,
  selectors: selectorsProp,
  initialValues,
  title = 'Xuất báo cáo',
}: Props) {
  /* ─── Selector state ─── */
  const [toaNhaId, setToaNhaId] = useState<number | undefined>()
  const [tangId, setTangId] = useState<number | undefined>()
  const [phongId, setPhongId] = useState<number | undefined>()
  const [donViId, setDonViId] = useState<number | undefined>()
  const [search, setSearch] = useState('')

  /* ─── Lookup data ─── */
  const [buildings, setBuildings] = useState<LookupItem[]>([])
  const [floors, setFloors] = useState<LookupItem[]>([])
  const [rooms, setRooms] = useState<LookupItem[]>([])
  const [squads, setSquads] = useState<LookupItem[]>([])
  const [loadingLookups, setLoadingLookups] = useState(false)

  /* ─── Determine which selectors are needed ─── */
  const neededSelectors = useMemo(() => {
    if (selectorsProp) return new Set(selectorsProp)
    const set = new Set<string>()
    groups.forEach(g =>
      g.items.forEach(i => i.requires?.forEach(r => set.add(r))),
    )
    return set
  }, [groups, selectorsProp])

  /* ─── Pre-populate from page filters when modal opens ─── */
  useEffect(() => {
    if (open) {
      setToaNhaId(initialValues?.toaNhaId)
      setTangId(initialValues?.tangId)
      setPhongId(initialValues?.phongId)
      setDonViId(initialValues?.donViId)
      setSearch(initialValues?.search ?? '')
    }
  }, [open, initialValues])

  /* ─── Load lookup data on open ─── */
  useEffect(() => {
    if (!open) return
    const load = async () => {
      setLoadingLookups(true)
      try {
        const promises: Promise<void>[] = []

        if (neededSelectors.has('toaNha') || neededSelectors.has('tang') || neededSelectors.has('phong')) {
          promises.push(
            api.get('/toa-nha').then(res => {
              setBuildings(
                unwrap(res).map((b: any) => ({
                  id: b.id,
                  label: b.ten_toa ?? b.ma_toa ?? `Tòa #${b.id}`,
                })),
              )
            }),
          )
        }

        if (neededSelectors.has('donVi')) {
          promises.push(
            api.get('/don-vi-doi').then(res => {
              setSquads(
                unwrap(res).map((s: any) => ({
                  id: s.id,
                  label: s.ten_don_vi ?? `TĐ #${s.id}`,
                })),
              )
            }),
          )
        }

        if (neededSelectors.has('phong')) {
          promises.push(
            api.get('/phong').then(res => {
              setRooms(
                unwrap(res).map((r: any) => ({
                  id: r.id,
                  label: r.ma_phong ?? `Phòng #${r.id}`,
                })),
              )
            }),
          )
        }

        await Promise.all(promises)
      } catch {
        /* silent */
      } finally {
        setLoadingLookups(false)
      }
    }
    load()
  }, [open, neededSelectors])

  /* ─── Load floors when building changes ─── */
  useEffect(() => {
    if (!open || !neededSelectors.has('tang')) return
    if (!toaNhaId) {
      setFloors([])
      setTangId(undefined)
      return
    }
    api
      .get(`/tang/toa-nha/${toaNhaId}`)
      .then(res => {
        setFloors(
          unwrap(res).map((f: any) => ({
            id: f.id,
            label: `Tầng ${f.so_tang ?? f.id}`,
          })),
        )
      })
      .catch(() => setFloors([]))
  }, [open, toaNhaId, neededSelectors])

  /* ─── Current values object ─── */
  const currentVals: ReportModalFilters = { toaNhaId, tangId, phongId, donViId, search }

  /* ─── Check if a report can execute ─── */
  const canExport = (item: ReportItem): boolean => {
    if (item.unavailableReason) return false
    if (!item.requires || item.requires.length === 0) return true
    return item.requires.every(r => {
      if (r === 'toaNha') return !!toaNhaId
      if (r === 'tang') return !!tangId
      if (r === 'phong') return !!phongId
      if (r === 'donVi') return !!donViId
      if (r === 'search') return !!search.trim()
      return true
    })
  }

  /* ─── Missing params description ─── */
  const missingLabel = (item: ReportItem): string | null => {
    if (item.unavailableReason) return item.unavailableReason
    if (!item.requires) return null
    const missing: string[] = []
    item.requires.forEach(r => {
      if (r === 'toaNha' && !toaNhaId) missing.push('tòa nhà')
      if (r === 'tang' && !tangId) missing.push('tầng')
      if (r === 'phong' && !phongId) missing.push('phòng')
      if (r === 'donVi' && !donViId) missing.push('trung đội')
      if (r === 'search' && !search.trim()) missing.push('từ khóa tìm')
    })
    return missing.length > 0 ? `Chọn: ${missing.join(', ')}` : null
  }

  return (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          <span>{title}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      {/* ─── Selectors ─── */}
      <div
        style={{
          background: '#fafafa',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          border: '1px solid #f0f0f0',
        }}
      >
        <Text strong style={{ fontSize: 12, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tham số báo cáo
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {neededSelectors.has('toaNha') && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Chọn tòa nhà"
              loading={loadingLookups}
              style={{ minWidth: 150, flex: 1 }}
              value={toaNhaId}
              onChange={v => {
                setToaNhaId(v)
                setTangId(undefined)
              }}
              options={buildings.map(b => ({ value: b.id, label: b.label }))}
            />
          )}
          {neededSelectors.has('tang') && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Chọn tầng"
              disabled={!toaNhaId}
              style={{ minWidth: 120, flex: 1 }}
              value={tangId}
              onChange={setTangId}
              options={floors.map(f => ({ value: f.id, label: f.label }))}
            />
          )}
          {neededSelectors.has('phong') && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Chọn phòng"
              loading={loadingLookups}
              style={{ minWidth: 140, flex: 1 }}
              value={phongId}
              onChange={setPhongId}
              options={rooms.map(r => ({ value: r.id, label: r.label }))}
            />
          )}
          {neededSelectors.has('donVi') && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Chọn trung đội"
              loading={loadingLookups}
              style={{ minWidth: 160, flex: 1 }}
              value={donViId}
              onChange={setDonViId}
              options={squads.map(s => ({ value: s.id, label: s.label }))}
            />
          )}
          {neededSelectors.has('search') && (
            <Input
              placeholder="Họ tên / từ khóa..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              style={{ minWidth: 180, flex: 1 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* ─── Report groups ─── */}
      {groups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <Divider style={{ margin: '8px 0' }} />}
          <Text
            strong
            style={{
              fontSize: 12,
              color: '#1890ff',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              marginBottom: 6,
            }}
          >
            {group.title}
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {group.items.map(item => {
              const ok = canExport(item)
              const missing = missingLabel(item)
              return (
                <Button
                  key={item.key}
                  type="text"
                  block
                  disabled={!ok}
                  icon={<FilePdfOutlined style={{ color: ok ? '#52c41a' : '#d9d9d9' }} />}
                  onClick={() => {
                    item.onExport(currentVals)
                    onClose()
                  }}
                  style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 'auto',
                    padding: '6px 12px',
                    borderRadius: 6,
                    ...(ok
                      ? { color: '#262626' }
                      : { color: '#bfbfbf' }),
                  }}
                >
                  <span style={{ flex: 1, whiteSpace: 'normal', lineHeight: 1.3 }}>
                    {item.label}
                  </span>
                  {missing && (
                    <Tag
                      color="warning"
                      style={{ fontSize: 11, marginLeft: 8, flexShrink: 0 }}
                    >
                      {missing}
                    </Tag>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </Modal>
  )
}
