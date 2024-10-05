import AsyncStorage from "@react-native-async-storage/async-storage";

export const getFavoriteIdsFromAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    const myFavoritesStorage = items.find(
      ([key]) => key === "myFavoritesStorage"
    );

    if (myFavoritesStorage?.length && myFavoritesStorage[1]) {
      return JSON.parse(myFavoritesStorage[1]);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error logging AsyncStorage:", error);
  }
};
