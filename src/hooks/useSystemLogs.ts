import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { systemLogsService, type SystemLogParams } from '../services/systemLogs.service';

interface SystemLogsResponse {
  success: boolean;
  data: {
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const useSystemLogs = (params: SystemLogParams) => {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<SystemLogsResponse['data']['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stabilize params reference for useCallback dependency
  const stableParams = useMemo(() => JSON.stringify(params), [params]);

  const fetchLogs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const parsedParams: SystemLogParams = JSON.parse(stableParams);
      const res = await systemLogsService.getAll(parsedParams);

      setData(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta ?? null);
    } catch (err: any) {
      console.error('Fetch system logs error:', err);
      setError(err?.message || 'Khong the tai nhat ky he thong');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [stableParams]);

  useEffect(() => {
    fetchLogs(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLogs(true);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLogs]);

  return {
    data,
    meta,
    loading,
    error,
    refetch: () => fetchLogs(false),
  };
};
