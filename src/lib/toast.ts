// src/lib/toast.ts
// Centralized toast notifications using Ant Design message
import { message } from 'antd'

export function showToast(msg: string, type: 'success' | 'error' = 'success') {
  if (type === 'success') {
    message.success(msg)
  } else {
    message.error(msg)
  }
}

export function showWarning(msg: string) {
  message.warning(msg)
}

export function showInfo(msg: string) {
  message.info(msg)
}
