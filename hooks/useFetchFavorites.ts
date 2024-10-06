import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getSpecificListing } from "../lib/supabase";

type favoriteIds = {
  listing_id: string;
};

const useFetchFavorites = ({
  myFavoriteIds,
  supabaseIds,
  storageIds,
}: {
  myFavoriteIds: favoriteIds[];
  supabaseIds: favoriteIds[];
  storageIds: favoriteIds[];
}) => {
  return useQuery({
    queryKey: ["favorites", myFavoriteIds, supabaseIds, storageIds],
    queryFn: async () => {
      let data;
      data = await Promise.all(
        myFavoriteIds.map(async (id) => {
          const listing = await getSpecificListing(id.listing_id);
          return listing;
        })
      );

      return data;
    },
    enabled: myFavoriteIds.length > 0,
    placeholderData: keepPreviousData,
  });
};

export default useFetchFavorites;
