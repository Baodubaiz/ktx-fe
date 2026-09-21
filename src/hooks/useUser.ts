/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'
import { userService } from '@/services/user.service'
import type { User } from '@/types/user'
import { useAuth } from './useAuth'

export function useUser() {
    const { user: authUser } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const fetchUser = useCallback(async () => {
        if (!authUser?.id) return
        try {
            setLoading(true)
            const data = await userService.getById(authUser.id)
            setUser(data)
            setError(null)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [authUser?.id])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const updateProfile = async (data: Partial<User>) => {
        if (!user?.id) return
        try {
            setLoading(true)
            const updated = await userService.updateProfile(user.id, data)
            setUser(updated)
            return updated
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        loading,
        error,
        refresh: fetchUser,
        updateProfile,
    }
}
