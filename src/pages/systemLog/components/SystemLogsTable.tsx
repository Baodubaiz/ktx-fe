import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Props {
  data: any[];
  loading: boolean;
  pagination: any;
  onChange: (page: number, pageSize: number) => void;
}

export const SystemLogsTable = ({ data, loading, pagination, onChange }: Props) => {
  const columns: ColumnsType<any> = [
    {
      title: 'Thời điểm',
      dataIndex: 'thoi_diem',
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Người dùng',
      render: (_, r) => r.nguoiDung?.hoTen || 'Hệ thống',
    },
    {
      title: 'Hành động',
      dataIndex: 'hanh_dong',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Bảng tác động',
      dataIndex: 'bang_tac_dong',
    },
    {
      title: 'ID bản ghi',
      dataIndex: 'khoa_ban_ghi',
    },
    {
      title: 'Kết quả',
      dataIndex: 'ket_qua',
      render: (v) =>
        v === 'THANH_CONG' ? (
          <Tag color="green">Thành công</Tag>
        ) : (
          <Tag color="red">Thất bại</Tag>
        ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={Array.isArray(data) ? data : []}
      loading={loading}
      pagination={{
        current: pagination?.page,
        pageSize: pagination?.limit,
        total: pagination?.total,
        onChange,
      }}
    />
  );
};
