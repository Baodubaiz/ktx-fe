// src/lib/utils.ts
// Utility functions

/**
 * Extract human-readable error message from an Axios error.
 * Backend wraps errors as: { success: false, error: { code, message } }
 */
export function getApiError(err: any, fallback = 'Đã xảy ra lỗi, vui lòng thử lại'): string {
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  )
}

/**
 * Format date string to dd/MM/yyyy
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '---'
  return d.toLocaleDateString('vi-VN')
}

/**
 * Format number to VND currency
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '---'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}
