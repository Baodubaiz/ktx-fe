export const extractErrorMessage = (error: any): string | null => {
  const data = error?.response?.data

  if (!data) return null

  if (data.error?.message) {
    if (Array.isArray(data.error.message)) {
      return data.error.message[0]
    }
    return data.error.message
  }

  if (data.message) {
    if (Array.isArray(data.message)) {
      return data.message[0]
    }
    return data.message
  }

  return null
}
