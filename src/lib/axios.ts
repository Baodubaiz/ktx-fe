// src/lib/axios.ts
import axios from 'axios'

// In-memory access token (NOT stored in localStorage)
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Send cookies with every request
})

// Attach access token from memory to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// https://ktx-backend-1.vercel.app