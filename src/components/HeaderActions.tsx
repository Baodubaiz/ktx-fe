import { Button, Space } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { MODULE_ACTION_MAP, ACTION_METADATA } from '@/constants/project'

interface Props {
  onAddClick?: () => void
  onExportClick?: () => void
  onImportClick?: () => void
  onStatsClick?: () => void
  onFilterClick?: () => void
  onEditClick?: () => void
  onDeleteClick?: () => void
  onViewClick?: () => void
}

const ACTION_ICON_MAP = {
  add: PlusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  export: DownloadOutlined,
  import: UploadOutlined,
  stats: BarChartOutlined,
  view: EyeOutlined,
  filter: FilterOutlined,
}

export default function HeaderActions({
  onAddClick,
  onExportClick,
  onImportClick,
  onStatsClick,
  onFilterClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
}: Props) {
  const location = useLocation()

  // T6.2: Get current module from route
  const currentPath = location.pathname
  const moduleConfig = Object.entries(MODULE_ACTION_MAP).find(([path]) =>
    currentPath.startsWith(path)
  )?.[1]

  if (!moduleConfig || moduleConfig.visibleActions.length === 0) {
    return null
  }

  // Map action handlers
  const actionHandlers: Record<string, (() => void) | undefined> = {
    add: onAddClick,
    edit: onEditClick,
    delete: onDeleteClick,
    export: onExportClick,
    import: onImportClick,
    stats: onStatsClick,
    view: onViewClick,
    filter: onFilterClick,
  }

  // Filter and render buttons for visible actions
  const visibleButtons = moduleConfig.visibleActions
    .map(action => {
      const metadata = ACTION_METADATA[action as keyof typeof ACTION_METADATA]
      const IconComponent = ACTION_ICON_MAP[action as keyof typeof ACTION_ICON_MAP]
      const handler = actionHandlers[action]

      if (!metadata || !IconComponent || !handler) {
        return null
      }

      return (
        <Button
          key={action}
          type={action === 'delete' ? 'primary' : 'default'}
          danger={action === 'delete'}
          icon={<IconComponent />}
          onClick={handler}
          title={metadata.label}
        >
          {metadata.label}
        </Button>
      )
    })
    .filter(Boolean)

  if (visibleButtons.length === 0) {
    return null
  }

  return (
    <Space wrap>
      {visibleButtons}
    </Space>
  )
}
