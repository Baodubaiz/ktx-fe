import { useState } from 'react'
import { message } from 'antd'
import { roomService } from '@/services/room.service'
import type { Room, CreateRoomDto, UpdateRoomDto } from '@/types/room'

export function useRoom() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await roomService.getAll()
            setRooms(data)
            return data
        } catch (err) {
            const msg = 'Không tải được danh sách phòng'
            setError(msg)
            message.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const fetchById = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            const data = await roomService.getById(id)
            return data
        } catch (err) {
            const msg = 'Không tải được thông tin phòng'
            setError(msg)
            message.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const create = async (payload: CreateRoomDto) => {
        setLoading(true)
        setError(null)
        try {
            const created = await roomService.create(payload)
            setRooms((prev) => [created, ...prev])
            return created
        } catch (err) {
            const msg = 'Tạo phòng thất bại'
            setError(msg)
            message.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const update = async (id: number, payload: UpdateRoomDto) => {
        setLoading(true)
        setError(null)
        try {
            const updated = await roomService.update(id, payload)
            setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)))
            return updated
        } catch (err) {
            const msg = 'Cập nhật phòng thất bại'
            setError(msg)
            message.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const remove = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            await roomService.delete(id)
            setRooms((prev) => prev.filter((r) => r.id !== id))
        } catch (err) {
            const msg = 'Xóa phòng thất bại'
            setError(msg)
            message.error(msg)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        rooms,
        loading,
        error,
        fetchAll,
        fetchById,
        create,
        update,
        remove,
    }
}

export default useRoom

