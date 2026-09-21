//==================== AUTH TYPES ====================
export interface LoginRequest {
    maQuanHam: string
    password: string
}

export interface UserInfo {
    id: number;
    maQuanHam: string;
    username: string | null;
    hoTen: string | null;
    soDienThoai: string | null;
    email: string | null;
    isActive: boolean;
    role: {
        name: string;
        description?: string | null;
    };
    roleId?: number;
    donViDoiChuNhiem?: unknown[];
    lopHocChuNhiem?: unknown[];
    level: number; // Dùng để điều hướng
}

export interface LoginResponse {
    success: boolean
    data: {
        accessToken: string
        user: UserInfo
    }
}

//======================= Role Types ========================
