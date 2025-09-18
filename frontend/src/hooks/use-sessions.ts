// hooks/use-sessions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { forceLogoutUser, getUsersWithSessions } from "../lib/api";


export const useUserSessions = () =>
  useQuery({
    queryKey: ["adminUsersSessions"],
    queryFn: getUsersWithSessions,
  });

export const useForceLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forceLogoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersSessions"] });
    },
  });
};
