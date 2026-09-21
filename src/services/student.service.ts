/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from '@/lib/axios';
import { type StudentFilters } from '@/types/student';

export const studentService = {
    getAll: async (params?: StudentFilters) => {
        const apiParams = {
            ...params,
            ho: params?.ho_rieng,
            ten: params?.ten_rieng,
        };

        const cleanParams = Object.fromEntries(
            Object.entries(apiParams).filter(
                ([k, v]) =>
                    k !== 'ho_rieng' &&
                    k !== 'ten_rieng' &&
                    v !== '' &&
                    v !== null &&
                    v !== undefined,
            )
        );

        const res = await api.get('/hoc-vien', { params: cleanParams });
        return res.data?.data?.data || []; // Mở gói lần 1: lấy mảng từ object {data, message}
    },

    getById: async (id: number) => {
        const res = await api.get(`/hoc-vien/${id}`);
        return res.data?.data || res.data;
    },

    getDetails: async (id: number) => {
        const res = await api.get(`/hoc-vien/${id}/details`);
        return res.data?.data?.data || res.data?.data || res.data;
    },

    create: async (data: any) => {
        const res = await api.post('/hoc-vien', data);
        return res.data;
    },

    update: async (id: number, data: any) => {
        const res = await api.patch(`/hoc-vien/${id}`, data);
        return res.data;
    },

    delete: async (id: number) => {
        const res = await api.delete(`/hoc-vien/${id}`);
        return res.data;
    },

    // XUẤT FILE EXCEL - BẮT BUỘC responseType là blob
    exportExcel: async (fields?: string[]) => {
        const res = await api.get('/hoc-vien/export', {
            params: fields && fields.length > 0 ? { fields: fields.join(',') } : undefined,
            responseType: 'blob'
        });
        return res.data;
    },

    downloadTemplate: async (): Promise<ArrayBuffer> => {
        const res = await api.get('/hoc-vien/template', {
            responseType: 'arraybuffer',
        });
        return res.data;
    },

    // IMPORT FILE
    importExcel: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        // maLoai: 'HOC_VIEN' để khớp với bảng DanhMucLoaiDuLieuImport của bạn
        formData.append('maLoai', 'HOC_VIEN');

        const res = await api.post('/hoc-vien/import', formData);
        return res.data?.data ?? res.data;
    }

};