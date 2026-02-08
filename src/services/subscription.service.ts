import apiClient from "./apiClient";
import type {
  SubscriptionPackage,
  ForceUpdateSubscriptionRequest,
} from "@/types/user.type";

const API_BASE_PATH = "/api/v1";

// Get subscription packages
export const getSubscriptionPackages = async (
  billingCycle: "monthly" | "yearly" = "monthly",
): Promise<SubscriptionPackage[]> => {
  const response = await apiClient.get(
    `${API_BASE_PATH}/subscription-packages`,
    {
      params: { billing_cycle: billingCycle },
    },
  );
  return response.data;
};

// Force update user subscription (Super admin only)
export const forceUpdateUserSubscription = async (
  userId: string,
  data: ForceUpdateSubscriptionRequest,
): Promise<void> => {
  const response = await apiClient.patch(
    `${API_BASE_PATH}/users/${userId}/subscription`,
    data,
  );
  return response.data;
};
