import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/user";
import { userKeys } from "@/constants/query-key";

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: getProfile,
  });
}
