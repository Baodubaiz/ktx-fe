import { api } from '@/lib/axios'

export type AuditLogParams = SystemLogParams;

export interface SystemLogParams {
  page?: number;
  limit?: number;
  action?: string;
  module?: string;
  entityName?: string;
  userId?: number;
  from?: string;
  to?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  module: string;
  entity_name: string;
  entity_id?: number;
  old_data?: any;
  new_data?: any;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  nguoiDung?: {
    id?: number;
    hoTen?: string;
    maQuanHam?: string;
  };
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const systemLogsService = {
  getAll: async (params: SystemLogParams): Promise<ApiListResponse<AuditLog>> => {
    const res = await api.get('/audit-logs', { params });

    // ResponseInterceptor wraps: { success, data: { data, meta } }
    const payload = res?.data?.data;

    return {
      data: payload?.data ?? [],
      meta: payload?.meta ?? {
        page: 1,
        limit: params.limit ?? 20,
        total: 0,
        totalPages: 1,
      },
    };
  },

  getById: async (id: number): Promise<AuditLog | null> => {
    const res = await api.get(`/audit-logs/${id}`);
    return res?.data?.data ?? null;
  },
};

// backward-compat alias
export const auditLogsService = systemLogsService;
