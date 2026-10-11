import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDashboardOraciones, getRosarioMisterios, getRosarioOraciones } from "@/data/dashboard";

interface IdleWindow extends Window {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
}

export function useDashboardPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    const prefetch = () => {
      void queryClient.prefetchQuery({
        queryKey: ["oraciones"],
        queryFn: getDashboardOraciones,
        staleTime: 5 * 60 * 1000,
      });
      void queryClient.prefetchQuery({
        queryKey: ["rosario-misterios"],
        queryFn: getRosarioMisterios,
        staleTime: 60 * 60 * 1000,
      });
      void queryClient.prefetchQuery({
        queryKey: ["rosario-oraciones"],
        queryFn: getRosarioOraciones,
        staleTime: 60 * 60 * 1000,
      });
    };

    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(prefetch, { timeout: 2500 })
      : window.setTimeout(prefetch, 800);

    return () => {
      if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [queryClient]);
}