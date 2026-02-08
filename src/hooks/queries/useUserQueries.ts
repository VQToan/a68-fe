import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} from "@/services/user.service";
import type {
  UserListParams,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
} from "@/types/user.type";

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  list: (params: UserListParams) =>
    [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, "detail"] as const,
  detail: (sub: string) => [...USER_QUERY_KEYS.details(), sub] as const,
};

// List users query
export const useUsersQuery = (params: UserListParams = {}) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: 30000, // 30 seconds
  });
};

// Get user detail query
export const useUserDetailQuery = (sub: string | null) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(sub!),
    queryFn: () => getUserById(sub!),
    enabled: !!sub,
  });
};

// Update user role mutation
export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sub,
      data,
    }: {
      sub: string;
      data: UserRoleUpdateRequest;
    }) => updateUserRole(sub, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Update user status mutation
export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sub,
      data,
    }: {
      sub: string;
      data: UserStatusUpdateRequest;
    }) => updateUserStatus(sub, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};
