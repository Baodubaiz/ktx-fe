export interface User {
  id: number;
  maQuanHam: string;
  hoTen: string | null;
  soDienThoai: string | null;
  email: string | null;
  anhDaiDien: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  role: {
    id: number;
    role_id: string;
    name: string;
    description: string | null;
    level: number;
  };

  donViDoiChuNhiem: {
    id: number;
    ten_don_vi: string | null;
  }[];

  lopHocChuNhiem: {
    id: number;
    ten_lop: string | null;
  }[];
}
