import { useState } from 'react'
import { message } from 'antd'
import { buildService } from '@/services/build.service'
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build'

export const useBuild = () => {
    const [builds, setBuilds] = useState<Build[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getBuilds = async (): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const data = await buildService.getAll()
            setBuilds(data)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const getBuild = async (id: number): Promise<Build | undefined> => {
        try {
            setLoading(true)
            setError(null)
            return await buildService.getById(id)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const createBuild = async (payload: CreateBuildDto): Promise<Build | undefined> => {
        try {
            setLoading(true)
            setError(null)
            const newBuild = await buildService.create(payload)
            setBuilds(prev => [...prev, newBuild])
            return newBuild
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tạo tòa nhà'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const updateBuild = async (
        id: number,
        payload: UpdateBuildDto
    ): Promise<Build | undefined> => {
        try {
            setLoading(true)
            setError(null)
            const updated = await buildService.update(id, payload)
            setBuilds(prev =>
                prev.map(b => (b.id === id ? updated : b))
            )
            return updated
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi cập nhật tòa nhà'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const deleteBuild = async (id: number): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            await buildService.delete(id)
            setBuilds(prev => prev.filter(b => b.id !== id))
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi xóa tòa nhà'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return {
        builds,
        loading,
        error,
        getBuilds,
        getBuild,
        createBuild,
        updateBuild,
        deleteBuild,
    }
}
