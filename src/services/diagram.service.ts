import { api } from '@/lib/axios'
import type {
    SoDo,
    CreateSoDoDto,
    UpdateSoDoDto,
} from '@/types/cleaning-document'

const unwrap = (res: any) => {
    const d = res.data?.data ?? res.data
    return d?.data ?? d
}

export const soDoService = {
    getAll: async (): Promise<SoDo[]> => {
        const res = await api.get('/so-do')
        return unwrap(res)
    },
    getById: async (id: number): Promise<SoDo> => {
        const res = await api.get(`/so-do/${id}`)
        return unwrap(res)
    },
    create: async (data: CreateSoDoDto): Promise<SoDo> => {
        const res = await api.post('/so-do', data)
        return unwrap(res)
    },
    update: async (id: number, data: UpdateSoDoDto): Promise<SoDo> => {
        const res = await api.patch(`/so-do/${id}`, data)
        return unwrap(res)
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/so-do/${id}`)
    },
    getLibraryFiles: async (params?: { search?: string; loai?: string }): Promise<any[]> => {
        const res = await api.get('/so-do/library-files', { params })
        return unwrap(res)
    },
    getLibraryFileUrl: (fileName: string, download = false): string => {
        const q = new URLSearchParams({ name: fileName })
        if (download) q.set('download', '1')
        return `/so-do/library-file?${q.toString()}`
    },
}
