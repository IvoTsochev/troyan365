import { useQuery } from "@tanstack/react-query";
import { getUserListings } from "../lib/supabase";

const useFetchUserListings = ({ userId }: { userId: string }) => {
  return useQuery({
    queryKey: ["userListings", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const data = await getUserListings(userId);
      return data;
    },
    enabled: !!userId,
  });
};

export default useFetchUserListings;
