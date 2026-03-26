import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetItems() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, order }: { text: string; order: bigint }) => {
      if (!actor) throw new Error("No actor");
      await actor.addItem(text, order);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useRemoveItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.removeItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useToggleItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useResetAllChecks() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.resetAllChecks();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useGetSchedule() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSchedule();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      departureTime,
      destinationLabel,
      isEnabled,
    }: {
      departureTime: string;
      destinationLabel: string;
      isEnabled: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.setSchedule(departureTime, destinationLabel, isEnabled);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}

export function useGetLockerStatus() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lockerStatus"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getLockerStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useUnlockLocker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.unlockLocker();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lockerStatus"] }),
  });
}

export function useLockLocker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.lockLocker();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lockerStatus"] }),
  });
}
