import AsyncStorage from "@react-native-async-storage/async-storage";

export const updateFavoritesInStorage = async (
  listingId: string,
  isFavorited: boolean
) => {
  try {
    const favorites = await AsyncStorage.getItem("myFavoritesStorage");
    const parsedFavorites = favorites ? JSON.parse(favorites) : [];

    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = parsedFavorites.filter(
        (fav: { listing_id: string }) => fav.listing_id !== listingId
      );
    } else {
      updatedFavorites = [...parsedFavorites, { listing_id: listingId }];
    }

    await AsyncStorage.setItem(
      "myFavoritesStorage",
      JSON.stringify(updatedFavorites)
    );

    return updatedFavorites;
  } catch (error) {
    console.error("Error updating favorites in storage:", error);
    throw error;
  }
};
