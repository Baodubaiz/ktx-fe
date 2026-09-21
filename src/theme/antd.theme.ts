// src/theme/antd.theme.ts
// Ant Design theme configuration using Design Tokens
import type { ThemeConfig } from 'antd'
import { systemTheme } from './system-theme'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: systemTheme.brand.primary,
    colorPrimaryHover: systemTheme.brand.primaryHover,
    colorPrimaryActive: systemTheme.brand.primaryActive,

    colorBgContainer: systemTheme.background.container,
    colorBgLayout: systemTheme.background.page,
    colorBgElevated: systemTheme.background.elevated,

    colorText: systemTheme.text.primary,
    colorTextSecondary: systemTheme.text.secondary,

    colorBorder: systemTheme.border.base,
    colorBorderSecondary: systemTheme.border.subtle,

    fontFamily: 'Inter, "Segoe UI", Roboto, system-ui, sans-serif',
    fontSize: 14,

    borderRadius: systemTheme.radius.md,
    borderRadiusLG: systemTheme.radius.lg,
    borderRadiusSM: systemTheme.radius.sm,

    colorSuccess: systemTheme.status.success,
    colorWarning: systemTheme.status.warning,
    colorError: systemTheme.status.error,
    colorInfo: systemTheme.status.info,
  },
  components: {
    Layout: {
      headerBg: systemTheme.brand.primary,
      headerHeight: 64,
      siderBg: systemTheme.background.container,
      bodyBg: systemTheme.background.page,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: systemTheme.brand.primary,
      itemSelectedColor: systemTheme.text.onPrimary,
      itemHoverBg: systemTheme.background.subtle,
      itemHeight: 44,
      iconSize: 18,
      itemBorderRadius: 8,
    },
    Button: {
      controlHeight: 36,
      borderRadius: 8,
      primaryShadow: 'none',
    },
    Table: {
      headerBg: systemTheme.background.subtle,
      headerColor: systemTheme.text.secondary,
      rowHoverBg: '#EEF4EA',
    },
    Breadcrumb: {
      itemColor: systemTheme.text.secondary,
      lastItemColor: systemTheme.text.primary,
      linkColor: systemTheme.text.secondary,
      linkHoverColor: systemTheme.brand.primary,
      separatorColor: systemTheme.text.muted,
    },
    Pagination: {
      itemActiveBg: systemTheme.brand.primary,
      itemActiveColorDisabled: systemTheme.text.onPrimary,
      itemSize: 32,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Form: {
      labelFontSize: 13,
      verticalLabelPadding: '0 0 4px',
    },
    Input: {
      controlHeight: 36,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Typography: {
      titleMarginBottom: '0.4em',
      titleMarginTop: '0.8em',
    },
  },
}
