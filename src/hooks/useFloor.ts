import { useState } from 'react'
import { message } from 'antd'
import { floorService } from '@/services/floor.service'
import type { Floor, CreateFloorDto, UpdateFloorDto } from '@/types/floor'

export const useFloor = (initialBuildId?: number) => {
    const [buildId, setBuildId] = useState<number | undefined>(initialBuildId)
    const [floors, setFloors] = useState<Floor[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ===== GET FLOORS (BY BUILD IF PROVIDED) =====
    const getFloors = async (id?: number) => {
        const targetBuildId = id ?? buildId

        try {
            setLoading(true)
            setError(null)

            let data: Floor[]

            if (targetBuildId !== undefined) {
                // dùng khi backend có API theo tòa
                data = await floorService.getByBuild(targetBuildId)
            } else {
                // fallback khi chưa có API
                data = await floorService.getAll()
            }

            setFloors(data)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách tầng'
            setError(msg)
            message.error(msg)
            setFloors([])
        } finally {
            setLoading(false)
        }
    }

    const getFloor = async (id: number) => {
        try {
            setLoading(true)
            setError(null)
            return await floorService.getById(id)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tải tầng'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const createFloor = async (payload: CreateFloorDto) => {
        try {
            setLoading(true)
            setError(null)
            const created = await floorService.create(payload)
            setFloors((prev) => [...prev, created])
            return created
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi tạo tầng'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const updateFloor = async (id: number, payload: UpdateFloorDto) => {
        try {
            setLoading(true)
            setError(null)
            const updated = await floorService.update(id, payload)
            setFloors((prev) =>
                prev.map((f) => (f.id === id ? updated : f))
            )
            return updated
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi cập nhật tầng'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const deleteFloor = async (id: number) => {
        try {
            setLoading(true)
            setError(null)
            await floorService.delete(id)
            setFloors((prev) => prev.filter((f) => f.id !== id))
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Lỗi xóa tầng'
            setError(msg)
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return {
        floors,
        loading,
        error,
        buildId,
        setBuildId,
        getFloors,
        getFloor,
        createFloor,
        updateFloor,
        deleteFloor,
    }
}
