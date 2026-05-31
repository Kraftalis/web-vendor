import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  loginWithCredentials,
  loginWithGoogle,
  type LoginCredentials,
} from "@/services/auth";

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      loginWithCredentials(credentials),
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: loginWithGoogle,
  });
}
