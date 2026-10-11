import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeDashboardFtue, getDashboardProfile } from "@/data/dashboard";

const profileKey = ["dashboard-profile"] as const;

export function useDashboardProfile() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: profileKey, queryFn: getDashboardProfile });
  const profile = query.data ?? null;
  const legacyCompleted = profile
    ? localStorage.getItem(`ftue_completed_${profile.id}`) === "true"
    : false;

  const completion = useMutation({
    mutationFn: async () => {
      if (!profile) return;
      await completeDashboardFtue(profile.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  });

  useEffect(() => {
    if (profile && legacyCompleted && !profile.ftue_completed_at && !completion.isPending) {
      completion.mutate();
    }
  }, [profile, legacyCompleted, completion.isPending]);

  return {
    profile,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: query.refetch,
    ftueCompleted: Boolean(profile?.ftue_completed_at) || legacyCompleted,
    completeFtue: completion.mutate,
  };
}