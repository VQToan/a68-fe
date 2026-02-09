import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  TextField,
  Collapse,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSubscriptionPackagesQuery,
  useForceUpdateSubscriptionMutation,
  USER_QUERY_KEYS,
} from "@/hooks/queries";
import type { SubscriptionPackage } from "@/types/user.type";
import { useNotification } from "@/context/NotificationContext";
import ConfirmDialog from "@/components/ConfirmDialog";

interface SubscriptionPackageManagerProps {
  userSub: string | null;
  userEmail: string;
  canManageSubscription: boolean;
}

const SubscriptionPackageManager: React.FC<SubscriptionPackageManagerProps> = ({
  userSub,
  userEmail,
  canManageSubscription,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const updateSubscriptionMutation = useForceUpdateSubscriptionMutation();

  const [showPackageChange, setShowPackageChange] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [confirmPackageChange, setConfirmPackageChange] = useState(false);

  const { data: packages, isLoading: packagesLoading } =
    useSubscriptionPackagesQuery(billingCycle);

  // Reset form when collapsed
  useEffect(() => {
    if (!showPackageChange) {
      setSelectedPackage(null);
      setStartDate("");
      setEndDate("");
    }
  }, [showPackageChange]);

  useEffect(() => {
    if (!selectedPackage) {
      return;
    }
    // if monthly, set end date to 1 month after start date
    setStartDate(new Date().toISOString().split("T")[0]);
    // if yearly, set end date to 1 year after start date
    const endDateCalc = new Date(startDate);
    if (billingCycle === "monthly") {
      endDateCalc.setMonth(endDateCalc.getMonth() + 1);
    } else {
      endDateCalc.setFullYear(endDateCalc.getFullYear() + 1);
    }
    setEndDate(endDateCalc.toISOString().split("T")[0]);
  }, [selectedPackage]);

  const handlePackageSelect = useCallback((pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
  }, []);

  const handleConfirmPackageChange = useCallback(() => {
    if (!selectedPackage || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      showNotification("End date must be after start date", "error");
      return;
    }

    setConfirmPackageChange(true);
  }, [selectedPackage, startDate, endDate, showNotification]);

  const handleSubmitPackageChange = useCallback(async () => {
    if (!userSub || !selectedPackage || !startDate || !endDate) return;

    try {
      await updateSubscriptionMutation.mutateAsync({
        userId: userSub,
        data: {
          package_id: selectedPackage._id,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
        },
      });

      // Invalidate user detail query to refresh data
      await queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.detail(userSub),
      });

      showNotification(
        t(
          "userManagement.notifications.packageUpdateSuccess",
          "Subscription package updated successfully",
        ),
        "success",
      );
      setConfirmPackageChange(false);
      setShowPackageChange(false);
      setSelectedPackage(null);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      showNotification(
        t(
          "userManagement.notifications.packageUpdateFailed",
          "Failed to update subscription package",
        ),
        "error",
      );
      console.error(error);
    }
  }, [
    userSub,
    selectedPackage,
    startDate,
    endDate,
    updateSubscriptionMutation,
    queryClient,
    showNotification,
    t,
  ]);

  if (!canManageSubscription) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        {t(
          "userManagement.detail.onlyAdminPackage",
          "Only admins can change subscription packages",
        )}
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setShowPackageChange(!showPackageChange)}
          sx={{ mb: 2 }}
        >
          {t("userManagement.detail.changePackageButton", "Change Package")}
        </Button>

        <Collapse in={showPackageChange}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t(
                "userManagement.detail.sections.changePackage",
                "Change Subscription Package",
              )}
            </Typography>

            <Tabs
              value={billingCycle}
              onChange={(_, value) => {
                setBillingCycle(value);
                setSelectedPackage(null);
              }}
              sx={{ mb: 2 }}
            >
              <Tab
                label={t(
                  "userManagement.detail.billingCycles.monthly",
                  "Monthly",
                )}
                value="monthly"
              />
              <Tab
                label={t(
                  "userManagement.detail.billingCycles.yearly",
                  "Yearly",
                )}
                value="yearly"
              />
            </Tabs>

            {packagesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : packages && packages.length > 0 ? (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {packages.map((pkg) => (
                  <Grid key={pkg._id} size={{ xs: 12, md: 6 }}>
                    <Card
                      variant={
                        selectedPackage?._id === pkg._id
                          ? "elevation"
                          : "outlined"
                      }
                      sx={{
                        cursor: "pointer",
                        border: selectedPackage?._id === pkg._id ? 2 : 1,
                        borderColor:
                          selectedPackage?._id === pkg._id
                            ? "primary.main"
                            : "divider",
                      }}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {pkg.name}
                        </Typography>
                        <Chip
                          label={`$${pkg.price} / ${pkg.billing_cycle}`}
                          color="primary"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {pkg.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {pkg.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                {t(
                  "userManagement.detail.noPackagesAvailable",
                  "No packages available",
                )}
              </Typography>
            )}

            {selectedPackage && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label={t(
                        "userManagement.detail.fields.startDate",
                        "Start date",
                      )}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label={t(
                        "userManagement.detail.fields.endDate",
                        "End date",
                      )}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleConfirmPackageChange}
                    disabled={!startDate || !endDate}
                  >
                    {t("common.confirm", "Confirm")}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      <ConfirmDialog
        open={confirmPackageChange}
        title={t(
          "userManagement.confirmChangePackage.title",
          "Change Subscription Package",
        )}
        message={t("userManagement.confirmChangePackage.message", {
          email: userEmail,
          packageName: selectedPackage?.name || "",
          billingCycle: t(
            `userManagement.detail.billingCycles.${billingCycle}`,
            billingCycle,
          ),
          defaultValue:
            "Are you sure you want to change {{email}}'s subscription to {{packageName}} ({{billingCycle}})? This will suspend their current subscription and create a new one.",
        })}
        loading={updateSubscriptionMutation.isPending}
        onConfirm={handleSubmitPackageChange}
        onCancel={() => setConfirmPackageChange(false)}
      />
    </>
  );
};

export default SubscriptionPackageManager;
