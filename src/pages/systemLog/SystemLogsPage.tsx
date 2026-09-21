import { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { useSystemLogs } from '../../hooks/useSystemLogs';
import { AuditLogsTable } from './components/AuditLogsTable';
import { ReloadOutlined } from '@ant-design/icons';
import type { SystemLogParams } from '../../services/systemLogs.service';

const SystemLogsPage = () => {
  const [params, setParams] = useState<SystemLogParams>({
    page: 1,
    limit: 10,
  });

  const { data, meta, loading, refetch } = useSystemLogs(params);

  const handleChangePage = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleFilterChange = (filters: Partial<SystemLogParams>) => {
    setParams((prev) => ({ ...prev, ...filters, page: 1 }));
  };

  return (
    <Card
      title="Nhật ký hệ thống"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
            Làm mới
          </Button>
        </Space>
      }
    >
      <AuditLogsTable
        data={data}
        loading={loading}
        pagination={meta}
        onChange={handleChangePage}
        onFilterChange={handleFilterChange}
      />
    </Card>
  );
};

export default SystemLogsPage;
