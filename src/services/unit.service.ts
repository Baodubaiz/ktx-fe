import { api } from '@/lib/axios';
import type { Unit, CreateUnitDto, UpdateUnitDto } from '@/types/unit';

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data;
  return d?.data ?? d;
};

export const unitService = {
  getAll: async (): Promise<Unit[]> => {
    const res = await api.get('/don-vi-doi');
    return unwrap(res);
  },

  getById: async (id: number): Promise<Unit> => {
    const res = await api.get(`/don-vi-doi/${id}`);
    return unwrap(res);
  },

  create: async (data: CreateUnitDto): Promise<Unit> => {
    const res = await api.post('/don-vi-doi', data);
    return unwrap(res);
  },

  update: async (id: number, data: UpdateUnitDto): Promise<Unit> => {
    const res = await api.patch(`/don-vi-doi/${id}`, data);
    return unwrap(res);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/don-vi-doi/${id}`);
  },
};
