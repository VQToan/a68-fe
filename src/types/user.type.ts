export type UserRole = "user" | "admin" | "super_admin";

export interface UserResponse {
  sub: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  given_name: string | null;
  family_name: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface UserDetailResponse extends UserResponse {
  current_package: string | null;
  subscription_end_date: string | null;
}

export interface UserListResponse {
  users: UserDetailResponse[];
  pagination_token: string | null;
  limit: number;
}

export interface UserListParams {
  pagination_token?: string | null;
  limit?: number;
  search?: string | null;
  search_attribute?: "email" | "given_name" | "family_name";
  role?: UserRole | null;
}

export interface UserRoleUpdateRequest {
  role: UserRole;
}

export interface UserStatusUpdateRequest {
  enabled: boolean;
}
