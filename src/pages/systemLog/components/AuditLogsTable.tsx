import { Table, Tag, Button, Space, Select, Modal, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { SystemLogParams } from '../../../services/systemLogs.service';

const { RangePicker } = DatePicker;

interface Props {
  data: any[];
  loading: boolean;
  pagination: any;
  onChange: (page: number, pageSize: number) => void;
  onFilterChange: (filters: Partial<SystemLogParams>) => void;
}

const MODULE_OPTIONS = [
  { label: 'Học viên', value: 'STUDENT' },
  { label: 'Phòng', value: 'ROOM' },
  { label: 'Tài sản phòng', value: 'ROOM_ASSET' },
  { label: 'Bố trí phòng', value: 'ROOM_ASSIGNMENT' },
  { label: 'Sửa chữa TS', value: 'ASSET_REPAIR' },
  { label: 'Nhập dữ liệu', value: 'DATA_IMPORT' },
  { label: 'Vi phạm', value: 'VIOLATION' },
  { label: 'Kỷ luật', value: 'DISCIPLINE' },
  { label: 'Phân công VS', value: 'CLEANING_ASSIGNMENT' },
  { label: 'Bồi thường TS', value: 'ASSET_COMPENSATION' },
  { label: 'Toà nhà', value: 'BUILDING' },
  { label: 'Tầng', value: 'FLOOR' },
  { label: 'Giường', value: 'BED' },
  { label: 'Đơn vị đội', value: 'SQUAD' },
  { label: 'Người dùng', value: 'USER' },
  { label: 'Auth', value: 'AUTH' },
  { label: 'Camera', value: 'CAMERA' },
  { label: 'PCCC', value: 'FIRE_SAFETY' },
];

const ACTION_OPTIONS = [
  { label: 'Tạo mới', value: 'CREATE' },
  { label: 'Cập nhật', value: 'UPDATE' },
  { label: 'Xoá', value: 'DELETE' },
  { label: 'Import', value: 'IMPORT' },
  { label: 'Login', value: 'LOGIN' },
];

export const AuditLogsTable = ({ data, loading, pagination, onChange, onFilterChange }: Props) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const renderChangeTag = (record: any) => {
    const hasOld = !!record.old_data;
    const hasNew = !!record.new_data;

    if (hasOld && hasNew) {
      return (
        <Space>
          <Tag color="gold">OLD → NEW</Tag>
          <Button size="small" type="link" onClick={() => setSelectedLog(record)}>
            Xem chi tiết
          </Button>
        </Space>
      );
    }

    if (hasNew) {
      return (
        <Space>
          <Tag color="green">NEW</Tag>
          <Button size="small" type="link" onClick={() => setSelectedLog(record)}>
            Xem chi tiết
          </Button>
        </Space>
      );
    }

    if (hasOld) {
      return (
        <Space>
          <Tag color="red">OLD</Tag>
          <Button size="small" type="link" onClick={() => setSelectedLog(record)}>
            Xem chi tiết
          </Button>
        </Space>
      );
    }

    return '-';
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Thời điểm',
      dataIndex: 'created_at',
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
      width: 180,
    },
    {
      title: 'Người dùng',
      render: (_, r) => r.nguoiDung?.hoTen || 'Hệ thống',
      width: 160,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 130,
      render: (v) => {
        const colorMap: any = {
          CREATE: 'green',
          UPDATE: 'blue',
          DELETE: 'red',
          IMPORT: 'purple',
          LOGIN: 'cyan',
        };
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>;
      },
    },
    {
      title: 'Module',
      dataIndex: 'module',
      width: 180,
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Entity',
      dataIndex: 'entity_name',
      width: 200,
    },
    {
      title: 'Entity ID',
      dataIndex: 'entity_id',
      width: 100,
    },
    {
      title: 'Thay đổi dữ liệu',
      key: 'changes',
      width: 220,
      render: (_, record) => renderChangeTag(record),
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];

  return (
    <>
      {/* Server-side Filter Bar */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Lọc Module"
          allowClear
          style={{ width: 180 }}
          onChange={(val) => onFilterChange({ module: val })}
          options={MODULE_OPTIONS}
        />

        <Select
          placeholder="Lọc Hành động"
          allowClear
          style={{ width: 160 }}
          onChange={(val) => onFilterChange({ action: val })}
          options={ACTION_OPTIONS}
        />

        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) => {
            onFilterChange({
              from: dates?.[0]?.startOf('day').toISOString(),
              to: dates?.[1]?.endOf('day').toISOString(),
            });
          }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          current: pagination?.page,
          pageSize: pagination?.limit,
          total: pagination?.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          onChange,
        }}
      />

      {/* Modal xem chi tiết OLD / NEW */}
      <Modal
        title="Chi tiết thay đổi dữ liệu"
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={900}
      >
        {selectedLog && (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {selectedLog.old_data && (
              <div
                style={{
                  background: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <h3 style={{ color: '#cf1322' }}>OLD DATA</h3>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_data && (
              <div
                style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <h3 style={{ color: '#389e0d' }}>NEW DATA</h3>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
};
