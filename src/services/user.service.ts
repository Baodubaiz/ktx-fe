/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/axios';
import type { User } from '@/types/user';

export const userService = {
    // Lấy thông tin người dùng
    getById: async (id: number): Promise<User> => {
        const res = await api.get(`/nguoi-dung/${id}`);
        // console.log("data", res.data);
        return res.data.data;
    },

    // Cập nhật thông tin cá nhân
    updateProfile: async (id: number, data: Partial<User>) => {
        const res = await api.patch(`/nguoi-dung/${id}/profile`, data);
        return res.data.data;
    },
};
