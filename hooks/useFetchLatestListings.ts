import { useQuery } from "@tanstack/react-query";
import { getLatestListings } from "../lib/supabase";

const useFetchLatestListings = () => {
  return useQuery({
    queryKey: ["latestListings"],
    queryFn: async () => {
      const data = await getLatestListings();
      return data;
    },
  });
};

export default useFetchLatestListings;
