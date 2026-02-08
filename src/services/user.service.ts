import apiClient from "./apiClient";
import type {
  UserListResponse,
  UserListParams,
  UserDetailResponse,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
} from "@/types/user.type";

const API_BASE_PATH = "/api/v1/users";

// List users with pagination (Admin only)
export const getUsers = async (
  params: UserListParams = {},
): Promise<UserListResponse> => {
  const response = await apiClient.get(API_BASE_PATH, { params });
  return response.data;
};

// Get user by sub (Admin only)
export const getUserById = async (sub: string): Promise<UserDetailResponse> => {
  const response = await apiClient.get(`${API_BASE_PATH}/${sub}`);
  return response.data;
};

// Update user role (Super admin only)
export const updateUserRole = async (
  sub: string,
  data: UserRoleUpdateRequest,
): Promise<UserDetailResponse> => {
  const response = await apiClient.patch(`${API_BASE_PATH}/${sub}/role`, data);
  return response.data;
};

// Update user status (Admin only)
export const updateUserStatus = async (
  sub: string,
  data: UserStatusUpdateRequest,
): Promise<UserDetailResponse> => {
  const response = await apiClient.patch(`${API_BASE_PATH}/${sub}/status`, data);
  return response.data;
};
