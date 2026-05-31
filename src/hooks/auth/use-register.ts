import { useMutation } from "@tanstack/react-query";
import { registerWithCredentials, type RegisterPayload } from "@/services/auth";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerWithCredentials(payload),
  });
}
