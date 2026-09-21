export interface Unit {
  id: number;
  ma_don_vi: string;
  ten_don_vi: string | null;
  cap_do: number | null;
  don_vi_cha: number | null;
  chu_nhiem_id: number | null;
  quan_so: number | null;
  chuNhiem?: {
    id: number;
    hoTen: string;
    maQuanHam: string;
  } | null;
  donViChaRef?: Unit | null;
}

export interface CreateUnitDto {
  ma_don_vi: string;
  ten_don_vi?: string;
  cap_do?: number;
  don_vi_cha?: number;
  chu_nhiem_id?: number;
  quan_so?: number;
}

export type UpdateUnitDto = Partial<CreateUnitDto>;
